"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ShoppingBag, Trash2, MessageCircle } from "lucide-react";
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="cart-modal-root">
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
              aria-label="Sua seleção de armações"
              className="dialog cart-dialog-custom"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="close close-btn-accessible"
                aria-label="Fechar seleção"
                onClick={onClose}
              >
                <X size={20} />
              </button>

              <div className="cart-header">
                <p className="eyebrow !mb-1">SEUS FAVORITOS</p>
                <h2>Sua seleção ({cartItems.length})</h2>
              </div>

              {cartItems.length === 0 ? (
                <div className="cart-empty py-10 text-center">
                  <div className="cart-empty-icon mb-4 mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <ShoppingBag size={28} />
                  </div>
                  <p className="text-slate-700 mb-2 font-medium">Sua seleção está vazia no momento.</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
                    Navegue pelo nosso catálogo e adicione suas armações favoritas para consultar opções de lentes personalizadas.
                  </p>
                  <Button variant="dark" onClick={onClose}>
                    EXPLORAR ARMAÇÕES
                  </Button>
                </div>
              ) : (
                <>
                  <ul className="cart-list max-h-[340px] overflow-y-auto pr-1">
                    {cartItems.map((item, index) => (
                      <li key={`${item.id}-${index}`} className="cart-item">
                        <div className="cart-item-details">
                          <span className="cart-item-name">{item.name}</span>
                          <small className="cart-item-meta">
                            {item.category} · {item.color}
                          </small>
                          {item.priceInCents && (
                            <span className="text-xs font-semibold text-slate-900 block mt-1">
                              {(item.priceInCents / 100).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="cart-item-remove"
                          aria-label={`Remover ${item.name}`}
                          onClick={() => onRemoveItem(item.id)}
                          title="Remover item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="cart-summary border-t border-slate-200/80 pt-4 mt-4">
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                      💡 <strong>Atendimento Humanizado:</strong> Envie sua seleção diretamente para os nossos ópticos
                      consultores no WhatsApp para checar disponibilidade de lentes e medidas faciais.
                    </p>

                    <div className="cart-buttons flex flex-col gap-2">
                      <Button
                        variant="dark"
                        isLoading={isSubmitting}
                        onClick={handleCheckout}
                        className="w-full justify-center !bg-emerald-800 hover:!bg-emerald-900 border-none text-white font-semibold text-xs tracking-wider"
                      >
                        <MessageCircle size={17} /> CONSULTAR SELEÇÃO NO WHATSAPP <ArrowRight size={16} />
                      </Button>

                      <button
                        type="button"
                        onClick={onClearCart}
                        className="text-xs text-slate-400 hover:text-red-500 py-1 transition-colors text-center"
                      >
                        Limpar toda a seleção
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
