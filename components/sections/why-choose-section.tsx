"use client";

import React from "react";
import {
  Microscope,
  CircleDot,
  UserCheck,
  Glasses,
  Timer,
  Tag,
  ArrowRight,
} from "lucide-react";
import { WordsStagger } from "@/registry/spell-ui/words-stagger";

export function WhyChooseSection() {
  const features = [
    {
      icon: Microscope,
      title: "LABORATÓRIO PRÓPRIO",
      description: "Precisão e agilidade na produção das suas lentes.",
    },
    {
      icon: CircleDot,
      title: "LENTES DE ALTA PERFORMANCE",
      description: "Mais nitidez, proteção e conforto para seus olhos.",
    },
    {
      icon: UserCheck,
      title: "ATENDIMENTO ESPECIALIZADO",
      description: "Nossa equipe está preparada para te ajudar.",
    },
    {
      icon: Glasses,
      title: "ARMAÇÕES EXCLUSIVAS",
      description: "Estilo, conforto e as melhores marcas.",
    },
    {
      icon: Timer,
      title: "SEU ÓCULOS PRONTO EM ATÉ 1H",
      description: "Agilidade para você não perder tempo.",
    },
    {
      icon: Tag,
      title: "PREÇOS JUSTOS",
      description: "Qualidade e tecnologia com o melhor custo-benefício.",
    },
  ];

  return (
    <section className="bg-white py-24 text-slate-900 relative z-10 border-b border-slate-200" id="sobre-nos">
      <div id="laboratorio" className="sr-only">Seção Laboratório Próprio</div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Coluna Esquerda: Texto & CTA com WordsStagger */}
          <div className="lg:col-span-4 flex flex-col items-start pr-0 lg:pr-6">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500 mb-2">
              POR QUE ESCOLHER
            </span>
            <h2 className="text-3xl sm:text-5xl font-light text-slate-950 tracking-tight leading-tight mb-5">
              Óticas Ventara?
            </h2>
            <div className="mb-8">
              <WordsStagger
                delay={0.1}
                duration={0.35}
                stagger={0.03}
                className="text-sm text-slate-600 leading-relaxed"
              >
                Aqui você encontra armações exclusivas, lentes das melhores marcas e um laboratório próprio, com toda a tecnologia e precisão para garantir o melhor para a sua visão.
              </WordsStagger>
            </div>
            <a
              href="#armacoes"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#06111f] hover:bg-[#0756b8] active:scale-95 text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm"
            >
              <span>Saiba mais</span>
              <ArrowRight size={15} />
            </a>
          </div>

          {/* Coluna Direita: Grid de 6 Recursos (2x3) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-start"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0756b8] mb-4">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
