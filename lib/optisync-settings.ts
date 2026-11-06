import { createStaticSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { OptiSyncPageSettings } from "@/types/ecommerce";
import { DEFAULT_OPTISYNC_SETTINGS } from "@/lib/site-settings-constants";

export async function getOptiSyncPageSettings(): Promise<OptiSyncPageSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createStaticSupabaseClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "optisync_page_settings")
        .maybeSingle();

      if (!error && data?.value) {
        const val = data.value as Partial<OptiSyncPageSettings>;
        return {
          ...DEFAULT_OPTISYNC_SETTINGS,
          ...val,
          hdLine: {
            ...DEFAULT_OPTISYNC_SETTINGS.hdLine!,
            ...(val.hdLine || {}),
          },
          photochromicLine: {
            ...DEFAULT_OPTISYNC_SETTINGS.photochromicLine!,
            ...(val.photochromicLine || {}),
          },
          kidsLine: {
            ...DEFAULT_OPTISYNC_SETTINGS.kidsLine!,
            ...(val.kidsLine || {}),
          },
          galleryItems:
            val.galleryItems && val.galleryItems.length > 0
              ? val.galleryItems
              : DEFAULT_OPTISYNC_SETTINGS.galleryItems,
        };
      }
    } catch (err) {
      console.warn("Fallback de optisync_page_settings:", err);
    }
  }

  return DEFAULT_OPTISYNC_SETTINGS;
}
