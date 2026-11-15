import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { DEFAULT_LENSES, AdminLensItem } from "@/lib/lenses-data";

/**
 * Catálogo de lentes compartilhado entre a API do admin e a API pública.
 * Sem banco configurado (desenvolvimento/testes) usa a cópia em memória.
 */
let memoryCatalog: AdminLensItem[] = [...DEFAULT_LENSES];

export const getMemoryLenses = () => memoryCatalog;
export const setMemoryLenses = (lenses: AdminLensItem[]) => {
  memoryCatalog = lenses;
};

/** Lê o catálogo oficial (site_settings.lenses_catalog); cai na memória se o banco não responder. */
export async function loadLensesCatalog(): Promise<AdminLensItem[]> {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await createAdminClient()
        .from("site_settings")
        .select("value")
        .eq("key", "lenses_catalog")
        .maybeSingle();

      if (!error && data?.value) {
        let list: unknown = data.value;
        if (typeof list === "string") {
          try {
            list = JSON.parse(list);
          } catch {}
        }
        if (Array.isArray(list)) {
          memoryCatalog = list as AdminLensItem[];
        }
      }
    }
  } catch (err: any) {
    console.warn("Fallback local de lentes:", err?.message);
  }
  return memoryCatalog;
}
