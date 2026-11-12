import React from "react";
import { Metadata } from "next";
import { getPageContent } from "@/lib/content/repository";
import { resolveBackgroundConfig } from "@/lib/content/background-presets";
import { PageBackground } from "@/components/ui/page-background";
import { DraftPreviewBanner } from "@/components/content/draft-preview-banner";
import { FloatingEditButton } from "@/components/content/floating-edit-button";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { HomeClient } from "@/components/home/home-client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Óticas Ventara Eyewear | Armações Exclusivas & Lentes Digitais",
  description:
    "Armações autorais em acetato nobre e lentes de alta precisão com montagem em laboratório próprio em Araçatuba-SP. Conheça nossa curadoria exclusiva.",
};

interface HomePageProps {
  searchParams: Promise<{ preview?: string }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const { preview } = await searchParams;
  const isDraft = preview === "draft";

  const [homeContent, headerContent, footerContent, announcementContent] = await Promise.all([
    getPageContent("home", isDraft ? "draft" : "published"),
    getPageContent("globalHeader", isDraft ? "draft" : "published"),
    getPageContent("globalFooter", isDraft ? "draft" : "published"),
    getPageContent("globalAnnouncement", isDraft ? "draft" : "published"),
  ]);

  const bgConfig = resolveBackgroundConfig(homeContent.backgroundPreset, homeContent);

  return (
    <>
      <DraftPreviewBanner pageId="home" />
      <AnnouncementBar
        enabled={announcementContent.enabled !== false}
        text={announcementContent.text}
        linkUrl={announcementContent.linkUrl}
      />
      <PageBackground config={bgConfig} />
      <HomeClient
        homeContent={homeContent}
        headerContent={headerContent}
        footerContent={footerContent}
      />
      <FloatingEditButton pageId="home" />
    </>
  );
}
