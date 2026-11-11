import React from "react";
import { Tag } from "lucide-react";

export interface DiscountBadgeProps {
  percent?: number;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Selo unificado de desconto da Ótica Ventara (Pílula verde com ícone de etiqueta Tag)
 * Formato padrão: "-XX% OFF"
 */
export function DiscountBadge({
  percent,
  label,
  className = "",
  size = "md",
}: DiscountBadgeProps) {
  const discountVal = typeof percent === "number" ? Math.round(percent) : 0;
  if (!label && discountVal <= 0) return null;

  const displayText = label || `-${discountVal}% OFF`;
  const isSm = size === "sm";

  return (
    <span
      data-testid="discount-badge"
      className={`inline-flex items-center gap-1 font-bold rounded-full bg-emerald-600 text-white shadow-xs tracking-wide shrink-0 ${
        isSm
          ? "px-2 py-0.5 text-[9px]"
          : "px-2.5 py-0.5 text-[10px] sm:text-[11px]"
      } ${className}`}
      style={{ whiteSpace: "nowrap" }}
    >
      <Tag size={isSm ? 10 : 12} className="shrink-0 stroke-[2.5]" aria-hidden="true" />
      <span className="whitespace-nowrap font-sans">{displayText}</span>
    </span>
  );
}
