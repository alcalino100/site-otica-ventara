import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { getProductByIdOrSlug } from "@/lib/catalog-server";
import { ProductDetailView } from "@/components/catalog/product-detail-view";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return DEFAULT_CATALOG.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductByIdOrSlug(slug);

  if (!product) {
    return {
      title: "Produto não encontrado | Ótica Ventara",
    };
  }

  return {
    title: `${product.name} | Ótica Ventara Eyewear`,
    description:
      product.description ||
      `Conheça a armação ${product.name} na Ótica Ventara em Araçatuba-SP.`,
    openGraph: {
      title: `${product.name} | Ótica Ventara`,
      description:
        product.description ||
        `Armação ${product.name} com design sofisticado e alta precisão.`,
      url: `https://www.oticasventara.com.br/produto/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductByIdOrSlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = DEFAULT_CATALOG.filter(
    (p) => p.slug !== product.slug && p.id !== product.id
  ).slice(0, 4);

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
      backLink={{ href: "/armacoes", label: "Voltar ao Catálogo" }}
      hrefPrefix="/produto"
    />
  );
}
