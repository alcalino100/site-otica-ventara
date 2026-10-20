"use client";

import React from "react";
import { Glasses, Sun, Sparkles, Eye, ArrowUpRight } from "lucide-react";

export function CategoriesSection() {
  const categories = [
    {
      id: "cat-grau",
      title: "Armações de Grau",
      tag: "CONFORTO & PRECISÃO",
      description: "Design ergonômico em acetato polido à mão e titânio ultra leve para uso diário contínuo.",
      icon: Glasses,
      href: "#armacoes",
      badge: "Mais Procurado",
    },
    {
      id: "cat-solar",
      title: "Óculos de Sol",
      tag: "PROTEÇÃO UV400",
      description: "Lentes de alto contraste com proteção solar total UVA/UVB e silhuetas contemporâneas.",
      icon: Sun,
      href: "#armacoes",
      badge: "Coleção Solar",
    },
    {
      id: "cat-lentes",
      title: "Lentes Oftálmicas",
      tag: "TECNOLOGIA VISUAL",
      description: "Opções de lentes multifocais, visão simples, filtro azul e antirreflexo para sua receita médica.",
      icon: Eye,
      href: "#lentes",
      badge: "Consultoria",
    },
  ];

  return (
    <section className="py-20 bg-[#040e18] border-b border-white/5" id="categorias">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2 flex items-center gap-1.5">
              <Sparkles size={14} /> CATEGORIAS EM DESTAQUE
            </p>
            <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight">
              Curadoria pensada para o <span className="font-normal text-amber-400">seu dia a dia</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-4 md:mt-0 leading-relaxed">
            Navegue pelas principais categorias e descubra a peça perfeita para o seu rosto e a sua rotina visual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <a
                key={cat.id}
                href={cat.href}
                className="group relative bg-[#071626] hover:bg-[#0a2036] border border-white/10 hover:border-amber-400/40 rounded-2xl p-7 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-[#06111f] transition-colors">
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      {cat.badge}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400/90 block mb-1">
                    {cat.tag}
                  </span>
                  <h3 className="text-lg font-semibold text-white group-hover:text-amber-300 transition-colors mb-2.5">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-400 transition-colors">
                  <span className="font-medium">Explorar modelos</span>
                  <ArrowUpRight size={16} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
