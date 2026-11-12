"use client";

import React, { useRef } from "react";
import Link from "next/link";
import {
  Save,
  Send,
  Eye,
  History,
  Download,
  Upload,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from "lucide-react";

interface ContentTopBarProps {
  pageTitle: string;
  pagePath: string;
  previewUrl: string;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  historyCount: number;
  onSaveDraft: () => Promise<void>;
  onOpenPublishModal: () => void;
  onOpenHistoryModal: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
}

export function ContentTopBar({
  pageTitle,
  pagePath,
  previewUrl,
  isDirty,
  isSaving,
  isPublishing,
  historyCount,
  onSaveDraft,
  onOpenPublishModal,
  onOpenHistoryModal,
  onExportJson,
  onImportJson,
}: ContentTopBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <header className="sticky top-16 z-30 bg-[#040e17]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-3 transition-colors mb-6 rounded-2xl shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Lado Esquerdo: Navegação de volta, Título & Status */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/conteudo"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
            title="Voltar ao Mapa do Site"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {pageTitle}
              </h1>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                ({pagePath})
              </span>
              {isDirty ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Não Salvo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                  <CheckCircle2 size={11} />
                  Sincronizado
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Edição direta de textos, imagens, links e visibilidade das seções.
            </p>
          </div>
        </div>

        {/* Lado Direito: Ações & Botões */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Exportar Backup */}
          <button
            type="button"
            onClick={onExportJson}
            title="Exportar backup completo em JSON"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Exportar JSON</span>
          </button>

          {/* Importar Backup */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Importar backup de conteúdo em JSON"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload size={14} />
            <span className="hidden sm:inline">Importar</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Histórico de Versões */}
          <button
            type="button"
            onClick={onOpenHistoryModal}
            title="Ver histórico de publicações e restaurar versões"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <History size={14} />
            <span className="hidden sm:inline">Histórico</span>
            {historyCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                {historyCount}
              </span>
            )}
          </button>

          {/* Pré-visualizar Draft */}
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir pré-visualização do rascunho em nova aba"
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/30 text-sky-300 hover:text-sky-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye size={14} />
            <span className="hidden sm:inline">Pré-visualizar</span>
          </a>

          {/* Salvar Rascunho */}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/40 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Salvar Rascunho</span>
          </button>

          {/* Publicar no Ar */}
          <button
            type="button"
            onClick={onOpenPublishModal}
            disabled={isPublishing}
            className="px-3.5 py-2 rounded-xl bg-[#FFD62E] hover:bg-[#e6c129] text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
          >
            {isPublishing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            <span>Publicar no Ar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
