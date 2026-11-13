"use client";

import React, { useMemo, useState } from "react";
import { Activity, CheckCircle2, Info, RefreshCw, Ruler, Scale } from "lucide-react";
import { BridgeIllustration, LensIllustration, TempleIllustration } from "./comparator-illustrations";

export interface FrameComparatorProps {
  currentModelName: string;
  targetLensMm: number | null;
  targetBridgeMm: number | null;
  targetTempleMm: number | null;
  targetHeightMm?: number | null;
}

type Dim = "lens" | "bridge" | "temple";
type Tone = "exact" | "more" | "less";

interface Feedback {
  dim: Dim;
  tone: Tone;
  title: string;
  desc: string;
}

interface FieldConfig {
  dim: Dim;
  id: string;
  ordinal: string;
  name: string;
  hint: string;
  chartLabel: string;
  min: number;
  max: number;
  /** Valor máximo usado só para dimensionar as barras da comparação visual. */
  scale: number;
  placeholder: string;
  accent: string;
  Illustration: React.ComponentType<{ accent: string; className?: string }>;
}

const FIELDS: FieldConfig[] = [
  {
    dim: "lens",
    id: "user-lens",
    ordinal: "1º número",
    name: "Lente",
    hint: "Largura de cada lente",
    chartLabel: "Largura da Lente",
    min: 40,
    max: 70,
    scale: 70,
    placeholder: "ex: 50",
    accent: "#059669",
    Illustration: LensIllustration,
  },
  {
    dim: "bridge",
    id: "user-bridge",
    ordinal: "2º número",
    name: "Ponte",
    hint: "Distância entre as lentes",
    chartLabel: "Ponte Nasal",
    min: 10,
    max: 26,
    scale: 26,
    placeholder: "ex: 18",
    accent: "#2563EB",
    Illustration: BridgeIllustration,
  },
  {
    dim: "temple",
    id: "user-temple",
    ordinal: "3º número",
    name: "Haste",
    hint: "Comprimento da haste",
    chartLabel: "Comprimento da Haste",
    min: 120,
    max: 160,
    scale: 160,
    placeholder: "ex: 140",
    accent: "#D97706",
    Illustration: TempleIllustration,
  },
];

// Cada medida tem a sua cor, para o olho ligar a linha do campo ao cartão do diagnóstico
const DIM_THEME: Record<Dim, { card: string; badge: string }> = {
  lens: { card: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-600" },
  bridge: { card: "bg-blue-50 border-blue-200", badge: "bg-blue-700" },
  temple: { card: "bg-amber-50 border-amber-200", badge: "bg-amber-500" },
};

const PRESETS = [
  { label: "Pequeno", lens: 49, bridge: 18, temple: 140 },
  { label: "Médio", lens: 52, bridge: 18, temple: 145 },
  { label: "Grande", lens: 55, bridge: 19, temple: 150 },
] as const;

type Values = Record<Dim, string>;
const EMPTY: Values = { lens: "", bridge: "", temple: "" };

function toNumber(value: string): number | null {
  const n = parseInt(value, 10);
  return Number.isNaN(n) || n <= 0 ? null : n;
}

export function FrameComparator({
  currentModelName,
  targetLensMm,
  targetBridgeMm,
  targetTempleMm,
}: FrameComparatorProps) {
  const [values, setValues] = useState<Values>(EMPTY);

  const targets: Record<Dim, number | null> = {
    lens: targetLensMm,
    bridge: targetBridgeMm,
    temple: targetTempleMm,
  };

  const parsedUser = useMemo<Record<Dim, number | null>>(
    () => ({
      lens: toNumber(values.lens),
      bridge: toNumber(values.bridge),
      temple: toNumber(values.temple),
    }),
    [values]
  );

  const hasAnyValue = Boolean(values.lens || values.bridge || values.temple);

  const applyPreset = (p: (typeof PRESETS)[number]) =>
    setValues({ lens: String(p.lens), bridge: String(p.bridge), temple: String(p.temple) });

  const activePreset = PRESETS.find(
    (p) => values.lens === String(p.lens) && values.bridge === String(p.bridge) && values.temple === String(p.temple)
  )?.label;

  // Cálculos de comparação com linguagem humana
  const feedbacks = useMemo<Feedback[]>(() => {
    const list: Feedback[] = [];

    // 1. Lente (aro)
    if (parsedUser.lens && targetLensMm) {
      const diff = targetLensMm - parsedUser.lens;
      if (Math.abs(diff) <= 1) {
        list.push({
          dim: "lens",
          tone: "exact",
          title: "Largura da lente praticamente idêntica",
          desc: `${Math.abs(diff)} mm de diferença — vai vestir quase exatamente igual aos seus óculos atuais no campo de visão.`,
        });
      } else if (diff > 1) {
        list.push({
          dim: "lens",
          tone: "more",
          title: `Lente ${diff} mm mais larga`,
          desc: "Proporcionará um campo de visão ligeiramente maior e mais conforto visual.",
        });
      } else {
        list.push({
          dim: "lens",
          tone: "less",
          title: `Lente ${Math.abs(diff)} mm mais compacta`,
          desc: "Ideal para rostos finos ou para reduzir o peso e a espessura das lentes em graus mais altos.",
        });
      }
    }

    // 2. Ponte nasal
    if (parsedUser.bridge && targetBridgeMm) {
      const diff = targetBridgeMm - parsedUser.bridge;
      if (Math.abs(diff) <= 1) {
        list.push({
          dim: "bridge",
          tone: "exact",
          title: "Ponte nasal perfeita",
          desc: "Melhor encaixe e conforto sobre o nariz, sem espaços e sem pressão.",
        });
      } else if (diff > 1) {
        list.push({
          dim: "bridge",
          tone: "more",
          title: `Ponte ${diff} mm mais espaçada`,
          desc: "Indicada para pontes nasais mais largas ou para armações que você prefira ligeiramente mais baixas.",
        });
      } else {
        list.push({
          dim: "bridge",
          tone: "less",
          title: `Ponte ${Math.abs(diff)} mm mais fechada`,
          desc: "Oferece sustentação mais firme para quem tem dorso nasal fino, evitando que os óculos escorreguem.",
        });
      }
    }

    // 3. Haste
    if (parsedUser.temple && targetTempleMm) {
      const diff = targetTempleMm - parsedUser.temple;
      if (Math.abs(diff) <= 2) {
        list.push({
          dim: "temple",
          tone: "exact",
          title: "Comprimento de haste ideal",
          desc: `${Math.abs(diff)} mm de variação — encaixe atrás da orelha seguro e confortável.`,
        });
      } else if (diff > 2) {
        list.push({
          dim: "temple",
          tone: "more",
          title: `Haste ${diff} mm mais longa`,
          desc: "Mais estabilidade e conforto, ideal para quem tem rosto maior.",
        });
      } else {
        list.push({
          dim: "temple",
          tone: "less",
          title: `Haste ${Math.abs(diff)} mm mais curta`,
          desc: "Pode puxar atrás da orelha se você tiver distância têmpora-orelha mais longa. Avalie seu conforto.",
        });
      }
    }

    return list;
  }, [parsedUser, targetLensMm, targetBridgeMm, targetTempleMm]);

  return (
    <div className="w-full bg-[#F3F6FC] border border-slate-200 rounded-3xl p-4 sm:p-7 space-y-4 sm:space-y-6">
      {/* Título e instrução */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] sm:text-xs uppercase font-bold tracking-widest text-blue-800 flex items-center gap-1.5">
            <Ruler size={12} aria-hidden="true" />
            Ferramenta Interativa
          </span>
          <h3 className="text-base sm:text-xl font-semibold text-slate-900 tracking-tight mt-0.5">
            Compare com a sua armação atual
          </h3>
          <p className="text-[13px] sm:text-base text-slate-700 mt-1 max-w-xl leading-relaxed">
            Pegue um óculos que você já usa e confira os 3 números gravados na parte interna da haste (ex:{" "}
            <strong className="font-mono text-slate-900">52 · 18 · 145</strong>). Digite cada número no campo
            correspondente.
          </p>
        </div>

        {hasAnyValue && (
          <button
            type="button"
            onClick={() => setValues(EMPTY)}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-2 sm:px-3 text-sm font-medium text-slate-600 hover:text-blue-800 transition-colors motion-reduce:transition-none shrink-0"
          >
            <RefreshCw size={12} aria-hidden="true" /> Limpar
          </button>
        )}
      </div>

      {/* Os 3 números: ilustração, explicação e campo */}
      <div className="space-y-2.5 sm:space-y-3">
        {FIELDS.map(({ dim, id, ordinal, name, hint, min, max, placeholder, accent, Illustration }) => (
          <div
            key={dim}
            className="flex items-center gap-2.5 sm:gap-4 rounded-2xl bg-white border border-slate-200/90 p-2.5 sm:p-3.5 shadow-sm"
          >
            <Illustration accent={accent} className="w-14 sm:w-24 h-auto shrink-0" />
            <span aria-hidden="true" className="self-stretch w-px bg-slate-200 shrink-0" />
            <label htmlFor={id} className="flex-1 min-w-0 cursor-pointer">
              <span className="block text-[11px] sm:text-xs text-slate-500">{ordinal}</span>
              <span className="block text-[15px] sm:text-lg font-bold text-slate-900 leading-tight">
                {name} <span className="font-normal text-slate-500 text-xs sm:text-sm">(mm)</span>
              </span>
              <span className="block text-[11px] sm:text-sm text-slate-500 leading-snug">{hint}</span>
            </label>
            <input
              id={id}
              type="number"
              min={min}
              max={max}
              placeholder={placeholder}
              value={values[dim]}
              onChange={(e) => setValues((prev) => ({ ...prev, [dim]: e.target.value }))}
              inputMode="numeric"
              className="w-[78px] sm:w-28 min-h-[46px] sm:min-h-[56px] px-1.5 text-lg sm:text-2xl font-bold font-mono text-center text-slate-900 rounded-xl sm:rounded-2xl bg-white border border-slate-300 placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm"
            />
          </div>
        ))}
      </div>

      {/* Tamanhos comuns */}
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-[13px] sm:text-base font-medium text-slate-800">
          <Ruler size={16} className="text-blue-700 shrink-0" aria-hidden="true" />
          Sem um óculos à mão? Toque em um tamanho comum:
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {PRESETS.map((p) => {
            const selected = activePreset === p.label;
            return (
              <button
                key={p.label}
                type="button"
                aria-pressed={selected}
                onClick={() => applyPreset(p)}
                className={`min-h-[56px] px-1.5 py-2 rounded-2xl border text-center transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                  selected
                    ? "bg-blue-800 border-blue-800 text-white shadow-md"
                    : "bg-white border-slate-300 text-slate-900 hover:bg-blue-50"
                }`}
              >
                <span className="block text-sm sm:text-base font-bold">{p.label}</span>{" "}
                <span className={`block text-[11px] sm:text-sm tabular-nums ${selected ? "text-blue-100" : "text-slate-500"}`}>
                  ({p.lens} · {p.bridge} · {p.temple})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resultado */}
      <div aria-live="polite">
        {feedbacks.length > 0 ? (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
              <h4 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <Activity size={20} className="text-blue-700" aria-hidden="true" />
                Diagnóstico de Caimento
              </h4>
              <span className="text-[13px] sm:text-base text-slate-600">
                Comparando com <strong className="text-blue-800">{currentModelName}</strong>
              </span>
            </div>

            <div className="space-y-2.5">
              {feedbacks.map((item) => {
                const field = FIELDS.find((f) => f.dim === item.dim)!;
                const theme = DIM_THEME[item.dim];
                const Icon = item.tone === "exact" ? CheckCircle2 : Info;
                return (
                  <div
                    key={item.dim}
                    className={`rounded-2xl border p-3 sm:p-4 flex items-center gap-2.5 sm:gap-4 ${theme.card}`}
                  >
                    <span
                      className={`shrink-0 size-7 sm:size-9 rounded-full flex items-center justify-center text-white ${theme.badge}`}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-[15px] sm:text-lg font-bold text-slate-900 leading-snug">{item.title}</h5>
                      <p className="text-[13px] sm:text-base text-slate-700 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                    <span aria-hidden="true" className="self-stretch w-px bg-slate-300/60 shrink-0" />
                    <field.Illustration
                      accent={field.accent}
                      className="w-12 min-[400px]:w-14 sm:w-24 h-auto shrink-0"
                    />
                  </div>
                );
              })}
            </div>

            {/* Comparação visual com barras */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Scale size={18} className="text-blue-700" aria-hidden="true" />
                  Comparação Visual
                </h4>
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs sm:text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-blue-700" aria-hidden="true" /> Sua armação atual
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                    <span className="size-2.5 rounded-full bg-[#FFD62E]" aria-hidden="true" /> {currentModelName}
                  </span>
                </div>
              </div>

              <div className="space-y-3.5">
                {FIELDS.map(({ dim, chartLabel, scale }) => {
                  const user = parsedUser[dim];
                  const target = targets[dim];
                  return (
                    <div
                      key={dim}
                      className="grid grid-cols-[1fr_auto] sm:grid-cols-[170px_1fr_140px] items-center gap-x-4 gap-y-1.5"
                    >
                      <span className="text-[13px] sm:text-base font-medium text-slate-800">{chartLabel}</span>
                      <span className="text-xs sm:text-sm font-mono text-slate-700 text-right sm:col-start-3 sm:row-start-1 whitespace-nowrap">
                        {user ?? "—"} mm <span className="text-slate-400">vs</span> {target ?? "—"} mm
                      </span>
                      <div className="col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 space-y-1">
                        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          {user && (
                            <div
                              className="h-full rounded-full bg-blue-700 transition-[width] duration-300 motion-reduce:transition-none"
                              style={{ width: `${Math.min(100, (user / scale) * 100)}%` }}
                            />
                          )}
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          {target && (
                            <div
                              className="h-full rounded-full bg-[#FFD62E] transition-[width] duration-300 motion-reduce:transition-none"
                              style={{ width: `${Math.min(100, (target / scale) * 100)}%` }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-white/70 rounded-2xl border border-dashed border-blue-300/80 text-center">
            <p className="text-[13px] sm:text-base text-slate-700">
              Digite um ou mais números acima para ver a comparação visual de tamanho e caimento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
