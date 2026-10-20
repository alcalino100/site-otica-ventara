"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { FrameArt } from "../catalog/frame-art";

export function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-copy">
        <p className="eyebrow">UM NOVO OLHAR PARA O SEU MUNDO</p>
        <h1>
          Mais que óculos.<br />
          É sobre <strong>você.</strong>
        </h1>
        <p className="hero-description">
          Seu estilo, sua rotina, seu jeito de ver a vida. Descubra armações autorais e lentes de alta precisão
          feitas sob medida para o seu bem-estar.
        </p>
        <div className="hero-cta-wrapper">
          <a className="button outline" href="#armacoes">
            ENCONTRE SUA ARMAÇÃO <ArrowRight size={17} />
          </a>
        </div>
        <span className="hero-footnote">Ótica Ventara · Araçatuba - SP</span>
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
