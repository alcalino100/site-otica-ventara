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
        return {
          ...DEFAULT_OPTISYNC_SETTINGS,
          ...(data.value as Partial<OptiSyncPageSettings>),
        };
      }
    } catch (err) {
      console.warn("Fallback de optisync_page_settings:", err);
    }
  }

  return DEFAULT_OPTISYNC_SETTINGS;
}
