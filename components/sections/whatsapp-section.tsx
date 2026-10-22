"use client";

import React, { useState } from "react";
import { MessageSquare, ArrowRight, ShieldCheck, CheckCircle2, Glasses } from "lucide-react";
import { useSiteSettings } from "../providers/site-settings-provider";

interface WhatsAppSectionProps {
  onNotify?: (msg: string) => void;
}

export function WhatsAppSection({ onNotify }: WhatsAppSectionProps) {
  const [isOpening, setIsOpening] = useState(false);
  const { identity, cleanWhatsAppNumber } = useSiteSettings();

  const handleWhatsApp = () => {
    setIsOpening(true);
    if (onNotify) {
      onNotify(`Redirecionando para o WhatsApp oficial da ${identity.store_name}...`);
    }
    const msg = encodeURIComponent(`Olá! Gostaria de consultoria sobre armações e lentes da ${identity.store_name}.`);
    window.open(
      `https://wa.me/${cleanWhatsAppNumber}?text=${msg}`,
      "_blank",
      "noopener,noreferrer"
    );
    setIsOpening(false);
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#06111f] to-[#030810] border-b border-white/5 relative overflow-hidden" id="contato">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#091d33] via-[#07192c] to-[#040e18] border border-amber-400/25 p-8 sm:p-14 overflow-hidden shadow-2xl text-center md:text-left">
          {/* Subtle gold glow */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                ATENDIMENTO PERSONALIZADO
              </span>
              <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight leading-tight mb-4">
                Seu próximo olhar <br className="hidden sm:inline" />
                <span className="font-normal text-amber-400">começa aqui.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                Explore nossas opções ou fale com a equipe da Ótica Ventara para encontrar o modelo ideal para você.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-amber-400" /> Resposta ágil no WhatsApp
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-amber-400" /> Consultores especializados
                </span>
              </div>
            </div>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3.5 flex-shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleWhatsApp}
                disabled={isOpening}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xl shadow-amber-400/15"
              >
                <MessageSquare size={17} />
                <span>{isOpening ? "Conectando..." : "Fale com a Ventara"}</span>
                <ArrowRight size={15} />
              </button>

              <a
                href="#armacoes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-white border border-white/15 text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:border-amber-400/40"
              >
                <Glasses size={16} className="text-amber-400" />
                <span>Explorar catálogo</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
