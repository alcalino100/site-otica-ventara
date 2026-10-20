"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "outline" | "dark" | "gold" | "ghost";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "outline", isLoading = false, disabled, children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`interactive-btn button ${variant} ${isLoading ? "is-loading" : ""} ${className}`}
        {...props}
      >
        {isLoading && (
          <span className="btn-spinner" aria-hidden="true">
            <Loader2 className="animate-spin" size={16} />
          </span>
        )}
        <span className={`btn-content inline-flex items-center justify-center gap-2.5 ${isLoading ? "opacity-70" : ""}`}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
