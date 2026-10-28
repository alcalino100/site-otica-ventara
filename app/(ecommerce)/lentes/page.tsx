import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LensesCatalogView } from "@/components/lenses/lenses-catalog-view";

export const metadata: Metadata = {
  title: "Catálogo de Lentes Oftálmicas | Óticas Ventara",
  description:
    "Explore marcas, tecnologias e tratamentos de alta precisão para encontrar a lente ideal para você. Montagem expressa em laboratório próprio em Araçatuba/SP.",
  openGraph: {
    title: "Catálogo de Lentes Oftálmicas | Óticas Ventara",
    description:
      "Explore marcas, tecnologias e tratamentos de alta precisão para encontrar a lente ideal para você.",
    images: ["/images/banners/catalogo-lentes-oftalmicas.jpg"],
  },
};

export default function LensesPage() {
  return (
    <div className="min-h-screen bg-[#02070D] text-slate-100 flex flex-col">
      <Header />
      <main className="flex-1 pt-24 sm:pt-28">
        <LensesCatalogView />
      </main>
      <Footer />
    </div>
  );
}
