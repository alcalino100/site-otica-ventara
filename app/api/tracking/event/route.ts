import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { getEventDef } from "@/lib/tracking/events";
import {
  loadTrackingConfig,
  logTrackingEvents,
  purgeOldTrackingEvents,
  safePath,
  sendMetaCapi,
  type LogRow,
} from "@/lib/tracking/server";

export const dynamic = "force-dynamic";

const ID_RE = /^[A-Za-z0-9_\-:.]{6,80}$/;
const clean = (v: unknown, max = 300) => (typeof v === "string" ? v.slice(0, max) : undefined);

/**
 * Recebe um evento do navegador (já com consentimento de marketing):
 *  - registra na auditoria o que o navegador disparou (Pixel / Google)
 *  - envia o mesmo evento pelo servidor (API de Conversões) com o mesmo event_id, para deduplicar
 * Compra (purchase) NÃO é enviada daqui: vem do webhook de pagamento.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
    if (!rateLimit(`trk-event:${ip}`, { maxTokens: 60, intervalMs: 60000 }).success) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const key = clean(body.event_key, 40) || "";
    const def = getEventDef(key);
    const eventId = clean(body.event_id, 80) || "";
    if (!def || !ID_RE.test(eventId)) return NextResponse.json({ ok: false, error: "evento inválido" }, { status: 400 });

    const db = createAdminClient();
    const config = await loadTrackingConfig(db);
    const routing = config.events[def.key];
    const value = typeof body.value === "number" && body.value >= 0 && body.value < 1e7 ? body.value : null;
    const path = safePath(clean(body.url, 500) || "/");
    const valueCents = value === null ? null : Math.round(value * 100);
    const fired = (body.fired && typeof body.fired === "object" ? body.fired : {}) as { meta?: boolean; google?: boolean };

    const rows: LogRow[] = [];
    const base = { event_key: def.key, event_id: eventId, value_in_cents: valueCents, currency: value === null ? null : "BRL", path };

    if (fired.meta && routing.meta) rows.push({ ...base, destination: "meta", source: "browser", status: "sent" });
    if (fired.google && routing.google) rows.push({ ...base, destination: "google", source: "browser", status: "sent" });

    // API de Conversões (servidor), exceto compra (vem do webhook)
    if (!def.serverSide && routing.meta && config.meta_enabled && config.meta_pixel_id && config.meta_capi_token) {
      const contentIds = Array.isArray(body.content_ids)
        ? body.content_ids.filter((x: unknown) => typeof x === "string").slice(0, 20)
        : undefined;
      const r = await sendMetaCapi(config, {
        eventKey: def.key,
        eventId,
        value,
        currency: "BRL",
        contentIds,
        numItems: typeof body.num_items === "number" ? Math.min(body.num_items, 999) : undefined,
        url: clean(body.url, 500),
        fbp: clean(body.fbp, 120),
        fbc: clean(body.fbc, 200),
        ip: ip === "local" ? undefined : ip,
        userAgent: clean(req.headers.get("user-agent") || "", 300),
      });
      rows.push({ ...base, destination: "meta", source: "server", status: r.ok ? "sent" : "failed", http_status: r.httpStatus, error: r.error || null });
    }

    await logTrackingEvents(db, rows);
    if (Math.random() < 0.01) void purgeOldTrackingEvents(db);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.warn("[tracking/event]", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
