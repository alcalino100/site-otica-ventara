"use client";

import React, { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

interface AdminToastProps {
  /** Mensagem exibida no toast */
  message: string;
  /** "success" exibe fundo âmbar; "error" exibe fundo/borda rose */
  type: "success" | "error";
  /** Callback chamado ao fechar manualmente ou após auto-dismiss */
  onDismiss: () => void;
  /** Tempo em ms antes do auto-dismiss. Padrão: 3500ms */
  duration?: number;
}

/**
 * Toast acessível para o painel admin.
 * - role="status" (success) ou role="alert" (error) conforme WCAG 4.1.3
 * - aria-live="polite" (success) ou aria-live="assertive" (error)
 * - Auto-dismiss configurável + botão de fechar explícito
 * - Posição: fixed top-20 right-6 z-50
 */
export function AdminToast({ message, type, onDismiss, duration = 3500 }: AdminToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  const isSuccess = type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      aria-live={isSuccess ? "polite" : "assertive"}
      className={`fixed top-20 right-6 z-50 max-w-sm w-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl animate-fade-in border ${
        isSuccess
          ? "bg-amber-400 text-[#06111f] border-amber-500"
          : "bg-rose-950 text-rose-100 border-rose-500/50"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
      ) : (
        <XCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
      )}
      <span className="text-xs font-semibold leading-relaxed flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fechar notificação"
        className={`shrink-0 p-0.5 rounded-md transition-opacity hover:opacity-70 cursor-pointer ${
          isSuccess ? "text-[#06111f]" : "text-rose-300"
        }`}
      >
        <X size={14} />
      </button>
    </div>
  );
}
