"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { logger } from "../lib/observability";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.captureException(error, { digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-screen bg-[#030c13] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mb-6">
        <AlertCircle size={32} />
      </div>
      <p className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">
        Ótica Ventara
      </p>
      <h1 className="text-3xl font-light mb-4">Algo inesperado ocorreu</h1>
      <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
        Nossa equipe de engenharia já foi notificada. Por favor, tente recarregar ou volte para o início.
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => reset()}
          className="button outline inline-flex items-center gap-2"
        >
          <RotateCcw size={16} /> TENTAR NOVAMENTE
        </button>
        <a href="/" className="button dark">
          VOLTAR AO INÍCIO
        </a>
      </div>
    </div>
  );
}
