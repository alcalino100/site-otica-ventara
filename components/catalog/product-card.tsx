"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { Plus, ShoppingBag, Check, ArrowRight, MessageSquare, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/ecommerce";
import { FrameArt } from "./frame-art";
import { PricePromo } from "@/components/ui/price-promo";
import { buildProductWhatsAppUrl } from "@/lib/whatsapp";
import { formatProductPricing } from "@/lib/pricing";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isInCart?: boolean;
  hrefPrefix?: string;
}

export function ProductCard({
  product,
  onSelect,
  onAddToCart,
  isInCart = false,
  hrefPrefix = "/produto",
}: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onAddToCart(product);
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

  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isSwipingRef = useRef(false);
  const blockClickUntilRef = useRef(0);

  const hasMultipleImages = validImages.length > 1;
  const currentImageUrl = validImages[currentImgIdx] || primaryImage;

  const handlePrev = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!hasMultipleImages) return;
    setCurrentImgIdx((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  };

  const handleNext = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!hasMultipleImages) return;
    setCurrentImgIdx((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isSwipingRef.current = false;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStartPos.current.x;
    const dy = e.touches[0].clientY - touchStartPos.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 12) {
      isSwipingRef.current = true;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const changedTouch = e.changedTouches[0];
    const dx = changedTouch.clientX - touchStartPos.current.x;
    const dy = changedTouch.clientY - touchStartPos.current.y;

    if (isSwipingRef.current && Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      blockClickUntilRef.current = Date.now() + 350;
      if (dx < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartPos.current = null;
    isSwipingRef.current = false;
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (Date.now() < blockClickUntilRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

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
    <div
      className="product group relative rounded-3xl overflow-hidden border border-slate-200/80 hover:border-amber-400/70 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-end bg-[#040d1a] aspect-[3/4.2] sm:aspect-[3/4.2] min-h-[350px] sm:min-h-[460px] touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: "pan-y" }}
    >
      {/* 1. Camada da Foto Sendo o Bloco Inteiro */}
      <Link
        href={`${hrefPrefix}/${product.slug}`}
        onClick={handleLinkClick}
        className="absolute inset-0 z-0 block overflow-hidden"
        aria-label={`Ver detalhes da armação ${product.name}`}
      >
        {currentImageUrl ? (
          <img
            src={currentImageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center group-hover-zoom-desktop transition-transform duration-700 ease-out"
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

      {/* 1.1. Setas de Navegação: Ocultas no mobile (troca via swipe sem cobrir o produto), visíveis apenas no desktop ao passar o mouse */}
      {hasMultipleImages && (
        <div className="hidden md:flex pointer-events-none absolute inset-x-0 top-1/3 -translate-y-1/2 z-20 items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            data-testid="card-gallery-prev"
            aria-label={`Foto anterior de ${product.name}`}
            className="pointer-events-auto min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/85 active:scale-95 text-white backdrop-blur-md transition-all border border-white/20 shadow-md touch-manipulation cursor-pointer"
            onClick={handlePrev}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={handlePrev}
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <button
            type="button"
            data-testid="card-gallery-next"
            aria-label={`Próxima foto de ${product.name}`}
            className="pointer-events-auto min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/85 active:scale-95 text-white backdrop-blur-md transition-all border border-white/20 shadow-md touch-manipulation cursor-pointer"
            onClick={handleNext}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={handleNext}
          >
            <ChevronRight size={18} className="text-white" />
          </button>
        </div>
      )}

      {/* 1.2. Indicador Numérico de Fotos */}
      {hasMultipleImages && (
        <div
          data-testid="card-gallery-counter"
          className="pointer-events-none absolute top-3 right-3 sm:top-4 sm:right-4 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono tracking-wider z-20 border border-white/15"
        >
          {currentImgIdx + 1}/{validImages.length}
        </div>
      )}

      {/* 2. Badge Flutuante no Topo (Elegante e Inset com Margem Segura) */}
      <span className="absolute top-3 left-3 sm:top-4 sm:left-4 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#06111f]/85 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-xs z-20 pointer-events-none whitespace-nowrap">
        {categoryLabel}
      </span>

      {/* 3. Degradê Cobrindo de Baixo para Cima (~25% a 35%) */}
      <div className="absolute inset-x-0 bottom-0 h-[62%] sm:h-[55%] bg-gradient-to-t from-[#02070d] via-[#02070d]/92 via-50% to-transparent pointer-events-none z-10" />

      {/* 4. Bloco de Informações Sobre o Degradê */}
      <div className="relative z-20 p-3.5 sm:p-5 flex flex-col gap-1.5 sm:gap-2.5">
        {/* Swatches de cor: só exibe se houver 2 ou mais variações cadastradas */}
        {product.variants && product.variants.length >= 2 && (
          <div className="flex items-center gap-2" title="Opções de cor disponíveis">
            <div className="flex items-center -space-x-1">
              {swatches.slice(0, 4).map((s, idx) => (
                <span
                  key={idx}
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-white/40 shadow-xs inline-block"
                  style={{ backgroundColor: s.hex }}
                  title={s.name}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] text-amber-300 font-medium">
              {product.variants.length} cores
            </span>
          </div>
        )}

        {/* Nome da Armação e Detalhes */}
        <div>
          <Link
            href={`${hrefPrefix}/${product.slug}`}
            className="hover:text-amber-300 transition-colors block"
          >
            <h3 className="text-base sm:text-xl font-bold text-white tracking-tight leading-snug line-clamp-1 drop-shadow-sm">
              {product.name}
            </h3>
          </Link>
          <p className="text-[11px] sm:text-xs text-slate-300 font-medium line-clamp-1 mt-0.5">
            {product.description ||
              `${product.frame_material || "Acetato Premium"} · ${
                product.frame_shape ? `Aro ${product.frame_shape}` : "Clássico"
              }`}
          </p>
        </div>

        {/* Preço e Botão de Adicionar à Sacola */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1.5 sm:gap-2">
          <PricePromo
            currentPrice={pricing.currentPriceInReais}
            originalPrice={pricing.originalPriceInReais}
            showDiscountBadge={true}
            installmentText={`ou até 10x de ${pricing.installmentFormatted} sem juros`}
            theme="dark"
            size="md"
            className="min-w-0"
          />

          <button
            type="button"
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
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
              <Check size={16} className="stroke-[3]" />
            ) : (
              <ShoppingBag size={15} />
            )}
          </button>
        </div>

        {/* Ações Rápidas: Ver Detalhes e WhatsApp */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-0.5">
          <Link
            href={`${hrefPrefix}/${product.slug}`}
            className="text-center py-1.5 sm:py-2 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] sm:text-[11px] font-semibold transition-colors truncate border border-white/15 backdrop-blur-xs"
          >
            Ver detalhes
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 py-1.5 sm:py-2 px-2 sm:px-2.5 rounded-lg sm:rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] sm:text-[11px] font-semibold transition-colors truncate border border-emerald-500/30 backdrop-blur-xs"
            title={`Falar sobre ${product.name} no WhatsApp`}
          >
            <MessageSquare size={12} className="text-emerald-400 shrink-0" />
            <span className="truncate">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
