import React, { cache } from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Glasses,
  Clock,
  ArrowRight,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Product } from "@/types/ecommerce";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { createStaticSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductDetailActions } from "@/components/catalog/product-detail-actions";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface FrameDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return DEFAULT_CATALOG.flatMap((product) => [
    { id: product.id },
    { id: product.slug },
  ]);
}

const getProductByIdOrSlug = cache(async (idOrSlug: string): Promise<Product | null> => {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createStaticSupabaseClient();
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq("is_published", true);

      if (isUuid) {
        query = query.eq("id", idOrSlug);
      } else {
        query = query.eq("slug", idOrSlug);
      }

      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        return data as Product;
      }
    } catch (err) {
      console.warn("Erro ao buscar armação do Supabase:", err);
    }
  }

  // Fallback para o catálogo local oficial
  const found = DEFAULT_CATALOG.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  return found || null;
});

export async function generateMetadata({ params }: FrameDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    return {
      title: "Armação não encontrada | Óticas Ventara",
    };
  }

  return {
    title: `${product.name} | Armações Óticas Ventara`,
    description:
      product.description ||
      `Armação ${product.name} em acetato premium. Fabricação e montagem no laboratório próprio da Ótica Ventara em Araçatuba-SP.`,
    openGraph: {
      title: `${product.name} | Óticas Ventara Eyewear`,
      description:
        product.description ||
        `Armação ${product.name} com design sofisticado e alta precisão.`,
      url: `https://www.oticasventara.com.br/armacoes/${product.slug || product.id}`,
    },
  };
}

export default async function FrameDetailPage({ params }: FrameDetailPageProps) {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    notFound();
  }

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

  const relatedProducts = DEFAULT_CATALOG.filter(
    (p) => p.id !== product.id && p.slug !== product.slug
  ).slice(0, 4);

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
            <span className="text-slate-300">/</span>
            <Link href="/armacoes" className="hover:text-amber-600 transition-colors">
              Armações
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">{product.name}</span>
          </nav>

          {/* Grade Principal do Produto */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Galeria Visual (7 colunas) */}
            <div className="lg:col-span-7 space-y-4">
              <ProductGallery product={product} />
            </div>

            {/* Informações Técnicas e Ações (5 colunas) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold tracking-widest uppercase text-amber-600">
                    {product.category?.name || "Ventara Eyewear"}
                  </span>
                  <span className="text-[10px] text-slate-600 font-medium flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                    <Sparkles size={11} className="text-amber-500" /> Curadoria Autoral
                  </span>
                  <span className="text-[10px] text-slate-950 font-bold bg-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    NOVO
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
                  {product.name}
                </h1>

                {/* Avaliações em Estrelas e Código de Referência */}
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                    <span className="font-bold text-slate-900 ml-1">5.0</span>
                  </div>
                  <span>·</span>
                  <span className="text-slate-500">234 avaliações</span>
                  <span>·</span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    REF: {product.slug.toUpperCase()}
                  </span>
                </div>

                {/* Preço com Destaque e Desconto */}
                <div className="pt-2">
                  {hasDiscount && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-slate-400 line-through">
                        {originalPriceFormatted}
                      </span>
                      {discountPercent && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                          -{discountPercent}% OFF
                        </span>
                      )}
                      {originalPrice && (
                        <span className="text-xs text-emerald-600 font-medium">
                          Economia de {(originalPrice - currentPrice).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight">
                      {priceFormatted}
                    </span>
                    <span className="text-xs text-slate-500">
                      ou 10x de {installmentFormatted} sem juros
                    </span>
                  </div>
                </div>

                {/* Status de Disponibilidade em Estoque */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    <strong>Em Estoque</strong> — Envio expresso para todo o Brasil ou retirada na loja em Araçatuba.
                  </span>
                </div>

                {product.description && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pt-2">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Especificações Geométricas */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Dimensões Anatômicas (mm):
                </span>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                    <span className="text-slate-400 block text-[10px] uppercase">Lente</span>
                    <span className="text-slate-900 font-bold">{product.dimensions_lens_mm || 53} mm</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                    <span className="text-slate-400 block text-[10px] uppercase">Ponte</span>
                    <span className="text-slate-900 font-bold">{product.dimensions_bridge_mm || 18} mm</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                    <span className="text-slate-400 block text-[10px] uppercase">Hastes</span>
                    <span className="text-slate-900 font-bold">{product.dimensions_temple_mm || 145} mm</span>
                  </div>
                </div>
              </div>

              {/* Ações de Compra e Seleção de Lentes */}
              <ProductDetailActions product={product} />
            </div>
          </div>

          {/* Modelos Relacionados */}
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

                  return (
                    <Link
                      key={rel.id}
                      href={`/armacoes/${rel.slug || rel.id}`}
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
