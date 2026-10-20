"use client";

import React from "react";
import { motion, useReducedMotion, Variants } from "motion/react";

interface WordsStaggerProps {
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
}

export function WordsStagger({
  children,
  className = "",
  delay = 0.05,
  duration = 0.35,
  stagger = 0.035,
  as = "p",
}: WordsStaggerProps) {
  const shouldReduceMotion = useReducedMotion();
  const words = typeof children === "string" ? children.split(" ") : [children];

  const MotionComponent = motion[as];

  if (shouldReduceMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: stagger,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 8,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration,
        ease: [0.23, 1, 0.32, 1] as const,
      },
    },
  };

  return (
    <MotionComponent
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className={`inline-block ${className}`}
    >
      {words.map((word, index) => (
        <span key={index} className="inline-block whitespace-nowrap">
          <motion.span variants={wordVariants} className="inline-block">
            {word}
          </motion.span>
          {index < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </MotionComponent>
  );
}
