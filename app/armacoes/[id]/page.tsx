import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { getProductByIdOrSlug } from "@/lib/catalog-server";
import { ProductDetailView } from "@/components/catalog/product-detail-view";

interface FrameDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return DEFAULT_CATALOG.flatMap((product) => [
    { id: product.id },
    { id: product.slug },
  ]);
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

export default async function FrameDetailPage({ params }: FrameDetailPageProps) {
  const { id } = await params;
  const product = await getProductByIdOrSlug(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = DEFAULT_CATALOG.filter(
    (p) => p.id !== product.id && p.slug !== product.slug
  ).slice(0, 4);

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
      backLink={{ href: "/armacoes", label: "Voltar ao Catálogo" }}
      hrefPrefix="/armacoes"
    />
  );
}
