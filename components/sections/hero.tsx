"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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

function getFullBleedGradient(direction: string, color: string, intensity: number) {
  const solidColor = color || "#02070D";
  const alpha = Math.min(Math.max((intensity || 85) / 100, 0.2), 1);
  switch (direction) {
    case "to-left":
      return `linear-gradient(to right, ${solidColor} 0%, ${solidColor} 34%, rgba(2, 7, 13, ${alpha * 0.92}) 54%, rgba(2, 7, 13, ${alpha * 0.45}) 74%, transparent 96%)`;
    case "to-right":
      return `linear-gradient(to left, ${solidColor} 0%, ${solidColor} 34%, rgba(2, 7, 13, ${alpha * 0.92}) 54%, rgba(2, 7, 13, ${alpha * 0.45}) 74%, transparent 96%)`;
    case "to-bottom":
      return `linear-gradient(to bottom, ${solidColor} 0%, rgba(2, 7, 13, ${alpha * 0.85}) 40%, rgba(2, 7, 13, ${alpha * 0.3}) 75%, ${solidColor} 100%)`;
    case "radial":
      return `radial-gradient(ellipse at 80% 50%, transparent 20%, rgba(2, 7, 13, ${alpha * 0.6}) 60%, ${solidColor} 88%)`;
    default:
      return `linear-gradient(to right, ${solidColor} 0%, ${solidColor} 34%, rgba(2, 7, 13, ${alpha * 0.92}) 54%, transparent 96%)`;
  }
}

function getGradientStyle(direction: string, color: string, intensity: number) {
  const solidColor = color || "#02070D";
  const alpha = Math.min(Math.max((intensity || 85) / 100, 0.2), 1);
  switch (direction) {
    case "to-left":
      return `linear-gradient(to right, ${solidColor} 0%, ${solidColor} 20%, rgba(2, 7, 13, ${alpha * 0.7}) 55%, transparent 100%)`;
    case "to-right":
      return `linear-gradient(to left, ${solidColor} 0%, ${solidColor} 20%, rgba(2, 7, 13, ${alpha * 0.7}) 55%, transparent 100%)`;
    case "to-bottom":
      return `linear-gradient(to bottom, ${solidColor} 0%, rgba(2, 7, 13, ${alpha * 0.4}) 50%, ${solidColor} 100%)`;
    case "radial":
      return `radial-gradient(ellipse at 70% 50%, transparent 20%, rgba(2, 7, 13, ${alpha * 0.7}) 70%, ${solidColor} 100%)`;
    default:
      return `linear-gradient(to right, ${solidColor} 0%, ${solidColor} 25%, transparent 100%)`;
  }
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

  const isFullBleed =
    heroBanner.mode === "fixed_banner" && heroBanner.layoutStyle !== "card_box";

  const computedObjectPosition = useMemo(() => {
    if (heroBanner.backgroundPosition === "custom") {
      const x = heroBanner.customPositionX ?? 80;
      const y = heroBanner.customPositionY ?? 50;
      return `${x}% ${y}%`;
    }
    if (heroBanner.backgroundPosition) {
      return heroBanner.backgroundPosition;
    }
    const x = heroBanner.customPositionX ?? 80;
    const y = heroBanner.customPositionY ?? 50;
    return `${x}% ${y}%`;
  }, [heroBanner.backgroundPosition, heroBanner.customPositionX, heroBanner.customPositionY]);

  return (
    <section className="hero relative overflow-hidden" id="inicio">
      {/* 1. CAMADA DE FUNDO NO DESKTOP (FULL BLEED COM DISSOLVÊNCIA SUAVE À DIREITA) */}
      {isFullBleed && (
        <>
          {/* Visual Desktop: Lado Direito Suave sem Zoom Excessivo */}
          <div
            className={`hidden lg:block absolute inset-y-0 right-0 pointer-events-none z-0 overflow-hidden transition-all duration-700 ${
              heroBanner.desktopWidth === "full_100"
                ? "w-full inset-0"
                : heroBanner.desktopWidth === "wide_65"
                ? "w-[65vw]"
                : "w-[54vw]"
            }`}
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, black 24%, black 88%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 24%, black 88%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
          >
            <img
              src={heroBanner.bannerImageUrl || "/images/lifestyle/female-grau.jpg"}
              alt={heroBanner.badgeTag || "Banner Ventara Eyewear"}
              className="w-full h-full object-cover transition-all duration-700 ease-out"
              style={{
                objectPosition: computedObjectPosition,
                transform: `scale(${(heroBanner.desktopZoom ?? 100) / 100})`,
                opacity: (heroBanner.bannerOpacity ?? 100) / 100,
              }}
            />

            {/* Degradê Horizontal com Cobertura do Texto */}
            <div
              className="absolute inset-0 transition-all duration-300"
              style={{
                background: getFullBleedGradient(
                  heroBanner.gradientDirection,
                  heroBanner.gradientColor,
                  heroBanner.gradientIntensity
                ),
              }}
            />
          </div>

          {/* Vignettes Superior e Inferior para Integração Perfeita */}
          <div className="hidden lg:block absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#02070D] via-[#02070D]/80 to-transparent pointer-events-none" />
          <div className="hidden lg:block absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#02070D] via-[#02070D]/80 to-transparent pointer-events-none" />
        </>
      )}

      {/* Container Unificado Padrão UI/UX Ampliado - Respiro Generoso abaixo do Header Fixo */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 w-full pt-32 sm:pt-36 lg:pt-40 pb-6 sm:pb-12 relative z-10 flex flex-col justify-between flex-1 min-h-0 sm:min-h-[720px]">
        {/* Grid de 2 Colunas Perfeitamente Margeado */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1 my-auto">
          {/* Coluna Esquerda: Texto */}
          <div className="hero-copy lg:col-span-6 relative z-10 max-w-xl">
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
              <Link
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FFD62E] hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-400/25 transition-all group cursor-pointer"
                href={heroBanner.primaryButtonLink || "/lentes"}
              >
                <span>{heroBanner.primaryButtonText || "Catálogo de Lentes"}</span>
                <ArrowRight size={16} className="text-slate-950 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-amber-400/60 shadow-md transition-all cursor-pointer"
                href={heroBanner.secondaryButtonLink || "#armacoes"}
              >
                {heroBanner.secondaryButtonText || "Ver armações"}
              </a>
            </div>

            <span className="hero-footnote block text-[11px] text-slate-400 mt-6 tracking-wide">
              {identity.store_name} · {fullAddress}
            </span>

            {/* Showcase Visual no Mobile (Sem sobreposição estranha no texto, perfeitamente responsivo) */}
            {heroBanner.mode === "fixed_banner" && isFullBleed && (
              <div className="lg:hidden mt-6 w-full">
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-amber-400/30 shadow-2xl bg-[#040c16] group">
                  <img
                    src={heroBanner.bannerImageUrl || "/images/lifestyle/female-grau.jpg"}
                    alt={heroBanner.badgeTag || "Banner Ventara Eyewear"}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    style={{
                      objectPosition: computedObjectPosition,
                      opacity: (heroBanner.bannerOpacity ?? 100) / 100,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#02070D] via-transparent to-transparent opacity-80 pointer-events-none" />
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-400/40">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300">
                      {heroBanner.badgeTag || "ARMAÇÕES DE QUALIDADE"}
                    </span>
                  </div>
                  {heroBanner.badgeSubtitle && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
                      <Link
                        href="/catalogo"
                        className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-white/10 text-amber-300 text-[10px] font-semibold shadow-lg"
                      >
                        <span className="truncate">{heroBanner.badgeSubtitle}</span>
                        <ArrowRight size={12} className="shrink-0 text-amber-400" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Coluna Direita: Banner Fixo Estilizado com Degradê ou Stage 3D */}
          {heroBanner.mode === "fixed_banner" ? (
            isFullBleed ? (
              /* Modo Fundo Inteiro (Full Bleed - Sem Caixa) */
              <div className="hero-stage lg:col-span-6 relative flex flex-col items-end justify-between min-h-[340px] sm:min-h-[480px] py-4 pointer-events-none">
                {/* Badge Vertical Dourado */}
                <div className="hero-side-badge hidden sm:flex items-center gap-3 self-end pointer-events-auto">
                  <div className="w-[2px] h-12 bg-[#FFD62E] shadow-[0_0_12px_#FFD62E]" />
                  <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-200 leading-tight drop-shadow-md">
                    {heroBanner.badgeTag || "ARMAÇÕES DE QUALIDADE E ESTILO"}
                  </span>
                </div>

                {/* Pill Flutuante de Coleção com Link para o Catálogo */}
                {heroBanner.badgeSubtitle && (
                  <div className="self-end pointer-events-auto">
                    <Link
                      href="/catalogo"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-950/85 hover:bg-slate-900 backdrop-blur-md border border-amber-400/40 text-amber-300 hover:text-amber-200 text-xs font-semibold shadow-2xl transition-all hover:scale-105"
                    >
                      <Sparkles size={13} className="text-amber-400" />
                      <span>{heroBanner.badgeSubtitle}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              /* Modo Card / Caixa Flutuante */
              <div className="hero-stage lg:col-span-6 relative flex items-center justify-center min-h-[380px] sm:min-h-[520px] rounded-3xl overflow-hidden group border border-white/5 shadow-2xl">
                {/* Imagem do Banner Fixo com Zoom Suave no Hover */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    src={heroBanner.bannerImageUrl || "/images/lifestyle/female-grau.jpg"}
                    alt={heroBanner.badgeTag || "Banner Ventara Eyewear"}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{ objectPosition: computedObjectPosition }}
                  />
                </div>

                {/* Degradê Customizável Configurado no Admin */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={{
                    background: getGradientStyle(
                      heroBanner.gradientDirection,
                      heroBanner.gradientColor,
                      heroBanner.gradientIntensity
                    ),
                  }}
                />

                {/* Degradê Superior e Inferior para Integração Perfeita */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#02070D] to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#02070D] to-transparent pointer-events-none" />

                {/* Badge Vertical Dourado Conforme Referência */}
                <div className="hero-side-badge hidden sm:flex items-center gap-3 absolute top-6 right-6 z-20">
                  <div className="w-[2px] h-12 bg-[#FFD62E] shadow-[0_0_12px_#FFD62E]" />
                  <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-slate-200 leading-tight drop-shadow-md">
                    {heroBanner.badgeTag || "ARMAÇÕES DE QUALIDADE E ESTILO"}
                  </span>
                </div>

                {/* Pill Flutuante de Coleção com Link para o Catálogo */}
                <div className="absolute bottom-6 right-6 z-20">
                  <Link
                    href="/catalogo"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/85 hover:bg-slate-900 backdrop-blur-md border border-amber-400/40 text-amber-300 hover:text-amber-200 text-xs font-semibold shadow-2xl transition-all"
                  >
                    <Sparkles size={13} className="text-amber-400" />
                    <span>{heroBanner.badgeSubtitle || "Curadoria Autoral Ventara · Acetato Premium"}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )
          ) : (
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
          )}
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
