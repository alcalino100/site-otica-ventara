"use client";

import React from "react";
import Image from "next/image";
import type { PartnerLogoItem } from "@/types/ecommerce";
import { DEFAULT_PARTNER_LOGOS } from "@/lib/site-settings-constants";

interface PartnerLogosRibbonProps {
  logos?: PartnerLogoItem[];
  tag?: string;
  subtitle?: string;
  variant?: "dark" | "light";
}

export function PartnerLogosRibbon({
  logos,
  tag = "PARCEIROS TECNOLÓGICOS & LENTES HOMOLOGADAS",
  subtitle = "Garantia de procedência direta com laboratórios certificados e montagem expressa",
  variant = "dark",
}: PartnerLogosRibbonProps) {
  const logosToRender = logos && logos.length > 0 ? logos : DEFAULT_PARTNER_LOGOS;
  const isLight = variant === "light";

  return (
    <div
      className={`py-6 sm:py-9 border-y relative overflow-hidden ${
        isLight
          ? "bg-white border-slate-200"
          : "bg-[#030812] border-white/10"
      }`}
    >
      {/* Luz ambiente sutil */}
      {!isLight && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[100px] bg-blue-500/5 blur-[80px] pointer-events-none" />
      )}

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="text-center mb-5 sm:mb-6">
          <span
            className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] block ${
              isLight ? "text-slate-900 font-extrabold" : "text-amber-400/90"
            }`}
          >
            {tag}
          </span>
          {subtitle && (
            <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Marquee Infinito Suave e Alinhado (Desktop & Mobile) */}
        <div className="relative w-full overflow-hidden group">
          {/* Gradientes de desvanecimento nas laterais */}
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r ${
              isLight ? "from-white" : "from-[#030812]"
            } to-transparent z-10`}
          />
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l ${
              isLight ? "from-white" : "from-[#030812]"
            } to-transparent z-10`}
          />

          <div className="animate-ventara-marquee flex items-center py-2">
            {/* Primeiro conjunto de logos */}
            <div className="flex items-center gap-6 sm:gap-12 pr-6 sm:pr-12">
              {logosToRender.map((logo, idx) => (
                <div
                  key={`logo-track-1-${logo.id || idx}`}
                  className="flex items-center justify-center shrink-0 h-10 sm:h-12 w-28 sm:w-40 px-2"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt || logo.name || "Marca Homologada"}
                    width={160}
                    height={48}
                    className={`max-h-7 sm:max-h-9 w-auto object-contain transition-all duration-200 pointer-events-none select-none ${
                      isLight
                        ? "opacity-90 hover:opacity-100 hover:scale-105 filter drop-shadow-xs"
                        : "opacity-85 hover:opacity-100 hover:scale-105 drop-shadow-sm brightness-95"
                    }`}
                    unoptimized
                  />
                </div>
              ))}
            </div>

            {/* Segundo conjunto de logos para loop contínuo perfeitamente uniforme */}
            <div className="flex items-center gap-6 sm:gap-12 pr-6 sm:pr-12" aria-hidden="true">
              {logosToRender.map((logo, idx) => (
                <div
                  key={`logo-track-2-${logo.id || idx}`}
                  className="flex items-center justify-center shrink-0 h-10 sm:h-12 w-28 sm:w-40 px-2"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt || logo.name || "Marca Homologada"}
                    width={160}
                    height={48}
                    className={`max-h-7 sm:max-h-9 w-auto object-contain transition-all duration-200 pointer-events-none select-none ${
                      isLight
                        ? "opacity-90 hover:opacity-100 hover:scale-105 filter drop-shadow-xs"
                        : "opacity-85 hover:opacity-100 hover:scale-105 drop-shadow-sm brightness-95"
                    }`}
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
