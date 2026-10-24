"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { FrameArt } from "../catalog/frame-art";
import { WordsStagger } from "@/registry/spell-ui/words-stagger";
import { HighlightedText } from "@/registry/spell-ui/highlighted-text";
import { Product } from "@/types/ecommerce";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { useSiteSettings } from "@/components/providers/site-settings-provider";

interface HeroProps {
  products?: Product[];
}

export function Hero({ products }: HeroProps) {
  const { identity, fullAddress } = useSiteSettings();

  // Filtra as armações marcadas como destaque (is_featured) no Admin
  const featuredProducts = useMemo(() => {
    if (products && products.length > 0) {
      const featured = products.filter((p) => p.is_featured && p.is_published);
      if (featured.length > 0) return featured;
      return products.filter((p) => p.is_published).slice(0, 4);
    }
    const defaultFeatured = DEFAULT_CATALOG.filter((p) => p.is_featured && p.is_published);
    return defaultFeatured.length > 0 ? defaultFeatured : DEFAULT_CATALOG.slice(0, 4);
  }, [products]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = featuredProducts.length;

  // Auto-play suave a cada 5 segundos com pausa ao passar o mouse
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, total]);

  // Mantém o índice dentro dos limites caso a lista mude no Admin
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const currentProduct = featuredProducts[currentIndex] || featuredProducts[0];
  const primaryImage =
    currentProduct?.images?.find((img) => img.is_primary)?.url ||
    currentProduct?.images?.[0]?.url;

  const currentNumberStr = String(currentIndex + 1).padStart(2, "0");
  const totalNumberStr = String(total).padStart(2, "0");

  const formattedPrice = ((currentProduct?.price_in_cents || 38900) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <section className="hero relative overflow-hidden" id="inicio">
      {/* Container Unificado Padrão UI/UX Ampliado - Ajuste Mobile Rente e Equilibrado */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 w-full pt-20 sm:pt-36 lg:pt-40 pb-6 sm:pb-12 relative z-10 flex flex-col justify-between flex-1 min-h-0 sm:min-h-[720px]">
        {/* Grid de 2 Colunas Perfeitamente Margeado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1 my-auto">
          {/* Coluna Esquerda: Texto */}
          <div className="hero-copy lg:col-span-5 relative z-10 max-w-xl">
            <p className="eyebrow flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD62E] inline-block animate-pulse" />
              QUALIDADE QUE VOCÊ VÊ
            </p>

            <h1 className="text-3xl sm:text-6xl font-light text-white tracking-tight leading-[1.15]">
              Mais que óculos,<br />
              é sobre{" "}
              <HighlightedText
                delay={0.4}
                from="left"
                className="font-normal"
                highlightClassName="bg-[#FFD62E] rounded-[0.16em] shadow-sm"
                textClassName="text-[#02070D] font-medium"
              >
                você.
              </HighlightedText>
            </h1>

            <div className="hero-description my-4">
              <WordsStagger
                delay={0.2}
                duration={0.35}
                stagger={0.03}
                className="text-sm sm:text-base leading-relaxed text-slate-300"
              >
                Na Óticas Ventara, unimos tecnologia, qualidade e atendimento especializado para cuidar da sua visão em todos os momentos.
              </WordsStagger>
            </div>

            <div className="hero-cta-wrapper flex flex-wrap items-center gap-4 mt-6">
              <a className="button outline hover:border-[#FFD62E] group" href="#loja-fisica">
                <span>Conheça nossa loja</span>
                <ArrowRight size={16} className="text-[#FFD62E] transform group-hover:translate-x-1 transition-transform" />
              </a>
              <a className="button dark" href="#armacoes">
                Ver armações
              </a>
            </div>

            <span className="hero-footnote block text-[11px] text-slate-400 mt-6 tracking-wide">
              {identity.store_name} · {fullAddress}
            </span>
          </div>

          {/* Coluna Direita: Stage e Pedestal Alinhados */}
          <div
            className="hero-stage lg:col-span-7 relative flex items-center justify-center min-h-[380px] sm:min-h-[480px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Feixes Volumétricos de Luz Azul */}
            <div className="beam" aria-hidden="true" />

            {/* Badge Vertical Dourado Conforme Referência */}
            <div className="hero-side-badge hidden sm:flex items-center gap-3 absolute top-2 right-4 z-20">
              <div className="w-[2px] h-12 bg-[#FFD62E] shadow-[0_0_12px_#FFD62E]" />
              <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-300 leading-tight">
                ARMAÇÕES<br />DE QUALIDADE<br />E ESTILO
              </span>
            </div>

            {/* Armação de Destaque Flutuante no Pedestal com Transição Animada */}
            <div className="hero-frame-anim relative z-10 w-full max-w-[540px] mx-auto min-h-[220px] sm:min-h-[280px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProduct?.id || currentIndex}
                  initial={{ opacity: 0, scale: 0.92, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full flex flex-col items-center justify-center group"
                >
                  <Link
                    href={`/produto/${currentProduct?.slug || "ventara-essencial"}`}
                    className="block w-full text-center relative focus:outline-none"
                    aria-label={`Ver modelo ${currentProduct?.name}`}
                  >
                    {primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={currentProduct?.name || "Armação Ventara"}
                        className="w-full max-h-[240px] sm:max-h-[280px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.65)] group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <FrameArt
                        hero
                        solar={currentProduct?.frame_type === "Solar"}
                        round={currentProduct?.frame_shape === "Redondo"}
                        amber={
                          currentProduct?.slug.includes("aurora") ||
                          (currentProduct?.slug.includes("solar") && !currentProduct?.slug.includes("kids"))
                        }
                        customColor={
                          currentProduct?.gender === "Infantil"
                            ? currentProduct?.frame_type === "Solar"
                              ? "#0284c7"
                              : "#2563eb"
                            : currentProduct?.variants?.[0]?.color_hex || undefined
                        }
                      />
                    )}

                    {/* Pill interativo com nome e valor */}
                    <div className="mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06111f]/85 backdrop-blur-md border border-amber-400/40 text-amber-400 text-[11px] font-medium shadow-lg hover:border-amber-400 transition-all">
                      <span>{currentProduct?.name}</span>
                      <span className="text-white/80 font-normal">· {formattedPrice}</span>
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pedestal Cilíndrico com Anel Neon Cyan/Azul */}
            <div className="pedestal" aria-hidden="true" />

            {/* Paginação Estilo Mockup da Campanha (01 / 04) - Totalmente Interativa */}
            <div className="hero-stage-pagination flex items-center gap-4 absolute bottom-2 right-4 z-20">
              <span className="text-[11px] font-mono text-slate-400 tracking-wider">
                <strong className="text-white">{currentNumberStr}</strong> / {totalNumberStr}
              </span>
              <div className="flex items-center gap-1.5 text-slate-400">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Modelo anterior"
                  className="w-8 h-8 rounded-full border border-white/20 bg-[#06111f]/70 hover:bg-white/20 active:scale-90 flex items-center justify-center hover:text-white transition-all shadow-md focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Próximo modelo"
                  className="w-8 h-8 rounded-full border border-white/20 bg-[#06111f]/70 hover:bg-white/20 active:scale-90 flex items-center justify-center hover:text-white transition-all shadow-md focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Label Dinâmico com Material e Coleção */}
            <span className="art-label absolute bottom-14 right-4 text-[9px] text-slate-400 tracking-wider hidden sm:block">
              CURADORIA AUTORAL VENTARA · {currentProduct?.frame_material?.toUpperCase() || "ACETATO NOBRE"}
            </span>
          </div>
        </div>

        {/* Barra Inferior Rigorosamente Margeada no Mesmo Container */}
        <div className="hero-bottom pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[10px] tracking-widest text-slate-400">
          <span>ESTILO · PRESENÇA · IDENTIDADE</span>
          <a href="#sobre-nos" aria-label="Conhecer a Ótica Ventara" className="hero-explore-link flex items-center gap-2 hover:text-[#FFD62E] transition-colors">
            <span>EXPLORE A VENTARA</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
