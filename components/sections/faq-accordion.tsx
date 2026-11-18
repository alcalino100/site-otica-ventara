"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HOME_FAQS as faqs } from "@/lib/home-faqs";


interface FAQAccordionProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}

export function FAQAccordion({
  eyebrow = "DÚVIDAS FREQUENTES",
  title = "Vamos olhar mais de perto?",
  subtitle = "Transparência em cada etapa. Se restar qualquer dúvida, nossa equipe está pronta para conversar.",
}: FAQAccordionProps = {}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="light-section py-20 sm:py-24 bg-white border-b border-slate-200" id="duvidas">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5 faq-intro">
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
            <p className="faq-lead text-slate-600 mt-4 text-sm max-w-sm">
              {subtitle}
            </p>
          </div>

          <div className="lg:col-span-7 faq-list w-full">
            {faqs.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <article key={item.question} className="faq-item border-b border-slate-300/80">
                  <button
                    type="button"
                    className="faq-toggle w-full flex items-center justify-between text-left py-5 text-slate-900 font-medium text-base hover:text-amber-800 transition-colors"
                    aria-expanded={isOpen}
                    onClick={() => toggle(i)}
                  >
                    <span>{item.question}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                      className="faq-icon text-amber-700 ml-4 flex-shrink-0"
                    >
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="faq-answer pb-5 pr-6 text-slate-600 text-sm leading-relaxed">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
