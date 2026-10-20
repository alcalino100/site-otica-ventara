"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, FileText } from "lucide-react";

interface PrivacyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "terms" | "privacy";
}

export function PrivacyTermsModal({
  isOpen,
  onClose,
  defaultTab = "privacy",
}: PrivacyTermsModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="legal-modal-root">
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={activeTab === "terms" ? "Termos de Uso" : "Política de Privacidade"}
              className="dialog max-w-2xl text-slate-800"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="close close-btn-accessible"
                aria-label="Fechar"
                onClick={onClose}
              >
                <X size={20} />
              </button>

              <div className="flex gap-4 border-b border-slate-200 pb-3 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("privacy")}
                  className={`text-sm font-semibold flex items-center gap-2 pb-2 -mb-3 transition-colors ${
                    activeTab === "privacy"
                      ? "border-b-2 border-amber-600 text-amber-900"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <ShieldCheck size={18} /> Política de Privacidade (LGPD)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("terms")}
                  className={`text-sm font-semibold flex items-center gap-2 pb-2 -mb-3 transition-colors ${
                    activeTab === "terms"
                      ? "border-b-2 border-amber-600 text-amber-900"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <FileText size={18} /> Termos de Uso
                </button>
              </div>

              <div className="legal-body text-xs text-slate-600 space-y-4 max-h-[60dvh] overflow-y-auto pr-2 leading-relaxed">
                {activeTab === "privacy" ? (
                  <>
                    <h3 className="text-sm font-bold text-slate-900">1. Compromisso com a Privacidade e LGPD</h3>
                    <p>
                      A Ótica Ventara está comprometida com a proteção dos seus dados pessoais, em total conformidade
                      com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
                    </p>

                    <h3 className="text-sm font-bold text-slate-900">2. Coleta e Finalidade dos Dados</h3>
                    <p>
                      Os dados coletados neste site (tais como nome, telefone de contato e seleção de modelos) são
                      utilizados exclusivamente para viabilizar o atendimento personalizado de consultoria óptica e
                      esclarecimento de dúvidas sobre armações e lentes.
                    </p>

                    <h3 className="text-sm font-bold text-slate-900">3. Não Compartilhamento com Terceiros</h3>
                    <p>
                      Nós não comercializamos nem transferimos suas informações pessoais a terceiros não autorizados. Seus
                      dados permanecem sob custódia segura e restrita aos profissionais da Ótica Ventara.
                    </p>

                    <h3 className="text-sm font-bold text-slate-900">4. Direitos do Titular</h3>
                    <p>
                      Você tem o direito de solicitar a confirmação de tratamento, acesso, correção ou eliminação de seus
                      dados a qualquer momento entrando em contato diretamente com nossa equipe em Araçatuba - SP.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-bold text-slate-900">1. Natureza da Plataforma</h3>
                    <p>
                      Este site constitui uma vitrine institucional e catálogo interativo da Ótica Ventara. As armações,
                      cores e características exibidas visam demonstrar o estilo e as possibilidades de nossas coleções.
                    </p>

                    <h3 className="text-sm font-bold text-slate-900">2. Disponibilidade e Confirmação de Estoque</h3>
                    <p>
                      A seleção de produtos feita no site não gera vínculo contratual imediato nem garante reserva
                      automática de estoque. As medidas, valores finais e disponibilidade de lentes oftálmicas serão
                      confirmados presencialmente ou via canal oficial de atendimento.
                    </p>

                    <h3 className="text-sm font-bold text-slate-900">3. Propriedade Intelectual</h3>
                    <p>
                      Todos os elementos gráficos, marcas, fotografias e ilustrações conceituais são de titularidade da
                      Ótica Ventara ou licenciados, sendo vedada a reprodução sem autorização prévia por escrito.
                    </p>

                    <h3 className="text-sm font-bold text-slate-900">4. Foro e Legislação Aplicável</h3>
                    <p>
                      Estes termos são regidos pelas leis da República Federativa do Brasil, elegendo-se o foro da comarca
                      de Araçatuba, Estado de São Paulo, para dirimir eventuais controvérsias.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
