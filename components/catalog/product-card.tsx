"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ShoppingBag, Check, ArrowRight } from "lucide-react";
import { Product } from "@/types/ecommerce";
import { FrameArt } from "./frame-art";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isInCart?: boolean;
}

export function ProductCard({
  product,
  onSelect,
  onAddToCart,
  isInCart = false,
}: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const primaryImage = product.images?.find((img) => img.is_primary)?.url || product.images?.[0]?.url;
  const priceFormatted = (product.price_in_cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <article className="product group flex flex-col justify-between">
      <Link
        href={`/produto/${product.slug}`}
        className="product-image block"
        aria-label={`Ver detalhes da armação ${product.name}`}
      >
        <span className="tag">
          {product.frame_type === "Solar" ? "ÓCULOS DE SOL" : "ÓCULOS DE GRAU"}
        </span>

        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-44 object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <FrameArt
            solar={product.frame_type === "Solar"}
            amber={product.slug.includes("aurora")}
            round={product.frame_shape === "Redondo"}
          />
        )}

        <span className="image-action" title="Abrir página do produto">
          <ArrowRight size={16} />
        </span>
      </Link>

      <div className="product-info flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/produto/${product.slug}`} className="hover:text-amber-700 transition-colors">
            <h3 className="line-clamp-1">{product.name}</h3>
          </Link>
          <span className="text-xs text-slate-500">
            {product.frame_material || "Acetato Premium"} · {product.frame_shape || "Clássico"}
          </span>
        </div>

        <div className="pt-3 flex items-center justify-between border-t border-slate-100 mt-3">
          <div>
            <p className="text-sm font-bold text-slate-900">{priceFormatted}</p>
            <span className="text-[10px] text-slate-400">à vista ou parcelado</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className={`add-cart-btn ${justAdded ? "btn-success" : ""} ${
                isInCart ? "in-cart" : ""
              }`}
              aria-label={`Adicionar ${product.name} à seleção`}
              onClick={handleAdd}
              title="Adicionar à seleção"
            >
              {justAdded ? (
                <Check size={16} className="text-emerald-600 animate-scale-in stroke-[2.5]" />
              ) : (
                <ShoppingBag size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
