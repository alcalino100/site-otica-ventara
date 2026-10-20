"use client";

import React, { useState, useTransition, useEffect } from "react";
import { SlidersHorizontal, Search, Sparkles } from "lucide-react";
import { Product } from "@/types/ecommerce";
import { ProductCard } from "./product-card";
import { ProductGridSkeleton } from "./product-grid-skeleton";

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

  // Listen for hash changes like #solar or #armacoes
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined") {
        if (window.location.hash === "#solar") {
          setFilter("Solar");
        } else if (window.location.hash === "#grau") {
          setFilter("Grau");
        }
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

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
    <section className="collection light-section py-20 bg-slate-50 border-b border-slate-200" id="armacoes">
      <div id="solar" className="sr-only">Seção Óculos de Sol</div>

      <div className="section-heading mb-10">
        <div>
          <p className="eyebrow text-xs font-semibold tracking-widest uppercase text-amber-600 mb-2 flex items-center gap-1.5">
            <Sparkles size={14} /> SELEÇÃO EDITORIAL VENTARA
          </p>
          <h2 className="text-3xl sm:text-5xl font-light text-slate-950 tracking-tight">
            Escolhas que <span className="font-semibold text-amber-500">combinam com você.</span>
          </h2>
          <p className="section-description text-xs sm:text-sm text-slate-600 max-w-xl mt-3 leading-relaxed">
            Uma curadoria com modelos selecionados da nossa loja física e catálogo digital. Experimente o equilíbrio ideal entre leveza, precisão e design atemporal.
          </p>
        </div>
        <span className="demo-label text-[11px] font-semibold tracking-wider uppercase text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-xs">
          ARMAÇÕES DE GRAU & SOLARES
        </span>
      </div>

      {/* Filters and Count */}
      <div className="filters flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div role="group" aria-label="Filtrar por tipo de armação" className="flex items-center gap-2">
          {["Todos", "Grau", "Solar"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleFilterChange(cat)}
              className={`filter-pill px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 border ${
                filter === cat
                  ? "bg-[#06111f] text-amber-400 border-[#06111f] shadow-sm active"
                  : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="filter-count text-xs text-slate-500 flex items-center gap-1.5">
          <SlidersHorizontal size={15} />
          {filteredProducts.length} modelo(s) em exibição
        </span>
      </div>

      {isSearchOpen && (
        <div className="search-box-wrapper mb-8 animate-fade-in">
          <label className="search-box block bg-white p-4 rounded-2xl border border-slate-200 shadow-sm max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2 block">
              Buscar armação por nome, material ou formato
            </span>
            <div className="relative">
              <input
                autoFocus
                placeholder="Ex: Ventara Essencial, Acetato, Titânio, Redondo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pr-10 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
              <Search size={18} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
            </div>
          </label>
        </div>
      )}

      {isPending ? (
        <ProductGridSkeleton />
      ) : filteredProducts.length > 0 ? (
        <div className="product-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="empty-catalog text-center py-16 bg-white rounded-3xl border border-slate-200 max-w-md mx-auto p-8">
          <p className="text-base font-semibold text-slate-800 mb-1">Nenhum modelo encontrado</p>
          <p className="text-xs text-slate-500 mb-4">Tente selecionar outra categoria ou limpar a busca textual.</p>
          <button
            type="button"
            onClick={() => {
              setFilter("Todos");
              setQuery("");
            }}
            className="text-xs font-semibold uppercase tracking-wider text-amber-600 hover:text-amber-700 underline"
          >
            Ver todos os modelos
          </button>
        </div>
      )}
    </section>
  );
}
