import React from "react";
import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ArmacoesView } from "./armacoes-view";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { Product } from "@/types/ecommerce";
import { createStaticSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Catálogo de Armações e Óculos de Grau e Sol | Óticas Ventara",
  description:
    "Explore a coleção de armações em acetato italiano e metal premium da Ótica Ventara em Araçatuba. Modelos gatinho, redondo, quadrado e solar com parcelamento em até 10x sem juros.",
  openGraph: {
    title: "Catálogo de Armações | Óticas Ventara",
    description:
      "Design autoral, precisão dióptrica e conforto prolongado. Confira nossa coleção completa.",
    images: [
      {
        url: "/images/catalog-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Catálogo de Armações Óticas Ventara",
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: "/armacoes",
  },
};

export const revalidate = 60;

async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createStaticSupabaseClient();
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*)
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch (err) {
      console.warn("Erro ao buscar armações do Supabase, usando catálogo padrão:", err);
    }
  }

  return DEFAULT_CATALOG.filter((p) => p.is_published !== false);
}

export default async function ArmacoesPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen flex flex-col bg-[#040914] text-white selection:bg-amber-400 selection:text-slate-950 font-sans">
      <Header theme="dark" />

      <main className="flex-1 pt-24 pb-20">
        {/* HERO SECTION */}
        <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-12 border-b border-white/10">
          <div className="max-w-6xl mx-auto space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
              COLEÇÃO VENTARA EYEWEAR
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-tight">
              Catálogo de <span className="font-semibold text-white">Armações &amp; Óculos</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Armações desenvolvidas para alta precisão dióptrica, conforto contínuo e leveza.
              Escolha seu modelo e personalize com as lentes digitais OPTiSYNC HD do nosso laboratório.
            </p>
          </div>
        </section>

        {/* CATALOG VIEW COM FILTROS */}
        <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto">
          <ArmacoesView initialProducts={products} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
