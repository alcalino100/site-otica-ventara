"use client";

import React from "react";
import { UserCheck, Sparkles, Shield, HeartHandshake, Eye, Check } from "lucide-react";
import { BrandLogo } from "../ui/brand-logo";
import { WordsStagger } from "@/registry/spell-ui/words-stagger";

export function AboutSection() {
  const pillars = [
    {
      icon: UserCheck,
      title: "Atendimento próximo e consultivo",
      description:
        "Cada pessoa tem necessidades visuais únicas. Analisamos sua rotina de trabalho, exposição a telas e formato do rosto para sugerir armações e lentes sob medida.",
    },
    {
      icon: Sparkles,
      title: "Curadoria de armações",
      description:
        "Modelos selecionados rigorosamente para garantir durabilidade, leveza e acabamento de alto padrão, combinando acetato polido e ligas de titânio.",
    },
    {
      icon: Eye,
      title: "Orientação técnica em lentes",
      description:
        "Explicação transparente e fundamentada sobre as melhores opções para sua receita — tratamentos antirreflexo, espessuras de lentes e campos visuais multifocais.",
    },
    {
      icon: HeartHandshake,
      title: "Cuidado do início ao fim",
      description:
        "Desde a primeira conversa até a calibração final das hastes e plaquetas no seu rosto, garantimos conforto absoluto e suporte continuado.",
    },
  ];

  return (
    <section className="py-24 bg-[#040e18] border-b border-white/5 relative overflow-hidden" id="sobre">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 relative z-10">
        {/* Cabeçalho Unificado da Seção */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3 flex items-center gap-2">
            <Shield size={14} /> SOBRE A VENTARA
          </p>
          <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight leading-tight mb-4">
            A diferença está <br className="hidden sm:inline" />
            nos <span className="font-normal text-amber-400">detalhes.</span>
          </h2>
          <div className="max-w-2xl">
            <WordsStagger
              delay={0.1}
              duration={0.35}
              stagger={0.03}
              className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal"
            >
              A escolha dos seus óculos vai além da aparência. Queremos ajudar você a encontrar uma combinação de estilo, conforto e funcionalidade.
            </WordsStagger>
          </div>
        </div>

        {/* Grade 2-Colunas Harmoniosa: 2x2 cards à esquerda + Card Editorial de Manifesto à direita */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Coluna dos 4 Pilares (7 colunas) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#091a2e]/90 border border-white/10 hover:border-amber-400/40 transition-all duration-200 flex flex-col justify-between shadow-lg hover:bg-[#0c2038]"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-4">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-200 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coluna Editorial de Manifesto (5 colunas) */}
          <div className="lg:col-span-5">
            <div className="h-full rounded-3xl bg-gradient-to-b from-[#091d33] to-[#06111f] border border-amber-400/20 p-8 sm:p-10 shadow-2xl overflow-hidden flex flex-col justify-between relative">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />

              <div className="relative z-10">
                <div className="mb-6">
                  <BrandLogo variant="hero" />
                </div>

                <blockquote className="space-y-4 border-l-2 border-amber-400 pl-4 my-6">
                  <p className="text-sm text-slate-100 italic leading-relaxed font-normal">
                    &ldquo;Acreditamos que óculos não devem ser um mero acessório, mas uma extensão da sua identidade e a garantia de conforto pleno na sua rotina.&rdquo;
                  </p>
                  <cite className="text-xs font-semibold uppercase tracking-wider text-amber-400 not-italic block">
                    — Filosofia Ótica Ventara
                  </cite>
                </blockquote>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-3 relative z-10">
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Check size={15} className="text-amber-400 flex-shrink-0" />
                  <span>Loja física no Centro de Araçatuba-SP</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Check size={15} className="text-amber-400 flex-shrink-0" />
                  <span>Laboratório próprio com montagem precisa</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Check size={15} className="text-amber-400 flex-shrink-0" />
                  <span>Consultores ópticos dedicados</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-200">
                  <Check size={15} className="text-amber-400 flex-shrink-0" />
                  <span>Ajuste anatômico presencial sem custos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
