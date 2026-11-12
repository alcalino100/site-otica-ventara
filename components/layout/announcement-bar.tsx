"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

interface AnnouncementBarProps {
  enabled?: boolean;
  text?: string;
  linkUrl?: string;
}

export function AnnouncementBar({
  enabled = true,
  text = "📦 Frete Grátis para todo o Brasil em compras a partir de R$ 299 · Parcele em até 10x sem juros",
  linkUrl = "/armacoes",
}: AnnouncementBarProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!enabled || isDismissed) {
    return null;
  }

  const content = (
    <div className="flex items-center justify-center gap-2 text-center">
      <span className="font-medium text-slate-200">{text}</span>
    </div>
  );

  return (
    <div
      role="region"
      aria-label="Aviso Promocional"
      className="bg-[#02070D] border-b border-white/10 text-slate-300 py-2 px-4 text-[11px] sm:text-xs font-medium tracking-wide relative z-40 transition-all duration-300"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          {linkUrl && linkUrl.trim().length > 0 ? (
            <Link
              href={linkUrl}
              className="hover:text-amber-400 transition-colors inline-block"
            >
              {content}
            </Link>
          ) : (
            content
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-slate-500 hover:text-slate-300 transition-colors p-0.5 rounded-full"
          aria-label="Fechar aviso promocional"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
