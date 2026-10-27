import { NextResponse } from "next/server";
import { createStaticSupabaseClient } from "@/lib/supabase/server";
import {
  DEFAULT_IDENTITY,
  DEFAULT_APPEARANCE,
  DEFAULT_LAB_SHOWCASE,
  DEFAULT_SHOWCASE_MEDIA,
} from "@/lib/site-settings-constants";
import {
  SiteIdentitySettings,
  SiteAppearanceSettings,
  LabShowcaseSettings,
  ShowcaseMediaSettings,
} from "@/types/ecommerce";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createStaticSupabaseClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["identity", "appearance", "lab_showcase", "showcase_media"]);

    if (error || !data) {
      return NextResponse.json({
        identity: DEFAULT_IDENTITY,
        appearance: DEFAULT_APPEARANCE,
        lab_showcase: DEFAULT_LAB_SHOWCASE,
        showcase_media: DEFAULT_SHOWCASE_MEDIA,
      });
    }

    const identityRow = data.find((s) => s.key === "identity");
    const appearanceRow = data.find((s) => s.key === "appearance");
    const labRow = data.find((s) => s.key === "lab_showcase");
    const showcaseRow = data.find((s) => s.key === "showcase_media");

    return NextResponse.json({
      identity: identityRow?.value ? { ...DEFAULT_IDENTITY, ...(identityRow.value as SiteIdentitySettings) } : DEFAULT_IDENTITY,
      appearance: appearanceRow?.value ? { ...DEFAULT_APPEARANCE, ...(appearanceRow.value as SiteAppearanceSettings) } : DEFAULT_APPEARANCE,
      lab_showcase: labRow?.value ? { ...DEFAULT_LAB_SHOWCASE, ...(labRow.value as LabShowcaseSettings) } : DEFAULT_LAB_SHOWCASE,
      showcase_media: showcaseRow?.value ? { ...DEFAULT_SHOWCASE_MEDIA, ...(showcaseRow.value as ShowcaseMediaSettings) } : DEFAULT_SHOWCASE_MEDIA,
    });
  } catch {
    return NextResponse.json({
      identity: DEFAULT_IDENTITY,
      appearance: DEFAULT_APPEARANCE,
      lab_showcase: DEFAULT_LAB_SHOWCASE,
      showcase_media: DEFAULT_SHOWCASE_MEDIA,
    });
  }
}
