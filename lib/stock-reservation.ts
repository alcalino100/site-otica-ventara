import { releaseAdminCouponForOrder } from "@/lib/coupons";
import type { createAdminClient } from "@/lib/supabase/admin";

type Client = ReturnType<typeof createAdminClient>;

/**
 * Reserva de estoque por pedido.
 * O livro-razão é a própria tabela `inventory_movements` (sem coluna nova):
 *  - "Reserva do pedido REF"  → movimento 'out'
 *  - "Estorno do pedido REF"  → movimento 'in'  (só existe se houve reserva e ainda não foi estornada)
 * Assim reservar/estornar é idempotente: repetir a chamada não duplica nem infla o estoque.
 */
const reserveReason = (ref: string) => `Reserva do pedido ${ref}`;
const releaseReason = (ref: string) => `Estorno do pedido ${ref}`;

/** Prazo para pedidos sem pagamento liberarem o estoque (Pix expira em 30 min no MP). */
export const PIX_RESERVATION_MINUTES = 40;
export const CARD_RESERVATION_MINUTES = 180;

export interface ReserveResult {
  ok: boolean;
  /** Nome/cor do item sem estoque, quando ok = false */
  missing?: string;
}

/** Baixa o estoque do pedido de forma segura contra compras simultâneas (update condicional). */
export async function reserveStockForOrder(
  client: Client,
  order: { id: string; reference_code: string }
): Promise<ReserveResult> {
  const ref = order.reference_code;

  // Já reservado (ex.: webhook repetido): nada a fazer
  const { data: existing } = await client
    .from("inventory_movements")
    .select("id")
    .eq("reason", reserveReason(ref))
    .limit(1);
  const { data: released } = await client
    .from("inventory_movements")
    .select("id")
    .eq("reason", releaseReason(ref))
    .limit(1);
  if (existing && existing.length > 0 && !(released && released.length > 0)) return { ok: true };

  const { data: items } = await client
    .from("order_items")
    .select("variant_id, product_id, quantity, product_name, color_name")
    .eq("order_id", order.id);

  const done: { variant_id: string; product_id: string; qty: number }[] = [];
  const rollback = async () => {
    for (const d of done) {
      const { data: v } = await client.from("product_variants").select("stock_quantity").eq("id", d.variant_id).single();
      if (v) await client.from("product_variants").update({ stock_quantity: v.stock_quantity + d.qty }).eq("id", d.variant_id);
      await client
        .from("inventory_movements")
        .delete()
        .eq("variant_id", d.variant_id)
        .eq("reason", reserveReason(ref));
    }
  };

  for (const item of items || []) {
    if (!item.variant_id) continue;
    const qty = Number(item.quantity) || 1;
    let reserved = false;

    for (let attempt = 0; attempt < 4 && !reserved; attempt++) {
      const { data: v } = await client
        .from("product_variants")
        .select("stock_quantity, product_id")
        .eq("id", item.variant_id)
        .single();
      if (!v || typeof v.stock_quantity !== "number") {
        reserved = true; // variante sem controle de estoque
        break;
      }
      if (v.stock_quantity < qty) {
        await rollback();
        return { ok: false, missing: `${item.product_name} (${item.color_name})` };
      }
      const newBalance = v.stock_quantity - qty;
      // Só grava se o saldo ainda for o que lemos (evita duas compras levarem a mesma peça)
      const { data: updated } = await client
        .from("product_variants")
        .update({ stock_quantity: newBalance, updated_at: new Date().toISOString() })
        .eq("id", item.variant_id)
        .eq("stock_quantity", v.stock_quantity)
        .select("id");
      if (updated && updated.length > 0) {
        await client.from("inventory_movements").insert({
          product_id: v.product_id || item.product_id,
          variant_id: item.variant_id,
          movement_type: "out",
          quantity: qty,
          balance_after: newBalance,
          reason: reserveReason(ref),
        });
        done.push({ variant_id: item.variant_id, product_id: v.product_id || item.product_id, qty });
        reserved = true;
      }
    }

    if (!reserved) {
      await rollback();
      return { ok: false, missing: `${item.product_name} (${item.color_name})` };
    }
  }
  return { ok: true };
}

/** Devolve ao estoque o que foi reservado para o pedido. Seguro para chamar várias vezes. */
export async function releaseStockForOrder(client: Client, referenceCode: string): Promise<number> {
  const { data: reserved } = await client
    .from("inventory_movements")
    .select("variant_id, product_id, quantity")
    .eq("reason", reserveReason(referenceCode));
  if (!reserved || reserved.length === 0) return 0;

  const { data: already } = await client
    .from("inventory_movements")
    .select("id")
    .eq("reason", releaseReason(referenceCode))
    .limit(1);
  if (already && already.length > 0) return 0;

  let restored = 0;
  for (const m of reserved) {
    const { data: v } = await client.from("product_variants").select("stock_quantity").eq("id", m.variant_id).single();
    if (!v || typeof v.stock_quantity !== "number") continue;
    const newBalance = v.stock_quantity + (Number(m.quantity) || 0);
    await client
      .from("product_variants")
      .update({ stock_quantity: newBalance, updated_at: new Date().toISOString() })
      .eq("id", m.variant_id);
    await client.from("inventory_movements").insert({
      product_id: m.product_id,
      variant_id: m.variant_id,
      movement_type: "in",
      quantity: Number(m.quantity) || 0,
      balance_after: newBalance,
      reason: releaseReason(referenceCode),
    });
    restored++;
  }
  return restored;
}

/** Devolve o cupom (usado no checkout) ao cliente, lendo o código das anotações do pedido. */
export async function restoreCouponFromNotes(client: Client, notes: string | null | undefined): Promise<void> {
  const code = notes?.match(/Cupom:\s*([A-Z0-9-]+)/i)?.[1]?.toUpperCase();
  if (!code) return;
  await client
    .from("promotion_coupons")
    .update({ status: "issued", used_at: null, used_by_operator: null })
    .eq("code", code)
    .eq("status", "used")
    .like("used_by_operator", "Pedido Online%");
}

/** Devolve o cupom do pedido, seja o único da roleta ou o criado no admin (uso reservado). */
export async function releaseCouponsForOrder(client: Client, order: { id: string; notes?: string | null }): Promise<void> {
  await restoreCouponFromNotes(client, order.notes);
  await releaseAdminCouponForOrder(client, order.id);
}

/**
 * Cancela pedidos que ficaram sem pagamento além do prazo: devolve estoque e cupom.
 * Chamada de forma oportunista a cada novo checkout (não precisa de cron).
 */
export async function expireStaleOrders(client: Client): Promise<number> {
  const now = Date.now();
  const pixCutoff = new Date(now - PIX_RESERVATION_MINUTES * 60_000).toISOString();
  const cardCutoff = new Date(now - CARD_RESERVATION_MINUTES * 60_000).toISOString();

  const { data: stale } = await client
    .from("orders")
    .select("id, reference_code, notes, payment_method, created_at")
    .in("status", ["pending", "awaiting_payment"])
    .in("payment_method", ["pix", "credit_card"])
    .lt("created_at", pixCutoff)
    .limit(50);

  let expired = 0;
  for (const o of stale || []) {
    if (o.payment_method === "credit_card" && o.created_at >= cardCutoff) continue;
    const { data: updated } = await client
      .from("orders")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", o.id)
      .in("status", ["pending", "awaiting_payment"])
      .select("id");
    if (!updated || updated.length === 0) continue; // pago no meio tempo
    await releaseStockForOrder(client, o.reference_code);
    await releaseCouponsForOrder(client, o);
    expired++;
  }
  return expired;
}
