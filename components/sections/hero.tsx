"use client";

import React from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { FrameArt } from "../catalog/frame-art";

export function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-copy">
        <p className="eyebrow flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFD62E] inline-block animate-pulse" />
          QUALIDADE QUE VOCÊ VÊ
        </p>

        <h1>
          Mais que óculos,<br />
          é sobre <strong className="text-[#FFD62E] font-normal">você.</strong>
        </h1>

        <p className="hero-description">
          Na Óticas Ventara, unimos tecnologia, qualidade e atendimento especializado para cuidar da sua visão em todos os momentos.
        </p>

        <div className="hero-cta-wrapper flex flex-wrap items-center gap-4">
          <a className="button outline hover:border-[#FFD62E] group" href="#loja-fisica">
            <span>Conheça nossa loja</span>
            <ArrowRight size={16} className="text-[#FFD62E] transform group-hover:translate-x-1 transition-transform" />
          </a>
          <a className="button dark" href="#armacoes">
            Ver armações
          </a>
        </div>

        <span className="hero-footnote">
          Óticas Ventara · Rua Princesa Isabel, 221 · Centro · Araçatuba-SP
        </span>
      </div>

      <div className="hero-stage">
        {/* Feixes Volumétricos de Luz Azul */}
        <div className="beam" aria-hidden="true" />

        {/* Badge Vertical Dourado Conforme Referência */}
        <div className="hero-side-badge hidden sm:flex items-center gap-3">
          <div className="w-[2px] h-12 bg-[#FFD62E] shadow-[0_0_12px_#FFD62E]" />
          <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-300 leading-tight">
            ARMAÇÕES<br />DE QUALIDADE<br />E ESTILO
          </span>
        </div>

        {/* Armação de Destaque Flutuante */}
        <div className="hero-frame-anim">
          <FrameArt hero />
        </div>

        {/* Pedestal Cilíndrico com Anel Neon Cyan/Azul */}
        <div className="pedestal" aria-hidden="true" />

        {/* Paginação Estilo Mockup da Campanha (01 / 04) */}
        <div className="hero-stage-pagination hidden sm:flex items-center gap-4">
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

        <span className="art-label">CURADORIA AUTORAL VENTARA · ACETATO NOBRE</span>
      </div>

      <div className="hero-bottom">
        <span>ESTILO · PRESENÇA · IDENTIDADE</span>
        <a href="#sobre-nos" aria-label="Conhecer a Ótica Ventara" className="hero-explore-link">
          EXPLORE A VENTARA <ArrowRight size={15} />
        </a>
      </div>
    </section>
  );
}
