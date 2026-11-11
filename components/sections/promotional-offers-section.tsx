"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { PromotionalShowcaseSettings, PromoProductItem, Product } from "@/types/ecommerce";
import { DEFAULT_PROMOTIONAL_SHOWCASE } from "@/lib/site-settings-constants";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { useSiteSettings } from "../providers/site-settings-provider";
import { ProductCard } from "../catalog/product-card";
import { PromoSplitCard, PromoSplitCardItem } from "./promo-split-card";
import { formatProductPricing, FormattedProductPricing } from "@/lib/pricing";

const INITIAL_LIMIT = 8;

interface PromotionalOffersSectionProps {
  products?: Product[];
  onAddToCart?: (product: Product) => void;
  cartIds?: string[];
}

interface ResolvedPromoItem extends PromoSplitCardItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  tag?: string;
  pricing: FormattedProductPricing;
  image?: string;
  images?: { url: string; alt_text?: string | null }[];
  imageFit?: "cover" | "contain";
  colorName?: string;
  colorHex?: string;
  extraColorsCount: number;
  description?: string | null;
  focalY?: number;
  product: Product;
}

/**
 * Resolução resiliente de slug para garantir link para o produto correto.
 */
function resolveProductSlug(item: PromoProductItem): string {
  if (item.slug && item.slug.trim()) {
    const rawSlug = item.slug.trim();
    if (rawSlug === "ventara-horizonte") return "ventara-horizonte-sport";

    const directMatch = DEFAULT_CATALOG.find((p) => p.slug === rawSlug || p.id === rawSlug);
    if (directMatch) return directMatch.slug;

    return rawSlug;
  }

  if (item.name && item.name.trim()) {
    const cleanName = item.name.toLowerCase().trim();
    const exactNameMatch = DEFAULT_CATALOG.find(
      (p) => p.name.toLowerCase().trim() === cleanName
    );
    if (exactNameMatch) return exactNameMatch.slug;

    const partialMatch = DEFAULT_CATALOG.find((p) => {
      const pName = p.name.toLowerCase().trim();
      return cleanName.includes(pName) || pName.includes(cleanName);
    });
    if (partialMatch) return partialMatch.slug;
  }

  return item.slug?.trim() || "";
}

export function PromotionalOffersSection({
  products = [],
  onAddToCart = () => {},
  cartIds = [],
}: PromotionalOffersSectionProps) {
  const { cleanWhatsAppNumber } = useSiteSettings();
  const [promoSettings, setPromoSettings] =
    useState<PromotionalShowcaseSettings>(DEFAULT_PROMOTIONAL_SHOWCASE);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.promotional_showcase) {
            setPromoSettings((prev) => ({
              ...prev,
              ...data.promotional_showcase,
              items:
                data.promotional_showcase.items &&
                Array.isArray(data.promotional_showcase.items) &&
                data.promotional_showcase.items.length > 0
                  ? data.promotional_showcase.items
                  : prev.items,
            }));
          }
        }
      } catch {
        // Fallback transparente para DEFAULT_PROMOTIONAL_SHOWCASE
      }
    }
    loadSettings();
  }, []);

  // Resolução de preços dinâmicos a partir da fonte única de dados com desduplicação
  const resolvedItems: ResolvedPromoItem[] = useMemo(() => {
    const resolved: ResolvedPromoItem[] = [];
    const seenSlugsOrIds = new Set<string>();

    for (const item of promoSettings.items) {
      const targetSlug = resolveProductSlug(item);
      const matched =
        products.find(
          (p) =>
            (targetSlug && p.slug === targetSlug) ||
            p.id === item.id ||
            (item.name && p.name.toLowerCase().trim() === item.name.toLowerCase().trim())
        ) ||
        DEFAULT_CATALOG.find(
          (p) =>
            (targetSlug && p.slug === targetSlug) ||
            (item.name && p.name.toLowerCase().trim() === item.name.toLowerCase().trim())
        );

      if (matched) {
        const uniqueKey = matched.slug || matched.id;
        if (seenSlugsOrIds.has(uniqueKey)) continue;
        seenSlugsOrIds.add(uniqueKey);

        const pricing = formatProductPricing(matched);
        const primaryImg =
          matched.images?.find((i) => i.is_primary)?.url ||
          matched.images?.[0]?.url ||
          item.image;
        const variants = matched.variants || [];
        const firstVariant = variants[0];

        const productForCard: Product = {
          ...matched,
          images:
            matched.images && matched.images.length > 0
              ? matched.images
              : primaryImg
              ? [
                  {
                    id: `${matched.id}-primary`,
                    product_id: matched.id,
                    url: primaryImg,
                    alt_text: matched.name,
                    is_primary: true,
                    sort_order: 0,
                    created_at: new Date().toISOString(),
                  },
                ]
              : [],
        };

        resolved.push({
          id: matched.id,
          name: matched.name,
          slug: matched.slug,
          category:
            matched.gender === "Infantil"
              ? "Grau Infantil"
              : matched.frame_type === "Solar"
              ? "Óculos de Sol"
              : "Armação de Grau",
          tag: item.tag || (pricing.hasDiscount ? "Oferta" : "Destaque"),
          pricing,
          image: primaryImg,
          images:
            matched.images && matched.images.length > 0
              ? matched.images
              : primaryImg
              ? [{ url: primaryImg, alt_text: matched.name }]
              : [],
          imageFit: item.imageFit || "cover",
          colorName: firstVariant?.color_name || item.colorName || "Padrão",
          colorHex: firstVariant?.color_hex || item.colorHex || "#1e293b",
          extraColorsCount: Math.max(0, variants.length - 1),
          description: matched.description || item.description,
          focalY: item.focalY,
          product: productForCard,
        });
      }
    }
    return resolved;
  }, [promoSettings.items, products]);

  if (!promoSettings.isEnabled || resolvedItems.length === 0) {
    return null;
  }

  // Cálculo dinâmico do maior desconto real exibido (evita contradição entre título e cards)
  const maxDiscountDisplayed = Math.max(
    ...resolvedItems.map((it) => it.pricing.discountPercent),
    0
  );

  const displayedPillText =
    maxDiscountDisplayed > 0
      ? `ATÉ ${maxDiscountDisplayed}% OFF · CURADORIA VENTARA`
      : promoSettings.pillText || "CURADORIA EXCLUSIVA";

  const displayedTitle =
    maxDiscountDisplayed > 0
      ? promoSettings.title?.includes("Até")
        ? promoSettings.title.replace(/Até\s+\d+%\s*OFF/i, `Até ${maxDiscountDisplayed}% OFF`)
        : `Até ${maxDiscountDisplayed}% OFF em modelos selecionados`
      : promoSettings.title || "Modelos Selecionados em Destaque";

  const getWhatsAppBuyUrl = (item: ResolvedPromoItem) => {
    const discountText = item.pricing.hasDiscount ? ` com ${item.pricing.discountBadgeText}` : "";
    const priceText = item.pricing.hasDiscount
      ? `(de ${item.pricing.originalPriceFormatted} por ${item.pricing.currentPriceFormatted})`
      : `(${item.pricing.currentPriceFormatted})`;
    const text = encodeURIComponent(
      `Olá! Vi o modelo "${item.name}"${discountText} ${priceText} na vitrine de ofertas da Óticas Ventara e gostaria de garantir o meu!`
    );
    return `https://wa.me/${cleanWhatsAppNumber || "5518996155748"}?text=${text}`;
  };

  const displayedItems = isExpanded
    ? resolvedItems
    : resolvedItems.slice(0, INITIAL_LIMIT);

  const isSplitLayout = (promoSettings.cardLayout ?? "split") !== "fullbleed";

  return (
    <section
      aria-label="Modelos Selecionados"
      className="py-14 sm:py-20 bg-white border-y border-slate-200/80 relative overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        {/* Cabeçalho Limpo */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-amber-500" />
              <span>{displayedPillText}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {displayedTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1.5 leading-relaxed">
              {promoSettings.subtitle ||
                "Pares icônicos com design autoral, acabamento nobre, lentes certificadas e parcelamento sem juros."}
            </p>
          </div>

          <Link
            href="/armacoes"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors self-start md:self-auto cursor-pointer"
          >
            <span>{promoSettings.ctaText || "Ver todas as ofertas"}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grade de Produtos Promocionais */}
        <div className="relative">
          {isSplitLayout ? (
            /* Novo Layout Split (Padrão): Imagem no Topo, Texto Embaixo, Selo Verde OFF */
            <div className="flex sm:grid overflow-x-auto sm:overflow-visible snap-x snap-mandatory gap-3.5 sm:gap-6 pb-4 sm:pb-0 sm:grid-cols-2 lg:grid-cols-4 no-scrollbar">
              {displayedItems.map((item, idx) => (
                <PromoSplitCard
                  key={item.product.id}
                  item={item}
                  showDiscountBadge={promoSettings.showDiscountBadge !== false}
                  onAddToCart={onAddToCart}
                  isInCart={cartIds.includes(item.product.id)}
                  priority={idx === 0}
                  whatsAppUrl={getWhatsAppBuyUrl(item)}
                />
              ))}
            </div>
          ) : (
            /* Fallback Configurável no Admin: Imagem de Fundo (Fullbleed) */
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {displayedItems.map((item) => (
                <ProductCard
                  key={item.product.id}
                  product={item.product}
                  onAddToCart={onAddToCart}
                  isInCart={cartIds.includes(item.product.id)}
                  hrefPrefix="/produto"
                  as="article"
                />
              ))}
            </div>
          )}

          {/* Botão Ver Mais / Ver Menos */}
          {resolvedItems.length > INITIAL_LIMIT && (
            <div className="text-center mt-8 sm:mt-12">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-colors cursor-pointer"
              >
                <span>
                  {isExpanded
                    ? "Ver menos modelos"
                    : `Ver todos os ${resolvedItems.length} modelos em destaque`}
                </span>
                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
