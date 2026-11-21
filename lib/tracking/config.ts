import { TRACKING_EVENTS, TRACKING_EVENT_KEYS, type TrackingEventKey } from "./events";

export interface EventRouting {
  meta: boolean;
  google: boolean;
  /** Rótulo da conversão do Google Ads (ex.: AbC-dEfG). Opcional. */
  google_label: string;
}

export interface TrackingConfig {
  meta_pixel_id: string;
  meta_capi_token: string;
  meta_test_event_code: string;
  google_ads_id: string;
  google_ga4_id: string;
  meta_enabled: boolean;
  google_enabled: boolean;
  events: Record<TrackingEventKey, EventRouting>;
}

/** Configuração pública: nunca inclui o token. */
export interface PublicTrackingConfig {
  meta_pixel_id: string;
  google_ads_id: string;
  google_ga4_id: string;
  meta_enabled: boolean;
  google_enabled: boolean;
  /** true quando a API de Conversões (servidor) está pronta */
  capi_ready: boolean;
  events: Record<TrackingEventKey, EventRouting>;
}

/** Padrão quando nada foi configurado: eventos de funil ligados, mas só enviam depois de preencher os IDs e ativar. */
export function defaultRouting(key: TrackingEventKey): EventRouting {
  return { meta: true, google: true, google_label: "" };
}

export function normalizeEvents(raw: unknown): Record<TrackingEventKey, EventRouting> {
  const src = raw && typeof raw === "object" ? (raw as Record<string, Partial<EventRouting>>) : {};
  const out = {} as Record<TrackingEventKey, EventRouting>;
  for (const key of TRACKING_EVENT_KEYS) {
    const base = defaultRouting(key);
    const v = src[key] || {};
    out[key] = {
      meta: typeof v.meta === "boolean" ? v.meta : base.meta,
      google: typeof v.google === "boolean" ? v.google : base.google,
      google_label: typeof v.google_label === "string" ? v.google_label.trim().slice(0, 60) : "",
    };
  }
  return out;
}

export function normalizeConfig(row: Record<string, unknown> | null | undefined): TrackingConfig {
  const r = row || {};
  const str = (k: string) => (typeof r[k] === "string" ? (r[k] as string).trim() : "");
  return {
    meta_pixel_id: str("meta_pixel_id"),
    meta_capi_token: str("meta_capi_token"),
    meta_test_event_code: str("meta_test_event_code"),
    google_ads_id: str("google_ads_id"),
    google_ga4_id: str("google_ga4_id"),
    meta_enabled: r.meta_enabled === true,
    google_enabled: r.google_enabled === true,
    events: normalizeEvents(r.events),
  };
}

export function toPublicConfig(c: TrackingConfig): PublicTrackingConfig {
  return {
    meta_pixel_id: c.meta_pixel_id,
    google_ads_id: c.google_ads_id,
    google_ga4_id: c.google_ga4_id,
    meta_enabled: c.meta_enabled && !!c.meta_pixel_id,
    google_enabled: c.google_enabled && !!(c.google_ads_id || c.google_ga4_id),
    capi_ready: c.meta_enabled && !!c.meta_pixel_id && !!c.meta_capi_token,
    events: c.events,
  };
}

// ---- validação (admin) ----
export const PIXEL_ID_RE = /^\d{8,20}$/;
export const GOOGLE_ADS_RE = /^AW-\d{6,15}$/;
export const GA4_RE = /^G-[A-Z0-9]{6,15}$/;

export function validateConfigInput(input: {
  meta_pixel_id?: string;
  google_ads_id?: string;
  google_ga4_id?: string;
}): string | null {
  if (input.meta_pixel_id && !PIXEL_ID_RE.test(input.meta_pixel_id)) return "ID do Pixel inválido (só números, 8 a 20 dígitos).";
  if (input.google_ads_id && !GOOGLE_ADS_RE.test(input.google_ads_id)) return "ID do Google Ads inválido (formato AW-1234567890).";
  if (input.google_ga4_id && !GA4_RE.test(input.google_ga4_id)) return "ID do GA4 inválido (formato G-XXXXXXXXXX).";
  return null;
}

export { TRACKING_EVENTS };
