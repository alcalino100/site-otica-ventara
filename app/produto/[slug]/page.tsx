import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, Sparkles, Check, Glasses } from "lucide-react";
import { Product } from "@/types/ecommerce";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FrameArt } from "@/components/catalog/frame-art";
import { ProductDetailActions } from "@/components/catalog/product-detail-actions";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        images:product_images(*),
        variants:product_variants(*)
      `)
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (!error && data) {
      return data as Product;
    }
  } catch (err) {
    console.warn("Erro ao buscar produto do Supabase, usando catálogo padrão:", err);
  }

  // Fallback para o catálogo estruturado oficial
  const defaultFound = DEFAULT_CATALOG.find((p) => p.slug === slug);
  return defaultFound || null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Produto não encontrado | Ótica Ventara",
    };
  }

  return {
    title: `${product.name} | Ótica Ventara Eyewear`,
    description: product.description || `Conheça a armação ${product.name} na Ótica Ventara em Araçatuba-SP.`,
    openGraph: {
      title: `${product.name} | Ótica Ventara`,
      description: product.description || `Armação ${product.name} com design sofisticado e alta precisão.`,
      url: `https://otica-ventara-murex.vercel.app/produto/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage = product.images?.find((img) => img.is_primary)?.url || product.images?.[0]?.url;
  const priceFormatted = (product.price_in_cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const comparePriceFormatted = product.compare_at_price_in_cents
    ? (product.compare_at_price_in_cents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#030c13] text-white font-sans">
      {/* Top Bar Navigation */}
      <header className="border-b border-white/10 bg-[#06121c]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/#armacoes"
            className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar ao Catálogo
          </Link>

          <Link href="/" className="flex items-center gap-2 text-amber-400 font-bold tracking-wider text-sm">
            <Glasses size={20} />
            <span className="text-white">VENTARA <span className="text-[10px] text-amber-400 font-normal">EYEWEAR</span></span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-400 mb-8 flex items-center gap-2" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-300 transition-colors">Início</Link>
          <span>/</span>
          <Link href="/#armacoes" className="hover:text-amber-300 transition-colors">Armações</Link>
          <span>/</span>
          <span className="text-amber-400/90 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Coluna 1: Imagem / Visual da Armação */}
          <div className="bg-[#081724] border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px] relative overflow-hidden shadow-2xl">
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full">
                {product.frame_type === "Solar" ? "Óculos Solar UV400" : "Armação de Grau"}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-1 rounded-full">
                {product.gender}
              </span>
            </div>

            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.name}
                className="max-h-80 w-auto object-contain hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full max-w-md py-6">
                <FrameArt
                  solar={product.frame_type === "Solar"}
                  round={product.frame_shape === "Redondo"}
                  amber={product.slug.includes("aurora")}
                />
              </div>
            )}

            <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 tracking-wider">
              ÓTICA VENTARA · ARAÇATUBA-SP
            </div>
          </div>

          {/* Coluna 2: Informações Técnicas e Ações */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold tracking-widest uppercase text-amber-400">
                  {product.category?.name || "Coleção Ventara"}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded">
                  <Sparkles size={11} className="text-amber-400" /> Curadoria Autoral
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mt-3">
                <span className="text-2xl font-bold text-amber-400">{priceFormatted}</span>
                {comparePriceFormatted && (
                  <span className="text-sm text-slate-500 line-through">{comparePriceFormatted}</span>
                )}
                <span className="text-xs text-slate-400">à vista ou parcelado</span>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {product.description}
            </p>

            {/* Tabela de Especificações Técnicas de Ótica */}
            <div className="bg-[#081724] border border-white/10 rounded-xl p-5 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-white/5 pb-2">
                Especificações Técnicas
              </h2>

              <dl className="grid grid-cols-2 gap-y-2.5 text-xs">
                <div>
                  <dt className="text-slate-400">Formato do Aro:</dt>
                  <dd className="font-semibold text-white mt-0.5">{product.frame_shape || "Clássico"}</dd>
                </div>

                <div>
                  <dt className="text-slate-400">Material da Armação:</dt>
                  <dd className="font-semibold text-white mt-0.5">{product.frame_material || "Acetato Nobre"}</dd>
                </div>

                <div>
                  <dt className="text-slate-400">Medida da Lente:</dt>
                  <dd className="font-semibold text-white mt-0.5">
                    {product.dimensions_lens_mm ? `${product.dimensions_lens_mm} mm` : "Padrão (52 mm)"}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-400">Ponte Nasal / Haste:</dt>
                  <dd className="font-semibold text-white mt-0.5">
                    {product.dimensions_bridge_mm || 18} mm / {product.dimensions_temple_mm || 145} mm
                  </dd>
                </div>
              </dl>
            </div>

            {/* Garantias Oficiais Confirmadas */}
            <div className="border border-white/5 bg-white/[0.02] rounded-xl p-4 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check size={15} className="text-amber-400" />
                <span>Ajuste facial sob medida no laboratório parceiro da loja</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={15} className="text-amber-400" />
                <span>Atendimento presencial em Araçatuba ou suporte digital</span>
              </div>
            </div>

            {/* Ações de Conversão */}
            <ProductDetailActions product={product} />
          </div>
        </div>
      </main>
    </div>
  );
}
