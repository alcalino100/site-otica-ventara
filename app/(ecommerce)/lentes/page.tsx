import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LensesCatalogView } from "@/components/lenses/lenses-catalog-view";
import { getPageContent } from "@/lib/content/repository";
import { PageBackground } from "@/components/ui/page-background";
import { resolveBackgroundConfig } from "@/lib/content/background-presets";
import { JsonLd } from "@/components/seo/json-ld";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { DraftPreviewBanner } from "@/components/content/draft-preview-banner";
import { FloatingEditButton } from "@/components/content/floating-edit-button";

export const metadata: Metadata = buildPageMetadata({
  title: "Lentes de Grau em Araçatuba | Catálogo de Lentes e Tratamentos | Ventara",
  description:
    "Lentes de grau em Araçatuba: visão simples, multifocais, fotossensíveis e filtro azul das melhores marcas. Montagem expressa em até 1 hora no laboratório próprio.",
  path: "/lentes",
  image: "/images/banners/catalogo-lentes-oftalmicas.jpg",
});

export const revalidate = 60;

interface LensesPageProps {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function LensesPage({ searchParams }: LensesPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isDraft = resolvedParams.preview === "draft";

  const content = await getPageContent("lentes", isDraft ? "draft" : "published");
  const bgConfig = resolveBackgroundConfig(content.backgroundPreset, content);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Lentes de Grau", path: "/lentes" }])} />
      <DraftPreviewBanner pageId="lentes" isDraft={isDraft} />
      <PageBackground config={bgConfig} />
      <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col selection:bg-amber-400 selection:text-slate-950">
        <Header />
        <main className="flex-1 pt-24 sm:pt-28">
          <LensesCatalogView content={content} />
        </main>
        <Footer />
      </div>
      <FloatingEditButton pageId="lentes" />
    </>
  );
}
