import React from "react";

interface PriceDisplayProps {
  priceInCents: number;
  compareAtPriceInCents?: number | null;
  installments?: number;
  showDiscountBadge?: boolean;
  showSavings?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({
  priceInCents,
  compareAtPriceInCents,
  installments = 10,
  showDiscountBadge = true,
  showSavings = false,
  size = "md",
  className = "",
}: PriceDisplayProps) {
  const currentPrice = priceInCents / 100;
  const originalPrice = compareAtPriceInCents ? compareAtPriceInCents / 100 : null;
  const hasDiscount = Boolean(originalPrice && originalPrice > currentPrice);
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice! - currentPrice) / originalPrice!) * 100)
    : 0;
  const savings = hasDiscount ? originalPrice! - currentPrice : 0;

  const currentFormatted = currentPrice.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const originalFormatted = originalPrice
    ? originalPrice.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    : null;

  const installmentValue = currentPrice / installments;
  const installmentFormatted = installmentValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const priceTextSize =
    size === "lg"
      ? "text-3xl sm:text-4xl"
      : size === "sm"
      ? "text-base sm:text-lg"
      : "text-xl sm:text-2xl";

  return (
    <div className={`space-y-1 ${className}`}>
      {hasDiscount && (
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-slate-400 line-through">
            {originalFormatted}
          </span>
          {showDiscountBadge && discountPercent > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
              -{discountPercent}% OFF
            </span>
          )}
        </div>
      )}

      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`${priceTextSize} font-bold text-white font-mono tracking-tight`}>
          {currentFormatted}
        </span>
        <span className="text-[11px] sm:text-xs text-slate-400">
          {installments}x de {installmentFormatted} sem juros
        </span>
      </div>

      {showSavings && hasDiscount && savings > 0 && (
        <p className="text-[11px] text-emerald-400 font-medium">
          Economia de {savings.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      )}
    </div>
  );
}

export default PriceDisplay;
