"use client";

import React, { useState } from "react";
import { Send, X, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";

interface ContentPublishModalProps {
  isOpen: boolean;
  pageTitle: string;
  isPublishing: boolean;
  onClose: () => void;
  onConfirmPublish: (label: string, summary: string) => Promise<void>;
}

export function ContentPublishModal({
  isOpen,
  pageTitle,
  isPublishing,
  onClose,
  onConfirmPublish,
}: ContentPublishModalProps) {
  const [label, setLabel] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!label.trim()) {
      setError("Informe um rótulo para identificar a versão publicada.");
      return;
    }

    if (!summary.trim() || summary.trim().length < 3) {
      setError("Informe um breve resumo das alterações (mínimo 3 caracteres).");
      return;
    }

    try {
      await onConfirmPublish(label.trim(), summary.trim());
      setLabel("");
      setSummary("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao publicar alterações");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#040e17] border border-white/10 rounded-2xl p-6 shadow-2xl text-slate-100">
        {/* Fechar */}
        <button
          type="button"
          onClick={onClose}
          disabled={isPublishing}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Publicar Alterações no Ar</h2>
            <p className="text-xs text-slate-400">{pageTitle}</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-5">
          Ao confirmar, o rascunho de trabalho se tornará a versão pública ativa do site.
          Um snapshot será gravado no histórico para permitir reversão futura a qualquer momento.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Rótulo da Versão <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex: v1.2 — Ajuste nos textos do hero e FAQ"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Resumo das Modificações (Changelog) <span className="text-amber-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ex: Atualizado título do simulador e refinado texto de garantia do laboratório."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isPublishing}
              data-testid="cancel-publish-modal-btn"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPublishing}
              className="px-5 py-2.5 rounded-xl bg-[#FFD62E] hover:bg-[#e6c129] text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              <Send size={14} />
              <span>{isPublishing ? "Publicando no Ar..." : "Confirmar e Publicar"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
