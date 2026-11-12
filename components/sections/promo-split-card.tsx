"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check, MessageSquare, Sparkles } from "lucide-react";
import { Product } from "@/types/ecommerce";
import { CardImageGallery } from "@/components/catalog/card-image-gallery";
import { FrameArt } from "@/components/catalog/frame-art";
import { DiscountBadge } from "@/components/ui/discount-badge";
import { FormattedProductPricing } from "@/lib/pricing";

export interface PromoSplitCardItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  tag?: string;
  pricing: FormattedProductPricing;
  image?: string;
  images?: { url: string; alt_text?: string | null }[];
  description?: string | null;
  focalY?: number;
  product: Product;
}

export interface PromoSplitCardProps {
  item: PromoSplitCardItem;
  showDiscountBadge?: boolean;
  onAddToCart?: (product: Product) => void;
  isInCart?: boolean;
  priority?: boolean;
  whatsAppUrl: string;
}

export function PromoSplitCard({
  item,
  showDiscountBadge = true,
  onAddToCart = () => {},
  isInCart = false,
  whatsAppUrl,
}: PromoSplitCardProps) {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(item.product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  // Badge da direita (Formato do Aro / Destaque / Mais Vendido / Lançamento)
  const highlightBadge =
    item.product.is_featured
      ? "Destaque"
      : item.product.gender === "Infantil"
      ? "Linha Kids"
      : item.product.slug.includes("safari")
      ? "Mais Vendido"
      : item.product.frame_shape
      ? `Aro ${item.product.frame_shape}`
      : item.tag || "Lançamento";

  const categoryLabel =
    item.product.gender === "Infantil"
      ? item.product.frame_type === "Solar"
        ? "Solar Infantil"
        : "Grau Infantil"
      : item.product.frame_type === "Solar"
      ? "Óculos de Sol"
      : "Armação de Grau";

  const descriptionText =
    item.description ||
    item.product.description ||
    `${item.product.frame_material || "Acetato Premium"} com aro ${
      item.product.frame_shape?.toLowerCase() || "moderno"
    } e encaixe anatômico confortável.`;

  // Amostras derivadas exclusivamente de variantes cadastradas
  const swatches =
    item.product.variants && item.product.variants.length > 0
      ? item.product.variants.map((v) => ({
          name: v.color_name,
          hex: v.color_hex || "#1e293b",
        }))
      : [];

  const primarySwatch = swatches[0];
  const extraColorsCount = Math.max(0, swatches.length - 1);

  return (
    <article
      data-testid="promo-split-card"
      className="product group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full w-[clamp(260px,78vw,320px)] shrink-0 snap-start sm:w-auto sm:shrink"
    >
      <div>
        {/* 1. Header do Card com Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5 min-h-[24px]">
          {showDiscountBadge && item.pricing.hasDiscount && item.pricing.discountBadgeText ? (
            <DiscountBadge percent={item.pricing.discountPercent} size="sm" />
          ) : (
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px] sm:text-[10px] tracking-wide whitespace-nowrap shrink-0">
              <Sparkles size={10} className="text-emerald-600" />
              <span>EXCLUSIVO</span>
            </span>
          )}

          <span
            className="text-[9px] sm:text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 sm:px-2.5 py-0.5 rounded-full truncate text-right ml-auto min-w-0"
            title={highlightBadge}
          >
            {highlightBadge}
          </span>
        </div>

        {/* 2. Container da Foto (Aspect Ratio 4/3 e sem setas invasivas sobre a armação) */}
        <div className="mb-3">
          <CardImageGallery
            images={item.product.images}
            fallbackUrl={item.image}
            productName={item.name}
            productHref={`/produto/${item.slug}`}
            aspectRatio="aspect-[4/3]"
            imageFit="cover"
            fallbackArt={
              <div className="w-full max-w-[140px] sm:max-w-[160px]">
                <FrameArt
                  solar={item.product.frame_type === "Solar"}
                  amber={
                    item.product.slug.includes("safari") ||
                    item.product.slug.includes("onca") ||
                    item.product.slug.includes("solar")
                  }
                  round={item.product.frame_shape === "Redondo"}
                  customColor={
                    item.product.gender === "Infantil"
                      ? item.product.frame_type === "Solar"
                        ? "#0284c7"
                        : "#2563eb"
                      : undefined
                  }
                />
              </div>
            }
          />
        </div>

        {/* 3. Metadados e Nome do Modelo */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            VENTARA · {categoryLabel.toUpperCase()}
          </span>
          <Link href={`/produto/${item.slug}`} className="block">
            <h3 className="text-xs sm:text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
              {item.name}
            </h3>
          </Link>
          <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 min-h-[16px]">
            {descriptionText}
          </p>
        </div>

        {/* 4. Variação de Cores: apenas se houver 2 ou mais variantes */}
        {swatches.length >= 2 && primarySwatch && (
          <div className="flex items-center gap-1.5 my-2.5 min-h-[18px]">
            <span
              className="w-3 h-3 rounded-full border border-slate-300 shrink-0 shadow-xs"
              style={{ backgroundColor: primarySwatch.hex }}
              title={primarySwatch.name}
            />
            <span className="text-[10px] sm:text-[11px] text-slate-600 font-medium truncate">
              {primarySwatch.name}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">
              (+{extraColorsCount})
            </span>
          </div>
        )}

        {/* 5. Preços e Parcelamento */}
        <div className="pt-2 border-t border-slate-200/70 mb-3">
          <div className="flex items-baseline gap-2">
            {item.pricing.hasDiscount && item.pricing.originalPriceFormatted && (
              <span
                data-testid="promo-original-price"
                className="text-[11px] sm:text-xs text-slate-400 line-through font-mono"
              >
                {item.pricing.originalPriceFormatted}
              </span>
            )}
            <span
              data-testid="promo-current-price"
              className="text-sm sm:text-base font-extrabold text-slate-900 font-mono"
            >
              {item.pricing.currentPriceFormatted}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
            10x de {item.pricing.installmentFormatted} sem juros
          </p>
        </div>
      </div>

      {/* 6. Ações: Comprar (Escuro) + Dúvidas no WhatsApp (Amarelo) */}
      <div className="flex flex-col gap-1.5 pt-1">
        <Link
          href={`/produto/${item.slug}`}
          onClick={handleAdd}
          className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-[11px] sm:text-xs tracking-wide shadow-sm transition-all cursor-pointer"
        >
          {justAdded ? (
            <>
              <Check size={14} className="text-emerald-400 stroke-[3]" />
              <span>Adicionado!</span>
            </>
          ) : (
            <>
              <ShoppingBag size={14} className="shrink-0" />
              <span>Comprar</span>
            </>
          )}
        </Link>

        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FFD62E] hover:bg-[#FACC15] active:scale-95 text-slate-950 font-bold text-[10px] sm:text-[11px] tracking-wide shadow-xs transition-all cursor-pointer"
          title={`Tirar dúvidas sobre ${item.name} no WhatsApp`}
        >
          <MessageSquare size={13} className="shrink-0 text-slate-950" />
          <span>Dúvidas no WhatsApp</span>
        </a>
      </div>
    </article>
  );
}
