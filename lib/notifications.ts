import { brl, esc, layout, oneLine, parseEmails, sendEmail, isEmailConfigured, type SendResult } from "./email";
import { DEFAULT_SITE_URL, cleanPhoneNumber } from "./whatsapp";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;
type Fetch = typeof fetch;

export interface NotificationSettings {
  owner_emails: string;
  notify_paid: boolean;
  notify_new_order: boolean;
  recovery_enabled: boolean;
  recovery_delay_hours: number;
  recovery_coupon_code: string;
  customer_paid: boolean;
  customer_unpaid: boolean;
  customer_shipped: boolean;
}

export function normalizeSettings(row: Record<string, unknown> | null | undefined): NotificationSettings {
  const r = row || {};
  const hours = Number(r.recovery_delay_hours);
  return {
    owner_emails: typeof r.owner_emails === "string" ? r.owner_emails : "",
    notify_paid: r.notify_paid === undefined ? true : r.notify_paid === true,
    notify_new_order: r.notify_new_order === true,
    recovery_enabled: r.recovery_enabled === true,
    recovery_delay_hours: Number.isFinite(hours) && hours >= 1 && hours <= 72 ? Math.round(hours) : 2,
    recovery_coupon_code: typeof r.recovery_coupon_code === "string" ? r.recovery_coupon_code.trim().toUpperCase() : "",
    customer_paid: r.customer_paid === true,
    customer_unpaid: r.customer_unpaid === true,
    customer_shipped: r.customer_shipped === true,
  };
}

export async function loadNotificationSettings(db: Db): Promise<NotificationSettings> {
  try {
    const { data } = await db.from("notification_settings").select("*").eq("id", "main").maybeSingle();
    return normalizeSettings(data);
  } catch {
    return normalizeSettings(null);
  }
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");

async function logEmail(db: Db, row: { kind: string; ref: string | null; to_email: string; status: "sent" | "failed" | "skipped"; error?: string | null }) {
  try {
    await db.from("email_log").insert({ ...row, error: row.error || null });
  } catch {
    /* log é melhor esforço */
  }
}

/** Já existe envio com sucesso deste aviso para este destinatário? */
async function alreadySent(db: Db, kind: string, ref: string, to: string): Promise<boolean> {
  try {
    const { data } = await db.from("email_log").select("id").eq("kind", kind).eq("ref", ref).eq("to_email", to).eq("status", "sent").limit(1);
    return !!(data && data.length);
  } catch {
    return false;
  }
}

/** Envia (uma vez) para cada destinatário, registrando o resultado. Nunca lança erro. */
export async function sendOnce(
  db: Db,
  kind: string,
  ref: string,
  recipients: string[],
  build: () => { subject: string; html: string; text: string },
  fetchImpl?: Fetch
): Promise<{ sent: number; failed: number; skipped: number }> {
  const out = { sent: 0, failed: 0, skipped: 0 };
  if (!recipients.length) return out;
  if (!isEmailConfigured()) {
    for (const to of recipients) await logEmail(db, { kind, ref, to_email: to, status: "skipped", error: "E-mail não configurado (falta RESEND_API_KEY)" });
    out.skipped = recipients.length;
    return out;
  }
  const msg = build();
  for (const to of recipients) {
    if (await alreadySent(db, kind, ref, to)) {
      out.skipped++;
      continue;
    }
    const r: SendResult = await sendEmail({ to, ...msg }, { fetchImpl });
    await logEmail(db, { kind, ref, to_email: to, status: r.ok ? "sent" : "failed", error: r.error });
    if (r.ok) out.sent++;
    else out.failed++;
  }
  return out;
}

// ---------------------------------------------------------------- venda
interface OrderForEmail {
  id: string;
  reference_code?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  total_in_cents: number;
  payment_method?: string | null;
  delivery_type?: string | null;
}

const METHOD_LABEL: Record<string, string> = { pix: "Pix", credit_card: "Cartão de crédito", whatsapp_assisted: "WhatsApp" };

export function buildSaleEmail(order: OrderForEmail, items: Array<{ product_name?: string; quantity?: number; unit_price_in_cents?: number }>, kind: "paid" | "new") {
  const ref = order.reference_code || order.id.slice(0, 8);
  const method = METHOD_LABEL[order.payment_method || ""] || order.payment_method || "—";
  const delivery = order.delivery_type === "store_pickup" ? "Retirada na loja" : "Entrega";
  const rows = items
    .map((i) => `<tr><td style="padding:6px 0">${esc(i.product_name)} × ${esc(i.quantity ?? 1)}</td><td align="right" style="padding:6px 0">${brl((i.unit_price_in_cents || 0) * (i.quantity || 1))}</td></tr>`)
    .join("");
  const phone = order.customer_phone ? cleanPhoneNumber(order.customer_phone) : "";
  const title = kind === "paid" ? "Venda confirmada! 🎉" : "Novo pedido aguardando pagamento";
  const html = layout(
    title,
    `<p style="margin:0 0 12px;font-size:15px">Pedido <b>${esc(ref)}</b> — <b style="font-size:18px">${brl(order.total_in_cents)}</b></p>
<table role="presentation" width="100%" style="border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;margin:12px 0;font-size:14px">${rows}</table>
<p style="margin:4px 0;font-size:14px"><b>Cliente:</b> ${esc(order.customer_name)}</p>
<p style="margin:4px 0;font-size:14px"><b>Contato:</b> ${esc(order.customer_phone)}${phone ? ` — <a href="https://wa.me/${esc(phone)}">chamar no WhatsApp</a>` : ""}<br>${esc(order.customer_email)}</p>
<p style="margin:4px 0;font-size:14px"><b>Pagamento:</b> ${esc(method)} &nbsp; <b>Entrega:</b> ${esc(delivery)}</p>
<p style="margin:20px 0 0"><a href="${siteUrl()}/admin/pedidos" style="background:#fbbf24;color:#111827;text-decoration:none;font-weight:bold;padding:10px 18px;border-radius:8px;display:inline-block">Abrir pedidos no painel</a></p>`,
    "Você recebe este aviso porque seu e-mail está cadastrado em Admin › Recuperação & Avisos."
  );
  const subject = kind === "paid" ? `Venda confirmada ${ref} — ${brl(order.total_in_cents)}` : `Novo pedido ${ref} — ${brl(order.total_in_cents)}`;
  const text = `${title}\nPedido ${ref} — ${brl(order.total_in_cents)}\nCliente: ${order.customer_name} (${order.customer_phone})\nPagamento: ${method}\n${siteUrl()}/admin/pedidos`;
  return { subject: oneLine(subject), html, text };
}

export async function notifyOwnerOrder(db: Db, orderId: string, kind: "paid" | "new", fetchImpl?: Fetch) {
  try {
    const settings = await loadNotificationSettings(db);
    if (kind === "paid" ? !settings.notify_paid : !settings.notify_new_order) return;
    const recipients = parseEmails(settings.owner_emails);
    if (!recipients.length) return;
    const { data: order } = await db
      .from("orders")
      .select("id, reference_code, customer_name, customer_email, customer_phone, total_in_cents, payment_method, delivery_type, items:order_items(product_name, quantity, unit_price_in_cents)")
      .eq("id", orderId)
      .maybeSingle();
    if (!order) return;
    await sendOnce(db, kind === "paid" ? "sale_paid" : "new_order", orderId, recipients, () => buildSaleEmail(order, order.items || [], kind), fetchImpl);
  } catch (e) {
    console.warn("[avisos] notifyOwnerOrder:", e instanceof Error ? e.message : e);
  }
}

// ---------------------------------------------------------------- recuperação
export interface CartRow {
  id: string;
  token: string;
  name?: string | null;
  email?: string | null;
  items: Array<{ name?: string; quantity?: number; priceInCents?: number; imageUrl?: string }>;
  subtotal_cents: number;
}

export const resumeLink = (token: string) => `${siteUrl()}/?retomar=${encodeURIComponent(token)}`;
export const unsubscribeLink = (token: string) => `${siteUrl()}/api/cart-recovery/unsubscribe?token=${encodeURIComponent(token)}`;

export function buildRecoveryEmail(cart: CartRow, couponCode?: string) {
  const first = (cart.name || "").trim().split(/\s+/)[0];
  const rows = (cart.items || [])
    .slice(0, 6)
    .map((i) => `<tr><td style="padding:6px 0">${esc(i.name)}${(i.quantity || 1) > 1 ? ` × ${esc(i.quantity)}` : ""}</td><td align="right">${brl((i.priceInCents || 0) * (i.quantity || 1))}</td></tr>`)
    .join("");
  const coupon = couponCode
    ? `<p style="background:#fffbeb;border:1px dashed #f59e0b;border-radius:8px;padding:10px 14px;font-size:14px">Use o cupom <b>${esc(couponCode)}</b> no carrinho para ganhar um desconto.</p>`
    : "";
  const html = layout(
    `${first ? `${esc(first)}, seus` : "Seus"} óculos ainda estão te esperando`,
    `<p style="font-size:15px;line-height:1.5">Você deixou estes itens no carrinho. Guardamos tudo para você finalizar quando quiser.</p>
<table role="presentation" width="100%" style="border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;margin:12px 0;font-size:14px">${rows}</table>
${coupon}
<p style="margin:20px 0"><a href="${resumeLink(cart.token)}" style="background:#fbbf24;color:#111827;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px;display:inline-block">Voltar para o meu carrinho</a></p>
<p style="font-size:13px;color:#6b7280">Dúvidas? Responda este e-mail ou chame a gente no WhatsApp.</p>`,
    `Você recebeu este e-mail porque deixou itens no carrinho em oticasventara.com.br. <a href="${unsubscribeLink(cart.token)}">Não quero mais receber lembretes</a>.`
  );
  const text = `${first ? `${first}, seus` : "Seus"} óculos ainda estão te esperando.\nVolte ao carrinho: ${resumeLink(cart.token)}\n${couponCode ? `Cupom: ${couponCode}\n` : ""}Não quero lembretes: ${unsubscribeLink(cart.token)}`;
  return { subject: "Seus óculos ainda estão no carrinho 👓", html, text };
}

export async function sendRecoveryEmail(db: Db, cart: CartRow, couponCode?: string, fetchImpl?: Fetch): Promise<"sent" | "failed" | "skipped"> {
  if (!cart.email) return "skipped";
  const r = await sendOnce(db, "recovery", `${cart.id}:${(cart as { recovery_email_count?: number }).recovery_email_count ?? 0}`, [cart.email.toLowerCase()], () => buildRecoveryEmail(cart, couponCode), fetchImpl);
  return r.sent ? "sent" : r.failed ? "failed" : "skipped";
}

export async function sendTestEmail(db: Db, to: string, fetchImpl?: Fetch): Promise<SendResult> {
  if (!isEmailConfigured()) return { ok: false, skipped: true, error: "RESEND_API_KEY não configurada na Vercel." };
  const r = await sendEmail(
    { to, subject: "Teste de aviso — Óticas Ventara", html: layout("Tudo certo! ✅", `<p style="font-size:15px">Este é um e-mail de teste. Os avisos de venda chegarão neste endereço.</p>`), text: "Teste de aviso — tudo certo." },
    { fetchImpl }
  );
  await logEmail(db, { kind: "test", ref: null, to_email: to, status: r.ok ? "sent" : "failed", error: r.error });
  return r;
}
