"use client";

import React, { useState } from "react";
import { Sparkles, Sun, Compass } from "lucide-react";

interface LineNavTabsProps {
  hdTitle?: string;
  photochromicTitle?: string;
  kidsTitle?: string;
}

export function LineNavTabs({
  hdTitle = "OPTiSYNC HD",
  photochromicTitle = "Fotossensível",
  kidsTitle = "Kids Adventure",
}: LineNavTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("hd");

  const lines = [
    {
      id: "hd",
      targetId: "linha-hd",
      badge: "Adulto & Telas",
      title: hdTitle,
      icon: Sparkles,
      color: "border-[#0044C9] text-white",
      activeBg: "bg-gradient-to-r from-[#0044C9] to-[#1E5BFF]",
    },
    {
      id: "photochromic",
      targetId: "linha-fotossensivel",
      badge: "Adaptação UV",
      title: photochromicTitle,
      icon: Sun,
      color: "border-[#7A2CFF] text-white",
      activeBg: "bg-gradient-to-r from-[#7A2CFF] to-[#B93DAA]",
    },
    {
      id: "kids",
      targetId: "linha-kids",
      badge: "Infantil & Juvenil",
      title: kidsTitle,
      icon: Compass,
      color: "border-[#FFC21A] text-[#000933]",
      activeBg: "bg-gradient-to-r from-[#FFC21A] to-[#F59E0B]",
    },
  ];

  const handleScrollTo = (id: string, targetId: string) => {
    setActiveTab(id);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-2 rounded-3xl bg-[#000933]/90 border border-[#0044C9]/40 backdrop-blur-xl shadow-2xl">
        {lines.map((line) => {
          const Icon = line.icon;
          const isActive = activeTab === line.id;
          return (
            <button
              key={line.id}
              type="button"
              onClick={() => handleScrollTo(line.id, line.targetId)}
              className={`group relative p-4 rounded-2xl text-left transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFC21A] ${
                isActive
                  ? `${line.activeBg} text-white shadow-lg`
                  : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 border border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-black/30 text-white"
                      : "bg-[#0044C9]/30 text-sky-300"
                  }`}
                >
                  {line.badge}
                </span>
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-[#FFC21A]"
                  }`}
                />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                {line.title}
              </h3>
            </button>
          );
        })}
      </div>
    </div>
  );
}
