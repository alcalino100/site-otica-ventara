"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { ShippingFaqItem } from "@/types/shipping";

interface ShippingFaqProps {
  title?: string;
  subtitle?: string;
  faqs?: ShippingFaqItem[];
}

export function ShippingFaq({
  title = "Perguntas Frequentes sobre Entregas",
  subtitle = "Tire suas dúvidas sobre prazos, embalagens especiais, rastreio e políticas de devolução",
  faqs = [],
}: ShippingFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const activeFaqs = faqs
    .filter((f) => f.is_active !== false)
    .sort((a, b) => a.sort_order - b.sort_order);

  if (activeFaqs.length === 0) {
    return null;
  }

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-20 sm:py-28 bg-[#030913] relative overflow-hidden border-b border-white/5" id="faq-entregas">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-semibold tracking-wider uppercase mb-4">
            <HelpCircle size={14} className="text-amber-400" />
            <span>Dúvidas Comuns</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight leading-tight mb-4">
            {title}
          </h2>

          <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Acordeão WAI-ARIA */}
        <div className="space-y-3.5" role="region" aria-label="Perguntas Frequentes de Entregas">
          {activeFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const buttonId = `faq-btn-${faq.id || index}`;
            const panelId = `faq-panel-${faq.id || index}`;

            return (
              <div
                key={faq.id || index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-[#061424] border-amber-400/40 shadow-xl"
                    : "bg-[#061424]/40 border-white/10 hover:border-white/20"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <span className="text-sm sm:text-base font-medium text-white tracking-tight">
                      {faq.question}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-300 ${
                        isOpen
                          ? "bg-amber-400 text-[#06111f] border-amber-400 rotate-180"
                          : "bg-white/5 text-slate-400 border-white/10"
                      }`}
                    >
                      <ChevronDown size={16} />
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className={`px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed font-light ${
                    isOpen ? "block animate-fade-in" : "hidden"
                  }`}
                >
                  <div className="pt-2 border-t border-white/5">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
