"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sun,
  Shield,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Eye,
  Check,
} from "lucide-react";
import { COLORED_LENSES_LIST, ColoredLensPreset, AdminLensItem } from "@/lib/lenses-data";

interface ColoredLensesShowcaseProps {
  initialLenses?: AdminLensItem[];
}

export function ColoredLensesShowcase({ initialLenses }: ColoredLensesShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lensList, setLensList] = useState<ColoredLensPreset[]>(COLORED_LENSES_LIST);
  const carouselRef = useRef<HTMLDivElement>(null);

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
              // Mescla os dados administrativos com as cores predefinidas
              const merged = COLORED_LENSES_LIST.map((preset) => {
                const found = adminColoridas.find((a: AdminLensItem) => a.id === preset.id);
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

  const total = lensList.length;

  const scrollToCard = (index: number) => {
    const validIdx = Math.max(0, Math.min(index, total - 1));
    setCurrentIndex(validIdx);
    if (carouselRef.current) {
      const card = carouselRef.current.children[validIdx] as HTMLElement;
      if (card) {
        card.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  const handlePrev = () => {
    scrollToCard(currentIndex > 0 ? currentIndex - 1 : total - 1);
  };

  const handleNext = () => {
    scrollToCard(currentIndex < total - 1 ? currentIndex + 1 : 0);
  };

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 24
      : 300;
    const newIdx = Math.round(scrollLeft / cardWidth);
    if (newIdx >= 0 && newIdx < total && newIdx !== currentIndex) {
      setCurrentIndex(newIdx);
    }
  };

  const getWhatsAppUrl = (lens: ColoredLensPreset) => {
    const msg = encodeURIComponent(
      `Olá! Estive no site da Ótica Ventara e gostei da Lente Colorida na cor "${lens.colorName}" (${lens.name}) com valor de ${lens.priceFormatted}. Gostaria de solicitar um orçamento para o meu grau.`
    );
    return `https://wa.me/5518996155748?text=${msg}`;
  };

  return (
    <section
      className="py-16 sm:py-24 bg-[#06111f] text-white relative overflow-hidden border-b border-white/10"
      id="lentes-coloridas"
    >
      {/* Luz ambiente de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        {/* Header da Coleção */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Sparkles size={16} />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase">
                COLEÇÃO DE LENTES SOLARES &amp; PERFORMANCE VENTARA
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-light tracking-tight leading-tight text-white">
              Lentes Coloridas &amp; Filtros Especiais <br className="hidden sm:inline" />
              <strong className="font-semibold text-amber-400">em 8 cores de alta fidelidade.</strong>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
              Inspiradas na ótica de alta precisão e no mostruário físico da nossa loja em Araçatuba.
              Lentes cortadas sob medida para armações solares e receituário com a sua graduação médica.
            </p>
          </div>

          {/* Navegação e Paginação Estilo Panda Elite (< 1/8 >) */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Lente anterior"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs font-mono font-bold tracking-wider text-slate-200">
                {currentIndex + 1} / {total}
              </span>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Próxima lente"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Seleção Rápida de Cores (Paleta de 8 Cores da Loja) */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {lensList.map((lens, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={lens.id}
                type="button"
                onClick={() => scrollToCard(idx)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-400/20 scale-105"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-xs"
                  style={{ backgroundColor: lens.colorHex }}
                />
                <span>{lens.colorName}</span>
              </button>
            );
          })}
        </div>

        {/* Carrossel de Cards Estilo Panda Elite (Fundo Escuro com Cápsula Oval Branca) */}
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex gap-6 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory no-scrollbar px-1"
        >
          {lensList.map((lens, idx) => {
            const isSelected = idx === currentIndex;

            return (
              <div
                key={lens.id}
                className={`snap-center shrink-0 w-[280px] sm:w-[320px] md:w-[340px] flex flex-col justify-between p-5 rounded-3xl border transition-all duration-300 ${
                  isSelected
                    ? "bg-[#0a1928] border-amber-400/50 shadow-2xl shadow-amber-400/10 ring-1 ring-amber-400/20"
                    : "bg-[#091522] border-white/10 hover:border-white/20"
                }`}
              >
                <div>
                  {/* Cápsula Oval Branca (Identidade Visual da Referência) com o Disco da Lente */}
                  <div className="relative w-full aspect-[4/3] bg-white rounded-[2rem] p-4 flex items-center justify-center shadow-lg overflow-hidden group">
                    {/* Brilho e reflexo de fundo na cápsula */}
                    <div className="absolute inset-0 bg-radial from-slate-100 to-slate-200/50 pointer-events-none" />

                    {/* Selo do Acabamento */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#06111f] text-amber-300 shadow-sm">
                        {lens.badge}
                      </span>
                    </div>

                    {/* Gráfico Realista da Lente Óptica com Bisel e Reflexo Cristalino */}
                    <div className="relative w-36 h-36 flex items-center justify-center transition-transform duration-500 group-hover:scale-108 drop-shadow-xl">
                      <svg
                        viewBox="0 0 120 120"
                        className="w-full h-full filter drop-shadow-lg"
                        aria-label={`Lente óptica na cor ${lens.colorName}`}
                      >
                        <defs>
                          {/* Gradiente da Lente com coloração transparente e refração cristalina (conforme solicitado por Gustavo em 30.jpeg) */}
                          <radialGradient
                            id={`lens-grad-${lens.id}`}
                            cx="38%"
                            cy="35%"
                            r="65%"
                          >
                            <stop offset="0%" stopColor={lens.colorHex} stopOpacity="0.25" />
                            <stop offset="45%" stopColor={lens.colorHex} stopOpacity="0.45" />
                            <stop offset="80%" stopColor={lens.colorHex} stopOpacity="0.65" />
                            <stop offset="100%" stopColor={lens.colorHex} stopOpacity="0.80" />
                          </radialGradient>

                          {/* Reflexo de Curvatura Antirreflexo Super AR */}
                          <linearGradient
                            id={`ar-sheen-${lens.id}`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                            <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.3" />
                            <stop offset="70%" stopColor="#a855f7" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                          </linearGradient>
                        </defs>

                        {/* Sombra Suave da Lente Sobre a Superfície Branca */}
                        <ellipse cx="60" cy="64" rx="48" ry="48" fill="#000000" opacity="0.10" />

                        {/* Corpo Transparente do Disco Óptico com Bisel */}
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill={`url(#lens-grad-${lens.id})`}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeOpacity="0.7"
                        />

                        {/* Anel de Bisel de Montagem (Padrão de Laboratório) */}
                        <circle
                          cx="60"
                          cy="60"
                          r="49"
                          fill="none"
                          stroke={lens.colorHex}
                          strokeWidth="2"
                          strokeOpacity="0.75"
                        />

                        {/* Feixe de Luz / Arco de Reflexo AR Superior */}
                        <path
                          d="M 28 42 C 40 22, 80 22, 92 42 C 82 28, 42 28, 28 42 Z"
                          fill={`url(#ar-sheen-${lens.id})`}
                        />

                        {/* Ponto de Brilho Especular Diamantado */}
                        <ellipse
                          cx="40"
                          cy="36"
                          rx="8"
                          ry="3.5"
                          transform="rotate(-25 40 36)"
                          fill="#ffffff"
                          fillOpacity="0.75"
                        />

                        {/* Marca de Autenticidade Gravada a Laser no Topo */}
                        <text
                          x="60"
                          y="100"
                          textAnchor="middle"
                          fontSize="5.5"
                          fontWeight="700"
                          letterSpacing="0.8"
                          fill="#ffffff"
                          fillOpacity="0.45"
                        >
                          VENTARA UV400
                        </text>
                      </svg>
                    </div>
                  </div>

                  {/* Informações da Lente */}
                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                      {lens.categoryTag}
                    </span>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                      {lens.name}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {lens.description}
                    </p>

                    {/* Preço de Referência */}
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        A partir de
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-amber-400 font-mono tracking-tight">
                          {lens.priceFormatted}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {lens.installmentFormatted}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botão de Ação: WhatsApp Direto */}
                <div className="mt-5 pt-3 border-t border-white/10">
                  <a
                    href={getWhatsAppUrl(lens)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-amber-400/20 cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    <span>Pedir no WhatsApp</span>
                    <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
