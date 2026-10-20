import React from "react";
import { Glasses, Focus, HeartHandshake } from "lucide-react";

export function TrustSection() {
  const pillars = [
    {
      Icon: Glasses,
      title: "Seu estilo",
      text: "Curadoria de armações autorais e clássicas para diferentes ocasiões e formatos de rosto.",
    },
    {
      Icon: Focus,
      title: "Sua visão",
      text: "Consultoria especializada em tratamentos antirreflexo, filtro azul e multifocais digitais.",
    },
    {
      Icon: HeartHandshake,
      title: "Sua experiência",
      text: "Atendimento acolhedor, transparente e focado na sua saúde e conforto visual.",
    },
  ];

  return (
    <section className="trust">
      <div className="trust-heading">
        <p className="eyebrow">NOSSA ESSÊNCIA</p>
        <h2>
          Um olhar atento.<br />
          Uma escolha <span>pessoal.</span>
        </h2>
      </div>

      <div className="trust-grid">
        {pillars.map(({ Icon, title, text }) => (
          <div className="trust-item group" key={title}>
            <div className="trust-icon-box">
              <Icon size={28} />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
