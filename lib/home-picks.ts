import { createStaticSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";

/** IDs (na ordem escolhida no admin) dos modelos que aparecem primeiro na vitrine "Escolhas que combinam com você" da Home. */
export async function getHomeCatalogPicks(): Promise<string[]> {
  try {
    if (!isSupabaseConfigured()) return [];
    const supabase = createStaticSupabaseClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "home_catalog_picks")
      .maybeSingle();
    let val: any = data?.value;
    if (typeof val === "string") {
      try {
        val = JSON.parse(val);
      } catch {}
    }
    const ids = Array.isArray(val) ? val : val?.ids;
    return Array.isArray(ids) ? ids.filter((x: unknown): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
