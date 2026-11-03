"use client";

import React, { useState } from "react";
import { ShippingCmsHistoryRecord } from "@/types/shipping-cms";
import { History, RotateCcw, X, Calendar, User, Clock, CheckCircle2 } from "lucide-react";

interface CmsHistoryModalProps {
  isOpen: boolean;
  history: ShippingCmsHistoryRecord[];
  isLoading: boolean;
  onClose: () => void;
  onRestore: (historyId: string) => Promise<void>;
}

export function CmsHistoryModal({
  isOpen,
  history,
  isLoading,
  onClose,
  onRestore,
}: CmsHistoryModalProps) {
  const [restoringId, setRestoringId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRestore = async (id: string) => {
    const confirm = window.confirm(
      "Deseja carregar esta versão histórica no rascunho de trabalho? As modificações atuais não salvas serão substituídas."
    );
    if (!confirm) return;

    setRestoringId(id);
    try {
      await onRestore(id);
      onClose();
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
              <History size={16} />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Histórico de Versões Publicadas</h3>
              <p className="text-xs text-slate-400">
                Últimos 10 snapshots gravados no banco para auditoria e restauração instantânea.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Lista de Versões com Scroll */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Carregando histórico do servidor...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Nenhuma versão arquivada até o momento. As versões são geradas a cada publicação no ar.
            </div>
          ) : (
            history.map((record, index) => {
              const date = new Date(record.published_at);
              const formattedDate = date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
              const formattedTime = date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={record.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">
                        {record.version_label || `Versão #${index + 1}`}
                      </span>
                      {index === 0 && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Mais Recente
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300">
                      {record.change_summary || "Sem descrição de alterações"}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formattedDate} às {formattedTime}
                      </span>
                      {record.published_by && (
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {record.published_by}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRestore(record.id)}
                    disabled={restoringId === record.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors shrink-0 self-start sm:self-auto"
                  >
                    <RotateCcw
                      size={12}
                      className={restoringId === record.id ? "animate-spin" : ""}
                    />
                    <span>
                      {restoringId === record.id ? "Restaurando..." : "Restaurar como Rascunho"}
                    </span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
