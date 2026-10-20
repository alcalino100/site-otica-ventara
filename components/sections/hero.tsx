"use client";

import React from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { FrameArt } from "../catalog/frame-art";
import { WordsStagger } from "@/registry/spell-ui/words-stagger";

export function Hero() {
  return (
    <section className="hero relative overflow-hidden" id="inicio">
      {/* Container Unificado Padrão UI/UX */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-36 pb-10 sm:pt-40 sm:pb-14 relative z-10 flex flex-col justify-between flex-1 min-h-[700px] sm:min-h-[760px]">
        {/* Grid de 2 Colunas Perfeitamente Margeado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1 my-auto">
          {/* Coluna Esquerda: Texto */}
          <div className="hero-copy lg:col-span-5 relative z-10 max-w-xl">
            <p className="eyebrow flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD62E] inline-block animate-pulse" />
              QUALIDADE QUE VOCÊ VÊ
            </p>

            <h1 className="text-4xl sm:text-6xl font-light text-white tracking-tight leading-tight">
              Mais que óculos,<br />
              é sobre <strong className="text-[#FFD62E] font-normal">você.</strong>
            </h1>

            <div className="hero-description my-4">
              <WordsStagger
                delay={0.2}
                duration={0.35}
                stagger={0.03}
                className="text-sm sm:text-base leading-relaxed text-slate-300"
              >
                Na Óticas Ventara, unimos tecnologia, qualidade e atendimento especializado para cuidar da sua visão em todos os momentos.
              </WordsStagger>
            </div>

            <div className="hero-cta-wrapper flex flex-wrap items-center gap-4 mt-6">
              <a className="button outline hover:border-[#FFD62E] group" href="#loja-fisica">
                <span>Conheça nossa loja</span>
                <ArrowRight size={16} className="text-[#FFD62E] transform group-hover:translate-x-1 transition-transform" />
              </a>
              <a className="button dark" href="#armacoes">
                Ver armações
              </a>
            </div>

            <span className="hero-footnote block text-[11px] text-slate-400 mt-6 tracking-wide">
              Óticas Ventara · Rua Princesa Isabel, 221 · Centro · Araçatuba-SP
            </span>
          </div>

          {/* Coluna Direita: Stage e Pedestal Alinhados */}
          <div className="hero-stage lg:col-span-7 relative flex items-center justify-center min-h-[360px] sm:min-h-[440px]">
            {/* Feixes Volumétricos de Luz Azul */}
            <div className="beam" aria-hidden="true" />

            {/* Badge Vertical Dourado Conforme Referência */}
            <div className="hero-side-badge hidden sm:flex items-center gap-3 absolute top-2 right-2 z-20">
              <div className="w-[2px] h-12 bg-[#FFD62E] shadow-[0_0_12px_#FFD62E]" />
              <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-300 leading-tight">
                ARMAÇÕES<br />DE QUALIDADE<br />E ESTILO
              </span>
            </div>

            {/* Armação de Destaque Flutuante */}
            <div className="hero-frame-anim relative z-10 w-full max-w-[460px] mx-auto">
              <FrameArt hero />
            </div>

            {/* Pedestal Cilíndrico com Anel Neon Cyan/Azul */}
            <div className="pedestal" aria-hidden="true" />

            {/* Paginação Estilo Mockup da Campanha (01 / 04) */}
            <div className="hero-stage-pagination hidden sm:flex items-center gap-4 absolute bottom-2 right-2 z-20">
              <span className="text-[11px] font-mono text-slate-400 tracking-wider">
                <strong className="text-white">01</strong> / 04
              </span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <button
                  type="button"
                  aria-label="Modelo anterior"
                  className="w-7 h-7 rounded-full border border-white/10 hover:border-white/30 flex items-center justify-center hover:text-white transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Próximo modelo"
                  className="w-7 h-7 rounded-full border border-white/10 hover:border-white/30 flex items-center justify-center hover:text-white transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <span className="art-label absolute bottom-14 right-2 text-[9px] text-slate-400 tracking-wider">
              CURADORIA AUTORAL VENTARA · ACETATO NOBRE
            </span>
          </div>
        </div>

        {/* Barra Inferior Rigorosamente Margeada no Mesmo Container */}
        <div className="hero-bottom pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[10px] tracking-widest text-slate-400">
          <span>ESTILO · PRESENÇA · IDENTIDADE</span>
          <a href="#sobre-nos" aria-label="Conhecer a Ótica Ventara" className="hero-explore-link flex items-center gap-2 hover:text-[#FFD62E] transition-colors">
            <span>EXPLORE A VENTARA</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
