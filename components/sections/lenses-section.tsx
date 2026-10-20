import React from "react";
import { ArrowUpRight, Focus } from "lucide-react";

export function LensesSection() {
  return (
    <section className="lens-section" id="lentes">
      <div className="lens-art" aria-hidden="true">
        <div className="lens-circle" />
        <Focus size={84} strokeWidth={0.7} className="lens-crosshair" />
        <span>PRECISÃO E CONFORTO EM CADA MILÍMETRO</span>
      </div>

      <div className="lens-info">
        <p className="eyebrow">ALÉM DA ARMAÇÃO</p>
        <h2>
          Cada rotina pede<br />
          um novo <span>foco.</span>
        </h2>
        <p>
          Trabalho em telas digitais, leitura prolongada, direção noturna ou passeios ao ar livre.
          Converse com nossos especialistas ópticos e encontre as lentes ideais: antirreflexo multicamadas,
          filtro de luz azul nociva, fotossensíveis e multifocais digitais personalizadas.
        </p>
        <div className="pt-3">
          <a className="button outline inline-flex items-center gap-2" href="#contato">
            CONHECER AS OPÇÕES DE LENTES <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}
