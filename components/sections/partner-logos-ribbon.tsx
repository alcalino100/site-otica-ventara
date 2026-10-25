"use client";

import React from "react";
import Image from "next/image";

const partnerLogos = [
  { src: "/logos/optisync.svg", alt: "OPTiSYNC HD - Exclusivo Ventara" },
  { src: "/logos/perego.svg", alt: "Perego Laboratório Óptico" },
  { src: "/logos/kodak.svg", alt: "Kodak Lens" },
  { src: "/logos/orgaline.svg", alt: "Orgalens Mais" },
  { src: "/logos/correct.svg", alt: "Lentes Correct" },
  { src: "/logos/hoya.svg", alt: "HOYA Vision Care" },
  { src: "/logos/varilux.svg", alt: "Varilux Essilor" },
  { src: "/logos/crizal.svg", alt: "Crizal UV" },
  { src: "/logos/transitions.svg", alt: "Transitions GEN S" },
  { src: "/logos/essilor.svg", alt: "Essilor" },
  { src: "/logos/zeiss.svg", alt: "ZEISS" },
];

export function PartnerLogosRibbon() {
  return (
    <div className="py-7 sm:py-10 border-y border-white/10 bg-[#030812] relative overflow-hidden">
      {/* Luz ambiente sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[100px] bg-blue-500/5 blur-[80px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="text-center mb-5 sm:mb-7">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400/90 block">
            PARCEIROS TECNOLÓGICOS &amp; LENTES HOMOLOGADAS
          </span>
          <p className="text-xs text-slate-400 mt-1">
            Garantia de procedência direta com laboratórios certificados e montagem expressa
          </p>
        </div>

        {/* Marquee Infinito Suave e Alinhado (Desktop & Mobile) */}
        <div className="relative w-full overflow-hidden group">
          {/* Gradientes de desvanecimento nas laterais */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-[#030812] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-[#030812] to-transparent z-10" />

          <div className="animate-ventara-marquee flex items-center py-2">
            {/* Primeiro conjunto de logos */}
            <div className="flex items-center gap-6 sm:gap-12 pr-6 sm:pr-12">
              {partnerLogos.map((logo, idx) => (
                <div
                  key={`logo-track-1-${idx}`}
                  className="flex items-center justify-center shrink-0 h-11 sm:h-14 w-32 sm:w-44 px-2"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={160}
                    height={48}
                    className="max-h-8 sm:max-h-10 w-auto object-contain opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-200 pointer-events-none select-none drop-shadow-sm brightness-95"
                    unoptimized
                  />
                </div>
              ))}
            </div>

            {/* Segundo conjunto de logos para loop contínuo perfeitamente uniforme */}
            <div className="flex items-center gap-6 sm:gap-12 pr-6 sm:pr-12" aria-hidden="true">
              {partnerLogos.map((logo, idx) => (
                <div
                  key={`logo-track-2-${idx}`}
                  className="flex items-center justify-center shrink-0 h-11 sm:h-14 w-32 sm:w-44 px-2"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={160}
                    height={48}
                    className="max-h-8 sm:max-h-10 w-auto object-contain opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-200 pointer-events-none select-none drop-shadow-sm brightness-95"
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
