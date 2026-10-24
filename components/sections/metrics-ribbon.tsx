"use client";

import React from "react";
import { Users, Star, Clock, ShieldCheck } from "lucide-react";
import { NumberTicker } from "../ui/number-ticker";
import { WordsStagger } from "@/registry/spell-ui/words-stagger";

export function MetricsRibbon() {
  return (
    <section className="bg-[#050e18] border-t border-b border-white/10 py-10 relative z-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Coluna Esquerda: Título com WordsStagger */}
          <div className="lg:col-span-4 pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-white/10 pb-6 lg:pb-0">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 block mb-2">
              NOSSOS NÚMEROS
            </span>
            <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight leading-snug">
              <WordsStagger delay={0.1} duration={0.3} stagger={0.04}>
                Confiança que se transforma em
              </WordsStagger>{" "}
              <span className="font-normal text-[#FFD62E]">resultados.</span>
            </h2>
          </div>

          {/* Coluna Direita: 4 Métricas com Contagem Dinâmica Acelerada */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
            {/* 1. Clientes Atendidos (+ 12.000) */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left sm:border-r sm:border-white/10 sm:pr-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 mb-2.5">
                <Users size={22} strokeWidth={1.5} className="text-[#FFD62E]/90" />
              </div>
              <span className="text-2xl sm:text-3xl font-light text-white tracking-tight leading-none mb-1">
                <NumberTicker
                  value={12000}
                  prefix="+ "
                  duration={1.3}
                  delay={0.15}
                  className="font-light"
                />
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-slate-400 uppercase leading-tight">
                CLIENTES ATENDIDOS
              </span>
            </div>

            {/* 2. Satisfação (100%) */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left sm:border-r sm:border-white/10 sm:pr-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 mb-2.5">
                <Star size={22} strokeWidth={1.5} className="text-[#FFD62E]/90" />
              </div>
              <span className="text-2xl sm:text-3xl font-light text-white tracking-tight leading-none mb-1">
                <NumberTicker
                  value={100}
                  suffix="%"
                  duration={1.2}
                  delay={0.25}
                  className="font-light"
                />
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-slate-400 uppercase leading-tight">
                GARANTIA DE ADAPTAÇÃO ÓPTICA
              </span>
            </div>

            {/* 3. Experiência (+ 3 ANOS) */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left sm:border-r sm:border-white/10 sm:pr-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 mb-2.5">
                <Clock size={22} strokeWidth={1.5} className="text-[#FFD62E]/90" />
              </div>
              <span className="text-2xl sm:text-3xl font-light text-white tracking-tight leading-none mb-1">
                <NumberTicker
                  value={3}
                  prefix="+ "
                  suffix=" ANOS"
                  duration={1.1}
                  delay={0.35}
                  className="font-light"
                />
              </span>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-slate-400 uppercase leading-tight">
                DE EXPERIÊNCIA NO MERCADO
              </span>
            </div>

            {/* 4. Garantia de Qualidade */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 mb-2.5">
                <ShieldCheck size={22} strokeWidth={1.5} className="text-[#FFD62E]/90" />
              </div>
              <div className="leading-tight mb-1">
                <span className="text-sm sm:text-base font-bold text-white tracking-wide block uppercase">
                  GARANTIA
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white tracking-wide block uppercase">
                  DE QUALIDADE
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-slate-400 uppercase leading-tight">
                EM TODOS OS PRODUTOS E SERVIÇOS
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
