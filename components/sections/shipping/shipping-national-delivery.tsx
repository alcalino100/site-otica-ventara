"use client";

import React from "react";
import Image from "next/image";
import { Plane, Truck, Mail, Globe2, Box, CheckCircle2 } from "lucide-react";
import { NationalShipmentCard } from "@/types/shipping";

interface ShippingNationalDeliveryProps {
  title?: string;
  subtitle?: string;
  trackingNote?: string;
  cards?: NationalShipmentCard[];
  imageUrl?: string;
}

export function ShippingNationalDelivery({
  title = "Enviamos para todo o Brasil",
  subtitle = "Se você mora em outro estado, escolhemos a melhor rota para o seu pedido chegar mais rápido.",
  trackingNote = "Todo envio nacional segue com código de rastreamento ponta a ponta.",
  cards = [],
}: ShippingNationalDeliveryProps) {
  const activeCards = cards.filter((c) => c.is_active !== false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "plane":
        return <Plane size={20} className="text-amber-400" />;
      case "truck":
        return <Truck size={20} className="text-blue-400" />;
      case "mail":
      default:
        return <Mail size={20} className="text-amber-400" />;
    }
  };

  const getOverlayClass = (overlay?: string) => {
    switch (overlay) {
      case "strong":
        return "from-[#081326] via-[#081326]/75 to-transparent";
      case "subtle":
        return "from-[#081326] via-[#081326]/20 to-transparent";
      case "medium":
      default:
        return "from-[#081326] via-[#081326]/40 to-transparent";
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-[#02070D] relative overflow-hidden border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        {/* Cabeçalho da Seção */}
        <div className="max-w-3xl mb-12 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-4">
            <Globe2 size={13} className="text-amber-400" />
            <span>Cobertura Interestadual</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight leading-tight mb-4">
            {title}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
            {subtitle}
          </p>
        </div>

        {/* Grid de Cartões Nacionais com ou sem Fotos */}
        {activeCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 items-stretch">
            {activeCards.map((card) => {
              const hasImage = Boolean(card.image_url && card.show_image !== false);

              return (
                <div
                  key={card.id}
                  data-testid={`national-card-${card.id}`}
                  className="relative overflow-hidden rounded-2xl bg-[#081326] border border-blue-900/30 flex flex-col justify-between hover:border-amber-400/40 transition-all duration-300 shadow-xl group"
                >
                  <div>
                    {/* 1. Imagem no Topo do Cartão (Largura Total com Aspect 16/9) */}
                    {hasImage && (
                      <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-950">
                        <Image
                          src={card.image_url!}
                          alt={card.image_alt || card.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 420px"
                          style={{ objectPosition: card.image_position || "center" }}
                          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                        />

                        {/* Gradiente escuro suave na base para integrar com o corpo azul-marinho */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-t ${getOverlayClass(
                            card.image_overlay
                          )} pointer-events-none`}
                          aria-hidden="true"
                        />

                        {/* Selo Translúcido Sobreposto à Foto no Canto Superior Direito */}
                        {card.badge && (
                          <div className="absolute top-3 right-3 z-10">
                            <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-950/70 border border-white/20 text-amber-300 uppercase tracking-wide backdrop-blur-md shadow-md">
                              {card.badge}
                            </span>
                          </div>
                        )}

                        {/* Legenda/Crédito Opcional da Foto */}
                        {card.image_caption && (
                          <div className="absolute bottom-2 left-3 z-10">
                            <span className="text-[10px] text-slate-300/80 bg-slate-950/60 px-2 py-0.5 rounded backdrop-blur-sm font-mono">
                              {card.image_caption}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. Corpo do Cartão */}
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Cabeçalho do Cartão: Ícone e Selo (quando não houver imagem) */}
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          {getIcon(card.icon_name)}
                        </div>

                        {!hasImage && card.badge && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 uppercase tracking-wide">
                            {card.badge}
                          </span>
                        )}
                      </div>

                      {/* Título e Descrição */}
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                          {card.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Rodapé do Cartão com Prazo de Envio */}
                  <div className="p-5 sm:p-6 pt-0">
                    <div className="pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-amber-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{card.delivery_time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Card Destaque de Rastreio com Código Oficial */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-400/10 via-amber-400/5 to-transparent border border-amber-400/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Box size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                Rastreamento Seguro Ponto a Ponto
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                {trackingNote}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 shrink-0">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Código via WhatsApp &amp; E-mail</span>
          </div>
        </div>
      </div>
    </section>
  );
}
