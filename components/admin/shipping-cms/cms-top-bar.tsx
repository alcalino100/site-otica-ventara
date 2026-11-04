"use client";

import React, { useRef } from "react";
import {
  Save,
  Send,
  Eye,
  History,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface CmsTopBarProps {
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isPurging: boolean;
  historyCount: number;
  onSaveDraft: () => Promise<void>;
  onOpenPublishModal: () => void;
  onOpenHistoryModal: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onPurgeCache: () => Promise<void>;
}

export function CmsTopBar({
  isDirty,
  isSaving,
  isPublishing,
  isPurging,
  historyCount,
  onSaveDraft,
  onOpenPublishModal,
  onOpenHistoryModal,
  onExportJson,
  onImportJson,
  onPurgeCache,
}: CmsTopBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Lado Esquerdo: Título & Status Dirty */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                CMS /entregas
              </h1>
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
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Gerencie textos, fotos, cores e seções sem precisar de código ou deploy.
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
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Exportar JSON</span>
          </button>

          {/* Importar Backup */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Importar backup de conteúdo em JSON"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload size={13} />
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
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <History size={13} />
            <span className="hidden sm:inline">Histórico ({historyCount})</span>
          </button>

          {/* Limpar Cache */}
          <button
            type="button"
            onClick={onPurgeCache}
            disabled={isPurging}
            title="Limpar cache do Next.js da página /entregas"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={isPurging ? "animate-spin text-amber-400" : ""} />
          </button>

          {/* Pré-visualizar Rascunho */}
          <a
            href="/entregas?preview=draft"
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir pré-visualização em nova aba"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Eye size={13} className="text-amber-400" />
            <span>Pré-visualizar</span>
          </a>

          {/* Salvar Rascunho */}
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save size={13} className={isSaving ? "animate-spin" : ""} />
            <span>{isSaving ? "Salvando..." : "Salvar Rascunho"}</span>
          </button>

          {/* Publicar no Ar */}
          <button
            type="button"
            id="btn-open-publish-modal"
            onClick={onOpenPublishModal}
            disabled={isPublishing}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-400/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send size={13} />
            <span>Publicar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
