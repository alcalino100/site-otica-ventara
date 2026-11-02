"use client";

import React from "react";
import Link from "next/link";
import { Truck, Search, ShieldCheck, MapPin, Sparkles, Clock } from "lucide-react";

interface ShippingHeroProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export function ShippingHero({
  title = "Rede de Entregas Ventara",
  subtitle = "Da nossa ótica em Araçatuba para todo o Brasil",
  ctaText = "Rastrear seu pedido",
  ctaUrl = "/rastreio",
}: ShippingHeroProps) {
  return (
    <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden bg-[#02070D] border-b border-white/5">
      {/* Luzes de ambientação sutis */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#0e2744]/40 via-amber-400/5 to-transparent blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 relative z-10 text-center">
        {/* Badge Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-6 shadow-sm">
          <Truck size={14} className="text-amber-400" />
          <span>Estrutura Logística &amp; Rastreamento</span>
        </div>

        {/* Título Principal Fluido */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-5">
          {title.includes("Ventara") ? (
            <>
              {title.replace("Ventara", "").trim()}{" "}
              <span className="font-normal text-amber-400">Ventara</span>
            </>
          ) : (
            title
          )}
        </h1>

        {/* Subtítulo Claro e com Alto Contraste */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-8">
          {subtitle}
        </p>

        {/* CTA Rastreio */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href={ctaUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xl shadow-amber-400/15"
          >
            <Search size={16} />
            <span>{ctaText}</span>
          </Link>

          <a
            href="#aracatuba-regiao"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-white border border-white/15 text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:border-amber-400/40"
          >
            <MapPin size={15} className="text-amber-400" />
            <span>Ver cidades atendidas</span>
          </a>
        </div>

        {/* Indicadores de Confiança / Badges de Segurança */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-3xl mx-auto pt-6 border-t border-white/10 text-left">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-9 h-9 rounded-lg bg-amber-400/15 text-amber-400 flex items-center justify-center shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Araçatuba e Região</p>
              <p className="text-[11px] text-slate-400">Entrega rápida com van própria</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-9 h-9 rounded-lg bg-blue-400/15 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Seguro de Carga Total</p>
              <p className="text-[11px] text-slate-400">Proteção garantida em 100% dos envios</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-9 h-9 rounded-lg bg-emerald-400/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Rastreio Ponto a Ponto</p>
              <p className="text-[11px] text-slate-400">Atualizações em tempo real</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
