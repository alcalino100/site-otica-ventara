"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Glasses,
  Share2,
  ArrowRight,
} from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface LensLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  frameType?: string;
  colorName: string;
  selectedLensName: string;
  selectedLensDesc: string;
}

export function LensLeadModal({
  isOpen,
  onClose,
  productName,
  frameType = "Armação de Grau",
  colorName,
  selectedLensName,
  selectedLensDesc,
}: LensLeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [socialProfile, setSocialProfile] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMessage("Por favor, informe seu nome.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Por favor, informe seu WhatsApp com DDD.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Salva no banco de dados de leads da Ótica Ventara
      await fetch("/api/leads/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          phone: phone.trim(),
          social_profile: socialProfile.trim() || undefined,
          product_name: productName,
          lens_type: selectedLensName,
        }),
      });
    } catch (err) {
      // Salva silenciosamente mesmo se offline
      console.warn("Aviso ao registrar lead:", err);
    }

    // 2. Monta a mensagem personalizada para o WhatsApp
    const catLabel = frameType === "Solar" ? "Óculos Solar" : "Armação de Grau";
    const socialText = socialProfile.trim()
      ? `\n• Perfil/Rede Social: ${socialProfile.trim()}`
      : "";

    const whatsappMsg =
      `Olá! Meu nome é ${cleanName}.\n` +
      `Gostei da armação "${productName}" (${catLabel} - Cor: ${colorName}) na Ótica Ventara.\n` +
      `• Interesse em lentes: ${selectedLensName} (${selectedLensDesc})${socialText}\n\n` +
      `Gostaria de consultar valores, tirar dúvidas sobre a montagem no laboratório e enviar minha receita médica para avaliação da dioptria.`;

    const url = buildWhatsAppUrl(whatsappMsg);
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }

    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop suave */}
          <motion.div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-auto"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header com gradiente sutil */}
            <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-b from-amber-50/50 to-white flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-100/70 border border-amber-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  <Sparkles size={11} className="text-amber-600" />
                  <span>Consultoria Óptica Especializada</span>
                </span>
                <h3
                  id="modal-title"
                  className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
                >
                  Consultar Lentes & Receita
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Conecte-se com nossa equipe técnica de Araçatuba-SP para tirar dúvidas e avaliar sua dioptria.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo Informativo estilo Vendrame (3 passos da compra com lente) */}
            <div className="p-6 space-y-5">
              {/* Resumo da Armação e Lente Selecionada */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Armação Escolhida:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                    {productName} ({colorName})
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 border-t border-slate-200/60 pt-1.5">
                  <span className="font-medium">Lente de Interesse:</span>
                  <span className="font-bold text-amber-700 truncate max-w-[200px]">
                    {selectedLensName}
                  </span>
                </div>
              </div>

              {/* Como Funciona estilo Ótica Vendrame */}
              <div className="grid grid-cols-3 gap-2 py-1 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-amber-600 block mb-0.5">PASSO 1</span>
                  <p className="text-[11px] font-semibold text-slate-800 leading-tight">Escolha da Armação</p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60">
                  <span className="text-[10px] font-bold text-amber-700 block mb-0.5">PASSO 2</span>
                  <p className="text-[11px] font-semibold text-slate-900 leading-tight">Envio da Receita / DP</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-emerald-700 block mb-0.5">PASSO 3</span>
                  <p className="text-[11px] font-semibold text-slate-800 leading-tight">Laboratório Próprio</p>
                </div>
              </div>

              {/* Formulário de Contato / Lead */}
              <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Gustavo Silva"
                    className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      WhatsApp / Celular *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(18) 99999-9999"
                      className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>Facebook ou Instagram</span>
                      <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
                    </label>
                    <input
                      type="text"
                      value={socialProfile}
                      onChange={(e) => setSocialProfile(e.target.value)}
                      placeholder="Ex: @usuario ou perfil"
                      className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-colors"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Seus dados são protegidos e usados exclusivamente para enviar o orçamento personalizado das lentes e orientações técnicas.
                </p>

                {/* Botão de Ação */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-13 mt-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                >
                  <MessageCircle size={18} className="fill-white text-emerald-600" />
                  <span>
                    {isSubmitting ? "CONECTANDO..." : "AVANÇAR PARA O WHATSAPP E ENVIAR RECEITA"}
                  </span>
                  <ArrowRight size={15} />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
