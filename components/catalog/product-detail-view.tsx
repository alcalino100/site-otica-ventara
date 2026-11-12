"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Product, ProductVariant } from "@/types/ecommerce";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductDetailActions } from "@/components/catalog/product-detail-actions";
import { ProductBenefitsBar } from "@/components/catalog/product-benefits-bar";
import { ProductAccordions } from "@/components/catalog/product-accordions";
import { ProductCard } from "@/components/catalog/product-card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { formatProductPricing } from "@/lib/pricing";

export interface ProductDetailViewProps {
  product: Product;
  relatedProducts?: Product[];
  backLink?: { href: string; label: string };
  hrefPrefix?: "/produto" | "/armacoes";
  templateContent?: Record<string, any>;
}

export function ProductDetailView({
  product,
  relatedProducts = [],
  backLink = { href: "/armacoes", label: "Voltar ao Catálogo" },
  hrefPrefix = "/produto",
  templateContent,
}: ProductDetailViewProps) {
  const dynamicBenefits = React.useMemo(() => {
    if (!templateContent) return undefined;
    return [
      {
        id: "material",
        icon: "sparkles",
        title: "Acetato Nobre",
        desc: "Acabamento manual hipoalergênico",
      },
      {
        id: "shipping",
        icon: "truck",
        title: "Frete Confiável",
        desc: templateContent.badgeShipping || "Frete Grátis nas compras a partir de R$ 299",
      },
      {
        id: "warranty",
        icon: "shield",
        title: "Garantia Ventara",
        desc: templateContent.badgeWarranty || "Garantia de 1 ano contra defeitos de fabricação",
      },
      {
        id: "exchange",
        icon: "rotate",
        title: "Troca Facilitada",
        desc: templateContent.badgeExchange || "Primeira troca grátis em até 7 dias corridos",
      },
    ];
  }, [templateContent]);
  const variants = product.variants && product.variants.length > 0 ? product.variants : [];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(variants[0] || null);

  const activePriceInCents =
    selectedVariant && typeof selectedVariant.price_in_cents === "number" && selectedVariant.price_in_cents > 0
      ? selectedVariant.price_in_cents
      : product.price_in_cents;

  const activeCompareAtInCents =
    selectedVariant && typeof selectedVariant.compare_at_price_in_cents === "number" && selectedVariant.compare_at_price_in_cents > 0
      ? selectedVariant.compare_at_price_in_cents
      : product.compare_at_price_in_cents;

  const pricing = formatProductPricing({
    price_in_cents: activePriceInCents,
    compare_at_price_in_cents: activeCompareAtInCents,
  });

  const activeImage = selectedVariant?.image_url || null;

  // Categoria / Linha ou Formato para o Breadcrumb estruturado
  const lineOrShapeLabel =
    product.category?.name ||
    product.frame_type ||
    product.frame_shape ||
    "Linha Premium";

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans">
      <Header theme="dark" />

      <main className="flex-1 pt-20 sm:pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 py-6">
          {/* Breadcrumb de Navegação Estruturado: Início / Armações / Linha ou formato / Nome do produto */}
          <nav
            className="text-xs text-slate-500 mb-6 flex items-center gap-2 flex-wrap"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-amber-600 transition-colors">
              Início
            </Link>
            <span className="text-slate-400">/</span>
            <Link href={backLink.href} className="hover:text-amber-600 transition-colors">
              Armações
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 font-medium">{lineOrShapeLabel}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-bold">{product.name}</span>
          </nav>

          {/* Botão de Retorno */}
          <div className="mb-6">
            <Link
              href={backLink.href}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-amber-600 transition-colors py-1.5"
            >
              <ArrowLeft size={16} />
              <span>{backLink.label}</span>
            </Link>
          </div>

          {/* Grade Principal do Produto: Vitrine Visual + Detalhes Técnicos & Ações */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Coluna 1: Imagem / Galeria da Armação (7 colunas) */}
            <div className="lg:col-span-7 space-y-4">
              <ProductGallery product={product} overrideImage={activeImage} />
            </div>

            {/* Coluna 2: Informações Técnicas e Ações (5 colunas) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-bold tracking-widest uppercase text-amber-600">
                    {product.brand?.name || "Ventara Eyewear"} · {product.frame_type || "Grau"}
                  </span>
                  <span className="text-[10px] text-slate-700 font-medium flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    <Sparkles size={11} className="text-amber-600" /> Curadoria Autoral
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950 leading-tight">
                  {product.name}
                </h1>

                {/* Três Números Clássicos (Lente · Ponte · Haste) */}
                {product.dimensions_lens_mm && product.dimensions_bridge_mm && product.dimensions_temple_mm && (
                  <div
                    data-testid="classic-dimensions"
                    className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-mono text-slate-800"
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-500 font-sans tracking-wider">Tamanho:</span>
                    <span className="font-bold text-amber-700">
                      {product.dimensions_lens_mm} · {product.dimensions_bridge_mm} · {product.dimensions_temple_mm}
                    </span>
                    {product.has_temple_engraving && (
                      <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">
                        (gravado na haste)
                      </span>
                    )}
                  </div>
                )}

                {/* Preços e Parcelamento com Fonte Única */}
                <div className="flex items-baseline gap-3 mt-4 flex-wrap">
                  <span className="text-3xl font-bold text-slate-950 font-mono tracking-tight">
                    {pricing.currentPriceFormatted}
                  </span>
                  {pricing.hasDiscount && pricing.originalPriceFormatted && (
                    <span className="text-sm text-slate-400 line-through">
                      {pricing.originalPriceFormatted}
                    </span>
                  )}
                  {pricing.hasDiscount && pricing.discountBadgeText && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Economize {pricing.discountBadgeText}
                    </span>
                  )}
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    à vista no Pix
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1.5">
                  ou em até 10x de{" "}
                  <strong className="text-slate-900 font-semibold">{pricing.installmentFormatted}</strong> sem
                  juros no cartão
                </p>
              </div>

              {product.description && (
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {product.description}
                </p>
              )}

              {/* Informações de Procedência e Ajuste */}
              <div className="border border-slate-200/90 bg-slate-50/70 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Ajuste anatômico sob medida no laboratório próprio da ótica em Araçatuba</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Atendimento presencial no Centro de Araçatuba ou envio seguro para todo o Brasil</span>
                </div>
              </div>

              {/* Ações de Conversão com Seletor de Cores, Modalidade de Lentes e Adicionar ao Carrinho */}
              <ProductDetailActions
                product={product}
                selectedVariant={selectedVariant}
                onSelectVariant={setSelectedVariant}
              />
            </div>
          </div>

          {/* Faixa de Benefícios Dinâmica baseada no Admin */}
          <ProductBenefitsBar tags={product.benefits_tags} customBenefits={dynamicBenefits} />

          {/* Acordeões Acessíveis (Apenas 1 Aberto por Vez, Teclado Acessível) */}
          <ProductAccordions product={product} />

          {/* Modelos Recomendados da Mesma Linha ou Formato com Swatches de Cores */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-slate-200 space-y-6">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                  VOCÊ TAMBÉM PODE GOSTAR
                </span>
                <h2 className="text-xl sm:text-2xl font-light text-slate-900 mt-1">
                  Armações Recomendadas da Linha {lineOrShapeLabel}
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
                {relatedProducts.map((rel) => (
                  <ProductCard
                    key={rel.id}
                    product={rel}
                    hrefPrefix={hrefPrefix}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
