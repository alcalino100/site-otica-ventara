"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface GalleryImage {
  id?: string;
  url: string;
  alt_text?: string | null;
  is_primary?: boolean;
}

interface CardImageGalleryProps {
  images?: GalleryImage[];
  fallbackUrl?: string | null;
  productName: string;
  productHref: string;
  aspectRatio?: string;
  imageFit?: "cover" | "contain";
  fallbackArt?: React.ReactNode;
  className?: string;
  showDots?: boolean;
}

/**
 * Galeria tátil para cards de catálogo com zona morta independente nas setas,
 * gesto swipe com touch-action: pan-y e isolamento de zoom restrito a desktop.
 */
export function CardImageGallery({
  images = [],
  fallbackUrl,
  productName,
  productHref,
  aspectRatio = "aspect-[4/3]",
  imageFit = "cover",
  fallbackArt,
  className = "",
  showDots = true,
}: CardImageGalleryProps) {
  // Constrói lista única de imagens válidas
  const validImages: GalleryImage[] = React.useMemo(() => {
    const list: GalleryImage[] = [];
    if (images && images.length > 0) {
      images.forEach((img) => {
        if (img?.url && !list.some((existing) => existing.url === img.url)) {
          list.push(img);
        }
      });
    }
    if (list.length === 0 && fallbackUrl) {
      list.push({ url: fallbackUrl, alt_text: productName, is_primary: true });
    }
    return list;
  }, [images, fallbackUrl, productName]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Gestos de toque para mobile swipe
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const isSwipingRef = useRef<boolean>(false);
  const blockClickUntilRef = useRef<number>(0);

  const hasMultiple = validImages.length > 1;
  const currentImg = validImages[currentIndex];

  const handlePrev = useCallback(() => {
    if (!hasMultiple) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  }, [hasMultiple, validImages.length]);

  const handleNext = useCallback(() => {
    if (!hasMultiple) return;
    setCurrentIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  }, [hasMultiple, validImages.length]);

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      touchStartPos.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      isSwipingRef.current = false;
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartPos.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStartPos.current.x;
    const dy = e.touches[0].clientY - touchStartPos.current.y;

    // Se o movimento horizontal for dominante, sinaliza intenção de swipe
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 12) {
      isSwipingRef.current = true;
    }
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartPos.current) return;
    const changedTouch = e.changedTouches[0];
    const dx = changedTouch.clientX - touchStartPos.current.x;
    const dy = changedTouch.clientY - touchStartPos.current.y;

    const minSwipeDistance = 35;

    if (isSwipingRef.current && Math.abs(dx) > minSwipeDistance && Math.abs(dx) > Math.abs(dy) * 1.2) {
      // Bloqueia clique sintético gerado pelo fim do toque
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

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (Date.now() < blockClickUntilRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const isCurrentFailed = currentImg ? imgErrors[currentImg.url] : true;

  return (
    <div
      className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden select-none touch-pan-y group/gallery ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: "pan-y" }}
    >
      {/* 1. Área central de toque que abre o produto (sem zoom no mobile) */}
      <Link
        href={productHref}
        onClick={handleLinkClick}
        className="absolute inset-0 z-0 block w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        aria-label={`Ver detalhes do modelo ${productName}`}
        tabIndex={0}
      >
        {currentImg?.url && !isCurrentFailed ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={currentImg.url}
            alt={currentImg.alt_text || `${productName} foto ${currentIndex + 1}`}
            onError={() => {
              if (currentImg.url) {
                setImgErrors((prev) => ({ ...prev, [currentImg.url]: true }));
              }
            }}
            loading="lazy"
            className={`w-full h-full group-hover-zoom-desktop transition-transform duration-500 ease-out ${
              imageFit === "contain"
                ? "object-contain p-2 drop-shadow-sm"
                : "object-cover object-center"
            }`}
          />
        ) : fallbackArt ? (
          <div className="w-full h-full flex items-center justify-center p-3 group-hover-zoom-desktop transition-transform duration-300">
            {fallbackArt}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs">
            {productName}
          </div>
        )}
      </Link>

      {/* 2. Zona Morta das Setas: Botões independentes com mínimo de 44px de área de clique */}
      {hasMultiple && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between p-1">
          {/* Seta Esquerda (Anterior) */}
          <button
            type="button"
            data-testid="card-gallery-prev"
            aria-label={`Ver foto anterior de ${productName}`}
            className="pointer-events-auto min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-full bg-black/45 hover:bg-black/75 active:scale-95 text-white backdrop-blur-md transition-all border border-white/20 shadow-md touch-manipulation cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePrev();
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePrev();
            }}
          >
            <ChevronLeft size={18} className="text-white" />
          </button>

          {/* Seta Direita (Próxima) */}
          <button
            type="button"
            data-testid="card-gallery-next"
            aria-label={`Ver próxima foto de ${productName}`}
            className="pointer-events-auto min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-full bg-black/45 hover:bg-black/75 active:scale-95 text-white backdrop-blur-md transition-all border border-white/20 shadow-md touch-manipulation cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
          >
            <ChevronRight size={18} className="text-white" />
          </button>
        </div>
      )}

      {/* 3. Indicador de Posição / Contador de Fotos */}
      {hasMultiple && (
        <div
          data-testid="card-gallery-counter"
          className="pointer-events-none absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono tracking-wider z-20 border border-white/15"
        >
          {currentIndex + 1}/{validImages.length}
        </div>
      )}

      {/* 4. Dots discretos (opcional) */}
      {hasMultiple && showDots && validImages.length <= 5 && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
          {validImages.map((_, idx) => (
            <span
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-3 bg-amber-400"
                  : "w-1 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
