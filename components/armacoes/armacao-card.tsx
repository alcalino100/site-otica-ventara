"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Check, MessageSquare, Tag, Sparkles } from "lucide-react";
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
  const [imgError, setImgError] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.url ||
    product.images?.[0]?.url;

  const currentPrice = product.price_in_cents / 100;
  const originalPriceInReais =
    typeof product.original_price === "number"
      ? product.original_price
      : product.compare_at_price_in_cents
      ? product.compare_at_price_in_cents / 100
      : null;

  const hasDiscount = Boolean(originalPriceInReais && originalPriceInReais > currentPrice);
  const discountPercent = hasDiscount
    ? Math.round(((originalPriceInReais! - currentPrice) / originalPriceInReais!) * 100)
    : 0;

  const currentFormatted = currentPrice.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const originalFormatted = originalPriceInReais
    ? originalPriceInReais.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : null;

  const installmentFormatted = (product.price_in_cents / 1000).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  );

  const productUrl = `${hrefPrefix}/${product.slug || product.id}`;

  const categoryLabel =
    product.gender === "Infantil"
      ? product.frame_type === "Solar"
        ? "Solar Infantil"
        : "Grau Infantil"
      : product.frame_type === "Solar"
      ? "Óculos de Sol"
      : "Armação de Grau";

  // Amostras de cores e variação
  const swatches =
    product.variants && product.variants.length > 0
      ? product.variants.map((v) => ({
          name: v.color_name,
          hex: v.color_hex || "#1e293b",
        }))
      : [
          { name: "Tartaruga Safari", hex: "#78350f" },
          { name: "Preto Clássico", hex: "#0f172a" },
          { name: "Âmbar Solar", hex: "#d97706" },
        ];

  const primarySwatch = swatches[0];
  const extraColorsCount = Math.max(0, swatches.length - 1);

  // Badge da direita (Destaque / Mais Vendido / Lançamento)
  const highlightBadge =
    product.is_featured
      ? "Destaque"
      : product.gender === "Infantil"
      ? "Linha Kids"
      : product.slug.includes("safari")
      ? "Mais Vendido"
      : product.frame_shape
      ? `Aro ${product.frame_shape}`
      : "Lançamento";

  const descriptionText =
    product.description ||
    `${product.frame_material || "Acetato nobre"} com aro ${
      product.frame_shape?.toLowerCase() || "moderno"
    } e encaixe anatômico confortável.`;

  const whatsappMessage = encodeURIComponent(
    `Olá! Gostei do modelo "${product.name}" (${categoryLabel}) na Ótica Ventara e gostaria de tirar dúvidas e consultar valores para minha receita.`
  );
  const whatsappUrl = `https://wa.me/5518996155748?text=${whatsappMessage}`;

  return (
    <div className="product group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* 1. Header do Card com Badges Estilo Vitrine Oficial */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5 min-h-[24px]">
          {hasDiscount && discountPercent > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] sm:text-[10px] tracking-wide shadow-xs">
              <Tag size={10} />
              <span>-{discountPercent}% OFF</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px] sm:text-[10px] tracking-wide">
              <Sparkles size={10} className="text-emerald-600" />
              <span>EXCLUSIVO</span>
            </span>
          )}

          <span className="text-[9px] sm:text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 sm:px-2.5 py-0.5 rounded-full truncate">
            {highlightBadge}
          </span>
        </div>

        {/* 2. Container da Foto do Modelo com Enquadramento Limpo */}
        <Link
          href={productUrl}
          className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50 mb-3 block shadow-xs group-hover:shadow-md transition-all duration-300 group-hover:border-amber-400/60"
          aria-label={`Ver detalhes do modelo ${product.name}`}
        >
          {primaryImage && !imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={primaryImage}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-3 sm:p-4 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full max-w-[140px] sm:max-w-[160px]">
                <FrameArt
                  solar={product.frame_type === "Solar"}
                  amber={
                    product.slug.includes("safari") ||
                    product.slug.includes("onca") ||
                    product.slug.includes("solar")
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

        {/* 3. Metadados e Nome do Modelo */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
            VENTARA · {categoryLabel.toUpperCase()}
          </span>
          <Link href={productUrl} className="block">
            <h3 className="text-xs sm:text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">
            {descriptionText}
          </p>
        </div>

        {/* 4. Variação de Cores com Indicador Numérico */}
        <div className="flex items-center gap-1.5 my-2.5">
          <span
            className="w-3 h-3 rounded-full border border-slate-300 shrink-0 shadow-xs"
            style={{ backgroundColor: primarySwatch.hex }}
            title={primarySwatch.name}
          />
          <span className="text-[10px] sm:text-[11px] text-slate-600 font-medium truncate">
            {primarySwatch.name}
          </span>
          {extraColorsCount > 0 && (
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">
              (+{extraColorsCount})
            </span>
          )}
        </div>

        {/* 5. Preços e Parcelamento */}
        <div className="pt-2 border-t border-slate-200/70 mb-3">
          <div className="flex items-baseline gap-2">
            {hasDiscount && originalFormatted && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through font-mono">
                {originalFormatted}
              </span>
            )}
            <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
              {currentFormatted}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
            10x de {installmentFormatted} sem juros
          </p>
        </div>
      </div>

      {/* 6. Ações Conforme Imagem 4 da Solicitação: Comprar (Escuro) + Dúvidas no WhatsApp (Amarelo) */}
      <div className="flex flex-col gap-1.5 pt-1">
        <Link
          href={productUrl}
          onClick={handleAdd}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-[11px] sm:text-xs tracking-wide shadow-sm transition-all cursor-pointer"
        >
          {justAdded ? (
            <>
              <Check size={14} className="text-emerald-400 stroke-[3]" />
              <span>Adicionado!</span>
            </>
          ) : (
            <>
              <ShoppingBag size={14} className="shrink-0" />
              <span>Comprar</span>
            </>
          )}
        </Link>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#FFD62E] hover:bg-[#FACC15] active:scale-95 text-slate-950 font-bold text-[10px] sm:text-[11px] tracking-wide shadow-xs transition-all cursor-pointer"
          title={`Tirar dúvidas sobre ${product.name} no WhatsApp`}
        >
          <MessageSquare size={13} className="shrink-0 text-slate-950" />
          <span>Dúvidas no WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

export default ArmacaoCard;
