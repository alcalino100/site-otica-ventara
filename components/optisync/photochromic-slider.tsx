"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Sun, Moon, Sparkles } from "lucide-react";

interface PhotochromicSliderProps {
  clearImageUrl?: string;
  darkImageUrl?: string;
  bannerImageUrl?: string;
  altText?: string;
  transitionSpeedText?: string;
  indoorLabel?: string;
  outdoorLabel?: string;
  instructionsText?: string;
}

export function PhotochromicSlider({
  clearImageUrl,
  darkImageUrl,
  bannerImageUrl,
  altText = "Comparação de escurecimento da lente fotossensível OPTiSYNC",
  transitionSpeedText = "Ativação em até 30 segundos sob radiação UV",
  indoorLabel = "Ambiente Interno",
  outdoorLabel = "Sol Pleno",
  instructionsText = "Arraste ou use as setas do teclado (← / →) para simular o escurecimento",
}: PhotochromicSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultClear = "/images/lenses/optisync-hd.jpg";
  const defaultDark = "/images/lenses/optisync-fotossensivel-box.jpg";
  const defaultBanner = "/images/lenses/optisync/arte-07-fotossensivel-banner.jpg";

  const isCustom = (url?: string, defaultVal?: string) =>
    Boolean(url && url.trim().length > 0 && url !== defaultVal);

  const hasCustomClear = isCustom(clearImageUrl, defaultClear);
  const hasCustomDark = isCustom(darkImageUrl, defaultDark);
  const hasCustomBanner = isCustom(bannerImageUrl, defaultBanner);

  // Imagens efetivas: prioriza customização do admin (límpida/escura/banner) sobre os defaults
  const effectiveClear = hasCustomClear ? clearImageUrl! : defaultClear;
  const effectiveDark = hasCustomDark
    ? darkImageUrl!
    : (hasCustomBanner ? bannerImageUrl! : defaultDark);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(Math.round(percentage));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updatePosition(e.clientX);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore capture registration errors on iOS
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore capture release error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next = position;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      next = Math.max(0, position - 5);
      e.preventDefault();
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      next = Math.min(100, position + 5);
      e.preventDefault();
    } else if (e.key === "Home") {
      next = 0;
      e.preventDefault();
    } else if (e.key === "End") {
      next = 100;
      e.preventDefault();
    }
    setPosition(next);
  };

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        role="slider"
        aria-label="Simulador de escurecimento da lente fotossensível"
        aria-valuenow={position}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="group relative select-none rounded-2xl overflow-hidden border border-[#0044C9]/40 bg-[#000933] shadow-2xl cursor-ew-resize focus:outline-none focus:ring-2 focus:ring-[#0044C9] touch-none"
      >
        {/* Camada Base: Lente Escurecida (Sol Pleno) */}
        <div className="relative aspect-[3/2] w-full">
          {effectiveDark && (
            <Image
              src={effectiveDark}
              alt={`${altText} - Estado Escurecido`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
              className="object-cover pointer-events-none"
              priority
            />
          )}

          <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-[#020716]/85 border border-[#FFC21A]/40 text-[#FFC21A] text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md pointer-events-none shadow-lg">
            <Sun className="w-3.5 h-3.5 text-[#FFC21A]" />
            <span>{outdoorLabel} ({100 - position}%)</span>
          </div>
        </div>

        {/* Camada Superior Recortada: Lente Límpida (Ambiente Interno) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <div className="relative w-full h-full">
            {effectiveClear && (
              <Image
                src={effectiveClear}
                alt={`${altText} - Estado Límpido`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
                className="object-cover pointer-events-none"
              />
            )}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-[#000933]/85 border border-[#0044C9]/40 text-[#F4F6FF] text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md pointer-events-none shadow-lg">
              <Moon className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{indoorLabel} ({position}%)</span>
            </div>
          </div>
        </div>

        {/* Linha Divisora & Pegador com Glow */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-20 flex items-center justify-center -translate-x-1/2"
          style={{ left: `${position}%` }}
        >
          {/* Barra Vertical de Luz */}
          <div className="w-[3px] h-full bg-gradient-to-b from-[#7A2CFF] via-[#F4F6FF] to-[#0044C9] shadow-[0_0_12px_#1E5BFF]" />

          {/* Botão Central com Ícone */}
          <div className="absolute w-10 h-10 rounded-full bg-[#020716] border-2 border-[#F4F6FF] text-[#FFC21A] shadow-[0_0_20px_rgba(30,91,255,0.8)] flex items-center justify-center transition-transform group-hover:scale-110 group-focus:scale-110">
            <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#F4F6FF]">
              <span>‹</span>
              <span className="w-1 h-3 rounded-full bg-[#FFC21A]" />
              <span>›</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legenda Informativa Acessível e Instruções de Teclado */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#B8C2E6] gap-2 px-1">
        <span className="flex items-center gap-1.5 text-[#FFC21A] font-medium">
          <Sparkles className="w-3.5 h-3.5" /> {transitionSpeedText}
        </span>
        <span className="text-[#8A96C2] text-[11px]">
          {instructionsText}
        </span>
      </div>
    </div>
  );
}
