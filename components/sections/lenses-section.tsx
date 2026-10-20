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
        <p className="eyebrow">TECNOLOGIA EM LENTES</p>
        <h2>
          Seu dia pede uma visão<br />
          que <span>acompanha você.</span>
        </h2>
        <p>
          Conheça as opções de lentes disponíveis e encontre, com orientação especializada, a alternativa adequada à sua prescrição e à sua rotina.
        </p>
        <div className="pt-3">
          <a className="button outline inline-flex items-center gap-2" href="#whatsapp">
            CONHECER AS OPÇÕES DE LENTES <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}
