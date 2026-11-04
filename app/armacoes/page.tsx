import React, { Suspense } from "react";
import { Metadata } from "next";
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#040914] flex items-center justify-center text-amber-400 text-xs font-semibold">
          Carregando catálogo Ventara Eyewear...
        </div>
      }
    >
      <ArmacoesView initialProducts={products} />
    </Suspense>
  );
}
