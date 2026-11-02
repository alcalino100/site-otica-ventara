"use client";

import React from "react";
import Image from "next/image";
import { Plane, Truck, ShieldCheck, Box, PackageCheck, Globe2 } from "lucide-react";

interface ShippingNationalDeliveryProps {
  title?: string;
  description?: string;
  timeframe?: string;
  conditions?: string;
  imageUrl?: string;
}

export function ShippingNationalDelivery({
  title = "Envio Seguro para Todo o Brasil",
  description = "Para cidades distantes e outros estados, seus óculos são despachados pelas principais transportadoras e Correios com seguro de transporte integral e código de rastreamento ponto a ponto.",
  timeframe = "Prazo calculado automaticamente conforme o seu CEP",
  conditions = "Embalagem rígida reforçada contra impactos em todos os pedidos",
  imageUrl = "/images/shipping/envio-brasil-azul-cargo.png",
}: ShippingNationalDeliveryProps) {
  return (
    <section className="py-20 sm:py-28 bg-[#02070D] relative overflow-hidden border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Coluna da Esquerda: Imagem da Malha Aérea / Expressa */}
          <div className="lg:col-span-5 order-2 lg:order-1 relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-[#061424] shadow-2xl group">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={imageUrl}
                  alt="Aeronave e veículo de transporte expresso para envios nacionais em todo o Brasil"
                  fill
                  sizes="(max-width: 768px) 100vw, 550px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  quality={90}
                />
              </div>

              {/* Legenda Informativa */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 bg-gradient-to-t from-[#02070e] via-[#02070e]/80 to-transparent">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Plane size={14} className="text-amber-400" />
                    Conexão Aérea &amp; Rodoviária
                  </span>
                  <span className="text-slate-400 text-[11px]">Cobertura Nacional</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Textos e Diferenciais */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold tracking-wider uppercase">
              <Globe2 size={13} className="text-amber-400" />
              <span>Alcance em Todo o Território Nacional</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight leading-tight">
              {title}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              {description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <PackageCheck size={15} className="text-amber-400" />
                  <span>Embalagem Segura Inclusa</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {conditions}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Truck size={15} className="text-blue-400" />
                  <span>Cálculo no Checkout</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {timeframe}
                </p>
              </div>
            </div>

            {/* Destaque de Rastreio com Código Oficial */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-400/10 via-amber-400/5 to-transparent border border-amber-400/25 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Box size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Código de Rastreamento Ponto a Ponto
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Assim que o pacote é despachado, você recebe notificações automáticas por e-mail e WhatsApp para acompanhar cada etapa do trajeto até a entrega em suas mãos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
