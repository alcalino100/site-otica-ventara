/**
 * Utilitários centralizados para cálculo, validação e formatação de preços promocionais
 * Ótica Ventara — Padrão monetário BRL (Intl.NumberFormat)
 */

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/**
 * Converte qualquer representação de preço (string BRL, número em reais ou string decimal)
 * para um float numérico seguro. Retorna null se for inválido ou zero/negativo.
 *
 * Exemplos:
 * - "R$ 179,90" -> 179.9
 * - "R$ 1.250,00" -> 1250.0
 * - "149.90" -> 149.9
 * - 149.9 -> 149.9
 */
export function parsePriceToNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  const clean = value
    .replace(/[^\d.,]/g, "") // remove "R$", espaços, etc
    .trim();

  if (!clean) return null;

  // Se tiver ponto de milhar e vírgula decimal (ex: 1.250,50)
  if (clean.includes(".") && clean.includes(",")) {
    const sanitized = clean.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(sanitized);
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  // Se tiver apenas vírgula (ex: 179,90)
  if (clean.includes(",")) {
    const num = parseFloat(clean.replace(",", "."));
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  // Formato decimal padrão ou inteiro (ex: 179.90 ou 179)
  const num = parseFloat(clean);
  return Number.isFinite(num) && num > 0 ? num : null;
}

/**
 * Formata um valor numérico em reais (BRL) usando Intl.NumberFormat
 */
export function formatBRL(value: number | string | null | undefined): string {
  const num = parsePriceToNumber(value);
  if (num === null) return "R$ 0,00";
  return brlFormatter.format(num);
}

/**
 * Valida se há um desconto real e válido (preço original estritamente maior que o atual).
 * Se o preço original for menor, igual ou nulo, retorna false.
 */
export function hasValidDiscount(
  currentPrice: number | string | null | undefined,
  originalPrice: number | string | null | undefined
): boolean {
  const current = parsePriceToNumber(currentPrice);
  const original = parsePriceToNumber(originalPrice);

  if (current === null || original === null) return false;
  return original > current;
}

/**
 * Calcula a porcentagem de desconto inteira (ex: 28 para 28%).
 * Retorna null se não houver desconto válido.
 */
export function calculateDiscountPercent(
  currentPrice: number | string | null | undefined,
  originalPrice: number | string | null | undefined
): number | null {
  const current = parsePriceToNumber(currentPrice);
  const original = parsePriceToNumber(originalPrice);

  if (!current || !original || original <= current) return null;

  const percent = Math.round(((original - current) / original) * 100);
  return percent > 0 ? percent : null;
}

/**
 * Formata o parcelamento padrão em até X vezes sem juros com base no preço ATUAL.
 */
export function formatInstallments(
  currentPrice: number | string | null | undefined,
  installments = 10
): string {
  const current = parsePriceToNumber(currentPrice);
  if (current === null) return `${installments}x sem juros`;
  const installmentValue = current / installments;
  return `${installments}x de ${brlFormatter.format(installmentValue)} sem juros`;
}
