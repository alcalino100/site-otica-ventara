import { createStaticSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  AdminLensItem,
  ColoredLensPreset,
  DEFAULT_LENSES,
  COLORED_LENSES_LIST,
  adminLensToColoredPreset,
} from "./lenses-data";

/**
 * Recupera o catálogo completo de lentes persistido no Supabase (site_settings.lenses_catalog)
 * com fallback imediato para DEFAULT_LENSES caso o banco ainda não possua registros.
 */
export async function getStoredLensesCatalog(): Promise<AdminLensItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createStaticSupabaseClient();
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "lenses_catalog")
        .maybeSingle();

      if (!error && data?.value && Array.isArray(data.value)) {
        return data.value as AdminLensItem[];
      }
    } catch (err) {
      console.warn("Aviso ao buscar lenses_catalog do Supabase, usando fallback padrão:", err);
    }
  }

  return DEFAULT_LENSES;
}

/**
 * Recupera apenas as lentes coloridas ativas, convertidas para ColoredLensPreset
 * para renderização nas páginas /lentes-coloridas e /lentes-coloridas/[id].
 */
export async function getStoredColoredLenses(): Promise<ColoredLensPreset[]> {
  const allLenses = await getStoredLensesCatalog();
  const coloridas = allLenses.filter(
    (l) => l.category === "coloridas" && l.isActive !== false
  );

  if (coloridas.length > 0) {
    return coloridas.map(adminLensToColoredPreset);
  }

  return COLORED_LENSES_LIST;
}

/**
 * Busca uma lente colorida específica por ID ou slug
 */
export async function getStoredColoredLensById(id: string): Promise<ColoredLensPreset | null> {
  const coloridas = await getStoredColoredLenses();
  const found = coloridas.find(
    (l) =>
      l.id === id ||
      l.id.replace(/^lente-cor-/, "") === id ||
      l.name.toLowerCase().includes(id.toLowerCase())
  );

  return found || null;
}
