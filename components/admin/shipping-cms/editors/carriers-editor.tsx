"use client";

import React from "react";
import Image from "next/image";
import { SectionCarriersGridData } from "@/types/shipping-cms";
import { ShippingCarrier } from "@/types/shipping";
import { Eye, EyeOff, Truck } from "lucide-react";

interface CarriersEditorProps {
  data: SectionCarriersGridData;
  onChange: (updated: SectionCarriersGridData) => void;
}

export function CarriersEditor({ data, onChange }: CarriersEditorProps) {
  const updateHeaderField = <K extends keyof SectionCarriersGridData>(
    field: K,
    value: SectionCarriersGridData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const updateCarrier = (id: string, updates: Partial<ShippingCarrier>) => {
    const updated = (data.carriers || []).map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    onChange({ ...data, carriers: updated });
  };

  return (
    <div className="space-y-6">
      {/* 1. Textos da Seção */}
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
            placeholder="Ex: Rede Integrada de Despacho"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Título da Seção
          </label>
          <input
            type="text"
            maxLength={60}
            value={data.title || ""}
            onChange={(e) => updateHeaderField("title", e.target.value)}
            placeholder="Ex: Transportadoras que utilizamos"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Subtítulo da Seção
          </label>
          <textarea
            rows={2}
            maxLength={200}
            value={data.subtitle || ""}
            onChange={(e) => updateHeaderField("subtitle", e.target.value)}
            placeholder="Ex: Enviamos com os maiores operadores logísticos do país..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>
      </div>

      {/* 2. Grid de Transportadoras */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Truck size={14} className="text-amber-400" />
            <span>Operadores Cadastrados ({data.carriers?.length || 0})</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            Ative ou desative as empresas que prestam serviço
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(data.carriers || []).map((carrier) => (
            <div
              key={carrier.id}
              className={`p-3.5 rounded-xl border transition-all ${
                carrier.is_active
                  ? "bg-slate-900/80 border-slate-800"
                  : "bg-slate-950/40 border-slate-900 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 border border-slate-200">
                    <Image
                      src={carrier.logo_url}
                      alt={carrier.name}
                      width={32}
                      height={32}
                      className="object-contain max-h-6"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{carrier.name}</h5>
                    <p className="text-[10px] text-slate-400">{carrier.slug}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateCarrier(carrier.id, { is_active: !carrier.is_active })}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                    carrier.is_active
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {carrier.is_active ? <Eye size={10} /> : <EyeOff size={10} />}
                  <span>{carrier.is_active ? "Ativa" : "Oculta"}</span>
                </button>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <input
                  type="text"
                  maxLength={80}
                  value={carrier.delivery_time || ""}
                  onChange={(e) => updateCarrier(carrier.id, { delivery_time: e.target.value })}
                  placeholder="Prazo médio (ex: 2 a 5 dias úteis)"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                />
                <input
                  type="text"
                  maxLength={200}
                  value={carrier.description || ""}
                  onChange={(e) => updateCarrier(carrier.id, { description: e.target.value })}
                  placeholder="Descrição da rota atendida"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
