import crypto from "crypto";
import { getEventDef, type TrackingDestination, type TrackingSource, type TrackingStatus } from "./events";
import { normalizeConfig, type TrackingConfig } from "./config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

export const META_GRAPH_VERSION = "v21.0";

export async function loadTrackingConfig(db: Db): Promise<TrackingConfig> {
  try {
    const { data } = await db.from("tracking_config").select("*").eq("id", "main").maybeSingle();
    return normalizeConfig(data);
  } catch {
    return normalizeConfig(null);
  }
}

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");

export function hashEmail(email?: string | null): string | undefined {
  const v = (email || "").trim().toLowerCase();
  return v ? sha256(v) : undefined;
}
export function hashPhone(phone?: string | null): string | undefined {
  let d = (phone || "").replace(/\D/g, "");
  if (d.length < 8) return undefined;
  if (d.length <= 11) d = `55${d}`; // Brasil
  return sha256(d);
}

/** Remove qualquer rastro do token de mensagens de erro antes de gravar/mostrar. */
export function redactSecrets(text: string, secrets: string[]): string {
  let out = text;
  for (const s of secrets) if (s && s.length > 6) out = out.split(s).join("***");
  return out.replace(/access_token=[^&\s"]+/gi, "access_token=***").slice(0, 400);
}

export interface ServerEventInput {
  eventKey: string;
  eventId: string;
  value?: number | null; // em reais
  currency?: string;
  contentIds?: string[];
  numItems?: number;
  url?: string;
  fbp?: string;
  fbc?: string;
  ip?: string;
  userAgent?: string;
  email?: string | null;
  phone?: string | null;
  orderId?: string;
}

export interface MetaSendResult {
  ok: boolean;
  httpStatus: number | null;
  error?: string;
}

export async function sendMetaCapi(
  config: TrackingConfig,
  input: ServerEventInput,
  opts: { fetchImpl?: typeof fetch; test?: boolean } = {}
): Promise<MetaSendResult> {
  const def = getEventDef(input.eventKey);
  const metaName = def?.meta || (input.eventKey === "test" ? "PageView" : null);
  if (!metaName) return { ok: false, httpStatus: null, error: "Evento desconhecido" };
  if (!config.meta_pixel_id || !config.meta_capi_token) {
    return { ok: false, httpStatus: null, error: "Pixel ID ou token da API não configurado" };
  }
  const f = opts.fetchImpl || fetch;

  const userData: Record<string, unknown> = {};
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;
  if (input.ip) userData.client_ip_address = input.ip;
  if (input.userAgent) userData.client_user_agent = input.userAgent;
  const em = hashEmail(input.email);
  const ph = hashPhone(input.phone);
  if (em) userData.em = [em];
  if (ph) userData.ph = [ph];

  const customData: Record<string, unknown> = {};
  if (typeof input.value === "number" && Number.isFinite(input.value)) {
    customData.value = Math.round(input.value * 100) / 100;
    customData.currency = input.currency || "BRL";
  }
  if (input.contentIds?.length) {
    customData.content_ids = input.contentIds.slice(0, 50);
    customData.content_type = "product";
  }
  if (input.numItems) customData.num_items = input.numItems;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: metaName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: "website",
        event_source_url: input.url,
        user_data: userData,
        custom_data: customData,
      },
    ],
    access_token: config.meta_capi_token,
  };
  if (opts.test && config.meta_test_event_code) body.test_event_code = config.meta_test_event_code;

  try {
    const res = await f(`https://graph.facebook.com/${META_GRAPH_VERSION}/${config.meta_pixel_id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return { ok: true, httpStatus: res.status };
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j?.error?.message) msg = `${j.error.message}`;
    } catch {
      /* ignora corpo inválido */
    }
    return { ok: false, httpStatus: res.status, error: redactSecrets(msg, [config.meta_capi_token]) };
  } catch (e) {
    return {
      ok: false,
      httpStatus: null,
      error: redactSecrets(e instanceof Error ? e.message : "Falha de rede", [config.meta_capi_token]),
    };
  }
}

export interface LogRow {
  event_key: string;
  destination: TrackingDestination;
  source: TrackingSource;
  status: TrackingStatus;
  event_id?: string | null;
  order_id?: string | null;
  value_in_cents?: number | null;
  currency?: string | null;
  path?: string | null;
  http_status?: number | null;
  error?: string | null;
}

export async function logTrackingEvents(db: Db, rows: LogRow[]): Promise<void> {
  if (!rows.length) return;
  try {
    const { error } = await db.from("tracking_events").insert(rows);
    if (error) console.warn("[tracking] falha ao gravar auditoria:", error.message);
  } catch (e) {
    console.warn("[tracking] falha ao gravar auditoria:", e instanceof Error ? e.message : e);
  }
}

/** Limpa auditoria com mais de 90 dias (chamado de vez em quando). */
export async function purgeOldTrackingEvents(db: Db, days = 90): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    await db.from("tracking_events").delete().lt("created_at", cutoff);
  } catch {
    /* melhor esforço */
  }
}

/**
 * Evento disparado pelo servidor (ex.: compra aprovada no webhook).
 * Respeita a matriz de eventos, grava auditoria e nunca lança erro.
 * Idempotente por eventId: se já foi enviado com sucesso, não reenvia.
 */
export async function dispatchServerEvent(
  db: Db,
  input: ServerEventInput,
  opts: { fetchImpl?: typeof fetch } = {}
): Promise<{ meta: "sent" | "failed" | "skipped" }> {
  try {
    const config = await loadTrackingConfig(db);
    const routing = config.events[input.eventKey as keyof typeof config.events];
    const valueCents = typeof input.value === "number" ? Math.round(input.value * 100) : null;

    if (!routing?.meta || !config.meta_enabled || !config.meta_pixel_id || !config.meta_capi_token) {
      return { meta: "skipped" };
    }

    const { data: already } = await db
      .from("tracking_events")
      .select("id")
      .eq("event_id", input.eventId)
      .eq("destination", "meta")
      .eq("source", "server")
      .eq("status", "sent")
      .limit(1);
    if (already && already.length) return { meta: "skipped" };

    const r = await sendMetaCapi(config, input, opts);
    await logTrackingEvents(db, [
      {
        event_key: input.eventKey,
        destination: "meta",
        source: "server",
        status: r.ok ? "sent" : "failed",
        event_id: input.eventId,
        order_id: input.orderId || null,
        value_in_cents: valueCents,
        currency: input.currency || "BRL",
        path: input.url ? safePath(input.url) : null,
        http_status: r.httpStatus,
        error: r.error || null,
      },
    ]);
    return { meta: r.ok ? "sent" : "failed" };
  } catch (e) {
    console.warn("[tracking] dispatchServerEvent:", e instanceof Error ? e.message : e);
    return { meta: "failed" };
  }
}

export function safePath(url: string): string {
  try {
    return new URL(url, "https://x.local").pathname.slice(0, 200);
  } catch {
    return url.slice(0, 200);
  }
}

/** Purchase server-side a partir de um pedido pago (usado pelo webhook). */
export async function dispatchPurchaseForOrder(
  db: Db,
  order: { id: string; total_in_cents: number; customer_email?: string | null; customer_phone?: string | null },
  opts: { fetchImpl?: typeof fetch } = {}
) {
  try {
    const { data: ctx } = await db.from("tracking_order_context").select("*").eq("order_id", order.id).maybeSingle();
    // Sem consentimento de marketing registrado no checkout, não envia dados do cliente à Meta
    if (!ctx || !ctx.marketing_consent) return { meta: "skipped" as const };
    return await dispatchServerEvent(
      db,
      {
        eventKey: "purchase",
        eventId: `purchase_${order.id}`,
        value: order.total_in_cents / 100,
        currency: "BRL",
        url: ctx.event_source_url || undefined,
        fbp: ctx.fbp || undefined,
        fbc: ctx.fbc || undefined,
        ip: ctx.client_ip || undefined,
        userAgent: ctx.user_agent || undefined,
        email: order.customer_email,
        phone: order.customer_phone,
        orderId: order.id,
      },
      opts
    );
  } catch (e) {
    console.warn("[tracking] dispatchPurchaseForOrder:", e instanceof Error ? e.message : e);
    return { meta: "failed" as const };
  }
}
