"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { Product } from "./product-card";
import { FrameArt } from "./frame-art";
import { Button } from "../ui/button";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (product) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <div className="modal-root">
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={`Detalhes de ${product.name}`}
              className="dialog modal-dialog-custom"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="close close-btn-accessible"
                aria-label="Fechar detalhes"
                onClick={onClose}
              >
                <X size={20} />
              </button>

              <div className="modal-art-container">
                <FrameArt
                  solar={product.category === "Solar"}
                  amber={product.id === 2}
                  round={product.shape === "round"}
                />
              </div>

              <div className="modal-content-body">
                <div className="flex items-center gap-2 mb-2">
                  <span className="eyebrow !mb-0">MODELO CONCEITUAL</span>
                  <span className="badge-exclusive">
                    <Sparkles size={11} className="inline mr-1 text-amber-500" />
                    Exclusivo Ventara
                  </span>
                </div>

                <h2>{product.name}</h2>
                <p className="product-spec">
                  <strong>Linha:</strong> {product.category === "Solar" ? "Solar Proteção UV400" : "Grau Premium Acetato"} ·{" "}
                  <strong>Acabamento:</strong> {product.color}
                </p>

                <p className="modal-description">
                  Design autoral desenhado com proporções harmônicas para ergonomia perfeita e leveza no uso prolongado.
                  Lentes com tratamento antirreflexo e proteção contra fadiga visual.
                </p>

                <div className="modal-perks">
                  <div className="perk-item">
                    <ShieldCheck size={16} className="text-amber-600" />
                    <span>Garantia de ajuste e adaptação no laboratório próprio</span>
                  </div>
                </div>

                <div className="modal-actions pt-4">
                  <Button
                    variant="dark"
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="w-full justify-center"
                  >
                    ADICIONAR À SELEÇÃO <Plus size={17} />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
