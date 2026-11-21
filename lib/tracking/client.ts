"use client";

import { getEventDef, type TrackingEventKey } from "./events";
import type { PublicTrackingConfig } from "./config";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    gtag?: any;
    dataLayer?: any[];
    __ventaraTrackingBoot?: boolean;
  }
}

const CONSENT_KEY = "ventara_cookie_consent";
let configPromise: Promise<PublicTrackingConfig | null> | null = null;
let configAt = 0;

export function hasMarketingConsent(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? JSON.parse(raw)?.marketing === true : false;
  } catch {
    return false;
  }
}

export function loadTrackingConfig(force = false): Promise<PublicTrackingConfig | null> {
  if (!configPromise || force || Date.now() - configAt > 60_000) {
    configAt = Date.now();
    configPromise = fetch("/api/tracking/config")
      .then((r) => (r.ok ? (r.json() as Promise<PublicTrackingConfig>) : null))
      .catch(() => null);
  }
  return configPromise;
}

function readCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/** fbp/fbc melhoram a correspondência da API de Conversões. fbc é montado do fbclid da URL se o cookie não existir. */
export function getMetaBrowserIds(): { fbp?: string; fbc?: string } {
  if (typeof document === "undefined") return {};
  let fbc = readCookie("_fbc");
  try {
    if (!fbc) {
      const id = new URLSearchParams(window.location.search).get("fbclid");
      if (id) {
        fbc = `fb.1.${Date.now()}.${id}`;
        sessionStorage.setItem("ventara_fbc", fbc);
      } else {
        fbc = sessionStorage.getItem("ventara_fbc") || undefined;
      }
    }
  } catch {
    /* ignora */
  }
  return { fbp: readCookie("_fbp"), fbc };
}

/** Instala os scripts (uma vez) quando há consentimento e a conta está configurada. */
export function bootTrackingScripts(cfg: PublicTrackingConfig) {
  if (typeof window === "undefined" || window.__ventaraTrackingBoot) return;
  if (!hasMarketingConsent()) return;
  window.__ventaraTrackingBoot = true;

  if (cfg.meta_enabled && cfg.meta_pixel_id && !window.fbq) {
    // Snippet oficial do Meta Pixel
    const n: any = (window.fbq = function (...args: any[]) {
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
    });
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    window.fbq("init", cfg.meta_pixel_id);
  }

  const gId = cfg.google_ads_id || cfg.google_ga4_id;
  if (cfg.google_enabled && gId && !window.gtag) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gId)}`;
    document.head.appendChild(s);
    window.gtag("js", new Date());
    if (cfg.google_ads_id) window.gtag("config", cfg.google_ads_id, { send_page_view: false });
    if (cfg.google_ga4_id) window.gtag("config", cfg.google_ga4_id, { send_page_view: false });
  }
}

export interface TrackData {
  value?: number; // reais
  contentIds?: string[];
  numItems?: number;
  /** Para deduplicar com o servidor. Padrão: aleatório. */
  eventId?: string;
  /** Evita disparar duas vezes o mesmo evento (ex.: compra). */
  onceKey?: string;
}

function newEventId(key: string) {
  return `${key}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Dispara um evento conforme a matriz configurada no painel (/admin/marketing).
 * Nunca lança erro e nunca bloqueia a navegação.
 */
export async function trackEvent(key: TrackingEventKey, data: TrackData = {}): Promise<void> {
  try {
    if (typeof window === "undefined" || window.location.pathname.startsWith("/admin")) return;
    if (!hasMarketingConsent()) return;
    const def = getEventDef(key);
    if (!def) return;
    const cfg = await loadTrackingConfig();
    if (!cfg) return;
    const routing = cfg.events[key];
    if (!routing) return;

    if (data.onceKey) {
      const k = `ventara_trk_once_${data.onceKey}`;
      if (localStorage.getItem(k)) return;
      localStorage.setItem(k, "1");
    }

    bootTrackingScripts(cfg);
    const eventId = data.eventId || newEventId(key);
    const customMeta: Record<string, unknown> = {};
    const hasValue = typeof data.value === "number" && Number.isFinite(data.value);
    if (hasValue) {
      customMeta.value = data.value;
      customMeta.currency = "BRL";
    }
    if (data.contentIds?.length) {
      customMeta.content_ids = data.contentIds;
      customMeta.content_type = "product";
    }
    if (data.numItems) customMeta.num_items = data.numItems;

    const fired = { meta: false, google: false };

    if (cfg.meta_enabled && routing.meta && window.fbq) {
      window.fbq("track", def.meta, customMeta, { eventID: eventId });
      fired.meta = true;
    }

    if (cfg.google_enabled && routing.google && window.gtag) {
      const params: Record<string, unknown> = {};
      if (hasValue) {
        params.value = data.value;
        params.currency = "BRL";
      }
      if (data.contentIds?.length) params.items = data.contentIds.map((id) => ({ item_id: id }));
      if (key === "purchase") params.transaction_id = eventId;
      window.gtag("event", def.google, params);
      if (def.googleConversion && cfg.google_ads_id && routing.google_label) {
        window.gtag("event", "conversion", {
          send_to: `${cfg.google_ads_id}/${routing.google_label}`,
          ...(hasValue ? { value: data.value, currency: "BRL" } : {}),
          ...(key === "purchase" ? { transaction_id: eventId } : {}),
        });
      }
      fired.google = true;
    }

    // Nada foi disparado no navegador e a API de Conversões não está pronta: nada a registrar
    const serverWillSend = cfg.capi_ready && routing.meta && !def.serverSide;
    if (!fired.meta && !fired.google && !serverWillSend) return;

    const ids = getMetaBrowserIds();
    const body = JSON.stringify({
      event_key: key,
      event_id: eventId,
      value: hasValue ? data.value : undefined,
      content_ids: data.contentIds,
      num_items: data.numItems,
      url: window.location.href,
      fbp: ids.fbp,
      fbc: ids.fbc,
      fired,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/tracking/event", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/tracking/event", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
    }
  } catch {
    /* rastreamento nunca pode quebrar o site */
  }
}

/** Dados enviados ao checkout para a compra server-side. */
export function getCheckoutTrackingContext() {
  if (typeof window === "undefined") return undefined;
  const ids = getMetaBrowserIds();
  return { ...ids, consent: hasMarketingConsent(), url: window.location.href };
}
