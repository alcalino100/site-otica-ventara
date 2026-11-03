"use client";

import React from "react";
import Image from "next/image";
import { MapPin, ShieldCheck, Clock, PackageCheck } from "lucide-react";

interface ShippingHighlightCardsProps {
  card1Title?: string;
  card1Subtitle?: string;
  card2Title?: string;
  card2Subtitle?: string;
  insuranceTitle?: string;
  insuranceSubtitle?: string;
  card3Title?: string;
  card3Subtitle?: string;
  showCargoInsurance?: boolean;
}

export function ShippingHighlightCards({
  card1Title = "Araçatuba e Região",
  card1Subtitle = "Entrega rápida com van própria",
  card2Title = "Envio para todo o Brasil",
  card2Subtitle = "Correios e transporte aéreo",
  insuranceTitle = "Seguro de Carga Total",
  insuranceSubtitle = "Proteção garantida em 100% dos envios",
  card3Title = "Rastreio Ponto a Ponto",
  card3Subtitle = "Atualizações em tempo real",
  showCargoInsurance = false,
}: ShippingHighlightCardsProps) {
  // Define o segundo card com base no toggle do admin
  const secondCard = showCargoInsurance
    ? {
        title: insuranceTitle,
        subtitle: insuranceSubtitle,
        icon: <ShieldCheck size={20} className="text-[#0756B8]" />,
        badgeBg: "bg-blue-50 border border-blue-200/60",
      }
    : {
        title: card2Title,
        subtitle: card2Subtitle,
        icon: <PackageCheck size={20} className="text-[#0756B8]" />,
        badgeBg: "bg-blue-50 border border-blue-200/60",
      };

  return (
    <section className="relative z-20 -mt-2 sm:-mt-6 pb-12 sm:pb-16 bg-[#FAF8F4]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Araçatuba e Região */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E8E3D8] p-5 sm:p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group">
            <div className="relative z-10 flex items-center gap-3.5 pr-2">
              <div className="w-12 h-12 rounded-full bg-[#FFF4C7] border border-amber-300/50 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <MapPin size={20} className="text-[#9A6700]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#06111F] leading-snug">
                  {card1Title}
                </h2>
                <p className="text-xs text-[#4A5875] font-normal leading-snug mt-0.5">
                  {card1Subtitle}
                </p>
              </div>
            </div>

            {/* Acento gráfico elegante e exclusivo (sem duplicar fotos da van) */}
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-[#FAF8F4] border border-[#E8E3D8] text-[#9A6700] text-xs font-bold shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              SP
            </div>
          </div>

          {/* Card 2: Envio Brasil (ou Seguro Total se ativado) */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E8E3D8] p-5 sm:p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group">
            <div className="relative z-10 flex items-center gap-3.5 pr-2">
              <div className={`w-12 h-12 rounded-full ${secondCard.badgeBg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                {secondCard.icon}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#06111F] leading-snug">
                  {secondCard.title}
                </h2>
                <p className="text-xs text-[#4A5875] font-normal leading-snug mt-0.5">
                  {secondCard.subtitle}
                </p>
              </div>
            </div>

            {/* Acento gráfico exclusivo */}
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-[#FAF8F4] border border-[#E8E3D8] text-[#0756B8] text-xs font-bold shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              BR
            </div>
          </div>

          {/* Card 3: Rastreio Ponto a Ponto */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E8E3D8] p-5 sm:p-6 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group">
            <div className="relative z-10 flex items-center gap-3.5 pr-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Clock size={20} className="text-[#059669]" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#06111F] leading-snug">
                  {card3Title}
                </h2>
                <p className="text-xs text-[#4A5875] font-normal leading-snug mt-0.5">
                  {card3Subtitle}
                </p>
              </div>
            </div>

            {/* Acento gráfico exclusivo */}
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-[#FAF8F4] border border-[#E8E3D8] text-[#059669] text-xs font-bold shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              24h
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
