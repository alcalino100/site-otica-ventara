import React from "react";
import { ArrowUpRight, Glasses, Focus, HeartHandshake, ShieldCheck } from "lucide-react";

export function AboutSection() {
  const benefits = [
    { Icon: Glasses, title: "Armações Autorais", text: "Formas e linhas contemporâneas para expressar sua individualidade." },
    { Icon: Focus, title: "Lentes de Alta Precisão", text: "Tratamentos antirreflexo avançados e precisão dióptrica sob medida." },
    { Icon: HeartHandshake, title: "Consultoria Estética", text: "Visagismo óptico para harmonizar a armação com os traços do seu rosto." },
    { Icon: ShieldCheck, title: "Garantia & Cuidado", text: "Ajuste ergonômico presencial, higienização e suporte pós-venda completo." },
  ];

  return (
    <section className="about light-section" id="marca">
      <div className="section-intro">
        <p className="eyebrow">ESSÊNCIA DA MARCA</p>
        <h2>
          A diferença está nos <span>detalhes.</span>
        </h2>
        <p>
          A escolha dos seus óculos vai além da aparência. Queremos ajudar você a encontrar uma combinação de estilo, conforto e funcionalidade.
        </p>
        <div className="pt-2">
          <a href="#loja-fisica" className="button dark inline-flex items-center gap-2">
            CONHEÇA NOSSO ESPAÇO <ArrowUpRight size={17} />
          </a>
        </div>
      </div>

      <div className="benefits">
        {benefits.map(({ Icon, title, text }) => (
          <article key={title} className="benefit-card">
            <div className="benefit-icon">
              <Icon size={26} />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
