import { createStaticSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ArmacoesPageSettings } from "@/types/ecommerce";
import { DEFAULT_ARMACOES_PAGE_SETTINGS } from "@/lib/site-settings-constants";

export async function getArmacoesPageSettings(): Promise<ArmacoesPageSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createStaticSupabaseClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "armacoes_page_settings")
        .maybeSingle();

      if (!error && data?.value) {
        return {
          ...DEFAULT_ARMACOES_PAGE_SETTINGS,
          ...(data.value as Partial<ArmacoesPageSettings>),
        };
      }
    } catch (err) {
      console.warn("Fallback de armacoes_page_settings:", err);
    }
  }

  return DEFAULT_ARMACOES_PAGE_SETTINGS;
}
