"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Como funciona a escolha de armações na Ótica Ventara?",
    answer:
      "Você pode explorar nosso catálogo online para salvar seus modelos favoritos e nos enviar via WhatsApp. Em nosso espaço físico em Araçatuba, realizamos uma consultoria de visagismo gratuita para testar o caimento, formato e medidas faciais.",
  },
  {
    question: "Posso fazer os exames de vista ou trazer minha receita?",
    answer:
      "Você pode trazer a receita do seu oftalmologista de confiança! Orientamos sobre os melhores tratamentos para o seu grau e realizamos a conferência e medição da distância nasopupilar (DNP) com equipamento digital.",
  },
  {
    question: "Quais são os prazos médios de confecção das lentes?",
    answer:
      "Lentes de visão simples (miopia, hipermetropia e astigmatismo) têm prazo ágil de 2 a 5 dias úteis. Lentes multifocais e tratamentos especiais levam de 5 a 8 dias úteis, garantindo conferência minuciosa em laboratório.",
  },
  {
    question: "Como funciona a garantia e os ajustes pós-venda?",
    answer:
      "Todas as nossas armações e tratamentos de lentes contam com garantia de fábrica contra defeitos. Além disso, você tem ajustes, alinhamentos e higienização ultrassônica gratuitos durante toda a vida útil dos seus óculos.",
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="faq light-section" id="duvidas">
      <div className="faq-intro">
        <p className="eyebrow">DÚVIDAS FREQUENTES</p>
        <h2>
          Vamos olhar<br />
          mais de <span>perto?</span>
        </h2>
        <p className="faq-lead text-slate-600 mt-4 text-sm max-w-sm">
          Transparência em cada etapa. Se restar qualquer dúvida, nossa equipe está pronta para conversar.
        </p>
      </div>

      <div className="faq-list">
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
    </section>
  );
}
