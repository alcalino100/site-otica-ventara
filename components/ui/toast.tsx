"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Info, AlertCircle } from "lucide-react";

export interface ToastProps {
  message: string | null;
  type?: "success" | "info" | "warning";
  onClose?: () => void;
}

export function Toast({ message, type = "success" }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          aria-live="polite"
          className="toast-container"
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{
            duration: 0.28,
            ease: [0.23, 1, 0.32, 1], // Emil Kowalski --ease-out curve
          }}
        >
          <div className={`toast-badge toast-${type}`}>
            {type === "success" && <Check size={16} strokeWidth={2.5} />}
            {type === "info" && <Info size={16} strokeWidth={2.5} />}
            {type === "warning" && <AlertCircle size={16} strokeWidth={2.5} />}
          </div>
          <span className="toast-text">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
