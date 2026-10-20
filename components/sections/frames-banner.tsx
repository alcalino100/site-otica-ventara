"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { WordsStagger } from "@/registry/spell-ui/words-stagger";

export function FramesBanner() {
  return (
    <section className="bg-gradient-to-r from-[#040e18] via-[#061424] to-[#040e18] border-t border-b border-white/10 py-16 sm:py-20 relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-[#0756b8]/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Coluna Esquerda: Eyebrow e Título */}
          <div className="lg:col-span-6">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400 block mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#FFD62E]" /> NOSSAS ARMAÇÕES
            </span>
            <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight leading-tight">
              Estilo para todos <br className="hidden sm:inline" />
              <span className="font-normal text-white">os momentos.</span>
            </h2>
          </div>

          {/* Coluna Direita: Descrição com WordsStagger e Link VER COLEÇÃO */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pl-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0">
            <div className="max-w-md">
              <WordsStagger
                delay={0.1}
                duration={0.35}
                stagger={0.03}
                className="text-xs sm:text-sm text-slate-300 leading-relaxed"
              >
                Das clássicas às modernas, temos armações que combinam com o seu estilo, sua personalidade e o seu dia a dia.
              </WordsStagger>
            </div>

            <a
              href="#armacoes"
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#FFD62E] hover:text-[#FFE066] transition-colors flex-shrink-0 group py-2"
            >
              <span>Ver coleção</span>
              <ArrowRight size={15} className="transform group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
