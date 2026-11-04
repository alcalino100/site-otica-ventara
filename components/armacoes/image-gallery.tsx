"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Product } from "@/types/ecommerce";
import { FrameArt } from "@/components/catalog/frame-art";

interface ImageGalleryProps {
  product: Product;
}

export function ImageGallery({ product }: ImageGalleryProps) {
  const images = product.images && product.images.length > 0 ? product.images : [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeImage = images[selectedIndex]?.url || images[0]?.url;

  return (
    <div className="space-y-4">
      {/* Imagem Principal em Destaque */}
      <div className="relative aspect-square w-full rounded-3xl bg-[#06111f] border border-white/10 overflow-hidden flex items-center justify-center p-6 group">
        {activeImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={activeImage}
            alt={product.name}
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full max-w-[280px]">
            <FrameArt
              solar={product.frame_type === "Solar"}
              amber={product.slug.includes("safari") || product.slug.includes("onca")}
              round={product.frame_shape === "Redondo"}
            />
          </div>
        )}
      </div>

      {/* Miniaturas de Fotos */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-20 rounded-2xl bg-[#06111f] border p-2 shrink-0 transition-all cursor-pointer overflow-hidden ${
                selectedIndex === idx
                  ? "border-amber-400 ring-2 ring-amber-400/30 scale-102"
                  : "border-white/10 hover:border-white/20 opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={`${product.name} foto ${idx + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
