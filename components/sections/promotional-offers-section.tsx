"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Sparkles, Tag, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { PromotionalShowcaseSettings, PromoProductItem, Product } from "@/types/ecommerce";
import { DEFAULT_PROMOTIONAL_SHOWCASE } from "@/lib/site-settings-constants";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { useSiteSettings } from "../providers/site-settings-provider";
import { FrameArt } from "../catalog/frame-art";
import { CardImageGallery, GalleryImage } from "../catalog/card-image-gallery";
import { formatProductPricing, FormattedProductPricing } from "@/lib/pricing";

const INITIAL_LIMIT = 8;

interface PromotionalOffersSectionProps {
  products?: Product[];
}

interface ResolvedPromoItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  tag?: string;
  pricing: FormattedProductPricing;
  image?: string;
  images?: GalleryImage[];
  imageFit?: "cover" | "contain";
  colorName?: string;
  colorHex?: string;
  extraColorsCount: number;
  description?: string | null;
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

export function PromotionalOffersSection({ products = [] }: PromotionalOffersSectionProps) {
  const { cleanWhatsAppNumber } = useSiteSettings();
  const [promoSettings, setPromoSettings] =
    useState<PromotionalShowcaseSettings>(DEFAULT_PROMOTIONAL_SHOWCASE);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
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
              ? [{ url: primaryImg, alt_text: matched.name, is_primary: true }]
              : [],
          imageFit: item.imageFit || "cover",
          colorName: firstVariant?.color_name || item.colorName || "Padrão",
          colorHex: firstVariant?.color_hex || item.colorHex || "#1e293b",
          extraColorsCount: Math.max(0, variants.length - 1),
          description: matched.description || item.description,
        });
      }
    }
    return resolved;
  }, [promoSettings.items, products]);

  if (!promoSettings.isEnabled || resolvedItems.length === 0) {
    return null;
  }

  // Cálculo dinâmico do maior desconto real exibido (evita contradição entre banner e cards)
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
      `Olá! Vi o modelo "${item.name}"${discountText} ${priceText} no site da Óticas Ventara e gostaria de garantir o meu!`
    );
    return `https://wa.me/${cleanWhatsAppNumber || "5518996155748"}?text=${text}`;
  };

  const displayedItems = isExpanded
    ? resolvedItems
    : resolvedItems.slice(0, INITIAL_LIMIT);

  return (
    <section
      aria-label="Modelos Selecionados"
      className="py-14 sm:py-20 bg-white border-y border-slate-200/80 relative overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        {/* Cabeçalho Limpo Estilo Fundo Branco */}
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

          <a
            href="#armacoes"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors self-start md:self-auto cursor-pointer"
          >
            <span>{promoSettings.ctaText || "Ver todas as armações"}</span>
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Grade de Produtos Promocionais (2 colunas no mobile, 4 no desktop) */}
        <div className="relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {displayedItems.map((item) => {
              const hasError = imgErrors[item.id];
              const hasRealImage = Boolean(item.image && item.image.trim() !== "" && !hasError);

              return (
                <article
                  key={item.id}
                  className="group bg-slate-50/70 hover:bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/90 hover:border-amber-400/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Selos de Desconto e Categoria (Sem duplicação de 'Oferta' e '-X% OFF') */}
                    <div className="flex items-center justify-between gap-1.5 mb-2 min-h-[22px]">
                      {item.pricing.hasDiscount && item.pricing.discountBadgeText ? (
                        <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] sm:text-[10px] tracking-wide shadow-xs whitespace-nowrap shrink-0">
                          <Tag size={10} />
                          <span>{item.pricing.discountBadgeText}</span>
                        </span>
                      ) : item.tag && item.tag.toLowerCase() !== "oferta" ? (
                        <span className="text-[9px] font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-full truncate whitespace-nowrap shrink-0">
                          {item.tag}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-bold text-[9px] tracking-wide whitespace-nowrap shrink-0">
                          <Sparkles size={9} className="text-amber-500" />
                          <span>OFERTA</span>
                        </span>
                      )}

                      <span
                        className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full truncate text-right ml-auto min-w-0"
                        title={item.category}
                      >
                        {item.category}
                      </span>
                    </div>

                    {/* Galeria Tátil com Zona Morta Independente e Zero Zoom no Mobile */}
                    <div className="mb-3">
                      <CardImageGallery
                        images={item.images}
                        fallbackUrl={item.image}
                        productName={item.name}
                        productHref={`/produto/${item.slug}`}
                        aspectRatio="aspect-[4/3]"
                        imageFit={item.imageFit || "cover"}
                        fallbackArt={
                          <div className="w-full max-w-[140px]">
                            <FrameArt
                              solar={item.category.toLowerCase().includes("solar")}
                              round={item.name.toLowerCase().includes("redondo") || item.name.toLowerCase().includes("onça")}
                              amber={item.colorName?.toLowerCase().includes("âmbar")}
                            />
                          </div>
                        }
                      />
                    </div>

                    {/* Metadados e Nome */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                        VENTARA · {item.category.toUpperCase()}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 hidden sm:block">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Variação de Cores: apenas se houver 2 ou mais variantes */}
                    {item.extraColorsCount > 0 && (
                      <div className="flex items-center gap-1.5 my-2.5 min-h-[18px]">
                        <span
                          className="w-3 h-3 rounded-full border border-slate-300 shrink-0 shadow-xs"
                          style={{ backgroundColor: item.colorHex || "#1e293b" }}
                          title={item.colorName || "Cor principal"}
                        />
                        <span className="text-[10px] text-slate-500 font-medium truncate">
                          {item.colorName || "Cor padrão"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          +{item.extraColorsCount}
                        </span>
                      </div>
                    )}

                    {/* Seção de Preços (Fonte Única e Matemática Pura) */}
                    <div className="pt-2 border-t border-slate-200/70 mb-3">
                      <div className="flex items-baseline gap-2">
                        {item.pricing.hasDiscount && item.pricing.originalPriceFormatted && (
                          <span className="text-[11px] text-slate-400 line-through font-mono">
                            {item.pricing.originalPriceFormatted}
                          </span>
                        )}
                        <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                          {item.pricing.isStartingFrom ? item.pricing.startingFromFormatted : item.pricing.currentPriceFormatted}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                        10x de {item.pricing.installmentFormatted} sem juros
                      </p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <Link
                      href={`/produto/${item.slug}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-[11px] sm:text-xs tracking-wide shadow-sm transition-all cursor-pointer"
                    >
                      <span>Ver modelo</span>
                      <ArrowRight size={13} />
                    </Link>

                    <a
                      href={getWhatsAppBuyUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-[10px] sm:text-[11px] tracking-wide shadow-xs transition-all cursor-pointer"
                    >
                      <span>Dúvidas no WhatsApp</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

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
