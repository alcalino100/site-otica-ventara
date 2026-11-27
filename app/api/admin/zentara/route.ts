import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { IN_MEMORY_SITE_SETTINGS } from "@/lib/site-settings-constants";
import { getZentaraOptions, ZENTARA_SETTINGS_KEY } from "@/lib/zentara-settings";
import { sanitizeZentaraOptions } from "@/lib/zentara-options";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  return NextResponse.json({ options: await getZentaraOptions() });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Dados inválidos." }, { status: 400 }); }
  if (!Array.isArray(body?.options)) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const options = sanitizeZentaraOptions(body.options);
  if (!options.some((o) => o.active)) return NextResponse.json({ error: "Deixe pelo menos uma opção ativa." }, { status: 400 });
  for (const o of options) {
    if (o.priceCents && o.oldPriceCents && o.oldPriceCents <= o.priceCents) {
      return NextResponse.json({ error: `${o.name}: o preço antigo (riscado) precisa ser maior que o preço promocional.` }, { status: 400 });
    }
  }

  IN_MEMORY_SITE_SETTINGS[ZENTARA_SETTINGS_KEY] = options;
  if (isSupabaseConfigured()) {
    const { error } = await createAdminClient()
      .from("site_settings")
      .upsert({ key: ZENTARA_SETTINGS_KEY, description: "Cartões de compra das lentes Zentara", value: options, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) return NextResponse.json({ error: "Não foi possível salvar agora. Tente novamente." }, { status: 500 });
  }
  revalidatePath("/zentara");
  return NextResponse.json({ options });
}
