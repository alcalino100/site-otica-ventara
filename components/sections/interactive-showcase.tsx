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
  Sun,
  User,
  Zap,
  CreditCard,
} from "lucide-react";
import { SportsFrameArt, SportsLensColor, SportsFrameColor } from "../catalog/sports-frame-art";
import { CartProduct } from "@/lib/cart";
import { DEFAULT_SHOWCASE_MEDIA, DEFAULT_INTERACTIVE_SHOWCASE } from "@/lib/site-settings-constants";
import { ShowcaseMediaSettings, InteractiveShowcaseSettings, ShowcaseVariationItem } from "@/types/ecommerce";

interface Variation {
  id: string;
  name: string;
  finish: string;
  colorHex: string;
  lensColor?: SportsLensColor;
  frameColor?: SportsFrameColor;
  priceInCents: number;
  sku: string;
  slug: string;
  imageUrl?: string;
  isAmber?: boolean;
  isRound?: boolean;
}

interface ShowcaseData {
  category: "solar";
  gender: "masculino";
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

// Vitrine da Home: somente a linha Solar & Esportiva masculina.
const SHOWCASE_CONFIGS: { solar_masculino: ShowcaseData } = {
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
    featuredProductSlug: "ventara-horizonte-sport",
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
        slug: "ventara-horizonte-sport",
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
        slug: "ventara-horizonte-sport",
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
        slug: "ventara-horizonte-sport",
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
        slug: "ventara-horizonte-sport",
      },
    ],
  },
};

interface InteractiveShowcaseProps {
  onAddToCart?: (product: any) => void;
  onOpenCart?: (initialView?: "items" | "checkout") => void;
  onBuyNow?: (product: any) => void;
  showcaseEyebrow?: string;
  showcaseTitle?: string;
  showcaseSubtitle?: string;
}

export function InteractiveShowcase({
  onAddToCart,
  onOpenCart,
  onBuyNow,
  showcaseEyebrow,
  showcaseTitle,
  showcaseSubtitle,
}: InteractiveShowcaseProps) {
  const [selectedVarIndex, setSelectedVarIndex] = useState(0);
  const [addedItemSku, setAddedItemSku] = useState<string | null>(null);
  const [showcaseMedia, setShowcaseMedia] = useState<ShowcaseMediaSettings>(DEFAULT_SHOWCASE_MEDIA);
  const [showcaseConfigs, setShowcaseConfigs] =
    useState<InteractiveShowcaseSettings>(DEFAULT_INTERACTIVE_SHOWCASE);

  useEffect(() => {
    async function loadShowcaseData() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.showcase_media) {
            setShowcaseMedia((prev) => ({ ...prev, ...data.showcase_media }));
          }
          if (data.interactive_showcase) {
            setShowcaseConfigs((prev) => ({ ...prev, ...data.interactive_showcase }));
          }
        }
      } catch (err) {}
    }
    loadShowcaseData();
  }, []);

  const currentData = (showcaseConfigs.solar_masculino || SHOWCASE_CONFIGS.solar_masculino) as ShowcaseData;
  const activeVariation = currentData.variations[selectedVarIndex] || currentData.variations[0];

  const currentLifestyleImage = showcaseMedia.heroMaleSolar || currentData.lifestyleImage;

  const handleSelectVariation = (idx: number) => {
    setSelectedVarIndex(idx);
  };

  const handleBuyNow = () => {
    const cartItem: CartProduct = {
      id: activeVariation.id,
      name: `${currentData.featuredProductName} - ${activeVariation.name}`,
      slug: currentData.featuredProductSlug,
      category: "Solar",
      color: activeVariation.name,
      priceInCents: activeVariation.priceInCents,
      imageUrl: activeVariation.imageUrl || undefined,
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
        category: "Solar",
        color: activeVariation.name,
        priceInCents: activeVariation.priceInCents,
        imageUrl: activeVariation.imageUrl || undefined,
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
                {showcaseEyebrow || currentData.heroCategoryTags}
              </span>
            </div>

            {/* Headline com Destaque Dourado/Âmbar */}
            <h2 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-bold text-[#06111f] tracking-tight leading-[1.12]">
              {showcaseTitle ? (
                showcaseTitle
              ) : (
                <>
                  {currentData.heroTitle}{" "}
                  <span className="text-amber-500 font-extrabold">{currentData.heroHighlight}</span>
                </>
              )}
            </h2>

            {/* Subtítulo Convidativo */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal">
              {showcaseSubtitle || currentData.heroDescription}
            </p>

            {/* LINHA EXIBIDA: Solar + Esportivo, coleção masculina (única linha da vitrine) */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Sparkles size={14} className="text-amber-500" /> Personalize sua visualização:
                </span>
                <span className="text-[11px] text-amber-600 font-bold">Linha esportiva</span>
              </div>

              <ul className="flex flex-wrap gap-2" aria-label="Linha exibida">
                {[
                  { icon: Sun, label: "Óculos Solar" },
                  { icon: Zap, label: "Esportivo" },
                  { icon: User, label: "Coleção Masculina" },
                ].map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-slate-800"
                  >
                    <Icon size={14} className="text-amber-600" aria-hidden="true" />
                    {label}
                  </li>
                ))}
              </ul>
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
                  key="solar_masculino"
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
            </div>

            {/* Título da linha fora da foto (a foto será trocada por uma imagem-título) */}
            <div className="mt-4 flex items-start gap-3" data-testid="showcase-caption">
              <div className="w-1 self-stretch bg-amber-400 rounded-full flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold tracking-wider text-amber-600 uppercase">
                  {currentData.categoryBadge}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium mt-0.5 leading-snug">
                  {currentData.categorySubtitle}
                </p>
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
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="col-span-2 inline-flex min-h-[52px] items-center justify-center gap-2 whitespace-nowrap px-6 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-extrabold text-sm tracking-wider uppercase transition-all duration-200 shadow-md shadow-amber-400/20 cursor-pointer"
                >
                  <CreditCard size={16} className="text-slate-950" />
                  <span>Comprar agora</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddCurrentToCart}
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 whitespace-nowrap px-4 rounded-full bg-[#06111f] hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase transition-all cursor-pointer shadow-sm"
                >
                  {addedItemSku === activeVariation.sku ? (
                    <>
                      <Check size={16} className="text-emerald-400" />
                      <span>Adicionado!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={15} className="text-amber-400" />
                      <span>Salvar na sacola</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/produto/${currentData.featuredProductSlug}`}
                  className="group inline-flex min-h-[46px] items-center justify-center gap-1.5 whitespace-nowrap px-4 rounded-full border border-slate-300 bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 font-semibold text-xs tracking-wider uppercase transition-all cursor-pointer"
                >
                  <span>Ver opções</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-amber-600" />
                </Link>
              </div>

              {/* Garantias: preenche a coluna e reforça a decisão de compra */}
              <ul className="grid grid-cols-3 gap-2 pt-3 text-[11px] font-medium text-slate-600">
                {[
                  { icon: ShieldCheck, label: "Proteção UV400" },
                  { icon: Check, label: "Garantia de 1 ano" },
                  { icon: Sparkles, label: "Lentes polarizadas" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex flex-col items-center gap-1 rounded-xl border border-slate-200/80 bg-white/70 px-2 py-2.5 text-center">
                    <Icon size={15} className="text-amber-600" aria-hidden="true" />
                    <span className="leading-tight">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coluna da Foto e Miniaturas: No mobile aparece PRIMEIRO (order-1) */}
            <div className="order-1 lg:order-2 lg:col-span-7 space-y-5">
              
              {/* Moldura de Showcase Principal da Armação (Foto Sangrada Full-Bleed Luxo) */}
              <div className="relative bg-[#040d1a] rounded-3xl border border-slate-700/60 shadow-xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] min-h-[300px] sm:min-h-[380px] flex items-center justify-center group">
                {/* Glow Suave de Fundo */}
                <div className="absolute inset-0 bg-radial from-amber-400/10 via-transparent to-transparent pointer-events-none z-10" />

                {/* Badge da Variação Selecionada */}
                <div className="absolute top-4 left-4 flex items-center gap-2 z-20 pointer-events-none">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#06111f]/90 text-amber-300 border border-amber-400/30 backdrop-blur-md shadow-md">
                    {currentData.featuredProductName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-200 bg-black/60 px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-md shadow-md">
                    {activeVariation.name}
                  </span>
                </div>

                {/* Visual em Destaque da Armação com Foto Sangrada e Transição Suave */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeVariation.id}-${activeVariation.sku}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute inset-0 w-full h-full flex items-center justify-center"
                  >
                    {activeVariation.imageUrl && activeVariation.imageUrl.trim() !== "" ? (
                      <img
                        src={activeVariation.imageUrl}
                        alt={`${currentData.featuredProductName} - ${activeVariation.name}`}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full max-w-[420px] p-6 flex items-center justify-center">
                        <SportsFrameArt
                          lensColor={activeVariation.lensColor}
                          frameColor={activeVariation.frameColor}
                          className="w-full h-auto max-h-60 object-contain filter drop-shadow-2xl"
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Gradiente Escuro Inferior para Leitura Impecável */}
                <div className="absolute inset-x-0 bottom-0 h-24 sm:h-28 bg-gradient-to-t from-[#02070d] via-[#02070d]/80 to-transparent pointer-events-none z-10" />

                {/* Legenda do Acabamento Ativo no Rodapé do Card */}
                <div className="absolute bottom-3.5 inset-x-4 z-20 flex items-center justify-between text-xs pointer-events-none">
                  <p className="text-slate-300 font-medium drop-shadow-sm">
                    Acabamento: <strong className="text-amber-400 font-semibold">{activeVariation.finish}</strong>
                  </p>
                  <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono uppercase tracking-wider bg-black/50 px-2 py-0.5 rounded-md border border-white/10">
                    Linha Solar Premium
                  </span>
                </div>
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
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white z-10" />
                        )}

                        {/* Visual da Miniatura com Enquadramento Full */}
                        <div className="w-full aspect-[4/3] min-h-[96px] sm:min-h-[104px] bg-slate-900 rounded-xl flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform overflow-hidden relative border border-slate-200/50">
                          {v.imageUrl && v.imageUrl.trim() !== "" ? (
                            <img
                              src={v.imageUrl}
                              alt={v.name}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <SportsFrameArt
                              lensColor={v.lensColor}
                              frameColor={v.frameColor}
                              className="w-full h-full object-contain p-2"
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
