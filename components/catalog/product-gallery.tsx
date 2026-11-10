"use client";

import React, { useState, useEffect, useRef } from "react";
import { Product } from "@/types/ecommerce";
import { FrameArt } from "./frame-art";
import { Sparkles, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductGalleryProps {
  product: Product;
  overrideImage?: string | null;
}

export function ProductGallery({ product, overrideImage }: ProductGalleryProps) {
  const images = product.images && product.images.length > 0 ? product.images : [];
  const primaryIdx = Math.max(
    0,
    images.findIndex((img) => img.is_primary)
  );
  const [activeIdx, setActiveIdx] = useState(primaryIdx);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });

  // Touch gesture state for mobile swipe
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Sincroniza índice se overrideImage mudar
  useEffect(() => {
    if (overrideImage) {
      const matchIdx = images.findIndex((img) => img.url === overrideImage);
      if (matchIdx >= 0) {
        setActiveIdx(matchIdx);
      }
    }
  }, [overrideImage, images]);

  const activeImage = overrideImage || images[activeIdx]?.url;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomCoords({ x, y });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 40;

    if (diff > minSwipeDistance && activeIdx < images.length - 1) {
      // Próxima imagem (arraste para a esquerda)
      setActiveIdx((prev) => prev + 1);
    } else if (diff < -minSwipeDistance && activeIdx > 0) {
      // Imagem anterior (arraste para a direita)
      setActiveIdx((prev) => prev - 1);
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 items-start">
      {/* Desktop: Miniaturas Verticais à Esquerda */}
      {images.length > 1 && (
        <div className="hidden lg:flex flex-col gap-2.5 w-20 shrink-0">
          {images.map((img, idx) => {
            const isCurrent = activeIdx === idx;
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? "border-amber-400 shadow-md ring-1 ring-amber-400"
                    : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                }`}
                title={`Ver imagem ${idx + 1}`}
              >
                <img
                  src={img.url}
                  alt={img.alt_text || `${product.name} foto ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Bloco Principal de Apresentação Visual */}
      <div className="flex-1 w-full space-y-3">
        {activeImage ? (
          <div
            className="relative w-full aspect-[4/3] sm:aspect-[4/3] lg:aspect-square min-h-[340px] sm:min-h-[460px] lg:min-h-[520px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-950 group select-none cursor-crosshair"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Imagem com suporte a Zoom por coordenadas */}
            <img
              src={activeImage}
              alt={images[activeIdx]?.alt_text || product.name}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                      transform: "scale(1.9)",
                    }
                  : { transform: "scale(1)" }
              }
              className="w-full h-full object-cover object-center transition-transform duration-200 ease-out"
            />

            {/* Degradê Superior Discreto para Contraste dos Badges */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 via-black/15 to-transparent pointer-events-none z-10" />

            {/* Degradê Inferior Discreto para Contraste da Marca d'Água */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 via-black/20 via-30% to-transparent pointer-events-none z-10" />

            {/* Badges de Categoria e Gênero no Topo */}
            <div className="absolute top-5 left-5 flex items-center gap-2 z-20">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-black/45 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-full shadow-sm">
                {product.frame_type === "Solar" ? "Óculos Solar UV400" : "Armação de Grau"}
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200 bg-black/45 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-sm">
                {product.gender || "Unissex"}
              </span>
            </div>

            {/* Selo Curadoria Autoral no Topo Direito */}
            <div className="absolute top-5 right-5 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold tracking-wider uppercase shadow-sm">
              <Sparkles size={12} className="text-[#FFD62E]" />
              <span>Peça Original</span>
            </div>

            {/* Ícone de Dica de Zoom */}
            <div className="absolute bottom-5 left-5 z-20 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white/80 text-[10px]">
              <ZoomIn size={12} />
              <span>Passe o mouse para ampliar</span>
            </div>

            {/* Controles de Navegação Touch / Setas no Mobile */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="lg:hidden absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Marca d'Água Oficial no Rodapé */}
            <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-white/90 tracking-[0.18em] drop-shadow-sm uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD62E] inline-block animate-pulse" />
              ÓTICA VENTARA · ARAÇATUBA-SP
            </div>

            {/* Indicador Numérico Mobile */}
            {images.length > 1 && (
              <div className="sm:hidden absolute top-5 right-5 z-20 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono tracking-wider">
                {activeIdx + 1} / {images.length}
              </div>
            )}
          </div>
        ) : (
          /* Caso sem Foto Real: Arte Vetorial Studio Light */
          <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center min-h-[340px] sm:min-h-[460px] lg:min-h-[520px] relative overflow-hidden shadow-xs">
            <div className="absolute top-5 left-5 flex items-center gap-2 z-10">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-50 text-slate-800 border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
                {product.frame_type === "Solar" ? "Óculos Solar UV400" : "Armação de Grau"}
              </span>
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs">
                {product.gender || "Unissex"}
              </span>
            </div>

            <div className="w-full max-w-md py-6 relative z-10">
              <FrameArt
                solar={product.frame_type === "Solar"}
                round={product.frame_shape === "Redondo"}
                amber={product.slug.includes("aurora") || (product.slug.includes("solar") && !product.slug.includes("kids"))}
                customColor={
                  product.gender === "Infantil"
                    ? product.frame_type === "Solar"
                      ? "#0284c7"
                      : "#2563eb"
                    : undefined
                }
              />
            </div>

            <div className="absolute bottom-5 right-5 text-[10px] font-semibold text-slate-400 tracking-wider">
              ÓTICA VENTARA · ARAÇATUBA-SP
            </div>
          </div>
        )}

        {/* Mobile: Miniaturas horizontais com rolagem suave e indicador touch */}
        {images.length > 1 && (
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 pt-1 justify-center">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                  activeIdx === idx
                    ? "border-amber-400 shadow-md ring-1 ring-amber-400"
                    : "border-slate-200 opacity-60"
                }`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover object-center"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
