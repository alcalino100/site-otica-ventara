"use client";

import React from "react";
import { SectionHighlightCardsData } from "@/types/shipping-cms";
import { ShieldCheck, Eye } from "lucide-react";

interface HighlightCardsEditorProps {
  data: SectionHighlightCardsData;
  onChange: (updated: SectionHighlightCardsData) => void;
}

export function HighlightCardsEditor({ data, onChange }: HighlightCardsEditorProps) {
  const updateField = <K extends keyof SectionHighlightCardsData>(
    field: K,
    value: SectionHighlightCardsData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-400">
        Os três cartões de destaque aparecem sobre a dobra inicial para transmitir confiança e agilidade.
      </p>

      {/* Cartão 1 */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Cartão 1 — Logística Regional
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Título</label>
            <input
              type="text"
              maxLength={50}
              value={data.card1_title || ""}
              onChange={(e) => updateField("card1_title", e.target.value)}
              placeholder="Ex: Araçatuba e Região"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Subtítulo</label>
            <input
              type="text"
              maxLength={100}
              value={data.card1_subtitle || ""}
              onChange={(e) => updateField("card1_subtitle", e.target.value)}
              placeholder="Ex: Entrega rápida com van própria"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Cartão 2 & Alternância para Seguro de Carga */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Cartão 2 — Cobertura / Seguro
          </h4>

          {/* Toggle Seguro de Carga */}
          <button
            type="button"
            onClick={() => updateField("show_cargo_insurance", !data.show_cargo_insurance)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
              data.show_cargo_insurance
                ? "bg-amber-400 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            <ShieldCheck size={12} />
            <span>
              {data.show_cargo_insurance
                ? "Exibindo Seguro de Carga"
                : "Exibindo Envio Brasil"}
            </span>
          </button>
        </div>

        {data.show_cargo_insurance ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div>
              <label className="text-xs font-semibold text-amber-200 block mb-1">
                Título do Seguro
              </label>
              <input
                type="text"
                maxLength={50}
                value={data.insurance_title || ""}
                onChange={(e) => updateField("insurance_title", e.target.value)}
                placeholder="Ex: Seguro de Carga Total"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-amber-200 block mb-1">
                Subtítulo do Seguro
              </label>
              <input
                type="text"
                maxLength={100}
                value={data.insurance_subtitle || ""}
                onChange={(e) => updateField("insurance_subtitle", e.target.value)}
                placeholder="Ex: Proteção garantida em 100% dos envios"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/40 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Título</label>
              <input
                type="text"
                maxLength={50}
                value={data.card2_title || ""}
                onChange={(e) => updateField("card2_title", e.target.value)}
                placeholder="Ex: Envio para todo o Brasil"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Subtítulo</label>
              <input
                type="text"
                maxLength={100}
                value={data.card2_subtitle || ""}
                onChange={(e) => updateField("card2_subtitle", e.target.value)}
                placeholder="Ex: Correios e transporte aéreo"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cartão 3 */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Cartão 3 — Rastreamento
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Título</label>
            <input
              type="text"
              maxLength={50}
              value={data.card3_title || ""}
              onChange={(e) => updateField("card3_title", e.target.value)}
              placeholder="Ex: Rastreio Ponto a Ponto"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Subtítulo</label>
            <input
              type="text"
              maxLength={100}
              value={data.card3_subtitle || ""}
              onChange={(e) => updateField("card3_subtitle", e.target.value)}
              placeholder="Ex: Atualizações em tempo real"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
