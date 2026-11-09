import React, { Suspense } from "react";
import { Metadata } from "next";
import { ArmacoesView } from "./armacoes-view";
import { getUnifiedProducts } from "@/lib/products";
import { getArmacoesPageSettings } from "@/lib/armacoes-settings";

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

export default async function ArmacoesPage() {
  const [products, heroSettings] = await Promise.all([
    getUnifiedProducts({ limit: 200 }),
    getArmacoesPageSettings(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#02070D] flex items-center justify-center text-slate-300 text-xs font-semibold">
          Carregando catálogo Ventara Eyewear...
        </div>
      }
    >
      <ArmacoesView initialProducts={products} heroSettings={heroSettings} />
    </Suspense>
  );
}
