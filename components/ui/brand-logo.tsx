"use client";

import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "header" | "footer" | "hero";
}

export function BrandLogo({ className = "", size, variant }: BrandLogoProps) {
  // Map variant to size if size not explicitly specified
  const effectiveSize =
    size || (variant === "hero" ? "lg" : variant === "footer" ? "md" : "sm");

  const isSm = effectiveSize === "sm";
  const isLg = effectiveSize === "lg";

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      {/* Linha Superior: ÓTICAS + Ícone de Óculos Amarelo */}
      <div className="relative w-full flex items-center justify-between">
        <span
          className={`font-semibold tracking-[0.22em] text-white uppercase ${
            isSm ? "text-[8px]" : isLg ? "text-[12px]" : "text-[10px]"
          }`}
        >
          ÓTICAS
        </span>

        {/* Óculos estilizados amarelos da logo Ventara */}
        <svg
          viewBox="0 0 100 50"
          className={`text-[#FFD62E] -rotate-12 transform ${
            isSm ? "w-6 h-3 -mr-1" : isLg ? "w-10 h-5 -mr-2" : "w-8 h-4 -mr-1.5"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Lente esquerda */}
          <path d="M10 25 C10 12, 40 12, 42 25 C44 38, 12 38, 10 25 Z" fill="#0756B8" fillOpacity="0.45" />
          {/* Lente direita */}
          <path d="M58 25 C60 12, 90 12, 90 25 C90 38, 58 38, 58 25 Z" fill="#0756B8" fillOpacity="0.45" />
          {/* Ponte */}
          <path d="M42 22 Q50 18 58 22" />
          {/* Hastes */}
          <path d="M10 20 L2 14" strokeWidth="5" />
          <path d="M90 20 L98 14" strokeWidth="5" />
        </svg>
      </div>

      {/* Nome Principal: VENTARA em Amarelo Ouro Oficial */}
      <span
        className={`font-black tracking-[0.14em] text-[#FFD62E] leading-none uppercase ${
          isSm ? "text-lg" : isLg ? "text-3xl" : "text-xl"
        }`}
        style={{
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          textShadow: "0 2px 10px rgba(255, 214, 46, 0.25)",
        }}
      >
        VENTARA
      </span>

      {/* Assinatura Inferior: — EYEWEAR — */}
      <div className="flex items-center gap-1.5 w-full justify-center mt-0.5">
        <span className="h-[1px] bg-white/40 flex-1 max-w-[14px]" />
        <span
          className={`font-semibold tracking-[0.25em] text-white/90 uppercase ${
            isSm ? "text-[7px]" : isLg ? "text-[10px]" : "text-[8px]"
          }`}
        >
          EYEWEAR
        </span>
        <span className="h-[1px] bg-white/40 flex-1 max-w-[14px]" />
      </div>
    </div>
  );
}
