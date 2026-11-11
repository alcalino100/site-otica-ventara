"use client";

import React from "react";
import { Product } from "@/types/ecommerce";
import { ProductCard } from "@/components/catalog/product-card";

export interface ArmacaoCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  isInCart?: boolean;
  hrefPrefix?: string;
}

export function ArmacaoCard({
  product,
  onAddToCart,
  isInCart = false,
  hrefPrefix = "/armacoes",
}: ArmacaoCardProps) {
  return (
    <ProductCard
      product={product}
      onAddToCart={onAddToCart}
      isInCart={isInCart}
      hrefPrefix={hrefPrefix}
    />
  );
}
