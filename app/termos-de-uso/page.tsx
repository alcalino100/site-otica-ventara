import React from "react";
import { Metadata } from "next";
import { TermsView } from "./terms-view";
import { getPageContent } from "@/lib/content/repository";
import { PageBackground } from "@/components/ui/page-background";
import { resolveBackgroundConfig } from "@/lib/content/background-presets";
import { DraftPreviewBanner } from "@/components/content/draft-preview-banner";
import { FloatingEditButton } from "@/components/content/floating-edit-button";

export const metadata: Metadata = {
  title: "Termos de Uso e Garantia | Óticas Ventara",
  description:
    "Diretrizes de comercialização, garantias e termos de uso da Óticas Ventara Eyewear.",
};

interface TermsPageProps {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function TermsOfUsePage({ searchParams }: TermsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isDraft = resolvedSearchParams.preview === "draft";

  const content = await getPageContent("politicas", isDraft ? "draft" : "published");

  const bgConfig = resolveBackgroundConfig(
    content.backgroundPreset || "default",
    content.backgroundConfig
  );

  return (
    <>
      <DraftPreviewBanner pageId="politicas" isDraft={isDraft} />
      <PageBackground config={bgConfig} />
      <TermsView content={content} />
      <FloatingEditButton pageId="politicas" />
    </>
  );
}
