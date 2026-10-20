"use client";

import React, { useState } from "react";
import { Plus, ShoppingBag, Check } from "lucide-react";
import { FrameArt } from "./frame-art";

export interface Product {
  id: number;
  name: string;
  category: "Grau" | "Solar";
  color: string;
  shape: "square" | "round";
}

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
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="product group">
      <button
        type="button"
        className="product-image"
        aria-label={`Ver detalhes de ${product.name}`}
        onClick={() => onSelect(product)}
      >
        <span className="tag">
          {product.category === "Grau" ? "ÓCULOS DE GRAU" : "ÓCULOS DE SOL"}
        </span>
        <FrameArt
          solar={product.category === "Solar"}
          amber={product.id === 2}
          round={product.shape === "round"}
        />
        <span className="image-action" title="Ver detalhes">
          <Plus size={18} />
        </span>
      </button>

      <div className="product-info">
        <h3>{product.name}</h3>
        <span>{product.color}</span>
        <div>
          <p>Consulte disponibilidade</p>
          <button
            type="button"
            className={`add-cart-btn ${justAdded ? "btn-success" : ""} ${
              isInCart ? "in-cart" : ""
            }`}
            aria-label={`Adicionar ${product.name} à seleção`}
            onClick={handleAdd}
          >
            {justAdded ? (
              <Check size={16} className="text-emerald-600 animate-scale-in" />
            ) : (
              <ShoppingBag size={17} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
