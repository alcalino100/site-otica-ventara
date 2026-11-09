"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Maximize2, Sparkles } from "lucide-react";
import type { OptiSyncGalleryItem } from "@/types/ecommerce";
import { OptiSyncLightbox } from "./optisync-lightbox";

interface OptiSyncGalleryClientProps {
  items: OptiSyncGalleryItem[];
  title?: string;
  subtitle?: string;
}

export function OptiSyncGalleryClient({
  items,
  title = "Galeria Tecnológica OPTiSYNC",
  subtitle = "Explore cada detalhe e aplicação visual das três linhas de lentes digitais.",
}: OptiSyncGalleryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  const categories = [
    { id: "todas", label: "Todas as Artes" },
    { id: "hd", label: "OPTiSYNC HD" },
    { id: "photochromic", label: "Fotossensível" },
    { id: "kids", label: "Kids Adventure" },
  ];

  const filteredItems =
    selectedCategory === "todas"
      ? items
      : items.filter((item) => item.line === selectedCategory);

  const handleOpenLightbox = (item: OptiSyncGalleryItem) => {
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      setLightboxIndex(idx);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Galeria com Filtros por Linha */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block font-mono">
            VISUAL FUTURISTA
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#B8C2E6] max-w-xl">
            {subtitle}
          </p>
        </div>

        {/* Abas de Filtro da Galeria */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#000933]/80 border border-[#0044C9]/30 backdrop-blur-md overflow-x-auto max-w-full no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#0044C9] text-white shadow-[0_0_15px_rgba(0,68,201,0.5)]"
                  : "text-[#B8C2E6] hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 sm:hidden">
        <span className="font-mono text-[11px] text-sky-400">
          {filteredItems.length} {filteredItems.length === 1 ? "arte" : "artes"} disponíveis
        </span>
        <span className="text-[11px] text-[#B8C2E6]">Toque para ampliar</span>
      </div>

      {/* Grade de Imagens Responsiva (Grid 2 colunas no mobile, 3 a 4 no desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenLightbox(item)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpenLightbox(item);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Ampliar arte: ${item.title}`}
            className="group relative rounded-xl sm:rounded-2xl overflow-hidden border border-[#0044C9]/30 bg-[#000933]/90 hover:border-[#7A2CFF]/70 shadow-lg hover:shadow-[0_0_25px_rgba(122,44,255,0.35)] transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FFC21A]"
          >
            {/* Imagem com Aspect Ratio */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#020716]">
              <Image
                src={item.imageUrl}
                alt={item.altText || item.title}
                fill
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Overlay Hover com Ícone de Zoom */}
              <div className="absolute inset-0 bg-[#00051E]/60 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <div className="p-2 sm:p-3 rounded-full bg-[#0044C9]/90 border border-white/30 text-white shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>

            {/* Informações da Imagem */}
            <div className="p-2.5 sm:p-3.5 space-y-0.5 sm:space-y-1 bg-[#000933]/95 border-t border-[#0044C9]/20">
              <div className="flex items-center justify-between gap-1">
                <h3 className="text-[11px] sm:text-xs font-bold text-white tracking-tight truncate">
                  {item.title}
                </h3>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono px-1.5 sm:px-2 py-0.5 rounded bg-white/[0.08] text-[#FFC21A] shrink-0">
                  {item.line}
                </span>
              </div>
              {item.caption && (
                <p className="text-[10px] sm:text-[11px] text-[#B8C2E6] line-clamp-1">
                  {item.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal Acessível */}
      <OptiSyncLightbox
        items={items}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />
    </div>
  );
}
