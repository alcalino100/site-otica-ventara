"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
  Check,
  Sun,
  Eye,
} from "lucide-react";
import { COLORED_LENSES_LIST, ColoredLensPreset, AdminLensItem } from "@/lib/lenses-data";

interface ColoredLensesShowcaseProps {
  initialLenses?: AdminLensItem[];
}

export function ColoredLensesShowcase({ initialLenses }: ColoredLensesShowcaseProps) {
  const [lensList, setLensList] = useState<ColoredLensPreset[]>(COLORED_LENSES_LIST);
  // Default selected color: "Cinza Fumê" (primeira lente da referência)
  const [selectedId, setSelectedId] = useState<string>("lente-cor-cinza");

  // Carrega preços customizados caso o admin tenha alterado no Supabase/API
  useEffect(() => {
    async function fetchLenses() {
      try {
        const res = await fetch("/api/admin/lenses");
        if (res.ok) {
          const data = await res.json();
          if (data.lenses && Array.isArray(data.lenses)) {
            const adminColoridas = data.lenses.filter(
              (l: AdminLensItem) => l.category === "coloridas" && l.isActive !== false
            );
            if (adminColoridas.length > 0) {
              const merged = COLORED_LENSES_LIST.map((preset) => {
                const found = adminColoridas.find(
                  (a: AdminLensItem) => a.id === preset.id || a.lensColorId === preset.id
                );
                if (found) {
                  return {
                    ...preset,
                    name: found.name || preset.name,
                    priceFormatted: found.startingPrice || preset.priceFormatted,
                    installmentFormatted: found.installment || preset.installmentFormatted,
                    description: found.description || preset.description,
                    badge: found.badge || preset.badge,
                  };
                }
                return preset;
              });
              setLensList(merged);
            }
          }
        }
      } catch (e) {
        // Fallback silencioso para dados locais
      }
    }
    fetchLenses();
  }, []);

  const activeLens =
    lensList.find((l) => l.id === selectedId) || lensList[0] || COLORED_LENSES_LIST[0];

  const row1 = lensList.slice(0, 3); // Cinza Fumê, Marrom, Verde
  const row2 = lensList.slice(3, 7); // Amarelo, Azul Espelhado, Vermelho Espelhado, Degradê

  const getWhatsAppUrl = (lens: ColoredLensPreset) => {
    const msg = encodeURIComponent(
      `Olá! Estive no site da Ótica Ventara e gostei da Lente Solar na cor "${lens.colorName}" (${lens.name}) com valor de ${lens.priceFormatted}. Gostaria de solicitar um orçamento para o meu grau.`
    );
    return `https://wa.me/5518996155748?text=${msg}`;
  };

  return (
    <section
      className="py-14 sm:py-20 bg-[#02070D] text-white relative overflow-hidden border-b border-white/10 scroll-mt-16"
      id="lentes-coloridas"
    >
      {/* Luz ambiente de fundo */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] blur-[140px] pointer-events-none transition-colors duration-700 opacity-25"
        style={{ backgroundColor: activeLens.colorHex || "#38bdf8" }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Card Principal Estilo Studio Escuro (Fiel ao Print do WhatsApp) */}
        <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-[#091524] via-[#070f1a] to-[#040913] border border-white/10 p-6 sm:p-10 shadow-2xl overflow-hidden">
          {/* Luz interna no topo do card */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* 1. TOPO: HEADER + STAGE 3D DA LENTE HERO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Coluna Texto (Lado Esquerdo) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Traço decorativo superior */}
              <div className="w-8 sm:w-10 h-1 bg-slate-500/80 rounded-full" />

              {/* Título Principal */}
              <div>
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-slate-300 uppercase block">
                  ENCONTRE
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase leading-none mt-1">
                  SUA COR
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 font-normal leading-relaxed">
                  Lentes solares para uma nova forma de ver.
                </p>
              </div>

              {/* Informações da Cor Selecionada */}
              <div className="pt-3 border-t border-white/10 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 border border-white/10">
                    {activeLens.badge}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {activeLens.categoryTag}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {activeLens.name}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {activeLens.description}
                </p>

                {/* Diferenciais em Pílulas */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                    <Check size={11} className="text-emerald-400" />
                    Proteção UV400
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                    <Check size={11} className="text-emerald-400" />
                    Com ou Sem Grau
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                    <Check size={11} className="text-emerald-400" />
                    Montagem Expressa
                  </span>
                </div>

                {/* Preço e Botão de Ação Direta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      A partir de
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                        {activeLens.priceFormatted}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {activeLens.installmentFormatted}
                      </span>
                    </div>
                  </div>

                  <a
                    href={getWhatsAppUrl(activeLens)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    <span>Pedir no WhatsApp</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            </div>

            {/* Coluna Visual: Lente 3D com Reflexo de Chão e Luz Estúdio */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[340px] aspect-[4/3] flex items-center justify-center">
                {/* Brilho de chão sob a lente */}
                <div
                  className="absolute bottom-2 inset-x-8 h-10 rounded-full blur-xl opacity-60 transition-colors duration-500 pointer-events-none"
                  style={{ backgroundColor: activeLens.colorHex || "#ef4444" }}
                />

                {/* Selo Flutuante com a cor */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 shadow-lg">
                  <span
                    className="w-2 h-2 rounded-full animate-pulse shadow-sm"
                    style={{ backgroundColor: activeLens.colorHex }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                    {activeLens.colorName}
                  </span>
                </div>

                {/* Imagem da Lente Hero com Transição Suave */}
                <img
                  key={activeLens.id}
                  src={activeLens.heroImage || "/images/lenses/solar/hero-lens.png"}
                  alt={`Lente Solar Ventara na cor ${activeLens.colorName}`}
                  className="w-full h-full object-contain filter drop-shadow-2xl transition-all duration-500 ease-out animate-fadeIn"
                />
              </div>
            </div>
          </div>

          {/* 2. DIVISOR: ESCOLHA SUA COR ———— */}
          <div className="flex items-center gap-3 my-8 sm:my-10">
            <span className="text-[11px] sm:text-xs font-bold tracking-[0.25em] text-slate-400 uppercase whitespace-nowrap">
              ESCOLHA SUA COR
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-600/70 via-slate-700/30 to-transparent" />
          </div>

          {/* 3. GRID DAS 7 CORES EXATAS DO PRINT */}
          <div className="space-y-6 sm:space-y-8">
            {/* Linha 1 (3 Cores): Cinza Fumê, Marrom, Verde */}
            <div className="grid grid-cols-3 gap-3 sm:gap-8 max-w-xl mx-auto">
              {row1.map((lens) => {
                const isSelected = lens.id === selectedId;

                return (
                  <button
                    key={lens.id}
                    type="button"
                    onClick={() => setSelectedId(lens.id)}
                    className="flex flex-col items-center group cursor-pointer focus:outline-none"
                  >
                    {/* Cápsula Oval / Disco Branco com a Lente */}
                    <div
                      className={`relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white flex items-center justify-center transition-all duration-300 shadow-md ${
                        isSelected
                          ? "ring-[2.5px] sm:ring-[3px] ring-sky-400 ring-offset-3 ring-offset-[#08121f] shadow-lg shadow-sky-400/30 scale-105"
                          : "group-hover:scale-105 group-hover:shadow-lg opacity-90 group-hover:opacity-100"
                      }`}
                    >
                      <img
                        src={lens.discImage || "/images/lenses/solar/disc-cinza-fume.png"}
                        alt={lens.colorName}
                        className="w-[90%] h-[90%] object-contain"
                      />
                    </div>

                    {/* Rótulo da Cor */}
                    <div className="mt-2.5 sm:mt-3 text-center">
                      <span
                        className={`text-[11px] sm:text-xs md:text-sm tracking-tight transition-colors block ${
                          isSelected ? "text-white font-bold" : "text-slate-300 font-medium"
                        }`}
                      >
                        {lens.colorName}
                      </span>

                      {/* Traço de Seleção Ativo (Exatamente como em Cinza Fumê no print) */}
                      {isSelected ? (
                        <div className="w-5 sm:w-7 h-[2px] bg-sky-400 mx-auto mt-1 rounded-full shadow-sm shadow-sky-400/50" />
                      ) : (
                        <div className="w-5 sm:w-7 h-[2px] bg-transparent mx-auto mt-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Linha 2 (4 Cores): Amarelo, Azul Espelhado, Vermelho Espelhado, Degradê */}
            <div className="grid grid-cols-4 gap-2 sm:gap-6 max-w-2xl mx-auto">
              {row2.map((lens) => {
                const isSelected = lens.id === selectedId;

                return (
                  <button
                    key={lens.id}
                    type="button"
                    onClick={() => setSelectedId(lens.id)}
                    className="flex flex-col items-center group cursor-pointer focus:outline-none"
                  >
                    {/* Cápsula Oval / Disco Branco com a Lente */}
                    <div
                      className={`relative w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-white flex items-center justify-center transition-all duration-300 shadow-md ${
                        isSelected
                          ? "ring-[2.5px] sm:ring-[3px] ring-sky-400 ring-offset-3 ring-offset-[#08121f] shadow-lg shadow-sky-400/30 scale-105"
                          : "group-hover:scale-105 group-hover:shadow-lg opacity-90 group-hover:opacity-100"
                      }`}
                    >
                      <img
                        src={lens.discImage || "/images/lenses/solar/disc-amarelo.png"}
                        alt={lens.colorName}
                        className="w-[90%] h-[90%] object-contain"
                      />
                    </div>

                    {/* Rótulo da Cor */}
                    <div className="mt-2.5 sm:mt-3 text-center">
                      <span
                        className={`text-[10px] sm:text-xs md:text-sm tracking-tight transition-colors block ${
                          isSelected ? "text-white font-bold" : "text-slate-300 font-medium"
                        }`}
                      >
                        {lens.colorName}
                      </span>

                      {/* Traço de Seleção Ativo */}
                      {isSelected ? (
                        <div className="w-5 sm:w-7 h-[2px] bg-sky-400 mx-auto mt-1 rounded-full shadow-sm shadow-sky-400/50" />
                      ) : (
                        <div className="w-5 sm:w-7 h-[2px] bg-transparent mx-auto mt-1" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
