// lib/seo.ts
// Fonte única do SEO: domínio oficial, dados do negócio (NAP) e geradores de JSON-LD (schema.org).

import type { Metadata } from "next";
import type { Product } from "@/types/ecommerce";

export const SITE_URL = "https://www.oticasventara.com.br";
export const SITE_NAME = "Óticas Ventara";
/** Foto da fachada: usada em dados estruturados (JSON-LD). */
export const STORE_PHOTO = "/images/store/fachada-otica-ventara.jpg";
/** Cartão de compartilhamento (WhatsApp/redes) da home e padrão das páginas: só a logo. */
export const DEFAULT_OG_IMAGE = "/images/og/ventara-logo.jpg";
export const OG_IMAGES = {
  rastreio: "/images/og/rastreio.jpg",
  armacoes: "/images/og/ventara-armacoes.jpg",
} as const;

export const BUSINESS = {
  name: "Óticas Ventara Eyewear",
  legalName: "Óticas Ventara",
  phone: "+55-18-3304-2808",
  whatsapp: "+55-18-99615-5748",
  street: "Rua Princesa Isabel, 221",
  neighborhood: "Centro",
  city: "Araçatuba",
  state: "SP",
  postalCode: "16010-250",
  country: "BR",
  instagram: "https://www.instagram.com/oticaventara/",
  facebook: "https://www.facebook.com/share/19mUxSqUnf/?mibextid=wwXIfr",
  logo: "/images/logo-ventara.png",
} as const;

/** URL absoluta a partir de um caminho ("/armacoes") ou de uma URL já completa. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

interface PageMetaInput {
  title: string;
  description: string;
  /** Caminho oficial da página (vira canonical e og:url). */
  path: string;
  image?: string | null;
  noindex?: boolean;
}

/** Metadados completos (título, descrição, canonical, Open Graph e Twitter) de uma página. */
export function buildPageMetadata({ title, description, path, image, noindex }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const img = absoluteUrl(image || DEFAULT_OG_IMAGE);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "pt_BR",
      type: "website",
      images: [{ url: img, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [img] },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Texto limpo para description (sem quebras, no máximo ~160 caracteres). */
export function trimDescription(text: string | null | undefined, max = 158): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** Loja física: aparece no Google como ótica local. */
export function opticianJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Optician", "LocalBusiness"],
    "@id": `${SITE_URL}/#loja`,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    description:
      "Ótica em Araçatuba-SP com armações em acetato e titânio, lentes de grau com laboratório próprio e montagem expressa em até 1 hora.",
    url: SITE_URL,
    logo: absoluteUrl(BUSINESS.logo),
    image: absoluteUrl(STORE_PHOTO),
    telephone: BUSINESS.phone,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.street,
      addressLocality: BUSINESS.city,
      addressRegion: BUSINESS.state,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.country,
    },
    areaServed: [{ "@type": "City", name: "Araçatuba" }, { "@type": "Country", name: "Brasil" }],
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:30", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "13:00" },
    ],
    contactPoint: [
      { "@type": "ContactPoint", telephone: BUSINESS.whatsapp, contactType: "customer service", availableLanguage: "pt-BR" },
    ],
    sameAs: [BUSINESS.instagram, BUSINESS.facebook],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#site`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: "pt-BR",
    publisher: { "@id": `${SITE_URL}/#loja` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/armacoes?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** Produto (armação): habilita preço e disponibilidade nos resultados do Google. */
export function productJsonLd(product: Product, path: string) {
  const images = (product.images ?? [])
    .map((i) => i.url)
    .filter(Boolean)
    .map((u) => absoluteUrl(u));
  const variants = product.variants ?? [];
  const inStock =
    variants.length === 0 ? true : variants.some((v: any) => v.is_available !== false && (v.stock_quantity ?? 1) > 0);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: trimDescription(product.description, 300) || `Armação ${product.name} na Ótica Ventara em Araçatuba-SP.`,
    sku: product.sku || product.id,
    image: images.length > 0 ? images : [absoluteUrl(STORE_PHOTO)],
    brand: { "@type": "Brand", name: product.brand?.name || "Ventara" },
    ...(product.category?.name ? { category: product.category.name } : {}),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(path),
      priceCurrency: "BRL",
      price: (product.price_in_cents / 100).toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}/#loja` },
    },
  };
}

/** Serializa JSON-LD com segurança para <script> (evita "</script>" dentro do texto). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
