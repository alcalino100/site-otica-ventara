"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Check,
  ShieldCheck,
  Glasses,
  Sun,
  User,
  Heart,
  CreditCard,
} from "lucide-react";
import { SportsFrameArt, SportsLensColor, SportsFrameColor } from "../catalog/sports-frame-art";
import { FrameArt } from "../catalog/frame-art";
import { CartProduct } from "@/lib/cart";
import { DEFAULT_SHOWCASE_MEDIA } from "@/lib/site-settings-constants";
import { ShowcaseMediaSettings } from "@/types/ecommerce";

type CategoryType = "solar" | "grau";
type GenderType = "masculino" | "feminino";

interface Variation {
  id: string;
  name: string;
  finish: string;
  colorHex: string;
  lensColor: SportsLensColor;
  frameColor: SportsFrameColor;
  priceInCents: number;
  sku: string;
  slug: string;
  isAmber?: boolean;
  isRound?: boolean;
}

interface ShowcaseData {
  category: CategoryType;
  gender: GenderType;
  categoryBadge: string;
  categorySubtitle: string;
  heroCategoryTags: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  sectionTag: string;
  productHeadline: string;
  productDescription: string;
  lifestyleImage: string;
  lifestyleAlt: string;
  featuredProductName: string;
  featuredProductSlug: string;
  variations: Variation[];
}

const SHOWCASE_CONFIGS: Record<`${CategoryType}_${GenderType}`, ShowcaseData> = {
  solar_masculino: {
    category: "solar",
    gender: "masculino",
    categoryBadge: "ÓCULOS SOLARES & ESPORTIVOS",
    categorySubtitle: "PERFORMANCE E PROTEÇÃO UV400 EM QUALQUER AMBIENTE",
    heroCategoryTags: "ÓCULOS ESPORTIVOS • ARMAÇÕES • LENTES SOLARES",
    heroTitle: "Mais que óculos, é sobre",
    heroHighlight: "você.",
    heroDescription:
      "Tecnologia aerodinâmica, conforto ergonômico e proteção UV avançada para todas as suas jornadas e treinos.",
    sectionTag: "LINHA ESPORTIVA & SOLAR",
    productHeadline: "Performance em todos os detalhes.",
    productDescription:
      "Óculos esportivos com curvatura panorâmica, proteção UV400 e hastes anatômicas com grip antideslizante para o seu dia a dia e suas aventuras.",
    lifestyleImage: "/images/lifestyle/male-solar.jpg",
    lifestyleAlt: "Modelo masculino usando óculos de sol esportivo Ventara ao ar livre",
    featuredProductName: "Ventara Horizonte Sport",
    featuredProductSlug: "ventara-horizonte",
    variations: [
      {
        id: "sol-masc-1",
        name: "Azul Safira Polarizado",
        finish: "Preto Fosco com Lente Azul Espelhada",
        colorHex: "#0284c7",
        lensColor: "sapphire",
        frameColor: "black",
        priceInCents: 48900,
        sku: "VEN-HOR-BLU",
        slug: "ventara-horizonte",
      },
      {
        id: "sol-masc-2",
        name: "Fumê Polarizado Clássico",
        finish: "Preto Satin com Lente Escura UV400",
        colorHex: "#0f172a",
        lensColor: "smoke",
        frameColor: "black",
        priceInCents: 48900,
        sku: "VEN-HOR-SMK",
        slug: "ventara-horizonte",
      },
      {
        id: "sol-masc-3",
        name: "Lava Fire Espelhado",
        finish: "Preto com Lente Laranja Solar",
        colorHex: "#ea580c",
        lensColor: "fire",
        frameColor: "black",
        priceInCents: 48900,
        sku: "VEN-HOR-FIR",
        slug: "ventara-horizonte",
      },
      {
        id: "sol-masc-4",
        name: "Branco Gelo com Safira",
        finish: "Armação Branca com Lente Azul",
        colorHex: "#f8fafc",
        lensColor: "sapphire",
        frameColor: "white",
        priceInCents: 48900,
        sku: "VEN-HOR-WHT",
        slug: "ventara-horizonte",
      },
    ],
  },

  solar_feminino: {
    category: "solar",
    gender: "feminino",
    categoryBadge: "ÓCULOS SOLARES CONTEMPORÂNEOS",
    categorySubtitle: "DESIGN AUTORAL COM PROTEÇÃO COMPLETA UV400",
    heroCategoryTags: "ÓCULOS DE SOL • DESIGN AUTORAL • PROTEÇÃO UV",
    heroTitle: "Elegância e luz para o seu",
    heroHighlight: "olhar.",
    heroDescription:
      "Formas fluídas, acetato italiano polido à mão e lentes solares de alto contraste que realçam a beleza e protegem sua visão.",
    sectionTag: "COLEÇÃO SOLAR CONTEMPORÂNEA",
    productHeadline: "Design autoral e presença única.",
    productDescription:
      "Curadoria refinada com tonalidades âmbar translúcidas e tartaruga clássica. Leveza balanceada para acompanhar seu ritmo do café ao pôr do sol.",
    lifestyleImage: "/images/lifestyle/female-solar.jpg",
    lifestyleAlt: "Modelo feminina usando óculos de sol contemporâneo Ventara",
    featuredProductName: "Ventara Aurora Solar",
    featuredProductSlug: "ventara-aurora",
    variations: [
      {
        id: "sol-fem-1",
        name: "Âmbar Translúcido Dourado",
        finish: "Acetato Polido Âmbar com Lente Degradê",
        colorHex: "#b45309",
        lensColor: "fire",
        frameColor: "black",
        priceInCents: 44900,
        sku: "VEN-AUR-AMB",
        slug: "ventara-aurora",
        isAmber: true,
        isRound: true,
      },
      {
        id: "sol-fem-2",
        name: "Tartaruga Havana Clássico",
        finish: "Havana Demi com Lente G-15",
        colorHex: "#78350f",
        lensColor: "smoke",
        frameColor: "black",
        priceInCents: 44900,
        sku: "VEN-AUR-HAV",
        slug: "ventara-aurora",
        isAmber: true,
        isRound: true,
      },
      {
        id: "sol-fem-3",
        name: "Preto Ônix com Lente Fumê",
        finish: "Preto Brilhante com Proteção UV400",
        colorHex: "#111827",
        lensColor: "smoke",
        frameColor: "black",
        priceInCents: 44900,
        sku: "VEN-AUR-BLK",
        slug: "ventara-aurora",
        isRound: true,
      },
      {
        id: "sol-fem-4",
        name: "Ruby Rosé Suave",
        finish: "Translúcido Champagne com Lente Rosé",
        colorHex: "#be123c",
        lensColor: "ruby",
        frameColor: "black",
        priceInCents: 44900,
        sku: "VEN-AUR-RSE",
        slug: "ventara-aurora",
        isRound: true,
      },
    ],
  },

  grau_masculino: {
    category: "grau",
    gender: "masculino",
    categoryBadge: "ARMAÇÕES DE GRAU EM TITÂNIO",
    categorySubtitle: "ALTA PRECISÃO DIÓPTRICA E CONFORTO ERGONÔMICO",
    heroCategoryTags: "ARMAÇÕES DE GRAU • TITÂNIO PURO • ALTA PRECISÃO",
    heroTitle: "Precisão absoluta em cada",
    heroHighlight: "detalhe.",
    heroDescription:
      "Linhas arquitetônicas, estrutura em liga de titânio ultraleve e ajuste facial milimétrico para uso confortável durante todo o dia.",
    sectionTag: "LINHA TITÂNIO & MINIMALISMO",
    productHeadline: "Engenharia de precisão para o seu dia.",
    productDescription:
      "Armações desenvolvidas para máxima durabilidade e compatibilidade com lentes multifocais e visão simples de alta resolução.",
    lifestyleImage: "/images/lifestyle/male-grau.jpg",
    lifestyleAlt: "Modelo masculino usando armação de grau Ventara em titânio",
    featuredProductName: "Ventara Urbano Titanium",
    featuredProductSlug: "ventara-urbano",
    variations: [
      {
        id: "grau-masc-1",
        name: "Grafite Acetinado",
        finish: "Titânio Escovado Grafite Minimalista",
        colorHex: "#334155",
        lensColor: "sapphire",
        frameColor: "matte-black",
        priceInCents: 42900,
        sku: "VEN-URB-GRA",
        slug: "ventara-urbano",
        isRound: true,
      },
      {
        id: "grau-masc-2",
        name: "Preto Satin Matte",
        finish: "Preto Acetinado com Plaquetas Anatômicas",
        colorHex: "#0f172a",
        lensColor: "smoke",
        frameColor: "black",
        priceInCents: 42900,
        sku: "VEN-URB-BLK",
        slug: "ventara-urbano",
        isRound: true,
      },
      {
        id: "grau-masc-3",
        name: "Prata Polido",
        finish: "Titânio Prateado Polido à Mão",
        colorHex: "#94a3b8",
        lensColor: "smoke",
        frameColor: "white",
        priceInCents: 42900,
        sku: "VEN-URB-SLV",
        slug: "ventara-urbano",
        isRound: true,
      },
      {
        id: "grau-masc-4",
        name: "Azul Marinho Escuro",
        finish: "Liga Metálica Azul Profundo",
        colorHex: "#1e3a8a",
        lensColor: "sapphire",
        frameColor: "black",
        priceInCents: 42900,
        sku: "VEN-URB-NAV",
        slug: "ventara-urbano",
        isRound: true,
      },
    ],
  },

  grau_feminino: {
    category: "grau",
    gender: "feminino",
    categoryBadge: "ARMAÇÕES EM ACETATO PREMIUM",
    categorySubtitle: "HARMONIZAÇÃO FACIAL E CONFORTO VISUAL CONTÍNUO",
    heroCategoryTags: "ARMAÇÕES DE GRAU • ACETATO PREMIUM • CONFORTO",
    heroTitle: "Sua personalidade expressa no",
    heroHighlight: "olhar.",
    heroDescription:
      "A harmonia perfeita entre sofisticação e leveza. Armações desenhadas para valorizar as linhas do rosto com conforto sem pressão.",
    sectionTag: "COLEÇÃO ACETATO NOBRE",
    productHeadline: "Atemporalidade e sofisticação contínua.",
    productDescription:
      "Fabricadas com acetato nobre hipoalergênico e charneiras reforçadas. Feitas para resistir ao uso contínuo com beleza e brilho perenes.",
    lifestyleImage: "/images/lifestyle/female-grau.jpg",
    lifestyleAlt: "Modelo feminina usando armação de grau elegante Ventara",
    featuredProductName: "Ventara Essencial Acetato",
    featuredProductSlug: "ventara-essencial",
    variations: [
      {
        id: "grau-fem-1",
        name: "Preto Clássico Polido",
        finish: "Acetato Preto com Frisos Dourados",
        colorHex: "#111827",
        lensColor: "smoke",
        frameColor: "black",
        priceInCents: 38900,
        sku: "VEN-ESS-BLK",
        slug: "ventara-essencial",
      },
      {
        id: "grau-fem-2",
        name: "Tartaruga Âmbar Demi",
        finish: "Demi Brown Tartaruga com Efeito Marmorizado",
        colorHex: "#78350f",
        lensColor: "fire",
        frameColor: "black",
        priceInCents: 38900,
        sku: "VEN-ESS-DEM",
        slug: "ventara-essencial",
        isAmber: true,
      },
      {
        id: "grau-fem-3",
        name: "Cristal Translúcido",
        finish: "Acetato Cristal Transparente Contemporâneo",
        colorHex: "#e2e8f0",
        lensColor: "smoke",
        frameColor: "white",
        priceInCents: 38900,
        sku: "VEN-ESS-CLR",
        slug: "ventara-essencial",
      },
      {
        id: "grau-fem-4",
        name: "Nude Rosé Suave",
        finish: "Tons Pálidos com Brilho Acetinado",
        colorHex: "#f43f5e",
        lensColor: "ruby",
        frameColor: "white",
        priceInCents: 38900,
        sku: "VEN-ESS-ROS",
        slug: "ventara-essencial",
      },
    ],
  },
};

interface InteractiveShowcaseProps {
  onAddToCart?: (product: any) => void;
  onOpenCart?: (initialView?: "items" | "checkout") => void;
  onBuyNow?: (product: any) => void;
}

export function InteractiveShowcase({
  onAddToCart,
  onOpenCart,
  onBuyNow,
}: InteractiveShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("solar");
  const [selectedGender, setSelectedGender] = useState<GenderType>("masculino");
  const [selectedVarIndex, setSelectedVarIndex] = useState(0);
  const [addedItemSku, setAddedItemSku] = useState<string | null>(null);
  const [showcaseMedia, setShowcaseMedia] = useState<ShowcaseMediaSettings>(DEFAULT_SHOWCASE_MEDIA);

  useEffect(() => {
    async function loadShowcaseMedia() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.showcase_media) {
            setShowcaseMedia((prev) => ({ ...prev, ...data.showcase_media }));
          }
        }
      } catch (err) {}
    }
    loadShowcaseMedia();
  }, []);

  const activeKey = `${selectedCategory}_${selectedGender}` as const;
  const currentData = SHOWCASE_CONFIGS[activeKey];
  const activeVariation = currentData.variations[selectedVarIndex] || currentData.variations[0];

  const currentLifestyleImage =
    activeKey === "solar_masculino"
      ? showcaseMedia.heroMaleSolar || currentData.lifestyleImage
      : activeKey === "solar_feminino"
      ? showcaseMedia.heroFemaleSolar || currentData.lifestyleImage
      : activeKey === "grau_masculino"
      ? showcaseMedia.heroMaleGrau || currentData.lifestyleImage
      : showcaseMedia.heroFemaleGrau || currentData.lifestyleImage;

  const handleSelectVariation = (idx: number) => {
    setSelectedVarIndex(idx);
  };

  const handleCategorySwitch = (cat: CategoryType) => {
    setSelectedCategory(cat);
    setSelectedVarIndex(0);
  };

  const handleGenderSwitch = (gen: GenderType) => {
    setSelectedGender(gen);
    setSelectedVarIndex(0);
  };

  const handleBuyNow = () => {
    const cartItem: CartProduct = {
      id: activeVariation.id,
      name: `${currentData.featuredProductName} - ${activeVariation.name}`,
      slug: currentData.featuredProductSlug,
      category: selectedCategory === "solar" ? "Solar" : "Grau",
      color: activeVariation.name,
      priceInCents: activeVariation.priceInCents,
      imageUrl: undefined,
    };

    if (onBuyNow) {
      onBuyNow(cartItem);
    } else if (onAddToCart) {
      onAddToCart(cartItem);
      if (onOpenCart) {
        onOpenCart("checkout");
      }
    }
  };

  const handleAddCurrentToCart = () => {
    if (onAddToCart) {
      const cartItem: CartProduct = {
        id: activeVariation.id,
        name: `${currentData.featuredProductName} - ${activeVariation.name}`,
        slug: currentData.featuredProductSlug,
        category: selectedCategory === "solar" ? "Solar" : "Grau",
        color: activeVariation.name,
        priceInCents: activeVariation.priceInCents,
        imageUrl: undefined,
      };
      onAddToCart(cartItem);
      setAddedItemSku(activeVariation.sku);
      setTimeout(() => setAddedItemSku(null), 1800);
      if (onOpenCart) {
        setTimeout(() => onOpenCart("items"), 350);
      }
    }
  };

  const priceFormatted = (activeVariation.priceInCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const installmentFormatted = (activeVariation.priceInCents / 1000).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <section id="vitrine-interativa" className="relative w-full bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-white text-slate-900 overflow-hidden border-y border-slate-200/80">
      {/* Luz ambiente de destaque superior */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 py-12 sm:py-16 space-y-12 sm:space-y-16 relative z-10">
        
        {/* ============================================================== */}
        {/* PARTE 1: HERO EDITORIAL INTERATIVO COM FOTO DO ROSTO (LIFESTYLE) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Coluna Esquerda: Texto + Controles Dinâmicos */}
          <div className="lg:col-span-6 space-y-6">
            {/* Tag Categoria */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#0756b8] uppercase">
                {currentData.heroCategoryTags}
              </span>
            </div>

            {/* Headline com Destaque Dourado/Âmbar */}
            <h2 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-bold text-[#06111f] tracking-tight leading-[1.12]">
              {currentData.heroTitle}{" "}
              <span className="text-amber-500 font-extrabold">{currentData.heroHighlight}</span>
            </h2>

            {/* Subtítulo Convidativo */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
              {currentData.heroDescription}
            </p>

            {/* SELETORES INTERATIVOS: LINHA (SOLAR / GRAU) & GÊNERO (MASCULINO / FEMININO) */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Sparkles size={14} className="text-amber-500" /> Personalize sua visualização:
                </span>
                <span className="text-[11px] text-amber-600 font-bold">Troca em tempo real</span>
              </div>

              {/* Botões de Categoria: Solar vs Grau */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleCategorySwitch("solar")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                    selectedCategory === "solar"
                      ? "bg-[#06111f] text-white shadow-md shadow-slate-900/20 border border-[#06111f]"
                      : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200"
                  }`}
                >
                  <Sun size={16} className={selectedCategory === "solar" ? "text-amber-400" : "text-slate-500"} />
                  <span>Óculos Solar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCategorySwitch("grau")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                    selectedCategory === "grau"
                      ? "bg-[#06111f] text-white shadow-md shadow-slate-900/20 border border-[#06111f]"
                      : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200"
                  }`}
                >
                  <Glasses size={16} className={selectedCategory === "grau" ? "text-amber-400" : "text-slate-500"} />
                  <span>Armações de Grau</span>
                </button>
              </div>

              {/* Botões de Gênero: Masculino vs Feminino */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleGenderSwitch("masculino")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                    selectedGender === "masculino"
                      ? "bg-amber-400 text-slate-950 font-bold shadow-xs border border-amber-400"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  <User size={14} />
                  <span>Coleção Masculina</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGenderSwitch("feminino")}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                    selectedGender === "feminino"
                      ? "bg-amber-400 text-slate-950 font-bold shadow-xs border border-amber-400"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  <Heart size={14} />
                  <span>Coleção Feminina</span>
                </button>
              </div>
            </div>

            {/* CTAs no Formato Pill Exato da Referência */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="#armacoes"
                className="inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-md shadow-amber-400/25 group cursor-pointer"
              >
                <span>Ver armações</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="#loja-fisica"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-transparent hover:bg-slate-100 active:scale-95 text-slate-800 border-2 border-slate-300 hover:border-slate-800 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer"
              >
                <span>Conheça a loja</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Coluna Direita: Lifestyle Hero com Troca Dinâmica do Rosto */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] bg-slate-200 border border-slate-200/90 shadow-2xl group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedCategory}_${selectedGender}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Fotografia Lifestyle */}
                  <img
                    src={currentLifestyleImage}
                    alt={currentData.lifestyleAlt}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                  {/* Gradiente sutil para leitura perfeita do badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Badge Flutuante Sobre a Fotografia (Idêntico ao da Referência) */}
              <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-auto z-20">
                <div className="flex items-start gap-3 bg-[#06111f]/90 backdrop-blur-md border border-white/15 p-3.5 sm:p-4 rounded-2xl max-w-sm shadow-xl text-white">
                  {/* Barra Dourada Vertical */}
                  <div className="w-1 self-stretch bg-amber-400 rounded-full flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">
                      {currentData.categoryBadge}
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-200 font-medium mt-0.5 leading-snug">
                      {currentData.categorySubtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PARTE 2: VITRINE DE PRODUTO EM DESTAQUE COM MINIATURAS INTERATIVAS */}
        {/* ============================================================== */}
        <div className="pt-8 border-t border-slate-200/80">
          {/* Header Mobile: Exibido no topo da seção em telas compactas */}
          <div className="lg:hidden space-y-2 mb-5">
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-amber-600 uppercase">
              <span className="w-4 h-0.5 bg-amber-500 rounded-full" />
              <span>{currentData.sectionTag}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-[#06111f] tracking-tight leading-tight">
              {currentData.productHeadline}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {currentData.productDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
            
            {/* Coluna de Preço e CTAs: No mobile fica DEPOIS da Foto e Miniaturas (order-2) */}
            <div className="order-2 lg:order-1 lg:col-span-5 space-y-4">
              {/* Header exclusivo para Desktop */}
              <div className="hidden lg:block space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-amber-600 uppercase">
                  <span className="w-4 h-0.5 bg-amber-500 rounded-full" />
                  <span>{currentData.sectionTag}</span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-bold text-[#06111f] tracking-tight leading-tight">
                  {currentData.productHeadline}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentData.productDescription}
                </p>
              </div>

              {/* Box de Preço e Parcelamento */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2 sm:gap-4">
                <div>
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Preço à vista no Pix</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#06111f] font-mono tracking-tight">
                    {priceFormatted}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-500 block">Condição de parcelamento</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">
                    10x de <strong className="text-slate-900">{installmentFormatted}</strong> sem juros
                  </span>
                </div>
              </div>

              {/* Botões de Ação: Compra Direta, Adicionar à Sacola e Ver Opções */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 shadow-md shadow-amber-400/20 group cursor-pointer"
                >
                  <CreditCard size={16} className="text-slate-950" />
                  <span>COMPRAR AGORA</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddCurrentToCart}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#06111f] hover:bg-slate-800 active:scale-95 text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all cursor-pointer shadow-sm"
                >
                  {addedItemSku === activeVariation.sku ? (
                    <>
                      <Check size={16} className="text-emerald-400" />
                      <span>Adicionado!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={15} className="text-amber-400" />
                      <span>Salvar na Sacola</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/produto/${currentData.featuredProductSlug}`}
                  className="inline-flex items-center justify-center gap-1 px-4 py-3.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-semibold text-xs tracking-wider uppercase transition-all cursor-pointer group"
                >
                  <span>Opções</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-amber-600" />
                </Link>
              </div>
            </div>

            {/* Coluna da Foto e Miniaturas: No mobile aparece PRIMEIRO (order-1) */}
            <div className="order-1 lg:order-2 lg:col-span-7 space-y-5">
              
              {/* Moldura de Showcase Principal da Armação */}
              <div className="relative bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[360px] shadow-sm overflow-hidden group">
                {/* Glow Suave de Fundo */}
                <div className="absolute inset-0 bg-radial from-amber-400/5 via-transparent to-transparent pointer-events-none" />

                {/* Badge da Variação Selecionada */}
                <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-900 text-white shadow-xs">
                    {currentData.featuredProductName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    {activeVariation.name}
                  </span>
                </div>

                {/* Visual em Destaque da Armação com Transição Suave */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeVariation.id}-${activeVariation.sku}`}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    className="w-full max-w-[460px] flex items-center justify-center py-4"
                  >
                    {selectedCategory === "solar" && selectedGender === "masculino" ? (
                      <SportsFrameArt
                        lensColor={activeVariation.lensColor}
                        frameColor={activeVariation.frameColor}
                        className="w-full h-auto max-h-64 object-contain filter drop-shadow-xl"
                      />
                    ) : (
                      <FrameArt
                        solar={selectedCategory === "solar"}
                        amber={activeVariation.isAmber}
                        round={activeVariation.isRound}
                        className="w-full h-auto max-h-64 object-contain filter drop-shadow-xl"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Legenda do Acabamento Ativo */}
                <p className="text-xs text-slate-500 font-medium text-center mt-2">
                  Acabamento: <strong className="text-slate-800">{activeVariation.finish}</strong>
                </p>
              </div>

              {/* ============================================================== */}
              {/* GALERIA DE MINIATURAS (THUMBNAILS) CONFORME O ANEXO */}
              {/* ============================================================== */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                  <span>Variações disponíveis da linha:</span>
                  <span className="text-slate-400 font-normal">({currentData.variations.length} opções)</span>
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {currentData.variations.map((v, idx) => {
                    const isSelected = idx === selectedVarIndex;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariation(idx)}
                        className={`group relative p-2.5 sm:p-3 rounded-2xl bg-white border transition-all text-left flex flex-col justify-between cursor-pointer active:scale-95 ${
                          isSelected
                            ? "border-amber-400 shadow-md ring-2 ring-amber-400/30 bg-amber-50/20"
                            : "border-slate-200/90 hover:border-slate-300 hover:shadow-xs"
                        }`}
                      >
                        {/* Indicador de Selecionado */}
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                        )}

                        {/* Visual da Miniatura */}
                        <div className="w-full h-16 sm:h-20 bg-slate-50 rounded-xl flex items-center justify-center p-2 mb-2 group-hover:scale-105 transition-transform overflow-hidden">
                          {selectedCategory === "solar" && selectedGender === "masculino" ? (
                            <SportsFrameArt
                              lensColor={v.lensColor}
                              frameColor={v.frameColor}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <FrameArt
                              solar={selectedCategory === "solar"}
                              amber={v.isAmber}
                              round={v.isRound}
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>

                        {/* Identificação da Cor / Lente */}
                        <div className="w-full">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-slate-300 flex-shrink-0"
                              style={{ backgroundColor: v.colorHex }}
                            />
                            <p className="text-[11px] font-semibold text-slate-800 truncate">
                              {v.name}
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono font-medium">
                            {(v.priceInCents / 100).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
