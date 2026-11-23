import { normalizeCustomer } from "./coupons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

export const ABANDON_AFTER_MINUTES = 60; // carrinho parado há mais que isso entra na lista de abandonados
export const SESSION_RE = /^[A-Za-z0-9_-]{16,64}$/;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

export interface CaptureItem {
  id: string;
  productId?: string;
  variantId?: string;
  name: string;
  slug: string;
  category?: string;
  color?: string;
  colorHex?: string;
  priceInCents: number;
  quantity: number;
  imageUrl?: string;
  sku?: string;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Aceita só o que precisamos do carrinho; descarta o resto (a entrada vem do navegador, não é confiável). */
export function sanitizeItems(raw: unknown): CaptureItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CaptureItem[] = [];
  for (const it of raw.slice(0, 20)) {
    if (!it || typeof it !== "object") continue;
    const r = it as Record<string, unknown>;
    const price = Number(r.priceInCents);
    const qty = Number(r.quantity ?? 1);
    const name = str(r.name, 120);
    if (!name || !Number.isFinite(price) || price < 0 || price > 100_000_00) continue;
    const img = str(r.imageUrl, 400);
    out.push({
      id: str(r.id, 120),
      productId: str(r.productId, 80) || undefined,
      variantId: str(r.variantId, 80) || undefined,
      name,
      slug: str(r.slug, 120),
      category: str(r.category, 60) || undefined,
      color: str(r.color, 60) || undefined,
      colorHex: /^#[0-9a-fA-F]{3,8}$/.test(str(r.colorHex, 9)) ? str(r.colorHex, 9) : undefined,
      priceInCents: Math.round(price),
      quantity: Number.isFinite(qty) ? Math.max(1, Math.min(99, Math.round(qty))) : 1,
      imageUrl: /^https?:\/\//.test(img) || img.startsWith("/") ? img : undefined,
      sku: str(r.sku, 60) || undefined,
    });
  }
  return out.filter((i) => i.id);
}

export interface CaptureInput {
  session_id: string;
  name: string;
  email: string;
  phone: string;
  items: CaptureItem[];
  source_url: string;
}

/** Valida o corpo do POST de captura. Retorna null se não há contato válido ou carrinho vazio. */
export function parseCapture(body: Record<string, unknown>): CaptureInput | null {
  const session = str(body.session_id, 64);
  if (!SESSION_RE.test(session)) return null;
  const items = sanitizeItems(body.items);
  if (!items.length) return null;
  const email = str(body.email, 254).toLowerCase();
  const phone = normalizeCustomer({ phone: str(body.phone, 30) }).phone;
  const validEmail = EMAIL_RE.test(email) ? email : "";
  if (!validEmail && !phone) return null;
  return { session_id: session, name: str(body.name, 100), email: validEmail, phone, items, source_url: str(body.url, 300) };
}

/** Descadastra: apaga dados pessoais dos carrinhos desta pessoa e guarda e-mail/telefone na lista de supressão. */
export async function suppressContact(db: Db, contact: { email?: string | null; phone?: string | null }) {
  const wipe = { status: "unsubscribed", name: null, email: null, phone: null, items: [], item_count: 0, subtotal_cents: 0 };
  const rows: { kind: string; value: string }[] = [];
  if (contact.email) rows.push({ kind: "email", value: contact.email.toLowerCase() });
  if (contact.phone) rows.push({ kind: "phone", value: contact.phone });
  if (rows.length) await db.from("cart_suppressions").upsert(rows, { onConflict: "kind,value", ignoreDuplicates: true });
  if (contact.email) await db.from("abandoned_carts").update(wipe).eq("email", contact.email.toLowerCase());
  if (contact.phone) await db.from("abandoned_carts").update(wipe).eq("phone", contact.phone);
}

async function isSuppressed(db: Db, email: string, phone: string): Promise<boolean> {
  if (email) {
    const { data } = await db.from("cart_suppressions").select("value").eq("kind", "email").eq("value", email).limit(1);
    if (data && data.length) return true;
  }
  if (phone) {
    const { data } = await db.from("cart_suppressions").select("value").eq("kind", "phone").eq("value", phone).limit(1);
    if (data && data.length) return true;
  }
  return false;
}

export async function upsertCart(db: Db, c: CaptureInput): Promise<{ ok: boolean; ignored?: boolean }> {
  if (await isSuppressed(db, c.email, c.phone)) return { ok: true, ignored: true };
  const { data: existing } = await db.from("abandoned_carts").select("id, status, recovered_at").eq("session_id", c.session_id).maybeSingle();
  if (existing?.status === "unsubscribed") return { ok: true, ignored: true }; // respeita quem pediu para sair

  const subtotal = c.items.reduce((n, i) => n + i.priceInCents * i.quantity, 0);
  const row: Record<string, unknown> = {
    session_id: c.session_id,
    name: c.name || null,
    email: c.email || null,
    phone: c.phone || null,
    items: c.items,
    item_count: c.items.reduce((n, i) => n + i.quantity, 0),
    subtotal_cents: subtotal,
    consent_marketing: true,
    source_url: c.source_url || null,
    last_activity_at: new Date().toISOString(),
  };
  // Cliente que já comprou e voltou a montar carrinho: começa um novo ciclo
  if (existing?.recovered_at) {
    Object.assign(row, { recovered_at: null, recovered_value_cents: null, order_id: null, status: "open", recovery_email_sent_at: null, recovery_email_count: 0, contacted_at: null });
  }
  const { error } = await db.from("abandoned_carts").upsert(row, { onConflict: "session_id" });
  return { ok: !error };
}

export async function linkCartToOrder(db: Db, sessionId: string | undefined, orderId: string) {
  if (!sessionId || !SESSION_RE.test(sessionId)) return;
  try {
    await db.from("abandoned_carts").update({ order_id: orderId, last_activity_at: new Date().toISOString() }).eq("session_id", sessionId).is("recovered_at", null);
  } catch {
    /* melhor esforço */
  }
}

/** Pedido pago: o carrinho do mesmo pedido, e-mail ou telefone conta como recuperado. */
export async function markCartsRecovered(db: Db, order: { id: string; customer_email?: string | null; customer_phone?: string | null; total_in_cents: number }) {
  try {
    const patch = { recovered_at: new Date().toISOString(), recovered_value_cents: order.total_in_cents };
    await db.from("abandoned_carts").update(patch).eq("order_id", order.id).is("recovered_at", null);
    const c = normalizeCustomer({ email: order.customer_email, phone: order.customer_phone });
    if (c.email) await db.from("abandoned_carts").update(patch).eq("email", c.email).is("recovered_at", null);
    if (c.phone) await db.from("abandoned_carts").update(patch).eq("phone", c.phone).is("recovered_at", null);
  } catch {
    /* melhor esforço */
  }
}

export type CartState = "active" | "abandoned" | "recovered" | "unsubscribed";
export function cartState(c: { status: string; recovered_at: string | null; last_activity_at: string }, now = Date.now()): CartState {
  if (c.recovered_at) return "recovered";
  if (c.status === "unsubscribed") return "unsubscribed";
  return now - Date.parse(c.last_activity_at) >= ABANDON_AFTER_MINUTES * 60000 ? "abandoned" : "active";
}

export const csvCell = (v: unknown) => {
  let s = String(v ?? "");
  // Evita "injeção de fórmula" ao abrir o CSV no Excel/Sheets
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};
