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
  // Default selected color: "Verde-oliva" (primeira lente da referência oficial 3.jpeg)
  const [selectedId, setSelectedId] = useState<string>("lente-cor-verde-oliva");

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

  const getWhatsAppUrl = (lens: ColoredLensPreset) => {
    const msg = encodeURIComponent(
      `Olá! Estive no site da Ótica Ventara e gostei da Lente Solar na cor "${lens.colorName}" (${lens.name}) com valor de ${lens.priceFormatted}. Gostaria de solicitar um orçamento para o meu grau.`
    );
    return `https://wa.me/5518996155748?text=${msg}`;
  };

  return (
    <section
      className="pt-8 sm:pt-12 pb-16 sm:pb-24 bg-[#02070D] text-white relative overflow-hidden border-b border-white/10 scroll-mt-16"
      id="lentes-coloridas"
      data-hydrated={isMounted ? "true" : "false"}
    >
      {/* Luz ambiente de fundo dinâmica */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] blur-[160px] pointer-events-none transition-colors duration-700 opacity-20"
        style={{ backgroundColor: activeLens.colorHex || "#556B2F" }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 relative z-10">
        {/* Card Principal Estilo Studio Escuro Conforme Referência 3.jpeg */}
        <div className="relative rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-b from-[#091524] via-[#070f1a] to-[#040913] border border-white/10 p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden">
          {/* Linha superior de iluminação */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          {/* GRID PRINCIPAL: 2 COLUNAS (LADO ESQUERDO: TEXTOS E COMPRA | LADO DIREITO: MOSTRUÁRIO OFICIAL 3.JPEG) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* COLUNA ESQUERDA: INFORMAÇÕES TÉCNICAS E VALORES */}
            <div className="lg:col-span-5 space-y-4">
              <div className="w-8 sm:w-10 h-1 bg-amber-400 rounded-full" />

              <div>
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-slate-300 uppercase block">
                  PERSONALIZAÇÃO SOLAR
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mt-1">
                  SUA COR
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 font-normal leading-relaxed">
                  Lentes solares nobres com proteção UV400 total e tonalidades de alta fidelidade visual.
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
                    Proteção UV400
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

            {/* COLUNA DIREITA: MOSTRUÁRIO OFICIAL 3.JPEG (LENTE HERO + ESCOLHA SUA COR 3X3) */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div className="w-full max-w-[540px] rounded-3xl bg-[#040914]/90 border border-white/15 p-4 sm:p-7 shadow-2xl relative">
                
                {/* 1. MOLDURA DA LENTE HERO COM BADGE DEGRADÊ */}
                <div className="relative w-full aspect-[16/9] rounded-2xl bg-gradient-to-b from-[#0a1424] via-[#060c17] to-[#02050b] border border-white/10 overflow-hidden flex items-center justify-center p-4 shadow-inner">
                  
                  {/* Iluminação de fundo do estúdio */}
                  <div className="absolute inset-0 bg-radial from-white/[0.04] to-transparent pointer-events-none" />
                  
                  {/* Badge DEGRADÊ no Canto Superior Direito (Fiel à foto 3.jpeg) */}
                  <div className="absolute top-3.5 right-3.5 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-md">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: activeLens.colorHex || "#d97706" }}
                    />
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-200 uppercase">
                      DEGRADÊ
                    </span>
                  </div>

                  {/* Lente Visual Renderizada com Gradiente Curvo e Efeito de Brilho Estúdio */}
                  <div className="relative w-[78%] h-[82%] flex items-center justify-center transition-transform duration-500 hover:scale-105">
                    {/* Brilho de chão sob a lente */}
                    <div
                      className="absolute -bottom-2 inset-x-6 h-8 rounded-full blur-xl opacity-60 transition-colors duration-500 pointer-events-none"
                      style={{ backgroundColor: activeLens.colorHex }}
                    />

                    {/* SVG da Lente Solar Esportiva Curva com Gradiente Degradê Real */}
                    <svg
                      viewBox="0 0 340 180"
                      className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] filter transition-all duration-500"
                    >
                      <defs>
                        {/* Gradiente Degradê da Lente */}
                        <linearGradient id="lensGradient" x1="15%" y1="0%" x2="85%" y2="100%">
                          <stop offset="0%" stopColor={activeLens.gradientFrom || activeLens.colorHex} stopOpacity="0.95" />
                          <stop offset="55%" stopColor={activeLens.gradientVia || activeLens.colorHex} stopOpacity="0.75" />
                          <stop offset="100%" stopColor={activeLens.gradientTo || "#000000"} stopOpacity="0.35" />
                        </linearGradient>

                        {/* Reflexo Especular Superior de Estúdio */}
                        <linearGradient id="lensReflection" x1="0%" y1="0%" x2="100%" y2="50%">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.15" />
                          <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
                        </linearGradient>

                        {/* Brilho da Borda Chanfrada */}
                        <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                          <stop offset="50%" stopColor={activeLens.colorHex} stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>

                      {/* Corpo da Lente com Contorno Anatômico Elegante */}
                      <path
                        d="M 28 85 C 32 38, 95 24, 185 24 C 275 24, 315 48, 318 85 C 322 135, 260 156, 175 156 C 85 156, 24 135, 28 85 Z"
                        fill="url(#lensGradient)"
                        stroke="url(#edgeGlow)"
                        strokeWidth="2.5"
                      />

                      {/* Ponto Focal de Brilho de Estúdio Superior Direito (Idêntico ao 3.jpeg) */}
                      <ellipse
                        cx="245"
                        cy="46"
                        rx="35"
                        ry="10"
                        transform="rotate(-15 245 46)"
                        fill="#ffffff"
                        opacity="0.65"
                        className="blur-[2px]"
                      />
                      <ellipse
                        cx="248"
                        cy="45"
                        rx="14"
                        ry="4"
                        transform="rotate(-15 248 45)"
                        fill="#ffffff"
                        opacity="0.95"
                      />

                      {/* Arco de Reflexo Suave na Face Superior */}
                      <path
                        d="M 45 75 C 55 45, 110 32, 190 32 C 245 32, 285 46, 298 68"
                        fill="none"
                        stroke="url(#lensReflection)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        className="opacity-70 blur-[1px]"
                      />
                    </svg>
                  </div>
                </div>

                {/* 2. DIVISOR: ESCOLHA SUA COR (Fiel à Referência 3.jpeg) */}
                <div className="flex items-center gap-3 my-5 sm:my-6">
                  <span className="text-[11px] sm:text-xs font-black tracking-[0.2em] text-sky-200/90 uppercase whitespace-nowrap">
                    ESCOLHA SUA COR
                  </span>
                  <div className="flex-1 h-px bg-slate-700/60" />
                </div>

                {/* 3. GRADE 3X3 DE AMOSTRAS ESFÉRICAS 3D (9 CORES EXATAS DE 3.JPEG) */}
                <div className="grid grid-cols-3 gap-y-4 gap-x-2 sm:gap-x-4">
                  {lensList.map((lens) => {
                    const isSelected = lens.id === selectedId;

                    return (
                      <button
                        key={lens.id}
                        type="button"
                        onClick={() => setSelectedId(lens.id)}
                        className="flex flex-col items-center group cursor-pointer focus:outline-none"
                        title={`Selecionar lente na cor ${lens.colorName}`}
                      >
                        {/* Esfera 3D Volumétrica com Efeito de Vidro e Brilho Curvo */}
                        <div
                          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isSelected
                              ? "ring-2 ring-sky-400 ring-offset-2 ring-offset-[#040914] scale-110 shadow-lg shadow-sky-400/40"
                              : "group-hover:scale-105 opacity-90 group-hover:opacity-100"
                          }`}
                        >
                          {/* Anel Externo Escuro Conforme a Foto */}
                          <div className="absolute inset-0 rounded-full border border-white/20 bg-black/40 shadow-inner" />

                          {/* Esfera Colorida com Gradiente Radial */}
                          <div
                            className="w-[84%] h-[84%] rounded-full relative overflow-hidden shadow-md"
                            style={{
                              background: `radial-gradient(circle at 35% 30%, ${lens.gradientFrom || lens.colorHex} 0%, ${lens.colorHex} 60%, ${lens.gradientTo || "#0a0a0a"} 100%)`,
                            }}
                          >
                            {/* Reflexo Especular de Estúdio na Esfera (Brilho Curvo Superior) */}
                            <div className="absolute top-1 left-2 w-6 h-3 rounded-full bg-white/60 blur-[0.6px] transform -rotate-12 pointer-events-none" />
                            <div className="absolute top-1.5 left-2.5 w-3 h-1.5 rounded-full bg-white/90 pointer-events-none" />
                            
                            {/* Reflexo Secundário Inferior Suave */}
                            <div className="absolute bottom-1 right-2 w-4 h-2 rounded-full bg-white/15 blur-[1px] pointer-events-none" />
                          </div>
                        </div>

                        {/* Nome da Cor (Fiel à Foto 3.jpeg) */}
                        <span
                          className={`mt-2 text-[11px] sm:text-xs text-center tracking-tight transition-colors line-clamp-1 ${
                            isSelected ? "text-white font-bold" : "text-slate-300 font-medium group-hover:text-white"
                          }`}
                        >
                          {lens.colorName}
                        </span>

                        {/* Indicador de Ativo */}
                        {isSelected && (
                          <div className="w-4 h-[2px] bg-sky-400 rounded-full mt-1 shadow-sm shadow-sky-400/50" />
                        )}
                      </button>
                    );
                  })}
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
