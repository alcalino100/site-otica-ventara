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
      description: "Montagem precisa na biseladora digital AM-295.",
    },
    {
      icon: CircleDot,
      title: "LENTES DE ALTA PERFORMANCE",
      description: "Nitidez, proteção UV e antirreflexo.",
    },
    {
      icon: UserCheck,
      title: "ATENDIMENTO ESPECIALIZADO",
      description: "Consultoria personalizada para sua visão.",
    },
    {
      icon: Glasses,
      title: "ARMAÇÕES EXCLUSIVAS",
      description: "Curadoria autoral com acetato e titânio.",
    },
    {
      icon: Timer,
      title: "PRONTO EM ATÉ 1 HORA",
      description: "Agilidade com precisão digital em laboratório.",
    },
    {
      icon: Tag,
      title: "PREÇO JUSTO E TRANSPARENTE",
      description: "Alta tecnologia com o melhor custo-benefício.",
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-20 lg:py-24 text-slate-900 relative z-10 border-b border-slate-200" id="sobre-nos">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Coluna Esquerda: Texto & CTA com WordsStagger */}
          <div className="lg:col-span-4 flex flex-col items-start pr-0 lg:pr-6">
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-slate-500 mb-2">
              POR QUE ESCOLHER
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-light text-slate-950 tracking-tight leading-tight mb-3 sm:mb-5">
              Óticas Ventara?
            </h2>
            <div className="mb-6 sm:mb-8">
              <WordsStagger
                delay={0.1}
                duration={0.35}
                stagger={0.03}
                className="text-xs sm:text-sm text-slate-600 leading-relaxed"
              >
                Aqui você encontra armações exclusivas, lentes das melhores marcas e um laboratório próprio, com toda a tecnologia e precisão para garantir o melhor para a sua visão.
              </WordsStagger>
            </div>
            <a
              href="#armacoes"
              className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#06111f] hover:bg-[#0756b8] active:scale-95 !text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md group"
              style={{ color: "#ffffff" }}
            >
              <span className="text-white font-bold tracking-wider">Saiba mais</span>
              <ArrowRight size={15} className="text-[#ffd62e] group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Coluna Direita: Grid Otimizado (2 colunas no mobile, 3 no tablet/desktop) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-amber-400/60 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 sm:text-[#0756b8] flex items-center justify-center mb-2.5 sm:mb-4">
                      <Icon size={18} strokeWidth={1.8} className="sm:hidden" />
                      <Icon size={20} strokeWidth={1.8} className="hidden sm:block" />
                    </div>
                    <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900 mb-1 sm:mb-2 leading-snug">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed mt-1">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Destaque Fotográfico: Laboratório Próprio Real em Araçatuba-SP */}
        <div id="laboratorio" className="mt-12 sm:mt-16 bg-slate-50 border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs scroll-mt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Foto Real do Laboratório com proporções naturais e altura ampliada */}
            <div className="lg:col-span-6 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto min-h-[280px] sm:min-h-[380px] lg:min-h-[440px] overflow-hidden bg-slate-900">
              <img
                src="/images/laboratory/laboratorio-ventara.jpg"
                alt="Laboratório Próprio Óticas Ventara em Araçatuba-SP com Biseladora Computadorizada"
                className="w-full h-full block hover:scale-105 transition-transform duration-500"
                style={{ objectFit: "cover", objectPosition: "center", width: "100%", height: "100%" }}
              />
              <div className="absolute top-4 left-4 bg-[#06111f]/90 backdrop-blur-xs text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-amber-400/30 shadow-md">
                FOTO REAL DA LOJA FÍSICA
              </div>
            </div>

            {/* Texto Descritivo e Diferenciais do Laboratório */}
            <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
              <div>
                <span className="text-[11px] sm:text-xs font-bold text-amber-600 tracking-widest uppercase block mb-2">
                  ESTRUTURA FÍSICA & PRECISÃO DIÓPTRICA
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight mb-3">
                  Nosso Laboratório Próprio em Araçatuba-SP
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  Diferente de óticas que terceirizam e demoram dias, a Ótica Ventara conta com maquinário próprio de alta precisão (biseladora computadorizada automática e lensômetro digital) na Rua Princesa Isabel, 221.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-slate-200/80">
                <div>
                  <p className="text-lg sm:text-2xl font-extrabold text-slate-900 font-mono">Em até 1 hora</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Montagem expressa para monofocais</p>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-extrabold text-slate-900 font-mono">100% Calibrado</p>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Medição milimétrica da DNP e altura</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
