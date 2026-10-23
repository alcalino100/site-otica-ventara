"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type HighlightFrom = "left" | "right" | "top" | "bottom";
export type HighlightVariant = "brand" | "contrast";

export interface HighlightedTextProps {
  children: React.ReactNode;
  className?: string;
  highlightClassName?: string;
  textClassName?: string;
  from?: HighlightFrom;
  delay?: number;
  inView?: boolean;
  once?: boolean;
  variant?: HighlightVariant;
}

const fromVariants = {
  left: {
    hidden: { x: "-100%" },
    visible: { x: "0%" },
  },
  right: {
    hidden: { x: "100%" },
    visible: { x: "0%" },
  },
  top: {
    hidden: { y: "-100%" },
    visible: { y: "0%" },
  },
  bottom: {
    hidden: { y: "100%" },
    visible: { y: "0%" },
  },
};

export function HighlightedText({
  children,
  className,
  highlightClassName,
  textClassName,
  from = "bottom",
  delay = 0,
  inView = false,
  once = true,
  variant = "brand",
}: HighlightedTextProps) {
  const shouldReduceMotion = useReducedMotion();
  const variants = fromVariants[from];

  const isContrast = variant === "contrast" && !highlightClassName;

  return (
    <motion.span
      className={cn(
        "relative inline-flex overflow-hidden align-baseline rounded-[0.22em] px-[0.16em] py-[0.02em] mx-[0.04em] select-none",
        className
      )}
      initial="hidden"
      whileInView={inView ? "visible" : undefined}
      animate={inView ? undefined : "visible"}
      viewport={{ once }}
    >
      {/* Bloco de Realce / Marca-texto */}
      <motion.span
        className={cn(
          "absolute inset-0 z-0",
          isContrast
            ? "bg-black dark:bg-white"
            : (highlightClassName || "bg-[#FFD62E] shadow-sm")
        )}
        variants={
          shouldReduceMotion
            ? { hidden: { opacity: 0 }, visible: { opacity: 1, x: "0%", y: "0%" } }
            : variants
        }
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 300,
          delay,
        }}
      />

      {/* Texto Realçado */}
      <span
        className={cn(
          "relative z-10 transition-colors",
          isContrast
            ? "mix-blend-difference text-white"
            : (textClassName || "text-[#02070D] font-bold")
        )}
      >
        {children}
      </span>
    </motion.span>
  );
}

export default HighlightedText;
