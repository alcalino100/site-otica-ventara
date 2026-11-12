"use client";

import React, { useState } from "react";
import { History, X, RotateCcw, Calendar, User, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { SiteContentHistoryRecord } from "@/lib/content/types";

interface ContentHistoryModalProps {
  isOpen: boolean;
  pageTitle: string;
  history: SiteContentHistoryRecord[];
  isLoading: boolean;
  onClose: () => void;
  onRestoreVersion: (historyId: string) => Promise<void>;
}

export function ContentHistoryModal({
  isOpen,
  pageTitle,
  history,
  isLoading,
  onClose,
  onRestoreVersion,
}: ContentHistoryModalProps) {
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  if (!isOpen) return null;

  const handleRestore = async (item: SiteContentHistoryRecord) => {
    const confirm = window.confirm(
      `Deseja realmente restaurar a versão "${item.label || "Sem rótulo"}" para o seu rascunho de trabalho? Você poderá pré-visualizar antes de publicar.`
    );
    if (!confirm) return;

    setRestoringId(item.id);
    setFeedback(null);
    try {
      await onRestoreVersion(item.id);
      setFeedback({
        type: "success",
        message: "Versão carregada no rascunho de trabalho com sucesso!",
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Erro ao restaurar versão",
      });
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#040e17] border border-white/10 rounded-2xl p-6 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
        {/* Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="p-2.5 rounded-xl bg-sky-400/10 text-sky-400 border border-sky-400/20">
            <History size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Histórico de Publicações & Versões</h2>
            <p className="text-xs text-slate-400">{pageTitle}</p>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3 mb-4 rounded-xl text-xs flex items-center gap-2 shrink-0 ${
              feedback.type === "success"
                ? "bg-emerald-950/50 border border-emerald-500/30 text-emerald-300"
                : "bg-red-950/50 border border-red-500/30 text-red-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle size={16} className="shrink-0 text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
              <Loader2 size={24} className="animate-spin text-amber-400" />
              <span>Carregando histórico de snapshots...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <p>Nenhuma versão histórica publicada até o momento.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Toda publicação de conteúdo grava automaticamente um snapshot recuperável nesta lista.
              </p>
            </div>
          ) : (
            history.map((item, idx) => {
              const formattedDate = new Date(item.created_at).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-white/5 hover:border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-white">
                        {item.label || `Versão #${history.length - idx}`}
                      </span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                          Última Publicada
                        </span>
                      )}
                    </div>

                    {item.summary && (
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {item.summary}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-500" />
                        {formattedDate}
                      </span>
                      {item.created_by && (
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-slate-500" />
                          {item.created_by}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRestore(item)}
                    disabled={restoringId === item.id}
                    className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {restoringId === item.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RotateCcw size={13} />
                    )}
                    <span>Restaurar Rascunho</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 border-t border-white/10 mt-4 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            data-testid="close-history-modal-btn"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
