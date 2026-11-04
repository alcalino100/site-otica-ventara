"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  ShoppingBag,
  Check,
  CheckCircle2,
  Glasses,
  Sun,
  ShieldCheck,
  Tag,
  ArrowRight,
  Filter,
  RotateCcw,
  ChevronDown,
  Layers,
  Award,
} from "lucide-react";
import { Product } from "@/types/ecommerce";
import { ProductCard } from "@/components/catalog/product-card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartModal } from "@/components/cart/cart-modal";
import { getStoredCart, saveStoredCart, CartProduct } from "@/lib/cart";
import { Toast } from "@/components/ui/toast";

interface ArmacoesViewProps {
  initialProducts: Product[];
}

export type CategoryFilterKey =
  | "all"
  | "grau-feminino"
  | "grau-masculino"
  | "solar"
  | "infantil"
  | "destaques";

export function ArmacoesView({ initialProducts }: ArmacoesViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Estado da URL
  const initialCategoryParam = searchParams.get("categoria") || "all";
  const initialSearchParam = searchParams.get("busca") || "";

  // 2. Estados de Filtros
  const [activeCategory, setActiveCategory] = useState<CategoryFilterKey>(() => {
    if (initialCategoryParam === "solar") return "solar";
    if (initialCategoryParam === "grau") return "grau-feminino";
    if (initialCategoryParam === "grau-feminino") return "grau-feminino";
    if (initialCategoryParam === "grau-masculino") return "grau-masculino";
    if (initialCategoryParam === "infantil") return "infantil";
    if (initialCategoryParam === "destaques") return "destaques";
    return "all";
  });

  const [searchQuery, setSearchQuery] = useState(initialSearchParam);
  const [selectedShape, setSelectedShape] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<
    "featured" | "price-asc" | "price-desc" | "discount" | "name-asc"
  >("featured");

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // 3. Estados de Carrinho & Sacola
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setCartItems(getStoredCart());
  }, []);

  const cartIds = useMemo(() => cartItems.map((i) => i.id), [cartItems]);

  const handleAddToCart = (product: Product) => {
    const isAlreadyIn = cartItems.some((i) => i.id === product.id);

    let updated: CartProduct[];
    if (isAlreadyIn) {
      updated = cartItems.filter((i) => i.id !== product.id);
      setToastMessage(`Armação "${product.name}" removida da sua sacola.`);
    } else {
      const primaryImage =
        product.images?.find((img) => img.is_primary)?.url || product.images?.[0]?.url;
      const firstVariant = product.variants?.[0]?.color_name || "Padrão";

      const newItem: CartProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category?.name || "Armação",
        color: firstVariant,
        priceInCents: product.price_in_cents,
        imageUrl: primaryImage,
      };

      updated = [...cartItems, newItem];
      setToastMessage(`Armação "${product.name}" adicionada à sua sacola!`);
    }

    saveStoredCart(updated);
    setCartItems(updated);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveFromCart = (id: string) => {
    const updated = cartItems.filter((i) => i.id !== id);
    saveStoredCart(updated);
    setCartItems(updated);
  };

  const handleClearCart = () => {
    saveStoredCart([]);
    setCartItems([]);
  };

  // 4. Extrato dinâmico de atributos para filtros
  const shapes = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.frame_shape) set.add(p.frame_shape);
    });
    return Array.from(set).sort();
  }, [initialProducts]);

  const materials = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.frame_material) set.add(p.frame_material);
    });
    return Array.from(set).sort();
  }, [initialProducts]);

  const colors = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      p.variants?.forEach((v) => {
        if (v.color_name) set.add(v.color_name);
      });
    });
    return Array.from(set).sort();
  }, [initialProducts]);

  // Contadores por Categoria
  const categoryCounts = useMemo(() => {
    return {
      all: initialProducts.length,
      "grau-feminino": initialProducts.filter(
        (p) => p.frame_type === "Grau" && (p.gender === "Feminino" || p.gender === "Unissex")
      ).length,
      "grau-masculino": initialProducts.filter(
        (p) => p.frame_type === "Grau" && (p.gender === "Masculino" || p.gender === "Unissex")
      ).length,
      solar: initialProducts.filter((p) => p.frame_type === "Solar").length,
      infantil: initialProducts.filter((p) => p.gender === "Infantil").length,
      destaques: initialProducts.filter(
        (p) =>
          Boolean(p.is_featured) ||
          (p.compare_at_price_in_cents && p.compare_at_price_in_cents > p.price_in_cents)
      ).length,
    };
  }, [initialProducts]);

  // 5. Filtragem e Ordenação
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // A. Categoria Principal
        if (activeCategory === "grau-feminino") {
          const isGrau = product.frame_type === "Grau";
          const isFem = product.gender === "Feminino" || product.gender === "Unissex";
          if (!isGrau || !isFem) return false;
        } else if (activeCategory === "grau-masculino") {
          const isGrau = product.frame_type === "Grau";
          const isMasc = product.gender === "Masculino" || product.gender === "Unissex";
          if (!isGrau || !isMasc) return false;
        } else if (activeCategory === "solar") {
          if (product.frame_type !== "Solar") return false;
        } else if (activeCategory === "infantil") {
          if (product.gender !== "Infantil") return false;
        } else if (activeCategory === "destaques") {
          const isPromo =
            product.compare_at_price_in_cents &&
            product.compare_at_price_in_cents > product.price_in_cents;
          if (!product.is_featured && !isPromo) return false;
        }

        // B. Busca textual
        if (searchQuery.trim()) {
          const queryLower = searchQuery.toLowerCase();
          const nameMatch = product.name.toLowerCase().includes(queryLower);
          const descMatch = product.description?.toLowerCase().includes(queryLower);
          const shapeMatch = product.frame_shape?.toLowerCase().includes(queryLower);
          const colorMatch = product.variants?.some((v) =>
            v.color_name.toLowerCase().includes(queryLower)
          );
          if (!nameMatch && !descMatch && !shapeMatch && !colorMatch) return false;
        }

        // C. Formato do Aro
        if (selectedShape !== "all" && product.frame_shape !== selectedShape) {
          return false;
        }

        // D. Material
        if (selectedMaterial !== "all" && product.frame_material !== selectedMaterial) {
          return false;
        }

        // E. Cor da variante
        if (selectedColor !== "all") {
          const hasColor = product.variants?.some((v) =>
            v.color_name.toLowerCase().includes(selectedColor.toLowerCase())
          );
          if (!hasColor) return false;
        }

        // F. Faixa de Preço
        const priceInReais = product.price_in_cents / 100;
        if (selectedPriceRange === "under-350" && priceInReais >= 350) return false;
        if (
          selectedPriceRange === "350-450" &&
          (priceInReais < 350 || priceInReais > 450)
        )
          return false;
        if (selectedPriceRange === "above-450" && priceInReais <= 450) return false;

        // G. Apenas em estoque
        if (onlyInStock) {
          const totalStock =
            product.variants?.reduce((acc, v) => acc + (v.stock_quantity || 0), 0) ?? 0;
          if (totalStock <= 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price_in_cents - b.price_in_cents;
        if (sortBy === "price-desc") return b.price_in_cents - a.price_in_cents;
        if (sortBy === "discount") {
          const discA = a.compare_at_price_in_cents
            ? a.compare_at_price_in_cents - a.price_in_cents
            : 0;
          const discB = b.compare_at_price_in_cents
            ? b.compare_at_price_in_cents - b.price_in_cents
            : 0;
          return discB - discA;
        }
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        return 0; // featured
      });
  }, [
    initialProducts,
    activeCategory,
    searchQuery,
    selectedShape,
    selectedMaterial,
    selectedColor,
    selectedPriceRange,
    onlyInStock,
    sortBy,
  ]);

  const resetFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
    setSelectedShape("all");
    setSelectedMaterial("all");
    setSelectedColor("all");
    setSelectedPriceRange("all");
    setOnlyInStock(false);
    setSortBy("featured");
  };

  const activeFiltersCount =
    (activeCategory !== "all" ? 1 : 0) +
    (selectedShape !== "all" ? 1 : 0) +
    (selectedMaterial !== "all" ? 1 : 0) +
    (selectedColor !== "all" ? 1 : 0) +
    (selectedPriceRange !== "all" ? 1 : 0) +
    (onlyInStock ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#040914] text-white selection:bg-amber-400 selection:text-slate-950 font-sans">
      <Header
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        theme="dark"
      />

      <main className="flex-1 pt-24 pb-20">
        {/* HERO SECTION DE LUXO */}
        <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-12 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-[#06111f] via-[#040a14] to-[#040914]">
          {/* Brilho de iluminação radial */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-amber-400/10 blur-[130px] pointer-events-none rounded-full" />

          <div className="max-w-[1400px] mx-auto space-y-4 relative z-10">
            {/* Breadcrumb Editorial */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Início
              </Link>
              <span>/</span>
              <span className="text-amber-400 font-semibold">Catálogo de Armações</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="max-w-3xl space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={14} /> CURADORIA AUTORAL VENTARA EYEWEAR
                </span>
                <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight leading-tight">
                  Catálogo de <span className="font-semibold text-white">Armações &amp; Óculos</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                  Armações usinadas em acetato polido à mão e ligas nobres de titânio. Desenvolvidas para encaixe anatômico perfeito, leveza e alta precisão para as lentes digitais OPTiSYNC HD do nosso laboratório.
                </p>
              </div>

              {/* Badges de Vantagens E-commerce */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 shrink-0 text-xs">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
                  <span className="text-slate-300 font-medium">10x Sem Juros</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span className="text-slate-300 font-medium">Laboratório Próprio</span>
                </div>
                <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
                  <Award size={16} className="text-amber-400 shrink-0" />
                  <span className="text-slate-300 font-medium">Envio Seguro</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BARRA DE CATEGORIAS E-COMMERCE (PILL TABS) */}
        <section className="px-4 sm:px-6 lg:px-8 py-6 border-b border-white/10 sticky top-16 z-30 bg-[#040914]/95 backdrop-blur-md">
          <div className="max-w-[1400px] mx-auto flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: "all", label: "Todas as Armações", count: categoryCounts.all, icon: Layers },
              { id: "grau-feminino", label: "Grau Feminino", count: categoryCounts["grau-feminino"], icon: Glasses },
              { id: "grau-masculino", label: "Grau Masculino", count: categoryCounts["grau-masculino"], icon: Glasses },
              { id: "solar", label: "Óculos de Sol", count: categoryCounts.solar, icon: Sun },
              { id: "infantil", label: "Infantil / Kids", count: categoryCounts.infantil, icon: Sparkles },
              { id: "destaques", label: "Destaques & Ofertas", count: categoryCounts.destaques, icon: Tag },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as CategoryFilterKey)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-400/20 scale-102"
                      : "bg-[#06111f] text-slate-300 hover:text-white hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <Icon size={14} className={isActive ? "text-slate-950" : "text-amber-400"} />
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                      isActive
                        ? "bg-slate-950/20 text-slate-950"
                        : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* CONTAINER DO CATÁLOGO: CONTROLES & FILTROS */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px] mx-auto space-y-6">
          {/* BARRA DE CONTROLE: BUSCA, FILTRO DRAWER & ORDENAÇÃO */}
          <div className="bg-[#06111f] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Campo de Busca Rápida */}
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por modelo, cor, aro (ex: Safari, Gatinho, Onça, Preto)..."
                className="w-full bg-[#040a14] border border-white/10 rounded-xl pl-11 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Ações: Botão Filtros + Ordenação */}
            <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
              {/* Botão de Toggle de Filtros */}
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  activeFiltersCount > 0
                    ? "bg-amber-400/20 border-amber-400/40 text-amber-300"
                    : "bg-[#040a14] border-white/10 text-white hover:bg-white/5"
                }`}
              >
                <SlidersHorizontal size={14} className="text-amber-400" />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Dropdown de Ordenação */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="bg-[#040a14] border border-white/10 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="featured">Destaques Ventara</option>
                  <option value="discount">Maior Desconto (%)</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="name-asc">Nome (A - Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* PAINEL EXPANSÍVEL DE FILTROS AVANÇADOS */}
          {isFilterDrawerOpen && (
            <div className="bg-[#06111f] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Filtros Avançados de Catálogo
                  </h3>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <RotateCcw size={13} />
                    <span>Limpar todos os filtros</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* 1. Formato do Aro */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                    Formato do Aro
                  </label>
                  <select
                    value={selectedShape}
                    onChange={(e) => setSelectedShape(e.target.value)}
                    className="w-full bg-[#040a14] border border-white/10 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">Todos os Formatos</option>
                    {shapes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Material */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                    Material
                  </label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full bg-[#040a14] border border-white/10 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">Todos os Materiais</option>
                    {materials.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Cor Predominante */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                    Cor Predominante
                  </label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full bg-[#040a14] border border-white/10 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">Todas as Cores</option>
                    {colors.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Faixa de Preço */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
                    Faixa de Preço
                  </label>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="w-full bg-[#040a14] border border-white/10 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">Qualquer Preço</option>
                    <option value="under-350">Até R$ 350</option>
                    <option value="350-450">R$ 350 a R$ 450</option>
                    <option value="above-450">Acima de R$ 450</option>
                  </select>
                </div>
              </div>

              {/* Linha Inferior: Estoque Checkbox */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                  <span className="text-xs">Exibir apenas modelos disponíveis em estoque imediato</span>
                </label>
              </div>
            </div>
          )}

          {/* STATUS DE RESULTADOS & TAGS ATIVAS */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <span>
                Mostrando <strong className="text-white">{filteredProducts.length}</strong> de{" "}
                {initialProducts.length} armações
              </span>
              {activeCategory !== "all" && (
                <span className="text-amber-400 font-medium">
                  em{" "}
                  {activeCategory === "grau-feminino"
                    ? "Grau Feminino"
                    : activeCategory === "grau-masculino"
                    ? "Grau Masculino"
                    : activeCategory === "solar"
                    ? "Óculos de Sol"
                    : activeCategory === "infantil"
                    ? "Infantil / Kids"
                    : "Destaques"}
                </span>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <X size={14} />
                <span>Limpar todos os filtros</span>
              </button>
            )}
          </div>

          {/* GRID RESPONSIVO EDITORIAL (REAPROVEITANDO PRODUCTCARD) */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#06111f] rounded-3xl border border-white/10 space-y-4">
              <Glasses size={40} className="mx-auto text-slate-600" />
              <h3 className="text-base font-semibold text-white">
                Nenhuma armação encontrada com os filtros selecionados
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tente desmarcar alguns filtros ou buscar por outros modelos e formatos.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Ver Todas as Armações
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  hrefPrefix="/armacoes"
                  onSelect={(p) => router.push(`/armacoes/${p.slug || p.id}`)}
                  onAddToCart={handleAddToCart}
                  isInCart={cartIds.includes(product.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODAL OFICIAL DO CARRINHO */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      {/* NOTIFICAÇÃO TOAST */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      <Footer />
    </div>
  );
}
