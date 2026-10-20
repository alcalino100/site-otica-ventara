"use client";

import React, { useState } from "react";
import { MessageSquare, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

interface WhatsAppSectionProps {
  onNotify?: (msg: string) => void;
}

export function WhatsAppSection({ onNotify }: WhatsAppSectionProps) {
  const [isOpening, setIsOpening] = useState(false);

  const handleWhatsApp = () => {
    setIsOpening(true);
    if (onNotify) {
      onNotify("Redirecionando para o WhatsApp oficial da Ótica Ventara...");
    }
    setTimeout(() => {
      setIsOpening(false);
      window.open(
        "https://wa.me/5518996155748?text=Ol%C3%A1!%20Gostaria%20de%20consultoria%20sobre%20arma%C3%A7%C3%B5es%20e%20lentes%20da%20%C3%93tica%20Ventara.",
        "_blank",
        "noopener,noreferrer"
      );
    }, 400);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#06111f] to-[#040e18] border-b border-white/5" id="whatsapp">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-[#091d33] border border-amber-400/20 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Atendimento Online Especializado
              </span>
              <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight mb-3">
                Envie sua receita ou tire dúvidas pelo <span className="font-normal text-amber-400">WhatsApp</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                Nossa equipe analisa sua prescrição médica, recomenda as melhores espessuras e tratamentos de lentes e reserva armações para você.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-amber-400" /> Resposta rápida
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-amber-400" /> Atendimento de ótica real
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={handleWhatsApp}
                disabled={isOpening}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xl shadow-amber-400/10"
              >
                <MessageSquare size={18} />
                <span>{isOpening ? "Conectando..." : "Iniciar Atendimento"}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
