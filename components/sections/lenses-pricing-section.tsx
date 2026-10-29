"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Eye,
  Layers,
  ShieldCheck,
  Palette,
  Award,
  Zap,
  Clock,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react";
import { AdminLensItem, DEFAULT_LENSES } from "@/lib/lenses-data";
import { DEFAULT_HOMOLOGATED_BRANDS, DEFAULT_PARTNER_LOGOS } from "@/lib/site-settings-constants";
import { HomologatedBrand, LensesSectionSettings } from "@/types/ecommerce";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { PartnerLogosRibbon } from "./partner-logos-ribbon";

type LensCategory = "all" | "visao-simples" | "multifocal" | "tratamentos" | "coloridas" | "marcas";
type ViewMode = "grid" | "carousel";

const BANNER_STRIP_PARTNERS = [
  { name: "ORGALENS LENS", logo: "/logos/orgaline.svg" },
  { name: "OPTISYNC HD", logo: "/logos/optisync-dark.svg" },
  { name: "HOYA", logo: "/logos/hoya.svg" },
  { name: "CORRECT VISÃO PRECISA", logo: "/logos/correct-dark.svg" },
  { name: "Kodak", logo: "/logos/kodak.svg" },
  { name: "ANY FLASH", text: "NEW FLASH" },
  { name: "Transitions", logo: "/logos/transitions.svg" },
  { name: "Varilux.", logo: "/logos/varilux.svg" },
];

const INITIAL_LIMIT = 8;

export function LensesPricingSection() {
  const { cleanWhatsAppNumber } = useSiteSettings();
  const [activeCategory, setActiveCategory] = useState<LensCategory>("all");
  const [lenses, setLenses] = useState<AdminLensItem[]>(DEFAULT_LENSES);
  const [homologatedBrands, setHomologatedBrands] = useState<HomologatedBrand[]>(DEFAULT_HOMOLOGATED_BRANDS);
  const [lensesSection, setLensesSection] = useState<LensesSectionSettings | null>(null);

  // Controle de Visualização: Grade ou Carrossel ("Passar de lado")
  const [viewMode, setViewMode] = useState<ViewMode>("carousel");
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [lensesRes, settingsRes] = await Promise.all([
          fetch("/api/admin/lenses"),
          fetch("/api/settings"),
        ]);

        if (lensesRes.ok) {
          const lensesData = await lensesRes.json();
          if (lensesData.lenses && Array.isArray(lensesData.lenses) && lensesData.lenses.length > 0) {
            setLenses(lensesData.lenses.filter((l: AdminLensItem) => l.isActive));
          }
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.homologated_brands && Array.isArray(settingsData.homologated_brands)) {
            setHomologatedBrands(settingsData.homologated_brands);
          }
          if (settingsData.lenses_section) {
            setLensesSection(settingsData.lenses_section);
          }
        }
      } catch (err) {
        console.warn("Utilizando catálogo padrão de lentes:", err);
      }
    }
    loadData();
  }, []);

  const filteredLenses = lenses.filter((l) => {
    if (activeCategory === "all") return true;
    return l.category === activeCategory;
  });

  const displayedLenses = isExpanded ? filteredLenses : filteredLenses.slice(0, INITIAL_LIMIT);

  const displayedBrands = isExpanded
    ? homologatedBrands
    : homologatedBrands.slice(0, INITIAL_LIMIT);

  const totalItems = activeCategory === "marcas" ? homologatedBrands.length : filteredLenses.length;

  // Funções de Scroll do Carrossel ("Passar de lado")
  const scrollPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    const itemWidth = el.scrollWidth / (totalItems || 1);
    const index = Math.round(el.scrollLeft / itemWidth);
    setActiveCardIndex(Math.min(Math.max(0, index), totalItems - 1));
  };

  const handleCategoryChange = (cat: LensCategory) => {
    setActiveCategory(cat);
    setActiveCardIndex(0);
    setIsExpanded(false);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const getWhatsAppLensUrl = (lens: AdminLensItem) => {
    const text = encodeURIComponent(
      `Olá! Tenho interesse na lente "${lens.name}" (${lens.brandName}) com ${lens.treatment} que vi no Catálogo de Lentes de Grau da Óticas Ventara. Gostaria de enviar minha receita para conferência técnica!`
    );
    return `https://wa.me/${cleanWhatsAppNumber || "5518996155748"}?text=${text}`;
  };

  const getWhatsAppPrescriptionUrl = () => {
    const text = encodeURIComponent(
      "Olá! Gostaria de uma consultoria técnica gratuita com o técnico óptico da Ventara para escolher a melhor lente de grau para a minha receita."
    );
    return `https://wa.me/${cleanWhatsAppNumber || "5518996155748"}?text=${text}`;
  };

  return (
    <section id="lentes" className="py-14 sm:py-20 bg-[#fafafa] text-slate-900 border-t border-b border-slate-200/90 relative overflow-hidden">
      <div className="space-y-10 sm:space-y-14">
        {/* 1. HERO HEADER (ESTILO CLÍNICO-ÓPTICO LIMPO E BRILHANTE CONFORME PÁGINA /lentes) */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
          <div className="space-y-4 max-w-3xl">
            {/* Badge: Laboratório Próprio & Certificado */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
              <FlaskConical size={14} className="text-slate-700" />
              <span>LABORATÓRIO PRÓPRIO &amp; CERTIFICADO</span>
            </div>

            {/* Título Principal com Destaque Âmbar */}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
              CATÁLOGO DE <br />
              <span className="text-[#f59e0b]">LENTES DE GRAU</span>
            </h2>

            {/* Subtítulo Descritivo */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Explore marcas, tecnologias e tratamentos de alta precisão para encontrar a lente ideal para sua visão. Montagem expressa em até 1 hora no laboratório próprio de Araçatuba.
            </p>

            {/* Botões de Ação Duplos */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={getWhatsAppPrescriptionUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>Enviar Receita no WhatsApp</span>
              </a>

              <Link
                href="/medicao-por-foto"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-semibold text-xs sm:text-sm border border-slate-800 hover:border-slate-950 transition-all active:scale-95 cursor-pointer shadow-2xs"
              >
                <Eye size={16} className="text-slate-900" />
                <span>Medição DNP por Foto</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. CARD DO BANNER DESTACADO COM LENTES 3D E FITA DE LOGOS */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
          <div className="relative rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/60 to-blue-50/20 shadow-xs overflow-hidden p-6 sm:p-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 items-center">
              {/* Lado Esquerdo do Banner: Textos */}
              <div className="md:col-span-7 space-y-2 sm:space-y-3">
                <div className="w-10 sm:w-12 h-1 bg-amber-400 rounded-full" />
                <div className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-500 uppercase">
                  CATÁLOGO DE
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                  LENTES DE GRAU
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
                  Explore marcas, tecnologias e tratamentos para encontrar a lente ideal para você.
                </p>
              </div>

              {/* Lado Direito do Banner: Lentes 3D com Reflexo Antirreflexo Azul */}
              <div className="md:col-span-5 flex items-center justify-center md:justify-end">
                <div className="relative">
                  <img
                    src="/images/banners/lentes-3d-reflexo.png"
                    alt="Lentes de Grau Óticas Ventara com Antirreflexo"
                    className="max-h-28 sm:max-h-36 w-auto object-contain drop-shadow-md select-none pointer-events-none"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Fita de Parceiros no Rodapé do Banner Card */}
            <div className="mt-6 pt-5 border-t border-slate-200/70">
              <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-1">
                {BANNER_STRIP_PARTNERS.map((partner, index) => (
                  <React.Fragment key={partner.name}>
                    {index > 0 && <div className="h-5 w-px bg-slate-200 shrink-0" />}
                    <div className="shrink-0 flex items-center justify-center px-1">
                      {partner.logo ? (
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="h-5 sm:h-6 max-w-[100px] object-contain opacity-85 hover:opacity-100 transition-opacity"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-[11px] sm:text-xs font-black tracking-wider text-slate-700 uppercase whitespace-nowrap">
                          {partner.text || partner.name}
                        </span>
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. FITA DE PARCEIROS TECNOLÓGICOS & LENTES HOMOLOGADAS */}
        <div>
          <PartnerLogosRibbon
            variant="light"
            logos={lensesSection?.partnerLogos || DEFAULT_PARTNER_LOGOS}
            speedSeconds={lensesSection?.ribbonSpeedSeconds || 28}
            tag={lensesSection?.ribbonTag || "PARCEIROS TECNOLÓGICOS & LENTES HOMOLOGADAS"}
            subtitle={lensesSection?.ribbonSubtitle || "Garantia de procedência direta com laboratórios certificados e montagem expressa"}
          />
        </div>

        {/* 4. SEÇÃO DO CATÁLOGO COM FILTROS EM PÍLULA, CONTROLE DE MODO (CARROSSEL OU GRADE) */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 space-y-6 sm:space-y-8">
          {/* Barra Superior: Filtros em Pílulas e Botões de Modo de Exibição */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Filtros em Abas de Pílulas */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  activeCategory === "all"
                    ? "bg-amber-400 text-slate-950 border-amber-400 shadow-sm"
                    : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/80"
                }`}
              >
                <span>Todas as Lentes ({lenses.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange("visao-simples")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  activeCategory === "visao-simples"
                    ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-sm"
                    : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/80"
                }`}
              >
                <Eye size={14} className={activeCategory === "visao-simples" ? "text-slate-950" : "text-slate-600"} />
                <span>Visão Simples (Monofocais)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange("multifocal")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  activeCategory === "multifocal"
                    ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-sm"
                    : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/80"
                }`}
              >
                <Layers size={14} className={activeCategory === "multifocal" ? "text-slate-950" : "text-slate-600"} />
                <span>Multifocais (Progressivas)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange("tratamentos")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  activeCategory === "tratamentos"
                    ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-sm"
                    : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/80"
                }`}
              >
                <ShieldCheck size={14} className={activeCategory === "tratamentos" ? "text-slate-950" : "text-slate-600"} />
                <span>Filtro Azul &amp; Especiais</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange("coloridas")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  activeCategory === "coloridas"
                    ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-sm"
                    : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/80"
                }`}
              >
                <Palette size={14} className={activeCategory === "coloridas" ? "text-slate-950" : "text-slate-600"} />
                <span>Lentes Coloridas (8 Cores)</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange("marcas")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  activeCategory === "marcas"
                    ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-sm"
                    : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/80"
                }`}
              >
                <Award size={14} className={activeCategory === "marcas" ? "text-slate-950" : "text-slate-600"} />
                <span>Marcas Homologadas ({homologatedBrands.length})</span>
              </button>
            </div>

            {/* Alternador de Modo de Exibição ("Passar de Lado" ou "Grade com Ver Mais") */}
            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-slate-200/60">
              <span className="text-xs text-slate-500 font-semibold lg:hidden">Modo de visualização:</span>
              <div className="inline-flex items-center p-1 rounded-full bg-slate-200/80 border border-slate-300/80">
                <button
                  type="button"
                  onClick={() => setViewMode("carousel")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "carousel"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Passar modelos de lado"
                >
                  <SlidersHorizontal size={13} className="text-amber-500" />
                  <span>Passar de Lado</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Exibir em grade completa com ver mais"
                >
                  <LayoutGrid size={13} className="text-amber-500" />
                  <span>Grade Completa</span>
                </button>
              </div>
            </div>
          </div>

          {/* ÁREA DOS CARDS: SUPORTA MODO CARROSSEL ("PASSAR DE LADO") E MODO GRADE ("EMPURRAR PRA BAIXO") */}
          <div className="relative">
            {viewMode === "carousel" ? (
              /* MODO 1: CARROSSEL HORIZONTAL ("PASSAR DE LADO") */
              <div>
                {/* Barra de Navegação com Setas e Indicador de Posição */}
                <div className="flex items-center justify-between pb-3 px-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Deslize para o lado para ver todos os modelos</span>
                    <span className="font-mono text-amber-600 font-black text-xs">
                      ({activeCardIndex + 1}/{totalItems})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={scrollPrev}
                      aria-label="Modelo anterior"
                      className="w-9 h-9 rounded-full border border-slate-300 bg-white hover:bg-slate-50 shadow-xs flex items-center justify-center text-slate-700 active:scale-95 transition-all cursor-pointer"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={scrollNext}
                      aria-label="Próximo modelo"
                      className="w-9 h-9 rounded-full border border-slate-300 bg-white hover:bg-slate-50 shadow-xs flex items-center justify-center text-slate-700 active:scale-95 transition-all cursor-pointer"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Trilho Horizontal com Snap Suave */}
                <div
                  ref={carouselRef}
                  onScroll={handleCarouselScroll}
                  role="region"
                  aria-label="Carrossel de lentes de alta precisão"
                  tabIndex={0}
                  className="flex flex-row flex-nowrap overflow-x-auto overflow-y-hidden snap-x snap-mandatory gap-4 sm:gap-6 py-2 pb-5 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-px-4 items-stretch"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {activeCategory !== "marcas"
                    ? filteredLenses.map((lens) => (
                        <div
                          key={lens.id}
                          className="snap-start shrink-0 w-[78vw] sm:w-[320px] max-w-[340px] group bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 hover:border-amber-400 hover:shadow-xl shadow-xs transition-all duration-300 flex flex-col justify-between"
                        >
                          <div>
                            {/* Imagem do Produto + Selo Superior */}
                            <div className="relative w-full aspect-[4/3] rounded-2xl bg-[#fafafa] p-2.5 sm:p-3.5 flex items-center justify-center overflow-hidden mb-3 border border-slate-100 group-hover:scale-[1.01] transition-transform">
                              {lens.badge && (
                                <span className="absolute top-2 right-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-black text-white z-10 truncate max-w-[105px]">
                                  {lens.badge}
                                </span>
                              )}

                              {lens.brandLogo && (
                                <div className="absolute top-2 left-2 max-h-5 sm:max-h-6 max-w-[70px] sm:max-w-[90px] flex items-center bg-white/95 px-1.5 py-0.5 rounded-md shadow-2xs z-10 border border-slate-100">
                                  <img
                                    src={lens.brandLogo}
                                    alt={lens.brandName}
                                    className="max-h-3.5 sm:max-h-4 max-w-full object-contain"
                                  />
                                </div>
                              )}

                              <img
                                src={lens.boxImage || "/images/lenses/optisync-box.jpg"}
                                alt={`Lente ${lens.name}`}
                                className="max-h-full max-w-full object-contain drop-shadow-xs group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>

                            {/* Informações da Lente */}
                            <div className="space-y-1 mb-2">
                              <span className="text-[10px] sm:text-[11px] font-black text-amber-500 uppercase tracking-wider block">
                                LENTE
                              </span>
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-snug line-clamp-2">
                                {lens.name}
                              </h3>
                            </div>

                            {/* Tratamento */}
                            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-100 border border-slate-200/60 text-[10px] sm:text-xs text-slate-700 font-medium mb-3 flex items-start gap-1.5">
                              <Zap size={13} className="text-amber-500 shrink-0 mt-0.5 fill-amber-500" />
                              <span className="line-clamp-2">{lens.treatment}</span>
                            </div>

                            {/* Preço */}
                            <div className="pt-2.5 border-t border-slate-100 mb-3">
                              <span className="text-[10px] text-slate-400 block font-medium">À partir de</span>
                              <div className="text-base sm:text-2xl font-black text-amber-500 font-mono leading-tight">
                                {lens.startingPrice}
                              </div>
                              <span className="text-[10px] sm:text-xs text-slate-500 block mt-0.5">
                                {lens.installment}
                              </span>
                            </div>
                          </div>

                          {/* Botão de Ação e Prazo */}
                          <div className="space-y-2 pt-1 mt-auto">
                            <a
                              href={getWhatsAppLensUrl(lens)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-amber-400/20 transition-all cursor-pointer"
                            >
                              <MessageCircle size={15} className="shrink-0" />
                              <span>Garantir no WhatsApp</span>
                            </a>

                            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-slate-500">
                              <Clock size={12} className="text-amber-500 shrink-0" />
                              <span>{lens.leadTime}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    : homologatedBrands.map((brand) => (
                        <div
                          key={brand.id}
                          className="snap-start shrink-0 w-[78vw] sm:w-[320px] max-w-[340px] bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 hover:border-amber-400 hover:shadow-xl shadow-xs transition-all duration-300 flex flex-col justify-between"
                        >
                          <div>
                            <div className="relative w-full aspect-[4/3] rounded-2xl bg-[#fafafa] p-3 flex items-center justify-center overflow-hidden mb-3 border border-slate-100">
                              <img
                                src={brand.boxImage || "/images/lenses/optisync-box.jpg"}
                                alt={`Marca ${brand.name}`}
                                className="max-h-full max-w-full object-contain drop-shadow-xs hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                                {brand.badge || "Laboratório Certificado"}
                              </span>
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                                {brand.name}
                              </h3>
                              <p className="text-[11px] text-slate-500 line-clamp-3 mt-1">
                                {brand.desc}
                              </p>
                            </div>
                          </div>

                          <a
                            href={`https://wa.me/${cleanWhatsAppNumber || "5518996155748"}?text=${encodeURIComponent(
                              `Olá! Gostaria de consultar valores das lentes de grau da marca homologada "${brand.name}".`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-colors"
                          >
                            <MessageCircle size={14} className="text-amber-500" />
                            <span>Consultar Valores</span>
                          </a>
                        </div>
                      ))}
                </div>

                {/* Indicadores de Paginação do Carrossel */}
                {totalItems > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-3">
                    {Array.from({ length: Math.min(totalItems, 12) }).map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (carouselRef.current) {
                            const target = carouselRef.current.children[idx] as HTMLElement;
                            if (target) {
                              target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                            }
                          }
                        }}
                        aria-label={`Ver modelo ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          activeCardIndex === idx
                            ? "w-6 bg-amber-400"
                            : "w-1.5 bg-slate-300 hover:bg-slate-400"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* MODO 2: GRADE COMPLETA COM "EMPURRAR PRA BAIXO" (RECOLHER / EXPANDIR COM DEGRADÊ) */
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {activeCategory !== "marcas"
                    ? displayedLenses.map((lens) => (
                        <article
                          key={lens.id}
                          className="group bg-white rounded-3xl p-3 sm:p-5 border border-slate-200/90 hover:border-amber-400 hover:shadow-xl shadow-xs transition-all duration-300 flex flex-col justify-between"
                        >
                          <div>
                            {/* Cápsula com Imagem */}
                            <div className="relative w-full aspect-[4/3] rounded-2xl bg-[#fafafa] p-2 sm:p-3.5 flex items-center justify-center overflow-hidden mb-3 border border-slate-100 group-hover:scale-[1.01] transition-transform">
                              {lens.badge && (
                                <span className="absolute top-2 right-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-black text-white z-10 truncate max-w-[105px]">
                                  {lens.badge}
                                </span>
                              )}

                              {lens.brandLogo && (
                                <div className="absolute top-2 left-2 max-h-5 sm:max-h-6 max-w-[70px] sm:max-w-[90px] flex items-center bg-white/95 px-1.5 py-0.5 rounded-md shadow-2xs z-10 border border-slate-100">
                                  <img
                                    src={lens.brandLogo}
                                    alt={lens.brandName}
                                    className="max-h-3.5 sm:max-h-4 max-w-full object-contain"
                                  />
                                </div>
                              )}

                              <img
                                src={lens.boxImage || "/images/lenses/optisync-box.jpg"}
                                alt={`Lente ${lens.name}`}
                                className="max-h-full max-w-full object-contain drop-shadow-xs group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>

                            {/* Informações da Lente */}
                            <div className="space-y-1 mb-2">
                              <span className="text-[10px] sm:text-[11px] font-black text-amber-500 uppercase tracking-wider block">
                                LENTE
                              </span>
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-snug line-clamp-2">
                                {lens.name}
                              </h3>
                            </div>

                            {/* Tratamento */}
                            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-100 border border-slate-200/60 text-[10px] sm:text-xs text-slate-700 font-medium mb-3 flex items-start gap-1.5">
                              <Zap size={13} className="text-amber-500 shrink-0 mt-0.5 fill-amber-500" />
                              <span className="line-clamp-2">{lens.treatment}</span>
                            </div>

                            {/* Preço */}
                            <div className="pt-2.5 border-t border-slate-100 mb-3">
                              <span className="text-[10px] text-slate-400 block font-medium">À partir de</span>
                              <div className="text-base sm:text-2xl font-black text-amber-500 font-mono leading-tight">
                                {lens.startingPrice}
                              </div>
                              <span className="text-[10px] sm:text-xs text-slate-500 block mt-0.5">
                                {lens.installment}
                              </span>
                            </div>
                          </div>

                          {/* Botão de Ação e Prazo */}
                          <div className="space-y-2 pt-1">
                            <a
                              href={getWhatsAppLensUrl(lens)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-amber-400/20 transition-all cursor-pointer"
                            >
                              <MessageCircle size={15} className="shrink-0" />
                              <span>Garantir no WhatsApp</span>
                            </a>

                            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-slate-500">
                              <Clock size={12} className="text-amber-500 shrink-0" />
                              <span>{lens.leadTime}</span>
                            </div>
                          </div>
                        </article>
                      ))
                    : displayedBrands.map((brand) => (
                        <div
                          key={brand.id}
                          className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 hover:border-amber-400 hover:shadow-xl shadow-xs transition-all duration-300 flex flex-col justify-between"
                        >
                          <div>
                            <div className="relative w-full aspect-[4/3] rounded-2xl bg-[#fafafa] p-3 flex items-center justify-center overflow-hidden mb-3 border border-slate-100">
                              <img
                                src={brand.boxImage || "/images/lenses/optisync-box.jpg"}
                                alt={`Marca ${brand.name}`}
                                className="max-h-full max-w-full object-contain drop-shadow-xs hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                                {brand.badge || "Laboratório Certificado"}
                              </span>
                              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                                {brand.name}
                              </h3>
                              <p className="text-[11px] text-slate-500 line-clamp-3 mt-1">
                                {brand.desc}
                              </p>
                            </div>
                          </div>

                          <a
                            href={`https://wa.me/${cleanWhatsAppNumber || "5518996155748"}?text=${encodeURIComponent(
                              `Olá! Gostaria de consultar valores das lentes de grau da marca homologada "${brand.name}".`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-colors"
                          >
                            <MessageCircle size={14} className="text-amber-500" />
                            <span>Consultar Valores</span>
                          </a>
                        </div>
                      ))}
                </div>

                {/* Efeito de Degradê Cobrindo Parte das Lentes Sobrando quando Recolhido */}
                {!isExpanded && totalItems > INITIAL_LIMIT && (
                  <div className="pointer-events-none absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#fafafa] via-[#fafafa]/85 to-transparent z-10" />
                )}
              </div>
            )}
          </div>

          {/* Botão de Ver Mais / Recolher no Modo Grade com Degradê ("Empurrar pra baixo" - pedido em 3 - Muito top.jpeg) */}
          {viewMode === "grid" && totalItems > INITIAL_LIMIT && (
            <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center relative z-20">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-slate-900/10 transition-all duration-200 cursor-pointer border border-slate-700/60 group"
              >
                {isExpanded ? (
                  <>
                    <span>Recolher modelos</span>
                    <ChevronUp size={16} className="text-amber-400 group-hover:-translate-y-0.5 transition-transform" />
                  </>
                ) : (
                  <>
                    <span>Ver mais {totalItems - INITIAL_LIMIT} opções de lentes</span>
                    <ChevronDown size={16} className="text-amber-400 group-hover:translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>
              <span className="text-[11px] text-slate-500 mt-2 font-medium">
                {isExpanded
                  ? `Exibindo todas as ${totalItems} opções homologadas`
                  : `Mostrando ${INITIAL_LIMIT} de ${totalItems} modelos de lentes de alta precisão`}
              </span>
            </div>
          )}
        </div>

        {/* 5. CARD DE CONSULTORIA TÉCNICA E ENVIO DE RECEITA */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
          <div className="relative rounded-3xl bg-gradient-to-r from-amber-50/80 via-white to-sky-50/60 border border-amber-300/80 p-6 sm:p-12 overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-100/70 px-3 py-1 rounded-full border border-amber-200">
                SUPORTE ESPECIALIZADO EM ÓPTICA
              </span>
              <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Tem sua receita em mãos? Deixe a parte técnica conosco.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Fotografe sua prescrição oftálmica e envie diretamente para o nosso técnico óptico no WhatsApp. Analisamos eixo, cilindro, dioptrias e indicamos a melhor lente de grau e tratamento para a sua armação.
              </p>
            </div>

            <a
              href={getWhatsAppPrescriptionUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-400/25 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <MessageCircle size={18} />
              <span>Enviar Foto da Receita</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
