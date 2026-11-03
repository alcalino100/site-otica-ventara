"use client";

import React from "react";
import { SectionEstimatedTimeframeData } from "@/types/shipping-cms";

interface EstimatedTimeframeEditorProps {
  data: SectionEstimatedTimeframeData;
  onChange: (updated: SectionEstimatedTimeframeData) => void;
}

export function EstimatedTimeframeEditor({
  data,
  onChange,
}: EstimatedTimeframeEditorProps) {
  const updateField = <K extends keyof SectionEstimatedTimeframeData>(
    field: K,
    value: SectionEstimatedTimeframeData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Barra clicável para orientar o cliente sobre os prazos médios de montagem e entrega.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Título</label>
            <span className="text-[10px] font-mono text-slate-500">
              {data.title?.length || 0}/50
            </span>
          </div>
          <input
            type="text"
            maxLength={50}
            value={data.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Ex: Prazo Estimado"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Link de Destino</label>
          </div>
          <input
            type="text"
            value={data.href || "/catalogo"}
            onChange={(e) => updateField("href", e.target.value)}
            placeholder="Ex: /catalogo"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Texto Explicativo</label>
            <span className="text-[10px] font-mono text-slate-500">
              {data.text?.length || 0}/200
            </span>
          </div>
          <textarea
            rows={2}
            maxLength={200}
            value={data.text || ""}
            onChange={(e) => updateField("text", e.target.value)}
            placeholder="Ex: Consulte o prazo no checkout (média de 24h a 48h úteis após montagem técnica)"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>
      </div>
    </div>
  );
}
