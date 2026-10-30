"use client";

import React, { useState } from "react";
import { Play, Radio, Sparkles } from "lucide-react";
import { useSiteSettings } from "../providers/site-settings-provider";

export function LiveFloatingButton() {
  const [isHovered, setIsHovered] = useState(false);
  const { liveBroadcast } = useSiteSettings();

  // Se a live estiver desligada no admin ou sem URL válida, não renderiza
  if (!liveBroadcast || !liveBroadcast.enabled || !liveBroadcast.live_url) {
    return null;
  }

  const liveUrl = liveBroadcast.live_url.startsWith("http")
    ? liveBroadcast.live_url
    : `https://${liveBroadcast.live_url}`;

  const platformLabels: Record<string, string> = {
    instagram: "no Instagram",
    tiktok: "no TikTok",
    youtube: "no YouTube",
    facebook: "no Facebook",
    custom: "Ao Vivo",
  };

  const platformText = platformLabels[liveBroadcast.platform] || "Ao Vivo";

  return (
    <aside
      aria-label="Transmissão Ao Vivo da Óticas Ventara"
      className="fixed bottom-24 right-5 sm:bottom-28 sm:right-7 z-[75] flex items-center gap-2.5 pointer-events-auto select-none"
    >
      {/* Tooltip Elegante Desdobrável no Desktop */}
      <div
        className={`hidden md:flex flex-col items-end px-3.5 py-2 rounded-2xl bg-[#06111f]/95 text-white text-xs tracking-wide border border-red-500/40 shadow-2xl backdrop-blur-md transition-all duration-300 pointer-events-none ${
          isHovered
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-3 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-1.5 font-black text-red-400 text-[11px] uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <Radio size={12} className="animate-pulse" />
          <span>{liveBroadcast.title || "Estamos Ao Vivo!"}</span>
        </div>
        <span className="text-[10px] text-slate-300 font-medium">
          {liveBroadcast.call_to_action || "Clique para assistir"} {platformText}
        </span>
      </div>

      {/* Widget Flutuante Estilo 3.jpeg (Botão Circular Play + Pill LIVE com Brilho e Pulso) */}
      <a
        id="live-floating-button"
        data-testid="live-floating-button"
        href={liveUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Assistir à transmissão ao vivo da Óticas Ventara"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group flex flex-col items-center cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-red-500/40 active:scale-95 transition-transform duration-200"
      >
        {/* Anel de Pulso Animado (Ping Glow Vermelho) */}
        <span className="absolute -inset-1.5 rounded-full bg-red-600 opacity-40 animate-ping pointer-events-none" />

        {/* 1. Círculo Superior com Ícone de Play e Anel Branco/Vermelho (Fiel à foto 3.jpeg) */}
        <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-700 p-1 flex items-center justify-center shadow-[0_8px_24px_rgba(239,68,68,0.55)] group-hover:shadow-[0_12px_32px_rgba(239,68,68,0.75)] transition-all duration-300 border-2 border-white/80">
          {/* Anel interno translúcido de vidro */}
          <div className="absolute inset-0.5 rounded-full border border-white/40 pointer-events-none" />

          {/* Triângulo Play Branco */}
          <Play
            size={22}
            className="text-white fill-white translate-x-0.5 transition-transform duration-300 group-hover:scale-115"
          />

          {/* Brilho Especular Superior Curvo */}
          <div className="absolute top-1 left-2 w-6 h-2.5 rounded-full bg-white/40 blur-[0.6px] -rotate-12 pointer-events-none" />
        </div>

        {/* 2. Badge Cápsula (Pill) "LIVE" com Acabamento Glossy (Fiel à foto 3.jpeg) */}
        <div className="-mt-2.5 relative z-10 px-3.5 py-0.5 rounded-full bg-gradient-to-b from-red-500 to-red-700 border border-white/90 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden">
          {/* Reflexo Gloss Superior na Cápsula */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-white/35 rounded-t-full pointer-events-none" />

          <span className="relative z-10 text-[10px] sm:text-[11px] font-black tracking-widest text-white uppercase drop-shadow-xs">
            {liveBroadcast.label || "LIVE"}
          </span>
        </div>
      </a>
    </aside>
  );
}
