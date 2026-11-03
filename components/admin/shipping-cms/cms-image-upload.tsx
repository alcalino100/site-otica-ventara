"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, RefreshCw, AlertTriangle, Eye, EyeOff, CheckCircle2 } from "lucide-react";

interface CmsImageUploadProps {
  label: string;
  imageUrl?: string;
  imageAlt?: string;
  focalPoint?: string;
  overlay?: "subtle" | "medium" | "strong";
  caption?: string;
  showImage?: boolean;
  aspectRatio?: "16/9" | "3/2" | "4/3" | "square";
  usedImageUrls?: string[]; // Para detecção de duplicadas
  onImageChange: (url: string) => void;
  onAltChange: (alt: string) => void;
  onFocalPointChange?: (point: string) => void;
  onOverlayChange?: (overlay: "subtle" | "medium" | "strong") => void;
  onCaptionChange?: (caption: string) => void;
  onShowImageToggle?: (show: boolean) => void;
  onRemove: () => void;
}

export function CmsImageUpload({
  label,
  imageUrl,
  imageAlt = "",
  focalPoint = "center",
  overlay = "medium",
  caption = "",
  showImage = true,
  aspectRatio = "16/9",
  usedImageUrls = [],
  onImageChange,
  onAltChange,
  onFocalPointChange,
  onOverlayChange,
  onCaptionChange,
  onShowImageToggle,
  onRemove,
}: CmsImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verifica duplicidade da imagem
  const isDuplicate = Boolean(
    imageUrl &&
      usedImageUrls.filter((u) => u && u.trim() === imageUrl.trim()).length > 1
  );

  const isAltMissing = Boolean(imageUrl && (!imageAlt || imageAlt.trim().length < 3));

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validação de tamanho no cliente (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("O arquivo excede o limite de 5 MB. Escolha uma foto menor.");
      return;
    }

    // Validação de formato no cliente
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError("Formato inválido. Envie uma foto em JPG, PNG ou WebP.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/shipping/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao realizar upload da foto.");
      }

      onImageChange(data.url);
      if (!imageAlt) {
        // Sugestão de alt se ainda não houver
        onAltChange(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
    } catch (err: any) {
      setUploadError(err.message || "Falha na conexão durante upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "3/2":
        return "aspect-[3/2]";
      case "4/3":
        return "aspect-[4/3]";
      case "square":
        return "aspect-square";
      case "16/9":
      default:
        return "aspect-[16/9]";
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            {label}
          </label>
          <p className="text-[11px] text-slate-400">
            JPG, PNG ou WebP até 5 MB. Formato panorâmico recomendado.
          </p>
        </div>

        {onShowImageToggle && (
          <button
            type="button"
            onClick={() => onShowImageToggle(!showImage)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
              showImage
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            {showImage ? <Eye size={12} /> : <EyeOff size={12} />}
            <span>{showImage ? "Foto Visível" : "Foto Oculta"}</span>
          </button>
        )}
      </div>

      {/* Pré-visualização da Foto */}
      {imageUrl ? (
        <div className="space-y-3">
          <div
            className={`relative w-full ${getAspectClass()} rounded-xl overflow-hidden bg-slate-950 border border-slate-800`}
          >
            <Image
              src={imageUrl}
              alt={imageAlt || "Pré-visualização"}
              fill
              className="object-cover"
              style={{ objectPosition: focalPoint }}
            />

            {/* Overlay sutil */}
            <div
              className={`absolute inset-0 bg-gradient-to-t pointer-events-none ${
                overlay === "strong"
                  ? "from-slate-950 via-slate-950/60 to-transparent"
                  : overlay === "subtle"
                  ? "from-slate-950/40 via-transparent to-transparent"
                  : "from-slate-950/80 via-transparent to-transparent"
              }`}
            />

            {/* Ações Rápidas Sobrepostas */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Trocar imagem"
                className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-colors border border-white/20 text-xs"
              >
                <RefreshCw size={14} className={isUploading ? "animate-spin" : ""} />
              </button>
              <button
                type="button"
                onClick={onRemove}
                title="Remover imagem"
                className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md transition-colors border border-white/20 text-xs"
              >
                <X size={14} />
              </button>
            </div>

            {caption && (
              <div className="absolute bottom-2 left-2 z-10">
                <span className="text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs font-mono">
                  {caption}
                </span>
              </div>
            )}
          </div>

          {/* Aviso de Duplicidade */}
          {isDuplicate && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <AlertTriangle size={15} className="shrink-0" />
              <span>
                Esta mesma foto já está sendo usada em outro cartão. Para enriquecer a página, considere usar imagens distintas.
              </span>
            </div>
          )}

          {/* Configurações da Imagem */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Alt Text (Obrigatório por acessibilidade) */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <span>Texto Alternativo (Alt - Acessibilidade)</span>
                  <span className="text-amber-400">*</span>
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    isAltMissing ? "text-rose-400 font-bold" : "text-emerald-400"
                  }`}
                >
                  {isAltMissing ? "Obrigatório" : "Preenchido"}
                </span>
              </div>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => onAltChange(e.target.value)}
                placeholder="Ex: Van branca de entregas rápidas da Ótica Ventara"
                className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-xs text-slate-200 focus:outline-hidden focus:ring-1 ${
                  isAltMissing
                    ? "border-rose-500 focus:ring-rose-500/30"
                    : "border-slate-800 focus:border-amber-400 focus:ring-amber-400/30"
                }`}
              />
              {isAltMissing && (
                <p className="text-[10px] text-rose-400 mt-1">
                  O texto descritivo é indispensável para leitores de tela e SEO.
                </p>
              )}
            </div>

            {/* Enquadramento / Ponto Focal */}
            {onFocalPointChange && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Enquadramento (Ponto Focal)
                </label>
                <select
                  value={focalPoint}
                  onChange={(e) => onFocalPointChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                >
                  <option value="center">Centro</option>
                  <option value="top">Topo</option>
                  <option value="bottom">Base</option>
                  <option value="left">Esquerda</option>
                  <option value="right">Direita</option>
                  <option value="center right">Centro-Direita</option>
                  <option value="center left">Centro-Esquerda</option>
                </select>
              </div>
            )}

            {/* Intensidade do Gradiente */}
            {onOverlayChange && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Gradiente de Integração
                </label>
                <select
                  value={overlay}
                  onChange={(e) => onOverlayChange(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                >
                  <option value="subtle">Sutil (Mais foto visível)</option>
                  <option value="medium">Médio (Equilibrado)</option>
                  <option value="strong">Forte (Maior contraste para textos)</option>
                </select>
              </div>
            )}

            {/* Legenda / Crédito Opcional */}
            {onCaptionChange && (
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Legenda ou Crédito da Foto (Opcional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => onCaptionChange(e.target.value)}
                  placeholder="Ex: Foto ilustrativa / Frota própria"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Estado Vazio - Botão de Upload */
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full border-2 border-dashed border-slate-700 hover:border-amber-400/60 hover:bg-amber-400/5 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-amber-400/20 text-slate-300 group-hover:text-amber-400 flex items-center justify-center transition-colors">
              <Upload size={18} className={isUploading ? "animate-spin" : ""} />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                {isUploading ? "Enviando foto..." : "Clique para selecionar foto"}
              </p>
              <p className="text-[10px] text-slate-400">JPG, PNG ou WebP até 5 MB</p>
            </div>
          </button>
        </div>
      )}

      {/* Input de arquivo invisível */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadError && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
