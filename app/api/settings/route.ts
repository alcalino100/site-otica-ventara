import { NextResponse } from "next/server";
import { createStaticSupabaseClient } from "@/lib/supabase/server";
import { DEFAULT_IDENTITY, DEFAULT_APPEARANCE } from "@/lib/site-settings-constants";
import { SiteIdentitySettings, SiteAppearanceSettings } from "@/types/ecommerce";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createStaticSupabaseClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["identity", "appearance"]);

    if (error || !data) {
      return NextResponse.json({
        identity: DEFAULT_IDENTITY,
        appearance: DEFAULT_APPEARANCE,
      });
    }

    const identityRow = data.find((s) => s.key === "identity");
    const appearanceRow = data.find((s) => s.key === "appearance");

    return NextResponse.json({
      identity: identityRow?.value ? { ...DEFAULT_IDENTITY, ...(identityRow.value as SiteIdentitySettings) } : DEFAULT_IDENTITY,
      appearance: appearanceRow?.value ? { ...DEFAULT_APPEARANCE, ...(appearanceRow.value as SiteAppearanceSettings) } : DEFAULT_APPEARANCE,
    });
  } catch {
    return NextResponse.json({
      identity: DEFAULT_IDENTITY,
      appearance: DEFAULT_APPEARANCE,
    });
  }
}
