import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LensesCatalogView } from "@/components/lenses/lenses-catalog-view";

export const metadata: Metadata = {
  title: "Catálogo de Lentes de Grau | Óticas Ventara",
  description:
    "Explore marcas, tecnologias e tratamentos de alta precisão para encontrar a lente de grau ideal para sua visão. Montagem expressa em até 1 hora no laboratório próprio de Araçatuba/SP.",
  openGraph: {
    title: "Catálogo de Lentes de Grau | Óticas Ventara",
    description:
      "Explore marcas, tecnologias e tratamentos de alta precisão para encontrar a lente de grau ideal para sua visão.",
    images: ["/images/banners/catalogo-lentes-oftalmicas.jpg"],
  },
};

export default function LensesPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      <Header />
      <main className="flex-1 pt-24 sm:pt-28">
        <LensesCatalogView />
      </main>
      <Footer />
    </div>
  );
}
