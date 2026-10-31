import { NextResponse } from "next/server";
import { createStaticSupabaseClient } from "@/lib/supabase/server";
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_HERO_SETTINGS,
} from "@/lib/site-settings-constants";
import { HeroSlide, HeroCarouselSettings } from "@/types/ecommerce";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createStaticSupabaseClient();

    // Busca slides ativos ordenados
    const { data: slidesData, error: slidesError } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    // Busca configurações do carrossel
    const { data: settingsData, error: settingsError } = await supabase
      .from("hero_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    const slides: HeroSlide[] =
      !slidesError && slidesData && slidesData.length > 0
        ? (slidesData as HeroSlide[])
        : DEFAULT_HERO_SLIDES;

    const settings: HeroCarouselSettings =
      !settingsError && settingsData
        ? (settingsData as HeroCarouselSettings)
        : DEFAULT_HERO_SETTINGS;

    return NextResponse.json({
      slides,
      settings,
    });
  } catch (err) {
    console.warn("Fallback de hero_slides acionado:", err);
    return NextResponse.json({
      slides: DEFAULT_HERO_SLIDES,
      settings: DEFAULT_HERO_SETTINGS,
    });
  }
}
