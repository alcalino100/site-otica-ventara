"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, ShoppingBag, Trash2, MessageCircle } from "lucide-react";
import { Product } from "../catalog/product-card";
import { Button } from "../ui/button";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  cartIds: number[];
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onConsult: (msg: string) => void;
}

export function CartModal({
  isOpen,
  onClose,
  products,
  cartIds,
  onRemoveItem,
  onClearCart,
  onConsult,
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

  const selectedProducts = products.filter((p) => cartIds.includes(p.id));

  const handleCheckout = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConsult("Iniciando atendimento personalizado com a equipe Ventara...");
      onClose();
    }, 600);
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
                <h2>Sua seleção ({cartIds.length})</h2>
              </div>

              {selectedProducts.length === 0 ? (
                <div className="cart-empty py-10 text-center">
                  <div className="cart-empty-icon mb-4 mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <ShoppingBag size={28} />
                  </div>
                  <p className="text-slate-600 mb-2 font-medium">Sua seleção está vazia no momento.</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
                    Navegue pelo nosso catálogo e clique no ícone da sacola para separar as armações que mais combinam com você.
                  </p>
                  <Button variant="dark" onClick={onClose}>
                    EXPLORAR ARMAÇÕES
                  </Button>
                </div>
              ) : (
                <>
                  <ul className="cart-list max-h-[340px] overflow-y-auto pr-1">
                    {selectedProducts.map((p) => {
                      const count = cartIds.filter((id) => id === p.id).length;
                      return (
                        <li key={p.id} className="cart-item">
                          <div className="cart-item-details">
                            <span className="cart-item-name">{p.name}</span>
                            <small className="cart-item-meta">
                              {p.category} · {p.color} · {count} unidade(s)
                            </small>
                          </div>
                          <button
                            type="button"
                            className="cart-item-remove"
                            aria-label={`Remover ${p.name}`}
                            onClick={() => onRemoveItem(p.id)}
                            title="Remover item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="cart-summary border-t border-slate-200/80 pt-4 mt-4">
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      💡 <strong>Atendimento Humanizado:</strong> Envie sua seleção diretamente para os nossos ópticos
                      consultores no WhatsApp para checar disponibilidade de lentes e medidas faciais.
                    </p>

                    <div className="cart-buttons flex flex-col gap-2">
                      <Button
                        variant="dark"
                        isLoading={isSubmitting}
                        onClick={handleCheckout}
                        className="w-full justify-center !bg-emerald-800 hover:!bg-emerald-900 border-none text-white"
                      >
                        <MessageCircle size={17} /> CONSULTAR VIA WHATSAPP <ArrowRight size={16} />
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
