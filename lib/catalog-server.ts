import { cache } from "react";
import { Product } from "@/types/ecommerce";
import { getUnifiedProductBySlug } from "@/lib/products";

/**
 * Busca produto por id (UUID) ou slug usando a camada centralizada unificada.
 * Mantido para retrocompatibilidade com páginas legadas.
 */
export const getProductByIdOrSlug = cache(async (idOrSlug: string): Promise<Product | null> => {
  return getUnifiedProductBySlug(idOrSlug);
});
