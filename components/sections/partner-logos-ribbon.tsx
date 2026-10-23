"use client";

import React from "react";
import Image from "next/image";
import { LogosCarousel } from "@/registry/spell-ui/logos-carousel";

const partnerLogos = [
  { src: "/logos/varilux.svg", alt: "Varilux Essilor" },
  { src: "/logos/hoya.svg", alt: "HOYA Vision Care" },
  { src: "/logos/kodak.svg", alt: "Kodak Lens" },
  { src: "/logos/crizal.svg", alt: "Crizal UV" },
  { src: "/logos/transitions.svg", alt: "Transitions GEN S" },
  { src: "/logos/essilor.svg", alt: "Essilor" },
  { src: "/logos/rayban.svg", alt: "Ray-Ban" },
  { src: "/logos/oakley.svg", alt: "Oakley" },
  { src: "/logos/zeiss.svg", alt: "ZEISS" },
  { src: "/logos/optisync.svg", alt: "OPTiSYNC HD Lab" },
  { src: "/logos/orgaline.svg", alt: "Orgaline+ Japan" },
  { src: "/logos/correct.svg", alt: "Lentes Correct" },
];

export function PartnerLogosRibbon() {
  return (
    <div className="py-8 sm:py-12 border-y border-white/10 bg-[#030812] relative overflow-hidden">
      {/* Luz ambiente sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[100px] bg-blue-500/5 blur-[80px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400/90 block">
            PARCEIROS TECNOLÓGICOS &amp; LENTES MUNDIAIS
          </span>
          <p className="text-xs text-slate-400 mt-1">
            Garantia de procedência com os maiores laboratórios ópticos do mundo
          </p>
        </div>

        <LogosCarousel count={4} className="gap-6 sm:gap-12">
          {partnerLogos.map((logo) => (
            <div
              key={logo.src}
              className="flex items-center justify-center w-full max-w-[180px] h-12 text-slate-300 hover:text-white transition-colors"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={160}
                height={48}
                className="max-h-10 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity pointer-events-none select-none text-white invert-[0.9] hover:brightness-125"
                unoptimized
              />
            </div>
          ))}
        </LogosCarousel>
      </div>
    </div>
  );
}
