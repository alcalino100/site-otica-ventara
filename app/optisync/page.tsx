import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Sun,
  Layers,
  Cpu,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  MessageCircle,
  Award,
  Palette,
  Zap,
  Gamepad2,
  Monitor,
  Eye,
  Check,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getOptiSyncPageSettings } from "@/lib/optisync-settings";
import { OptiSyncBenefitItem } from "@/types/ecommerce";
import { PhotochromicSlider } from "@/components/optisync/photochromic-slider";
import { OptiSyncGalleryClient } from "@/components/optisync/optisync-gallery-client";
import { LineNavTabs } from "@/components/optisync/line-nav-tabs";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Lentes Digitais OPTiSYNC HD | Tecnologia Óptica de Alta Precisão",
  description:
    "Conheça as três linhas de lentes digitais OPTiSYNC: HD para adultos e telas, HD Fotossensível com transição UV e Kids Adventure com ultra resistência.",
  openGraph: {
    title: "Lentes Digitais OPTiSYNC HD | Alta Precisão Óptica",
    description:
      "Três linhas de produto especializadas: OPTiSYNC HD, Fotossensível e Kids Adventure com montagem computadorizada em laboratório próprio em Araçatuba/SP.",
    images: [
      {
        url: "/images/lenses/optisync/arte-08-hd-caixa-lente.jpg",
        width: 1200,
        height: 630,
        alt: "Lentes Digitais OPTiSYNC HD Óticas Ventara",
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: "/optisync",
  },
};

function getBenefitIcon(iconName: string) {
  switch (iconName.toLowerCase()) {
    case "cpu":
      return <Cpu size={22} className="text-sky-400" />;
    case "layers":
      return <Layers size={22} className="text-indigo-400" />;
    case "shieldcheck":
      return <ShieldCheck size={22} className="text-amber-400" />;
    case "award":
      return <Award size={22} className="text-emerald-400" />;
    case "sun":
      return <Sun size={22} className="text-amber-400" />;
    case "zap":
      return <Zap size={22} className="text-yellow-400" />;
    default:
      return <Sparkles size={22} className="text-sky-400" />;
  }
}

export default async function OptiSyncPage() {
  const settings = await getOptiSyncPageSettings();

  const isCustomBg =
    settings.bgMode === "custom_image" &&
    Boolean(settings.customBgDesktopUrl && settings.customBgDesktopUrl.trim().length > 0);

  const cleanPhone = "5518996155748";
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    settings.ctaWhatsappMessage ||
      "Olá! Gostaria de consultar um técnico óptico sobre as lentes digitais OPTiSYNC HD da Ventara e enviar minha receita médica."
  )}`;

  // Default color fallbacks based on measured artwork colors
  const colorBaseFrom = settings.gradientBaseFrom || "#000933";
  const colorBaseTo = settings.gradientBaseTo || "#020716";
  const colorVioletLeft = settings.colorVioletLeft || "#4C01AE";
  const colorVioletGlow = settings.colorVioletGlow || "#7A2CFF";
  const colorBlueRight = settings.colorBlueRight || "#0044C9";
  const colorMagentaSpot = settings.colorMagentaSpot || "#B93DAA";
  const colorYellowAccent = settings.colorYellowAccent || "#FFC21A";

  const hd = settings.hdLine;
  const photochromic = settings.photochromicLine;
  const kids = settings.kidsLine;

  return (
    <div className="theme-futuristic-lenses min-h-screen bg-[#000933] text-[#F4F6FF] flex flex-col font-sans selection:bg-[#FFC21A] selection:text-slate-950 relative overflow-x-hidden">
      {/* Header Oficial Ventara Integrado */}
      <Header theme="dark" />

      {/* ====================================================================
          1. FUNDO TECNOLÓGICO LEVE (CSS / SVG) COM CORES MEDIDAS DAS ARTES
          ==================================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {isCustomBg ? (
          <div className="absolute inset-0 w-full h-full">
            <picture>
              {settings.customBgMobileUrl && (
                <source media="(max-width: 768px)" srcSet={settings.customBgMobileUrl} />
              )}
              <img
                src={settings.customBgDesktopUrl}
                alt=""
                className={`w-full h-full object-cover object-${settings.bgFocalPoint || "center"}`}
              />
            </picture>
            <div
              className="absolute inset-0 bg-[#000933]"
              style={{ opacity: (settings.bgOverlayOpacity ?? 70) / 100 }}
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background: `radial-gradient(ellipse at 50% 25%, ${colorBaseFrom} 0%, ${colorBaseTo} 70%, #00051E 100%)`,
            }}
          >
            {/* Feixe Esquerdo: Violeta Profundo (#4C01AE) */}
            <div
              className={`absolute -top-16 -left-20 sm:-top-32 sm:-left-40 w-[320px] h-[340px] sm:w-[680px] sm:h-[720px] rounded-full blur-2xl sm:blur-[140px] pointer-events-none transform -rotate-12 ${
                settings.enableAnimation ? "sm:animate-lens-glow" : ""
              }`}
              style={{
                background: `linear-gradient(135deg, ${colorVioletLeft} 0%, ${colorVioletGlow} 40%, transparent 70%)`,
                opacity: ((settings.beamsIntensity ?? 85) / 100) * 0.6,
              }}
            />

            {/* Feixe Direito: Azul Elétrico (#0044C9) */}
            <div
              className="absolute top-10 right-[-60px] sm:top-20 sm:right-[-100px] w-[280px] h-[300px] sm:w-[620px] sm:h-[650px] rounded-full blur-2xl sm:blur-[150px] pointer-events-none transform rotate-45"
              style={{
                background: `linear-gradient(225deg, ${colorBlueRight} 0%, transparent 65%)`,
                opacity: ((settings.beamsIntensity ?? 85) / 100) * 0.5,
              }}
            />

            {/* Ponto Central de Brilho Magenta (#B93DAA) */}
            <div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[160px] sm:w-[700px] sm:h-[320px] blur-2xl sm:blur-[150px] pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${colorMagentaSpot} 0%, ${colorVioletGlow} 35%, transparent 75%)`,
                opacity: ((settings.glowIntensity ?? 80) / 100) * 0.35,
              }}
            />

            {/* Grade HUD Tecnológica */}
            <div className="absolute inset-0 lens-hud-grid opacity-20 sm:opacity-25" />

            {/* Linhas Horizontais de Luz (HUD) */}
            <div className="absolute top-[35%] inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0044C9]/40 to-transparent" />
            <div className="absolute top-[65%] inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7A2CFF]/30 to-transparent" />
          </div>
        )}
      </div>

      <main className="flex-1 relative z-10 isolate pt-20 sm:pt-28 pb-12 sm:pb-16 transform-gpu">
        {/* ====================================================================
            2. HERO SECTION COM RETRATO OFICIAL, CAIXA E LOGO
            ==================================================================== */}
        {settings.showHero && (
          <section className="relative px-4 sm:px-6 lg:px-10 pt-4 sm:pt-12 pb-10 sm:pb-20 border-b border-white/10">
            <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                
                {/* Coluna de Textos & Ações */}
                <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                  {/* Badge de Tecnologia */}
                  <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0044C9]/20 border border-[#0044C9]/50 text-sky-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
                    <Sparkles size={14} className="text-[#FFC21A] animate-pulse" />
                    <span>{settings.heroBadge || "ENGENHARIA ÓPTICA DIGITAL"}</span>
                  </div>

                  {/* Título Principal com Acento Amarelo da Marca */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
                    {settings.heroTitle || "Lentes Digitais"} <br />
                    <span className="text-[#FFC21A] drop-shadow-[0_0_25px_rgba(255,194,26,0.35)]">
                      {settings.heroTitleHighlight || "OPTiSYNC HD"}
                    </span>
                  </h1>

                  {/* Subtítulo Descritivo com Alta Legibilidade */}
                  <p className="text-xs sm:text-base text-[#B8C2E6] leading-relaxed max-w-2xl font-normal">
                    {settings.heroDescription ||
                      "Surfaçagem digital computadorizada ponto a ponto com ampliação de campo visual útil, tratamento antirreflexo multicamadas hidrorrepelente e montagem computadorizada em laboratório próprio."}
                  </p>

                  {/* Pílulas de Características Técnicas */}
                  {settings.heroFeatures && settings.heroFeatures.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-2">
                      {settings.heroFeatures.map((feat, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/[0.06] border border-[#0044C9]/30 text-[11px] sm:text-xs text-[#F4F6FF] font-medium backdrop-blur-sm"
                        >
                          <CheckCircle2 size={13} className="text-[#FFC21A] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botões de Ação Duplos */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-4">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-[#FFC21A] hover:bg-[#ffd147] text-[#000933] font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-400/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <MessageCircle size={17} className="text-[#000933]" />
                      <span>{settings.ctaButtonText || "Consultar Óptico no WhatsApp"}</span>
                      <ArrowRight size={15} />
                    </a>

                    <Link
                      href="#secao-cores"
                      className="inline-flex items-center gap-2 px-4 sm:px-5 py-3.5 sm:py-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-xs sm:text-sm border border-[#0044C9]/40 hover:border-sky-400/50 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
                    >
                      <Palette size={16} className="text-[#FFC21A]" />
                      <span>Ver Lentes Coloridas &amp; Solares</span>
                    </Link>
                  </div>
                </div>

                {/* Coluna Visual: Retrato Hero (Arte 9) e Caixa Oficial (Arte 8) */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                  {/* Brilho Radial Atrás da Imagem */}
                  <div
                    className="absolute w-56 h-56 sm:w-80 sm:h-80 rounded-full blur-[50px] sm:blur-[80px] pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${colorBlueRight} 0%, ${colorVioletGlow} 60%, transparent 100%)`,
                      opacity: ((settings.glowIntensity ?? 80) / 100) * 0.75,
                    }}
                  />

                  {/* Card Visual com Retrato Hero ou Caixa Oficial */}
                  <div className="relative w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl p-3 sm:p-5 lens-gradient-border shadow-2xl z-10 space-y-3">
                    <div className="relative aspect-[4/5] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#020716] border border-[#0044C9]/40 shadow-inner">
                      <Image
                        src={
                          settings.heroPortraitUrl ||
                          settings.productBoxImage ||
                          "/images/lenses/optisync/arte-09-hd-hero-retrato.jpg"
                        }
                        alt={settings.productAltText || "Lentes Digitais OPTiSYNC HD"}
                        fill
                        sizes="(max-width: 768px) 100vw, 420px"
                        priority
                        className="object-cover"
                      />
                    </div>

                    {/* Barra de Status Tecnológica no Rodapé do Card */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-[#B8C2E6] flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                        Surfaçagem Digital 3D
                      </span>
                      <span className="font-bold text-[#FFC21A] flex items-center gap-1 text-[11px] sm:text-xs">
                        <Award size={13} className="text-[#FFC21A]" />
                        Garantia 12 Meses
                      </span>
                    </div>
                  </div>

                  {/* Reflexo Espelhado do Produto no Piso (Otimizado para Desktop) */}
                  {settings.enableFloorReflection && (
                    <div className="hidden sm:block w-full max-w-sm sm:max-w-md h-16 sm:h-20 overflow-hidden relative mt-1 lens-floor-reflection z-0 select-none">
                      <div className="relative aspect-[4/5] w-full">
                        <Image
                          src={
                            settings.heroPortraitUrl ||
                            settings.productBoxImage ||
                            "/images/lenses/optisync/arte-09-hd-hero-retrato.jpg"
                          }
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 420px"
                          aria-hidden="true"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Seletor Rápido de 3 Linhas de Produto (Tabs / Navegação) */}
              {settings.showLineSelector !== false && (
                <div className="pt-2 sm:pt-4">
                  <LineNavTabs
                    hdTitle={hd?.titleHighlight ? `${hd.title} ${hd.titleHighlight}` : "OPTiSYNC HD (Adulto)"}
                    photochromicTitle={photochromic?.titleHighlight ? `${photochromic.title} ${photochromic.titleHighlight}` : "HD Fotossensível"}
                    kidsTitle={kids?.titleHighlight ? `${kids.title} ${kids.titleHighlight}` : "Kids Adventure"}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ====================================================================
            3. BLOCO 1: LINHA OPTISYNC HD (ADULTO & USO DIGITAL)
            ==================================================================== */}
        {hd?.enabled !== false && (
          <section id="linha-hd" className="scroll-mt-24 sm:scroll-mt-28 px-4 sm:px-6 lg:px-10 py-10 sm:py-20 lg:py-24 border-b border-white/10 relative">
            <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
              <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
                <div className="max-w-2xl space-y-3">
                  <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-widest block font-mono">
                    {hd?.badge || "LINHA ADULTO & USO DIGITAL"}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {hd?.title || "Lentes Digitais"}{" "}
                    <span className="text-[#FFC21A]">{hd?.titleHighlight || "OPTiSYNC HD"}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#B8C2E6] leading-relaxed">
                    {hd?.description ||
                      "Desenvolvidas com cálculo de surfaçagem ponto a ponto e tratamento Blue Shield, eliminando aberrações ópticas e cansaço visual digital prolongado."}
                  </p>
                </div>

                {hd?.ctaLink && (
                  <Link
                    href={hd.ctaLink}
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#0044C9] hover:bg-[#1E5BFF] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#0044C9]/40 transition-all cursor-pointer"
                  >
                    <span>{hd.ctaText || "Ver Catálogo HD"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Grid de Artes da Linha HD (Artes 8, 5, 10, 6) em 2 colunas mobile / 4 desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {/* Arte 8: Caixa e Lente */}
                {hd?.productImageUrl && (
                  <article className="lens-gradient-border p-3 sm:p-4 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 group hover:translate-y-[-3px] transition-transform">
                    <div className="relative aspect-[4/5] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#020716] border border-[#0044C9]/30">
                      <Image
                        src={hd.productImageUrl}
                        alt="Caixa e lente oficial OPTiSYNC HD"
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <span className="text-[9px] sm:text-[10px] uppercase font-mono text-[#FFC21A]">Produto Oficial</span>
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate sm:whitespace-normal">Precisão Ponto a Ponto</h3>
                      <p className="text-[10px] sm:text-xs text-[#B8C2E6] line-clamp-2">Lapidação com corte tridimensional sob medida.</p>
                    </div>
                  </article>
                )}

                {/* Arte 5: Gamer / Uso Digital */}
                {hd?.gamerImageUrl && (
                  <article className="lens-gradient-border p-3 sm:p-4 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 group hover:translate-y-[-3px] transition-transform">
                    <div className="relative aspect-[4/5] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#020716] border border-[#0044C9]/30">
                      <Image
                        src={hd.gamerImageUrl}
                        alt="Jovem gamer usando lentes OPTiSYNC HD Blue Shield"
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <span className="text-[9px] sm:text-[10px] uppercase font-mono text-sky-400">Gamer &amp; Telas</span>
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate sm:whitespace-normal">Blue Shield Integrado</h3>
                      <p className="text-[10px] sm:text-xs text-[#B8C2E6] line-clamp-2">Proteção ativa contra emissão de luz azul nociva.</p>
                    </div>
                  </article>
                )}

                {/* Arte 10: Escritório e Ergonomia */}
                {hd?.officeImageUrl && (
                  <article className="lens-gradient-border p-3 sm:p-4 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 group hover:translate-y-[-3px] transition-transform">
                    <div className="relative aspect-[4/5] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#020716] border border-[#0044C9]/30">
                      <Image
                        src={hd.officeImageUrl}
                        alt="Profissional no computador com óculos de grau OPTiSYNC"
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <span className="text-[9px] sm:text-[10px] uppercase font-mono text-[#B8C2E6]">Trabalho &amp; Home Office</span>
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate sm:whitespace-normal">Conforto Contínuo</h3>
                      <p className="text-[10px] sm:text-xs text-[#B8C2E6] line-clamp-2">Alívio do estresse visual para longas jornadas.</p>
                    </div>
                  </article>
                )}

                {/* Arte 6: Precisão Robótica de Laboratório */}
                {hd?.robotImageUrl && (
                  <article className="lens-gradient-border p-3 sm:p-4 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 group hover:translate-y-[-3px] transition-transform">
                    <div className="relative aspect-[4/5] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#020716] border border-[#0044C9]/30">
                      <Image
                        src={hd.robotImageUrl}
                        alt="Braço robótico de precisão laboratorial OPTiSYNC"
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <span className="text-[9px] sm:text-[10px] uppercase font-mono text-[#7A2CFF]">Engenharia Óptica</span>
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate sm:whitespace-normal">Corte Milimétrico</h3>
                      <p className="text-[10px] sm:text-xs text-[#B8C2E6] line-clamp-2">Usinagem digital de altíssima fidelidade.</p>
                    </div>
                  </article>
                )}
              </div>

              {/* Diferenciais da Linha HD */}
              {hd?.features && hd.features.length > 0 && (
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-[#0044C9]/30 backdrop-blur-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {hd.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-[#F4F6FF]">
                        <Check className="w-4 h-4 text-[#FFC21A] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ====================================================================
            4. BLOCO 2: LINHA OPTISYNC HD FOTOSSENSÍVEL (COM SLIDER INTERATIVO)
            ==================================================================== */}
        {photochromic?.enabled !== false && (
          <section id="linha-fotossensivel" className="scroll-mt-24 sm:scroll-mt-28 px-4 sm:px-6 lg:px-10 py-10 sm:py-20 lg:py-24 border-b border-white/10 relative">
            <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
              <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
                <div className="max-w-2xl space-y-3">
                  <span className="text-xs font-bold text-[#7A2CFF] uppercase tracking-widest block font-mono">
                    {photochromic?.badge || "TECNOLOGIA FOTOSSENSÍVEL ADULTO"}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {photochromic?.title || "OPTiSYNC HD"}{" "}
                    <span className="text-[#FFC21A]">{photochromic?.titleHighlight || "Fotossensível"}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#B8C2E6] leading-relaxed">
                    {photochromic?.description ||
                      "Lentes inteligentes que clareiam com rapidez em ambientes internos e escurecem sob o sol, bloqueando 100% dos raios UVA/UVB com conforto total."}
                  </p>
                </div>

                {photochromic?.ctaLink && (
                  <Link
                    href={photochromic.ctaLink}
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#7A2CFF] to-[#0044C9] hover:from-[#9247FF] hover:to-[#1E5BFF] text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
                  >
                    <span>{photochromic.ctaText || "Ver Modelos Fotossensíveis"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              {/* Grid Principal: Simulador Interativo + Grade dos 3 Estados */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                
                {/* Coluna Esquerda (7 cols): Simulador Interativo com Teclado e Touch */}
                <div className="lg:col-span-7 space-y-3 sm:space-y-4">
                  <div className="space-y-0.5 sm:space-y-1">
                    <span className="text-xs font-mono text-[#FFC21A] uppercase">Simulador Dinâmico</span>
                    <h3 className="text-base sm:text-lg font-bold text-white">Transição Óptica Inteligente</h3>
                  </div>

                  <PhotochromicSlider
                    clearImageUrl={photochromic?.clearStateImageUrl || "/images/lenses/optisync-hd.jpg"}
                    darkImageUrl={photochromic?.darkStateImageUrl || "/images/lenses/optisync-fotossensivel-box.jpg"}
                    bannerImageUrl={photochromic?.halfDarkBannerUrl || "/images/lenses/optisync/arte-07-fotossensivel-banner.jpg"}
                    altText="Comparação de lentes fotossensíveis límpida vs escurecida"
                    transitionSpeedText={photochromic?.transitionSpeedText || "Ativação em até 30 segundos sob radiação UV"}
                  />
                </div>

                {/* Coluna Direita (5 cols): Arte 4 (3 Estados Homem/Mulher) ou Arte 7 */}
                <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                  <div className="space-y-0.5 sm:space-y-1">
                    <span className="text-xs font-mono text-sky-400 uppercase">Ambientes de Uso</span>
                    <h3 className="text-base sm:text-lg font-bold text-white">3 Fases de Luminosidade</h3>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-[#7A2CFF]/40 bg-[#000933]/90 shadow-2xl">
                    <div className="relative aspect-[3/2] w-full">
                      <Image
                        src={
                          photochromic?.threeStatesGridUrl ||
                          photochromic?.halfDarkBannerUrl ||
                          "/images/lenses/optisync/arte-04-fotossensivel-estados.jpg"
                        }
                        alt="Três estados da lente fotossensível em homem e mulher"
                        fill
                        loading="lazy"
                        sizes="(max-width: 1024px) 100vw, 500px"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3 sm:p-4 space-y-1 bg-[#00051E]/90 border-t border-[#7A2CFF]/30">
                      <p className="text-xs text-[#F4F6FF] font-semibold">
                        Ambiente Interno · Meia Luz · Sol Pleno
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-[#B8C2E6] leading-relaxed">
                        A molécula fotossensível reage aos fótons UV sem distorcer as cores reais.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Diferenciais da Linha Fotossensível */}
              {photochromic?.features && photochromic.features.length > 0 && (
                <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/[0.03] border border-[#7A2CFF]/30 backdrop-blur-md">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {photochromic.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] sm:text-xs text-[#F4F6FF]">
                        <Check className="w-3.5 h-3.5 text-[#FFC21A] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ====================================================================
            5. BLOCO 3: LINHA OPTISYNC KIDS ADVENTURE (INFANTIL)
            ==================================================================== */}
        {kids?.enabled !== false && (
          <section id="linha-kids" className="scroll-mt-24 sm:scroll-mt-28 px-4 sm:px-6 lg:px-10 py-10 sm:py-20 lg:py-24 border-b border-white/10 relative">
            <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                
                {/* Coluna Esquerda (5 cols): Pôster Menino Kids Adventure (Arte 1) */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative w-full max-w-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 lens-gradient-border shadow-2xl">
                    <div className="relative aspect-[4/5] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#020716] border border-[#FFC21A]/40 shadow-inner">
                      <Image
                        src={kids?.posterBoyUrl || "/images/lenses/optisync/arte-01-kids-poster.jpg"}
                        alt="Menino sorridente com óculos da linha OptiSYNC Kids Adventure"
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover"
                      />
                    </div>

                    {/* Logo 3D Kids Adventure Embutido (Arte 3) */}
                    {kids?.logo3dUrl && (
                      <div className="mt-2.5 sm:mt-3 flex items-center justify-between p-2 rounded-xl bg-[#00051E]/80 border border-[#FFC21A]/30">
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0">
                          <Image
                            src={kids.logo3dUrl}
                            alt="Logo 3D Kids Adventure"
                            fill
                            sizes="48px"
                            className="object-contain"
                          />
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] sm:text-[10px] font-mono text-[#FFC21A] uppercase block">Linha Oficial</span>
                          <span className="text-xs font-bold text-white">Kids Adventure 3D</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Coluna Direita (7 cols): Textos Acolhedores e Neutros */}
                <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFC21A]/15 border border-[#FFC21A]/40 text-[#FFC21A] text-xs font-bold uppercase tracking-wider">
                    <Sparkles size={14} />
                    <span>{kids?.badge || "LINHA INFANTIL & JUVENIL"}</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    {kids?.title || "OPTiSYNC"}{" "}
                    <span className="text-[#FFC21A]">{kids?.titleHighlight || "Kids Adventure"}</span>
                  </h2>

                  <p className="text-xs sm:text-base text-[#B8C2E6] leading-relaxed max-w-xl">
                    {kids?.description ||
                      "Produzidas em materiais de alta tenacidade contra impactos acidentais na escola e brincadeiras, com leveza extrema e proteção contra luz azul e radiação solar."}
                  </p>

                  {/* Diferenciais Kids */}
                  {kids?.features && kids.features.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2">
                      {kids.features.map((feat, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-white/[0.04] border border-[#FFC21A]/20 text-xs text-[#F4F6FF]"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#FFC21A] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                    <Link
                      href={kids?.ctaLink || "/armacoes?categoria=infantil"}
                      className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#FFC21A] hover:bg-[#ffd147] text-[#000933] font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>{kids?.ctaText || "Ver Armações Infantis"}</span>
                      <ArrowRight size={15} />
                    </Link>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 sm:py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer backdrop-blur-md"
                    >
                      <MessageCircle size={16} className="text-[#FFC21A]" />
                      <span>Falar com Especialista Infantil</span>
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            6. BLOCO 4: GALERIA DE ARTES COM LIGHTBOX ACESSÍVEL
            ==================================================================== */}
        {settings.showGallery !== false && settings.galleryItems && settings.galleryItems.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-10 py-10 sm:py-20 lg:py-24 border-b border-white/10 relative">
            <div className="max-w-7xl mx-auto">
              <OptiSyncGalleryClient
                items={settings.galleryItems}
                title={settings.galleryTitle}
                subtitle={settings.gallerySubtitle}
              />
            </div>
          </section>
        )}

        {/* ====================================================================
            7. BENEFÍCIOS & PILARES DA ENGENHARIA ÓPTICA
            ==================================================================== */}
        {settings.showBenefits && (
          <section className="px-4 sm:px-6 lg:px-10 py-10 sm:py-20 lg:py-24 border-b border-white/10 relative">
            <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-3">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block font-mono">
                  DIFERENCIAIS CONSTRUTIVOS
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {settings.benefitsTitle || "Por que a OPTiSYNC HD transforma a sua visão?"}
                </h2>
                <p className="text-xs sm:text-sm text-[#B8C2E6] leading-relaxed">
                  {settings.benefitsSubtitle ||
                    "Projetada para proporcionar nitidez contínua e conforto óptico com tratamentos certificados."}
                </p>
              </div>

              {/* Grid 2 colunas no mobile / 4 no desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {(settings.benefitsList || []).map((b: OptiSyncBenefitItem) => (
                  <article
                    key={b.id}
                    className="lens-gradient-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 hover:translate-y-[-3px] transition-transform duration-300 group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                      {getBenefitIcon(b.icon)}
                    </div>
                    <h3 className="text-xs sm:text-base font-bold text-white tracking-tight">{b.title}</h3>
                    <p className="text-[10px] sm:text-xs text-[#B8C2E6] leading-relaxed font-normal line-clamp-3 sm:line-clamp-none">{b.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            8. TABELA COMPARATIVA DIRETA: CONVENCIONAL VS OPTISYNC HD
            ==================================================================== */}
        {settings.showComparison && settings.comparisonRows && settings.comparisonRows.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-10 py-10 sm:py-20 lg:py-24 border-b border-white/10 relative">
            <div className="max-w-5xl mx-auto space-y-6 sm:space-y-10">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block font-mono">
                  COMPARAÇÃO TÉCNICA
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {settings.comparisonTitle || "Lente Convencional vs OPTiSYNC HD"}
                </h2>
                <p className="text-xs sm:text-sm text-[#B8C2E6]">
                  {settings.comparisonSubtitle ||
                    "Entenda as diferenças entre processos convencionais e o padrão digital OPTiSYNC."}
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl sm:rounded-3xl border border-white/15 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
                <div className="sm:hidden px-4 pt-3 pb-1 text-[11px] font-mono text-sky-300 flex items-center justify-between border-b border-white/10">
                  <span>← Deslize para comparar →</span>
                  <span className="text-[#FFC21A] font-bold">OPTiSYNC HD</span>
                </div>
                <table className="w-full min-w-[540px] sm:min-w-0 text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04]">
                      <th className="py-3 sm:py-4 px-3 sm:px-6 font-bold text-slate-300 w-1/3 uppercase text-[10px] sm:text-[11px] tracking-wider">
                        Característica
                      </th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 font-medium text-slate-400 w-1/3 uppercase text-[10px] sm:text-[11px] tracking-wider">
                        Lentes Convencionais
                      </th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 font-extrabold text-white bg-sky-950/40 w-1/3 border-l border-sky-500/30">
                        <div className="flex items-center gap-1.5 text-sky-300 uppercase text-[10px] sm:text-[11px] tracking-wider">
                          <Sparkles size={13} className="text-[#FFC21A]" />
                          <span>OPTiSYNC HD</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {settings.comparisonRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3 sm:py-4 px-3 sm:px-6 font-bold text-slate-100">
                          {row.feature}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-slate-400 leading-relaxed">
                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <XCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                            <span>{row.traditional}</span>
                          </div>
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-slate-100 font-medium bg-sky-950/20 border-l border-sky-500/20 leading-relaxed">
                          <div className="flex items-start gap-1.5 sm:gap-2">
                            <CheckCircle2 size={14} className="text-[#FFC21A] shrink-0 mt-0.5" />
                            <span>{row.optisync}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            9. DESTAQUE DO LABORATÓRIO PRÓPRIO EM ARAÇATUBA
            ==================================================================== */}
        {settings.showLabHighlight && (
          <section className="px-4 sm:px-6 lg:px-10 py-10 sm:py-20 lg:py-24 border-b border-white/10">
            <div className="max-w-6xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#061233] via-[#040c26] to-[#020716] p-6 sm:p-12 lg:p-16 border border-sky-500/25 shadow-2xl">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

                <div className="relative z-10 max-w-3xl space-y-4 sm:space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <Award size={14} />
                    <span>{settings.labBadge || "LABORATÓRIO ÓPTICO PRÓPRIO EM ARAÇATUBA"}</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
                    {settings.labTitle || "Do cálculo computadorizado à montagem milimétrica"}{" "}
                    <span className="text-[#FFC21A]">{settings.labTitleHighlight || "em nossa sede"}</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-[#B8C2E6] leading-relaxed font-normal">
                    {settings.labDescription ||
                      "Com usinagem e lensometria computadorizada na Rua Princesa Isabel, 221 em Araçatuba/SP, suas lentes OPTiSYNC HD são confeccionadas e inspecionadas por profissionais técnicos em óptica, com montagem expressa e rastreabilidade total."}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-white/10 text-xs font-mono">
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/[0.04] border border-white/10">
                      <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase">Facetadoras</span>
                      <span className="text-white font-bold text-xs sm:text-sm">Corte Computadorizado</span>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/[0.04] border border-white/10">
                      <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase">Inspeção</span>
                      <span className="text-white font-bold text-xs sm:text-sm">100% dos Pares Aferidos</span>
                    </div>
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/[0.04] border border-white/10 col-span-2 sm:col-span-1">
                      <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase">Origem</span>
                      <span className="text-[#FFC21A] font-bold text-xs sm:text-sm">
                        {settings.labOrigin || "Araçatuba · SP"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            10. SEÇÃO DE CORES & BANNER ARTE 2 (PARTE DE BAIXO DA PÁGINA)
            ==================================================================== */}
        <section id="secao-cores" className="scroll-mt-24 sm:scroll-mt-28 px-4 sm:px-6 lg:px-10 py-10 sm:py-20 lg:py-24 border-b border-white/10 relative">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-[#FFC21A] uppercase tracking-widest block font-mono">
                MOSTRUÁRIO EXCLUSIVO
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {settings.colorsBannerTitle || "Lentes Coloridas & Tonalidades Solares"}
              </h2>
              <p className="text-xs sm:text-sm text-[#B8C2E6]">
                {settings.colorsBannerSubtitle ||
                  "Personalize sua armação com lentes graduadas em tonalidades solares exclusivas, com proteção UV400 total e antirreflexo interno."}
              </p>
            </div>

            {/* Banner Oficial da Arte 2 (Seis Lentes Coloridas) */}
            {Boolean(settings.colorsBannerUrl || "/images/lenses/optisync/arte-02-cores-banner.jpg") && (
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#0044C9]/40 bg-[#000933]/90 shadow-2xl">
                <div className="relative aspect-[3/2] sm:aspect-[21/9] w-full">
                  <Image
                    src={settings.colorsBannerUrl || "/images/lenses/optisync/arte-02-cores-banner.jpg"}
                    alt={settings.colorsBannerAlt || "Seis lentes coloridas em exposição"}
                    fill
                    loading="lazy"
                    sizes="(max-width: 1200px) 100vw, 1100px"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 sm:p-6 bg-[#00051E]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs font-mono text-[#FFC21A] uppercase font-bold">Paleta de Tonalidades Solares</span>
                    <p className="text-xs text-[#B8C2E6]">
                      Disponíveis com a sua graduação exata prescrita pelo oftalmologista.
                    </p>
                  </div>
                  <Link
                    href="/lentes#secao-cores"
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#FFC21A] hover:bg-[#ffd147] text-[#000933] font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
                  >
                    <Palette className="w-4 h-4 text-[#000933]" />
                    <span>Acessar Seção de Cores no Catálogo</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ====================================================================
            11. PERGUNTAS FREQUENTES (FAQ)
            ==================================================================== */}
        {settings.showFaq && settings.faqsList && settings.faqsList.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-10 py-10 sm:py-20 lg:py-24 border-b border-white/10">
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block font-mono">
                  TIRA-DÚVIDAS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Perguntas Frequentes sobre a OPTiSYNC HD
                </h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {settings.faqsList.map((faq, index) => (
                  <article
                    key={index}
                    className="p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 backdrop-blur-md"
                  >
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-start gap-2.5">
                      <HelpCircle size={18} className="text-[#FFC21A] shrink-0 mt-0.5" />
                      <span>{faq.q}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-[#B8C2E6] leading-relaxed pl-7 font-normal">
                      {faq.a}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            12. CTA FINAL WHATSAPP (ATENDIMENTO ESPECIALIZADO)
            ==================================================================== */}
        {settings.showWhatsappCta && (
          <section className="px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
            <div className="max-w-4xl mx-auto text-center space-y-5 sm:space-y-6">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block font-mono">
                {settings.ctaBadge || "ATENDIMENTO ESPECIALIZADO"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {settings.ctaTitle || "Pronto para enxergar com definição"}{" "}
                <span className="text-[#FFC21A]">
                  {settings.ctaTitleHighlight || "OPTiSYNC HD?"}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-[#B8C2E6] max-w-xl mx-auto leading-relaxed">
                {settings.ctaSubtitle ||
                  "Envie sua receita oftálmica diretamente aos nossos ópticos em Araçatuba para uma conferência técnica completa e orçamento sob medida."}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#FFC21A] hover:bg-[#ffd147] text-[#000933] font-bold text-xs sm:text-sm tracking-wide transition-all shadow-xl active:scale-95 cursor-pointer"
                >
                  <MessageCircle size={18} className="text-[#000933]" />
                  <span>{settings.ctaButtonText || "Consultar Óptico no WhatsApp"}</span>
                  <ArrowRight size={16} />
                </a>

                {settings.showColorsCta && (
                  <Link
                    href="#secao-cores"
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer backdrop-blur-md"
                  >
                    <Palette size={16} className="text-[#FFC21A]" />
                    <span>Ver Seção de Cores &amp; Solares</span>
                  </Link>
                )}
              </div>

              {settings.ctaBusinessHours && (
                <p className="text-[11px] text-slate-400 font-mono">
                  {settings.ctaBusinessHours}
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
