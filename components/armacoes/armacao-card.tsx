"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check, Eye } from "lucide-react";
import { Product } from "@/types/ecommerce";
import { FrameArt } from "@/components/catalog/frame-art";

interface ArmacaoCardProps {
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
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart(product);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.url ||
    product.images?.[0]?.url;

  const currentPrice = product.price_in_cents / 100;
  const originalPrice = product.compare_at_price_in_cents
    ? product.compare_at_price_in_cents / 100
    : typeof product.original_price === "number"
    ? product.original_price
    : null;

  const hasDiscount = Boolean(originalPrice && originalPrice > currentPrice);
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice! - currentPrice) / originalPrice!) * 100)
    : 0;

  const currentFormatted = currentPrice.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const originalFormatted = originalPrice
    ? originalPrice.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : null;

  const installmentFormatted = (currentPrice / 10).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const productUrl = `${hrefPrefix}/${product.slug || product.id}`;

  const swatches =
    product.variants && product.variants.length > 0
      ? product.variants.map((v) => ({
          name: v.color_name,
          hex: v.color_hex || "#1e293b",
        }))
      : [
          { name: "Preto", hex: "#0f172a" },
          { name: "Tartaruga", hex: "#78350f" },
        ];

  const shapeBadge = (product.frame_shape || "Clássico").toUpperCase();
  const materialBadge = (product.frame_material || "Acetato Premium").toUpperCase();

  return (
    <div className="product group relative rounded-2xl sm:rounded-3xl bg-[#06111f] border border-white/10 hover:border-amber-400/50 transition-all duration-300 p-3 sm:p-4 flex flex-col justify-between overflow-hidden shadow-md hover:shadow-2xl">
      {/* 1. Header do Card com Badges Estilo Screenshot */}
      <div className="flex items-center justify-between gap-1.5 mb-2.5 z-10">
        <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10 truncate">
          {shapeBadge}
        </span>

        {hasDiscount && discountPercent > 0 ? (
          <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono">
            -{discountPercent}% OFF
          </span>
        ) : (
          <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5 truncate">
            {materialBadge}
          </span>
        )}
      </div>

      {/* 2. Container da Foto Centrada (Quadrada) */}
      <Link
        href={productUrl}
        className="block relative aspect-square w-full rounded-xl bg-[#030812] border border-white/5 overflow-hidden p-3 mb-3 group/img cursor-pointer"
        aria-label={`Ver ${product.name}`}
      >
        {primaryImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-contain object-center group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-2 group-hover:scale-108 transition-transform duration-500">
            <div className="w-full max-w-[150px]">
              <FrameArt
                solar={product.frame_type === "Solar"}
                amber={product.slug.includes("safari") || product.slug.includes("onca")}
                round={product.frame_shape === "Redondo"}
              />
            </div>
          </div>
        )}
      </Link>

      {/* 3. Informações de Identidade & Título */}
      <div className="space-y-1 mb-3">
        <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider font-medium block">
          {product.category?.name || "Ventara Eyewear"}
        </span>

        <Link href={productUrl} className="block group-hover:text-amber-300 transition-colors">
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight leading-snug line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Swatches de Cores */}
        <div className="flex items-center gap-1.5 pt-1">
          <div className="flex items-center -space-x-1">
            {swatches.slice(0, 4).map((s, idx) => (
              <span
                key={idx}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-white/40 shadow-xs inline-block"
                style={{ backgroundColor: s.hex }}
                title={s.name}
              />
            ))}
          </div>
          {swatches.length > 1 && (
            <span className="text-[10px] text-slate-400">
              +{swatches.length} cores
            </span>
          )}
        </div>
      </div>

      {/* 4. Bloco de Preço */}
      <div className="pt-2 border-t border-white/10 mb-3 space-y-0.5">
        {hasDiscount && (
          <span className="text-[11px] sm:text-xs text-slate-400 line-through block">
            {originalFormatted}
          </span>
        )}

        <div className="flex items-baseline gap-2">
          <span className="text-sm sm:text-lg font-bold text-white font-mono tracking-tight">
            {currentFormatted}
          </span>
        </div>

        <p className="text-[10px] sm:text-[11px] text-slate-400">
          10x de {installmentFormatted}
        </p>
      </div>

      {/* 5. Linha de Botões de Ação na Base: [ADICIONAR] e [VER +] */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={handleAdd}
          className={`py-2 px-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider border transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
            justAdded
              ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
              : isInCart
              ? "bg-amber-400/20 border-amber-400/50 text-amber-300"
              : "bg-white/5 hover:bg-white/10 border-white/15 text-slate-200 hover:text-white"
          }`}
          title="Adicionar à sacola"
        >
          {justAdded ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span>Adicionado</span>
            </>
          ) : (
            <>
              <ShoppingBag size={13} className="text-amber-400" />
              <span>Adicionar</span>
            </>
          )}
        </button>

        <Link
          href={productUrl}
          className="py-2 px-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all duration-200 flex items-center justify-center gap-1 shadow-md shadow-amber-400/10 active:scale-95 text-center"
        >
          <span>VER +</span>
        </Link>
      </div>
    </div>
  );
}

export default ArmacaoCard;
