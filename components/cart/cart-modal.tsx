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
    setTimeout(() => {
      setIsSubmitting(false);
      const whatsappUrl = buildWhatsAppCartUrl(cartItems);
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      onClose();
    }, 350);
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
            className="fixed inset-0 bg-black/65 backdrop-blur-sm -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
          />

          {/* Cart Drawer lateral autêntico (Padrão Eyewear Internacional) */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Sua seleção de armações"
            className="relative z-10 w-full max-w-[460px] h-full bg-[#050e18] text-white border-l border-white/10 shadow-[-25px_0_70px_rgba(0,0,0,0.85)] flex flex-col justify-between overflow-hidden"
            initial={{ transform: "translateX(100%)" }}
            animate={{ transform: "translateX(0%)" }}
            exit={{ transform: "translateX(100%)" }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar & Cabeçalho Editorial */}
            <div className="p-6 pb-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-amber-400 tracking-[0.2em] uppercase">
                  ÓTICA VENTARA · ATENDIMENTO EXCLUSIVO
                </span>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-90"
                  aria-label="Fechar gaveta"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  Sua Seleção
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium">
                  {cartItems.length} {cartItems.length === 1 ? "armação" : "armações"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Peças salvas para orientação e orçamento de lentes com nossos especialistas.
              </p>
            </div>

            {/* Conteúdo Central: Lista com FrameArt Real ou Estado Vazio */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
                    <ShoppingBag size={28} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">
                    Sua seleção está vazia
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6 leading-relaxed">
                    Explore nossa coleção de armações e adicione suas favoritas para consultar medidas e lentes personalizadas.
                  </p>
                  <Button
                    variant="dark"
                    onClick={onClose}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wider uppercase px-6 py-3 rounded-xl active:scale-95"
                  >
                    EXPLORAR ARMAÇÕES
                  </Button>
                </div>
              ) : (
                <>
                  {/* Lista de Produtos com Visual Eyewear Nobre */}
                  <div className="space-y-3">
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
                          className="p-3.5 rounded-2xl bg-[#091a2e]/70 border border-white/5 hover:border-white/15 transition-all flex gap-3.5 items-center group"
                        >
                          {/* Showcase da Armação (FrameArt ou Imagem Real) */}
                          <div className="w-24 h-16 rounded-xl bg-[#030910] border border-white/10 flex items-center justify-center p-2 relative overflow-hidden flex-shrink-0">
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

                          {/* Metadados e Valores */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                              {item.name}
                            </h4>

                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <span className="truncate">{item.category}</span>
                              <span>·</span>
                              <span className="truncate">{item.color}</span>
                            </div>

                            {item.priceInCents ? (
                              <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-xs font-bold text-amber-400">
                                  {(item.priceInCents / 100).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  em 10x de{" "}
                                  {(item.priceInCents / 1000).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </span>
                              </div>
                            ) : null}
                          </div>

                          {/* Botão de Exclusão Discreto */}
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all flex-shrink-0"
                            aria-label={`Remover ${item.name}`}
                            title="Remover da seleção"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Guia de Atendimento Consultivo em 2 Passos */}
                  <div className="p-3.5 rounded-2xl bg-amber-400/[0.04] border border-amber-400/15 space-y-2 mt-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 uppercase tracking-wider">
                      <Sparkles size={13} className="text-amber-400" />
                      Como funciona o atendimento:
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed pl-1">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>Armações reservadas digitalmente com seus dados.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>Orientação sobre lentes (grau, filtro azul ou sol) com consultores no WhatsApp.</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Badge da Loja Física em Araçatuba */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-300">
                    <MapPin size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Espaço Físico:</strong> Rua Princesa Isabel, 221 - Centro, Araçatuba-SP. Retirada gratuita com montagem e ajuste facial cortesia.
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Rodapé Financeiro e CTA WhatsApp */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-[#040b14]/90 backdrop-blur-md flex-shrink-0 space-y-4">
                {subtotalCents > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400">Total das armações</span>
                      <span className="text-xl font-bold text-amber-400">
                        {subtotalFormatted}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-[11px] text-slate-400">
                      <span>Condição no cartão</span>
                      <span>em até 10x de {installmentFormatted} sem juros</span>
                    </div>
                  </div>
                )}

                {/* Botão Primário WhatsApp com Acabamento Tátil */}
                <Button
                  variant="dark"
                  isLoading={isSubmitting}
                  onClick={handleCheckout}
                  className="w-full justify-center !bg-emerald-600 hover:!bg-emerald-500 border-none !text-white font-bold text-xs tracking-wider uppercase py-4 px-5 rounded-2xl shadow-xl shadow-emerald-950/40 active:scale-[0.98] transition-all duration-150 cursor-pointer flex items-center gap-2.5"
                >
                  <MessageCircle size={18} className="text-white flex-shrink-0" />
                  <span className="truncate">CONSULTAR SELEÇÃO NO WHATSAPP</span>
                  <ArrowRight size={16} className="text-white flex-shrink-0" />
                </Button>

                {/* Ações Secundárias */}
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-[11px] text-slate-500 hover:text-red-400 transition-colors py-1 cursor-pointer"
                  >
                    Limpar seleção
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="text-[11px] text-slate-400 hover:text-white transition-colors py-1 cursor-pointer"
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
