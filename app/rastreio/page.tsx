import React from "react";
import { Metadata } from "next";
import { RastreioView } from "./rastreio-view";
import { getPageContent } from "@/lib/content/repository";
import { PageBackground } from "@/components/ui/page-background";
import { resolveBackgroundConfig } from "@/lib/content/background-presets";
import { DraftPreviewBanner } from "@/components/content/draft-preview-banner";
import { FloatingEditButton } from "@/components/content/floating-edit-button";

export const metadata: Metadata = {
  title: "Rastreie seu Pedido | Óticas Ventara",
  description:
    "Acompanhe em tempo real a montagem no laboratório óptico e a entrega das suas armações e lentes até o seu endereço.",
  openGraph: {
    title: "Rastreie seu Pedido | Óticas Ventara",
    description:
      "Acompanhe em tempo real a montagem no laboratório óptico e a entrega das suas armações e lentes até o seu endereço.",
  },
};

interface RastreioPageProps {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function RastreioPage({ searchParams }: RastreioPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isDraft = resolvedSearchParams.preview === "draft";

  const content = await getPageContent("rastrearPedido", isDraft ? "draft" : "published");

  const bgConfig = resolveBackgroundConfig(
    content.backgroundPreset || "default",
    content.backgroundConfig
  );

  return (
    <>
      <DraftPreviewBanner pageId="rastrearPedido" isDraft={isDraft} />
      <PageBackground config={bgConfig} />
      <RastreioView content={content} />
      <FloatingEditButton pageId="rastrearPedido" />
    </>
  );
}
