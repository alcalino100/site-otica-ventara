"use client";

import React from "react";
import {
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  Wrench,
  Truck,
  HeartHandshake,
} from "lucide-react";

interface BenefitItemProps {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

interface ProductBenefitsBarProps {
  tags?: string[];
  customBenefits?: BenefitItemProps[];
}

const DEFAULT_BENEFITS: BenefitItemProps[] = [
  {
    id: "material",
    icon: "sparkles",
    title: "Acetato Nobre",
    desc: "Acabamento manual hipoalergênico",
  },
  {
    id: "lab",
    icon: "wrench",
    title: "Laboratório Próprio",
    desc: "Montagem em Araçatuba com precisão",
  },
  {
    id: "warranty",
    icon: "shield",
    title: "Garantia Ventara",
    desc: "1 ano contra defeitos de fabricação",
  },
  {
    id: "exchange",
    icon: "rotate",
    title: "Troca Facilitada",
    desc: "30 dias para troca sem burocracia",
  },
];

function getIconComponent(iconName: string) {
  switch (iconName.toLowerCase()) {
    case "shield":
    case "shieldcheck":
      return ShieldCheck;
    case "rotate":
    case "rotateccw":
      return RotateCcw;
    case "wrench":
      return Wrench;
    case "award":
      return Award;
    case "layers":
      return Layers;
    case "truck":
      return Truck;
    case "hearthandshake":
      return HeartHandshake;
    case "sparkles":
    default:
      return Sparkles;
  }
}

export function ProductBenefitsBar({
  tags,
  customBenefits,
}: ProductBenefitsBarProps) {
  let displayBenefits = customBenefits && customBenefits.length > 0
    ? customBenefits
    : DEFAULT_BENEFITS;

  if (tags && tags.length > 0) {
    const filtered = displayBenefits.filter((b) => tags.includes(b.id));
    if (filtered.length > 0) {
      displayBenefits = filtered;
    }
  }

  if (displayBenefits.length === 0) return null;

  return (
    <div className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 my-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {displayBenefits.map((item) => {
          const Icon = getIconComponent(item.icon);
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 text-left"
            >
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 shrink-0">
                <Icon size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
