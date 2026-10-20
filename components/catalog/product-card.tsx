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

  const primaryImage = product.images?.find((img) => img.is_primary)?.url || product.images?.[0]?.url;
  const priceFormatted = (product.price_in_cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const installmentFormatted = (product.price_in_cents / 1000).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const categoryLabel = product.frame_type === "Solar" ? "Óculos de Sol" : "Armação de Grau";

  // Derive color swatches from variants or defaults
  const swatches = product.variants && product.variants.length > 0
    ? product.variants.map((v) => ({ name: v.color_name, hex: v.color_hex || "#1e293b" }))
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
    <article className="product group flex flex-col justify-between bg-white rounded-2xl border border-slate-200/80 hover:border-amber-400/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Top Image & Badge */}
      <Link
        href={`/produto/${product.slug}`}
        className="product-image relative block bg-gradient-to-b from-slate-50 to-slate-100/60 p-6 flex items-center justify-center overflow-hidden"
        aria-label={`Ver detalhes da armação ${product.name}`}
      >
        <span className="tag absolute top-3 left-3 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/90 text-slate-800 border border-slate-200/60 shadow-xs z-10">
          {categoryLabel}
        </span>

        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-44 object-contain transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full max-w-[210px] transform transition-transform duration-500 group-hover:scale-105">
            <FrameArt
              solar={product.frame_type === "Solar"}
              amber={product.slug.includes("aurora") || product.slug.includes("solar")}
              round={product.frame_shape === "Redondo"}
            />
          </div>
        )}

        <span
          className="image-action absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-[#06111f] group-hover:text-amber-400 transition-colors shadow-xs"
          title="Ver detalhes do produto"
        >
          <ArrowRight size={15} />
        </span>
      </Link>

      {/* Info & Details */}
      <div className="product-info p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Swatches de cor */}
          <div className="flex items-center gap-1.5 mb-2.5" title="Opções de cor disponíveis">
            {swatches.slice(0, 4).map((s, idx) => (
              <span
                key={idx}
                className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs inline-block"
                style={{ backgroundColor: s.hex }}
                title={s.name}
              />
            ))}
            <span className="text-[10px] text-slate-400 font-medium ml-1">
              {product.variants?.length ? `${product.variants.length} cor(es)` : "Cores autorais"}
            </span>
          </div>

          <Link href={`/produto/${product.slug}`} className="hover:text-amber-600 transition-colors block">
            <h3 className="text-base font-semibold text-slate-900 tracking-tight line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            {product.frame_material || "Acetato Premium"} · {product.frame_shape || "Clássico"}
          </p>
        </div>

        {/* Pricing and Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-lg font-bold text-slate-900">{priceFormatted}</p>
              <span className="text-[11px] text-slate-500 block">
                ou em até 10x de <strong className="text-slate-700">{installmentFormatted}</strong> sem juros
              </span>
            </div>

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

          {/* Quick Dual Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href={`/produto/${product.slug}`}
              className="text-center py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors truncate"
            >
              Ver detalhes
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold transition-colors truncate"
              title={`Falar sobre ${product.name} no WhatsApp`}
            >
              <MessageSquare size={13} className="text-emerald-600" />
              <span>Falar no Whats</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
