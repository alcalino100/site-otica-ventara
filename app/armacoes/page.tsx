import React, { Suspense } from "react";
import { Metadata } from "next";
import { ArmacoesView } from "./armacoes-view";
import { getUnifiedProducts } from "@/lib/products";
import { getArmacoesPageSettings } from "@/lib/armacoes-settings";
import { getPageContent } from "@/lib/content/repository";
import { PageBackground } from "@/components/ui/page-background";
import { resolveBackgroundConfig } from "@/lib/content/background-presets";
import { JsonLd } from "@/components/seo/json-ld";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { DraftPreviewBanner } from "@/components/content/draft-preview-banner";
import { OG_IMAGES } from "@/lib/seo";
import { FloatingEditButton } from "@/components/content/floating-edit-button";

export const metadata: Metadata = buildPageMetadata({
  title: "Armações de Grau e Óculos de Sol em Araçatuba | Catálogo Ventara",
  description:
    "Catálogo de armações em acetato nobre e metal premium da Ótica Ventara em Araçatuba: gatinho, redondo, quadrado e solar. Parcele em até 10x sem juros.",
  path: "/armacoes",
  image: OG_IMAGES.armacoes,
});

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
      <JsonLd data={breadcrumbJsonLd([{ name: "Início", path: "/" }, { name: "Armações", path: "/armacoes" }])} />
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
