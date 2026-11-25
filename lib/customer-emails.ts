import { brl, esc, layout, oneLine, isEmailConfigured, sendEmail, type SendResult } from "./email";
import { loadNotificationSettings, siteUrl, sendOnce, type NotificationSettings } from "./notifications";
import { buildWhatsAppUrl } from "./whatsapp";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;
type Fetch = typeof fetch;

export type CustomerEmailKind = "paid" | "unpaid" | "shipped";
export const CUSTOMER_KINDS: CustomerEmailKind[] = ["paid", "unpaid", "shipped"];

const LOG_KIND: Record<CustomerEmailKind, string> = { paid: "customer_paid", unpaid: "customer_unpaid", shipped: "customer_shipped" };
const SETTING: Record<CustomerEmailKind, keyof NotificationSettings> = { paid: "customer_paid", unpaid: "customer_unpaid", shipped: "customer_shipped" };

export interface CustomerOrder {
  id: string;
  reference_code?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  total_in_cents: number;
  payment_method?: string | null;
  delivery_type?: string | null;
  items?: Array<{ product_name?: string; quantity?: number; unit_price_in_cents?: number }>;
}

const METHOD_LABEL: Record<string, string> = { pix: "Pix", credit_card: "Cartão de crédito" };
const firstName = (n?: string | null) => (n || "").trim().split(/\s+/)[0] || "";
const hello = (o: CustomerOrder) => (firstName(o.customer_name) ? `Olá, ${esc(firstName(o.customer_name))}!` : "Olá!");
const btn = (href: string, label: string) =>
  `<p style="margin:20px 0 0"><a href="${esc(href)}" style="background:#fbbf24;color:#111827;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:8px;display:inline-block">${esc(label)}</a></p>`;
const p = (html: string) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.5">${html}</p>`;

function itemsTable(o: CustomerOrder): string {
  const rows = (o.items || [])
    .map((i) => `<tr><td style="padding:6px 0">${esc(i.product_name)} × ${esc(i.quantity ?? 1)}</td><td align="right" style="padding:6px 0">${brl((i.unit_price_in_cents || 0) * (i.quantity || 1))}</td></tr>`)
    .join("");
  return `<table role="presentation" width="100%" style="border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;margin:12px 0;font-size:14px">${rows}<tr><td style="padding:8px 0"><b>Total</b></td><td align="right" style="padding:8px 0"><b>${brl(o.total_in_cents)}</b></td></tr></table>`;
}

const footer = () => `Dúvidas? Responda este e-mail ou fale com a gente no <a href="${esc(buildWhatsAppUrl("Olá! Preciso de ajuda com meu pedido."))}">WhatsApp</a>.<br>Óticas Ventara · ${esc(siteUrl().replace(/^https?:\/\//, ""))}`;

export function buildCustomerEmail(kind: CustomerEmailKind, order: CustomerOrder): { subject: string; html: string; text: string } {
  const ref = order.reference_code || order.id.slice(0, 8);
  const pickup = order.delivery_type === "store_pickup";
  const track = `${siteUrl()}/rastreio`;

  if (kind === "paid") {
    const method = METHOD_LABEL[order.payment_method || ""] || "";
    const html = layout(
      "Pagamento confirmado!",
      p(hello(order)) +
        p(`Recebemos o pagamento do seu pedido <b>${esc(ref)}</b>${method ? ` via ${esc(method)}` : ""}. Muito obrigado pela compra!`) +
        itemsTable(order) +
        p(pickup ? "Assim que seus óculos estiverem prontos, avisaremos você para a <b>retirada na loja</b>." : "Estamos preparando tudo. Quando o pedido for despachado, você recebe outro e-mail avisando.") +
        btn(track, "Acompanhar meu pedido"),
      footer()
    );
    return {
      subject: oneLine(`Pagamento confirmado — pedido ${ref}`),
      html,
      text: `Pagamento confirmado!\nPedido ${ref} — ${brl(order.total_in_cents)}.\nAcompanhe: ${track}`,
    };
  }

  if (kind === "unpaid") {
    const retry = siteUrl();
    const html = layout(
      "Seu pedido não foi concluído",
      p(hello(order)) +
        p(`O pedido <b>${esc(ref)}</b> não teve o pagamento confirmado dentro do prazo, então foi cancelado e os itens voltaram ao estoque.`) +
        itemsTable(order) +
        p("Ainda quer os produtos? É só refazer o pedido pelo site, ou chamar a gente no WhatsApp que ajudamos você a finalizar.") +
        btn(retry, "Voltar à loja") +
        p(`<span style="font-size:13px;color:#6b7280">Se você já pagou, não se preocupe: responda este e-mail com o comprovante e resolvemos.</span>`).replace("margin:0 0 12px", "margin:16px 0 0"),
      footer()
    );
    return {
      subject: oneLine(`Seu pedido ${ref} não foi concluído`),
      html,
      text: `O pedido ${ref} não teve o pagamento confirmado e foi cancelado.\nRefaça em ${retry} ou chame no WhatsApp. Se já pagou, responda com o comprovante.`,
    };
  }

  const title = pickup ? "Seu pedido está pronto para retirada!" : "Seu pedido foi despachado!";
  const html = layout(
    title,
    p(hello(order)) +
      p(pickup ? `O pedido <b>${esc(ref)}</b> já está na loja esperando por você. Leve um documento com foto para retirar.` : `O pedido <b>${esc(ref)}</b> está pronto e já saiu para entrega. Você pode acompanhar o andamento pelo link abaixo.`) +
      itemsTable(order) +
      btn(track, "Acompanhar meu pedido"),
    footer()
  );
  return {
    subject: oneLine(pickup ? `Pedido ${ref} pronto para retirada` : `Pedido ${ref} despachado`),
    html,
    text: `${title}\nPedido ${ref}.\nAcompanhe: ${track}`,
  };
}

const SAMPLE: CustomerOrder = {
  id: "00000000-0000-0000-0000-000000000000",
  reference_code: "VEN-EXEMPLO",
  customer_name: "Maria Souza",
  customer_email: "maria@example.com",
  total_in_cents: 45980,
  payment_method: "pix",
  delivery_type: "delivery",
  items: [
    { product_name: "Armação Ventara Classic", quantity: 1, unit_price_in_cents: 32990 },
    { product_name: "Estojo rígido", quantity: 1, unit_price_in_cents: 12990 },
  ],
};
export const sampleCustomerOrder = (over: Partial<CustomerOrder> = {}): CustomerOrder => ({ ...SAMPLE, ...over });

/** Envia (uma vez por pedido) o e-mail ao cliente, se o tipo estiver ligado. Nunca lança erro. */
export async function notifyCustomerOrder(db: Db, orderId: string, kind: CustomerEmailKind, fetchImpl?: Fetch) {
  try {
    const settings = await loadNotificationSettings(db);
    if (settings[SETTING[kind]] !== true) return;
    const { data: order } = await db
      .from("orders")
      .select("id, reference_code, customer_name, customer_email, total_in_cents, payment_method, delivery_type, items:order_items(product_name, quantity, unit_price_in_cents)")
      .eq("id", orderId)
      .maybeSingle();
    const to = String(order?.customer_email || "").trim();
    if (!order || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return;
    await sendOnce(db, LOG_KIND[kind], orderId, [to], () => buildCustomerEmail(kind, order), fetchImpl);
  } catch (e) {
    console.warn("[avisos] notifyCustomerOrder:", e instanceof Error ? e.message : e);
  }
}

export async function sendCustomerTest(to: string, kind: CustomerEmailKind, fetchImpl?: Fetch): Promise<SendResult> {
  if (!isEmailConfigured()) return { ok: false, skipped: true, error: "RESEND_API_KEY não configurada" };
  const m = buildCustomerEmail(kind, sampleCustomerOrder({ delivery_type: "delivery" }));
  return sendEmail({ to, ...m, subject: `[TESTE] ${m.subject}` }, { fetchImpl });
}
