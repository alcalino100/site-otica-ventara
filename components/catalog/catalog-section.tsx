"use client";

import React, { useState, useTransition } from "react";
import { SlidersHorizontal, Search, RotateCcw } from "lucide-react";
import { Product } from "@/types/ecommerce";
import { ProductCard } from "./product-card";
import { ProductGridSkeleton } from "./product-grid-skeleton";
import { Button } from "../ui/button";

interface CatalogSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  cartIds: string[];
  isSearchOpen: boolean;
}

export function CatalogSection({
  products,
  onSelectProduct,
  onAddToCart,
  cartIds,
  isSearchOpen,
}: CatalogSectionProps) {
  const [filter, setFilter] = useState<string>("Todos");
  const [query, setQuery] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (newFilter: string) => {
    startTransition(() => {
      setFilter(newFilter);
    });
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      filter === "Todos" ||
      p.frame_type === filter ||
      p.category?.name === filter ||
      p.category?.slug === filter.toLowerCase();

    const matchesSearch =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.slug.toLowerCase().includes(query.toLowerCase()) ||
      (p.frame_shape && p.frame_shape.toLowerCase().includes(query.toLowerCase())) ||
      (p.frame_material && p.frame_material.toLowerCase().includes(query.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="collection light-section" id="armacoes">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CURADORIA DE ARMAÇÕES</p>
          <h2>
            Um estilo para cada <span>olhar.</span>
          </h2>
        </div>
        <span className="demo-label">ARMAÇÕES & ÓCULOS SOLARES</span>
      </div>

      <div className="filters">
        <div role="group" aria-label="Filtrar por tipo de armação">
          {["Todos", "Grau", "Solar"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleFilterChange(cat)}
              className={`filter-pill ${filter === cat ? "active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="filter-count">
          <SlidersHorizontal size={15} />
          {filteredProducts.length} modelo(s) disponível(is)
        </span>
      </div>

      {isSearchOpen && (
        <div className="search-box-wrapper mb-6 animate-fade-in">
          <label className="search-box">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
              Buscar armação por nome, material ou formato
            </span>
            <div className="relative max-w-md">
              <input
                autoFocus
                placeholder="Ex: Ventara Essencial, Acetato, Titânio, Redondo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pr-10"
              />
              <Search size={17} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </label>
        </div>
      )}

      {isPending ? (
        <ProductGridSkeleton />
      ) : filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              isInCart={cartIds.includes(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state py-16 text-center">
          <p className="text-slate-600 text-base mb-2 font-medium">Nenhum modelo encontrado com os filtros atuais.</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
            Tente buscar com outros termos ou redefina os filtros de categoria.
          </p>
          <Button
            variant="dark"
            onClick={() => {
              setQuery("");
              setFilter("Todos");
            }}
            className="inline-flex items-center gap-2"
          >
            <RotateCcw size={15} /> LIMPAR FILTROS
          </Button>
        </div>
      )}
    </section>
  );
}
