"use client";

import React, { useState } from "react";
import { Product } from "@/types/ecommerce";
import { FrameArt } from "./frame-art";
import { Sparkles } from "lucide-react";

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const images = product.images && product.images.length > 0 ? product.images : [];
  const primaryIdx = Math.max(
    0,
    images.findIndex((img) => img.is_primary)
  );
  const [activeIdx, setActiveIdx] = useState(primaryIdx);

  const activeImage = images[activeIdx]?.url;

  return (
    <div className="space-y-4">
      {/* Bloco Principal de Apresentação Visual */}
      {activeImage ? (
        <div className="relative w-full aspect-[4/3] sm:aspect-[4/3] lg:aspect-square min-h-[360px] sm:min-h-[460px] lg:min-h-[520px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-950 group select-none">
          {/* Foto que completa totalmente o bloco */}
          <img
            src={activeImage}
            alt={images[activeIdx]?.alt_text || product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Degradê Superior Discreto para Contraste dos Badges */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 via-black/15 to-transparent pointer-events-none z-10" />

          {/* Degradê Inferior Discreto para Contraste da Marca d'Água */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 via-black/20 via-30% to-transparent pointer-events-none z-10" />

          {/* Badges de Categoria e Gênero no Topo */}
          <div className="absolute top-5 left-5 flex items-center gap-2 z-20">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-black/45 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-full shadow-sm">
              {product.frame_type === "Solar" ? "Óculos Solar UV400" : "Armação de Grau"}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200 bg-black/45 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-sm">
              {product.gender || "Unissex"}
            </span>
          </div>

          {/* Selo Curadoria Autoral no Topo Direito */}
          <div className="absolute top-5 right-5 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold tracking-wider uppercase shadow-sm">
            <Sparkles size={12} className="text-[#FFD62E]" />
            <span>Peça Original</span>
          </div>

          {/* Marca d'Água Oficial no Rodapé */}
          <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-white/90 tracking-[0.18em] drop-shadow-sm uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD62E] inline-block animate-pulse" />
            ÓTICA VENTARA · ARAÇATUBA-SP
          </div>

          {/* Indicador Numérico quando houver múltiplas fotos */}
          {images.length > 1 && (
            <div className="absolute bottom-5 left-5 z-20 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono tracking-wider">
              0{activeIdx + 1} / 0{images.length}
            </div>
          )}
        </div>
      ) : (
        /* Caso sem Foto Real: Arte Vetorial Studio Light */
        <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center min-h-[360px] sm:min-h-[480px] lg:min-h-[520px] relative overflow-hidden shadow-xs">
          <div className="absolute top-5 left-5 flex items-center gap-2 z-10">
            <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-50 text-slate-800 border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
              {product.frame_type === "Solar" ? "Óculos Solar UV400" : "Armação de Grau"}
            </span>
            <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs">
              {product.gender || "Unissex"}
            </span>
          </div>

          <div className="w-full max-w-md py-6 relative z-10">
            <FrameArt
              solar={product.frame_type === "Solar"}
              round={product.frame_shape === "Redondo"}
              amber={product.slug.includes("aurora") || (product.slug.includes("solar") && !product.slug.includes("kids"))}
              customColor={
                product.gender === "Infantil"
                  ? product.frame_type === "Solar"
                    ? "#0284c7"
                    : "#2563eb"
                  : undefined
              }
            />
          </div>

          <div className="absolute bottom-5 right-5 text-[10px] font-semibold text-slate-400 tracking-wider">
            ÓTICA VENTARA · ARAÇATUBA-SP
          </div>
        </div>
      )}

      {/* Miniaturas Interativas (caso haja múltiplas fotos cadastradas) */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                activeIdx === idx
                  ? "border-[#FFD62E] shadow-md scale-[1.02]"
                  : "border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={img.alt_text || `${product.name} foto ${idx + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
