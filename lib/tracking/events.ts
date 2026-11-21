/**
 * Catálogo único dos eventos de rastreamento (usado pelo site, pelo servidor e pelo painel admin).
 * Para criar um evento novo basta acrescentar uma linha aqui.
 */
export type TrackingEventKey =
  | "page_view"
  | "view_content"
  | "add_to_cart"
  | "initiate_checkout"
  | "add_payment_info"
  | "purchase"
  | "lead"
  | "contact";

export interface TrackingEventDef {
  key: TrackingEventKey;
  /** Nome mostrado no painel */
  label: string;
  /** Quando dispara (texto para o lojista) */
  description: string;
  /** Nome padrão no Meta (Pixel e API de Conversões) */
  meta: string;
  /** Nome do evento no Google (gtag/GA4) */
  google: string;
  /** Aceita rótulo de conversão do Google Ads (AW-…/rótulo) */
  googleConversion: boolean;
  /** Disparado pelo servidor (webhook) além do navegador */
  serverSide?: boolean;
  /** Valor em reais acompanha o evento */
  hasValue?: boolean;
}

export const TRACKING_EVENTS: TrackingEventDef[] = [
  { key: "page_view", label: "Visualização de página", description: "A cada página aberta no site.", meta: "PageView", google: "page_view", googleConversion: false },
  { key: "view_content", label: "Visualização de produto", description: "Quando o cliente abre a página de um produto.", meta: "ViewContent", google: "view_item", googleConversion: false, hasValue: true },
  { key: "add_to_cart", label: "Adicionar ao carrinho", description: "Quando o cliente coloca um produto no carrinho.", meta: "AddToCart", google: "add_to_cart", googleConversion: true, hasValue: true },
  { key: "initiate_checkout", label: "Início do checkout", description: "Quando o cliente começa a finalizar a compra.", meta: "InitiateCheckout", google: "begin_checkout", googleConversion: true, hasValue: true },
  { key: "add_payment_info", label: "Forma de pagamento", description: "Quando o cliente escolhe Pix ou cartão e confirma.", meta: "AddPaymentInfo", google: "add_payment_info", googleConversion: false, hasValue: true },
  { key: "purchase", label: "Compra aprovada", description: "Quando o pagamento é aprovado (confirmado pelo Mercado Pago).", meta: "Purchase", google: "purchase", googleConversion: true, serverSide: true, hasValue: true },
  { key: "lead", label: "Lead (contato/roleta)", description: "Quando o cliente envia um formulário de consultoria ou gira a roleta.", meta: "Lead", google: "generate_lead", googleConversion: true },
  { key: "contact", label: "Clique no WhatsApp", description: "Quando o cliente clica para falar no WhatsApp.", meta: "Contact", google: "contact", googleConversion: true },
];

export const TRACKING_EVENT_KEYS = TRACKING_EVENTS.map((e) => e.key) as TrackingEventKey[];

export function getEventDef(key: string): TrackingEventDef | undefined {
  return TRACKING_EVENTS.find((e) => e.key === key);
}

export type TrackingDestination = "meta" | "google";
export type TrackingSource = "browser" | "server";
export type TrackingStatus = "sent" | "failed" | "skipped";

/** Períodos aceitos na auditoria (em minutos). */
export const AUDIT_PERIODS: Record<string, { label: string; minutes: number }> = {
  "1h": { label: "Última hora", minutes: 60 },
  "2h": { label: "Últimas 2 horas", minutes: 120 },
  "24h": { label: "Últimas 24 horas", minutes: 60 * 24 },
  "7d": { label: "Últimos 7 dias", minutes: 60 * 24 * 7 },
};
