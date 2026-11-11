"use client";

import React, { useState, useMemo } from "react";
import { SlidersHorizontal, CheckCircle2, AlertCircle, Info, Sparkles, RefreshCw } from "lucide-react";

export interface FrameComparatorProps {
  currentModelName: string;
  targetLensMm: number | null;
  targetBridgeMm: number | null;
  targetTempleMm: number | null;
  targetHeightMm?: number | null;
}

export function FrameComparator({
  currentModelName,
  targetLensMm,
  targetBridgeMm,
  targetTempleMm,
  targetHeightMm,
}: FrameComparatorProps) {
  // Valores padrão de referência (ou inputs do usuário)
  const [userLens, setUserLens] = useState<string>("");
  const [userBridge, setUserBridge] = useState<string>("");
  const [userTemple, setUserTemple] = useState<string>("");

  // Presets rápidos para facilitar no mobile
  const applyPreset = (lens: number, bridge: number, temple: number) => {
    setUserLens(String(lens));
    setUserBridge(String(bridge));
    setUserTemple(String(temple));
  };

  const parsedUser = useMemo(() => {
    const l = parseInt(userLens, 10);
    const b = parseInt(userBridge, 10);
    const t = parseInt(userTemple, 10);
    return {
      lens: isNaN(l) ? null : l,
      bridge: isNaN(b) ? null : b,
      temple: isNaN(t) ? null : t,
    };
  }, [userLens, userBridge, userTemple]);

  // Cálculos de comparação com linguagem humana
  const comparisonResults = useMemo(() => {
    if (!parsedUser.lens && !parsedUser.bridge && !parsedUser.temple) {
      return null;
    }

    const feedbacks: { title: string; desc: string; type: "exact" | "wider" | "narrower" | "longer" | "shorter" }[] = [];

    // 1. Comparação de Lente (Aro)
    if (parsedUser.lens && targetLensMm) {
      const diff = targetLensMm - parsedUser.lens;
      if (Math.abs(diff) <= 1) {
        feedbacks.push({
          title: "Largura da lente praticamente idêntica",
          desc: `${Math.abs(diff)} mm de diferença — vai vestir quase exatamente igual aos seus óculos atuais no campo de visão.`,
          type: "exact",
        });
      } else if (diff > 1) {
        feedbacks.push({
          title: `Lente ${diff} mm mais larga`,
          desc: "Proporcionará um campo de visão ligeiramente mais aberto e visual mais expressivo no rosto.",
          type: "wider",
        });
      } else {
        feedbacks.push({
          title: `Lente ${Math.abs(diff)} mm mais compacta`,
          desc: "Ideal para rostos finos ou para reduzir o peso e espessura das lentes em graus mais altos.",
          type: "narrower",
        });
      }
    }

    // 2. Comparação de Ponte Nasal
    if (parsedUser.bridge && targetBridgeMm) {
      const diff = targetBridgeMm - parsedUser.bridge;
      if (Math.abs(diff) <= 1) {
        feedbacks.push({
          title: "Ponte nasal perfeita",
          desc: `${Math.abs(diff)} mm de diferença — encaixe sobre o nariz sem folgas ou marcas de pressão.`,
          type: "exact",
        });
      } else if (diff > 1) {
        feedbacks.push({
          title: `Ponte ${diff} mm mais espaçada`,
          desc: "Indicada para pontes nasais mais largas ou para armações que você prefira ligeiramente mais baixas.",
          type: "wider",
        });
      } else {
        feedbacks.push({
          title: `Ponte ${Math.abs(diff)} mm mais fechada`,
          desc: "Oferece sustentação mais firme para quem tem dorso nasal fino, evitando que os óculos escorreguem.",
          type: "narrower",
        });
      }
    }

    // 3. Comparação de Haste
    if (parsedUser.temple && targetTempleMm) {
      const diff = targetTempleMm - parsedUser.temple;
      if (Math.abs(diff) <= 2) {
        feedbacks.push({
          title: "Comprimento de haste ideal",
          desc: `${Math.abs(diff)} mm de variação — encaixe atrás da orelha seguro e confortável.`,
          type: "exact",
        });
      } else if (diff > 2) {
        feedbacks.push({
          title: `Haste ${diff} mm mais longa`,
          desc: "Mais folga atrás da orelha; pode ser facilmente curvada pelo nosso laboratório óptico no ajuste final.",
          type: "longer",
        });
      } else {
        feedbacks.push({
          title: `Haste ${Math.abs(diff)} mm mais curta`,
          desc: "Pode puxar atrás da orelha se você tiver distância têmpora-orelha mais longa. Avalie seu conforto.",
          type: "shorter",
        });
      }
    }

    return feedbacks;
  }, [parsedUser, targetLensMm, targetBridgeMm, targetTempleMm]);

  return (
    <div className="w-full bg-amber-50/40 border border-amber-200/80 rounded-3xl p-5 sm:p-7 space-y-6">
      {/* Título & Instrução */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 flex items-center gap-1.5">
            <SlidersHorizontal size={12} className="text-amber-600" />
            Ferramenta Interativa
          </span>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight mt-0.5">
            Compare com a sua armação atual
          </h3>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Pegue um óculos que você já usa e confira os 3 números gravados na parte interna da haste (ex: <strong className="font-mono text-slate-800">52 · 18 · 145</strong>).
          </p>
        </div>

        {/* Botão de Limpar */}
        {(userLens || userBridge || userTemple) && (
          <button
            type="button"
            onClick={() => {
              setUserLens("");
              setUserBridge("");
              setUserTemple("");
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-700 transition-colors self-start py-1"
          >
            <RefreshCw size={12} /> Limpar
          </button>
        )}
      </div>

      {/* Inputs dos 3 Números */}
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="user-lens" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Lente (mm)
            </label>
            <input
              id="user-lens"
              type="number"
              min="40"
              max="70"
              placeholder="ex: 50"
              value={userLens}
              onChange={(e) => setUserLens(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono text-center rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="user-bridge" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Ponte (mm)
            </label>
            <input
              id="user-bridge"
              type="number"
              min="10"
              max="26"
              placeholder="ex: 18"
              value={userBridge}
              onChange={(e) => setUserBridge(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono text-center rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="user-temple" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Haste (mm)
            </label>
            <input
              id="user-temple"
              type="number"
              min="120"
              max="160"
              placeholder="ex: 140"
              value={userTemple}
              onChange={(e) => setUserTemple(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono text-center rounded-xl bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
            />
          </div>
        </div>

        {/* Sugestões Rápidas de Presets */}
        <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 pt-1">
          <span className="font-medium text-slate-600">Modelos comuns:</span>
          <button
            type="button"
            onClick={() => applyPreset(49, 18, 140)}
            className="px-2.5 py-1 bg-white hover:bg-amber-100/60 border border-slate-200 rounded-lg text-slate-700 font-mono transition-colors"
          >
            Pequeno (49 · 18 · 140)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(52, 18, 145)}
            className="px-2.5 py-1 bg-white hover:bg-amber-100/60 border border-slate-200 rounded-lg text-slate-700 font-mono transition-colors"
          >
            Médio (52 · 18 · 145)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(55, 19, 150)}
            className="px-2.5 py-1 bg-white hover:bg-amber-100/60 border border-slate-200 rounded-lg text-slate-700 font-mono transition-colors"
          >
            Grande (55 · 19 · 150)
          </button>
        </div>
      </div>

      {/* Resultados da Comparação */}
      {comparisonResults && comparisonResults.length > 0 ? (
        <div className="space-y-4 pt-3 border-t border-amber-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-600" /> Diagnóstico de Caimento
            </span>
            <span className="text-[11px] text-slate-500">
              Comparando com <strong>{currentModelName}</strong>
            </span>
          </div>

          <div className="space-y-2.5">
            {comparisonResults.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex items-start gap-3"
              >
                <div className="mt-0.5 shrink-0">
                  {item.type === "exact" ? (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  ) : (
                    <Info size={16} className="text-amber-600" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico Comparativo Visual de Silhuetas Sobrepostas */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
              <span>Comparação Visual de Aro</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" /> Sua armação atual
                </span>
                <span className="flex items-center gap-1 text-amber-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> {currentModelName}
                </span>
              </div>
            </div>

            {/* Barras de Comparação Relativa */}
            <div className="space-y-2 pt-1">
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span>Largura da Lente</span>
                  <span className="font-mono">
                    {parsedUser.lens || "—"} mm vs {targetLensMm || "—"} mm
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative flex">
                  {parsedUser.lens && (
                    <div
                      className="h-full bg-slate-300 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (parsedUser.lens / 70) * 100)}%` }}
                    />
                  )}
                  {targetLensMm && (
                    <div
                      className="h-full bg-amber-500/80 rounded-full absolute top-0 left-0 transition-all duration-300 mix-blend-multiply"
                      style={{ width: `${Math.min(100, (targetLensMm / 70) * 100)}%` }}
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span>Ponte Nasal</span>
                  <span className="font-mono">
                    {parsedUser.bridge || "—"} mm vs {targetBridgeMm || "—"} mm
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative flex">
                  {parsedUser.bridge && (
                    <div
                      className="h-full bg-slate-300 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (parsedUser.bridge / 26) * 100)}%` }}
                    />
                  )}
                  {targetBridgeMm && (
                    <div
                      className="h-full bg-amber-500/80 rounded-full absolute top-0 left-0 transition-all duration-300 mix-blend-multiply"
                      style={{ width: `${Math.min(100, (targetBridgeMm / 26) * 100)}%` }}
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <span>Comprimento da Haste</span>
                  <span className="font-mono">
                    {parsedUser.temple || "—"} mm vs {targetTempleMm || "—"} mm
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative flex">
                  {parsedUser.temple && (
                    <div
                      className="h-full bg-slate-300 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (parsedUser.temple / 160) * 100)}%` }}
                    />
                  )}
                  {targetTempleMm && (
                    <div
                      className="h-full bg-amber-500/80 rounded-full absolute top-0 left-0 transition-all duration-300 mix-blend-multiply"
                      style={{ width: `${Math.min(100, (targetTempleMm / 160) * 100)}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-white/70 rounded-2xl border border-dashed border-amber-300/80 text-center">
          <p className="text-xs text-slate-600">
            Digite um ou mais números acima para ver a comparação visual de tamanho e caimento.
          </p>
        </div>
      )}
    </div>
  );
}
