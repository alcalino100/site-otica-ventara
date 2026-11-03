"use client";

import React from "react";
import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";

interface ShippingEstimatedTimeframeProps {
  title?: string;
  text?: string;
  href?: string;
}

export function ShippingEstimatedTimeframe({
  title = "Prazo Estimado",
  text = "Consulte o prazo no checkout (média de 24h a 48h úteis após montagem técnica)",
  href = "/catalogo",
}: ShippingEstimatedTimeframeProps) {
  if (!text) return null;

  return (
    <section className="py-2 pb-10 bg-[#030913]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <Link
          href={href}
          className="group flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#081326] border border-blue-900/30 hover:border-amber-400/40 transition-all duration-200 shadow-md"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400">
              <Clock size={19} />
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                {title}
              </p>
              <p className="text-xs text-slate-300 leading-snug">
                {text}
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0">
            <ChevronRight size={18} />
          </div>
        </Link>
      </div>
    </section>
  );
}
