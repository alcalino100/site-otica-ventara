"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { SectionCarriersGridData } from "@/types/shipping-cms";
import { ShippingCarrier } from "@/types/shipping";
import { Eye, EyeOff, Truck, Upload, Plus, Trash2, Image as ImageIcon, AlertTriangle } from "lucide-react";

interface CarriersEditorProps {
  data: SectionCarriersGridData;
  onChange: (updated: SectionCarriersGridData) => void;
}

const CARRIER_PHOTO_PRESETS = [
  { label: "Van Ventara", path: "/images/shipping/van-ventara-aracatuba.jpg" },
  { label: "Azul Cargo", path: "/images/shipping/envio-brasil-azul-cargo.png" },
  { label: "Gollog Aéreo", path: "/images/shipping/transportadora-gollog.jpg" },
  { label: "Sedex Correios", path: "/images/shipping/transportadora-sedex.png" },
  { label: "Óculos Ventara", path: "/images/shipping/hero-glasses-ventara.jpg" },
];

export function CarriersEditor({ data, onChange }: CarriersEditorProps) {
  const [uploadingCarrierId, setUploadingCarrierId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<{ id: string; message: string } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

  const handleCarrierFileUpload = async (
    carrierId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validação de tamanho no cliente (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError({
        id: carrierId,
        message: "O arquivo excede o limite de 5 MB. Escolha uma foto menor.",
      });
      return;
    }

    setUploadingCarrierId(carrierId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/shipping/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || "Erro ao realizar upload da foto.");
      }

      if (resData.url) {
        updateCarrier(carrierId, { logo_url: resData.url });
      }
    } catch (err: any) {
      setUploadError({
        id: carrierId,
        message: err.message || "Falha na conexão durante upload da foto.",
      });
    } finally {
      setUploadingCarrierId(null);
      if (fileInputRefs.current[carrierId]) {
        fileInputRefs.current[carrierId]!.value = "";
      }
    }
  };

  const handleAddCarrier = () => {
    const newId = `carrier-${Date.now()}`;
    const newCarrier: ShippingCarrier = {
      id: newId,
      name: "Novo Operador Logístico",
      slug: `operador-${Date.now().toString(36)}`,
      description: "Despacho expresso e rastreamento contínuo para todo o país.",
      delivery_time: "Consulte prazo no checkout",
      logo_url: "/images/shipping/van-ventara-aracatuba.jpg",
      is_active: true,
      sort_order: (data.carriers?.length || 0) + 1,
    };
    onChange({
      ...data,
      carriers: [...(data.carriers || []), newCarrier],
    });
  };

  const handleRemoveCarrier = (id: string, name: string) => {
    if (confirm(`Deseja realmente remover o operador "${name}"?`)) {
      const filtered = (data.carriers || []).filter((c) => c.id !== id);
      onChange({ ...data, carriers: filtered });
    }
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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Truck size={14} className="text-amber-400" />
              <span>Operadores Cadastrados ({data.carriers?.length || 0})</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              Gerencie fotos, prazos, descrições e visibilidade de cada operador
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddCarrier}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
          >
            <Plus size={14} />
            <span>Adicionar Operador</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(data.carriers || []).map((carrier) => {
            const isUploading = uploadingCarrierId === carrier.id;
            const hasError = uploadError?.id === carrier.id;

            return (
              <div
                key={carrier.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  carrier.is_active
                    ? "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                    : "bg-slate-950/40 border-slate-900 opacity-60"
                }`}
              >
                {/* Cabeçalho do Card */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Nome do Operador
                    </label>
                    <input
                      type="text"
                      value={carrier.name}
                      onChange={(e) => updateCarrier(carrier.id, { name: e.target.value })}
                      placeholder="Ex: Azul Cargo Express"
                      className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end">
                    <button
                      type="button"
                      onClick={() => updateCarrier(carrier.id, { is_active: !carrier.is_active })}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                        carrier.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                      title={carrier.is_active ? "Clique para ocultar no site" : "Clique para ativar no site"}
                    >
                      {carrier.is_active ? <Eye size={11} /> : <EyeOff size={11} />}
                      <span>{carrier.is_active ? "Ativa" : "Oculta"}</span>
                    </button>

                    {(data.carriers || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCarrier(carrier.id, carrier.name)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Remover operador"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* BLOCO DE GESTÃO DA FOTO DA TRANSPORTADORA */}
                <div className="space-y-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon size={12} className="text-amber-400" />
                      <span>Foto do Veículo / Logo</span>
                    </label>
                    {isUploading && (
                      <span className="text-[10px] text-amber-400 font-semibold animate-pulse">
                        Enviando foto...
                      </span>
                    )}
                  </div>

                  {/* Pré-visualização + Botão de Upload */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-12 rounded-xl bg-slate-900 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center">
                      {carrier.logo_url ? (
                        <Image
                          src={carrier.logo_url}
                          alt={carrier.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <Truck size={18} className="text-slate-600" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={carrier.logo_url || ""}
                          onChange={(e) => updateCarrier(carrier.id, { logo_url: e.target.value })}
                          placeholder="URL da foto ou faça upload ao lado →"
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200 focus:outline-hidden focus:border-amber-400"
                        />
                        <label
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                            isUploading
                              ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                              : "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs"
                          }`}
                        >
                          <Upload size={12} />
                          <span>{isUploading ? "Enviando..." : "Trocar Foto"}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            className="hidden"
                            ref={(el) => {
                              fileInputRefs.current[carrier.id] = el;
                            }}
                            onChange={(e) => handleCarrierFileUpload(carrier.id, e)}
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Presets Rápidos de Fotos */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                    <span className="text-[9px] text-slate-500 shrink-0">Fotos rápidas:</span>
                    {CARRIER_PHOTO_PRESETS.map((preset) => (
                      <button
                        key={preset.path}
                        type="button"
                        onClick={() => updateCarrier(carrier.id, { logo_url: preset.path })}
                        className={`text-[9px] px-2 py-0.5 rounded-md whitespace-nowrap transition-colors cursor-pointer border ${
                          carrier.logo_url === preset.path
                            ? "bg-amber-400/20 border-amber-400 text-amber-300 font-bold"
                            : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Mensagem de Erro */}
                  {hasError && (
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] flex items-center gap-1.5">
                      <AlertTriangle size={12} className="shrink-0 text-rose-400" />
                      <span>{uploadError.message}</span>
                    </div>
                  )}
                </div>

                {/* Prazo e Descrição */}
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      Prazo Médio de Entrega
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      value={carrier.delivery_time || ""}
                      onChange={(e) => updateCarrier(carrier.id, { delivery_time: e.target.value })}
                      placeholder="Ex: Sedex de 1 a 4 dias úteis · PAC de 5 a 12 dias úteis"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">
                      Descrição da Rota Atendida
                    </label>
                    <input
                      type="text"
                      maxLength={200}
                      value={carrier.description || ""}
                      onChange={(e) => updateCarrier(carrier.id, { description: e.target.value })}
                      placeholder="Ex: Alcance completo em 100% dos municípios do Brasil com rastreamento oficial."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 focus:outline-hidden focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

