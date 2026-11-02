"use client";

import React, { useState } from "react";
import { MessageSquare, ArrowRight, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { useSiteSettings } from "@/components/providers/site-settings-provider";

interface ShippingWhatsAppCtaProps {
  title?: string;
  subtitle?: string;
}

export function ShippingWhatsAppCta({
  title = "Ficou com alguma dúvida sobre a entrega?",
  subtitle = "Nossa equipe de consultoria e suporte em Araçatuba está à disposição no WhatsApp.",
}: ShippingWhatsAppCtaProps) {
  const [isOpening, setIsOpening] = useState(false);
  const { identity, cleanWhatsAppNumber } = useSiteSettings();

  const handleWhatsApp = () => {
    setIsOpening(true);
    const msg = encodeURIComponent(
      `Olá! Gostaria de tirar dúvidas sobre prazos e opções de entrega da ${identity.store_name}.`
    );
    window.open(
      `https://wa.me/${cleanWhatsAppNumber}?text=${msg}`,
      "_blank",
      "noopener,noreferrer"
    );
    setIsOpening(false);
  };

  return (
    <section className="py-20 sm:py-24 bg-[#02070D] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#091d33] via-[#07192c] to-[#040e18] border border-amber-400/25 p-8 sm:p-14 overflow-hidden shadow-2xl text-center md:text-left">
          {/* Subtle gold glow */}
          <div
            className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                SUPORTE DIRETO EM ARAÇATUBA
              </span>

              <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight leading-tight mb-4">
                {title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-light">
                {subtitle}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-amber-400" /> Resposta ágil no WhatsApp
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-amber-400" /> Atendimento de Seg. a Sex.
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3.5 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleWhatsApp}
                disabled={isOpening}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-xl shadow-amber-400/15"
              >
                <MessageSquare size={17} />
                <span>{isOpening ? "Conectando..." : "Falar com Atendente"}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
