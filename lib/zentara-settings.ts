import { createStaticSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { IN_MEMORY_SITE_SETTINGS } from "@/lib/site-settings-constants";
import { sanitizeZentaraOptions, type ZentaraOption } from "@/lib/zentara-options";

export const ZENTARA_SETTINGS_KEY = "zentara_options";

export async function getZentaraOptions(): Promise<ZentaraOption[]> {
  let raw: unknown = IN_MEMORY_SITE_SETTINGS[ZENTARA_SETTINGS_KEY];
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await createStaticSupabaseClient().from("site_settings").select("value").eq("key", ZENTARA_SETTINGS_KEY).maybeSingle();
      if (!error && data?.value) raw = data.value;
    } catch (err) {
      console.warn("Fallback de zentara_options:", err);
    }
  }
  if (typeof raw === "string") { try { raw = JSON.parse(raw); } catch { raw = null; } }
  return sanitizeZentaraOptions(raw);
}
