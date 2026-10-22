"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ArrowRight,
  ShoppingBag,
  Trash2,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { CartProduct, buildWhatsAppCartUrl } from "@/lib/cart";
import { FrameArt } from "../catalog/frame-art";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartProduct[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export function CartModal({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
}: CartModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCheckout = () => {
    setIsSubmitting(true);
    const whatsappUrl = buildWhatsAppCartUrl(cartItems);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setIsSubmitting(false);
    onClose();
  };

  const subtotalCents = cartItems.reduce(
    (acc, it) => acc + (it.priceInCents || 0),
    0
  );
  const subtotalFormatted = (subtotalCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const installmentFormatted = (subtotalCents / 1000).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="cart-modal-root fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop cinematográfico com desfoque suave na página */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
          />

          {/* Cart Drawer lateral amplo, espaçoso e autêntico (600px) */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Sua seleção de armações"
            className="relative z-10 w-full sm:max-w-[560px] md:max-w-[620px] h-full bg-[#050e18] text-white border-l border-white/10 shadow-[-30px_0_80px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden"
            initial={{ transform: "translateX(100%)" }}
            animate={{ transform: "translateX(0%)" }}
            exit={{ transform: "translateX(100%)" }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar & Cabeçalho Editorial com respiro amplo */}
            <div className="p-7 sm:p-8 pb-5 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[11px] font-semibold text-amber-400 tracking-[0.2em] uppercase">
                  ÓTICA VENTARA · ATENDIMENTO EXCLUSIVO
                </span>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-90"
                  aria-label="Fechar gaveta de seleção"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Sua Seleção
                </h2>
                <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium flex-shrink-0">
                  {cartItems.length} {cartItems.length === 1 ? "armação selecionada" : "armações selecionadas"}
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-400 mt-1.5 leading-relaxed">
                Armações salvas para orientação e orçamento de lentes com nossos especialistas ópticos.
              </p>
            </div>

            {/* Conteúdo Central: Lista Ampla com FrameArt em Escala Generosa */}
            <div className="flex-1 overflow-y-auto p-7 sm:p-8 space-y-5">
              {cartItems.length === 0 ? (
                <div className="py-24 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-3xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-5 shadow-inner">
                    <ShoppingBag size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Sua seleção está vazia
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-7 leading-relaxed">
                    Explore nossa coleção de armações e adicione suas favoritas para consultar medidas e lentes personalizadas.
                  </p>
                  <Button
                    variant="dark"
                    onClick={onClose}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wider uppercase px-7 py-3.5 rounded-xl active:scale-95"
                  >
                    EXPLORAR ARMAÇÕES
                  </Button>
                </div>
              ) : (
                <>
                  {/* Lista de Produtos com Showcase Nobre e Espaçoso */}
                  <div className="space-y-3.5">
                    {cartItems.map((item, index) => {
                      const isSolar = item.category?.toLowerCase().includes("solar");
                      const isAmber =
                        item.slug.includes("aurora") ||
                        Boolean(item.color?.toLowerCase().includes("âmbar"));
                      const isRound =
                        item.name.toLowerCase().includes("aurora") ||
                        item.name.toLowerCase().includes("urbano");

                      return (
                        <div
                          key={`${item.id}-${index}`}
                          className="p-4 rounded-2xl bg-[#091a2e]/80 border border-white/5 hover:border-white/15 transition-all flex gap-4 items-center group"
                        >
                          {/* Showcase Amplo da Armação */}
                          <div className="w-28 sm:w-32 h-20 rounded-xl bg-[#030910] border border-white/10 flex items-center justify-center p-2.5 relative overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <FrameArt
                                solar={isSolar}
                                amber={isAmber}
                                round={isRound}
                                className="w-full h-full object-contain"
                              />
                            )}
                          </div>

                          {/* Metadados e Valores com Respiro */}
                          <div className="flex-1 min-w-0 pr-1">
                            <h4 className="text-sm sm:text-base font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                              {item.name}
                            </h4>

                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <span className="truncate">{item.category}</span>
                              <span>·</span>
                              <span className="truncate">{item.color}</span>
                            </div>

                            {item.priceInCents ? (
                              <div className="flex items-baseline gap-2.5 mt-2">
                                <span className="text-sm font-bold text-amber-400">
                                  {(item.priceInCents / 100).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  em até 10x de{" "}
                                  {(item.priceInCents / 1000).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </span>
                              </div>
                            ) : null}
                          </div>

                          {/* Botão de Exclusão */}
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all flex-shrink-0"
                            aria-label={`Remover ${item.name}`}
                            title="Remover da seleção"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Guia de Atendimento Consultivo em 2 Passos */}
                  <div className="p-4 rounded-2xl bg-amber-400/[0.04] border border-amber-400/15 space-y-2.5 mt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
                      <Sparkles size={14} className="text-amber-400" />
                      Como funciona o atendimento:
                    </div>
                    <div className="text-xs text-slate-300 space-y-2 leading-relaxed pl-1">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>Armações reservadas digitalmente com seus dados.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>Orientação completa sobre lentes (grau, filtro azul ou sol) com consultores no WhatsApp.</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Badge da Loja Física em Araçatuba */}
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 leading-relaxed">
                    <MapPin size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Espaço Físico:</strong> Rua Princesa Isabel, 221 - Centro, Araçatuba-SP. Retirada gratuita com montagem técnica e ajuste facial cortesia.
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Rodapé Financeiro e CTA WhatsApp em Linha Única */}
            {cartItems.length > 0 && (
              <div className="p-7 sm:p-8 pt-5 border-t border-white/10 bg-[#040b14]/95 backdrop-blur-md flex-shrink-0 space-y-4">
                {subtotalCents > 0 && (
                  <div className="space-y-1 bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
                    <div className="flex items-baseline justify-between text-xs sm:text-sm">
                      <span className="text-slate-400 font-medium">Subtotal das armações:</span>
                      <span className="text-xl sm:text-2xl font-bold text-amber-400">
                        {subtotalFormatted}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-[11px] sm:text-xs text-slate-400">
                      <span>Condição de pagamento:</span>
                      <span>em até 10x de {installmentFormatted} sem juros no cartão</span>
                    </div>
                  </div>
                )}

                {/* Botão Primário WhatsApp Fluido, Sem Quebras e em Linha Única */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCheckout}
                  className="w-full h-14 bg-[#128c7e] hover:bg-[#0d6e63] active:scale-[0.98] text-white font-bold text-xs sm:text-sm tracking-wider uppercase px-6 rounded-2xl shadow-xl shadow-emerald-950/50 transition-all duration-150 cursor-pointer flex items-center justify-center gap-3 border-none select-none"
                >
                  <MessageCircle size={20} className="text-white flex-shrink-0" />
                  <span className="whitespace-nowrap font-bold">
                    {isSubmitting ? "CONECTANDO..." : "CONSULTAR SELEÇÃO NO WHATSAPP"}
                  </span>
                  <ArrowRight size={17} className="text-white flex-shrink-0" />
                </button>

                {/* Ações Secundárias */}
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors py-1 cursor-pointer"
                  >
                    Limpar toda a seleção
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-slate-400 hover:text-white transition-colors py-1 cursor-pointer"
                  >
                    Continuar navegando
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
