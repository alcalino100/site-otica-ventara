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
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildPageMetadata, productJsonLd, trimDescription } from "@/lib/seo";
import { FloatingEditButton } from "@/components/content/floating-edit-button";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
}

// Atualiza a página periodicamente: produto removido/alterado no admin reflete sem novo deploy.
export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getUnifiedProducts({ limit: 100 });
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductByIdOrSlug(slug);

  if (!product) {
    return {
      title: "Produto não encontrado | Ótica Ventara",
    };
  }

  const primary = product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url;
  return buildPageMetadata({
    title: `${product.name} | Armação em Araçatuba | Ótica Ventara`,
    description:
      trimDescription(product.description) ||
      `Conheça a armação ${product.name} na Ótica Ventara em Araçatuba-SP. Parcele em até 10x sem juros e monte suas lentes no laboratório próprio.`,
    path: `/produto/${product.slug}`,
    image: primary,
  });
}

export default async function ProductDetailPage({ params, searchParams }: ProductPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isDraft = resolvedSearchParams.preview === "draft";

  const [product, templateContent] = await Promise.all([
    getProductByIdOrSlug(slug),
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
      <JsonLd
        data={[
          productJsonLd(product, `/produto/${product.slug}`),
          breadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Armações", path: "/armacoes" },
            { name: product.name, path: `/produto/${product.slug}` },
          ]),
        ]}
      />
      <DraftPreviewBanner pageId="produtoTemplate" isDraft={isDraft} />
      <PageBackground config={bgConfig} />
      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
        backLink={{ href: "/armacoes", label: "Voltar ao Catálogo" }}
        hrefPrefix="/produto"
        templateContent={templateContent}
      />
      <FloatingEditButton pageId="produtoTemplate" />
    </>
  );
}
