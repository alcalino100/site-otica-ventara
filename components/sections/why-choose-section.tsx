"use client";

import React from "react";
import Link from "next/link";
import {
  Microscope,
  CircleDot,
  UserCheck,
  Glasses,
  Timer,
  Tag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { WordsStagger } from "@/registry/spell-ui/words-stagger";

export function WhyChooseSection() {
  const features = [
    {
      icon: Microscope,
      title: "LABORATÓRIO PRÓPRIO",
      description: "Montagem precisa na facetadora.",
      accent: "text-amber-400",
      pillBg: "bg-amber-400/10 border-amber-400/30",
    },
    {
      icon: CircleDot,
      title: "LENTES DE ALTA PERFORMANCE",
      description: "Nitidez, proteção UV e antirreflexo.",
      accent: "text-cyan-400",
      pillBg: "bg-cyan-400/10 border-cyan-400/30",
    },
    {
      icon: UserCheck,
      title: "ATENDIMENTO ESPECIALIZADO",
      description: "Consultoria personalizada para sua visão.",
      accent: "text-emerald-400",
      pillBg: "bg-emerald-400/10 border-emerald-400/30",
    },
    {
      icon: Glasses,
      title: "ARMAÇÕES EXCLUSIVAS",
      description: "Curadoria autoral com acetato e titânio.",
      accent: "text-blue-400",
      pillBg: "bg-blue-400/10 border-blue-400/30",
    },
    {
      icon: Timer,
      title: "PRONTO EM ATÉ 1 HORA",
      description: "Agilidade com precisão digital em laboratório.",
      accent: "text-amber-300",
      pillBg: "bg-amber-300/10 border-amber-300/30",
    },
    {
      icon: Tag,
      title: "PREÇO JUSTO E TRANSPARENTE",
      description: "Alta tecnologia com o melhor custo-benefício.",
      accent: "text-yellow-400",
      pillBg: "bg-yellow-400/10 border-yellow-400/30",
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
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#lentes"
                className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#06111f] hover:bg-[#0756b8] active:scale-95 !text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md group"
                style={{ color: "#ffffff" }}
              >
                <span className="text-white font-bold tracking-wider">Ver Nossas Lentes</span>
                <ArrowRight size={15} className="text-[#ffd62e] group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="/medicao-por-foto"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
              >
                <span>Medição por Foto (DNP)</span>
                <ArrowRight size={13} className="text-amber-600" />
              </a>
            </div>
          </div>

          {/* Coluna Direita: Grid Otimizado de Quadradinhos 3D Dark Navy */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 lg:gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="group relative p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#06111f] via-[#040d1a] to-[#02070d] border border-white/10 hover:border-amber-400/40 shadow-[0_12px_28px_-6px_rgba(2,7,13,0.35),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:-translate-y-1.5 hover:shadow-[0_20px_35px_-6px_rgba(7,86,184,0.3)] transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Detalhe luminoso no topo do card */}
                  <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                  <div>
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${feat.pillBg} ${feat.accent} flex items-center justify-center mb-3 sm:mb-4 border shadow-inner transition-transform group-hover:scale-105 duration-200`}>
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white mb-1.5 leading-snug group-hover:text-amber-300 transition-colors">
                      {feat.title}
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed mt-1">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Destaque do Responsável Técnico: Gustavo Guimarães Cordeiro */}
        <div className="mt-12 sm:mt-16 bg-gradient-to-br from-[#06111f] to-[#02070d] border border-white/10 rounded-3xl overflow-hidden shadow-xl text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Foto do Técnico Óptico */}
            <div className="lg:col-span-5 relative aspect-[3/4] sm:aspect-[4/3] lg:aspect-auto lg:h-[440px] overflow-hidden bg-slate-900">
              <img
                src="/images/team/gustavo-tecnico-optico.jpg"
                alt="Gustavo Guimarães Cordeiro - Técnico Óptico Formado e Responsável Técnico da Óticas Ventara"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-[#06111f]/90 backdrop-blur-xs text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-amber-400/30 shadow-md flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-amber-400" />
                <span>Técnico Óptico Responsável</span>
              </div>
            </div>

            {/* Apresentação Técnica e Credenciais */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
              <div>
                <span className="text-[11px] sm:text-xs font-bold text-amber-400 tracking-widest uppercase block mb-2">
                  AUTORIDADE TÉCNICA &amp; CONFIANÇA
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white tracking-tight mb-2">
                  Gustavo Guimarães Cordeiro
                </h3>
                <p className="text-xs sm:text-sm font-medium text-amber-300 mb-4">
                  Técnico Óptico Formado · Responsável Técnico Óticas Ventara
                </p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mb-6">
                  Na Óticas Ventara, cada lente e armação passa pela supervisão direta de um profissional óptico qualificado. Aliamos nossa formação especializada em física óptica à tecnologia de ponta para garantir calibração milimétrica da sua receita, respeito ao eixo astigmático e conforto visual absoluto.
                </p>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10">
                  <div>
                    <p className="text-base sm:text-lg font-bold text-white">Formação Técnica</p>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Especialista óptico qualificado</p>
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold text-white">Tecnologia Digital</p>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Montagem precisa na facetadora</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/responsavel-tecnico"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-95"
                >
                  <span>Conhecer Perfil Técnico Completo</span>
                  <ArrowRight size={14} />
                </Link>
                <a
                  href="/rastreio"
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors border border-white/10"
                >
                  <span>Rastrear Meu Pedido</span>
                  <ArrowRight size={13} className="text-amber-400" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Destaque Fotográfico: Laboratório Próprio Real em Araçatuba-SP */}
        <div id="laboratorio" className="mt-12 sm:mt-16 bg-slate-50 border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs scroll-mt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Foto Real do Laboratório */}
            <div className="lg:col-span-6 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto min-h-[280px] sm:min-h-[380px] lg:min-h-[440px] overflow-hidden bg-slate-900">
              <img
                src="/images/laboratory/laboratorio-ventara.jpg"
                alt="Laboratório Próprio Óticas Ventara em Araçatuba-SP com Facetadora Computadorizada"
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
                  ESTRUTURA FÍSICA &amp; PRECISÃO DIÓPTRICA
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight mb-3">
                  Nosso Laboratório Próprio em Araçatuba-SP
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  Diferente de óticas que terceirizam e demoram dias, a Ótica Ventara conta com maquinário próprio de alta precisão (facetadora computadorizada automática e lensômetro digital) na Rua Princesa Isabel, 221.
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
