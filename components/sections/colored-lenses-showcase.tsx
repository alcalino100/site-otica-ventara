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
  const [isMounted, setIsMounted] = useState(false);
  const [lensList, setLensList] = useState<ColoredLensPreset[]>(COLORED_LENSES_LIST);
  // Default selected color: "Cinza Fumê" (primeira lente em destaque na referência do cliente)
  const [selectedId, setSelectedId] = useState<string>("lente-cor-cinza");

  // Carrega preços customizados caso o admin tenha alterado no Supabase/API
  useEffect(() => {
    setIsMounted(true);
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
                    name: found.name && !found.name.startsWith("Lente Colorida") ? found.name : preset.name,
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

  // Separa as cores da referência em 2 linhas orgânicas (3 na primeira, 4 na segunda)
  const row1 = lensList.slice(0, 3); // Cinza Fumê, Marrom, Verde
  const row2 = lensList.slice(3, 7); // Amarelo, Azul Espelhado, Vermelho Espelhado, Degradê
  const extraLenses = lensList.slice(7); // Cores adicionais (ex: Rosa, Roxo)

  const getWhatsAppUrl = (lens: ColoredLensPreset) => {
    const msg = encodeURIComponent(
      `Olá! Estive no site da Ótica Ventara e gostei da Lente Solar na cor "${lens.colorName}" (${lens.name}) com valor de ${lens.priceFormatted}. Gostaria de solicitar um orçamento para o meu grau.`
    );
    return `https://wa.me/5518996155748?text=${msg}`;
  };

  const renderLensButton = (lens: ColoredLensPreset, size: "lg" | "md" = "md") => {
    const isSelected = lens.id === selectedId;

    return (
      <button
        key={lens.id}
        type="button"
        aria-label={lens.colorName}
        onClick={() => setSelectedId(lens.id)}
        className="flex flex-col items-center group cursor-pointer focus:outline-none transition-transform"
        title={`Selecionar lente na cor ${lens.colorName}`}
      >
        {/* Forma Orgânica Elegante com a Foto Real da Lente dentro */}
        <div
          className={`relative ${
            size === "lg"
              ? "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28"
              : "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
          } rounded-full flex items-center justify-center transition-all duration-300 ${
            isSelected
              ? "ring-[2.5px] ring-sky-400 ring-offset-3 ring-offset-[#040914] scale-105 shadow-xl shadow-sky-400/40"
              : "group-hover:scale-105 opacity-85 group-hover:opacity-100 filter drop-shadow-md"
          }`}
        >
          <img
            src={lens.discImage || "/images/lenses/solar/organic-cinza-fume.png"}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
            loading="eager"
          />
        </div>

        {/* Nome da Cor */}
        <span
          className={`mt-2 text-[11px] sm:text-xs text-center tracking-tight transition-colors line-clamp-1 ${
            isSelected
              ? "text-white font-bold"
              : "text-slate-300 font-medium group-hover:text-white"
          }`}
        >
          {lens.colorName}
        </span>

        {/* Traço Indicador de Seleção Ativa (Fiel ao Mockup do Cliente) */}
        {isSelected ? (
          <div className="w-5 sm:w-6 h-[2px] bg-sky-400 rounded-full mt-1.5 shadow-sm shadow-sky-400/60 transition-all duration-200" />
        ) : (
          <div className="w-5 sm:w-6 h-[2px] bg-transparent mt-1.5" />
        )}
      </button>
    );
  };

  return (
    <section
      className="pt-8 sm:pt-12 pb-16 sm:pb-24 bg-[#02070D] text-white relative overflow-hidden border-b border-white/10 scroll-mt-16"
      id="lentes-coloridas"
      data-hydrated={isMounted ? "true" : "false"}
    >
      {/* Luz ambiente de fundo dinâmica que reflete a cor da lente ativa */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] blur-[160px] pointer-events-none transition-colors duration-700 opacity-20"
        style={{ backgroundColor: activeLens.colorHex || "#38bdf8" }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 relative z-10">
        {/* Card Principal Estilo Studio Escuro Conforme Referência do Cliente */}
        <div className="relative rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-b from-[#091524] via-[#070f1a] to-[#040913] border border-white/10 p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden">
          {/* Linha superior de iluminação */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* GRID PRINCIPAL: 2 COLUNAS (LADO ESQUERDO: TEXTOS E COMPRA | LADO DIREITO: MOSTRUÁRIO OFICIAL COM FORMAS ORGÂNICAS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* COLUNA ESQUERDA: INFORMAÇÕES TÉCNICAS E VALORES */}
            <div className="lg:col-span-5 space-y-4">
              <div className="w-8 sm:w-10 h-1 bg-amber-400 rounded-full" />

              <div>
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-slate-300 uppercase block">
                  ENCONTRE SUA COR • PERSONALIZAÇÃO SOLAR
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mt-1">
                  SUA COR
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 font-normal leading-relaxed">
                  Lentes solares para uma nova forma de ver. Tonalidades de alta fidelidade visual com proteção UV400 total.
                </p>
              </div>

              {/* Informações da Cor Ativa */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 border border-white/10">
                    {activeLens.badge}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {activeLens.categoryTag}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0 border border-white/30"
                    style={{ backgroundColor: activeLens.colorHex }}
                  />
                  <span>{activeLens.name}</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {activeLens.description}
                </p>

                {/* Diferenciais Técnicos */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-200 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                    <Check size={12} className="text-emerald-400" />
                    Proteção UV400 Total
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-200 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                    <Check size={12} className="text-emerald-400" />
                    Com ou Sem Grau
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-200 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                    <Check size={12} className="text-emerald-400" />
                    Montagem Expressa 1h
                  </span>
                </div>

                {/* Preço e Botão de WhatsApp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                      A partir de
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                        {activeLens.priceFormatted}
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
                        {activeLens.installmentFormatted}
                      </span>
                    </div>
                  </div>

                  <a
                    href={getWhatsAppUrl(activeLens)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    <span>Pedir esta Cor</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA: MOSTRUÁRIO OFICIAL (LENTE HERO REALISTA + FORMAS ORGÂNICAS COM FOTOS) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div className="w-full max-w-[580px] rounded-3xl bg-[#040914]/90 border border-white/15 p-4 sm:p-7 shadow-2xl relative">
                
                {/* 1. MOLDURA DA LENTE HERO COM ILUMINAÇÃO REALISTA DE ESTÚDIO */}
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl bg-gradient-to-b from-[#0a1424] via-[#060c17] to-[#02050b] border border-white/10 overflow-hidden flex items-center justify-center p-4 shadow-inner group">
                  
                  {/* Iluminação de fundo do estúdio */}
                  <div className="absolute inset-0 bg-radial from-white/[0.04] to-transparent pointer-events-none" />
                  
                  {/* Badge DEGRADÊ / Nome no Canto Superior Direito */}
                  <div className="absolute top-3.5 right-3.5 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-md">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-sm animate-pulse"
                      style={{ backgroundColor: activeLens.colorHex || "#d97706" }}
                    />
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-200 uppercase">
                      {activeLens.badge || "DEGRADÊ"}
                    </span>
                  </div>

                  {/* Lente Visual Renderizada com a Foto Real em Alta Resolução */}
                  <div className="relative w-[85%] h-[85%] flex items-center justify-center transition-transform duration-500 hover:scale-105">
                    {/* Brilho de chão sob a lente */}
                    <div
                      className="absolute -bottom-2 inset-x-8 h-8 rounded-full blur-xl opacity-60 transition-colors duration-500 pointer-events-none"
                      style={{ backgroundColor: activeLens.colorHex }}
                    />

                    <img
                      key={activeLens.id}
                      src={activeLens.heroImage || "/images/lenses/solar/hero-lens-vermelho-espelhado.png"}
                      alt={`Lente Solar Ventara na cor ${activeLens.colorName}`}
                      className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] transition-all duration-500 ease-out"
                    />
                  </div>
                </div>

                {/* 2. DIVISOR: ESCOLHA SUA COR (Fiel à Referência do Cliente) */}
                <div className="flex items-center gap-3 my-5 sm:my-6">
                  <span className="text-[11px] sm:text-xs font-black tracking-[0.2em] text-sky-200/90 uppercase whitespace-nowrap">
                    ESCOLHA SUA COR
                  </span>
                  <div className="flex-1 h-px bg-slate-700/60" />
                </div>

                {/* 3. FORMAS ORGÂNICAS COM AS FOTOS REAIS DAS LENTES DENTRO */}
                <div className="space-y-4 sm:space-y-5">
                  {/* Linha 1: 3 Formas Orgânicas (Cinza Fumê, Marrom, Verde) */}
                  <div className="flex items-center justify-center gap-4 sm:gap-8">
                    {row1.map((lens) => renderLensButton(lens, "lg"))}
                  </div>

                  {/* Linha 2: 4 Formas Orgânicas (Amarelo, Azul Espelhado, Vermelho Espelhado, Degradê) */}
                  <div className="flex items-center justify-center gap-3 sm:gap-6">
                    {row2.map((lens) => renderLensButton(lens, "md"))}
                  </div>

                  {/* Cores adicionais cadastradas no admin (ex: Rosa, Roxo) */}
                  {extraLenses.length > 0 && (
                    <div className="flex items-center justify-center gap-3 sm:gap-6 pt-3 border-t border-white/5">
                      {extraLenses.map((lens) => renderLensButton(lens, "md"))}
                    </div>
                  )}
                </div>

                {/* 4. INDICADOR DE ESTILO / PAGINAÇÃO (Fiel à Referência do Cliente) */}
                <div className="flex items-center justify-center gap-2 mt-5 sm:mt-6">
                  <div className="w-5 h-1 rounded-full bg-sky-400" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
