"use client";

import React, { useState } from "react";
import { SectionRegionalDeliveryData } from "@/types/shipping-cms";
import { CityChip } from "@/types/shipping";
import { CmsImageUpload } from "../cms-image-upload";
import { Plus, X, MapPin } from "lucide-react";

interface RegionalDeliveryEditorProps {
  data: SectionRegionalDeliveryData;
  onChange: (updated: SectionRegionalDeliveryData) => void;
  usedImageUrls?: string[];
}

export function RegionalDeliveryEditor({
  data,
  onChange,
  usedImageUrls,
}: RegionalDeliveryEditorProps) {
  const [newCityName, setNewCityName] = useState("");

  const updateField = <K extends keyof SectionRegionalDeliveryData>(
    field: K,
    value: SectionRegionalDeliveryData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const addCity = () => {
    if (!newCityName.trim()) return;
    const newCity: CityChip = {
      id: `city-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newCityName.trim(),
      sort_order: (data.cities?.length || 0) + 1,
    };
    updateField("cities", [...(data.cities || []), newCity]);
    setNewCityName("");
  };

  const removeCity = (id: string) => {
    updateField(
      "cities",
      (data.cities || []).filter((c) => c.id !== id)
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Foto da Van de Entregas */}
      <CmsImageUpload
        label="Foto de Fundo do Bloco Regional (Van Ventara)"
        imageUrl={data.image_url}
        imageAlt={data.image_alt}
        focalPoint={data.focal_point || "center right"}
        overlay={data.gradient_intensity || "strong"}
        usedImageUrls={usedImageUrls}
        onImageChange={(url) => updateField("image_url", url)}
        onAltChange={(alt) => updateField("image_alt", alt)}
        onFocalPointChange={(fp) => updateField("focal_point", fp)}
        onOverlayChange={(ov) => updateField("gradient_intensity", ov)}
        onRemove={() => updateField("image_url", "")}
      />

      {/* 2. Textos do Bloco */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Selo */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Selo Superior</label>
            <span className="text-[10px] font-mono text-slate-500">
              {data.badge_text?.length || 0}/60
            </span>
          </div>
          <input
            type="text"
            maxLength={60}
            value={data.badge_text || ""}
            onChange={(e) => updateField("badge_text", e.target.value)}
            placeholder="Ex: LOGÍSTICA PRÓPRIA REGIONAL"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        {/* Título Parte 1 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Título - Parte 1</label>
            <span className="text-[10px] font-mono text-slate-500">
              {data.title_part1?.length || 0}/50
            </span>
          </div>
          <input
            type="text"
            maxLength={50}
            value={data.title_part1 || ""}
            onChange={(e) => updateField("title_part1", e.target.value)}
            placeholder="Ex: Entrega Expressa em"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        {/* Título Parte 2 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Título - Parte 2 (Amarelo)</label>
            <span className="text-[10px] font-mono text-slate-500">
              {data.title_part2?.length || 0}/50
            </span>
          </div>
          <input
            type="text"
            maxLength={50}
            value={data.title_part2 || ""}
            onChange={(e) => updateField("title_part2", e.target.value)}
            placeholder="Ex: Araçatuba e Região"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400 font-bold"
          />
        </div>

        {/* Descrição */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Descrição do Serviço Regional</label>
            <span className="text-[10px] font-mono text-slate-500">
              {data.description?.length || 0}/400
            </span>
          </div>
          <textarea
            rows={3}
            maxLength={400}
            value={data.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Ex: Com frota própria e equipe dedicada..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400 leading-relaxed"
          />
        </div>
      </div>

      {/* 3. Cidades Atendidas com Rota Local */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={14} className="text-amber-400" />
            <span>Cidades Atendidas na Rota Regional</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            {data.cities?.length || 0} cidades cadastradas
          </span>
        </div>

        {/* Chips de Cidades */}
        <div className="flex flex-wrap gap-2 pt-1">
          {(data.cities || []).map((city) => (
            <div
              key={city.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-slate-200 group"
            >
              <span>{city.name}</span>
              <button
                type="button"
                onClick={() => removeCity(city.id)}
                title={`Remover ${city.name}`}
                className="text-slate-400 hover:text-rose-400 transition-colors p-0.5 rounded-full"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Input para Adicionar Nova Cidade */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCity();
              }
            }}
            placeholder="Nome do município (ex: Guaiçara)"
            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
          <button
            type="button"
            onClick={addCity}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
