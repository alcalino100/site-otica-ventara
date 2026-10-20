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
          SEU ESTILO. SEU OLHAR.
        </p>

        <h1>
          Mais que óculos.<br />
          Seu jeito de <strong>ver o mundo.</strong>
        </h1>

        <p className="hero-description">
          Armações que expressam quem você é. Opções de lentes para acompanhar sua rotina. Encontre o seu próximo olhar na Ótica Ventara.
        </p>

        <div className="hero-cta-wrapper flex flex-wrap items-center gap-4">
          <a className="button outline hover:border-[#FFD62E] group" href="#armacoes">
            <span>Explorar coleção</span>
            <ArrowRight size={17} className="text-[#FFD62E] transform group-hover:translate-x-1 transition-transform" />
          </a>
          <a className="button dark" href="#loja-fisica">
            Conhecer nossa loja
          </a>
        </div>

        <span className="hero-footnote">
          Ótica Ventara · Rua Princesa Isabel, 221 · Centro · Araçatuba-SP
        </span>
      </div>

      <div className="hero-stage">
        {/* Feixe de Luz Azul Controlado */}
        <div className="beam" aria-hidden="true" />

        {/* Badge Vertical Dourado Inspirado na Referência */}
        <div className="hero-side-badge hidden sm:flex items-center gap-3">
          <div className="w-[2px] h-11 bg-[#FFD62E] shadow-[0_0_10px_#FFD62E]" />
          <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-slate-300 leading-tight">
            ARMAÇÕES<br />DE QUALIDADE<br />E ESTILO
          </span>
        </div>

        {/* Selo Flutuante */}
        <span className="product-note">
          DESIGN QUE ACOMPANHA<br />O SEU OLHAR
        </span>

        {/* Armação de Destaque Flutuante */}
        <div className="hero-frame-anim">
          <FrameArt hero />
        </div>

        {/* Pedestal Cilíndrico com Anel Neon Azul */}
        <div className="pedestal" aria-hidden="true" />

        {/* Paginação Estilo Campanha Editorial */}
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
        <a href="#sobre" aria-label="Conhecer a Ótica Ventara" className="hero-explore-link">
          EXPLORE A VENTARA <ArrowRight size={15} />
        </a>
      </div>
    </section>
  );
}
