"use client";

import React, { useState, useTransition, useEffect, useMemo, useRef } from "react";
import {
  SlidersHorizontal,
  Search,
  Sparkles,
  X,
  ArrowUpDown,
  Glasses,
  Gem,
  Tag,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  // Filtros de Estado
  const [filter, setFilter] = useState<string>("Todos");
  const [selectedShape, setSelectedShape] = useState<string>("Todos");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("Todos");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [query, setQuery] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    const itemWidth = el.scrollWidth / (filteredProducts.length || 1);
    const index = Math.round(el.scrollLeft / itemWidth);
    setActiveIndex(Math.min(Math.max(0, index), filteredProducts.length - 1));
  };

  const scrollPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  // Listen for hash changes like #solar or #armacoes ou #grau ou #infantil
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined") {
        if (window.location.hash === "#solar") {
          setFilter("Solar");
        } else if (window.location.hash === "#grau") {
          setFilter("Grau");
        } else if (window.location.hash === "#infantil") {
          setFilter("Infantil");
        }
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Extração dinâmica de opções disponíveis no catálogo atual
  const availableShapes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.frame_shape) set.add(p.frame_shape);
    });
    return Array.from(set).sort();
  }, [products]);

  const availableMaterials = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.frame_material) set.add(p.frame_material);
    });
    return Array.from(set).sort();
  }, [products]);

  // Handlers com useTransition para animação fluida
  const handleFilterChange = (newFilter: string) => {
    startTransition(() => {
      setFilter(newFilter);
    });
  };

  const handleClearAllFilters = () => {
    startTransition(() => {
      setFilter("Todos");
      setSelectedShape("Todos");
      setSelectedMaterial("Todos");
      setSelectedPriceRange("all");
      setSortBy("featured");
      setQuery("");
    });
  };

  // Filtragem multi-critério dinâmica
  const filteredProducts = useMemo(() => {
    const result = products.filter((p) => {
      // 1. Categoria (Grau / Solar / Infantil / Todos)
      const matchesCategory =
        filter === "Todos" ||
        (filter === "Infantil"
          ? p.gender === "Infantil" || p.category?.slug === "infantil" || p.slug.includes("kids")
          : p.frame_type === filter ||
            p.category?.name === filter ||
            p.category?.slug === filter.toLowerCase());

      if (!matchesCategory) return false;

      // 2. Formato (Shape)
      if (selectedShape !== "Todos") {
        if (!p.frame_shape || p.frame_shape.toLowerCase() !== selectedShape.toLowerCase()) {
          return false;
        }
      }

      // 3. Material
      if (selectedMaterial !== "Todos") {
        if (!p.frame_material || p.frame_material.toLowerCase() !== selectedMaterial.toLowerCase()) {
          return false;
        }
      }

      // 4. Faixa de Preço
      if (selectedPriceRange !== "all") {
        const price = p.price_in_cents / 100;
        if (selectedPriceRange === "under_400" && price > 400) return false;
        if (selectedPriceRange === "400_to_450" && (price < 400 || price > 450)) return false;
        if (selectedPriceRange === "above_450" && price <= 450) return false;
      }

      // 5. Busca textual inteligente
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSlug = p.slug.toLowerCase().includes(q);
        const matchesShape = p.frame_shape ? p.frame_shape.toLowerCase().includes(q) : false;
        const matchesMaterial = p.frame_material ? p.frame_material.toLowerCase().includes(q) : false;
        const matchesType = p.frame_type ? p.frame_type.toLowerCase().includes(q) : false;
        const matchesCategoryName = p.category?.name ? p.category.name.toLowerCase().includes(q) : false;
        const matchesGender = p.gender ? p.gender.toLowerCase().includes(q) : false;
        const matchesDesc = p.description ? p.description.toLowerCase().includes(q) : false;
        const matchesVariant = p.variants?.some((v) => v.color_name?.toLowerCase().includes(q));
        if (
          !matchesName &&
          !matchesSlug &&
          !matchesShape &&
          !matchesMaterial &&
          !matchesType &&
          !matchesCategoryName &&
          !matchesGender &&
          !matchesDesc &&
          !matchesVariant
        ) {
          return false;
        }
      }

      return true;
    });

    // Ordenação
    if (sortBy === "price_asc") {
      result.sort((a, b) => a.price_in_cents - b.price_in_cents);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.price_in_cents - a.price_in_cents);
    } else if (sortBy === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // featured default
      result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return result;
  }, [products, filter, selectedShape, selectedMaterial, selectedPriceRange, query, sortBy]);

  // Contagem de filtros ativos
  const activeFiltersCount =
    (filter !== "Todos" ? 1 : 0) +
    (selectedShape !== "Todos" ? 1 : 0) +
    (selectedMaterial !== "Todos" ? 1 : 0) +
    (selectedPriceRange !== "all" ? 1 : 0) +
    (query.trim() !== "" ? 1 : 0);

  return (
    <section className="collection light-section py-16 sm:py-20 bg-slate-50 border-b border-slate-200 overflow-hidden" id="armacoes">
      <div id="solar" className="sr-only">Seção Óculos de Sol</div>
      <div id="grau" className="sr-only">Seção Armações de Grau</div>
      <div id="infantil" className="sr-only">Seção Óculos Infantis</div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        {/* Cabeçalho Editorial */}
        <div className="section-heading mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-xs font-semibold tracking-widest uppercase text-amber-600 mb-2 flex items-center gap-1.5">
              <Sparkles size={14} /> SELEÇÃO EDITORIAL VENTARA
            </p>
            <h2 className="text-3xl sm:text-5xl font-light text-slate-950 tracking-tight leading-tight">
              Escolhas que <span className="font-semibold text-amber-500">combinam com você.</span>
            </h2>
            <p className="section-description text-xs sm:text-sm text-slate-600 max-w-xl mt-3 leading-relaxed">
              Explore nossa curadoria com modelos selecionados da loja física e catálogo digital. Experimente o equilíbrio ideal entre leveza, precisão e design atemporal.
            </p>
          </div>
          <span className="demo-label text-[11px] font-semibold tracking-wider uppercase text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-full shadow-xs self-start md:self-auto">
            GRAU, SOLARES & LINHA INFANTIL
          </span>
        </div>

        {/* Barra de Filtros Integrada */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm mb-8 space-y-5">
          {/* Linha 1: Categorias Principais + Campo de Busca Rápida */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Abas Primárias com classes que os testes esperam (active) */}
            <div role="group" aria-label="Filtrar por tipo de armação" className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar sm:flex-wrap">
              {["Todos", "Grau", "Solar", "Infantil"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleFilterChange(cat)}
                  className={`filter-pill px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 border active:scale-95 shrink-0 ${
                    filter === cat
                      ? "bg-[#06111f] !text-amber-400 border-[#06111f] shadow-md active"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Campo de Busca Rápida */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar por modelo, cor ou acabamento..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pr-10 pl-10 py-2.5 rounded-full border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all"
              />
              <Search size={15} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-2.5 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                  title="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Linha 2: Dropdowns de Filtro Avançado (Formato, Material, Faixa de Preço, Ordenação) */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Filtro por Formato */}
              <div className="relative">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 transition-colors">
                  <Glasses size={14} className="text-slate-400" />
                  <select
                    value={selectedShape}
                    onChange={(e) => setSelectedShape(e.target.value)}
                    className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer pr-2"
                  >
                    <option value="Todos">Todos os formatos</option>
                    {availableShapes.map((shape) => (
                      <option key={shape} value={shape}>
                        {shape}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filtro por Material */}
              <div className="relative">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 transition-colors">
                  <Gem size={14} className="text-slate-400" />
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer pr-2"
                  >
                    <option value="Todos">Todos os materiais</option>
                    {availableMaterials.map((mat) => (
                      <option key={mat} value={mat}>
                        {mat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filtro por Faixa de Preço */}
              <div className="relative">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 transition-colors">
                  <Tag size={14} className="text-slate-400" />
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer pr-2"
                  >
                    <option value="all">Todas as faixas de preço</option>
                    <option value="under_400">Até R$ 400</option>
                    <option value="400_to_450">R$ 401 a R$ 450</option>
                    <option value="above_450">Acima de R$ 450</option>
                  </select>
                </div>
              </div>

              {/* Ordenação */}
              <div className="relative">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-slate-700 transition-colors">
                  <ArrowUpDown size={14} className="text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none cursor-pointer pr-2"
                  >
                    <option value="featured">Destaques da Ventara</option>
                    <option value="price_asc">Menor Preço</option>
                    <option value="price_desc">Maior Preço</option>
                    <option value="name_asc">Nome (A - Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contador de Resultados */}
            <span className="filter-count text-xs font-semibold text-slate-600 flex items-center gap-1.5 py-1 px-3 rounded-full bg-slate-100 border border-slate-200">
              <SlidersHorizontal size={13} className="text-amber-600" />
              {filteredProducts.length} modelo(s) encontrado(s)
            </span>
          </div>

          {/* Linha 3: Chips de Filtros Ativos (quando aplicados) */}
          {activeFiltersCount > 0 && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Filtros ativos:
              </span>

              {filter !== "Todos" && (
                <button
                  type="button"
                  onClick={() => setFilter("Todos")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium hover:bg-amber-100 transition-colors"
                >
                  <span>Tipo: {filter}</span>
                  <X size={12} />
                </button>
              )}

              {selectedShape !== "Todos" && (
                <button
                  type="button"
                  onClick={() => setSelectedShape("Todos")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium hover:bg-amber-100 transition-colors"
                >
                  <span>Formato: {selectedShape}</span>
                  <X size={12} />
                </button>
              )}

              {selectedMaterial !== "Todos" && (
                <button
                  type="button"
                  onClick={() => setSelectedMaterial("Todos")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium hover:bg-amber-100 transition-colors"
                >
                  <span>Material: {selectedMaterial}</span>
                  <X size={12} />
                </button>
              )}

              {selectedPriceRange !== "all" && (
                <button
                  type="button"
                  onClick={() => setSelectedPriceRange("all")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium hover:bg-amber-100 transition-colors"
                >
                  <span>
                    Preço:{" "}
                    {selectedPriceRange === "under_400"
                      ? "Até R$ 400"
                      : selectedPriceRange === "400_to_450"
                      ? "R$ 401 a R$ 450"
                      : "Acima de R$ 450"}
                  </span>
                  <X size={12} />
                </button>
              )}

              {query.trim() && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium hover:bg-amber-100 transition-colors"
                >
                  <span>Busca: &ldquo;{query}&rdquo;</span>
                  <X size={12} />
                </button>
              )}

              <button
                type="button"
                onClick={handleClearAllFilters}
                className="inline-flex items-center gap-1 ml-auto text-[11px] font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider transition-colors"
              >
                <RotateCcw size={12} />
                <span>Limpar todos os filtros</span>
              </button>
            </div>
          )}
        </div>

        {/* Grade de Produtos no Desktop / Carrossel Horizontal de 1 Nível de Altura no Mobile */}
        {isPending ? (
          <ProductGridSkeleton />
        ) : filteredProducts.length > 0 ? (
          <div className="relative">
            {/* Barra de Navegação do Carrossel Mobile - ACIMA dos Cards com espaçamento generoso */}
            <div className="flex sm:hidden items-center justify-between pb-3.5 px-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Deslize para ver os modelos</span>
                <span className="font-mono text-slate-400 font-semibold text-[11px]">
                  ({filteredProducts.length})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={scrollPrev}
                  aria-label="Armação anterior"
                  className="w-8 h-8 rounded-full border border-slate-300 bg-white shadow-xs flex items-center justify-center text-slate-700 active:scale-90 transition-transform"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  aria-label="Próxima armação"
                  className="w-8 h-8 rounded-full border border-slate-300 bg-white shadow-xs flex items-center justify-center text-slate-700 active:scale-90 transition-transform"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Carrossel no Mobile (1 nível de altura, margem lateral generosa UI/UX, sem sobreposição) / Grid no Desktop */}
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              role="region"
              aria-label="Carrossel de armações"
              tabIndex={0}
              className="flex sm:grid flex-row flex-nowrap sm:flex-none overflow-x-auto sm:overflow-visible overflow-y-hidden snap-x snap-mandatory sm:snap-none gap-6 sm:gap-6 py-2 pb-5 sm:pb-0 sm:grid-cols-2 lg:grid-cols-4 no-scrollbar -mx-4 px-6 sm:mx-0 sm:px-0 scroll-px-6"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="snap-center shrink-0 w-[74vw] max-w-[285px] sm:w-auto sm:max-w-none flex flex-col"
                >
                  <ProductCard
                    product={product}
                    onSelect={onSelectProduct}
                    onAddToCart={onAddToCart}
                    isInCart={cartIds.includes(product.id)}
                  />
                </div>
              ))}
            </div>

            {/* Indicadores de Paginação do Carrossel no Mobile com espaçamento respirável */}
            {filteredProducts.length > 1 && (
              <div className="flex sm:hidden items-center justify-center gap-2 pt-4">
                {filteredProducts.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (carouselRef.current) {
                        const targetCard = carouselRef.current.children[idx] as HTMLElement;
                        if (targetCard) {
                          targetCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                        }
                      }
                    }}
                    aria-label={`Ver modelo ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeIndex === idx
                        ? "w-6 bg-amber-500"
                        : "w-1.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="empty-catalog text-center py-16 bg-white rounded-3xl border border-slate-200 max-w-md mx-auto p-8 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Glasses size={24} />
            </div>
            <p className="text-base font-semibold text-slate-800">
              Nenhum modelo corresponde aos filtros
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Experimente ajustar o formato, material ou faixa de preço para visualizar outras armações disponíveis.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#06111f] hover:bg-[#0756b8] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm"
              >
                <RotateCcw size={13} className="text-amber-400" />
                <span>Restaurar todos os modelos</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
