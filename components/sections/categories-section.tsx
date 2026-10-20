"use client";

import React from "react";
import { Glasses, Sun, Sparkles, ArrowUpRight, Compass } from "lucide-react";
import { FrameArt } from "../catalog/frame-art";

export function CategoriesSection() {
  const categories = [
    {
      id: "cat-grau",
      title: "Armações de Grau",
      eyebrow: "ACETATO POLIDO & TITÂNIO",
      description:
        "Design ergonômico em acetato polido à mão e ligas leves para conforto diário prolongado e ajuste milimétrico à sua prescrição.",
      badge: "Mais Procurado",
      href: "#armacoes",
      cta: "Ver modelos",
      solar: false,
      amber: false,
      round: false,
    },
    {
      id: "cat-solar",
      title: "Óculos de Sol",
      eyebrow: "PROTEÇÃO UV400 TOTAL",
      description:
        "Silhuetas marcantes com lentes solares de alto contraste que protegem sua saúde visual com presença e sofisticação.",
      badge: "Coleção Solar",
      href: "#armacoes",
      cta: "Explorar solares",
      solar: true,
      amber: false,
      round: false,
    },
    {
      id: "cat-autoral",
      title: "Curadoria Autoral",
      eyebrow: "EDIÇÃO EXCLUSIVA VENTARA",
      description:
        "Peças selecionadas a dedo com proporções contemporâneas, dobradiças reforçadas e acabamento de alta relojoaria.",
      badge: "Destaque",
      href: "#armacoes",
      cta: "Ver seleção autoral",
      solar: false,
      amber: true,
      round: true,
    },
  ];

  return (
    <section className="py-24 bg-[#040e18] border-b border-white/5 relative overflow-hidden" id="categorias">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#0756b8]/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3 flex items-center gap-2">
              <Sparkles size={14} /> COLEÇÕES & CURADORIA
            </p>
            <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight leading-tight">
              Um estilo para <span className="font-normal text-amber-400">chamar de seu.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-4 leading-relaxed max-w-xl">
              Descubra armações para diferentes estilos, ocasiões e preferências. Encontre seu próximo modelo e veja os detalhes de cada peça.
            </p>
          </div>

          <div className="mt-6 md:mt-0">
            <span className="text-[11px] font-semibold tracking-widest uppercase px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 inline-flex items-center gap-2">
              <Compass size={14} className="text-amber-400" />
              CURADORIA OFICIAL
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={cat.href}
              className="group relative bg-gradient-to-b from-[#091a2e] to-[#06111f] hover:from-[#0c233f] hover:to-[#071626] border border-white/10 hover:border-amber-400/40 rounded-3xl p-7 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl hover:shadow-amber-400/5 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                    {cat.badge}
                  </span>
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-400">
                    {cat.eyebrow}
                  </span>
                </div>

                {/* Visual Representation Stage */}
                <div className="relative h-44 rounded-2xl bg-[#040e18]/80 border border-white/5 flex items-center justify-center p-4 mb-6 overflow-hidden group-hover:border-amber-400/30 transition-colors">
                  <div className="absolute inset-0 bg-radial from-amber-400/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-full max-w-[200px] transform transition-transform duration-500 group-hover:scale-105">
                    <FrameArt solar={cat.solar} amber={cat.amber} round={cat.round} />
                  </div>
                </div>

                <h3 className="text-xl font-medium text-white group-hover:text-amber-300 transition-colors mb-2">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-400 transition-colors font-medium">
                <span>{cat.cta}</span>
                <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-amber-400 group-hover:text-[#06111f] flex items-center justify-center transition-colors">
                  <ArrowUpRight size={14} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
