"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { ShoppingBag, Check, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { Product } from "@/types/ecommerce";
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
  priority = false,
  whatsAppUrl,
}: PromoSplitCardProps) {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onAddToCart(item.product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  // Imagens válidas para galeria e navegação
  const validImages = useMemo(() => {
    const list: string[] = [];
    if (item.images && item.images.length > 0) {
      item.images.forEach((img) => {
        if (img?.url && !list.includes(img.url)) list.push(img.url);
      });
    }
    if (list.length === 0 && item.image) {
      list.push(item.image);
    }
    return list;
  }, [item.images, item.image]);

  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isSwipingRef = useRef(false);
  const blockClickUntilRef = useRef(0);

  const hasMultipleImages = validImages.length > 1;
  const currentImageUrl = validImages[currentImgIdx] || item.image;

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

  const focalPositionY = item.focalY ? `${item.focalY}%` : "68%";

  return (
    <article
      data-testid="promo-split-card"
      className="@container group bg-[#040d1a] border border-slate-800 hover:border-amber-400/70 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between w-[clamp(260px,78vw,320px)] shrink-0 snap-start sm:w-auto sm:shrink touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: "pan-y" }}
    >
      {/* BLOCO A: IMAGEM SUPERIOR COM ASPECT RATIO FIXO E ZERO ELEMENTOS SOBRE A ARMAÇÃO */}
      <div className="relative w-full aspect-[4/3] bg-slate-900 overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
        <Link
          href={`/produto/${item.slug}`}
          onClick={handleLinkClick}
          className="block w-full h-full relative overflow-hidden"
          aria-label={`Ver detalhes da armação ${item.name}`}
        >
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt={item.name}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              style={{ objectPosition: `center ${focalPositionY}` }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500 text-xs font-medium">
              Sem foto disponível
            </div>
          )}
        </Link>

        {/* Selo Verde de Desconto no Canto Superior Esquerdo (somente se houver desconto real) */}
        {showDiscountBadge && item.pricing.hasDiscount && (
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10 pointer-events-none">
            <DiscountBadge percent={item.pricing.discountPercent} />
          </div>
        )}

        {/* Contador de Fotos no Canto Superior Direito */}
        {hasMultipleImages && (
          <div
            data-testid="promo-gallery-counter"
            className="pointer-events-none absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-mono tracking-wider z-10 border border-white/15 shadow-xs"
          >
            {currentImgIdx + 1}/{validImages.length}
          </div>
        )}

        {/* Setas de navegação desktop nas laterais do bloco de imagem (sem cobrir a armação) */}
        {hasMultipleImages && (
          <div className="hidden md:flex pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 z-10 items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              aria-label={`Foto anterior de ${item.name}`}
              className="pointer-events-auto min-w-[36px] min-h-[36px] w-9 h-9 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/90 active:scale-95 text-white backdrop-blur-md transition-all border border-white/20 shadow-md cursor-pointer"
              onClick={handlePrev}
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              type="button"
              aria-label={`Próxima foto de ${item.name}`}
              className="pointer-events-auto min-w-[36px] min-h-[36px] w-9 h-9 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/90 active:scale-95 text-white backdrop-blur-md transition-all border border-white/20 shadow-md cursor-pointer"
              onClick={handleNext}
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        )}
      </div>

      {/* BLOCO C: TEXTO E CONTROLES SOBRE O FUNDO ESCURO */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3 bg-[#040d1a]">
        <div className="space-y-1.5">
          {/* Categoria em caixa-alta */}
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-wider block truncate">
            VENTARA · {item.category.toUpperCase()}
          </span>

          {/* Nome da armação em branco */}
          <Link
            href={`/produto/${item.slug}`}
            onClick={handleLinkClick}
            className="block group-hover:text-amber-300 transition-colors"
          >
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug line-clamp-1">
              {item.name}
            </h3>
          </Link>

          {/* Especificação com line-clamp-2 e altura uniforme para manter alinhamento */}
          <p className="text-xs sm:text-[13px] text-slate-300 font-normal line-clamp-2 min-h-[36px] sm:min-h-[40px] leading-relaxed">
            {item.description || "Acetato Premium · Aro anatômico com acabamento nobre."}
          </p>
        </div>

        {/* Bloco de Preços Alinhados + Botão da Sacola */}
        <div className="pt-2.5 border-t border-slate-800 flex items-start justify-between gap-2">
          <div className="min-w-0">
            {item.pricing.hasDiscount && item.pricing.originalPriceFormatted && (
              <span
                data-testid="promo-original-price"
                className="text-xs text-slate-400 line-through font-mono block leading-tight"
              >
                {item.pricing.originalPriceFormatted}
              </span>
            )}
            <div
              data-testid="promo-current-price"
              className="text-lg sm:text-xl font-black text-amber-400 font-mono tracking-tight leading-tight mt-0.5"
            >
              {item.pricing.currentPriceFormatted}
            </div>
            <span className="text-[11px] sm:text-xs text-slate-300 block mt-1 leading-snug">
              ou até 10x de {item.pricing.installmentFormatted} sem juros
            </span>
          </div>

          {/* Botão de Adicionar à Sacola */}
          <button
            type="button"
            className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              justAdded
                ? "bg-emerald-500 border-emerald-400 text-slate-950 scale-105"
                : isInCart
                ? "bg-amber-400 border-amber-300 text-slate-950"
                : "bg-white/10 hover:bg-amber-400 hover:text-slate-950 border-white/20 text-white"
            }`}
            aria-label={`Adicionar ${item.name} à sacola`}
            onClick={handleAdd}
            title="Adicionar à sacola"
          >
            {justAdded ? (
              <Check size={16} className="stroke-[3]" />
            ) : (
              <ShoppingBag size={16} />
            )}
          </button>
        </div>

        {/* Ações Rápidas: Ver Detalhes e WhatsApp com Container Query e Touch Targets >= 44px */}
        <div className="grid grid-cols-1 @[220px]:grid-cols-2 gap-2 pt-1">
          <Link
            href={`/produto/${item.slug}`}
            onClick={handleLinkClick}
            className="min-h-[44px] px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wide transition-colors flex items-center justify-center border border-white/15 text-center cursor-pointer active:scale-98"
          >
            Ver detalhes
          </Link>

          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-3 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/35 text-emerald-300 font-semibold text-xs tracking-wide transition-colors flex items-center justify-center gap-1.5 border border-emerald-500/30 text-center cursor-pointer active:scale-98"
            title={`Falar sobre ${item.name} no WhatsApp`}
          >
            <MessageSquare size={14} className="text-emerald-400 shrink-0" />
            <span className="truncate">WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
}
