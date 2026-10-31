import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { DEFAULT_HERO_SETTINGS } from "@/lib/site-settings-constants";
import { HeroCarouselSettings } from "@/types/ecommerce";

export async function GET() {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("hero_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ settings: DEFAULT_HERO_SETTINGS });
    }

    return NextResponse.json({ settings: data });
  } catch (err: any) {
    console.error("Erro interno ao buscar hero_settings:", err);
    return NextResponse.json({ settings: DEFAULT_HERO_SETTINGS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();

    const { data: existing } = await adminSupabase
      .from("hero_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    const payload = {
      autoplay: body.autoplay ?? true,
      interval_ms: Number(body.interval_ms) || 5000,
      transition_type: body.transition_type || "fade",
      show_arrows: body.show_arrows ?? true,
      show_indicators: body.show_indicators ?? true,
      pause_on_hover: body.pause_on_hover ?? true,
      updated_at: now,
    };

    if (existing?.id) {
      const { data, error } = await adminSupabase
        .from("hero_settings")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      try {
        revalidatePath("/");
      } catch {}
      return NextResponse.json({ success: true, settings: data });
    } else {
      const { data, error } = await adminSupabase
        .from("hero_settings")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      try {
        revalidatePath("/");
      } catch {}
      return NextResponse.json({ success: true, settings: data });
    }
  } catch (err: any) {
    console.error("Erro interno ao salvar hero_settings:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao salvar configurações do carrossel." },
      { status: 500 }
    );
  }
}
