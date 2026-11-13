"use client";

import React, { useState } from "react";

export interface FrameMeasurementsProps {
  lensWidthMm?: number | null;
  bridgeMm?: number | null;
  templeMm?: number | null;
  frameWidthMm?: number | null;
  lensHeightMm?: number | null;
  highlightedDimension?: "frame" | "lens" | "height" | "bridge" | "temple" | null;
  onDimensionSelect?: (dim: "frame" | "lens" | "height" | "bridge" | "temple") => void;
}

type Dimension = "frame" | "lens" | "height" | "bridge" | "temple";

// Explicações em linguagem simples (sem mudar nenhuma medida; apenas ajuda a entender o desenho)
const DIMENSION_HELP: Record<Dimension, { name: string; text: string; dot: string; border: string }> = {
  frame: {
    name: "Largura Frontal",
    text: "É o tamanho total da frente da armação, de uma ponta à outra. Mostra se ela vai ficar mais justa ou mais folgada nas laterais do rosto.",
    dot: "bg-amber-400",
    border: "border-amber-400/50",
  },
  lens: {
    name: "Largura da Lente",
    text: "É o tamanho de cada aro, de ponta a ponta. Quanto maior, mais espaço para enxergar.",
    dot: "bg-sky-400",
    border: "border-sky-400/50",
  },
  height: {
    name: "Altura da Lente",
    text: "É o tamanho do aro de cima até embaixo. É importante principalmente para quem usa lentes multifocais.",
    dot: "bg-pink-400",
    border: "border-pink-400/50",
  },
  bridge: {
    name: "Ponte Nasal",
    text: "É o espaço entre os dois aros, onde a armação apoia no nariz. Ajuda a evitar que os óculos escorreguem ou marquem.",
    dot: "bg-emerald-400",
    border: "border-emerald-400/50",
  },
  temple: {
    name: "Comprimento da Haste",
    text: "É o tamanho da \"perna\" dos óculos, até a curva que fica atrás da orelha.",
    dot: "bg-amber-400",
    border: "border-amber-400/50",
  },
};

export function FrameMeasurementsDiagram({
  lensWidthMm,
  bridgeMm,
  templeMm,
  frameWidthMm,
  lensHeightMm,
  highlightedDimension,
  onDimensionSelect,
}: FrameMeasurementsProps) {
  const [activeTab, setActiveTab] = useState<"front" | "side">("front");
  const [selected, setSelected] = useState<Dimension | null>(null);

  // A medida em destaque pode vir de fora (props) ou do toque da pessoa no próprio guia
  const active = highlightedDimension ?? selected;

  const handleSelect = (dim: Dimension) => {
    setSelected((prev) => (prev === dim ? null : dim));
    // Leva a pessoa para a vista onde essa medida aparece
    setActiveTab(dim === "temple" ? "side" : "front");
    onDimensionSelect?.(dim);
  };

  return (
    <div className="w-full bg-slate-900 text-slate-100 rounded-3xl p-4 sm:p-7 border border-slate-800 shadow-xl overflow-hidden">
      {/* Cabeçalho Técnico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Diagrama Técnico de Medidas
          </span>
          <h3 className="text-base sm:text-xl font-semibold text-white tracking-tight">
            Guia Visual de Medição Anatômica
          </h3>
          <p className="text-[13px] sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Medidas reais em milímetros. Toque em uma medida abaixo para ver onde ela fica no desenho e o que significa.
          </p>
        </div>

        {/* Alternador de Vista (Frontal / Lateral) */}
        <div className="inline-flex p-1 bg-slate-800/90 rounded-xl border border-slate-700/60 self-start sm:self-auto">
          <button
            type="button"
            aria-pressed={activeTab === "front"}
            onClick={() => setActiveTab("front")}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold transition-all motion-reduce:transition-none ${
              activeTab === "front"
                ? "bg-amber-400 text-slate-950 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            De frente
          </button>
          <button
            type="button"
            aria-pressed={activeTab === "side"}
            onClick={() => setActiveTab("side")}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold transition-all motion-reduce:transition-none ${
              activeTab === "side"
                ? "bg-amber-400 text-slate-950 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            De lado (haste)
          </button>
        </div>
      </div>

      {/* Área da Ilustração Técnica Vetorial */}
      <div className="py-4 sm:py-6 flex items-center justify-center relative min-h-[190px] sm:min-h-[220px]">
        {activeTab === "front" ? (
          <div className="w-full max-w-[460px] mx-auto select-none">
            <svg
              viewBox="0 0 500 240"
              className="w-full h-auto"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Ilustração técnica com cotas da armação frontal"
            >
              {/* Grid técnico sutil de fundo */}
              <defs>
                <pattern id="techGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                </pattern>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#FBBF24" />
                </marker>
              </defs>
              <rect width="500" height="240" fill="url(#techGrid)" rx="16" />

              {/* 1. Largura Total Frontal (Cota Superior) */}
              {frameWidthMm && (
                <g
                  className="cursor-pointer transition-opacity"
                  onClick={() => handleSelect("frame")}
                  opacity={!active || active === "frame" ? 1 : 0.4}
                >
                  <line x1="60" y1="30" x2="440" y2="30" stroke="#FBBF24" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                  <line x1="60" y1="20" x2="60" y2="60" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="440" y1="20" x2="440" y2="60" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <rect x="185" y="16" width="130" height="28" rx="14" fill="#0F172A" stroke="#FBBF24" strokeWidth="1" />
                  <text x="250" y="35" fill="#FBBF24" fontSize="14" fontWeight="bold" textAnchor="middle">
                    Frontal: {frameWidthMm} mm
                  </text>
                </g>
              )}

              {/* Armação Frontal Ventara: Aro Esquerdo */}
              <g stroke="#94A3B8" strokeWidth="3" fill="#1E293B" strokeLinejoin="round">
                <rect x="70" y="70" width="140" height="90" rx="28" />
                <rect x="80" y="80" width="120" height="70" rx="20" fill="#0F172A" stroke="#64748B" strokeWidth="1.5" />
              </g>

              {/* Armação Frontal Ventara: Aro Direito */}
              <g stroke="#94A3B8" strokeWidth="3" fill="#1E293B" strokeLinejoin="round">
                <rect x="290" y="70" width="140" height="90" rx="28" />
                <rect x="300" y="80" width="120" height="70" rx="20" fill="#0F172A" stroke="#64748B" strokeWidth="1.5" />
              </g>

              {/* Ponte Anatômica Suave */}
              <path
                d="M 210 105 C 235 88, 265 88, 290 105"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Encaixes das Hastes / Charneiras */}
              <path d="M 70 95 L 45 92" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
              <path d="M 430 95 L 455 92" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />

              {/* 2. Largura da Lente / Aro (Cota Aro Direito) */}
              {lensWidthMm && (
                <g
                  className="cursor-pointer transition-opacity"
                  onClick={() => handleSelect("lens")}
                  opacity={!active || active === "lens" ? 1 : 0.4}
                >
                  <line x1="300" y1="180" x2="420" y2="180" stroke="#38BDF8" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                  <line x1="300" y1="155" x2="300" y2="188" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                  <line x1="420" y1="155" x2="420" y2="188" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                  <rect x="304" y="190" width="112" height="26" rx="13" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
                  <text x="360" y="208" fill="#38BDF8" fontSize="13" fontWeight="bold" textAnchor="middle">
                    Lente: {lensWidthMm} mm
                  </text>
                </g>
              )}

              {/* 3. Ponte Nasal (Cota Central) */}
              {bridgeMm && (
                <g
                  className="cursor-pointer transition-opacity"
                  onClick={() => handleSelect("bridge")}
                  opacity={!active || active === "bridge" ? 1 : 0.4}
                >
                  <line x1="210" y1="130" x2="290" y2="130" stroke="#34D399" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                  <rect x="208" y="140" width="84" height="24" rx="12" fill="#0F172A" stroke="#34D399" strokeWidth="1" />
                  <text x="250" y="157" fill="#34D399" fontSize="12" fontWeight="bold" textAnchor="middle">
                    Ponte: {bridgeMm} mm
                  </text>
                </g>
              )}

              {/* 4. Altura da Lente (Cota Lateral Esquerda) */}
              {lensHeightMm && (
                <g
                  className="cursor-pointer transition-opacity"
                  onClick={() => handleSelect("height")}
                  opacity={!active || active === "height" ? 1 : 0.4}
                >
                  <line x1="40" y1="80" x2="40" y2="150" stroke="#F472B6" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                  <line x1="32" y1="80" x2="75" y2="80" stroke="#F472B6" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                  <line x1="32" y1="150" x2="75" y2="150" stroke="#F472B6" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                  <rect x="2" y="102" width="76" height="24" rx="12" fill="#0F172A" stroke="#F472B6" strokeWidth="1" />
                  <text x="40" y="119" fill="#F472B6" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Alt: {lensHeightMm} mm
                  </text>
                </g>
              )}
            </svg>
          </div>
        ) : (
          /* Vista Lateral da Haste */
          <div className="w-full max-w-[460px] mx-auto select-none">
            <svg
              viewBox="0 0 500 200"
              className="w-full h-auto"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Ilustração técnica com cota da haste lateral"
            >
              <rect width="500" height="200" fill="url(#techGrid)" rx="16" />

              {/* Perfil Lateral da Frente dos Óculos */}
              <path
                d="M 60 40 L 75 40 L 70 140 L 55 140 Z"
                fill="#1E293B"
                stroke="#94A3B8"
                strokeWidth="2"
              />

              {/* Haste Anatômica com Curvatura Auricular */}
              <path
                d="M 75 55 L 360 55 Q 400 55, 415 85 L 435 135"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M 75 55 L 360 55 Q 400 55, 415 85 L 435 135"
                fill="none"
                stroke="#64748B"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Charneira Metálica */}
              <circle cx="82" cy="55" r="4" fill="#FBBF24" />

              {/* 5. Comprimento da Haste (Cota) */}
              {templeMm && (
                <g
                  className="cursor-pointer transition-opacity"
                  onClick={() => handleSelect("temple")}
                  opacity={!active || active === "temple" ? 1 : 0.4}
                >
                  <line x1="75" y1="165" x2="435" y2="165" stroke="#FBBF24" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                  <line x1="75" y1="65" x2="75" y2="175" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="435" y1="140" x2="435" y2="175" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <rect x="185" y="150" width="140" height="30" rx="15" fill="#0F172A" stroke="#FBBF24" strokeWidth="1" />
                  <text x="255" y="170" fill="#FBBF24" fontSize="14" fontWeight="bold" textAnchor="middle">
                    Haste: {templeMm} mm
                  </text>
                </g>
              )}
            </svg>
          </div>
        )}
      </div>

      {/* Explicação em linguagem simples da medida tocada */}
      <div
        aria-live="polite"
        className={`mb-4 rounded-2xl border bg-slate-800/60 p-3 sm:p-4 text-[13px] sm:text-base leading-relaxed ${
          active ? DIMENSION_HELP[active].border : "border-slate-700/70"
        }`}
      >
        {active ? (
          <p className="text-slate-100">
            <span className="inline-flex items-center gap-2 font-bold text-white">
              <span className={`size-2.5 rounded-full ${DIMENSION_HELP[active].dot}`} aria-hidden="true" />
              {DIMENSION_HELP[active].name}:
            </span>{" "}
            {DIMENSION_HELP[active].text}
          </p>
        ) : (
          <p className="text-slate-300">
            <span aria-hidden="true">👇 </span>
            Toque em uma das medidas abaixo para ver o que ela significa.
          </p>
        )}
      </div>

      {/* Legenda Resumida das Cotas Reais (cada cartão é um botão que destaca a medida no desenho) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4 border-t border-slate-800 text-center">
        {(
          [
            { dim: "frame", label: "Largura Frontal", value: frameWidthMm, color: "text-amber-300" },
            { dim: "lens", label: "Largura da Lente", value: lensWidthMm, color: "text-sky-300" },
            { dim: "height", label: "Altura da Lente", value: lensHeightMm, color: "text-pink-300" },
            { dim: "bridge", label: "Ponte Nasal", value: bridgeMm, color: "text-emerald-300" },
            { dim: "temple", label: "Comprimento Haste", value: templeMm, color: "text-amber-300" },
          ] as { dim: Dimension; label: string; value?: number | null; color: string }[]
        ).map(({ dim, label, value, color }) => {
          const isActive = active === dim;
          return (
            <button
              key={dim}
              type="button"
              disabled={!value}
              aria-pressed={isActive}
              onClick={() => handleSelect(dim)}
              className={`min-h-[56px] sm:min-h-[64px] p-2 sm:p-2.5 rounded-xl border transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                value
                  ? isActive
                    ? "bg-slate-700 border-amber-400"
                    : "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800"
                  : "opacity-40 border-slate-800 cursor-not-allowed"
              } ${dim === "temple" ? "col-span-2 sm:col-span-1" : ""}`}
            >
              <span className="text-xs text-slate-300 block font-medium">{label}</span>
              <span className={`text-sm sm:text-base font-bold font-mono ${color}`}>
                {value ? `${value} mm` : "Não aferido"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
