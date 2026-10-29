"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Clock,
  Award,
} from "lucide-react";
import { FrameArt } from "../catalog/frame-art";
import { WordsStagger } from "@/registry/spell-ui/words-stagger";
import { HighlightedText } from "@/registry/spell-ui/highlighted-text";
import { Product, HeroBannerSettings } from "@/types/ecommerce";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { DEFAULT_HERO_BANNER } from "@/lib/site-settings-constants";
import { useSiteSettings } from "@/components/providers/site-settings-provider";

interface HeroProps {
  products?: Product[];
}

export function Hero({ products }: HeroProps) {
  const { identity, fullAddress } = useSiteSettings();
  const [heroBanner, setHeroBanner] = useState<HeroBannerSettings>(DEFAULT_HERO_BANNER);

  useEffect(() => {
    async function loadHeroSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.hero_banner) {
            setHeroBanner((prev) => ({ ...prev, ...data.hero_banner }));
          }
        }
      } catch {}
    }
    loadHeroSettings();
  }, []);

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

  const bannerImageSrc =
    heroBanner.bannerImageUrl || "/images/hero/ventara-safari-complete.jpg";

  return (
    <section
      className="hero relative overflow-hidden bg-[#02070D] min-h-[100svh] lg:min-h-[760px] flex flex-col justify-between"
      id="inicio"
    >
      {/* 1. ATMOSFERA & ILUMINAÇÃO ESTÚDIO APPLE-STYLE */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Glow Dourado Ambiente no Lado Direito */}
        <div className="absolute top-1/4 right-[5%] w-[550px] h-[550px] rounded-full bg-amber-400/[0.07] blur-[140px]" />
        {/* Glow Ciano Suave no Topo/Centro */}
        <div className="absolute top-10 left-1/3 w-[450px] h-[350px] rounded-full bg-sky-500/[0.05] blur-[120px]" />
        {/* Vignettes de Borda para Integração com o Header e Seção Seguinte */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#02070D] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#02070D] to-transparent" />
      </div>

      {/* 2. CONTAINER PRINCIPAL UNIFICADO */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 w-full pt-28 sm:pt-36 lg:pt-40 pb-8 relative z-10 flex flex-col justify-between flex-1">
        {/* Grid de 2 Colunas Perfeitamente Margeado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center flex-1 my-auto">
          {/* ==================== COLUNA ESQUERDA: TEXTO & CONVERSÃO ==================== */}
          <div className="hero-copy lg:col-span-6 relative z-10 max-w-xl">
            {/* Eyebrow Pill com Pulso */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD62E] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-amber-400">
                QUALIDADE QUE VOCÊ VÊ
              </span>
            </div>

            {/* Título Principal Tipografia Óptica */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-[1.12]">
              Mais que óculos,
              <br />
              é sobre{" "}
              <HighlightedText
                delay={0.4}
                from="left"
                className="font-normal"
                highlightClassName="bg-[#FFD62E] rounded-[0.2em] shadow-sm"
                textClassName="text-[#02070D] font-semibold"
              >
                você.
              </HighlightedText>
            </h1>

            {/* Subtítulo Descritivo com Alto Contraste */}
            <div className="hero-description my-4">
              <WordsStagger
                delay={0.2}
                duration={0.35}
                stagger={0.03}
                className="text-sm sm:text-base leading-relaxed text-slate-300 font-normal"
              >
                Na Óticas Ventara, unimos tecnologia de precisão, curadoria autoral em acetato nobre e laboratório próprio para cuidar da sua visão em todos os momentos.
              </WordsStagger>
            </div>

            {/* CTAs com Feedback Tátil (Apple-Grade active:scale-97) */}
            <div className="hero-cta-wrapper flex flex-wrap items-center gap-3.5 mt-6">
              <Link
                href={heroBanner.primaryButtonLink || "/lentes"}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#FFD62E] hover:bg-amber-300 active:scale-[0.97] text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-400/25 transition-all duration-150 ease-out cursor-pointer group"
                style={{ touchAction: "manipulation" }}
              >
                <span>{heroBanner.primaryButtonText || "Catálogo de Lentes"}</span>
                <ArrowRight
                  size={16}
                  className="text-slate-950 transform group-hover:translate-x-1 transition-transform"
                />
              </Link>

              <a
                href={heroBanner.secondaryButtonLink || "#armacoes"}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-slate-900/80 hover:bg-slate-800 active:scale-[0.97] text-white font-semibold text-xs sm:text-sm border border-white/10 hover:border-amber-400/50 shadow-md backdrop-blur-md transition-all duration-150 ease-out cursor-pointer"
                style={{ touchAction: "manipulation" }}
              >
                <span>{heroBanner.secondaryButtonText || "Ver armações"}</span>
              </a>
            </div>

            {/* Diferenciais de Confiança da Marca (Emil Kowalski Trust Markers) */}
            <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/10 max-w-lg">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400 shrink-0" />
                  Lab Próprio
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Araçatuba-SP</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Clock size={12} className="text-amber-400 shrink-0" />
                  Pronto em 1h
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Montagem Express</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-amber-400 shrink-0" />
                  100% Autoral
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Acetato Nobre</span>
              </div>
            </div>

            {/* Endereço Físico Discreto */}
            <span className="hero-footnote block text-[11px] text-slate-400 mt-4 tracking-wide">
              {identity.store_name} · {fullAddress}
            </span>
          </div>

          {/* ==================== COLUNA DIREITA: VITRINE ATELIER ==================== */}
          <div className="hero-stage lg:col-span-6 relative flex items-center justify-center w-full">
            {heroBanner.mode === "carousel_3d" ? (
              /* MODO CARROSSEL 3D ORIGINAL COM PEDESTAL */
              <div
                className="relative w-full flex items-center justify-center min-h-[360px] sm:min-h-[460px]"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className="beam" aria-hidden="true" />

                {/* Badge Vertical Dourado */}
                <div className="hero-side-badge hidden sm:flex items-center gap-3 absolute top-2 right-4 z-20">
                  <div className="w-[2px] h-12 bg-[#FFD62E] shadow-[0_0_12px_#FFD62E]" />
                  <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-300 leading-tight">
                    ARMAÇÕES<br />DE QUALIDADE<br />E ESTILO
                  </span>
                </div>

                {/* Armação no Pedestal */}
                <div className="hero-frame-anim relative z-10 w-full max-w-[500px] mx-auto min-h-[220px] sm:min-h-[260px] flex items-center justify-center">
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

                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06111f]/85 backdrop-blur-md border border-amber-400/40 text-amber-400 text-[11px] font-medium shadow-lg hover:border-amber-400 transition-all">
                          <span>{currentProduct?.name}</span>
                          <span className="text-white/80 font-normal">· {formattedPrice}</span>
                          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="pedestal" aria-hidden="true" />

                {/* Paginação do Carrossel */}
                <div className="hero-stage-pagination flex items-center gap-4 absolute bottom-2 right-4 z-20">
                  <span className="text-[11px] font-mono text-slate-400 tracking-wider">
                    <strong className="text-white">{currentNumberStr}</strong> / {totalNumberStr}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Modelo anterior"
                      className="w-8 h-8 rounded-full border border-white/20 bg-[#06111f]/70 hover:bg-white/20 active:scale-90 flex items-center justify-center hover:text-white transition-all shadow-md focus:outline-none"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Próximo modelo"
                      className="w-8 h-8 rounded-full border border-white/20 bg-[#06111f]/70 hover:bg-white/20 active:scale-90 flex items-center justify-center hover:text-white transition-all shadow-md focus:outline-none"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* MODO ATELIER SHOWCASE DE LUXO (PROPORÇÃO PERFEITA, ÓCULOS INTEIRO, ZERO ZOOM EXCESSIVO) */
              <div className="relative w-full max-w-[560px] mx-auto group">
                {/* Glow de Borda Estilo Apple Pro */}
                <div className="absolute -inset-1 rounded-[2.2rem] sm:rounded-[2.7rem] bg-gradient-to-r from-amber-400/20 via-sky-500/10 to-amber-400/20 opacity-70 blur-xl group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Card Vitrine de Vidro e Acetato */}
                <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-amber-400/25 bg-gradient-to-b from-[#091524] via-[#050e1a] to-[#02070d] shadow-2xl">
                  {/* Foto da Armação Completa com Reflexo */}
                  <img
                    src={bannerImageSrc}
                    alt={heroBanner.badgeTag || "Óticas Ventara Eyewear"}
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    style={{
                      opacity: (heroBanner.bannerOpacity ?? 100) / 100,
                    }}
                  />

                  {/* Vinhetas Suaves de Iluminação Estúdio */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02070D]/90 via-transparent to-black/30 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#02070D]/30 via-transparent to-transparent pointer-events-none" />

                  {/* Badge Superior Direito */}
                  <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/30 shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      {heroBanner.badgeTag || "ARMAÇÕES DE QUALIDADE E ESTILO"}
                    </span>
                  </div>

                  {/* Chip de Disponibilidade (Inferior Esquerdo) */}
                  <div className="absolute bottom-3.5 left-3.5 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Em Estoque · Envio Imediato</span>
                  </div>

                  {/* Pill Flutuante de Coleção com Link para o Catálogo (Inferior Direito) */}
                  {heroBanner.badgeSubtitle && (
                    <div className="absolute bottom-3.5 right-3.5 left-3.5 sm:left-auto z-10">
                      <Link
                        href="/catalogo"
                        className="flex items-center justify-between gap-2.5 px-4 py-2 rounded-xl sm:rounded-full bg-slate-950/90 hover:bg-slate-900 active:scale-[0.97] backdrop-blur-md border border-white/15 hover:border-amber-400/50 text-amber-300 hover:text-amber-200 text-xs font-semibold shadow-xl transition-all duration-150"
                        style={{ touchAction: "manipulation" }}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <Sparkles size={13} className="text-amber-400 shrink-0" />
                          <span className="truncate">{heroBanner.badgeSubtitle}</span>
                        </div>
                        <ArrowRight size={13} className="text-amber-400 shrink-0" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==================== BARRA INFERIOR RIGOROSAMENTE MARGEADA ==================== */}
        <div className="hero-bottom pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-[10px] tracking-widest text-slate-400">
          <span>ESTILO · PRESENÇA · IDENTIDADE</span>
          <a
            href="#sobre-nos"
            aria-label="Conhecer a Ótica Ventara"
            className="hero-explore-link flex items-center gap-2 hover:text-[#FFD62E] transition-colors"
          >
            <span>EXPLORE A VENTARA</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
