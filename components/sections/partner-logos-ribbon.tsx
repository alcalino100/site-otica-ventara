"use client";

import React from "react";
import Image from "next/image";
import { LogosCarousel } from "@/registry/spell-ui/logos-carousel";

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
    <div className="py-8 sm:py-12 border-y border-white/10 bg-[#030812] relative overflow-hidden">
      {/* Luz ambiente sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[100px] bg-blue-500/5 blur-[80px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400/90 block">
            PARCEIROS TECNOLÓGICOS &amp; LENTES HOMOLOGADAS
          </span>
          <p className="text-xs text-slate-400 mt-1">
            Garantia de procedência direta com laboratórios certificados e montagem expressa
          </p>
        </div>

        <LogosCarousel count={4} className="gap-6 sm:gap-12">
          {partnerLogos.map((logo) => (
            <div
              key={logo.src}
              className="flex items-center justify-center w-full max-w-[180px] h-12 transition-transform duration-300 hover:scale-105"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={160}
                height={48}
                className="max-h-10 w-auto object-contain transition-opacity duration-300 hover:opacity-100 pointer-events-none select-none drop-shadow-sm"
                unoptimized
              />
            </div>
          ))}
        </LogosCarousel>
      </div>
    </div>
  );
}
