import { NextRequest, NextResponse } from "next/server";
import { getUnifiedProductBySlug } from "@/lib/products";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { extractProductAndVariantIds } from "@/lib/cart";

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
  requestedQuantity: number;
  hasInsufficientStock: boolean;
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
        hasInsufficientStock: false,
      });
    }

    const validatedItems: ValidatedCartItemResult[] = [];
    let hasPriceChanges = false;
    let hasOutOfStock = false;
    let hasInsufficientStock = false;

    for (const item of items) {
      const { productId, variantId } = extractProductAndVariantIds(
        item.id || "",
        item.productId,
        item.variantId
      );

      const prodIdentifier = productId || item.sku || item.id;
      const product =
        (await getUnifiedProductBySlug(prodIdentifier)) ||
        DEFAULT_CATALOG.find(
          (p) => p.id === prodIdentifier || p.slug === prodIdentifier || p.sku === prodIdentifier
        ) ||
        (item.id.includes("::")
          ? await getUnifiedProductBySlug(item.id.split("::")[0])
          : null);

      if (!product) {
        // Se o produto foi removido ou não existe no catálogo
        validatedItems.push({
          id: item.id,
          productId: prodIdentifier,
          variantId,
          currentPriceInCents: item.priceInCents || 0,
          oldPriceInCents: item.priceInCents || 0,
          priceChanged: false,
          isOutOfStock: true,
          availableStock: 0,
          requestedQuantity: item.quantity || 1,
          hasInsufficientStock: true,
          message: "Este produto não está mais disponível no catálogo.",
        });
        hasOutOfStock = true;
        continue;
      }

      // Procura a variante correspondente por variantId ou SKU ou primeira variante
      const targetVariantId = variantId || item.variantId;
      const variant = targetVariantId
        ? product.variants?.find((v: any) => v.id === targetVariantId || v.sku === targetVariantId)
        : product.variants?.[0];

      const currentPrice =
        variant && typeof variant.price_in_cents === "number" && variant.price_in_cents > 0
          ? variant.price_in_cents
          : product.price_in_cents;

      const oldPrice = typeof item.priceInCents === "number" ? item.priceInCents : currentPrice;
      const priceChanged = oldPrice !== currentPrice;

      // Fonte única de estoque da variante real
      const stockQuantity =
        variant && typeof variant.stock_quantity === "number"
          ? variant.stock_quantity
          : typeof product.variants?.[0]?.stock_quantity === "number"
          ? product.variants[0].stock_quantity
          : 10;

      const requestedQuantity = Math.max(1, Number(item.quantity || 1));
      const isOutOfStock = stockQuantity <= 0;
      const isInsufficient = !isOutOfStock && requestedQuantity > stockQuantity;

      if (priceChanged) hasPriceChanges = true;
      if (isOutOfStock) hasOutOfStock = true;
      if (isInsufficient) hasInsufficientStock = true;

      let message: string | undefined = undefined;
      if (isOutOfStock) {
        message = "Este item está temporariamente esgotado.";
      } else if (isInsufficient) {
        message = `Apenas ${stockQuantity} ${
          stockQuantity === 1 ? "unidade disponível" : "unidades disponíveis"
        } em estoque.`;
      } else if (priceChanged) {
        const oldFormatted = (oldPrice / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        const currentFormatted = (currentPrice / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        message = `O preço deste item foi atualizado de ${oldFormatted} para ${currentFormatted}.`;
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
        requestedQuantity,
        hasInsufficientStock: isInsufficient,
        message,
      });
    }

    return NextResponse.json({
      valid: !hasOutOfStock && !hasInsufficientStock,
      items: validatedItems,
      hasPriceChanges,
      hasOutOfStock,
      hasInsufficientStock,
    });
  } catch (err: any) {
    console.error("Erro ao validar carrinho:", err);
    return NextResponse.json(
      { error: "Falha ao validar itens do carrinho." },
      { status: 500 }
    );
  }
}
