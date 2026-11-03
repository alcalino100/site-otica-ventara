"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Truck, Search, MapPin } from "lucide-react";

interface ShippingHeroProps {
  badgeText?: string;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  imageUrl?: string;
}

export function ShippingHero({
  badgeText = "ESTRUTURA LOGÍSTICA & RASTREAMENTO",
  titleLine1 = "Rede de Entregas",
  titleLine2 = "Ventara",
  subtitle = "Da nossa ótica em Araçatuba para todo o Brasil",
  ctaText = "Rastrear seu pedido",
  ctaUrl = "/rastreio",
  secondaryCtaText = "Ver cidades atendidas",
  secondaryCtaUrl = "#bloco-regional",
  imageUrl = "/images/shipping/hero-glasses-ventara.jpg",
}: ShippingHeroProps) {
  return (
    <section className="relative pt-28 sm:pt-36 pb-12 sm:pb-16 bg-[#FAF8F4] text-[#06111F] overflow-hidden border-b border-[#E8E3D8]">
      {/* Luz ambiente suave e quente de fundo */}
      <div
        className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-amber-200/25 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-20 left-10 w-[300px] h-[300px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Coluna de Textos & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Selo no Topo */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF4C7] border border-amber-400/40 text-[#9A6700] text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-5 shadow-xs">
              <Truck size={14} className="text-[#9A6700] shrink-0" />
              <span>{badgeText}</span>
            </div>

            {/* Título Principal em Duas Linhas com Destaque em Ventara */}
            <h1 className="tracking-tight leading-[1.05] mb-4">
              <span className="block text-2xl sm:text-4xl lg:text-5xl font-light text-[#06111F]/80">
                {titleLine1}
              </span>
              <span className="block text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#06111F] tracking-tight">
                {titleLine2}
              </span>
            </h1>

            {/* Subtítulo com contraste AA */}
            <p className="text-sm sm:text-base lg:text-lg text-[#4A5875] max-w-xl font-normal leading-relaxed mb-8">
              {subtitle}
            </p>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link
                href={ctaUrl}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-[#FFD62E] hover:bg-[#FFE066] active:scale-95 text-[#06111F] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow min-h-[44px]"
              >
                <Search size={15} className="text-[#06111F]" />
                <span>{ctaText}</span>
              </Link>

              <a
                href={secondaryCtaUrl}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#F3F0E9] active:scale-95 text-[#06111F] border border-[#E8E3D8] hover:border-[#06111F]/40 text-xs font-semibold uppercase tracking-wider transition-all duration-200 min-h-[44px] shadow-xs"
              >
                <MapPin size={15} className="text-[#9A6700]" />
                <span>{secondaryCtaText}</span>
              </a>
            </div>
          </div>

          {/* Coluna da Imagem dos Óculos na Bancada */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px] lg:max-w-none aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-[#E8E3D8] bg-white">
              <Image
                src={imageUrl}
                alt="Armação Ventara Eyewear sobre bancada técnica em laboratório"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover object-center"
              />
              {/* Fade suave para integrar com o fundo claro */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Curva amarela sutil na base do Hero integrada ao off-white */}
      <div className="relative w-full overflow-hidden leading-none mt-10 -mb-12 sm:-mb-16 pointer-events-none">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-8 sm:h-12 text-[#FFD62E] preserve-3d"
          preserveAspectRatio="none"
        >
          <path
            d="M0,25 C320,55 720,5 1440,35 L1440,60 L0,60 Z"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>
      </div>
    </section>
  );
}
