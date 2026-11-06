"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import type { OptiSyncGalleryItem } from "@/types/ecommerce";

interface OptiSyncLightboxProps {
  items: OptiSyncGalleryItem[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function OptiSyncLightbox({
  items,
  currentIndex,
  onClose,
  onNavigate,
}: OptiSyncLightboxProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const isOpen = currentIndex !== null && currentIndex >= 0 && currentIndex < items.length;
  const currentItem = isOpen ? items[currentIndex] : null;

  const handleNext = useCallback(() => {
    if (currentIndex === null || items.length === 0) return;
    onNavigate((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, onNavigate]);

  const handlePrev = useCallback(() => {
    if (currentIndex === null || items.length === 0) return;
    onNavigate((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, onNavigate]);

  // Capture previous focus & restore on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus modal or close button on open
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNext();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrev();
        } else if (e.key === "Tab") {
          // Focus trap
          if (!modalRef.current) return;
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !currentItem) return null;

  const lineLabels: Record<string, { label: string; color: string }> = {
    hd: { label: "OPTiSYNC HD", color: "bg-[#0044C9]/80 text-[#F4F6FF] border-[#1E5BFF]/60" },
    photochromic: { label: "Fotossensível", color: "bg-[#7A2CFF]/80 text-[#F4F6FF] border-[#B93DAA]/60" },
    kids: { label: "Kids Adventure", color: "bg-[#FFC21A]/90 text-[#000933] border-[#FFC21A]" },
    geral: { label: "Catálogo", color: "bg-[#000933]/80 text-[#B8C2E6] border-[#0044C9]/40" },
  };

  const lineBadge = lineLabels[currentItem.line] || lineLabels.geral;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={currentItem.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#00051E]/90 backdrop-blur-xl animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Botão Fechar Topo Direito */}
      <button
        ref={closeBtnRef}
        type="button"
        onClick={onClose}
        aria-label="Fechar galeria (Esc)"
        className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-[#000933]/80 border border-[#0044C9]/40 text-[#F4F6FF] hover:text-[#FFC21A] hover:border-[#FFC21A]/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#FFC21A]"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Botão Anterior */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Imagem anterior (Seta esquerda)"
          className="absolute left-3 sm:left-6 z-40 p-3 rounded-full bg-[#000933]/80 border border-[#0044C9]/40 text-[#F4F6FF] hover:text-[#FFC21A] hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-[#0044C9]"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Conteúdo Central */}
      <div className="relative max-w-4xl w-full flex flex-col items-center max-h-[92vh]">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[#0044C9]/50 bg-[#000933] shadow-[0_0_50px_rgba(0,68,201,0.35)] flex items-center justify-center">
          <div className="relative w-full h-[60vh] sm:h-[70vh]">
            <Image
              src={currentItem.imageUrl}
              alt={currentItem.altText || currentItem.title}
              fill
              sizes="(max-width: 768px) 100vw, 900px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Rodapé Informativo da Imagem com Legenda e Contagem */}
        <div className="w-full mt-3 px-4 py-3 rounded-xl bg-[#000933]/85 border border-[#0044C9]/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${lineBadge.color}`}>
                {lineBadge.label}
              </span>
              <h3 className="font-semibold text-[#F4F6FF] text-base">{currentItem.title}</h3>
            </div>
            {currentItem.caption && (
              <p className="text-xs text-[#B8C2E6]">{currentItem.caption}</p>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#8A96C2] self-end sm:self-center">
            <span>
              {currentIndex + 1} de {items.length}
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Esc para fechar · Setas para navegar</span>
          </div>
        </div>
      </div>

      {/* Botão Próximo */}
      {items.length > 1 && (
        <button
          type="button"
          onClick={handleNext}
          aria-label="Próxima imagem (Seta direita)"
          className="absolute right-3 sm:right-6 z-40 p-3 rounded-full bg-[#000933]/80 border border-[#0044C9]/40 text-[#F4F6FF] hover:text-[#FFC21A] hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-[#0044C9]"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
