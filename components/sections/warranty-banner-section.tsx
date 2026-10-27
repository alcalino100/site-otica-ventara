"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { useSiteSettings } from "../providers/site-settings-provider";

export function WarrantyBannerSection() {
  const { cleanWhatsAppNumber } = useSiteSettings();
  const [bannerImages, setBannerImages] = useState({
    desktop: "/images/banners/optisync-12-meses-garantia-desktop.jpg",
    mobile: "/images/banners/optisync-12-meses-garantia-desktop.jpg",
  });

  useEffect(() => {
    async function loadBannerSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.showcase_media) {
            setBannerImages({
              desktop: data.showcase_media.warrantyBannerDesktop || "/images/banners/optisync-12-meses-garantia-desktop.jpg",
              mobile: data.showcase_media.warrantyBannerMobile || "/images/banners/optisync-12-meses-garantia-desktop.jpg",
            });
          }
        }
      } catch (err) {}
    }
    loadBannerSettings();
  }, []);

  const whatsappUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    "Olá! Vi o banner de 12 meses de garantia nas Lentes OPTiSYNC HD e gostaria de consultar valores para o meu grau."
  )}`;

  return (
    <section
      aria-label="Garantia de 12 Meses OPTiSYNC HD"
      className="bg-[#040c16] border-t border-b border-white/10 py-6 sm:py-10 relative z-20 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E8C765]/40 hover:border-[#FFD62E] shadow-2xl transition-all duration-300 transform hover:scale-[1.005]"
          aria-label="Lentes com 12 meses de garantia OptiSync HD - Fale com nossos consultores"
        >
          {/* Banner Desktop e Tablet */}
          <div className="hidden sm:block relative aspect-[3/1] w-full overflow-hidden bg-[#07192c]">
            <img
              src={bannerImages.desktop}
              alt="Lentes com 12 Meses de Garantia OPTiSYNC HD - Fale com nossos consultores"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Overlay sutil com brilho dourado no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-amber-400/[0.08] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>

          {/* Banner Mobile: Mesmo banner oficial do desktop com proporção perfeita e máxima legibilidade */}
          <div className="block sm:hidden relative w-full overflow-hidden bg-[#07192c]">
            <div className="relative aspect-[2.4/1] w-full overflow-hidden">
              <img
                src={bannerImages.mobile}
                alt="Lentes com 12 Meses de Garantia OPTiSYNC HD - Fale com nossos consultores"
                className="w-full h-full object-cover object-center"
              />
            </div>
            {/* Barra de Ação Mobile Integrada com WhatsApp */}
            <div className="p-3 bg-gradient-to-r from-[#07192c] to-[#040e1b] border-t border-amber-400/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-semibold truncate">
                <ShieldCheck size={14} className="text-amber-400 shrink-0" />
                <span className="truncate">12 Meses de Garantia Oficial</span>
              </div>
              <span className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0 shadow-md">
                <MessageSquare size={12} className="text-slate-950 shrink-0" />
                <span>Consultar</span>
              </span>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}
