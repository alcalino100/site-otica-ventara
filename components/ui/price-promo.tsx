"use client";

import React from "react";
import {
  formatBRL,
  hasValidDiscount,
  calculateDiscountPercent,
} from "@/lib/utils/price";

export interface PricePromoProps {
  currentPrice: string | number;
  originalPrice?: string | number | null;
  showDiscountBadge?: boolean;
  prefixText?: string;
  installmentText?: string | null;
  theme?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PricePromo({
  currentPrice,
  originalPrice,
  showDiscountBadge = true,
  prefixText,
  installmentText,
  theme = "light",
  size = "md",
  className = "",
}: PricePromoProps) {
  const isValid = hasValidDiscount(currentPrice, originalPrice);
  const formattedCurrent = formatBRL(currentPrice);
  const formattedOriginal = isValid ? formatBRL(originalPrice) : null;
  const discountPercent = isValid
    ? calculateDiscountPercent(currentPrice, originalPrice)
    : null;

  // Tamanhos de fonte responsivos
  const currentPriceSizeClass =
    size === "lg"
      ? "text-xl sm:text-3xl font-black"
      : size === "sm"
      ? "text-sm sm:text-lg font-black"
      : "text-base sm:text-2xl font-black";

  const originalPriceSizeClass =
    size === "lg"
      ? "text-xs sm:text-base"
      : size === "sm"
      ? "text-[11px] sm:text-xs"
      : "text-xs sm:text-sm";

  // Cores de tema
  const currentTextColor =
    theme === "dark"
      ? "text-[#FFD62E] drop-shadow-xs"
      : "text-amber-500";

  const originalTextColor =
    theme === "dark"
      ? "text-slate-400/90"
      : "text-slate-400";

  const prefixTextColor =
    theme === "dark" ? "text-slate-400" : "text-slate-400";

  const installmentTextColor =
    theme === "dark" ? "text-slate-300" : "text-slate-500";

  return (
    <div className={`price-promo-container ${className}`}>
      {prefixText && (
        <span className={`text-[10px] block font-medium mb-0.5 ${prefixTextColor}`}>
          {prefixText}
        </span>
      )}

      {isValid && formattedOriginal ? (
        <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
          {/* Texto de acessibilidade para leitores de tela */}
          <span className="sr-only">
            De {formattedOriginal} por {formattedCurrent}
          </span>

          {/* Preço Antigo (Original) Riscado */}
          <span
            aria-hidden="true"
            data-testid="original-price"
            className={`line-through font-mono font-medium tracking-tight ${originalTextColor} ${originalPriceSizeClass}`}
          >
            {formattedOriginal}
          </span>

          {/* Preço Atual em Destaque */}
          <span
            aria-hidden="true"
            data-testid="current-price"
            className={`font-mono leading-tight tracking-tight ${currentTextColor} ${currentPriceSizeClass}`}
          >
            {formattedCurrent}
          </span>

          {/* Badge de Desconto em Porcentagem */}
          {showDiscountBadge && discountPercent && discountPercent > 0 && (
            <span
              aria-hidden="true"
              data-testid="discount-badge"
              className="text-[10px] sm:text-[11px] font-black tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 leading-none shrink-0"
            >
              -{discountPercent}%
            </span>
          )}
        </div>
      ) : (
        <div
          data-testid="current-price"
          className={`font-mono leading-tight tracking-tight ${currentTextColor} ${currentPriceSizeClass}`}
        >
          {formattedCurrent}
        </div>
      )}

      {installmentText && (
        <span
          className={`text-[10px] sm:text-xs block mt-0.5 font-normal ${installmentTextColor}`}
        >
          {installmentText}
        </span>
      )}
    </div>
  );
}
