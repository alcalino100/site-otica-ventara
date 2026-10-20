"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import { Product } from "@/types/ecommerce";
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
                  solar={product.frame_type === "Solar"}
                  amber={product.slug.includes("aurora") || Boolean(product.variants?.[0]?.color_name?.toLowerCase().includes("âmbar"))}
                  round={product.frame_shape === "Redondo"}
                />
              </div>

              <div className="modal-content-body">
                <div className="flex items-center gap-2 mb-2">
                  <span className="eyebrow !mb-0">CATÁLOGO OFICIAL</span>
                  <span className="badge-exclusive">
                    <Sparkles size={11} className="inline mr-1 text-amber-500" />
                    Ótica Ventara
                  </span>
                </div>

                <h2>{product.name}</h2>
                <p className="product-spec">
                  <strong>Linha:</strong> {product.frame_type === "Solar" ? "Solar Proteção UV400" : "Grau Premium Acetato"} ·{" "}
                  <strong>Acabamento:</strong> {product.variants?.[0]?.color_name || product.frame_material || "Acetato Italiano"}
                </p>

                <p className="modal-description">
                  {product.description ||
                    "Design autoral desenhado com proporções harmônicas para ergonomia perfeita e leveza no uso prolongado. Lentes com tratamento de alta definição e proteção contra fadiga visual."}
                </p>

                <div className="modal-perks">
                  <div className="perk-item">
                    <ShieldCheck size={16} className="text-amber-600" />
                    <span>Ajuste e consultoria personalizada no espaço físico em Araçatuba</span>
                  </div>
                </div>

                <div className="modal-actions pt-4 flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="dark"
                    onClick={() => {
                      onAddToCart(product);
                      onClose();
                    }}
                    className="flex-1 justify-center"
                  >
                    ADICIONAR À SELEÇÃO <Plus size={17} />
                  </Button>
                  <Link
                    href={`/produto/${product.slug}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Ver detalhes completos <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
