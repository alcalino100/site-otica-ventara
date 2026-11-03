"use client";

import React, { useMemo } from "react";
import { calculateContrast } from "@/lib/color-contrast";
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

interface CmsContrastMeterProps {
  primaryText: string;
  pageBackground: string;
  secondaryText?: string;
  accentAmber?: string;
  chipBg?: string;
}

export function CmsContrastMeter({
  primaryText,
  pageBackground,
  secondaryText,
  accentAmber,
  chipBg,
}: CmsContrastMeterProps) {
  const mainContrast = useMemo(
    () => calculateContrast(primaryText, pageBackground),
    [primaryText, pageBackground]
  );

  const secondaryContrast = useMemo(
    () => (secondaryText ? calculateContrast(secondaryText, pageBackground) : null),
    [secondaryText, pageBackground]
  );

  const chipContrast = useMemo(
    () => (accentAmber && chipBg ? calculateContrast(accentAmber, chipBg) : null),
    [accentAmber, chipBg]
  );

  const isBlocked = !mainContrast.passesAA;

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        isBlocked
          ? "bg-rose-950/40 border-rose-600/70 text-rose-200"
          : "bg-emerald-950/20 border-emerald-600/40 text-emerald-100"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {isBlocked ? (
            <ShieldAlert size={20} className="text-rose-400 shrink-0" />
          ) : (
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
          )}
          <div>
            <h4 className="text-xs sm:text-sm font-bold flex items-center gap-2">
              <span>Auditoria WCAG 2.1 em Tempo Real</span>
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${
                  isBlocked
                    ? "bg-rose-500 text-white font-black animate-pulse"
                    : "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30"
                }`}
              >
                {mainContrast.level} ({mainContrast.formattedRatio})
              </span>
            </h4>
            <p className="text-[11px] opacity-80">
              {isBlocked
                ? "BLOQUEIA PUBLICAÇÃO: O contraste do texto principal com o fundo está abaixo de 4.5:1."
                : "Aprovado: Contraste acessível garante excelente legibilidade para todos os usuários."}
            </p>
          </div>
        </div>

        {/* Amostra Visual Comparativa */}
        <div
          style={{ backgroundColor: pageBackground, color: primaryText }}
          className="px-3 py-1.5 rounded-lg border border-black/10 text-xs font-bold shrink-0 text-center shadow-xs"
        >
          Aa Visualização
        </div>
      </div>

      {/* Tabela de Verificação Detalhada */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px]">
        {/* 1. Texto Principal */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
          <span className="opacity-75">Texto Principal:</span>
          <span className={`font-mono font-bold ${mainContrast.passesAA ? "text-emerald-400" : "text-rose-400"}`}>
            {mainContrast.formattedRatio} {mainContrast.passesAA ? "✓ AA" : "✕ Reprovado"}
          </span>
        </div>

        {/* 2. Texto Secundário */}
        {secondaryContrast && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
            <span className="opacity-75">Texto Secundário:</span>
            <span
              className={`font-mono font-bold ${
                secondaryContrast.passesAA ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {secondaryContrast.formattedRatio} {secondaryContrast.passesAA ? "✓ AA" : "⚠️ Baixo"}
            </span>
          </div>
        )}

        {/* 3. Selo / Chip */}
        {chipContrast && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-black/20">
            <span className="opacity-75">Texto nos Selos:</span>
            <span
              className={`font-mono font-bold ${
                chipContrast.passesAA ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {chipContrast.formattedRatio} {chipContrast.passesAA ? "✓ AA" : "⚠️ Baixo"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
