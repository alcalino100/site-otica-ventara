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
    <section className="py-20 sm:py-28 bg-[#02070D] relative overflow-hidden border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-4">
            <Cpu size={14} className="text-amber-400" />
            <span>Processo Técnico &amp; Rastreável</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight leading-tight mb-4">
            {title}
          </h2>

          <p className="text-sm sm:text-base text-slate-400 font-light leading-relaxed">
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
                className="relative p-6 sm:p-7 rounded-2xl bg-[#061424]/50 border border-white/10 hover:border-amber-400/30 transition-all duration-300 flex flex-col justify-between group shadow-lg"
              >
                {/* Cabeçalho do Passo com Número e Ícone */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-light font-mono text-amber-400/80">
                      0{step.step_number || idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-white tracking-tight mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-amber-400/90 font-medium mb-3">
                    {step.short_description}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {step.detail}
                  </p>
                </div>

                {/* Linha decorativa de progresso na base do card */}
                <div className="mt-6 pt-3 border-t border-white/5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
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
