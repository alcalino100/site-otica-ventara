"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Sparkles, Tag, ArrowRight, ShieldCheck, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { PromotionalShowcaseSettings, PromoProductItem } from "@/types/ecommerce";
import { DEFAULT_PROMOTIONAL_SHOWCASE } from "@/lib/site-settings-constants";
import { useSiteSettings } from "../providers/site-settings-provider";
import { FrameArt } from "../catalog/frame-art";

const INITIAL_LIMIT = 8;

export function PromotionalOffersSection() {
  const { cleanWhatsAppNumber } = useSiteSettings();
  const [promoSettings, setPromoSettings] =
    useState<PromotionalShowcaseSettings>(DEFAULT_PROMOTIONAL_SHOWCASE);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.promotional_showcase) {
            setPromoSettings((prev) => ({
              ...prev,
              ...data.promotional_showcase,
              items:
                data.promotional_showcase.items &&
                Array.isArray(data.promotional_showcase.items) &&
                data.promotional_showcase.items.length > 0
                  ? data.promotional_showcase.items
                  : prev.items,
            }));
          }
        }
      } catch (err) {
        // Fallback para DEFAULT_PROMOTIONAL_SHOWCASE
      }
    }
    loadSettings();
  }, []);

  if (!promoSettings.isEnabled) {
    return null;
  }

  const getWhatsAppBuyUrl = (item: PromoProductItem) => {
    const hasDiscount = Boolean(item.discountBadge && item.discountBadge.trim());
    const discountText = hasDiscount ? ` com ${item.discountBadge}` : "";
    const hasOriginal = Boolean(item.originalPrice && item.originalPrice.trim() !== "" && item.originalPrice !== item.promotionalPrice);
    const priceText = hasOriginal
      ? `(de ${item.originalPrice} por ${item.promotionalPrice})`
      : `(${item.promotionalPrice})`;
    const text = encodeURIComponent(
      `Olá! Vi o modelo "${item.name}"${discountText} ${priceText} no site da Óticas Ventara e gostaria de garantir o meu!`
    );
    return `https://wa.me/${cleanWhatsAppNumber || "5518996155748"}?text=${text}`;
  };

  return (
    <section
      aria-label="Modelos Selecionados"
      className="py-14 sm:py-20 bg-white border-y border-slate-200/80 relative overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        {/* Cabeçalho Limpo Estilo Fundo Branco */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-amber-500" />
              <span>{promoSettings.pillText || "CURADORIA EXCLUSIVA"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {promoSettings.title || "Modelos Selecionados em Destaque"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1.5 leading-relaxed">
              {promoSettings.subtitle ||
                "Pares icônicos com design autoral, acabamento nobre, lentes certificadas e parcelamento sem juros."}
            </p>
          </div>

          <a
            href="#armacoes"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors self-start md:self-auto cursor-pointer"
          >
            <span>{promoSettings.ctaText || "Ver todas as armações"}</span>
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Grade de Produtos Promocionais (2 colunas no mobile, 4 no desktop) */}
        <div className="relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {(isExpanded
              ? promoSettings.items
              : promoSettings.items.slice(0, INITIAL_LIMIT)
            ).map((item) => {
            const hasError = imgErrors[item.id];
            const hasRealImage = Boolean(item.image && item.image.trim() !== "" && !hasError);

            return (
              <article
                key={item.id}
                className="group bg-slate-50/70 hover:bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/90 hover:border-amber-400/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Selos de Desconto e Categoria */}
                  <div className="flex items-center justify-between gap-1.5 mb-2 min-h-[22px]">
                    {item.discountBadge && item.discountBadge.trim() !== "" ? (
                      <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] sm:text-[10px] tracking-wide shadow-xs">
                        <Tag size={10} />
                        <span>{item.discountBadge}</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    {item.tag && (
                      <span className="text-[9px] font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-full truncate">
                        {item.tag}
                      </span>
                    )}
                  </div>

                  {/* Foto do Modelo com Zoom no Hover */}
                  <Link
                    href={`/produto/${item.slug || "ventara-safari"}`}
                    className={`relative aspect-[4/3] w-full rounded-2xl overflow-hidden border transition-all duration-300 mb-3 block shadow-xs group-hover:shadow-md ${
                      hasRealImage && item.imageFit !== "contain"
                        ? "bg-slate-900/5 border-slate-200/90 group-hover:border-amber-400/60"
                        : "bg-white p-2.5 sm:p-4 flex items-center justify-center border-slate-100 group-hover:border-slate-200"
                    }`}
                    aria-label={`Ver modelo ${item.name}`}
                  >
                    {hasRealImage ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={() => setImgErrors((prev) => ({ ...prev, [item.id]: true }))}
                        className={`w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 ${
                          item.imageFit === "contain"
                            ? "object-contain drop-shadow-sm"
                            : "object-cover object-center"
                        }`}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full max-w-[140px] group-hover:scale-105 transition-transform duration-300">
                        <FrameArt
                          solar={item.category.toLowerCase().includes("solar")}
                          round={item.name.toLowerCase().includes("redondo") || item.name.toLowerCase().includes("onça")}
                          amber={item.colorName?.toLowerCase().includes("âmbar")}
                        />
                      </div>
                    )}
                  </Link>

                  {/* Metadados e Nome */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                      VENTARA · {item.category || "Armação"}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 hidden sm:block">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Variação de Cores Indicativa */}
                  <div className="flex items-center gap-1.5 my-2.5">
                    <span
                      className="w-3 h-3 rounded-full border border-slate-300 shrink-0 shadow-xs"
                      style={{ backgroundColor: item.colorHex || "#1e293b" }}
                      title={item.colorName || "Cor principal"}
                    />
                    <span className="text-[10px] text-slate-500 font-medium truncate">
                      {item.colorName || "Cor padrão"}
                    </span>
                    {(item.extraColorsCount || 0) > 0 && (
                      <span className="text-[9px] text-slate-400 font-mono">
                        +{item.extraColorsCount}
                      </span>
                    )}
                  </div>

                  {/* Seção de Preços (Com Desconto ou Preço Regular) */}
                  <div className="pt-2 border-t border-slate-200/70 mb-3">
                    <div className="flex items-baseline gap-2">
                      {item.originalPrice &&
                        item.originalPrice.trim() !== "" &&
                        item.originalPrice !== item.promotionalPrice && (
                          <span className="text-[11px] text-slate-400 line-through font-mono">
                            {item.originalPrice}
                          </span>
                        )}
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                        {item.promotionalPrice}
                      </span>
                    </div>
                    {item.installment && (
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {item.installment}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ações Conforme Solicitação: 1. Comprar (Página do Produto) | 2. Dúvidas no WhatsApp (Amarelo) */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <Link
                    href={`/produto/${item.slug || "ventara-safari"}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-[11px] sm:text-xs tracking-wide shadow-sm transition-all cursor-pointer"
                  >
                    <ShoppingBag size={13} className="shrink-0" />
                    <span>Comprar</span>
                  </Link>

                  <a
                    href={getWhatsAppBuyUrl(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-[10px] sm:text-[11px] tracking-wide shadow-xs transition-all cursor-pointer"
                  >
                    <MessageCircle size={13} className="shrink-0 text-slate-950" />
                    <span>Dúvidas no WhatsApp</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* Efeito de Degradê Cobrindo Parte dos Modelos Sobrando quando Recolhido */}
        {!isExpanded && promoSettings.items.length > INITIAL_LIMIT && (
          <div className="pointer-events-none absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-white via-white/85 to-transparent z-10" />
        )}
      </div>

      {/* Botão de Ver Mais / Recolher com Contador */}
      {promoSettings.items.length > INITIAL_LIMIT && (
        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center relative z-20">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-slate-900/10 transition-all duration-200 cursor-pointer border border-slate-700/60 group"
          >
            {isExpanded ? (
              <>
                <span>Recolher modelos</span>
                <ChevronUp size={16} className="text-amber-400 group-hover:-translate-y-0.5 transition-transform" />
              </>
            ) : (
              <>
                <span>Ver mais {promoSettings.items.length - INITIAL_LIMIT} modelos</span>
                <ChevronDown size={16} className="text-amber-400 group-hover:translate-y-0.5 transition-transform" />
              </>
            )}
          </button>
          <span className="text-[11px] text-slate-500 mt-2 font-medium">
            {isExpanded
              ? `Exibindo todos os ${promoSettings.items.length} modelos selecionados`
              : `Mostrando ${INITIAL_LIMIT} de ${promoSettings.items.length} modelos selecionados`}
          </span>
        </div>
      )}
      </div>
    </section>
  );
}
