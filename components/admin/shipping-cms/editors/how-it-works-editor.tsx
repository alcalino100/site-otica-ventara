"use client";

import React from "react";
import { SectionHowItWorksData } from "@/types/shipping-cms";
import { ShippingTimelineStep } from "@/types/shipping";

interface HowItWorksEditorProps {
  data: SectionHowItWorksData;
  onChange: (updated: SectionHowItWorksData) => void;
}

export function HowItWorksEditor({ data, onChange }: HowItWorksEditorProps) {
  const updateHeaderField = <K extends keyof SectionHowItWorksData>(
    field: K,
    value: SectionHowItWorksData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const updateStep = (index: number, updates: Partial<ShippingTimelineStep>) => {
    const updated = [...(data.steps || [])];
    updated[index] = { ...updated[index], ...updates };
    onChange({ ...data, steps: updated });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Selo Superior (Badge)
          </label>
          <input
            type="text"
            maxLength={60}
            value={data.badge_text || ""}
            onChange={(e) => updateHeaderField("badge_text", e.target.value)}
            placeholder="Ex: Rastreamento Ponto a Ponto"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Título da Linha do Tempo
          </label>
          <input
            type="text"
            maxLength={60}
            value={data.title || ""}
            onChange={(e) => updateHeaderField("title", e.target.value)}
            placeholder="Ex: Como funciona nosso fluxo de entrega"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Subtítulo
          </label>
          <textarea
            rows={2}
            maxLength={200}
            value={data.subtitle || ""}
            onChange={(e) => updateHeaderField("subtitle", e.target.value)}
            placeholder="Ex: Do pedido confirmado no laboratório próprio até a chegada às suas mãos"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>
      </div>

      {/* 4 Passos do Fluxo */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Etapas da Jornada Logística ({data.steps?.length || 0})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data.steps || []).map((step, idx) => (
            <div
              key={step.step_number || idx}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                  {step.step_number || idx + 1}
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Etapa {idx + 1}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Título</label>
                <input
                  type="text"
                  maxLength={60}
                  value={step.title || ""}
                  onChange={(e) => updateStep(idx, { title: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Resumo Curto
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={step.short_description || ""}
                  onChange={(e) => updateStep(idx, { short_description: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Detalhes Técnicos
                </label>
                <textarea
                  rows={2}
                  maxLength={300}
                  value={step.detail || ""}
                  onChange={(e) => updateStep(idx, { detail: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
