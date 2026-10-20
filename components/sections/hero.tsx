"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { FrameArt } from "../catalog/frame-art";

export function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-copy">
        <p className="eyebrow">SEU ESTILO. SEU OLHAR.</p>
        <h1>
          Mais que óculos.<br />
          Seu jeito de <strong>ver o mundo.</strong>
        </h1>
        <p className="hero-description">
          Encontre armações que combinam com sua personalidade e conheça opções de lentes pensadas para as suas necessidades. Na Ótica Ventara, seu próximo olhar começa com a escolha certa.
        </p>
        <div className="hero-cta-wrapper flex flex-wrap items-center gap-4">
          <a className="button outline" href="#armacoes">
            Explorar coleção <ArrowRight size={17} />
          </a>
          <a className="button dark" href="#sobre">
            Conhecer nossa loja
          </a>
        </div>
        <span className="hero-footnote">Ótica Ventara · Rua Princesa Isabel, 221 · Araçatuba - SP</span>
      </div>

      <div className="hero-stage">
        <div className="beam" aria-hidden="true" />
        <span className="product-note">
          DESIGN QUE ACOMPANHA<br />O SEU OLHAR
        </span>
        <div className="hero-frame-anim">
          <FrameArt hero />
        </div>
        <div className="pedestal" aria-hidden="true" />
        <span className="art-label">ARMAÇÃO CONCEITUAL · ILUSTRAÇÃO EXCLUSIVA</span>
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
