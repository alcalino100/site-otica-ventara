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

  return (
    <div className="w-full bg-slate-900 text-slate-100 rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-xl overflow-hidden">
      {/* Cabeçalho Técnico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
            Diagrama Técnico de Medidas
          </span>
          <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            Guia Visual de Medição Anatômica
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Medidas reais aferidas em milímetros para referência de caimento facial.
          </p>
        </div>

        {/* Alternador de Vista (Frontal / Lateral) */}
        <div className="inline-flex p-1 bg-slate-800/90 rounded-xl border border-slate-700/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("front")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "front"
                ? "bg-amber-400 text-slate-950 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Vista Frontal (4 cotas)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("side")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "side"
                ? "bg-amber-400 text-slate-950 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Vista Lateral (Haste)
          </button>
        </div>
      </div>

      {/* Área da Ilustração Técnica Vetorial */}
      <div className="py-6 flex items-center justify-center relative min-h-[220px]">
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
                  onClick={() => onDimensionSelect?.("frame")}
                  opacity={!highlightedDimension || highlightedDimension === "frame" ? 1 : 0.4}
                >
                  <line x1="60" y1="30" x2="440" y2="30" stroke="#FBBF24" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                  <line x1="60" y1="20" x2="60" y2="60" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="440" y1="20" x2="440" y2="60" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <rect x="200" y="18" width="100" height="24" rx="12" fill="#0F172A" stroke="#FBBF24" strokeWidth="1" />
                  <text x="250" y="34" fill="#FBBF24" fontSize="11" fontWeight="bold" textAnchor="middle">
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
                  onClick={() => onDimensionSelect?.("lens")}
                  opacity={!highlightedDimension || highlightedDimension === "lens" ? 1 : 0.4}
                >
                  <line x1="300" y1="180" x2="420" y2="180" stroke="#38BDF8" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                  <line x1="300" y1="155" x2="300" y2="188" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                  <line x1="420" y1="155" x2="420" y2="188" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                  <rect x="315" y="192" width="90" height="22" rx="11" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
                  <text x="360" y="207" fill="#38BDF8" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Lente: {lensWidthMm} mm
                  </text>
                </g>
              )}

              {/* 3. Ponte Nasal (Cota Central) */}
              {bridgeMm && (
                <g
                  className="cursor-pointer transition-opacity"
                  onClick={() => onDimensionSelect?.("bridge")}
                  opacity={!highlightedDimension || highlightedDimension === "bridge" ? 1 : 0.4}
                >
                  <line x1="210" y1="130" x2="290" y2="130" stroke="#34D399" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                  <rect x="215" y="142" width="70" height="20" rx="10" fill="#0F172A" stroke="#34D399" strokeWidth="1" />
                  <text x="250" y="156" fill="#34D399" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Ponte: {bridgeMm} mm
                  </text>
                </g>
              )}

              {/* 4. Altura da Lente (Cota Lateral Esquerda) */}
              {lensHeightMm && (
                <g
                  className="cursor-pointer transition-opacity"
                  onClick={() => onDimensionSelect?.("height")}
                  opacity={!highlightedDimension || highlightedDimension === "height" ? 1 : 0.4}
                >
                  <line x1="40" y1="80" x2="40" y2="150" stroke="#F472B6" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                  <line x1="32" y1="80" x2="75" y2="80" stroke="#F472B6" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                  <line x1="32" y1="150" x2="75" y2="150" stroke="#F472B6" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
                  <rect x="2" y="103" width="76" height="22" rx="11" fill="#0F172A" stroke="#F472B6" strokeWidth="1" />
                  <text x="40" y="118" fill="#F472B6" fontSize="9" fontWeight="bold" textAnchor="middle">
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
                  onClick={() => onDimensionSelect?.("temple")}
                  opacity={!highlightedDimension || highlightedDimension === "temple" ? 1 : 0.4}
                >
                  <line x1="75" y1="165" x2="435" y2="165" stroke="#FBBF24" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                  <line x1="75" y1="65" x2="75" y2="175" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <line x1="435" y1="140" x2="435" y2="175" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <rect x="200" y="152" width="110" height="26" rx="13" fill="#0F172A" stroke="#FBBF24" strokeWidth="1" />
                  <text x="255" y="169" fill="#FBBF24" fontSize="11" fontWeight="bold" textAnchor="middle">
                    Haste: {templeMm} mm
                  </text>
                </g>
              )}
            </svg>
          </div>
        )}
      </div>

      {/* Legenda Resumida das Cotas Reais */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-4 border-t border-slate-800 text-center">
        <div className={`p-2 rounded-xl border transition-colors ${frameWidthMm ? "bg-slate-800/60 border-slate-700/80" : "opacity-40 border-slate-800"}`}>
          <span className="text-[10px] text-slate-400 block font-medium">Largura Frontal</span>
          <span className="text-xs font-bold font-mono text-amber-300">
            {frameWidthMm ? `${frameWidthMm} mm` : "Não aferido"}
          </span>
        </div>

        <div className={`p-2 rounded-xl border transition-colors ${lensWidthMm ? "bg-slate-800/60 border-slate-700/80" : "opacity-40 border-slate-800"}`}>
          <span className="text-[10px] text-slate-400 block font-medium">Largura da Lente</span>
          <span className="text-xs font-bold font-mono text-sky-300">
            {lensWidthMm ? `${lensWidthMm} mm` : "Não aferido"}
          </span>
        </div>

        <div className={`p-2 rounded-xl border transition-colors ${lensHeightMm ? "bg-slate-800/60 border-slate-700/80" : "opacity-40 border-slate-800"}`}>
          <span className="text-[10px] text-slate-400 block font-medium">Altura da Lente</span>
          <span className="text-xs font-bold font-mono text-pink-300">
            {lensHeightMm ? `${lensHeightMm} mm` : "Não aferido"}
          </span>
        </div>

        <div className={`p-2 rounded-xl border transition-colors ${bridgeMm ? "bg-slate-800/60 border-slate-700/80" : "opacity-40 border-slate-800"}`}>
          <span className="text-[10px] text-slate-400 block font-medium">Ponte Nasal</span>
          <span className="text-xs font-bold font-mono text-emerald-300">
            {bridgeMm ? `${bridgeMm} mm` : "Não aferido"}
          </span>
        </div>

        <div className={`p-2 rounded-xl border transition-colors ${templeMm ? "bg-slate-800/60 border-slate-700/80" : "opacity-40 border-slate-800"}`}>
          <span className="text-[10px] text-slate-400 block font-medium">Comprimento Haste</span>
          <span className="text-xs font-bold font-mono text-amber-300">
            {templeMm ? `${templeMm} mm` : "Não aferido"}
          </span>
        </div>
      </div>
    </div>
  );
}
