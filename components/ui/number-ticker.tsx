"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

interface NumberTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number; // in seconds
  delay?: number; // in seconds
  className?: string;
  formatToLocale?: boolean;
}

export function NumberTicker({
  value,
  prefix = "",
  suffix = "",
  duration = 1.3,
  delay = 0.1,
  className = "",
  formatToLocale = true,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const shouldReduceMotion = useReducedMotion();
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    if (!isInView) return;

    if (shouldReduceMotion) {
      setCurrent(value);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const timeoutId = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = (timestamp - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);

        // Quintic ease-out curve for fast initial explosion and smooth finish
        const easeOutQuint = 1 - Math.pow(1 - progress, 5);
        const nextValue = Math.round(easeOutQuint * value);

        setCurrent(nextValue);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        } else {
          setCurrent(value);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isInView, value, duration, delay, shouldReduceMotion]);

  const formattedNumber = formatToLocale
    ? current.toLocaleString("pt-BR")
    : current.toString();

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
}
