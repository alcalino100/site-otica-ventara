"use client";

import React, { useState } from "react";
import Link from "next/link";
import { focusObjectPosition } from "@/lib/image-focus";

export interface GalleryImage {
  id?: string;
  url: string;
  alt_text?: string | null;
  is_primary?: boolean;
  /** Posição ajustada no admin (% do object-position). Sem valor = enquadramento automático. */
  focus_x?: number | null;
  focus_y?: number | null;
}

interface CardImageGalleryProps {
  images?: GalleryImage[];
  fallbackUrl?: string | null;
  productName: string;
  productHref: string;
  aspectRatio?: string;
  imageFit?: "cover" | "contain";
  /**
   * No mobile, centraliza a armação na foto (object-position 50%/50%) em vez do
   * enquadramento mais baixo usado no desktop. Não altera o desktop.
   */
  centerOnMobile?: boolean;
  fallbackArt?: React.ReactNode;
  className?: string;
  showDots?: boolean;
}

/**
 * Visualizador de imagem para cards de produto:
 * - Exibe a foto do modelo com enquadramento proporcional sem setas invasivas sobre a armação
 * - Exibe o contador numérico de fotos ("1/3", "1/4") no canto
 * - Preserva o scroll horizontal nativo em carrosséis no mobile (sem touch-action restritivo)
 */
export function CardImageGallery({
  images = [],
  fallbackUrl,
  productName,
  productHref,
  aspectRatio = "aspect-[4/3]",
  imageFit = "cover",
  centerOnMobile = false,
  fallbackArt,
  className = "",
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

  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const hasMultiple = validImages.length > 1;
  const currentImg = validImages[0];
  const isCurrentFailed = currentImg ? imgErrors[currentImg.url] : true;
  // Posição salva no admin tem prioridade sobre o enquadramento automático (mobile e desktop)
  const customPosition = focusObjectPosition(currentImg);

  return (
    <div
      className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden select-none group/gallery ${className}`}
    >
      {/* 1. Link direto para o produto */}
      <Link
        href={productHref}
        className="absolute inset-0 z-0 block w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        aria-label={`Ver detalhes do modelo ${productName}`}
      >
        {currentImg?.url && !isCurrentFailed ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={currentImg.url}
            alt={currentImg.alt_text || `${productName} foto`}
            onError={() => {
              if (currentImg.url) {
                setImgErrors((prev) => ({ ...prev, [currentImg.url]: true }));
              }
            }}
            loading="lazy"
            style={customPosition ? { objectPosition: customPosition } : undefined}
            className={`w-full h-full group-hover-zoom-desktop transition-transform duration-500 ease-out ${
              imageFit === "contain"
                ? "object-contain p-2 drop-shadow-sm"
                : centerOnMobile
                  ? "object-cover object-center sm:object-[center_68%]"
                  : "object-cover object-[center_68%]"
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

      {/* 2. Indicador Numérico de Fotos ("1/3", "1/4") - Sem setas invasivas sobre a armação */}
      {hasMultiple && (
        <div
          data-testid="card-gallery-counter"
          className="pointer-events-none absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-mono tracking-wider z-10 border border-white/15"
        >
          1/{validImages.length}
        </div>
      )}
    </div>
  );
}
