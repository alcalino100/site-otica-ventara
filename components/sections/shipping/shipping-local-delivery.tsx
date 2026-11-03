"use client";

import React from "react";
import Image from "next/image";
import { Navigation, MapPin, Clock, ShieldCheck } from "lucide-react";
import { CityChip } from "@/types/shipping";

interface ShippingLocalDeliveryProps {
  badgeText?: string;
  titlePart1?: string;
  titlePart2?: string;
  description?: string;
  citiesHeading?: string;
  cities?: CityChip[];
  imageUrl?: string;
  imageAlt?: string;
  focalPoint?: string;
  gradientIntensity?: "strong" | "medium" | "subtle";
  showTimeframe?: boolean;
  timeframe?: string;
  showConditions?: boolean;
  conditions?: string;
  isLivePreview?: boolean;
}

export function ShippingLocalDelivery({
  badgeText = "LOGÍSTICA PRÓPRIA REGIONAL",
  titlePart1 = "Entrega Expressa em",
  titlePart2 = "Araçatuba e Região",
  description = "Com frota própria e equipe dedicada, garantimos transporte rápido e seguro diretamente do nosso laboratório até o seu endereço em Araçatuba e municípios vizinhos.",
  citiesHeading = "CIDADES ATENDIDAS COM ROTA LOCAL",
  cities = [],
  imageUrl = "/images/shipping/van-ventara-aracatuba.jpg",
  imageAlt = "Van de entregas expressas da Ótica Ventara Eyewear em Araçatuba e região",
  focalPoint = "center right",
  gradientIntensity = "strong",
  showTimeframe = false,
  timeframe,
  showConditions = false,
  conditions,
  isLivePreview = false,
}: ShippingLocalDeliveryProps) {
  // Configuração da intensidade do gradiente para garantir leitura perfeita
  const gradientClass =
    gradientIntensity === "subtle"
      ? "from-[#081326] via-[#081326]/80 to-transparent"
      : gradientIntensity === "medium"
      ? "from-[#081326] via-[#081326]/90 to-transparent"
      : "from-[#081326] via-[#081326]/95 to-black/30";

  return (
    <section id="bloco-regional" className="py-8 sm:py-14 bg-[#030913]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        {/* Banner Card Azul-Marinho Fiel ao Mockup */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#081326] border border-blue-900/40 shadow-2xl p-6 sm:p-10 lg:p-12">
          {/* Imagem de Fundo / Van à Direita */}
          <div className="absolute inset-0 z-0">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 1200px"
              style={{ objectPosition: focalPoint }}
              className="object-cover transition-opacity duration-300"
            />
            {/* Gradiente de leitura escuro da esquerda para a direita */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${gradientClass} pointer-events-none`}
              aria-hidden="true"
            />
            {/* Gradiente vertical para telas mobile */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#081326] via-[#081326]/60 to-transparent sm:hidden pointer-events-none"
              aria-hidden="true"
            />
          </div>

          {/* Conteúdo Técnico e Textos (Z-10 garantindo leitura e clique) */}
          <div className="relative z-10 max-w-2xl flex flex-col items-start text-left">
            {/* Badge Pílula Azul */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600/30 border border-blue-400/30 text-blue-300 text-[11px] sm:text-xs font-bold tracking-wider uppercase mb-5 backdrop-blur-sm">
              <Navigation size={13} className="text-blue-400 shrink-0" />
              <span>{badgeText}</span>
            </div>

            {/* Título em Duas Cores (Branco + Amarelo Ventara) */}
            <h2 className="tracking-tight leading-tight mb-4">
              <span className="block text-2xl sm:text-4xl lg:text-5xl font-bold text-white">
                {titlePart1}
              </span>
              <span className="block text-2xl sm:text-4xl lg:text-5xl font-extrabold text-amber-400">
                {titlePart2}
              </span>
            </h2>

            {/* Descrição */}
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light mb-8 max-w-xl">
              {description}
            </p>

            {/* Subtítulo das Cidades com Ícone */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-wider mb-3.5">
              <MapPin size={15} className="shrink-0" />
              <span>{citiesHeading}</span>
            </div>

            {/* Chips de Cidades com Bolinha Amarela (Flex-wrap fluido) */}
            <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-6">
              {cities && cities.length > 0 ? (
                cities.map((city) => (
                  <span
                    key={city.id}
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/70 text-xs sm:text-sm text-white font-medium shadow-sm hover:border-amber-400/40 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span>{city.name}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Nenhuma cidade cadastrada no momento.
                </span>
              )}
            </div>

            {/* Prazos e Condições Opcionais (Apenas se preenchidos e ativados) */}
            {(showTimeframe && timeframe) || (showConditions && conditions) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/10 w-full">
                {showTimeframe && timeframe && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-white/10">
                    <Clock size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                        Prazo Estimado
                      </p>
                      <p className="text-xs text-slate-300 leading-snug">
                        {timeframe}
                      </p>
                    </div>
                  </div>
                )}

                {showConditions && conditions && (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-white/10">
                    <ShieldCheck size={16} className="text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wide">
                        Condições Especiais
                      </p>
                      <p className="text-xs text-slate-300 leading-snug">
                        {conditions}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
