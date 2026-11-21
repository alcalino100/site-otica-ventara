import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadTrackingConfig } from "@/lib/tracking/server";
import { normalizeEvents, validateConfigInput } from "@/lib/tracking/config";

export const dynamic = "force-dynamic";

const mask = (t: string) => (t ? `••••••••${t.slice(-4)}` : "");

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const c = await loadTrackingConfig(createAdminClient());
  const { meta_capi_token, ...rest } = c;
  return NextResponse.json({ ...rest, has_capi_token: !!meta_capi_token, capi_token_masked: mask(meta_capi_token) });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const b = await req.json().catch(() => ({}));
  const s = (v: unknown, max = 80) => (typeof v === "string" ? v.trim().slice(0, max) : "");

  const update: Record<string, unknown> = {
    id: "main",
    meta_pixel_id: s(b.meta_pixel_id, 30),
    meta_test_event_code: s(b.meta_test_event_code, 40),
    google_ads_id: s(b.google_ads_id, 30).toUpperCase(),
    google_ga4_id: s(b.google_ga4_id, 30).toUpperCase(),
    meta_enabled: b.meta_enabled === true,
    google_enabled: b.google_enabled === true,
    events: normalizeEvents(b.events),
    updated_at: new Date().toISOString(),
  };
  const err = validateConfigInput(update as { meta_pixel_id: string; google_ads_id: string; google_ga4_id: string });
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  // Token: vazio = mantém o atual; clear_capi_token = apaga
  const newToken = s(b.meta_capi_token, 600);
  if (b.clear_capi_token === true) update.meta_capi_token = null;
  else if (newToken && !newToken.startsWith("••")) update.meta_capi_token = newToken;

  const db = createAdminClient();
  const { error } = await db.from("tracking_config").upsert(update, { onConflict: "id" });
  if (error) {
    const missing = error.code === "PGRST205" || /tracking_config/.test(error.message);
    return NextResponse.json(
      { error: missing ? "Tabelas de rastreamento ainda não criadas. Rode o SQL da migração no Supabase." : "Não foi possível salvar." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
