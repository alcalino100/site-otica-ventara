// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

/** Identifica o cliente do mesmo jeito em toda parte (e-mail, telefone e CPF só com dígitos). */
export function normalizeCustomer(input: { email?: string | null; phone?: string | null; document?: string | null }) {
  const email = (input.email || "").trim().toLowerCase();
  let phone = (input.phone || "").replace(/\D/g, "");
  if (phone.length > 11 && phone.startsWith("55")) phone = phone.slice(2);
  const document = (input.document || "").replace(/\D/g, "");
  return { email, phone: phone.length >= 8 ? phone : "", document: document.length === 11 || document.length === 14 ? document : "" };
}

export type CouponApplyResult =
  | { found: false }
  | { found: true; ok: false; reason: string; message: string }
  | { found: true; ok: true; code: string; couponId: string; discountType: string; discountValue: number; discountInCents: number; maxDiscountCents: number | null; minOrderCents: number };

/** Simula (dryRun) ou aplica um cupom criado no admin. Toda a regra mora na função SQL coupon_apply. */
export async function applyAdminCoupon(
  db: Db,
  p: {
    code: string;
    subtotalCents: number;
    email?: string | null;
    phone?: string | null;
    document?: string | null;
    orderId?: string | null;
    reference?: string | null;
    dryRun?: boolean;
  }
): Promise<CouponApplyResult> {
  const c = normalizeCustomer(p);
  const { data, error } = await db.rpc("coupon_apply", {
    p_code: p.code,
    p_subtotal_cents: Math.max(0, Math.round(p.subtotalCents)),
    p_email: c.email || null,
    p_phone: c.phone || null,
    p_document: c.document || null,
    p_order_id: p.orderId || null,
    p_reference: p.reference || null,
    p_dry_run: p.dryRun === true,
  });
  if (error) {
    // Função/tabela ainda não criada: trata como "não é cupom do admin" (segue para os outros tipos)
    console.warn("[cupons] coupon_apply indisponível:", error.message);
    return { found: false };
  }
  if (!data?.found) return { found: false };
  if (!data.ok) return { found: true, ok: false, reason: String(data.reason || "invalid"), message: String(data.message || "Cupom inválido.") };
  return {
    found: true,
    ok: true,
    code: String(data.code),
    couponId: String(data.coupon_id),
    discountType: String(data.discount_type),
    discountValue: Number(data.discount_value),
    discountInCents: Number(data.discount_in_cents),
    maxDiscountCents: data.max_discount_cents == null ? null : Number(data.max_discount_cents),
    minOrderCents: Number(data.min_order_cents || 0),
  };
}

/** Devolve o uso do cupom do admin (pedido cancelado, expirado ou excluído). */
export async function releaseAdminCouponForOrder(db: Db, orderId: string): Promise<void> {
  try {
    await db
      .from("coupon_redemptions")
      .update({ status: "released", updated_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .in("status", ["reserved", "confirmed"]);
  } catch {
    /* melhor esforço */
  }
}

/** Marca o uso como confirmado quando o pagamento é aprovado. */
export async function confirmAdminCouponForOrder(db: Db, orderId: string): Promise<void> {
  try {
    await db
      .from("coupon_redemptions")
      .update({ status: "confirmed", updated_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .in("status", ["reserved", "released"]);
  } catch {
    /* melhor esforço */
  }
}

// ---------- validação do cadastro (admin) ----------
export const COUPON_CODE_RE = /^[A-Z0-9-]{4,24}$/;

export interface CouponInput {
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_discount_cents?: number | null;
  min_order_cents?: number;
  starts_at?: string | null;
  expires_at?: string | null;
  max_uses_total?: number | null;
  max_uses_per_customer?: number;
  active?: boolean;
}

/** Travas de segurança: todo cupom novo precisa de validade OU limite total de usos. */
export function validateCouponInput(i: CouponInput, opts: { requireLimit: boolean }): string | null {
  if (!COUPON_CODE_RE.test(i.code)) return "O código deve ter de 4 a 24 caracteres, só letras, números e hífen.";
  if (i.discount_type !== "percentage" && i.discount_type !== "fixed") return "Tipo de desconto inválido.";
  if (!Number.isFinite(i.discount_value) || i.discount_value <= 0) return "Informe um valor de desconto maior que zero.";
  if (i.discount_type === "percentage" && i.discount_value > 100) return "O desconto em porcentagem não pode passar de 100%.";
  if (i.discount_type === "fixed" && i.discount_value > 100000) return "Valor de desconto muito alto.";
  const perCustomer = i.max_uses_per_customer ?? 1;
  if (!Number.isInteger(perCustomer) || perCustomer < 1 || perCustomer > 100) return "Usos por cliente deve ser de 1 a 100.";
  if (i.max_uses_total != null && (!Number.isInteger(i.max_uses_total) || i.max_uses_total < 1)) return "Limite total de usos inválido.";
  if (i.min_order_cents != null && (!Number.isInteger(i.min_order_cents) || i.min_order_cents < 0)) return "Pedido mínimo inválido.";
  if (i.max_discount_cents != null && (!Number.isInteger(i.max_discount_cents) || i.max_discount_cents < 1)) return "Teto de desconto inválido.";
  const s = i.starts_at ? Date.parse(i.starts_at) : null;
  const e = i.expires_at ? Date.parse(i.expires_at) : null;
  if ((i.starts_at && Number.isNaN(s)) || (i.expires_at && Number.isNaN(e))) return "Data inválida.";
  if (s && e && e <= s) return "A data de fim precisa ser depois da data de início.";
  if (opts.requireLimit && !i.expires_at && i.max_uses_total == null) {
    return "Defina uma validade ou um limite total de usos. Cupom sem nenhum limite não é permitido.";
  }
  return null;
}

/** Gera um código fácil de ler (sem 0/O/1/I). */
export function generateCouponCode(prefix = "VENTARA"): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `${prefix}-${s}`;
}

export type CouponStatus = "paused" | "scheduled" | "expired" | "exhausted" | "active";

export function couponStatus(c: { active: boolean; starts_at: string | null; expires_at: string | null; max_uses_total: number | null }, used: number, now = Date.now()): CouponStatus {
  if (!c.active) return "paused";
  if (c.starts_at && Date.parse(c.starts_at) > now) return "scheduled";
  if (c.expires_at && Date.parse(c.expires_at) < now) return "expired";
  if (c.max_uses_total != null && used >= c.max_uses_total) return "exhausted";
  return "active";
}
