"use client";

import React from "react";
import { Users, Star, Clock, ShieldCheck } from "lucide-react";

export function MetricsRibbon() {
  const stats = [
    {
      icon: Users,
      value: "+ 12.000",
      label: "CLIENTES ATENDIDOS",
      isHighlighted: true,
    },
    {
      icon: Star,
      value: "100%",
      label: "DE SATISFAÇÃO DOS CLIENTES",
      isHighlighted: true,
    },
    {
      icon: Clock,
      value: "+ 3 ANOS",
      label: "DE EXPERIÊNCIA NO MERCADO",
      isHighlighted: true,
    },
    {
      icon: ShieldCheck,
      value: "GARANTIA",
      subValue: "DE QUALIDADE",
      label: "EM TODOS OS PRODUTOS E SERVIÇOS",
      isHighlighted: false,
    },
  ];

  return (
    <section className="bg-[#050e18] border-t border-b border-white/10 py-10 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Coluna Esquerda: Título */}
          <div className="lg:col-span-4 pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 block mb-2">
              NOSSOS NÚMEROS
            </span>
            <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight leading-snug">
              Confiança que se transforma em{" "}
              <span className="font-normal text-[#FFD62E]">resultados.</span>
            </h2>
          </div>

          {/* Coluna Direita: 4 Métricas */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center sm:items-start text-center sm:text-left ${
                    idx < stats.length - 1 ? "sm:border-r sm:border-white/10 sm:pr-4" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 mb-2.5">
                    <Icon size={22} strokeWidth={1.5} className="text-[#FFD62E]/90" />
                  </div>
                  {stat.isHighlighted ? (
                    <span className="text-2xl sm:text-3xl font-light text-white tracking-tight leading-none mb-1">
                      {stat.value}
                    </span>
                  ) : (
                    <div className="leading-tight mb-1">
                      <span className="text-sm sm:text-base font-bold text-white tracking-wide block uppercase">
                        {stat.value}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-white tracking-wide block uppercase">
                        {stat.subValue}
                      </span>
                    </div>
                  )}
                  <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-slate-400 uppercase leading-tight">
                    {stat.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
