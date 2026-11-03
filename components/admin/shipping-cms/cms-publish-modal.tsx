"use client";

import React, { useState } from "react";
import { ShippingCmsTheme } from "@/types/shipping-cms";
import { calculateContrast } from "@/lib/color-contrast";
import { ShieldCheck, ShieldAlert, Sparkles, X } from "lucide-react";

interface CmsPublishModalProps {
  isOpen: boolean;
  theme: ShippingCmsTheme;
  isPublishing: boolean;
  onClose: () => void;
  onConfirm: (versionLabel: string, changeSummary: string) => Promise<void>;
}

export function CmsPublishModal({
  isOpen,
  theme,
  isPublishing,
  onClose,
  onConfirm,
}: CmsPublishModalProps) {
  const [versionLabel, setVersionLabel] = useState("");
  const [changeSummary, setChangeSummary] = useState("");

  if (!isOpen) return null;

  const contrast = calculateContrast(theme.primary_text_color, theme.page_background);
  const isBlocked = !contrast.passesAA;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked || isPublishing) return;

    await onConfirm(
      versionLabel.trim() || `Publicação em ${new Date().toLocaleDateString("pt-BR")}`,
      changeSummary.trim() || "Atualização de conteúdo e estilo da página de entregas"
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold">
              <Sparkles size={16} />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">Publicar Alterações no Ar</h3>
              <p className="text-xs text-slate-400">
                O conteúdo entrará imediatamente em produção na rota /entregas.
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

        {/* Verificação de Acessibilidade */}
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
            isBlocked
              ? "bg-rose-950/40 border-rose-600/70 text-rose-200"
              : "bg-emerald-950/30 border-emerald-600/40 text-emerald-200"
          }`}
        >
          {isBlocked ? (
            <ShieldAlert size={20} className="text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <p className="font-bold">
              {isBlocked
                ? "Publicação Bloqueada por Inconsistência de Contraste"
                : "Acessibilidade Aprovada (WCAG AA)"}
            </p>
            <p className="opacity-80 mt-0.5">
              Taxa de contraste entre texto principal e fundo:{" "}
              <strong>{contrast.formattedRatio}</strong>{" "}
              {isBlocked ? "(mínimo obrigatório: 4.5:1)" : "(ótima legibilidade)"}.
            </p>
          </div>
        </div>

        {/* Formulário de Identificação da Versão */}
        <form onSubmit={handlePublish} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Rótulo da Versão (Nome Curto)
            </label>
            <input
              type="text"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              placeholder="Ex: Atualização de fotos e rotas de Araçatuba"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Resumo das Modificações (Changelog)
            </label>
            <textarea
              rows={3}
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Ex: Inserida foto da van no cartão Correios, ajustada paleta para off-white quente..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPublishing}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isBlocked || isPublishing}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isBlocked
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 active:scale-98"
              }`}
            >
              {isPublishing ? "Publicando e revalidando..." : "Confirmar e Publicar Agora"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
