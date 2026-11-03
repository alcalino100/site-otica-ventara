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
    <section className="py-2 pb-10 bg-[#FAF8F4]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <Link
          href={href}
          className="group flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E3D8] hover:border-[#06111F]/30 hover:shadow-md transition-all duration-200 shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#FFF4C7] border border-amber-300/60 flex items-center justify-center shrink-0 text-[#9A6700]">
              <Clock size={19} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#06111F] group-hover:text-[#9A6700] transition-colors">
                {title}
              </p>
              <p className="text-xs text-[#4A5875] leading-snug">
                {text}
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-[#F3F0E9] flex items-center justify-center text-[#06111F] group-hover:bg-[#FFD62E] group-hover:translate-x-1 transition-all shrink-0">
            <ChevronRight size={18} />
          </div>
        </Link>
      </div>
    </section>
  );
}
