"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Sparkles, Tag, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { PromotionalShowcaseSettings, PromoProductItem } from "@/types/ecommerce";
import { DEFAULT_PROMOTIONAL_SHOWCASE } from "@/lib/site-settings-constants";
import { useSiteSettings } from "../providers/site-settings-provider";
import { FrameArt } from "../catalog/frame-art";

export function PromotionalOffersSection() {
  const { cleanWhatsAppNumber } = useSiteSettings();
  const [promoSettings, setPromoSettings] =
    useState<PromotionalShowcaseSettings>(DEFAULT_PROMOTIONAL_SHOWCASE);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

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
    const text = encodeURIComponent(
      `Olá! Vi a oferta promocional "${item.name}" com ${item.discountBadge} (de ${item.originalPrice} por ${item.promotionalPrice}) no site da Óticas Ventara e gostaria de garantir o meu!`
    );
    return `https://wa.me/${cleanWhatsAppNumber || "5518996155748"}?text=${text}`;
  };

  return (
    <section
      aria-label="Modelos Selecionados com Desconto"
      className="py-14 sm:py-20 bg-white border-y border-slate-200/80 relative overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        {/* Cabeçalho Limpo Estilo Fundo Branco */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-amber-500" />
              <span>{promoSettings.pillText || "OFERTA POR TEMPO LIMITADO"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              {promoSettings.title || "Até 25% OFF em modelos selecionados"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1.5 leading-relaxed">
              {promoSettings.subtitle ||
                "Pares icônicos com preço especial por tempo limitado. Armações com design autoral, lentes certificadas e parcelamento sem juros."}
            </p>
          </div>

          <a
            href="#armacoes"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors self-start md:self-auto cursor-pointer"
          >
            <span>{promoSettings.ctaText || "Ver todas as ofertas"}</span>
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Grade de Produtos Promocionais (2 colunas no mobile, 4 no desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {promoSettings.items.map((item) => {
            const hasError = imgErrors[item.id];
            const hasRealImage = Boolean(item.image && item.image.trim() !== "" && !hasError);

            return (
              <article
                key={item.id}
                className="group bg-slate-50/70 hover:bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/90 hover:border-amber-400/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Selos de Desconto e Categoria */}
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] sm:text-[10px] tracking-wide shadow-xs">
                      <Tag size={10} />
                      <span>{item.discountBadge || "-25% OFF"}</span>
                    </span>

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

                  {/* Seção de Preços (Com Desconto) */}
                  <div className="pt-2 border-t border-slate-200/70 mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[11px] text-slate-400 line-through font-mono">
                        {item.originalPrice}
                      </span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                        {item.promotionalPrice}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {item.installment}
                    </p>
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
      </div>
    </section>
  );
}
