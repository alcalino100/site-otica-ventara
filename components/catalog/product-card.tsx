"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ShoppingBag, Check, ArrowRight, MessageSquare, Sparkles } from "lucide-react";
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

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.url ||
    product.images?.[0]?.url;

  const priceFormatted = (product.price_in_cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const installmentFormatted = (product.price_in_cents / 1000).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );

  const categoryLabel =
    product.gender === "Infantil"
      ? product.frame_type === "Solar"
        ? "Solar Infantil"
        : "Grau Infantil"
      : product.frame_type === "Solar"
      ? "Óculos de Sol"
      : "Armação de Grau";

  // Cores autorais derivadas das variantes ou padrões
  const swatches =
    product.variants && product.variants.length > 0
      ? product.variants.map((v) => ({
          name: v.color_name,
          hex: v.color_hex || "#1e293b",
        }))
      : [
          { name: "Preto Clássico", hex: "#0f172a" },
          { name: "Tartaruga", hex: "#78350f" },
          { name: "Âmbar", hex: "#d97706" },
        ];

  const whatsappMessage = encodeURIComponent(
    `Olá! Gostei do modelo "${product.name}" (${categoryLabel}) da Ótica Ventara e gostaria de mais informações.`
  );
  const whatsappUrl = `https://wa.me/5518996155748?text=${whatsappMessage}`;

  return (
    <article className="product group relative rounded-3xl overflow-hidden border border-slate-200/80 hover:border-amber-400/70 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-end bg-[#040d1a] aspect-[3/4] sm:aspect-[3/4.2] min-h-[460px]">
      {/* 1. Camada da Foto Sendo o Bloco Inteiro */}
      <Link
        href={`/produto/${product.slug}`}
        className="absolute inset-0 z-0 block overflow-hidden"
        aria-label={`Ver detalhes da armação ${product.name}`}
      >
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-8 pb-36 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 group-hover:scale-105 transition-transform duration-700 ease-out">
            <div className="w-full max-w-[220px]">
              <FrameArt
                solar={product.frame_type === "Solar"}
                amber={
                  product.slug.includes("aurora") ||
                  (product.slug.includes("solar") &&
                    !product.slug.includes("kids"))
                }
                round={product.frame_shape === "Redondo"}
                customColor={
                  product.gender === "Infantil"
                    ? product.frame_type === "Solar"
                      ? "#0284c7"
                      : "#2563eb"
                    : undefined
                }
              />
            </div>
          </div>
        )}
      </Link>

      {/* 2. Badges Flutuantes no Topo */}
      <span className="tag absolute top-3.5 left-3.5 text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-sm z-20">
        {categoryLabel}
      </span>

      <Link
        href={`/produto/${product.slug}`}
        className="image-action absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#FFD62E] group-hover:text-slate-950 transition-colors shadow-sm z-20"
        title="Ver detalhes do produto"
      >
        <ArrowRight size={15} />
      </Link>

      {/* 3. Degradê Cobrindo de Baixo para Cima (~25% a 35%) */}
      <div className="absolute inset-x-0 bottom-0 h-[65%] sm:h-[55%] bg-gradient-to-t from-[#02070d] via-[#02070d]/90 via-50% to-transparent pointer-events-none z-10" />

      {/* 4. Bloco de Informações Sobre o Degradê */}
      <div className="relative z-20 p-5 flex flex-col gap-2.5">
        {/* Swatches de cor */}
        <div className="flex items-center gap-2" title="Opções de cor disponíveis">
          <div className="flex items-center -space-x-1">
            {swatches.slice(0, 4).map((s, idx) => (
              <span
                key={idx}
                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs inline-block"
                style={{ backgroundColor: s.hex }}
                title={s.name}
              />
            ))}
          </div>
          <span className="text-[11px] text-amber-300 font-medium">
            {product.variants?.length
              ? `${product.variants.length} ${
                  product.variants.length === 1 ? "cor" : "cores"
                }`
              : "Cores autorais"}
          </span>
        </div>

        {/* Nome da Armação e Detalhes */}
        <div>
          <Link
            href={`/produto/${product.slug}`}
            className="hover:text-amber-300 transition-colors block"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug line-clamp-1 drop-shadow-sm">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-300 font-medium line-clamp-1 mt-0.5">
            {product.frame_material || "Acetato Premium"} ·{" "}
            {product.frame_shape ? `Aro ${product.frame_shape}` : "Clássico"}
          </p>
        </div>

        {/* Preço e Botão de Adicionar à Sacola */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xl sm:text-2xl font-black text-[#FFD62E] tracking-tight leading-none font-mono drop-shadow-sm">
              {priceFormatted}
            </p>
            <span className="text-[11px] text-slate-300 block leading-tight mt-1 truncate">
              ou até 10x de{" "}
              <strong className="font-semibold text-white">
                {installmentFormatted}
              </strong>{" "}
              sem juros
            </span>
          </div>

          <button
            type="button"
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              justAdded
                ? "bg-emerald-500 border-emerald-400 text-slate-950 scale-105"
                : isInCart
                ? "bg-amber-400 border-amber-300 text-slate-950"
                : "bg-white/10 hover:bg-amber-400 hover:text-slate-950 border-white/20 text-white"
            }`}
            aria-label={`Adicionar ${product.name} à seleção`}
            onClick={handleAdd}
            title="Adicionar à seleção"
          >
            {justAdded ? (
              <Check size={18} className="stroke-[3]" />
            ) : (
              <ShoppingBag size={17} />
            )}
          </button>
        </div>

        {/* Ações Rápidas: Ver Detalhes e WhatsApp */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <Link
            href={`/produto/${product.slug}`}
            className="text-center py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition-colors truncate border border-white/15 backdrop-blur-xs"
          >
            Ver detalhes
          </Link>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-colors truncate border border-emerald-500/30 backdrop-blur-xs"
            title={`Falar sobre ${product.name} no WhatsApp`}
          >
            <MessageSquare size={13} className="text-emerald-400 shrink-0" />
            <span className="truncate">WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
}
