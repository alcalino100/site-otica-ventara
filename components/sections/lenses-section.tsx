"use client";

import React from "react";
import {
  Focus,
  Eye,
  Layers,
  SunMedium,
  ShieldCheck,
  FileText,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export function LensesSection() {
  const lensOptions = [
    {
      icon: Eye,
      title: "Lentes Monofocais / Visão Simples",
      tag: "NITIDEZ PRECISA",
      description:
        "Foco exato e campo visual limpo para correção de miopia, hipermetropia ou astigmatismo, tanto para perto quanto para longe.",
    },
    {
      icon: Layers,
      title: "Lentes Multifocais / Progressivas",
      tag: "TRANSIÇÃO SUAVE",
      description:
        "Tecnologia digital que integra campos de visão de perto, intermediário e longe em uma curvatura contínua e sem degraus visíveis.",
    },
    {
      icon: ShieldCheck,
      title: "Antirreflexo & Proteção Luz Azul",
      tag: "CONFORTO DIGITAL",
      description:
        "Tratamento multicamadas que reduz o cansaço ocular causado por monitores e celulares, além de eliminar reflexos em direção noturna.",
    },
    {
      icon: SunMedium,
      title: "Lentes Fotossensíveis / Adaptativas",
      tag: "CONFORTO DINÂMICO",
      description:
        "Clareza translúcida em ambientes internos e escurecimento gradual conforme a intensidade dos raios UV solares em ambientes externos.",
    },
  ];

  const processSteps = [
    {
      step: "01",
      icon: FileText,
      title: "Envie sua receita pelo WhatsApp",
      text: "Fotografe sua prescrição médica atualizada e compartilhe com nossa equipe de consultores.",
    },
    {
      step: "02",
      icon: UserCheck,
      title: "Receba orientação sobre a melhor lente",
      text: "Analisamos o grau, a espessura ideal do bloco e os melhores tratamentos para o seu uso diário.",
    },
    {
      step: "03",
      icon: CheckCircle2,
      title: "Ajuste e montagem com precisão",
      text: "Montagem calibrada e conferência milimétrica da distância nasopupilar (DNP) para conforto total.",
    },
  ];

  const whatsappLensesUrl =
    "https://wa.me/5518996155748?text=Ol%C3%A1!%20Gostaria%20de%20orienta%C3%A7%C3%A3o%20especializada%20sobre%20as%20op%C3%A7%C3%B5es%20de%20lentes%20para%20minha%20receita%20na%20%C3%93tica%20Ventara.";

  return (
    <section className="py-24 bg-[#06111f] border-b border-white/5 relative overflow-hidden" id="lentes">
      {/* Background High-Tech Optical Grid & Light Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#0756b8]/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3 flex items-center gap-2">
            <Sparkles size={14} /> TECNOLOGIA EM LENTES OFTÁLMICAS
          </p>
          <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight leading-tight">
            Seu dia pede uma visão <br className="hidden sm:inline" />
            que <span className="font-normal text-amber-400">acompanha você.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-5 leading-relaxed">
            Conheça as opções de lentes disponíveis e encontre, com orientação especializada, a alternativa adequada à sua prescrição e à sua rotina.
          </p>
        </div>

        {/* 4 Cards Visuais de Lentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {lensOptions.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <div
                key={i}
                className="bg-[#091a2e]/80 backdrop-blur-sm border border-white/10 hover:border-amber-400/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 shadow-lg"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-[#06111f] transition-colors mb-5">
                    <Icon size={22} />
                  </div>
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-amber-400/90 block mb-1">
                    {opt.tag}
                  </span>
                  <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors mb-2.5">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Destaque para o Processo de 3 Passos */}
        <div className="rounded-3xl bg-gradient-to-r from-[#091d33] via-[#0b2440] to-[#091d33] border border-white/10 p-8 sm:p-12 mb-12 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-400 block mb-2">
              COMO FUNCIONA A ESCOLHA DAS SUAS LENTES
            </span>
            <h3 className="text-2xl sm:text-3xl font-light text-white">
              Precisão dióptrica guiada por <span className="font-normal text-amber-400">especialistas</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={idx} className="relative flex flex-col items-start p-5 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between w-full mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                      <StepIcon size={20} />
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400/80">
                      PASSO {step.step}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-2">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="pt-10 mt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-sm text-white font-medium">Tem sua receita oftalmológica em mãos?</p>
              <p className="text-xs text-slate-400">Nossa consultoria técnica analisa os índices e recomenda a melhor espessura.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={whatsappLensesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-400/10"
              >
                <MessageSquare size={16} />
                <span>Falar com especialista em lentes</span>
                <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
