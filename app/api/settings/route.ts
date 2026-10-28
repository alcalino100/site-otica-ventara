import { NextResponse } from "next/server";
import { createStaticSupabaseClient } from "@/lib/supabase/server";
import {
  DEFAULT_IDENTITY,
  DEFAULT_APPEARANCE,
  DEFAULT_LAB_SHOWCASE,
  DEFAULT_SHOWCASE_MEDIA,
  DEFAULT_HOMOLOGATED_BRANDS,
  DEFAULT_PROMOTIONAL_SHOWCASE,
  DEFAULT_LENSES_SECTION_SETTINGS,
} from "@/lib/site-settings-constants";
import {
  SiteIdentitySettings,
  SiteAppearanceSettings,
  LabShowcaseSettings,
  ShowcaseMediaSettings,
  HomologatedBrand,
  PromotionalShowcaseSettings,
  LensesSectionSettings,
} from "@/types/ecommerce";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createStaticSupabaseClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "identity",
        "appearance",
        "lab_showcase",
        "showcase_media",
        "homologated_brands",
        "promotional_showcase",
        "lenses_section",
      ]);

    if (error || !data) {
      return NextResponse.json({
        identity: DEFAULT_IDENTITY,
        appearance: DEFAULT_APPEARANCE,
        lab_showcase: DEFAULT_LAB_SHOWCASE,
        showcase_media: DEFAULT_SHOWCASE_MEDIA,
        homologated_brands: DEFAULT_HOMOLOGATED_BRANDS,
        promotional_showcase: DEFAULT_PROMOTIONAL_SHOWCASE,
        lenses_section: DEFAULT_LENSES_SECTION_SETTINGS,
      });
    }

    const identityRow = data.find((s) => s.key === "identity");
    const appearanceRow = data.find((s) => s.key === "appearance");
    const labRow = data.find((s) => s.key === "lab_showcase");
    const showcaseRow = data.find((s) => s.key === "showcase_media");
    const brandsRow = data.find((s) => s.key === "homologated_brands");
    const promoRow = data.find((s) => s.key === "promotional_showcase");
    const lensesSectionRow = data.find((s) => s.key === "lenses_section");

    return NextResponse.json({
      identity: identityRow?.value ? { ...DEFAULT_IDENTITY, ...(identityRow.value as SiteIdentitySettings) } : DEFAULT_IDENTITY,
      appearance: appearanceRow?.value ? { ...DEFAULT_APPEARANCE, ...(appearanceRow.value as SiteAppearanceSettings) } : DEFAULT_APPEARANCE,
      lab_showcase: labRow?.value ? { ...DEFAULT_LAB_SHOWCASE, ...(labRow.value as LabShowcaseSettings) } : DEFAULT_LAB_SHOWCASE,
      showcase_media: showcaseRow?.value ? { ...DEFAULT_SHOWCASE_MEDIA, ...(showcaseRow.value as ShowcaseMediaSettings) } : DEFAULT_SHOWCASE_MEDIA,
      homologated_brands: brandsRow?.value ? (brandsRow.value as HomologatedBrand[]) : DEFAULT_HOMOLOGATED_BRANDS,
      promotional_showcase: promoRow?.value ? { ...DEFAULT_PROMOTIONAL_SHOWCASE, ...(promoRow.value as PromotionalShowcaseSettings) } : DEFAULT_PROMOTIONAL_SHOWCASE,
      lenses_section: lensesSectionRow?.value ? { ...DEFAULT_LENSES_SECTION_SETTINGS, ...(lensesSectionRow.value as LensesSectionSettings) } : DEFAULT_LENSES_SECTION_SETTINGS,
    });
  } catch {
    return NextResponse.json({
      identity: DEFAULT_IDENTITY,
      appearance: DEFAULT_APPEARANCE,
      lab_showcase: DEFAULT_LAB_SHOWCASE,
      showcase_media: DEFAULT_SHOWCASE_MEDIA,
      homologated_brands: DEFAULT_HOMOLOGATED_BRANDS,
      promotional_showcase: DEFAULT_PROMOTIONAL_SHOWCASE,
      lenses_section: DEFAULT_LENSES_SECTION_SETTINGS,
    });
  }
}
