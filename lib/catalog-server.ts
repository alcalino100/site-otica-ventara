import { cache } from "react";
import { Product } from "@/types/ecommerce";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { createStaticSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Busca produto por id (UUID) ou slug de forma otimizada com cache do React.
 * Fallback transparente para o catálogo padrão caso o banco esteja indisponível.
 */
export const getProductByIdOrSlug = cache(async (idOrSlug: string): Promise<Product | null> => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createStaticSupabaseClient();
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq("is_published", true);

      if (isUuid) {
        query = query.eq("id", idOrSlug);
      } else {
        query = query.eq("slug", idOrSlug);
      }

      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        return data as Product;
      }
    } catch (err) {
      console.warn("Erro ao buscar armação do Supabase, utilizando catálogo padrão:", err);
    }
  }

  // Fallback rápido para o catálogo estruturado
  let found = DEFAULT_CATALOG.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  if (!found && idOrSlug === "ventara-horizonte") {
    found = DEFAULT_CATALOG.find((p) => p.slug === "ventara-horizonte-sport");
  }
  return found || null;
});
