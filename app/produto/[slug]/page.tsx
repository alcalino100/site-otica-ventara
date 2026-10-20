import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Check,
  Glasses,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Product } from "@/types/ecommerce";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FrameArt } from "@/components/catalog/frame-art";
import { ProductDetailActions } from "@/components/catalog/product-detail-actions";
import { BrandLogo } from "@/components/ui/brand-logo";

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
    description:
      product.description ||
      `Conheça a armação ${product.name} na Ótica Ventara em Araçatuba-SP.`,
    openGraph: {
      title: `${product.name} | Ótica Ventara`,
      description:
        product.description ||
        `Armação ${product.name} com design sofisticado e alta precisão.`,
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

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.url || product.images?.[0]?.url;
  const priceFormatted = (product.price_in_cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const installmentFormatted = (product.price_in_cents / 1000).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const comparePriceFormatted = product.compare_at_price_in_cents
    ? (product.compare_at_price_in_cents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : null;

  // Recomendações relacionadas (outros modelos do catálogo excluindo o atual)
  const relatedProducts = DEFAULT_CATALOG.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#030810] text-white font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Bar Navigation com BrandLogo oficial */}
      <header className="border-b border-white/10 bg-[#06111f]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          <Link
            href="/#armacoes"
            className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-amber-400 transition-colors active:scale-95 py-2"
          >
            <ArrowLeft size={16} /> <span>Voltar ao Catálogo</span>
          </Link>

          <Link href="/" className="flex items-center gap-2" title="Página Inicial Ótica Ventara">
            <BrandLogo size="sm" />
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <MapPin size={13} className="text-amber-400" />
            <span>Araçatuba · SP</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 py-10 sm:py-14">
        {/* Breadcrumb de Navegação */}
        <nav
          className="text-xs text-slate-400 mb-8 flex items-center gap-2"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-amber-300 transition-colors">
            Início
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/#armacoes" className="hover:text-amber-300 transition-colors">
            Armações
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-amber-400 font-semibold">{product.name}</span>
        </nav>

        {/* Grade Principal do Produto: Vitrine Visual + Detalhes Técnicos & Ações */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Coluna 1: Imagem / Visual da Armação (7 colunas) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#081724]/90 border border-white/10 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[500px] relative overflow-hidden shadow-2xl">
              {/* Luz Ambiente Interna */}
              <div className="absolute inset-0 bg-radial from-amber-400/5 via-transparent to-transparent pointer-events-none" />

              <div className="absolute top-5 left-5 flex items-center gap-2 z-10">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-400/15 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full shadow-xs">
                  {product.frame_type === "Solar" ? "Óculos Solar UV400" : "Armação de Grau"}
                </span>
                <span className="text-[10px] font-semibold text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  {product.gender || "Unissex"}
                </span>
              </div>

              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="max-h-80 w-auto object-contain hover:scale-105 transition-transform duration-500 relative z-10"
                />
              ) : (
                <div className="w-full max-w-md py-6 relative z-10">
                  <FrameArt
                    solar={product.frame_type === "Solar"}
                    round={product.frame_shape === "Redondo"}
                    amber={product.slug.includes("aurora")}
                  />
                </div>
              )}

              <div className="absolute bottom-5 right-5 text-[10px] font-medium text-slate-500 tracking-wider">
                ÓTICA VENTARA · ARAÇATUBA-SP
              </div>
            </div>

            {/* Destaques de Confiança e Procedência */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#061423] border border-white/5 flex items-center gap-3">
                <ShieldCheck size={18} className="text-amber-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Garantia Oficial</p>
                  <p className="text-[11px] text-slate-400">Nota fiscal e procedência</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#061423] border border-white/5 flex items-center gap-3">
                <Glasses size={18} className="text-amber-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Ajuste Gratuito</p>
                  <p className="text-[11px] text-slate-400">Calibração anatômica</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#061423] border border-white/5 flex items-center gap-3">
                <Clock size={18} className="text-amber-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Montagem Ágil</p>
                  <p className="text-[11px] text-slate-400">Laboratório próprio</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2: Informações Técnicas e Ações (5 colunas) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold tracking-widest uppercase text-amber-400">
                  {product.category?.name || "Coleção Ventara Eyewear"}
                </span>
                <span className="text-[10px] text-slate-300 flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                  <Sparkles size={11} className="text-amber-400" /> Curadoria Autoral
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-bold text-amber-400 font-mono tracking-tight">
                  {priceFormatted}
                </span>
                {comparePriceFormatted && (
                  <span className="text-sm text-slate-500 line-through">
                    {comparePriceFormatted}
                  </span>
                )}
                <span className="text-xs text-slate-400">à vista no Pix</span>
              </div>

              <p className="text-xs text-slate-300 mt-1">
                ou em até 10x de <strong className="text-white">{installmentFormatted}</strong> sem juros no cartão
              </p>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {product.description}
            </p>

            {/* Tabela de Especificações Técnicas de Ótica */}
            <div className="bg-[#081724]/90 border border-white/10 rounded-2xl p-5 space-y-3.5 shadow-md">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-white/5 pb-2.5 flex items-center justify-between">
                <span>Especificações Técnicas</span>
                <span className="text-[10px] font-normal text-amber-400/90">Padrão ABNT Óptico</span>
              </h2>

              <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <dt className="text-slate-400">Formato do Aro:</dt>
                  <dd className="font-semibold text-white mt-0.5">
                    {product.frame_shape || "Clássico"}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-400">Material da Armação:</dt>
                  <dd className="font-semibold text-white mt-0.5">
                    {product.frame_material || "Acetato Premium"}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-400">Medida da Lente:</dt>
                  <dd className="font-semibold text-white mt-0.5 font-mono">
                    {product.dimensions_lens_mm
                      ? `${product.dimensions_lens_mm} mm`
                      : "Padrão (52 mm)"}
                  </dd>
                </div>

                <div>
                  <dt className="text-slate-400">Ponte Nasal / Haste:</dt>
                  <dd className="font-semibold text-white mt-0.5 font-mono">
                    {product.dimensions_bridge_mm || 18} mm / {product.dimensions_temple_mm || 145} mm
                  </dd>
                </div>
              </dl>
            </div>

            {/* Garantias Oficiais Confirmadas */}
            <div className="border border-white/5 bg-white/[0.02] rounded-2xl p-4 space-y-2.5 text-xs text-slate-200">
              <div className="flex items-center gap-2.5">
                <Check size={16} className="text-amber-400 flex-shrink-0" />
                <span>Ajuste facial sob medida no laboratório próprio da ótica</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Check size={16} className="text-amber-400 flex-shrink-0" />
                <span>Atendimento presencial no Centro de Araçatuba ou entrega segura</span>
              </div>
            </div>

            {/* Ações de Conversão com Seletor de Cores e Guia de Lentes */}
            <ProductDetailActions product={product} />
          </div>
        </div>

        {/* Seção Editorial: Você Também Pode Gostar */}
        <section className="mt-20 pt-12 border-t border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                SUGESTÕES DE CURADORIA
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-1">
                Você também pode gostar
              </h2>
            </div>
            <Link
              href="/#armacoes"
              className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-semibold"
            >
              <span>Ver todas</span> <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => {
              const relImg = rel.images?.find((i) => i.is_primary)?.url || rel.images?.[0]?.url;
              const relPrice = (rel.price_in_cents / 100).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              });

              return (
                <Link
                  key={rel.id}
                  href={`/produto/${rel.slug}`}
                  className="group p-5 rounded-2xl bg-[#081724]/80 hover:bg-[#0a1e33] border border-white/10 hover:border-amber-400/40 transition-all duration-200 flex flex-col justify-between shadow-lg"
                >
                  <div className="bg-[#050f19] rounded-xl p-6 flex items-center justify-center min-h-[160px] mb-4">
                    {relImg ? (
                      <img
                        src={relImg}
                        alt={rel.name}
                        className="max-h-24 w-auto object-contain group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-32">
                        <FrameArt
                          solar={rel.frame_type === "Solar"}
                          round={rel.frame_shape === "Redondo"}
                          amber={rel.slug.includes("aurora")}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {rel.frame_type === "Solar" ? "Solar" : "Grau"}
                    </span>
                    <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors mt-0.5">
                      {rel.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-1 font-semibold">
                      {relPrice}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
