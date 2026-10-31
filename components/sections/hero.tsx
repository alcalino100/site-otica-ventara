"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { WordsStagger } from "@/registry/spell-ui/words-stagger";
import { HighlightedText } from "@/registry/spell-ui/highlighted-text";
import {
  Product,
  HeroSlide,
  HeroCarouselSettings,
  HeroFocalPoint,
} from "@/types/ecommerce";
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_HERO_SETTINGS,
} from "@/lib/site-settings-constants";
import { useSiteSettings } from "@/components/providers/site-settings-provider";

interface HeroProps {
  products?: Product[];
}

export function Hero({ products }: HeroProps) {
  const { identity, fullAddress } = useSiteSettings();
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [settings, setSettings] = useState<HeroCarouselSettings>(DEFAULT_HERO_SETTINGS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Carrega slides e configurações do endpoint /api/hero
  useEffect(() => {
    let isMounted = true;
    async function loadHeroData() {
      try {
        const res = await fetch("/api/hero", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.slides && Array.isArray(data.slides) && data.slides.length > 0) {
              setSlides(data.slides);
            }
            if (data.settings) {
              setSettings((prev) => ({ ...prev, ...data.settings }));
            }
          }
        }
      } catch (err) {
        console.warn("Fallback de hero ativado:", err);
      }
    }
    loadHeroData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Detecta acessibilidade prefers-reduced-motion e breakpoint mobile
  useEffect(() => {
    if (typeof window === "undefined") return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    motionQuery.addEventListener("change", handleMotionChange);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Filtra apenas slides ativos
  const activeSlides = useMemo(() => {
    const active = slides.filter((s) => s.is_active);
    return active.length > 0 ? active : DEFAULT_HERO_SLIDES;
  }, [slides]);

  const total = activeSlides.length;
  const isMultiSlide = total > 1;

  // Ajusta currentIndex caso a lista mude
  useEffect(() => {
    if (currentIndex >= total && total > 0) {
      setCurrentIndex(0);
    }
  }, [total, currentIndex]);

  // Autoplay inteligente com respeito a pause_on_hover e prefers-reduced-motion
  useEffect(() => {
    if (
      !isMultiSlide ||
      !settings.autoplay ||
      isPaused ||
      prefersReducedMotion
    ) {
      return;
    }

    const intervalTime = Math.max(settings.interval_ms || 5000, 2000);
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isMultiSlide, settings.autoplay, settings.interval_ms, isPaused, prefersReducedMotion, total]);

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + total) % total);
    },
    [total]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % total);
    },
    [total]
  );

  const currentSlide: HeroSlide = activeSlides[currentIndex] || activeSlides[0];

  // Helper para calcular o object-position a partir do focal point
  const getObjectPosition = (
    focalPoint: HeroFocalPoint,
    customX = 50,
    customY = 50
  ): string => {
    switch (focalPoint) {
      case "top":
        return "center top";
      case "bottom":
        return "center bottom";
      case "left":
        return "left center";
      case "right":
        return "right center";
      case "custom":
        return `${customX}% ${customY}%`;
      case "center":
      default:
        return "center center";
    }
  };

  const desktopPosition = getObjectPosition(
    currentSlide.focal_point_desktop || "center",
    currentSlide.custom_position_x,
    currentSlide.custom_position_y
  );

  // No mobile, enquadramento centralizado e nítido do óculos sem distorção
  const mobileFocal = currentSlide.focal_point_mobile || "center";
  const mobilePosition = getObjectPosition(
    mobileFocal,
    currentSlide.custom_position_x ?? 50,
    currentSlide.custom_position_y ?? 50
  );

  // Calcula cor e opacidade do overlay
  const overlayColor = currentSlide.overlay_color || "#02070D";
  const rawIntensity = currentSlide.overlay_intensity ?? 75;

  // Se o modo "Mostrar somente a foto" estiver ativo, reduz o overlay a uma vinheta bem sutil
  const overlayOpacity = currentSlide.show_only_photo
    ? 0.08
    : Math.max(0, Math.min(100, rawIntensity)) / 100;

  // Overlay com comportamento diferenciado no mobile (gradiente vertical denso no topo e transparente na metade inferior)
  const desktopGradient = `
    linear-gradient(to right, ${overlayColor} 0%, ${overlayColor}F2 32%, ${overlayColor}B3 55%, ${overlayColor}40 85%, transparent 100%),
    linear-gradient(to top, ${overlayColor} 0%, ${overlayColor}E6 18%, transparent 60%),
    linear-gradient(to bottom, ${overlayColor} 0%, transparent 22%)
  `;

  const mobileGradient = `
    linear-gradient(to bottom, ${overlayColor} 0%, ${overlayColor}F2 36%, ${overlayColor}D9 52%, ${overlayColor}4D 70%, ${overlayColor}14 86%, transparent 100%),
    linear-gradient(to top, ${overlayColor} 0%, ${overlayColor}99 12%, transparent 35%)
  `;

  // Configurações do Selo de Pagamento Seguro Mercado Pago
  const showSecureBadge =
    settings.show_secure_badge !== false &&
    !currentSlide.show_only_photo;

  const secureBadgeText =
    settings.secure_badge_text ||
    currentSlide.secure_badge_text ||
    "Compra segura com Mercado Pago";

  // Decide transição de acordo com as preferências e configurações
  const transitionType = prefersReducedMotion ? "none" : settings.transition_type || "fade";

  const slideAnimationVariants = {
    initial: {
      opacity: transitionType === "none" ? 1 : 0,
      x: transitionType === "slide" ? (isMobile ? 20 : 40) : 0,
      y: transitionType === "fade" ? (isMobile ? 8 : 0) : 0,
      scale: transitionType === "fade" ? (isMobile ? 1 : 1.03) : 1,
    },
    animate: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : isMobile ? 0.35 : 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
    exit: {
      opacity: transitionType === "none" ? 1 : 0,
      x: transitionType === "slide" ? (isMobile ? -20 : -40) : 0,
      y: 0,
      scale: transitionType === "fade" ? (isMobile ? 1 : 0.98) : 1,
      transition: {
        duration: prefersReducedMotion ? 0 : isMobile ? 0.25 : 0.45,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const imageSrc =
    isMobile && currentSlide.image_url_mobile
      ? currentSlide.image_url_mobile
      : currentSlide.image_url_desktop;

  const currentNumberStr = String(currentIndex + 1).padStart(2, "0");
  const totalNumberStr = String(total).padStart(2, "0");

  return (
    <section
      className="hero relative overflow-hidden bg-[#02070D] min-h-fit lg:min-h-[780px] flex flex-col justify-between select-none"
      id="inicio"
      onMouseEnter={() => settings.pause_on_hover && setIsPaused(true)}
      onMouseLeave={() => settings.pause_on_hover && setIsPaused(false)}
      data-testid="hero-section"
    >
      {/* =================================================================== */}
      {/* 1. ZONA DE IMAGEM: IN-FLOW NA BASE NO MOBILE (ORDER-2), FULL-BLEED NO DESKTOP */}
      {/* =================================================================== */}
      <div
        className="order-2 lg:order-none relative lg:absolute lg:inset-0 z-0 w-full aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-full overflow-hidden select-none"
        style={{
          WebkitMaskImage: isMobile
            ? "linear-gradient(to bottom, transparent 0%, black clamp(32px, 10vw, 64px), black 100%)"
            : undefined,
          maskImage: isMobile
            ? "linear-gradient(to bottom, transparent 0%, black clamp(32px, 10vw, 64px), black 100%)"
            : undefined,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id || currentIndex}
            variants={slideAnimationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={imageSrc}
              alt={currentSlide.alt_text || "Ótica Ventara"}
              fill
              priority={currentIndex === 0}
              quality={90}
              sizes="100vw"
              className={`transition-all duration-700 ease-out ${
                currentSlide.fit_mode === "contain"
                  ? "object-contain"
                  : "object-cover"
              }`}
              style={{
                objectPosition: isMobile ? mobilePosition : desktopPosition,
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* OVERLAYS */}
        {/* Mobile: gradiente sutil na base para integrar com a seção seguinte */}
        <div className="block lg:hidden absolute inset-0 pointer-events-none z-1 bg-gradient-to-t from-[#02070D]/40 via-transparent to-transparent" />

        {/* Desktop: Overlay gradiente cinematográfico Ventara */}
        <div
          className="hidden lg:block absolute inset-0 transition-opacity duration-700 ease-out pointer-events-none z-1"
          style={{
            opacity: overlayOpacity,
            background: desktopGradient,
          }}
        />

        {/* Desktop: Glows de Identidade da Marca */}
        {!currentSlide.show_only_photo && (
          <div className="hidden lg:block">
            <div className="absolute top-1/4 right-[8%] w-[500px] h-[500px] rounded-full bg-amber-400/[0.05] blur-[150px] pointer-events-none" />
            <div className="absolute top-12 left-1/4 w-[450px] h-[350px] rounded-full bg-sky-500/[0.04] blur-[130px] pointer-events-none" />
          </div>
        )}

        {/* Mobile: Badge de Estoque sobre o óculos */}
        {isMobile && !currentSlide.show_only_photo && currentSlide.show_badge_stock && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[9.5px] text-slate-200 shadow-md pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">{currentSlide.badge_stock_text || "Em Estoque · Envio Imediato"}</span>
          </div>
        )}

        {/* Mobile: Controles de carrossel se houver mais de 1 slide */}
        {isMobile && isMultiSlide && (
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-slate-300 text-[10px] select-none">
            <span className="font-mono">{currentNumberStr}/{totalNumberStr}</span>
            {settings.show_arrows && (
              <div className="flex items-center gap-1 ml-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Slide anterior"
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white cursor-pointer"
                >
                  <ChevronLeft size={12} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Próximo slide"
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white cursor-pointer"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 2. ZONA DE CONTEÚDO (TEXTO, BADGES, CTAS, TRUST MARKERS) */}
      {/* =================================================================== */}
      <div className="order-1 lg:order-none max-w-[1400px] mx-auto px-[clamp(1rem,5vw,1.75rem)] lg:px-10 w-full pt-[clamp(5.25rem,10svh,6.75rem)] lg:pt-40 pb-3 lg:pb-8 relative z-10 flex flex-col justify-between flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 items-center flex-1 my-auto">
          {/* COLUNA ESQUERDA: TEXTO, TÍTULO E CTAs */}
          {!currentSlide.show_only_photo ? (
            <div className="hero-copy lg:col-span-7 relative z-10 max-w-2xl w-full">
              {/* Badge Superior: Qualidade que Você Vê */}
              {currentSlide.show_badge_quality && (
                <div
                  data-testid="hero-badge-quality"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-white/10 backdrop-blur-md mb-3 sm:mb-4 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD62E] animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase text-amber-400">
                    {currentSlide.badge_quality_text || "QUALIDADE QUE VOCÊ VÊ"}
                  </span>
                </div>
              )}

              {/* Título Principal Tipografia Óptica */}
              {currentSlide.show_title && (
                <h1 className="text-[clamp(1.9rem,7.5vw+0.25rem,3.25rem)] lg:text-6xl font-light text-white tracking-tight leading-[1.08] lg:leading-[1.12]">
                  {currentSlide.title_text ? (
                    <span className="whitespace-pre-line">{currentSlide.title_text}</span>
                  ) : (
                    <>
                      Mais que óculos,
                      <br />
                      é sobre{" "}
                      <HighlightedText
                        delay={0.2}
                        from="left"
                        className="font-normal"
                        highlightClassName="bg-[#FFD62E] rounded-[0.2em] shadow-sm"
                        textClassName="text-[#02070D] font-semibold"
                      >
                        você.
                      </HighlightedText>
                    </>
                  )}
                </h1>
              )}

              {/* Subtítulo Descritivo com Alto Contraste */}
              {currentSlide.show_description && (
                <div className="hero-description my-3 sm:my-4">
                  <p className="text-[clamp(0.95rem,3.4vw,1.1rem)] lg:text-base leading-relaxed text-slate-200 font-normal max-w-[55ch] drop-shadow-sm">
                    {currentSlide.description_text ||
                      "Na Óticas Ventara, unimos tecnologia de precisão, curadoria autoral em acetato nobre e laboratório próprio para cuidar da sua visão em todos os momentos."}
                  </p>
                </div>
              )}

              {/* CTAs com Feedback Tátil */}
              {currentSlide.show_buttons && (
                <div className="hero-cta-wrapper flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 sm:mt-6 w-full sm:w-auto">
                  <Link
                    href={currentSlide.primary_button_url || "/lentes"}
                    className="inline-flex items-center justify-center gap-2.5 px-6 min-h-[48px] rounded-full bg-[#FFD62E] hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-400/20 transition-all duration-150 ease-out cursor-pointer group w-full sm:w-auto"
                    style={{ touchAction: "manipulation" }}
                  >
                    <span>{currentSlide.primary_button_text || "Catálogo de Lentes"}</span>
                    <ArrowRight
                      size={16}
                      className="text-slate-950 transform group-hover:translate-x-1 transition-transform"
                    />
                  </Link>

                  <a
                    href={currentSlide.secondary_button_url || "#armacoes"}
                    className="inline-flex items-center justify-center gap-2.5 px-6 min-h-[48px] rounded-full bg-slate-950/80 hover:bg-slate-900 active:scale-[0.98] text-white font-semibold text-sm border border-white/15 hover:border-amber-400/50 shadow-md backdrop-blur-md transition-all duration-150 ease-out cursor-pointer w-full sm:w-auto"
                    style={{ touchAction: "manipulation" }}
                  >
                    <span>{currentSlide.secondary_button_text || "Ver armações"}</span>
                  </a>
                </div>
              )}

              {/* Selo Mercado Pago (Compra Segura) no Fluxo de Conteúdo Mobile */}
              {mounted && isMobile && showSecureBadge && (
                <div
                  data-testid="hero-secure-badge"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 border border-white/15 backdrop-blur-md text-slate-200 shadow-sm mt-3.5 select-none w-fit max-w-full flex-wrap"
                >
                  <div className="relative w-4 h-4 shrink-0 flex items-center justify-center">
                    <Image
                      src="/logos/mercadopago.svg"
                      alt="Mercado Pago"
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-medium tracking-normal text-slate-200 text-xs">
                    {secureBadgeText}
                  </span>
                </div>
              )}

              {/* Diferenciais de Confiança da Marca */}
              {currentSlide.show_trust_markers && (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(95px,1fr))] gap-2.5 sm:gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-white/15 max-w-lg w-full">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                      <Sparkles size={12} className="text-amber-400 shrink-0" />
                      Lab Próprio
                    </span>
                    <span className="text-[10px] text-slate-200 mt-0.5 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                      Araçatuba-SP
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                      <Clock size={12} className="text-amber-400 shrink-0" />
                      Pronto em 1h
                    </span>
                    <span className="text-[10px] text-slate-200 mt-0.5 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                      Montagem Express
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                      <ShieldCheck size={12} className="text-amber-400 shrink-0" />
                      100% Autoral
                    </span>
                    <span className="text-[10px] text-slate-200 mt-0.5 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]">
                      Acetato Nobre
                    </span>
                  </div>
                </div>
              )}

              {/* Endereço Físico Discreto */}
              <span className="hero-footnote block text-[11px] text-slate-200 mt-3 sm:mt-4 tracking-normal font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] max-w-xl">
                {identity.store_name} · {fullAddress}
              </span>
            </div>
          ) : (
            <div className="lg:col-span-7 py-12 lg:py-32" />
          )}

          {/* COLUNA DIREITA: BADGES FLUTUANTES EDITÁVEIS E LINK DE PRODUTO (DESKTOP) */}
          {(!mounted || !isMobile) && (
            <div className="hero-stage hidden lg:flex lg:col-span-5 relative flex-col items-end justify-center w-full gap-4">
              {!currentSlide.show_only_photo && (
                <>
                  {/* 1. Badge Superior Direito */}
                  {currentSlide.show_badge_style && (
                    <div
                      data-testid="hero-badge-style"
                      className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/30 shadow-xl max-w-full"
                    >
                      <div className="w-[3px] h-4 bg-[#FFD62E] rounded-full shadow-[0_0_8px_#FFD62E] shrink-0" />
                      <span className="text-xs tracking-[0.14em] uppercase font-bold text-amber-300 truncate">
                        {currentSlide.badge_style_text || "ARMAÇÕES DE QUALIDADE E ESTILO"}
                      </span>
                    </div>
                  )}

                  {/* 2. Badge Inferior */}
                  {currentSlide.show_badge_stock && (
                    <div
                      data-testid="hero-badge-stock"
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[11px] text-slate-200 shadow-lg max-w-full"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="truncate">{currentSlide.badge_stock_text || "Em Estoque · Envio Imediato"}</span>
                    </div>
                  )}

                  {/* 3. Botão Curadoria Autoral */}
                  {currentSlide.show_badge_curation && (
                    <div data-testid="hero-badge-curation" className="mt-2 max-w-full">
                      <Link
                        href={currentSlide.badge_curation_url || "/catalogo"}
                        className="inline-flex items-center justify-between gap-3 px-5 py-2.5 rounded-full bg-slate-950/90 hover:bg-slate-900 active:scale-[0.97] backdrop-blur-md border border-amber-400/30 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-semibold shadow-xl transition-all duration-150 group max-w-full"
                        style={{ touchAction: "manipulation" }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Sparkles size={14} className="text-amber-400 shrink-0" />
                          <span className="truncate">
                            {currentSlide.badge_curation_text ||
                              "Curadoria Autoral Ventara · Acetato Premium"}
                          </span>
                        </div>
                        <ArrowRight
                          size={14}
                          className="text-amber-400 transform group-hover:translate-x-1 transition-transform shrink-0"
                        />
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* CONTROLES DO CARROSSEL: SETAS E PAGINAÇÃO DESKTOP */}
              {isMultiSlide && (
                <div
                  className="flex items-center gap-4 mt-6 pt-4 bg-slate-950/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg self-end"
                  data-testid="hero-carousel-controls"
                >
                  <span className="text-[11px] font-mono text-slate-400 tracking-wider">
                    <strong className="text-white">{currentNumberStr}</strong> / {totalNumberStr}
                  </span>

                  {settings.show_arrows && (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Slide anterior"
                        className="w-8 h-8 rounded-full border border-white/20 bg-slate-900/80 hover:bg-white/20 active:scale-90 flex items-center justify-center hover:text-white transition-all cursor-pointer focus:outline-none"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Próximo slide"
                        className="w-8 h-8 rounded-full border border-white/20 bg-slate-900/80 hover:bg-white/20 active:scale-90 flex items-center justify-center hover:text-white transition-all cursor-pointer focus:outline-none"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. BARRA INFERIOR RIGOROSAMENTE MARGEADA + SELO MERCADO PAGO NO DESKTOP */}
        {(!mounted || !isMobile) && (
          <div className="hidden lg:flex hero-bottom pt-6 mt-6 border-t border-white/10 items-center justify-between gap-3 text-[10px] tracking-widest text-slate-400 relative z-10">
            <span>ESTILO · PRESENÇA · IDENTIDADE</span>

            {showSecureBadge && (
              <div
                data-testid="hero-secure-badge"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 hover:bg-slate-950/90 border border-white/15 backdrop-blur-md text-slate-200 shadow-md transition-all select-none"
              >
                <div className="relative w-4 h-4 shrink-0 flex items-center justify-center">
                  <Image
                    src="/logos/mercadopago.svg"
                    alt="Mercado Pago"
                    width={16}
                    height={16}
                    className="object-contain"
                  />
                </div>
                <span className="font-medium tracking-normal text-slate-200 text-[10.5px] sm:text-xs">
                  {secureBadgeText}
                </span>
              </div>
            )}

            {isMultiSlide && settings.show_indicators && (
              <div className="flex items-center gap-2">
                {activeSlides.map((slide, idx) => (
                  <button
                    key={slide.id || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Ir para o slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      idx === currentIndex
                        ? "w-6 h-1.5 bg-amber-400 shadow-[0_0_8px_#FFD62E]"
                        : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}

            <a
              href="#sobre-nos"
              aria-label="Conhecer a Ótica Ventara"
              className="hero-explore-link flex items-center gap-2 hover:text-[#FFD62E] transition-colors"
            >
              <span>EXPLORE A VENTARA</span>
              <ArrowRight size={14} />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
