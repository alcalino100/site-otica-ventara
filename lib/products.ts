import { cache } from "react";
import { Product } from "@/types/ecommerce";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { createStaticSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/static";

export interface FetchProductsOptions {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  frameType?: string;
  gender?: string;
  search?: string;
  hasDiscountOnly?: boolean;
  sortBy?: "featured" | "price_asc" | "price_desc" | "name_asc" | "discount_desc";
}

/**
 * Normaliza e sanitiza um produto para garantir integridade e formato único.
 */
export function normalizeProduct(raw: any): Product {
  const priceInCents =
    typeof raw.price_in_cents === "number"
      ? raw.price_in_cents
      : typeof raw.priceInCents === "number"
      ? raw.priceInCents
      : Math.round((Number(raw.price) || 0) * 100);

  const compareAtPriceInCents =
    typeof raw.compare_at_price_in_cents === "number"
      ? raw.compare_at_price_in_cents
      : typeof raw.compareAtPriceInCents === "number"
      ? raw.compareAtPriceInCents
      : typeof raw.original_price === "number"
      ? Math.round(raw.original_price * 100)
      : null;

  const sku =
    raw.sku ||
    raw.variants?.[0]?.sku ||
    `VEN-${(raw.slug || "PROD").slice(0, 12).toUpperCase()}-${(raw.id || "0000").slice(0, 4).toUpperCase()}`;

  const status =
    raw.status === "rascunho" || raw.status === "publicado"
      ? raw.status
      : raw.is_published === false
      ? "rascunho"
      : "publicado";

  const availability =
    raw.availability === "sob_consulta" || raw.availability === "fora_do_site"
      ? raw.availability
      : "disponivel";

  const images = Array.isArray(raw.images)
    ? raw.images.map((img: any, idx: number) => ({
        id: img.id || `img-${idx}`,
        product_id: raw.id,
        url: img.url || "",
        alt_text: img.alt_text || raw.name || "Armação Ventara",
        is_primary: Boolean(img.is_primary ?? idx === 0),
        sort_order: Number(img.sort_order ?? idx),
        created_at: img.created_at || new Date().toISOString(),
      }))
    : [];

  const variants = Array.isArray(raw.variants)
    ? raw.variants.map((v: any, idx: number) => ({
        id: v.id || `v-${idx}`,
        product_id: raw.id,
        sku: v.sku || `${sku}-${idx + 1}`,
        color_name: v.color_name || "Padrão",
        color_hex: v.color_hex || "#1e293b",
        size: v.size || "Único",
        stock_quantity: Number(v.stock_quantity ?? 10),
        price_in_cents: typeof v.price_in_cents === "number" ? v.price_in_cents : null,
        compare_at_price_in_cents: typeof v.compare_at_price_in_cents === "number" ? v.compare_at_price_in_cents : null,
        image_url: v.image_url || null,
        is_available: v.is_available !== false,
        sort_order: Number(v.sort_order ?? idx),
        created_at: v.created_at || new Date().toISOString(),
        updated_at: v.updated_at || new Date().toISOString(),
      }))
    : [];

  return {
    id: String(raw.id),
    category_id: raw.category_id || null,
    brand_id: raw.brand_id || null,
    sku,
    status,
    availability,
    name: String(raw.name || "Armação Ventara"),
    slug: String(raw.slug || `armacao-${raw.id}`),
    description: raw.description ? String(raw.description).trim() : null,
    price_in_cents: priceInCents,
    compare_at_price_in_cents: compareAtPriceInCents,
    original_price: compareAtPriceInCents ? compareAtPriceInCents / 100 : null,
    is_published: status === "publicado" && availability !== "fora_do_site",
    is_featured: Boolean(raw.is_featured),
    frame_type: raw.frame_type || "Grau",
    frame_shape: raw.frame_shape || null,
    frame_material: raw.frame_material || null,
    gender: raw.gender || "Unissex",
    dimensions_lens_mm: raw.dimensions_lens_mm ? Number(raw.dimensions_lens_mm) : null,
    dimensions_bridge_mm: raw.dimensions_bridge_mm ? Number(raw.dimensions_bridge_mm) : null,
    dimensions_temple_mm: raw.dimensions_temple_mm ? Number(raw.dimensions_temple_mm) : null,
    low_stock_threshold: typeof raw.low_stock_threshold === "number" ? raw.low_stock_threshold : 3,
    face_shape_recommendations: Array.isArray(raw.face_shape_recommendations)
      ? raw.face_shape_recommendations
      : typeof raw.face_shape_recommendations === "string"
      ? raw.face_shape_recommendations.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [],
    warranty_text: raw.warranty_text ? String(raw.warranty_text).trim() : null,
    exchange_text: raw.exchange_text ? String(raw.exchange_text).trim() : null,
    faq_items: Array.isArray(raw.faq_items) ? raw.faq_items : [],
    benefits_tags: Array.isArray(raw.benefits_tags) ? raw.benefits_tags : [],
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
    category: raw.category || null,
    brand: raw.brand || null,
    images,
    variants,
  };
}

/**
 * Consulta resiliente com ordenação determinística e paginação controlada.
 * A ordenação com desempate por id ASC elimina sumiço de produtos por empates em created_at.
 */
export async function getUnifiedProducts(options: FetchProductsOptions = {}): Promise<Product[]> {
  const {
    limit = 100,
    offset = 0,
    categorySlug,
    frameType,
    gender,
    search,
    hasDiscountOnly,
    sortBy = "featured",
  } = options;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createStaticSupabaseClient();
      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq("is_published", true)
        // Ordenação determinística com desempate por ID único
        .order("created_at", { ascending: false })
        .order("id", { ascending: true })
        .range(offset, offset + limit - 1);

      if (categorySlug && categorySlug !== "all") {
        query = query.eq("category.slug", categorySlug);
      }

      if (frameType && frameType !== "all") {
        query = query.eq("frame_type", frameType);
      }

      if (gender && gender !== "all") {
        query = query.eq("gender", gender);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        let products = data.map(normalizeProduct);

        // Filtro em memória para regras avançadas
        if (hasDiscountOnly) {
          products = products.filter(
            (p) =>
              p.compare_at_price_in_cents &&
              p.compare_at_price_in_cents > p.price_in_cents
          );
        }

        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          products = products.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.slug.toLowerCase().includes(q) ||
              (p.sku && p.sku.toLowerCase().includes(q)) ||
              (p.description && p.description.toLowerCase().includes(q))
          );
        }

        // Ordenação adicional se solicitada
        if (sortBy === "price_asc") {
          products.sort((a, b) => a.price_in_cents - b.price_in_cents || a.id.localeCompare(b.id));
        } else if (sortBy === "price_desc") {
          products.sort((a, b) => b.price_in_cents - a.price_in_cents || a.id.localeCompare(b.id));
        } else if (sortBy === "name_asc") {
          products.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
        } else if (sortBy === "discount_desc") {
          products.sort((a, b) => {
            const discA = a.compare_at_price_in_cents ? (a.compare_at_price_in_cents - a.price_in_cents) / a.compare_at_price_in_cents : 0;
            const discB = b.compare_at_price_in_cents ? (b.compare_at_price_in_cents - b.price_in_cents) / b.compare_at_price_in_cents : 0;
            return discB - discA || a.id.localeCompare(b.id);
          });
        }

        return products;
      }
    } catch (err) {
      console.error("[getUnifiedProducts] Erro de conexão com Supabase, usando catálogo estruturado:", err);
    }
  }

  // Fallback estruturado consistente
  let fallback = DEFAULT_CATALOG.map(normalizeProduct).filter((p) => p.is_published);

  if (hasDiscountOnly) {
    fallback = fallback.filter(
      (p) => p.compare_at_price_in_cents && p.compare_at_price_in_cents > p.price_in_cents
    );
  }

  if (sortBy === "discount_desc") {
    fallback.sort((a, b) => {
      const discA = a.compare_at_price_in_cents ? (a.compare_at_price_in_cents - a.price_in_cents) / a.compare_at_price_in_cents : 0;
      const discB = b.compare_at_price_in_cents ? (b.compare_at_price_in_cents - b.price_in_cents) / b.compare_at_price_in_cents : 0;
      return discB - discA || a.id.localeCompare(b.id);
    });
  }

  return fallback.slice(offset, offset + limit);
}

/**
 * Busca produto único por Slug ou UUID com memoização React cache.
 */
export const getUnifiedProductBySlug = cache(async (idOrSlug: string): Promise<Product | null> => {
  if (!idOrSlug) return null;

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
        return normalizeProduct(data);
      }
    } catch (err) {
      console.error("[getUnifiedProductBySlug] Falha na consulta do produto:", err);
    }
  }

  // Fallback estruturado
  const found = DEFAULT_CATALOG.find((p) => p.slug === idOrSlug || p.id === idOrSlug);
  return found ? normalizeProduct(found) : null;
});

/**
 * Busca produtos em promoção/desconto real para a vitrine promocional da Home.
 * Se não houver produtos com compare_at_price no banco, seleciona os destaques com fallback.
 */
export async function getDiscountedOffers(limit = 8): Promise<Product[]> {
  const withDiscount = await getUnifiedProducts({
    limit,
    hasDiscountOnly: true,
    sortBy: "discount_desc",
  });

  if (withDiscount.length > 0) {
    return withDiscount;
  }

  // Caso nenhum produto possua compare_at_price cadastrado ainda, seleciona os principais
  return getUnifiedProducts({ limit, sortBy: "featured" });
}
