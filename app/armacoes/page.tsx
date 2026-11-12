import React, { Suspense } from "react";
import { Metadata } from "next";
import { ArmacoesView } from "./armacoes-view";
import { getUnifiedProducts } from "@/lib/products";
import { getArmacoesPageSettings } from "@/lib/armacoes-settings";
import { getPageContent } from "@/lib/content/repository";
import { PageBackground } from "@/components/ui/page-background";
import { resolveBackgroundConfig } from "@/lib/content/background-presets";
import { DraftPreviewBanner } from "@/components/content/draft-preview-banner";
import { FloatingEditButton } from "@/components/content/floating-edit-button";

export const metadata: Metadata = {
  title: "Catálogo de Armações e Óculos de Grau e Sol | Óticas Ventara",
  description:
    "Explore a coleção de armações em acetato nobre e metal premium da Ótica Ventara em Araçatuba. Modelos gatinho, redondo, quadrado e solar com parcelamento em até 10x sem juros.",
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

interface ArmacoesPageProps {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function ArmacoesPage({ searchParams }: ArmacoesPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isDraft = resolvedParams.preview === "draft";

  const [products, heroSettings, content] = await Promise.all([
    getUnifiedProducts({ limit: 200 }),
    getArmacoesPageSettings(),
    getPageContent("armacoes", isDraft ? "draft" : "published"),
  ]);

  const bgConfig = resolveBackgroundConfig(content.backgroundPreset, content);

  return (
    <>
      <DraftPreviewBanner pageId="armacoes" isDraft={isDraft} />
      <PageBackground config={bgConfig} />
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#02070D] flex items-center justify-center text-slate-300 text-xs font-semibold">
            Carregando catálogo Ventara Eyewear...
          </div>
        }
      >
        <ArmacoesView
          initialProducts={products}
          heroSettings={heroSettings}
          content={content}
        />
      </Suspense>
      <FloatingEditButton pageId="armacoes" />
    </>
  );
}
