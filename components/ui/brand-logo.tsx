"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "header" | "footer" | "hero" | "light";
  tone?: "dark" | "light";
}

export function BrandLogo({
  className = "",
  size,
  variant,
  tone,
}: BrandLogoProps) {
  const effectiveSize =
    size || (variant === "hero" ? "lg" : variant === "footer" ? "md" : "sm");

  const isLightTone = tone === "light" || variant === "light";
  const logoSrc = isLightTone
    ? "/images/logo-ventara-dark-text.png"
    : "/images/logo-ventara.png";

  const sizeClasses = {
    sm: "h-8 sm:h-9",
    md: "h-11 sm:h-12",
    lg: "h-16 sm:h-20",
  }[effectiveSize];

  return (
    <div className={cn("inline-flex items-center select-none", className)}>
      <img
        src={logoSrc}
        alt="Óticas Ventara Eyewear"
        className={cn(
          "w-auto object-contain transition-all duration-300 drop-shadow-xs",
          sizeClasses
        )}
      />
      <span className="sr-only">Óticas Ventara Eyewear</span>
    </div>
  );
}

export default BrandLogo;
