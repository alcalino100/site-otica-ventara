"use client";

import React from "react";
import {
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Package,
  Truck,
  MapPin,
  Sparkles,
} from "lucide-react";
import { ShippingTimelineStep } from "@/types/shipping";

interface ShippingHowItWorksProps {
  title?: string;
  subtitle?: string;
  steps?: ShippingTimelineStep[];
}

export function ShippingHowItWorks({
  title = "Como funciona nosso fluxo de entrega",
  subtitle = "Do pedido confirmado no laboratório próprio até a chegada às suas mãos",
  steps = [],
}: ShippingHowItWorksProps) {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "CheckCircle2":
        return CheckCircle2;
      case "Cpu":
        return Cpu;
      case "ShieldCheck":
        return ShieldCheck;
      case "Package":
        return Package;
      case "Truck":
        return Truck;
      case "MapPin":
        return MapPin;
      default:
        return Sparkles;
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F4] relative overflow-hidden border-b border-[#E8E3D8]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF4C7] border border-amber-400/40 text-[#9A6700] text-xs font-semibold tracking-wider uppercase mb-4 shadow-2xs">
            <Cpu size={14} className="text-[#9A6700]" />
            <span>Processo Técnico &amp; Rastreável</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-light text-[#06111F] tracking-tight leading-tight mb-4">
            {title}
          </h2>

          <p className="text-sm sm:text-base text-[#4A5875] font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Stepper Grid em 6 etapas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = getIcon(step.icon_name);
            return (
              <div
                key={step.step_number || idx}
                className="relative p-6 sm:p-7 rounded-2xl bg-white border border-[#E8E3D8] hover:border-[#06111F]/30 transition-all duration-300 flex flex-col justify-between group shadow-xs hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Cabeçalho do Passo com Número e Ícone */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-bold font-mono text-[#9A6700]">
                      0{step.step_number || idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#FFF4C7] text-[#9A6700] border border-amber-300/50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#06111F] tracking-tight mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#9A6700] font-semibold mb-3">
                    {step.short_description}
                  </p>
                  <p className="text-xs text-[#4A5875] leading-relaxed font-normal">
                    {step.detail}
                  </p>
                </div>

                {/* Linha decorativa de progresso na base do card */}
                <div className="mt-6 pt-3 border-t border-[#E8E3D8] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFD62E]" />
                  <span className="text-[10px] text-[#64748B] font-mono uppercase tracking-wider">
                    Etapa {idx + 1} de {steps.length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
