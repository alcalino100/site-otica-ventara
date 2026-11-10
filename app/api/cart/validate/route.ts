import { NextRequest, NextResponse } from "next/server";
import { getUnifiedProductBySlug } from "@/lib/products";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";

export interface ValidateCartRequestItem {
  id: string;
  productId?: string;
  variantId?: string;
  sku?: string;
  priceInCents?: number;
  quantity?: number;
}

export interface ValidatedCartItemResult {
  id: string;
  productId: string;
  variantId?: string;
  currentPriceInCents: number;
  oldPriceInCents: number;
  priceChanged: boolean;
  isOutOfStock: boolean;
  availableStock: number;
  message?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: ValidateCartRequestItem[] = Array.isArray(body?.items) ? body.items : [];

    if (items.length === 0) {
      return NextResponse.json({
        valid: true,
        items: [],
        hasPriceChanges: false,
        hasOutOfStock: false,
      });
    }

    const validatedItems: ValidatedCartItemResult[] = [];
    let hasPriceChanges = false;
    let hasOutOfStock = false;

    for (const item of items) {
      const prodIdentifier = item.productId || item.id.split("-")[0];
      const product =
        (await getUnifiedProductBySlug(prodIdentifier)) ||
        DEFAULT_CATALOG.find((p) => p.id === prodIdentifier || p.slug === prodIdentifier);

      if (!product) {
        // Se o produto foi removido ou não existe
        validatedItems.push({
          id: item.id,
          productId: prodIdentifier,
          variantId: item.variantId,
          currentPriceInCents: item.priceInCents || 0,
          oldPriceInCents: item.priceInCents || 0,
          priceChanged: false,
          isOutOfStock: true,
          availableStock: 0,
          message: "Este produto não está mais disponível no catálogo.",
        });
        hasOutOfStock = true;
        continue;
      }

      // Procura a variante correspondente se informada
      const variant = item.variantId
        ? product.variants?.find((v: any) => v.id === item.variantId)
        : product.variants?.[0];

      const currentPrice =
        variant && typeof variant.price_in_cents === "number" && variant.price_in_cents > 0
          ? variant.price_in_cents
          : product.price_in_cents;

      const oldPrice = typeof item.priceInCents === "number" ? item.priceInCents : currentPrice;
      const priceChanged = oldPrice !== currentPrice;

      const stockQuantity =
        variant && typeof variant.stock_quantity === "number"
          ? variant.stock_quantity
          : 10;

      const isOutOfStock = stockQuantity <= 0;

      if (priceChanged) hasPriceChanges = true;
      if (isOutOfStock) hasOutOfStock = true;

      let message: string | undefined = undefined;
      if (priceChanged) {
        const oldFormatted = (oldPrice / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        const currentFormatted = (currentPrice / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        message = `O preço deste item foi atualizado de ${oldFormatted} para ${currentFormatted}.`;
      } else if (isOutOfStock) {
        message = "Este item está temporariamente esgotado.";
      }

      validatedItems.push({
        id: item.id,
        productId: product.id,
        variantId: variant?.id,
        currentPriceInCents: currentPrice,
        oldPriceInCents: oldPrice,
        priceChanged,
        isOutOfStock,
        availableStock: stockQuantity,
        message,
      });
    }

    return NextResponse.json({
      valid: !hasOutOfStock,
      items: validatedItems,
      hasPriceChanges,
      hasOutOfStock,
    });
  } catch (err: any) {
    console.error("Erro ao validar carrinho:", err);
    return NextResponse.json(
      { error: "Falha ao validar itens do carrinho." },
      { status: 500 }
    );
  }
}
