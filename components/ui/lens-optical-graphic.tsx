"use client";

import React from "react";

interface LensOpticalGraphicProps {
  className?: string;
  size?: number | string;
  glow?: boolean;
}

/**
 * Símbolo exclusivo de lentes ópticas da Ótica Ventara.
 * Baseado na referência de discos de lentes biseladas com reflexos antirreflexo (AR),
 * com acabamento translúcido premium em azul/ciano e dourado, sem fundo rosa.
 */
export function LensOpticalGraphic({
  className = "",
  size = 180,
  glow = true,
}: LensOpticalGraphicProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: typeof size === "number" ? size * 0.75 : size }}
      aria-label="Símbolo de Lentes Ópticas de Alta Precisão"
    >
      {/* Halo de luz suave de fundo */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-amber-400/10 blur-xl rounded-full pointer-events-none" />
      )}

      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_12px_24px_rgba(6,17,31,0.18)]"
      >
        <defs>
          {/* Gradiente da borda biselada da lente de trás */}
          <linearGradient id="backBevelGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.7" />
            <stop offset="40%" stopColor="#cbd5e1" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#64748b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#334155" stopOpacity="0.95" />
          </linearGradient>

          {/* Gradiente da superfície da lente de trás */}
          <linearGradient id="backSurfaceGrad" x1="0.1" y1="0.2" x2="0.9" y2="0.8">
            <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#e2e8f0" stopOpacity="0.55" />
            <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.32" />
          </linearGradient>

          {/* Gradiente da borda biselada da lente da frente */}
          <linearGradient id="frontBevelGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#94a3b8" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#475569" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.98" />
          </linearGradient>

          {/* Gradiente da superfície da lente da frente com reflexo antirreflexo (AR) Ciano/Verde */}
          <linearGradient id="frontSurfaceGrad" x1="0.15" y1="0.15" x2="0.85" y2="0.85">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#e0f2fe" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#bae6fd" stopOpacity="0.35" />
            <stop offset="75%" stopColor="#2dd4bf" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
          </linearGradient>

          {/* Reflexo de luz especular superior */}
          <linearGradient id="sheenGleam" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Reflexo antirreflexo verde/esmeralda característico de lentes premium */}
          <linearGradient id="arCoatingGrad" x1="0" y1="0" x2="1" y2="0.5">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0" />
            <stop offset="45%" stopColor="#14b8a6" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>

          {/* Filtro de sombra interna e suavização */}
          <filter id="softGaze" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#06111f" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* ========================================================= */}
        {/* LENTE INFERIOR / DIREITA (Base / Disco Traseiro)           */}
        {/* ========================================================= */}
        <g transform="translate(130, 95) rotate(-18)">
          {/* Espessura / Borda cilíndrica biselada (Facet / Faceta) */}
          <path
            d="M 10 32 C 10 15, 60 5, 120 5 C 180 5, 230 15, 230 32 L 230 46 C 230 63, 180 73, 120 73 C 60 73, 10 63, 10 46 Z"
            fill="url(#backBevelGrad)"
          />
          {/* Face frontal elíptica da lente */}
          <ellipse
            cx="120"
            cy="32"
            rx="110"
            ry="27"
            fill="url(#backSurfaceGrad)"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.2"
          />
          {/* Arco de reflexo da curvatura da lente de trás */}
          <path
            d="M 35 32 C 60 18, 170 18, 205 32"
            stroke="url(#sheenGleam)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>

        {/* ========================================================= */}
        {/* LENTE SUPERIOR / ESQUERDA (Destaque Frontal Principal)    */}
        {/* ========================================================= */}
        <g transform="translate(25, 30) rotate(-22)" filter="url(#softGaze)">
          {/* Espessura / Borda cilíndrica biselada da lente frontal */}
          <path
            d="M 12 36 C 12 16, 68 6, 136 6 C 204 6, 260 16, 260 36 L 260 52 C 260 72, 204 82, 136 82 C 68 82, 12 72, 12 52 Z"
            fill="url(#frontBevelGrad)"
          />

          {/* Face principal da lente (Disco cristalino de quartzo óptico) */}
          <ellipse
            cx="136"
            cy="36"
            rx="124"
            ry="30"
            fill="url(#frontSurfaceGrad)"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.6"
          />

          {/* Camada Antirreflexo Multicamadas (Gleam AR verde/ciano) */}
          <ellipse
            cx="136"
            cy="36"
            rx="118"
            ry="25"
            fill="url(#arCoatingGrad)"
          />

          {/* Faixa de reflexo luminoso diagonal tipo estúdio (Studio Specular Reflection) */}
          <path
            d="M 30 38 C 65 20, 205 20, 242 38 C 220 28, 90 28, 30 38 Z"
            fill="url(#sheenGleam)"
            opacity="0.85"
          />

          {/* Ponto focal de brilho brilhante / estrela de refração */}
          <ellipse cx="65" cy="27" rx="14" ry="4" fill="#ffffff" opacity="0.9" />
          <ellipse cx="195" cy="43" rx="10" ry="3" fill="#ffffff" opacity="0.75" />

          {/* Contorno interno sutil de lapidação facetada */}
          <ellipse
            cx="136"
            cy="36"
            rx="122"
            ry="28"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="0.8"
            strokeDasharray="4 2"
          />
        </g>

        {/* Micro-pontos de nitidez óptica / partículas de luz */}
        <circle cx="95" cy="55" r="2.5" fill="#38bdf8" opacity="0.85" />
        <circle cx="230" cy="120" r="2" fill="#ffd62e" opacity="0.8" />
        <circle cx="160" cy="210" r="1.8" fill="#2dd4bf" opacity="0.7" />
      </svg>
    </div>
  );
}
