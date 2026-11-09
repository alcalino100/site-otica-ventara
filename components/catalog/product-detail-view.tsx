import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Sparkles,
  Check,
  CheckCircle2,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { Product } from "@/types/ecommerce";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductDetailActions } from "@/components/catalog/product-detail-actions";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { formatProductPricing } from "@/lib/pricing";

export interface ProductDetailViewProps {
  product: Product;
  relatedProducts?: Product[];
  backLink?: { href: string; label: string };
  hrefPrefix?: "/produto" | "/armacoes";
}

export function ProductDetailView({
  product,
  relatedProducts = [],
  backLink = { href: "/armacoes", label: "Voltar ao Catálogo" },
  hrefPrefix = "/produto",
}: ProductDetailViewProps) {
  const pricing = formatProductPricing(product);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-amber-400 selection:text-slate-950 font-sans">
      <Header theme="dark" />

      <main className="flex-1 pt-20 sm:pt-24 pb-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 py-6">
          {/* Breadcrumb de Navegação */}
          <nav
            className="text-xs text-slate-500 mb-6 flex items-center gap-2"
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
              <ProductGallery product={product} />
            </div>

            {/* Coluna 2: Informações Técnicas e Ações (5 colunas) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-amber-600">
                    {product.gender || "Adulto"} · {product.frame_type || "Grau"}
                  </span>
                  <span className="text-[10px] text-slate-700 font-medium flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    <Sparkles size={11} className="text-amber-600" /> Curadoria Autoral
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950 leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-3xl font-bold text-slate-950 font-mono tracking-tight">
                    {pricing.currentPriceFormatted}
                  </span>
                  {pricing.hasDiscount && pricing.originalPriceFormatted && (
                    <span className="text-sm text-slate-400 line-through">
                      {pricing.originalPriceFormatted}
                    </span>
                  )}
                  {pricing.hasDiscount && pricing.discountBadgeText && (
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {pricing.discountBadgeText}
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

              {/* Tabela de Especificações Técnicas */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-3.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2.5 flex items-center justify-between">
                  <span>DIMENSÕES ANATÔMICAS (MM):</span>
                  <span className="text-[10px] font-semibold text-amber-600">Padrão ABNT</span>
                </h2>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      LENTE
                    </span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {product.dimensions_lens_mm || 53} mm
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      PONTE
                    </span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {product.dimensions_bridge_mm || 18} mm
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      HASTES
                    </span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {product.dimensions_temple_mm || 145} mm
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px] uppercase tracking-wider">
                      Material da Armação:
                    </span>
                    <span className="font-semibold text-slate-900">
                      {product.frame_material || "Acetato Premium"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block text-[10px] uppercase tracking-wider">
                      Formato do Aro:
                    </span>
                    <span className="font-semibold text-slate-900">
                      {product.frame_shape || "Clássico"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informações de Procedência e Ajuste */}
              <div className="border border-slate-200/90 bg-slate-50/70 rounded-2xl p-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>Ajuste anatômico sob medida no laboratório próprio da ótica</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                  <span>Atendimento presencial no Centro de Araçatuba ou entrega segura</span>
                </div>
              </div>

              {/* Ações de Conversão com Seletor de Cores e Guia de Lentes */}
              <ProductDetailActions product={product} />
            </div>
          </div>

          {/* Modelos Recomendados */}
          {relatedProducts.length > 0 && (
            <div className="mt-16 pt-12 border-t border-slate-200 space-y-6">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                  VOCÊ TAMBÉM PODE GOSTAR
                </span>
                <h2 className="text-xl sm:text-2xl font-light text-slate-900 mt-1">
                  Armações Recomendadas
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((rel) => {
                  const relImg =
                    rel.images?.find((img) => img.is_primary)?.url || rel.images?.[0]?.url;
                  const relPrice = (rel.price_in_cents / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  });
                  const targetSlug = rel.slug || rel.id;

                  return (
                    <Link
                      key={rel.id}
                      href={`${hrefPrefix}/${targetSlug}`}
                      className="group p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-md space-y-3 transition-all"
                    >
                      <div className="relative aspect-square w-full rounded-xl bg-slate-50 p-3 flex items-center justify-center overflow-hidden border border-slate-100">
                        {relImg && (
                          <Image
                            src={relImg}
                            alt={rel.name}
                            fill
                            sizes="200px"
                            className="object-contain transform group-hover:scale-105 transition-transform"
                          />
                        )}
                      </div>
                      <div>
                        <span className="text-xs text-amber-600 font-medium block">
                          Ventara Eyewear
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 truncate">
                          {rel.name}
                        </h3>
                        <span className="text-xs text-slate-600 font-bold block mt-1">
                          {relPrice}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
