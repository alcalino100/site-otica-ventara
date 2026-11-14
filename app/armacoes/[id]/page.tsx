import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRelatedProducts, getUnifiedProducts } from "@/lib/products";
import { getProductByIdOrSlug } from "@/lib/catalog-server";
import { ProductDetailView } from "@/components/catalog/product-detail-view";
import { getPageContent } from "@/lib/content/repository";
import { PageBackground } from "@/components/ui/page-background";
import { resolveBackgroundConfig } from "@/lib/content/background-presets";
import { DraftPreviewBanner } from "@/components/content/draft-preview-banner";
import { FloatingEditButton } from "@/components/content/floating-edit-button";

interface FrameDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ preview?: string }>;
}

// Atualiza a página periodicamente: produto removido/alterado no admin reflete sem novo deploy.
export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getUnifiedProducts({ limit: 100 });
  return products.flatMap((product) => [{ id: product.id }, { id: product.slug }]);
}

export async function generateMetadata({ params }: FrameDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    return {
      title: "Armação não encontrada | Óticas Ventara",
    };
  }

  return {
    title: `${product.name} | Armações Óticas Ventara`,
    description:
      product.description ||
      `Armação ${product.name} em acetato premium. Fabricação e montagem no laboratório próprio da Ótica Ventara em Araçatuba-SP.`,
    openGraph: {
      title: `${product.name} | Óticas Ventara Eyewear`,
      description:
        product.description ||
        `Armação ${product.name} com design sofisticado e alta precisão.`,
      url: `https://www.oticasventara.com.br/armacoes/${product.slug || product.id}`,
    },
  };
}

export default async function FrameDetailPage({ params, searchParams }: FrameDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isDraft = resolvedSearchParams.preview === "draft";

  const [product, templateContent] = await Promise.all([
    getProductByIdOrSlug(id),
    getPageContent("produtoTemplate", isDraft ? "draft" : "published"),
  ]);

  if (!product) {
    notFound();
  }

  const bgConfig = resolveBackgroundConfig(
    templateContent.backgroundPreset || "default",
    templateContent.backgroundConfig
  );

  const relatedProducts = await getRelatedProducts(product, 4);

  return (
    <>
      <DraftPreviewBanner pageId="produtoTemplate" isDraft={isDraft} />
      <PageBackground config={bgConfig} />
      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
        backLink={{ href: "/armacoes", label: "Voltar ao Catálogo" }}
        hrefPrefix="/armacoes"
        templateContent={templateContent}
      />
      <FloatingEditButton pageId="produtoTemplate" />
    </>
  );
}
