"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ArrowRight,
  ShoppingBag,
  Trash2,
  MessageCircle,
  Glasses,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { Button } from "../ui/button";
import { CartProduct, buildWhatsAppCartUrl } from "@/lib/cart";

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
    }, 400);
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
        <div className="cart-modal-root fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop escuro com desfoque no fundo da página */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Diálogo do modal com nitidez máxima e z-index superior */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Sua seleção de armações"
            className="dialog cart-dialog-custom relative z-10 w-full max-w-lg bg-[#071320] text-white border border-white/15 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden max-h-[90dvh] flex flex-col pointer-events-auto"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar Acessível */}
            <button
              type="button"
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95 z-20"
              aria-label="Fechar seleção"
              onClick={onClose}
            >
              <X size={20} />
            </button>

            {/* Cabeçalho do Carrinho */}
            <div className="cart-header mb-5 pr-8">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">
                  SEUS FAVORITOS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-medium">
                  Atendimento Oficial
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Sua seleção ({cartItems.length})
              </h2>
            </div>

            {/* Conteúdo: Lista ou Estado Vazio */}
            {cartItems.length === 0 ? (
              <div className="cart-empty py-12 text-center flex-1 flex flex-col items-center justify-center">
                <div className="cart-empty-icon mb-4 w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-inner">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5">
                  Sua seleção está vazia no momento
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6 leading-relaxed">
                  Navegue pelo nosso catálogo de armações e adicione os modelos
                  que você deseja experimentar ou consultar com lentes
                  personalizadas.
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
                {/* Lista de Itens com Thumbnails */}
                <ul className="cart-list flex-1 overflow-y-auto space-y-3 pr-1.5 my-2 max-h-[320px] scrollbar-thin">
                  {cartItems.map((item, index) => (
                    <li
                      key={`${item.id}-${index}`}
                      className="cart-item flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-[#091a2e] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      {/* Thumbnail do produto */}
                      <div className="w-14 h-14 rounded-xl bg-[#040e1a] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Glasses size={22} className="text-amber-400/80" />
                        )}
                      </div>

                      {/* Informações */}
                      <div className="cart-item-details flex-1 min-w-0">
                        <span className="cart-item-name font-semibold text-sm text-white block truncate">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 font-medium">
                            {item.category}
                          </span>
                          <span>·</span>
                          <span className="truncate">{item.color}</span>
                        </div>
                        {item.priceInCents ? (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-amber-400">
                              {(item.priceInCents / 100).toLocaleString(
                                "pt-BR",
                                {
                                  style: "currency",
                                  currency: "BRL",
                                }
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              (10x de{" "}
                              {(item.priceInCents / 1000).toLocaleString(
                                "pt-BR",
                                {
                                  style: "currency",
                                  currency: "BRL",
                                }
                              )}
                              )
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {/* Botão Remover */}
                      <button
                        type="button"
                        className="cart-item-remove p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors active:scale-95 flex-shrink-0"
                        aria-label={`Remover ${item.name}`}
                        onClick={() => onRemoveItem(item.id)}
                        title="Remover da seleção"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Resumo Financeiro & Consultoria */}
                <div className="cart-summary border-t border-white/10 pt-4 mt-3 space-y-3.5">
                  {subtotalCents > 0 && (
                    <div className="flex items-baseline justify-between bg-[#091a2e]/60 p-3 rounded-xl border border-white/5">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">
                          Total das armações
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ou em até 10x de {installmentFormatted} sem juros
                        </span>
                      </div>
                      <span className="text-lg font-bold text-amber-400">
                        {subtotalFormatted}
                      </span>
                    </div>
                  )}

                  {/* Trust Badge Araçatuba */}
                  <div className="flex items-start gap-2 text-[11px] text-slate-300 bg-amber-400/5 border border-amber-400/15 p-2.5 rounded-xl leading-snug">
                    <MapPin
                      size={15}
                      className="text-amber-400 flex-shrink-0 mt-0.5"
                    />
                    <span>
                      <strong>Loja física em Araçatuba-SP:</strong> Rua Princesa
                      Isabel, 221 - Centro. Retirada gratuita, montagem ágil e
                      ajuste facial cortesia com ópticos consultores.
                    </span>
                  </div>

                  {/* Botões de Ação */}
                  <div className="cart-buttons flex flex-col gap-2 pt-1">
                    <Button
                      variant="dark"
                      isLoading={isSubmitting}
                      onClick={handleCheckout}
                      className="w-full justify-center !bg-emerald-600 hover:!bg-emerald-500 border-none !text-white font-bold text-xs tracking-wider uppercase py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-950/40 active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <MessageCircle size={18} className="text-white" />
                      <span>CONSULTAR SELEÇÃO NO WHATSAPP</span>
                      <ArrowRight size={16} className="text-white" />
                    </Button>

                    <div className="flex items-center justify-between text-xs pt-1 px-1">
                      <button
                        type="button"
                        onClick={onClearCart}
                        className="text-[11px] text-slate-400 hover:text-red-400 transition-colors py-1"
                      >
                        Limpar toda a seleção
                      </button>

                      <button
                        type="button"
                        onClick={onClose}
                        className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors py-1"
                      >
                        Continuar explorando
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
