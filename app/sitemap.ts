import type { MetadataRoute } from "next";
import { getUnifiedProducts } from "@/lib/products";
import { getStoredColoredLenses } from "@/lib/lenses-server";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 3600;

const STATIC_PAGES: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/armacoes", priority: 0.9, changeFrequency: "daily" },
  { path: "/lentes", priority: 0.9, changeFrequency: "weekly" },
  { path: "/lentes-coloridas", priority: 0.7, changeFrequency: "weekly" },
  { path: "/optisync", priority: 0.7, changeFrequency: "monthly" },
  { path: "/medicao-por-foto", priority: 0.7, changeFrequency: "monthly" },
  { path: "/entregas", priority: 0.6, changeFrequency: "monthly" },
  { path: "/responsavel-tecnico", priority: 0.4, changeFrequency: "monthly" },
  { path: "/politica-de-privacidade", priority: 0.2, changeFrequency: "monthly" },
  { path: "/politica-de-reembolso", priority: 0.2, changeFrequency: "monthly" },
  { path: "/termos-de-uso", priority: 0.2, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path === "/" ? "" : p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  try {
    const products = await getUnifiedProducts({ limit: 1000 });
    for (const p of products) {
      if (!p.slug) continue;
      entries.push({
        url: `${SITE_URL}/produto/${p.slug}`,
        ...(p.updated_at ? { lastModified: new Date(p.updated_at) } : {}),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // sitemap continua válido só com as páginas fixas
  }

  try {
    const coloridas = await getStoredColoredLenses();
    for (const l of coloridas) {
      entries.push({ url: `${SITE_URL}/lentes-coloridas/${l.id}`, changeFrequency: "monthly", priority: 0.5 });
    }
  } catch {}

  return entries;
}
