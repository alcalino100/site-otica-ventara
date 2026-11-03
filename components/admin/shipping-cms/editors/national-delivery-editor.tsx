"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SectionNationalDeliveryData } from "@/types/shipping-cms";
import { NationalShipmentCard } from "@/types/shipping";
import { CmsImageUpload } from "../cms-image-upload";
import { Mail, Truck, Plane, Eye, EyeOff, Sparkles } from "lucide-react";

interface NationalDeliveryEditorProps {
  data: SectionNationalDeliveryData;
  onChange: (updated: SectionNationalDeliveryData) => void;
  usedImageUrls?: string[];
}

export function NationalDeliveryEditor({
  data,
  onChange,
  usedImageUrls,
}: NationalDeliveryEditorProps) {
  const [activeCardTab, setActiveCardTab] = useState<string>(
    data.cards?.[0]?.id || "correios"
  );

  const updateHeaderField = <K extends keyof SectionNationalDeliveryData>(
    field: K,
    value: SectionNationalDeliveryData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const updateCard = (cardId: string, updates: Partial<NationalShipmentCard>) => {
    const updatedCards = (data.cards || []).map((card) =>
      card.id === cardId ? { ...card, ...updates } : card
    );
    onChange({ ...data, cards: updatedCards });
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "plane":
        return <Plane size={16} className="text-amber-400" />;
      case "truck":
        return <Truck size={16} className="text-blue-400" />;
      case "mail":
      default:
        return <Mail size={16} className="text-amber-400" />;
    }
  };

  const currentCard = data.cards?.find((c) => c.id === activeCardTab) || data.cards?.[0];

  return (
    <div className="space-y-6">
      {/* 1. Textos da Seção */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Selo Superior (Badge)</label>
            <span className="text-[10px] font-mono text-slate-500">
              {data.badge_text?.length || 0}/60
            </span>
          </div>
          <input
            type="text"
            maxLength={60}
            value={data.badge_text || ""}
            onChange={(e) => updateHeaderField("badge_text", e.target.value)}
            placeholder="Ex: Cobertura Interestadual"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Título da Seção</label>
            <span className="text-[10px] font-mono text-slate-500">
              {data.title?.length || 0}/60
            </span>
          </div>
          <input
            type="text"
            maxLength={60}
            value={data.title || ""}
            onChange={(e) => updateHeaderField("title", e.target.value)}
            placeholder="Ex: Enviamos para todo o Brasil"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Nota de Rastreamento (Rodapé)</label>
            <span className="text-[10px] font-mono text-slate-500">
              {data.tracking_note?.length || 0}/200
            </span>
          </div>
          <input
            type="text"
            maxLength={200}
            value={data.tracking_note || ""}
            onChange={(e) => updateHeaderField("tracking_note", e.target.value)}
            placeholder="Ex: Todo envio nacional segue com código de rastreamento ponta a ponta."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">Subtítulo da Seção</label>
            <span className="text-[10px] font-mono text-slate-500">
              {data.subtitle?.length || 0}/200
            </span>
          </div>
          <textarea
            rows={2}
            maxLength={200}
            value={data.subtitle || ""}
            onChange={(e) => updateHeaderField("subtitle", e.target.value)}
            placeholder="Ex: Se você mora em outro estado, escolhemos a melhor rota..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>
      </div>

      {/* 2. Seleção de Cartões Nacionais (Tabs) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Cartões de Modalidades Nacionais ({data.cards?.length || 0})
          </h4>
          <span className="text-[11px] text-slate-400">
            Configure foto, enquadramento e textos de cada rota
          </span>
        </div>

        {/* Abas dos Cartões */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(data.cards || []).map((card) => {
            const isSelected = card.id === (currentCard?.id || activeCardTab);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setActiveCardTab(card.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 ring-2 ring-amber-400/50 shadow-md"
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {getIcon(card.icon_name)}
                <span>{card.title}</span>
                {card.image_url && card.show_image !== false && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Foto configurada" />
                )}
              </button>
            );
          })}
        </div>

        {/* Detalhes do Cartão Selecionado */}
        {currentCard && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-slate-800 text-amber-400">
                  {getIcon(currentCard.icon_name)}
                </span>
                <div>
                  <h5 className="text-sm font-bold text-white">{currentCard.title}</h5>
                  <p className="text-[11px] text-slate-400">{currentCard.delivery_time}</p>
                </div>
              </div>

              {/* Toggle de Visibilidade do Cartão */}
              <button
                type="button"
                onClick={() => updateCard(currentCard.id, { is_active: !currentCard.is_active })}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                  currentCard.is_active !== false
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {currentCard.is_active !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                <span>{currentCard.is_active !== false ? "Cartão Ativo" : "Cartão Oculto"}</span>
              </button>
            </div>

            {/* Upload de Foto do Cartão Nacional */}
            <CmsImageUpload
              label={`Foto do Cartão (${currentCard.title})`}
              imageUrl={currentCard.image_url}
              imageAlt={currentCard.image_alt || ""}
              focalPoint={currentCard.image_position || "center"}
              overlay={currentCard.image_overlay || "medium"}
              caption={currentCard.image_caption || ""}
              showImage={currentCard.show_image !== false}
              aspectRatio="16/9"
              usedImageUrls={usedImageUrls}
              onImageChange={(url) => updateCard(currentCard.id, { image_url: url, show_image: true })}
              onAltChange={(alt) => updateCard(currentCard.id, { image_alt: alt })}
              onFocalPointChange={(fp) => updateCard(currentCard.id, { image_position: fp as any })}
              onOverlayChange={(ov) => updateCard(currentCard.id, { image_overlay: ov })}
              onCaptionChange={(cap) => updateCard(currentCard.id, { image_caption: cap })}
              onShowImageToggle={(show) => updateCard(currentCard.id, { show_image: show })}
              onRemove={() => updateCard(currentCard.id, { image_url: undefined, show_image: false })}
            />

            {/* Textos do Cartão */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Título do Cartão
                </label>
                <input
                  type="text"
                  maxLength={60}
                  value={currentCard.title || ""}
                  onChange={(e) => updateCard(currentCard.id, { title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Selo no Canto (Badge)
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={currentCard.badge || ""}
                  onChange={(e) => updateCard(currentCard.id, { badge: e.target.value })}
                  placeholder="Ex: Todo o Brasil, Rotas Expressas..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Prazo Médio Exibido
                </label>
                <input
                  type="text"
                  maxLength={80}
                  value={currentCard.delivery_time || ""}
                  onChange={(e) => updateCard(currentCard.id, { delivery_time: e.target.value })}
                  placeholder="Ex: 3 a 12 dias úteis"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Ícone Representativo
                </label>
                <select
                  value={currentCard.icon_name}
                  onChange={(e) => updateCard(currentCard.id, { icon_name: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                >
                  <option value="mail">Correios (Pacote / Caixa)</option>
                  <option value="truck">Caminhão / Rodoviário</option>
                  <option value="plane">Avião de Carga / Aéreo</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Descrição do Serviço
                </label>
                <textarea
                  rows={2}
                  maxLength={250}
                  value={currentCard.description || ""}
                  onChange={(e) => updateCard(currentCard.id, { description: e.target.value })}
                  placeholder="Ex: Ampla cobertura com postagens diárias..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
