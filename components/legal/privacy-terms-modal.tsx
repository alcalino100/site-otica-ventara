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
        <div className="legal-modal-root fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={activeTab === "terms" ? "Termos de Uso e Garantia" : "Política de Privacidade e LGPD"}
            className="relative z-10 w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800 max-h-[90vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Fechar"
              onClick={onClose}
            >
              <X size={20} />
            </button>

            <div className="flex gap-4 border-b border-slate-200 pb-3 mb-6 pr-10">
              <button
                type="button"
                onClick={() => setActiveTab("privacy")}
                className={`text-sm font-semibold flex items-center gap-2 pb-2 -mb-3 transition-colors ${
                  activeTab === "privacy"
                    ? "border-b-2 border-amber-600 text-amber-900"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <ShieldCheck size={18} /> Privacidade &amp; LGPD
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
                <FileText size={18} /> Termos &amp; Garantia (CDC)
              </button>
            </div>

            <div className="legal-body text-xs sm:text-sm text-slate-600 space-y-4 overflow-y-auto pr-3 leading-relaxed flex-1">
              {activeTab === "privacy" ? (
                <>
                  <h3 className="text-sm font-bold text-slate-900">1. Compromisso com a Privacidade e LGPD</h3>
                  <p>
                    A Ótica Ventara (CNPJ cadastrado, Rua Princesa Isabel, 221 - Centro, Araçatuba-SP) cumpre rigorosamente a
                    Lei Geral de Proteção de Dados (Lei Federal nº 13.709/2018 - LGPD), zelando pela privacidade, confidencialidade e segurança
                    das informações de seus clientes.
                  </p>

                  <h3 className="text-sm font-bold text-slate-900">2. Tratamento de Dados Sensíveis de Saúde (Receitas Oftalmológicas)</h3>
                  <p>
                    Em consonância com os Artigos 5º, II e 11 da LGPD, os dados ópticos constantes em receitas médicas
                    (como dioptrias esféricas, cilíndricas, eixos, adições e medições de Distância Nasopupilar - DNP) são classificados
                    como <strong>dados sensíveis de saúde</strong>. Esses dados são tratados com estrita finalidade de calibração, confecção,
                    surfaçagem e montagem precisa de suas lentes em nosso laboratório próprio, permanecendo sob sigilo profissional inviolável.
                  </p>

                  <h3 className="text-sm font-bold text-slate-900">3. Coleta e Finalidade dos Dados de Contato</h3>
                  <p>
                    Dados pessoais cadastrais (nome, telefone, WhatsApp e endereço) são empregados unicamente para processamento
                    de pedidos, emissão de nota fiscal, contato sobre o andamento da montagem e agendamento de entrega ou retirada.
                  </p>

                  <h3 className="text-sm font-bold text-slate-900">4. Não Compartilhamento e Segurança da Informação</h3>
                  <p>
                    A Ótica Ventara não vende, não aluga e não compartilha seus dados pessoais nem suas prescrições médicas com
                    terceiros para fins publicitários. O tráfego de dados neste ambiente é integralmente protegido por criptografia SSL/TLS.
                  </p>

                  <h3 className="text-sm font-bold text-slate-900">5. Direitos do Titular</h3>
                  <p>
                    Conforme o Art. 18 da LGPD, você pode, a qualquer tempo, solicitar acesso, confirmação, correção de dados incompletos
                    ou eliminação das informações através de nosso canal oficial de atendimento via WhatsApp ou presencialmente em nossa loja física.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-slate-900">1. Natureza do Catálogo e Pedidos</h3>
                  <p>
                    O website da Ótica Ventara integra catálogo oficial, vitrine interativa e canal direto de pedidos.
                    As fotos de armações e especificações técnicas milimétricas (lente, ponte e haste) retratam fielmente nossos modelos reais.
                  </p>

                  <h3 className="text-sm font-bold text-slate-900">2. Direito de Arrependimento (Art. 49 do CDC)</h3>
                  <p>
                    Em conformidade com o Código de Defesa do Consumidor (Lei nº 8.078/1990), nas compras de armações realizadas à distância
                    (online/WhatsApp com entrega a domicílio), o cliente tem o prazo de <strong>7 (sete) dias corridos</strong>, contados
                    do recebimento do produto, para exercer o direito de arrependimento e solicitar a devolução ou troca, desde que o produto
                    esteja em sua embalagem original, sem marcas de uso, acompanhado de nota fiscal e estojo protetor.
                  </p>

                  <h3 className="text-sm font-bold text-slate-900">3. Garantia de Fábrica e Adaptação Óptica</h3>
                  <p>
                    Todas as armações possuem <strong>garantia legal de 90 dias</strong> (Art. 26 do CDC) acrescida da garantia do fabricante
                    contra quaisquer defeitos de fabricação de materiais ou charneiras. Para lentes oftálmicas multifocais digitais OPTiSYNC HD,
                    oferecemos garantia assistida de adaptação visual de até 90 dias, com reavaliação técnica minuciosa caso necessário.
                  </p>

                  <h3 className="text-sm font-bold text-slate-900">4. Ajustes e Limpeza Ultrassônica Vitalícia</h3>
                  <p>
                    Clientes Ótica Ventara contam com suporte pós-venda gratuito para alinhamento ergonômico das hastes, plaquetas nasais
                    e higienização por ultrassom durante toda a vida útil da armação em nossa loja em Araçatuba-SP.
                  </p>

                  <h3 className="text-sm font-bold text-slate-900">5. Foro e Legislação</h3>
                  <p>
                    Fica eleito o foro da Comarca de Araçatuba - SP para dirimir quaisquer dúvidas oriundas das relações de consumo
                    estabelecidas neste ambiente, com aplicação estrita do CDC e da legislação brasileira.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
