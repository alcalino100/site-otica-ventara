/**
 * Motor Central de Preços, Descontos e Parcelamento da Ótica Ventara.
 * Fonte única de verdade para cálculos e formatações financeiras.
 * Proibido duplicar strings manuais ou cálculos espalhados em componentes.
 */

export interface FormattedProductPricing {
  currentPriceInCents: number;
  originalPriceInCents: number | null;
  currentPriceInReais: number;
  originalPriceInReais: number | null;
  hasDiscount: boolean;
  discountPercent: number;
  currentPriceFormatted: string;
  originalPriceFormatted: string | null;
  discountBadgeText: string | null;
  installmentFormatted: string;
  installmentFullText: string;
  pixPriceFormatted: string;
}

export interface PricingInput {
  price_in_cents: number;
  compare_at_price_in_cents?: number | null;
  original_price?: number | null;
}

/**
 * Formata um valor numérico em Reais (BRL)
 */
export function formatCurrencyBRL(valueInReais: number): string {
  return valueInReais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Calcula o percentual arredondado de desconto entre preço atual e original.
 * Retorna 0 caso não haja desconto válido.
 */
export function calculateDiscountPercent(
  currentInCents: number,
  originalInCents?: number | null
): number {
  if (!originalInCents || originalInCents <= currentInCents) {
    return 0;
  }
  return Math.round(((originalInCents - currentInCents) / originalInCents) * 100);
}

/**
 * Calcula a parcela sem juros (padrão Ventara: 10x).
 */
export function calculateInstallment(
  totalInCents: number,
  maxInstallments = 10
): { count: number; valueInReais: number; formatted: string; fullText: string } {
  const installments = Math.max(1, maxInstallments);
  const valueInReais = totalInCents / (installments * 100);
  const formatted = formatCurrencyBRL(valueInReais);
  const fullText = `ou em até ${installments}x de ${formatted} sem juros no cartão`;
  return {
    count: installments,
    valueInReais,
    formatted,
    fullText,
  };
}

/**
 * Retorna todas as informações formatadas de preço para um produto.
 */
export function formatProductPricing(product: PricingInput): FormattedProductPricing {
  const currentPriceInCents = Math.max(0, Number(product.price_in_cents) || 0);
  const currentPriceInReais = currentPriceInCents / 100;

  let originalPriceInCents: number | null = null;
  if (
    typeof product.compare_at_price_in_cents === "number" &&
    product.compare_at_price_in_cents > currentPriceInCents
  ) {
    originalPriceInCents = product.compare_at_price_in_cents;
  } else if (
    typeof product.original_price === "number" &&
    product.original_price * 100 > currentPriceInCents
  ) {
    originalPriceInCents = Math.round(product.original_price * 100);
  }

  const originalPriceInReais =
    originalPriceInCents !== null ? originalPriceInCents / 100 : null;

  const discountPercent = calculateDiscountPercent(
    currentPriceInCents,
    originalPriceInCents
  );
  const hasDiscount = discountPercent > 0;

  const currentPriceFormatted = formatCurrencyBRL(currentPriceInReais);
  const originalPriceFormatted =
    originalPriceInReais !== null ? formatCurrencyBRL(originalPriceInReais) : null;

  const discountBadgeText = hasDiscount ? `-${discountPercent}% OFF` : null;

  const installment = calculateInstallment(currentPriceInCents, 10);

  return {
    currentPriceInCents,
    originalPriceInCents,
    currentPriceInReais,
    originalPriceInReais,
    hasDiscount,
    discountPercent,
    currentPriceFormatted,
    originalPriceFormatted,
    discountBadgeText,
    installmentFormatted: installment.formatted,
    installmentFullText: installment.fullText,
    pixPriceFormatted: currentPriceFormatted,
  };
}
