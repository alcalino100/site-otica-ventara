import { NextResponse } from "next/server";
import {
  createStaticSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_HERO_SETTINGS,
} from "@/lib/site-settings-constants";
import { HeroSlide, HeroCarouselSettings } from "@/types/ecommerce";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        slides: DEFAULT_HERO_SLIDES,
        settings: DEFAULT_HERO_SETTINGS,
      });
    }

    const supabase = createStaticSupabaseClient();

    let slides: HeroSlide[] = [];
    let settings: HeroCarouselSettings = DEFAULT_HERO_SETTINGS;

    // 1. Tenta buscar da tabela dedicada hero_slides
    const { data: slidesData, error: slidesError } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (!slidesError && slidesData && slidesData.length > 0) {
      slides = slidesData as HeroSlide[];
    }

    // 2. Tenta buscar configurações da tabela dedicada hero_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("hero_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (!settingsError && settingsData) {
      settings = settingsData as HeroCarouselSettings;
    }

    // 3. Se não encontrou na tabela dedicada ou ocorreu erro de schema, busca em site_settings
    if (slides.length === 0 || !settingsData) {
      const { data: fallbackRows } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["hero_slides", "hero_carousel_settings"]);

      if (fallbackRows && fallbackRows.length > 0) {
        const slidesRow = fallbackRows.find((r) => r.key === "hero_slides");
        if (slidesRow?.value && Array.isArray(slidesRow.value) && slidesRow.value.length > 0) {
          const activeOnly = (slidesRow.value as HeroSlide[])
            .filter((s) => s.is_active)
            .sort((a, b) => a.sort_order - b.sort_order);
          if (activeOnly.length > 0) {
            slides = activeOnly;
          }
        }

        const settingsRow = fallbackRows.find((r) => r.key === "hero_carousel_settings");
        if (settingsRow?.value) {
          settings = { ...DEFAULT_HERO_SETTINGS, ...settingsRow.value };
        }
      }
    }

    return NextResponse.json({
      slides: slides.length > 0 ? slides : DEFAULT_HERO_SLIDES,
      settings,
    });
  } catch (err) {
    console.warn("Fallback de hero acionado:", err);
    return NextResponse.json({
      slides: DEFAULT_HERO_SLIDES,
      settings: DEFAULT_HERO_SETTINGS,
    });
  }
}
