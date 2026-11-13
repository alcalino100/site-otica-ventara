"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { Product } from "@/types/ecommerce";
import { FrameArt } from "./frame-art";
import { PricePromo } from "@/components/ui/price-promo";
import { buildProductWhatsAppUrl } from "@/lib/whatsapp";
import { formatProductPricing } from "@/lib/pricing";
import { focusObjectPosition } from "@/lib/image-focus";

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  isInCart?: boolean;
  hrefPrefix?: string;
  as?: "article" | "div";
}

export function ProductCard({
  product,
  onAddToCart = () => {},
  isInCart = false,
  hrefPrefix = "/produto",
  as = "div",
}: ProductCardProps) {
  const Component = as;
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart(product);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.url ||
    product.images?.[0]?.url;

  const validImages = useMemo(() => {
    const list: string[] = [];
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        if (img?.url && !list.includes(img.url)) list.push(img.url);
      });
    }
    if (list.length === 0 && primaryImage) list.push(primaryImage);
    return list;
  }, [product.images, primaryImage]);

  const hasMultipleImages = validImages.length > 1;
  const currentImageUrl = validImages[0] || primaryImage;
  const customPosition = focusObjectPosition(product.images?.find((img) => img.url === currentImageUrl));

  const pricing = formatProductPricing(product);

  const categoryLabel =
    product.gender === "Infantil"
      ? product.frame_type === "Solar"
        ? "Solar Infantil"
        : "Grau Infantil"
      : product.frame_type === "Solar"
      ? "Óculos de Sol"
      : "Armação de Grau";

  // Amostras derivadas exclusivamente de variantes cadastradas
  const swatches =
    product.variants && product.variants.length > 0
      ? product.variants.map((v) => ({
          name: v.color_name,
          hex: v.color_hex || "#1e293b",
        }))
      : [];

  const whatsappUrl = buildProductWhatsAppUrl(product.name, product.slug, categoryLabel);

  return (
    <Component
      className="product group relative w-full min-w-0 max-w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 hover:border-amber-400/70 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-end bg-[#040d1a] aspect-[3/4.8] sm:aspect-[3/5.2] min-h-[340px] sm:min-h-[480px]"
    >
      {/* 1. Camada da Foto Sendo o Bloco Inteiro */}
      <Link
        href={`${hrefPrefix}/${product.slug}`}
        className="absolute inset-0 z-0 block overflow-hidden"
        aria-label={`Ver detalhes da armação ${product.name}`}
      >
        {currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            style={customPosition ? { objectPosition: customPosition } : undefined}
            className="w-full h-full object-cover object-[center_25%] group-hover-zoom-desktop transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 pb-24 sm:p-8 sm:pb-36 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 group-hover-zoom-desktop transition-transform duration-700 ease-out">
            <div className="w-full max-w-[180px] sm:max-w-[220px]">
              <FrameArt
                solar={product.frame_type === "Solar"}
                amber={
                  product.slug.includes("aurora") ||
                  (product.slug.includes("solar") &&
                    !product.slug.includes("kids"))
                }
                round={product.frame_shape === "Redondo"}
                customColor={
                  product.gender === "Infantil"
                    ? product.frame_type === "Solar"
                      ? "#0284c7"
                      : "#2563eb"
                    : undefined
                }
              />
            </div>
          </div>
        )}
      </Link>

      {/* 1.2. Indicador Numérico de Fotos (sem setas invasivas sobre a armação) */}
      {hasMultipleImages && (
        <div
          data-testid="card-gallery-counter"
          className="pointer-events-none absolute top-2.5 right-2.5 sm:top-4 sm:right-4 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-mono tracking-wider z-20 border border-white/15"
        >
          1/{validImages.length}
        </div>
      )}

      {/* 2. Badge Flutuante no Topo */}
      <span className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 text-[8.5px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full bg-[#06111f]/85 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-xs z-20 pointer-events-none whitespace-nowrap">
        {categoryLabel}
      </span>

      {/* 3. Degradê Cobrindo de Baixo para Cima */}
      <div className="absolute inset-x-0 bottom-0 h-[48%] sm:h-[42%] bg-gradient-to-t from-[#02070d] via-[#02070d]/92 via-50% to-transparent pointer-events-none z-10" />

      {/* 4. Bloco de Informações Sobre o Degradê */}
      <div className="relative z-20 p-3 sm:p-5 flex flex-col gap-1.5 sm:gap-2.5 pointer-events-none">
        {/* Swatches de cor: só exibe se houver 2 ou mais variações cadastradas */}
        {product.variants && product.variants.length >= 2 && (
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto" title="Opções de cor disponíveis">
            <div className="flex items-center -space-x-1">
              {swatches.slice(0, 4).map((s, idx) => (
                <span
                  key={idx}
                  className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-white/40 shadow-xs inline-block"
                  style={{ backgroundColor: s.hex }}
                  title={s.name}
                />
              ))}
            </div>
            <span className="text-[9.5px] sm:text-[11px] text-amber-300 font-medium">
              {product.variants.length} cores
            </span>
          </div>
        )}

        {/* Nome da Armação e Detalhes */}
        <div className="pointer-events-auto">
          <Link
            href={`${hrefPrefix}/${product.slug}`}
            className="hover:text-amber-300 transition-colors block"
          >
            <h3 className="text-sm sm:text-xl font-bold text-white tracking-tight leading-snug line-clamp-1 drop-shadow-sm">
              {product.name}
            </h3>
          </Link>
          <p className="text-[10px] sm:text-xs text-slate-300 font-medium line-clamp-1 mt-0.5">
            {product.description ||
              `${product.frame_material || "Acetato Premium"} · ${
                product.frame_shape ? `Aro ${product.frame_shape}` : "Clássico"
              }`}
          </p>
        </div>

        {/* Preço e Botão de Adicionar à Sacola */}
        <div className="pt-1.5 sm:pt-2 border-t border-white/10 flex items-start justify-between gap-1 sm:gap-2">
          <PricePromo
            currentPrice={pricing.currentPriceInReais}
            originalPrice={pricing.originalPriceInReais}
            showDiscountBadge={true}
            installmentText={`ou até 10x de ${pricing.installmentFormatted} sem juros`}
            theme="dark"
            size="md"
            className="min-w-0 pointer-events-none"
          />

          <button
            type="button"
            className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer pointer-events-auto ${
              justAdded
                ? "bg-emerald-500 border-emerald-400 text-slate-950 scale-105"
                : isInCart
                ? "bg-amber-400 border-amber-300 text-slate-950"
                : "bg-white/10 hover:bg-amber-400 hover:text-slate-950 border-white/20 text-white"
            }`}
            aria-label={`Adicionar ${product.name} à seleção`}
            onClick={handleAdd}
            title="Adicionar à seleção"
          >
            {justAdded ? (
              <Check size={14} className="stroke-[3] sm:w-4 sm:h-4" />
            ) : (
              <ShoppingBag size={13} className="sm:w-4 sm:h-4" />
            )}
          </button>
        </div>

        {/* Ações Rápidas: Ver Detalhes e WhatsApp */}
        <div className="grid grid-cols-2 gap-1 sm:gap-2 pt-0.5 pointer-events-auto">
          <Link
            href={`${hrefPrefix}/${product.slug}`}
            className="text-center py-1 sm:py-2 px-1 sm:px-2.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white text-[9px] sm:text-[11px] font-semibold transition-colors truncate border border-white/15 backdrop-blur-xs flex items-center justify-center"
          >
            Ver detalhes
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-0.5 sm:gap-1 py-1 sm:py-2 px-1 sm:px-2.5 rounded-lg sm:rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[9px] sm:text-[11px] font-semibold transition-colors truncate border border-emerald-500/30 backdrop-blur-xs"
            title={`Falar sobre ${product.name} no WhatsApp`}
          >
            <span className="truncate">WhatsApp</span>
          </a>
        </div>
      </div>
    </Component>
  );
}
