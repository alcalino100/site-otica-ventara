"use client";

import React, { Children, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type WaveDirection = "ltr" | "rtl";

export type LogosCarouselProps = {
  /** Logo elements to cycle through. Each child is rendered as a single logo. */
  children: ReactNode;
  /**
   * Number of columns to spread the logos across. Capped at the number of logos.
   * @defaultValue 4
   */
  count?: number;
  columnCount?: number;
  /**
   * Direction the ripple travels: left-to-right or right-to-left.
   * @defaultValue "ltr"
   */
  direction?: WaveDirection;
  stagger?: number;
  duration?: number;
  interval?: number;
  className?: string;
};

function distributeLogos(logos: ReactNode[], count: number): ReactNode[][] {
  if (logos.length === 0) return [];
  const validCount = Math.min(Math.max(1, count), logos.length);
  const columns: ReactNode[][] = Array.from({ length: validCount }, () => []);

  logos.forEach((logo, index) => {
    columns[index % validCount].push(logo);
  });

  return columns;
}

export function LogosCarousel({
  children,
  count,
  columnCount = 4,
  direction = "ltr",
  stagger = 150,
  duration = 0.5,
  interval = 2500,
  className,
}: LogosCarouselProps) {
  const actualColumnCount = count || columnCount;
  const logosArray = useMemo(() => Children.toArray(children), [children]);
  const columns = useMemo(
    () => distributeLogos(logosArray, actualColumnCount),
    [logosArray, actualColumnCount]
  );

  const reduceMotion = useReducedMotion() ?? false;
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndexes, setCurrentIndexes] = useState<number[]>(() =>
    columns.map(() => 0)
  );
  const [isVisible, setIsVisible] = useState(true);

  // Track intersection to pause animation when off-screen
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "100px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Handle visibility state change (e.g. tab hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Staggered interval ticker for columns
  useEffect(() => {
    if (!isVisible || columns.length === 0) return;

    const timer = setInterval(() => {
      columns.forEach((col, colIndex) => {
        if (col.length <= 1) return;

        const actualColIndex =
          direction === "rtl" ? columns.length - 1 - colIndex : colIndex;

        setTimeout(() => {
          setCurrentIndexes((prev) => {
            const next = [...prev];
            next[colIndex] = (next[colIndex] + 1) % col.length;
            return next;
          });
        }, actualColIndex * stagger);
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible, columns, direction, interval, stagger]);

  if (columns.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`grid items-center justify-items-center gap-4 sm:gap-8 ${className || ""}`}
      style={{
        gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
      }}
    >
      {columns.map((col, colIndex) => {
        const activeIndex = currentIndexes[colIndex] ?? 0;
        const activeLogo = col[activeIndex];

        return (
          <div
            key={colIndex}
            className="relative flex h-16 sm:h-20 w-full items-center justify-center overflow-hidden"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={activeIndex}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 16, filter: "blur(4px)" }
                }
                animate={
                  reduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, filter: "blur(0px)" }
                }
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -16, filter: "blur(4px)" }
                }
                transition={{
                  duration: reduceMotion ? 0.2 : duration,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="absolute flex items-center justify-center w-full"
              >
                {activeLogo}
              </motion.div>
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
