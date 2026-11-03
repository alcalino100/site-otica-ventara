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
    <section className="relative pt-28 sm:pt-36 pb-12 sm:pb-20 bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#FFFFFF] text-slate-900 overflow-hidden">
      {/* Luz ambiente suave de fundo */}
      <div
        className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-amber-200/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Coluna de Textos & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Selo no Topo */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-amber-400/50 text-slate-800 text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-5 shadow-sm">
              <Truck size={14} className="text-amber-500 shrink-0" />
              <span>{badgeText}</span>
            </div>

            {/* Título Principal em Duas Linhas com Destaque em Ventara */}
            <h1 className="tracking-tight leading-[1.05] mb-4">
              <span className="block text-2xl sm:text-4xl lg:text-5xl font-light text-slate-800">
                {titleLine1}
              </span>
              <span className="block text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0B1528] tracking-tight">
                {titleLine2}
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-xl font-normal leading-relaxed mb-8">
              {subtitle}
            </p>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link
                href={ctaUrl}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md shadow-amber-400/25 min-h-[44px]"
              >
                <Search size={15} />
                <span>{ctaText}</span>
              </Link>

              <a
                href={secondaryCtaUrl}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 active:scale-95 text-slate-800 border border-slate-300 hover:border-slate-400 text-xs font-semibold uppercase tracking-wider transition-all duration-200 min-h-[44px] shadow-sm"
              >
                <MapPin size={15} className="text-amber-500" />
                <span>{secondaryCtaText}</span>
              </a>
            </div>
          </div>

          {/* Coluna da Imagem dos Óculos na Bancada */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px] lg:max-w-none aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-white">
              <Image
                src={imageUrl}
                alt="Armação Ventara Eyewear sobre bancada técnica em laboratório"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover object-center"
              />
              {/* Fade sutil para integrar com o fundo claro */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Curva amarela estilizada na base do Hero */}
      <div className="relative w-full overflow-hidden leading-none mt-10 -mb-12 sm:-mb-20 pointer-events-none">
        <svg
          viewBox="0 0 1440 90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 sm:h-20 text-amber-400 preserve-3d"
          preserveAspectRatio="none"
        >
          <path
            d="M0,45 C320,85 720,10 1440,55 L1440,90 L0,90 Z"
            fill="currentColor"
            fillOpacity="0.85"
          />
          <path
            d="M0,60 C380,90 760,25 1440,70 L1440,90 L0,90 Z"
            fill="#030913"
          />
        </svg>
      </div>
    </section>
  );
}
