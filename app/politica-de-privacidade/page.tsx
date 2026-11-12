import React from "react";
import { Metadata } from "next";
import { PrivacyView } from "./privacy-view";
import { getPageContent } from "@/lib/content/repository";
import { PageBackground } from "@/components/ui/page-background";
import { resolveBackgroundConfig } from "@/lib/content/background-presets";
import { DraftPreviewBanner } from "@/components/content/draft-preview-banner";
import { FloatingEditButton } from "@/components/content/floating-edit-button";

export const metadata: Metadata = {
  title: "Política de Privacidade | Óticas Ventara",
  description:
    "Diretrizes de proteção de dados e privacidade em conformidade com a LGPD da Óticas Ventara Eyewear.",
};

interface PrivacyPageProps {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function PrivacyPolicyPage({ searchParams }: PrivacyPageProps) {
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
      <PrivacyView content={content} />
      <FloatingEditButton pageId="politicas" />
    </>
  );
}
