"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  ShoppingBag,
  Check,
  Glasses,
  Tag,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Product } from "@/types/ecommerce";
import { FrameArt } from "@/components/catalog/frame-art";
import { getStoredCart, saveStoredCart, CartProduct } from "@/lib/cart";
import { Toast } from "@/components/ui/toast";

interface ArmacoesViewProps {
  initialProducts: Product[];
}

export function ArmacoesView({ initialProducts }: ArmacoesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedShape, setSelectedShape] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "discount">("featured");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cartIds, setCartIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    return getStoredCart().map((i) => i.id);
  });

  // Extrair filtros dinâmicos a partir do catálogo
  const shapes = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.frame_shape) set.add(p.frame_shape);
    });
    return Array.from(set);
  }, [initialProducts]);

  const colors = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      p.variants?.forEach((v) => {
        if (v.color_name) set.add(v.color_name);
      });
    });
    return Array.from(set);
  }, [initialProducts]);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const stored = getStoredCart();
    const isAlreadyIn = stored.some((i) => i.id === product.id);

    let updated: CartProduct[];
    if (isAlreadyIn) {
      updated = stored.filter((i) => i.id !== product.id);
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

      updated = [...stored, newItem];
      setToastMessage(`Armação "${product.name}" adicionada à sua sacola!`);
    }

    saveStoredCart(updated);
    setCartIds(updated.map((i) => i.id));
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtragem e Ordenação
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // 1. Busca textual
      if (searchQuery.trim()) {
        const queryLower = searchQuery.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(queryLower);
        const descMatch = product.description?.toLowerCase().includes(queryLower);
        const shapeMatch = product.frame_shape?.toLowerCase().includes(queryLower);
        if (!nameMatch && !descMatch && !shapeMatch) return false;
      }

      // 2. Formato
      if (selectedShape !== "all" && product.frame_shape !== selectedShape) {
        return false;
      }

      // 3. Cor da variante
      if (selectedColor !== "all") {
        const hasColor = product.variants?.some((v) =>
          v.color_name.toLowerCase().includes(selectedColor.toLowerCase())
        );
        if (!hasColor) return false;
      }

      // 4. Faixa de Preço
      const priceInReais = product.price_in_cents / 100;
      if (selectedPriceRange === "under-350" && priceInReais >= 350) return false;
      if (
        selectedPriceRange === "350-450" &&
        (priceInReais < 350 || priceInReais > 450)
      )
        return false;
      if (selectedPriceRange === "above-450" && priceInReais <= 450) return false;

      // 5. Apenas em estoque
      if (onlyInStock) {
        const totalStock =
          product.variants?.reduce((acc, v) => acc + (v.stock_quantity || 0), 0) ?? 0;
        if (totalStock <= 0) return false;
      }

      return true;
    }).sort((a, b) => {
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
      return 0; // featured
    });
  }, [
    initialProducts,
    searchQuery,
    selectedShape,
    selectedColor,
    selectedPriceRange,
    onlyInStock,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedBrand("all");
    setSelectedShape("all");
    setSelectedColor("all");
    setSelectedPriceRange("all");
    setOnlyInStock(false);
    setSortBy("featured");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedShape !== "all" ||
    selectedColor !== "all" ||
    selectedPriceRange !== "all" ||
    onlyInStock;

  return (
    <div className="space-y-8">
      {/* BARRA DE PESQUISA E FILTROS */}
      <div className="bg-[#06111f] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por modelo, cor ou formato (ex: Safari, Gatinho, Onça)..."
              className="w-full bg-[#040a14] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <span className="text-xs text-slate-400">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#040a14] border border-white/10 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400"
            >
              <option value="featured">Destaques</option>
              <option value="discount">Maior Desconto (%)</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
            </select>
          </div>
        </div>

        {/* Linha de Controles de Filtros */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5 text-xs">
          {/* Formato */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Formato</label>
            <select
              value={selectedShape}
              onChange={(e) => setSelectedShape(e.target.value)}
              className="w-full bg-[#040a14] border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todos os Formatos</option>
              {shapes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Cor */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Cor</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full bg-[#040a14] border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todas as Cores</option>
              {colors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Faixa de Preço */}
          <div className="space-y-1">
            <label className="text-slate-400 font-medium">Faixa de Preço</label>
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="w-full bg-[#040a14] border border-white/10 text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
            >
              <option value="all">Qualquer Preço</option>
              <option value="under-350">Até R$ 350</option>
              <option value="350-450">R$ 350 a R$ 450</option>
              <option value="above-450">Acima de R$ 450</option>
            </select>
          </div>

          {/* Em Estoque Checkbox */}
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
              <span className="text-xs">Apenas em Estoque</span>
            </label>
          </div>
        </div>

        {/* Resumo de Resultados & Limpar Filtros */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
          <div>
            Mostrando <strong>{filteredProducts.length}</strong> de{" "}
            {initialProducts.length} armações
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <X size={14} />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* GRID RESPONSIVO DE PRODUTOS */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-[#06111f] rounded-3xl border border-white/10 space-y-4">
          <Glasses size={36} className="mx-auto text-slate-500" />
          <h3 className="text-base font-semibold text-white">
            Nenhuma armação encontrada com os filtros selecionados
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tente remover alguns filtros ou buscar por outro termo de pesquisa.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
          >
            Ver Todas as Armações
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const primaryImage =
              product.images?.find((img) => img.is_primary)?.url || product.images?.[0]?.url;

            const currentPrice = product.price_in_cents / 100;
            const originalPrice = product.compare_at_price_in_cents
              ? product.compare_at_price_in_cents / 100
              : null;

            const hasDiscount = originalPrice !== null && originalPrice > currentPrice;
            const discountPercent = hasDiscount
              ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
              : null;

            const priceFormatted = currentPrice.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });

            const originalPriceFormatted = originalPrice
              ? originalPrice.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              : null;

            const installmentFormatted = (currentPrice / 10).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            });

            const isInCart = cartIds.includes(product.id);

            return (
              <div
                key={product.id}
                className="group relative rounded-3xl bg-[#06111f] border border-white/10 hover:border-amber-400/40 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-black/60 space-y-4"
              >
                {/* Badges superiores */}
                <div className="flex items-center justify-between">
                  {hasDiscount && discountPercent && discountPercent > 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      -{discountPercent}% OFF
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-semibold uppercase tracking-wider">
                      {product.frame_shape || "Armação"}
                    </span>
                  )}

                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    {product.frame_material || "Acetato"}
                  </span>
                </div>

                {/* Imagem do Produto com Link */}
                <Link
                  href={`/armacoes/${product.slug || product.id}`}
                  className="relative aspect-square w-full rounded-2xl bg-[#040a14] border border-white/5 flex items-center justify-center p-4 overflow-hidden group-hover:border-amber-400/20 transition-colors"
                >
                  {primaryImage ? (
                    <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                        className="object-contain p-2"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FrameArt
                        solar={product.frame_type === "Solar"}
                        round={product.frame_shape === "Redondo"}
                      />
                    </div>
                  )}
                </Link>

                {/* Informações de Título e Variantes */}
                <div className="space-y-1.5">
                  <div className="text-[11px] text-amber-400/90 font-medium">
                    Ventara Eyewear
                  </div>
                  <Link
                    href={`/armacoes/${product.slug || product.id}`}
                    className="block font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors truncate"
                  >
                    {product.name}
                  </Link>

                  {/* Cores das Variantes */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                      {product.variants.slice(0, 4).map((v) => (
                        <div
                          key={v.id}
                          className="w-3.5 h-3.5 rounded-full border border-white/30"
                          style={{ backgroundColor: v.color_hex || "#1e293b" }}
                          title={v.color_name}
                        />
                      ))}
                      {product.variants.length > 4 && (
                        <span className="text-[10px] text-slate-500">
                          +{product.variants.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Preços e Ações */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div>
                    {hasDiscount && (
                      <span className="text-xs text-slate-500 line-through block">
                        {originalPriceFormatted}
                      </span>
                    )}
                    <div className="flex items-baseline justify-between">
                      <span className="text-base sm:text-lg font-bold text-white">
                        {priceFormatted}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        10x de {installmentFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Botões: Adicionar à Sacola e Ver Detalhes */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isInCart
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                      }`}
                    >
                      {isInCart ? (
                        <>
                          <Check size={14} />
                          <span>Na Sacola</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} />
                          <span>Adicionar</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/armacoes/${product.slug || product.id}`}
                      className="py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Ver</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <Toast message={toastMessage} type="success" onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}
