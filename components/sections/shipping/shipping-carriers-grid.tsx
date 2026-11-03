"use client";

import React from "react";
import Image from "next/image";
import { Truck, Clock, ShieldCheck, Check } from "lucide-react";
import { ShippingCarrier } from "@/types/shipping";

interface ShippingCarriersGridProps {
  title?: string;
  subtitle?: string;
  carriers?: ShippingCarrier[];
}

export function ShippingCarriersGrid({
  title = "Transportadoras que utilizamos",
  subtitle = "Enviamos com os maiores operadores logísticos do país para garantir agilidade e pontualidade",
  carriers = [],
}: ShippingCarriersGridProps) {
  // Filtra apenas ativas e ordena
  const activeCarriers = carriers
    .filter((c) => c.is_active !== false)
    .sort((a, b) => a.sort_order - b.sort_order);

  // Se nenhuma estiver ativa, oculta a seção inteira conforme especificação
  if (activeCarriers.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-16 bg-[#030913] relative overflow-hidden border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-semibold tracking-wider uppercase mb-4">
            <Truck size={14} className="text-amber-400" />
            <span>Rede Integrada de Despacho</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight leading-tight mb-4">
            {title}
          </h2>

          <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Grid de Cards Dinâmicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeCarriers.map((carrier) => (
            <div
              key={carrier.id}
              className="group rounded-2xl bg-[#061424]/60 border border-white/10 hover:border-amber-400/40 p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Imagem / Logo da Transportadora */}
                {carrier.logo_url && (
                  <div className="relative h-32 w-full rounded-xl overflow-hidden bg-[#02070e] border border-white/5">
                    <Image
                      src={carrier.logo_url}
                      alt={`Veículo ou serviço logístico: ${carrier.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-base font-semibold text-white tracking-tight flex items-center justify-between">
                    <span>{carrier.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Ativa e operando" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed font-light">
                    {carrier.description}
                  </p>
                </div>
              </div>

              {/* Prazo Médio */}
              <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                  <Clock size={14} className="shrink-0" />
                  <span className="truncate">{carrier.delivery_time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Check size={13} className="text-emerald-400 shrink-0" />
                  <span>Código de rastreamento incluso</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nota de conformidade e transparência */}
        <div className="mt-10 text-center">
          <p className="text-[11px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
            * Trabalhamos com operadores logísticos e serviços postais independentes para assegurar a melhor rota e menor prazo até a sua localidade. Os prazos são estimativas que podem variar em feriados ou áreas com restrições temporárias.
          </p>
        </div>
      </div>
    </section>
  );
}
