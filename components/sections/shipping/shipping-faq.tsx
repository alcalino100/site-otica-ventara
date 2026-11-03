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
    <section className="py-16 sm:py-24 bg-[#F3F0E9] relative overflow-hidden border-b border-[#E8E3D8]" id="faq-entregas">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF4C7] border border-amber-400/40 text-[#9A6700] text-xs font-semibold tracking-wider uppercase mb-4 shadow-2xs">
            <HelpCircle size={14} className="text-[#9A6700]" />
            <span>Dúvidas Comuns</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-light text-[#06111F] tracking-tight leading-tight mb-4">
            {title}
          </h2>

          <p className="text-sm sm:text-base text-[#4A5875] font-normal leading-relaxed">
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
                    ? "bg-white border-[#06111F]/30 shadow-md"
                    : "bg-white border-[#E8E3D8] hover:border-[#06111F]/20 shadow-xs"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06111F] focus-visible:ring-offset-2"
                  >
                    <span className="text-sm sm:text-base font-bold text-[#06111F] tracking-tight">
                      {faq.question}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-300 ${
                        isOpen
                          ? "bg-[#FFD62E] text-[#06111F] border-[#FFD62E] rotate-180"
                          : "bg-[#FAF8F4] text-[#06111F] border-[#E8E3D8]"
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
                  className={`px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm text-[#4A5875] leading-relaxed font-normal ${
                    isOpen ? "block animate-fade-in" : "hidden"
                  }`}
                >
                  <div className="pt-3 border-t border-[#E8E3D8]">
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
