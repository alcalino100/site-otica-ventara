import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { DEFAULT_HERO_SETTINGS } from "@/lib/site-settings-constants";
import { HeroCarouselSettings } from "@/types/ecommerce";

function isLiveDatabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !serviceRoleKey) return false;
  if (
    supabaseUrl.includes("placeholder") ||
    supabaseUrl.includes("seu-projeto") ||
    serviceRoleKey.includes("placeholder") ||
    serviceRoleKey.includes("sua-chave")
  ) {
    return false;
  }
  return true;
}

async function getSettingsFromSiteSettings(adminSupabase: any): Promise<HeroCarouselSettings> {
  try {
    const { data } = await adminSupabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero_carousel_settings")
      .maybeSingle();

    if (data?.value) {
      return { ...DEFAULT_HERO_SETTINGS, ...data.value };
    }
  } catch (err) {
    console.warn("Aviso ao ler hero_carousel_settings de site_settings:", err);
  }
  return DEFAULT_HERO_SETTINGS;
}

async function saveSettingsToSiteSettings(
  adminSupabase: any,
  settings: HeroCarouselSettings
): Promise<void> {
  try {
    const now = new Date().toISOString();
    const { data: existing } = await adminSupabase
      .from("site_settings")
      .select("id")
      .eq("key", "hero_carousel_settings")
      .maybeSingle();

    if (existing?.id) {
      await adminSupabase
        .from("site_settings")
        .update({
          value: settings,
          description: "Configurações Globais do Carrossel Full-Bleed do Hero",
          updated_at: now,
        })
        .eq("id", existing.id);
    } else {
      await adminSupabase.from("site_settings").insert({
        key: "hero_carousel_settings",
        description: "Configurações Globais do Carrossel Full-Bleed do Hero",
        value: settings,
        updated_at: now,
      });
    }
  } catch (err) {
    console.warn("Aviso ao salvar settings em site_settings:", err);
  }
}

export async function GET() {
  try {
    if (!isLiveDatabaseConfigured()) {
      return NextResponse.json({ settings: DEFAULT_HERO_SETTINGS });
    }

    const adminSupabase = createAdminClient();
    try {
      const { data, error } = await adminSupabase
        .from("hero_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ settings: data });
      }
    } catch {}

    const fallback = await getSettingsFromSiteSettings(adminSupabase);
    return NextResponse.json({ settings: fallback });
  } catch (err: any) {
    console.warn("Erro ao buscar hero_settings, usando fallback:", err);
    return NextResponse.json({ settings: DEFAULT_HERO_SETTINGS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();

    const payload: HeroCarouselSettings = {
      autoplay: body.autoplay ?? true,
      interval_ms: Number(body.interval_ms) || 5000,
      transition_type: body.transition_type || "fade",
      show_arrows: body.show_arrows ?? true,
      show_indicators: body.show_indicators ?? true,
      pause_on_hover: body.pause_on_hover ?? true,
      updated_at: now,
    };

    if (!isLiveDatabaseConfigured()) {
      return NextResponse.json({ success: true, settings: payload });
    }

    const adminSupabase = createAdminClient();

    // Tenta gravar na tabela dedicada
    try {
      const { data: existing } = await adminSupabase
        .from("hero_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { data, error } = await adminSupabase
          .from("hero_settings")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single();

        if (!error && data) {
          try {
            revalidatePath("/");
          } catch {}
          return NextResponse.json({ success: true, settings: data });
        }
      } else {
        const { data, error } = await adminSupabase
          .from("hero_settings")
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          try {
            revalidatePath("/");
          } catch {}
          return NextResponse.json({ success: true, settings: data });
        }
      }
    } catch {}

    // Fallback em site_settings
    await saveSettingsToSiteSettings(adminSupabase, payload);

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, settings: payload });
  } catch (err: any) {
    console.error("Erro ao salvar hero_settings:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao salvar configurações do carrossel." },
      { status: 500 }
    );
  }
}
