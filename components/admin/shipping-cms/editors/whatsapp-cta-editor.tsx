"use client";

import React from "react";
import { SectionWhatsAppCtaData } from "@/types/shipping-cms";
import { MessageSquare } from "lucide-react";

interface WhatsAppCtaEditorProps {
  data: SectionWhatsAppCtaData;
  onChange: (updated: SectionWhatsAppCtaData) => void;
}

export function WhatsAppCtaEditor({ data, onChange }: WhatsAppCtaEditorProps) {
  const updateField = <K extends keyof SectionWhatsAppCtaData>(
    field: K,
    value: SectionWhatsAppCtaData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Bloco final de chamada para ação com direcionamento para atendimento no WhatsApp da ótica.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Selo Superior (Badge)
          </label>
          <input
            type="text"
            maxLength={60}
            value={data.badge_text || ""}
            onChange={(e) => updateField("badge_text", e.target.value)}
            placeholder="Ex: SUPORTE DIRETO EM ARAÇATUBA"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Texto do Botão
          </label>
          <input
            type="text"
            maxLength={40}
            value={data.button_text || ""}
            onChange={(e) => updateField("button_text", e.target.value)}
            placeholder="Ex: Falar com Consultor"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400 font-bold"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Título Principal
          </label>
          <input
            type="text"
            maxLength={80}
            value={data.title || ""}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Ex: Ficou com alguma dúvida sobre a entrega?"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400 font-bold"
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
            onChange={(e) => updateField("subtitle", e.target.value)}
            placeholder="Ex: Nossa equipe de consultoria e suporte em Araçatuba está à disposição no WhatsApp."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Tempo Médio de Resposta
          </label>
          <input
            type="text"
            maxLength={60}
            value={data.response_time_text || ""}
            onChange={(e) => updateField("response_time_text", e.target.value)}
            placeholder="Ex: Resposta em poucos minutos"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Horário de Atendimento
          </label>
          <input
            type="text"
            maxLength={60}
            value={data.working_hours_text || ""}
            onChange={(e) => updateField("working_hours_text", e.target.value)}
            placeholder="Ex: Seg a Sex: 09h às 18h | Sáb: 09h às 13h"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>
      </div>
    </div>
  );
}
