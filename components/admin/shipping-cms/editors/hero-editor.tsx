"use client";

import React from "react";
import { SectionHeroData } from "@/types/shipping-cms";
import { CmsImageUpload } from "../cms-image-upload";

interface HeroEditorProps {
  data: SectionHeroData;
  onChange: (updated: SectionHeroData) => void;
  usedImageUrls?: string[];
}

export function HeroEditor({ data, onChange, usedImageUrls }: HeroEditorProps) {
  const updateField = <K extends keyof SectionHeroData>(field: K, value: SectionHeroData[K]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* 1. Imagem do Hero */}
      <CmsImageUpload
        label="Foto de Destaque do Hero"
        imageUrl={data.image_url}
        imageAlt={data.image_alt}
        focalPoint={data.focal_point || "center"}
        usedImageUrls={usedImageUrls}
        onImageChange={(url) => updateField("image_url", url)}
        onAltChange={(alt) => updateField("image_alt", alt)}
        onFocalPointChange={(fp) => updateField("focal_point", fp)}
        onRemove={() => updateField("image_url", "")}
      />

      {/* 2. Textos do Hero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Selo no Topo */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Selo Superior (Badge)</label>
            <span className="text-[10px] font-mono text-slate-500">{data.badge_text?.length || 0}/60</span>
          </div>
          <input
            type="text"
            maxLength={60}
            value={data.badge_text || ""}
            onChange={(e) => updateField("badge_text", e.target.value)}
            placeholder="Ex: ESTRUTURA LOGÍSTICA & RASTREAMENTO"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        {/* Linha 1 do Título */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Título - Linha 1</label>
            <span className="text-[10px] font-mono text-slate-500">{data.title_line1?.length || 0}/60</span>
          </div>
          <input
            type="text"
            maxLength={60}
            value={data.title_line1 || ""}
            onChange={(e) => updateField("title_line1", e.target.value)}
            placeholder="Ex: Rede de Entregas"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        {/* Linha 2 do Título */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Título - Linha 2 (Destaque)</label>
            <span className="text-[10px] font-mono text-slate-500">{data.title_line2?.length || 0}/60</span>
          </div>
          <input
            type="text"
            maxLength={60}
            value={data.title_line2 || ""}
            onChange={(e) => updateField("title_line2", e.target.value)}
            placeholder="Ex: Ventara"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400 font-bold"
          />
        </div>

        {/* Subtítulo */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Subtítulo Explicativo</label>
            <span className="text-[10px] font-mono text-slate-500">{data.subtitle?.length || 0}/200</span>
          </div>
          <textarea
            rows={2}
            maxLength={200}
            value={data.subtitle || ""}
            onChange={(e) => updateField("subtitle", e.target.value)}
            placeholder="Ex: Da nossa ótica em Araçatuba para todo o Brasil..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400 leading-relaxed"
          />
        </div>

        {/* Botão Primário */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Botão Principal - Texto</label>
            <span className="text-[10px] font-mono text-slate-500">{data.cta_text?.length || 0}/40</span>
          </div>
          <input
            type="text"
            maxLength={40}
            value={data.cta_text || ""}
            onChange={(e) => updateField("cta_text", e.target.value)}
            placeholder="Ex: Rastrear seu pedido"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
          <input
            type="text"
            value={data.cta_url || ""}
            onChange={(e) => updateField("cta_url", e.target.value)}
            placeholder="Link (ex: /rastreio)"
            className="w-full mt-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-300 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        {/* Botão Secundário */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Botão Secundário - Texto</label>
            <span className="text-[10px] font-mono text-slate-500">{data.secondary_cta_text?.length || 0}/40</span>
          </div>
          <input
            type="text"
            maxLength={40}
            value={data.secondary_cta_text || ""}
            onChange={(e) => updateField("secondary_cta_text", e.target.value)}
            placeholder="Ex: Ver cidades atendidas"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
          <input
            type="text"
            value={data.secondary_cta_url || ""}
            onChange={(e) => updateField("secondary_cta_url", e.target.value)}
            placeholder="Link (ex: #bloco-regional)"
            className="w-full mt-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-300 focus:outline-hidden focus:border-amber-400"
          />
        </div>
      </div>
    </div>
  );
}
