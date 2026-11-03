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
        icon: <ShieldCheck size={20} className="text-blue-500" />,
        badgeBg: "bg-blue-100",
        image: "/images/laboratory/laboratorio-ventara.jpg",
        alt: "Inspeção e segurança de envios na Ótica Ventara",
      }
    : {
        title: card2Title,
        subtitle: card2Subtitle,
        icon: <PackageCheck size={20} className="text-blue-500" />,
        badgeBg: "bg-blue-100",
        image: "/images/shipping/envio-brasil-azul-cargo.png",
        alt: "Envios para todo o Brasil via transportadoras e Correios",
      };

  return (
    <section className="relative z-20 -mt-2 sm:-mt-6 pb-12 bg-[#030913]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Araçatuba e Região */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-4 sm:p-5 shadow-lg flex items-center justify-between group">
            <div className="relative z-10 flex items-center gap-3.5 pr-2">
              <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center shrink-0 shadow-sm">
                <MapPin size={20} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {card1Title}
                </h2>
                <p className="text-xs text-slate-500 font-normal leading-snug">
                  {card1Subtitle}
                </p>
              </div>
            </div>

            {/* Imagem sutil no canto direito com fade para a esquerda */}
            <div className="relative w-36 h-20 shrink-0 rounded-lg overflow-hidden hidden sm:block opacity-85 group-hover:opacity-100 transition-opacity">
              <Image
                src="/images/shipping/van-ventara-aracatuba.jpg"
                alt="Van azul da Ventara"
                fill
                sizes="150px"
                className="object-cover object-center"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Card 2: Envio Brasil (ou Seguro Total se ativado) */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-4 sm:p-5 shadow-lg flex items-center justify-between group">
            <div className="relative z-10 flex items-center gap-3.5 pr-2">
              <div className={`w-11 h-11 rounded-full ${secondCard.badgeBg} flex items-center justify-center shrink-0 shadow-sm`}>
                {secondCard.icon}
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {secondCard.title}
                </h2>
                <p className="text-xs text-slate-500 font-normal leading-snug">
                  {secondCard.subtitle}
                </p>
              </div>
            </div>

            <div className="relative w-36 h-20 shrink-0 rounded-lg overflow-hidden hidden sm:block opacity-85 group-hover:opacity-100 transition-opacity">
              <Image
                src={secondCard.image}
                alt={secondCard.alt}
                fill
                sizes="150px"
                className="object-cover object-center"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Card 3: Rastreio Ponto a Ponto */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-4 sm:p-5 shadow-lg flex items-center justify-between group">
            <div className="relative z-10 flex items-center gap-3.5 pr-2">
              <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
                <Clock size={20} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {card3Title}
                </h2>
                <p className="text-xs text-slate-500 font-normal leading-snug">
                  {card3Subtitle}
                </p>
              </div>
            </div>

            <div className="relative w-36 h-20 shrink-0 rounded-lg overflow-hidden hidden sm:block opacity-85 group-hover:opacity-100 transition-opacity">
              <Image
                src="/images/shipping/envio-brasil-azul-cargo.png"
                alt="Monitoramento e rastreio de pedidos"
                fill
                sizes="150px"
                className="object-cover object-center"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent pointer-events-none"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
