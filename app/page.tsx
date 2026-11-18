import React from "react";
import { Metadata } from "next";
import { getPageContent } from "@/lib/content/repository";
import { resolveBackgroundConfig, type PageBackgroundConfig } from "@/lib/content/background-presets";
import { getOptiSyncPageSettings } from "@/lib/optisync-settings";
import { PageBackground } from "@/components/ui/page-background";
import { DraftPreviewBanner } from "@/components/content/draft-preview-banner";
import { FloatingEditButton } from "@/components/content/floating-edit-button";
import { HomeClient } from "@/components/home/home-client";
import { getHeroData } from "@/lib/hero-server";
import { JsonLd } from "@/components/seo/json-ld";
import { HOME_FAQS } from "@/lib/home-faqs";
import { buildPageMetadata, faqJsonLd, opticianJsonLd, websiteJsonLd } from "@/lib/seo";
import { getHomeCatalogPicks } from "@/lib/home-picks";
import type { OptiSyncPageSettings } from "@/types/ecommerce";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Ótica em Araçatuba | Óculos de Grau e de Sol com Laboratório Próprio | Ventara",
  description:
    "Ótica em Araçatuba-SP: armações em acetato e titânio, lentes de grau com montagem expressa em até 1 hora no laboratório próprio. Parcele em até 10x sem juros.",
  path: "/",
});

interface HomePageProps {
  searchParams: Promise<{ preview?: string }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const { preview } = await searchParams;
  const isDraft = preview === "draft";

  const [homeContent, headerContent, footerContent, heroData, homeCatalogPicks] = await Promise.all([
    getPageContent("home", isDraft ? "draft" : "published"),
    getPageContent("globalHeader", isDraft ? "draft" : "published"),
    getPageContent("globalFooter", isDraft ? "draft" : "published"),
    getHeroData(),
    getHomeCatalogPicks(),
  ]);

  const bgConfig = resolveBackgroundConfig(homeContent.backgroundPreset, homeContent);

  // Fundo OptiSYNC da seção "Venha conhecer a Óticas Ventara": só busca os dados quando o toggle do admin está ligado.
  // Usa as mesmas cores e intensidades da página /optisync (conteúdo + configurações), forçando o preset tecnológico.
  let storeOptisyncBackground: PageBackgroundConfig | null = null;
  if (homeContent.storeUseOptisyncBg === true) {
    const mode = isDraft ? "draft" : "published";
    const [optisyncSettings, optisyncContent] = await Promise.all([
      getOptiSyncPageSettings(),
      getPageContent("optisync", mode),
    ]);
    storeOptisyncBackground = {
      ...resolveBackgroundConfig({ ...optisyncContent, backgroundPreset: "optisync" }, optisyncSettings),
      preset: "optisync",
      tone: "dark",
    };
  }

  // Seção OPTiSYNC Fotossensível da home: mesmos dados da página /optisync (só busca se estiver ligada).
  let photochromicSection: { photochromic: OptiSyncPageSettings["photochromicLine"]; content: Record<string, any> } | null = null;
  if (homeContent.showPhotochromicSection !== false) {
    const mode = isDraft ? "draft" : "published";
    const [optisyncSettings, optisyncContent] = await Promise.all([
      getOptiSyncPageSettings(),
      getPageContent("optisync", mode),
    ]);
    if (optisyncSettings.photochromicLine?.enabled !== false) {
      photochromicSection = { photochromic: optisyncSettings.photochromicLine, content: optisyncContent };
    }
  }

  return (
    <>
      <JsonLd data={[opticianJsonLd(), websiteJsonLd(), faqJsonLd(HOME_FAQS)]} />
      <DraftPreviewBanner pageId="home" />
      <PageBackground config={bgConfig} />
      <HomeClient
        homeContent={homeContent}
        headerContent={headerContent}
        footerContent={footerContent}
        storeOptisyncBackground={storeOptisyncBackground}
        photochromicSection={photochromicSection}
        heroData={heroData}
        homeCatalogPicks={homeCatalogPicks}
      />
      <FloatingEditButton pageId="home" />
    </>
  );
}
