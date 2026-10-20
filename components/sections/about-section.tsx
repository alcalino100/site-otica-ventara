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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Coluna de Texto & Pilares */}
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3 flex items-center gap-2">
              <Shield size={14} /> SOBRE A VENTARA
            </p>
            <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight leading-tight mb-5">
              A diferença está <br className="hidden sm:inline" />
              nos <span className="font-normal text-amber-400">detalhes.</span>
            </h2>
            <div className="mb-12 max-w-2xl">
              <WordsStagger
                delay={0.1}
                duration={0.35}
                stagger={0.03}
                className="text-sm sm:text-base text-slate-300 leading-relaxed"
              >
                A escolha dos seus óculos vai além da aparência. Queremos ajudar você a encontrar uma combinação de estilo, conforto e funcionalidade.
              </WordsStagger>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {pillars.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#091a2e]/70 border border-white/5 hover:border-amber-400/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-4">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna Visual Editorial */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-b from-[#091d33] to-[#06111f] border border-amber-400/20 p-8 sm:p-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />

              <div className="mb-8">
                <BrandLogo variant="hero" />
              </div>

              <blockquote className="space-y-4 border-l-2 border-amber-400 pl-4 mb-8">
                <p className="text-sm text-slate-200 italic leading-relaxed">
                  &ldquo;Acreditamos que óculos não devem ser um mero acessório, mas uma extensão da sua identidade e a garantia de conforto pleno na sua rotina.&rdquo;
                </p>
                <cite className="text-xs font-semibold uppercase tracking-wider text-amber-400 not-italic block">
                  — Filosofia Ótica Ventara
                </cite>
              </blockquote>

              <div className="pt-6 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Check size={15} className="text-amber-400" />
                  <span>Loja física no Centro de Araçatuba-SP</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Check size={15} className="text-amber-400" />
                  <span>Consultores ópticos dedicados</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <Check size={15} className="text-amber-400" />
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
