"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Link as LinkIcon,
  HelpCircle,
  AlertTriangle,
  Upload,
  Loader2,
} from "lucide-react";
import { ContentSectionDefinition, ContentFieldDefinition, ContentImageValue } from "@/lib/content/types";
import { SafeRichText } from "@/components/content/safe-rich-text";

interface ContentSectionAccordionProps {
  section: ContentSectionDefinition;
  index: number;
  totalSections: number;
  values: Record<string, any>;
  isHidden: boolean;
  onFieldChange: (key: string, value: any) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
}

export function ContentSectionAccordion({
  section,
  index,
  totalSections,
  values,
  isHidden,
  onFieldChange,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
}: ContentSectionAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleImageUpload = async (key: string, file: File, currentAlt: string) => {
    setUploadingField(key);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao enviar imagem");
      }

      const data = await res.json();
      const newUrl = data.url;

      const updatedVal: ContentImageValue = {
        url: newUrl,
        alt: currentAlt || file.name.replace(/\.[^/.]+$/, ""),
        focalPoint: { x: 50, y: 50 },
      };

      onFieldChange(key, updatedVal);
    } catch (err: any) {
      alert(err.message || "Erro no upload da imagem");
    } finally {
      setUploadingField(null);
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        isHidden
          ? "bg-slate-950/40 border-white/5 opacity-60"
          : "bg-[#040e17]/80 border-white/10 shadow-lg hover:border-white/15"
      }`}
    >
      {/* Cabeçalho do Acordeão */}
      <div className="flex items-center justify-between p-4 sm:p-5 select-none">
        <div
          className="flex-1 flex items-center gap-3 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="p-2 rounded-xl bg-slate-900 border border-white/10 text-amber-400">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {section.label}
              </h3>
              {isHidden && (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                  Oculta no site
                </span>
              )}
            </div>
            {section.description && (
              <p className="text-xs text-slate-400 mt-0.5">{section.description}</p>
            )}
          </div>
        </div>

        {/* Controles de Ordem e Visibilidade */}
        <div className="flex items-center gap-1.5 shrink-0 ml-3">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Mover seção para cima"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowUp size={15} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === totalSections - 1}
            title="Mover seção para baixo"
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowDown size={15} />
          </button>
          <button
            type="button"
            onClick={onToggleVisibility}
            title={isHidden ? "Exibir seção no site" : "Ocultar seção no site"}
            className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-colors ${
              isHidden
                ? "bg-amber-400/10 text-amber-300 border-amber-400/30"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-white/10"
            }`}
          >
            {isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* Conteúdo Aberto dos Campos */}
      {isOpen && (
        <div className="p-4 sm:p-6 border-t border-white/10 space-y-5">
          {section.fields.map((field) => {
            const val = values[field.key] !== undefined ? values[field.key] : field.default;

            return (
              <div key={field.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-semibold text-slate-200">
                    {field.label}
                  </label>
                  {field.maxLength && typeof val === "string" && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {val.length} / {field.maxLength}
                    </span>
                  )}
                </div>

                {field.location && (
                  <p className="text-[11px] text-amber-400/80 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>Onde aparece: {field.location}</span>
                  </p>
                )}

                {/* Renderização baseada no tipo */}
                {renderFieldInput(field, val, (newVal) => onFieldChange(field.key, newVal), {
                  uploadingField,
                  handleImageUpload: (file, alt) => handleImageUpload(field.key, file, alt),
                })}

                {field.help && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <HelpCircle size={12} className="shrink-0 text-slate-500" />
                    <span>{field.help}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function renderFieldInput(
  field: ContentFieldDefinition,
  value: any,
  onChange: (val: any) => void,
  imageContext: {
    uploadingField: string | null;
    handleImageUpload: (file: File, currentAlt: string) => Promise<void>;
  }
) {
  switch (field.type) {
    case "text":
      return (
        <input
          id={field.key}
          type="text"
          value={value ?? ""}
          maxLength={field.maxLength}
          placeholder={field.placeholder || field.default}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors"
        />
      );

    case "textarea":
      return (
        <textarea
          id={field.key}
          rows={3}
          value={value ?? ""}
          maxLength={field.maxLength}
          placeholder={field.placeholder || field.default}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors resize-y leading-relaxed"
        />
      );

    case "rich":
      return (
        <div className="space-y-2">
          <textarea
            rows={5}
            value={value ?? ""}
            maxLength={field.maxLength}
            placeholder={field.placeholder || field.default}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors resize-y font-mono text-[11px] leading-relaxed"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>
              Dica: use <code className="text-amber-400">**negrito**</code>,{" "}
              <code className="text-amber-400">*itálico*</code> e{" "}
              <code className="text-amber-400">[link](https://...)</code>.
            </span>
          </div>
          {value && typeof value === "string" && value.trim().length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 text-xs text-slate-200">
              <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                Pré-visualização da Formatação:
              </span>
              <SafeRichText content={value} />
            </div>
          )}
        </div>
      );

    case "toggle":
      const isChecked = Boolean(value);
      return (
        <button
          type="button"
          onClick={() => onChange(!isChecked)}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-colors cursor-pointer ${
            isChecked
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-slate-900 text-slate-400 border-white/10"
          }`}
        >
          <span
            className={`w-3 h-3 rounded-full ${
              isChecked ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
            }`}
          />
          <span>{isChecked ? "Seção Ativada" : "Seção Desativada"}</span>
        </button>
      );

    case "color":
      return (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value || "#FFD62E"}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
          />
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="w-32 min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono"
          />
        </div>
      );

    case "select":
      return (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400/50 transition-colors"
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case "image":
      const imgVal: ContentImageValue =
        typeof value === "object" && value !== null
          ? value
          : { url: typeof value === "string" ? value : "", alt: "" };

      const isUploading = imageContext.uploadingField === field.key;

      return (
        <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            {/* Visualizador de Imagem */}
            <div className="relative aspect-video rounded-lg bg-slate-950 border border-white/10 overflow-hidden flex items-center justify-center">
              {imgVal.url ? (
                <img
                  src={imgVal.url}
                  alt={imgVal.alt || "Pré-visualização"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-500 text-center text-xs flex flex-col items-center gap-1">
                  <ImageIcon size={20} />
                  <span>Sem imagem definida</span>
                </div>
              )}
            </div>

            {/* Ações de Upload e URL */}
            <div className="space-y-2">
              <label className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-white/10">
                {isUploading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Upload size={15} />
                )}
                <span>{isUploading ? "Enviando arquivo..." : "Fazer Upload de Imagem"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isUploading}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) imageContext.handleImageUpload(f, imgVal.alt);
                  }}
                />
              </label>

              <input
                type="text"
                placeholder="Ou informe a URL / caminho local"
                value={imgVal.url || ""}
                onChange={(e) => onChange({ ...imgVal, url: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Campo de Alt Obrigatório */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Texto Alternativo (Alt) <span className="text-amber-400">* Obrigatório</span>
            </label>
            <input
              type="text"
              required
              value={imgVal.alt || ""}
              placeholder="Descreva a imagem para o Google e leitores de tela"
              onChange={(e) => onChange({ ...imgVal, alt: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-500"
            />
          </div>
        </div>
      );

    default:
      return (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs"
        />
      );
  }
}
