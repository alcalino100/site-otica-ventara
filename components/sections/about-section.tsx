import React from "react";
import { ArrowUpRight, Glasses, Focus, HeartHandshake, ShieldCheck } from "lucide-react";

export function AboutSection() {
  const benefits = [
    { Icon: Glasses, title: "Armações Autorais", text: "Formas e linhas contemporâneas para expressar sua individualidade." },
    { Icon: Focus, title: "Lentes de Alta Precisão", text: "Laboratório óptico parceiro com certificações internacionais." },
    { Icon: HeartHandshake, title: "Consultoria Estética", text: "Visagismo óptico para harmonizar a armação com os traços do seu rosto." },
    { Icon: ShieldCheck, title: "Garantia & Cuidado", text: "Ajuste contínuo, limpeza ultrassônica e suporte pós-venda completo." },
  ];

  return (
    <section className="about light-section" id="sobre">
      <div className="section-intro">
        <p className="eyebrow">PRAZER, VENTARA</p>
        <h2>
          O seu olhar merece<br />
          uma nova <span>perspectiva.</span>
        </h2>
        <p>
          A Ótica Ventara nasceu com o compromisso de unir design elegante, saúde ocular e consultoria humanizada.
          Acreditamos que usar óculos é um ato de expressão pessoal que transforma a maneira como você se apresenta ao mundo.
        </p>
        <div className="pt-2">
          <a href="#contato" className="button dark inline-flex items-center gap-2">
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
