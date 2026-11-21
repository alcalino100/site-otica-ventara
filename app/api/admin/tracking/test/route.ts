import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadTrackingConfig, logTrackingEvents, sendMetaCapi } from "@/lib/tracking/server";

export const dynamic = "force-dynamic";

/** Envia um evento de teste para a API de Conversões (aparece em "Testar eventos" no Gerenciador de Eventos). */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const db = createAdminClient();
  const config = await loadTrackingConfig(db);
  if (!config.meta_pixel_id || !config.meta_capi_token) {
    return NextResponse.json({ ok: false, error: "Preencha o ID do Pixel e o token da API antes de testar." }, { status: 400 });
  }
  const eventId = `test_${crypto.randomUUID()}`;
  const r = await sendMetaCapi(
    config,
    { eventKey: "test", eventId, url: "https://www.oticasventara.com.br/", userAgent: "admin-test" },
    { test: true }
  );
  await logTrackingEvents(db, [
    { event_key: "test", destination: "meta", source: "server", status: r.ok ? "sent" : "failed", event_id: eventId, http_status: r.httpStatus, error: r.error || null },
  ]);
  return NextResponse.json({ ok: r.ok, http_status: r.httpStatus, error: r.error || null, used_test_code: !!config.meta_test_event_code });
}
