import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Eye,
  Sun,
  Layers,
  Cpu,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  MessageCircle,
  Clock,
  Award,
  Palette,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getOptiSyncPageSettings } from "@/lib/optisync-settings";
import { OptiSyncBenefitItem } from "@/types/ecommerce";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Lentes Digitais OPTiSYNC HD | Tecnologia Óptica de Alta Precisão",
  description:
    "Conheça as lentes digitais OPTiSYNC HD: surfaçagem ponto a ponto computadorizada, tratamento antirreflexo hidrorrepelente e montagem expressa em laboratório próprio em Araçatuba/SP.",
  openGraph: {
    title: "Lentes Digitais OPTiSYNC HD | Alta Precisão Óptica",
    description:
      "Nitidez estendida de borda a borda, filtro de luz azul e antirreflexo multicamadas com montagem em laboratório próprio em Araçatuba.",
    images: [
      {
        url: "/images/lenses/optisync-box.jpg",
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

  return (
    <div className="theme-futuristic-lenses min-h-screen bg-[#040B2B] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 relative overflow-x-hidden">
      {/* Header Oficial Ventara com Visual Preto Escuro Integrado */}
      <Header theme="dark" />

      {/* ====================================================================
          1. FUNDO TECNOLÓGICO LEVE (CSS / SVG) E ARTE PERSONALIZADA DO CLIENTE
          ==================================================================== */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {isCustomBg ? (
          // Modo Imagem Personalizada do Cliente com Overlay Controlável
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
              className="absolute inset-0 bg-[#040B2B]"
              style={{ opacity: (settings.bgOverlayOpacity ?? 70) / 100 }}
            />
          </div>
        ) : (
          // Modo Código Padrão: Gradiente Azul-Índigo Profundo + Feixes Diagonais Elétricos
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background: `radial-gradient(ellipse at 50% 20%, ${settings.gradientBaseTo || "#0A1A6B"} 0%, ${settings.gradientBaseFrom || "#040B2B"} 70%, #020716 100%)`,
            }}
          >
            {/* Feixe Diagonal 1: Azul Elétrico (#1E4BFF) */}
            <div
              className={`absolute -top-32 -left-40 w-[680px] h-[720px] rounded-full blur-[140px] pointer-events-none transform -rotate-12 ${
                settings.enableAnimation ? "animate-lens-glow" : ""
              }`}
              style={{
                background: `linear-gradient(135deg, ${settings.beamColorBlue || "#1E4BFF"} 0%, transparent 70%)`,
                opacity: (settings.beamsIntensity ?? 85) / 100 * 0.55,
              }}
            />

            {/* Feixe Diagonal 2: Roxo Elétrico (#7A2CFF) */}
            <div
              className="absolute top-20 right-[-100px] w-[620px] h-[650px] rounded-full blur-[150px] pointer-events-none transform rotate-45"
              style={{
                background: `linear-gradient(225deg, ${settings.beamColorPurple || "#7A2CFF"} 0%, transparent 65%)`,
                opacity: (settings.beamsIntensity ?? 85) / 100 * 0.45,
              }}
            />

            {/* Feixe Central de Conexão Óptica */}
            <div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[360px] blur-[160px] pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${settings.beamColorBlue || "#1E4BFF"} 0%, ${settings.beamColorPurple || "#7A2CFF"} 40%, transparent 80%)`,
                opacity: (settings.glowIntensity ?? 80) / 100 * 0.35,
              }}
            />

            {/* Grade HUD Tecnológica com Linhas Finas */}
            <div className="absolute inset-0 lens-hud-grid opacity-35" />

            {/* Linhas Horizontais de Luz (HUD) */}
            <div className="absolute top-[35%] inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/25 to-transparent" />
            <div className="absolute top-[65%] inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
          </div>
        )}
      </div>

      <main className="flex-1 relative z-10 pt-24 sm:pt-28 pb-16">
        {/* ====================================================================
            2. HERO SECTION COM O PRODUTO E REFLEXO DE PISO
            ==================================================================== */}
        {settings.showHero && (
          <section className="relative px-4 sm:px-6 lg:px-10 pt-8 sm:pt-14 pb-16 sm:pb-24 border-b border-white/10">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                
                {/* Coluna de Textos & Ações */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Badge de Tecnologia */}
                  <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-sky-950/60 border border-sky-400/40 text-sky-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
                    <Sparkles size={14} className="text-amber-400 animate-pulse" />
                    <span>{settings.heroBadge || "ENGENHARIA ÓPTICA DIGITAL"}</span>
                  </div>

                  {/* Título Principal com Acento Amarelo da Marca */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08]">
                    {settings.heroTitle || "Lentes Digitais"} <br />
                    <span className="text-[#FFD62E] drop-shadow-[0_0_25px_rgba(255,214,46,0.35)]">
                      {settings.heroTitleHighlight || "OPTiSYNC HD"}
                    </span>
                  </h1>

                  {/* Subtítulo Descritivo com Alta Legibilidade */}
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                    {settings.heroDescription ||
                      "Surfaçagem digital computadorizada ponto a ponto com ampliação de campo visual útil, tratamento antirreflexo multicamadas hidrorrepelente e montagem computadorizada em laboratório próprio."}
                  </p>

                  {/* Pílulas de Características Técnicas */}
                  {settings.heroFeatures && settings.heroFeatures.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      {settings.heroFeatures.map((feat, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.06] border border-white/15 text-xs text-slate-200 font-medium backdrop-blur-sm shadow-2xs"
                        >
                          <CheckCircle2 size={14} className="text-[#FFD62E] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botões de Ação Duplos */}
                  <div className="flex flex-wrap items-center gap-3.5 pt-4">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-[#FFD62E] hover:bg-[#ffe05c] text-[#06111F] font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-400/25 active:scale-95 transition-all cursor-pointer"
                    >
                      <MessageCircle size={17} className="text-[#06111F]" />
                      <span>{settings.ctaButtonText || "Consultar Óptico no WhatsApp"}</span>
                      <ArrowRight size={15} />
                    </a>

                    <Link
                      href="/lentes#secao-cores"
                      className="inline-flex items-center gap-2 px-5 py-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-xs sm:text-sm border border-white/20 hover:border-sky-400/50 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
                    >
                      <Palette size={16} className="text-[#FFD62E]" />
                      <span>Ver Lentes Coloridas &amp; Solares</span>
                    </Link>
                  </div>
                </div>

                {/* Coluna da Imagem Oficial com Brilho Radial e Reflexo de Piso */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
                  {/* Brilho Radial Atrás da Caixa do Produto */}
                  <div
                    className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full blur-[80px] pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${settings.beamColorBlue || "#1E4BFF"} 0%, ${settings.beamColorPurple || "#7A2CFF"} 60%, transparent 100%)`,
                      opacity: (settings.glowIntensity ?? 80) / 100 * 0.75,
                    }}
                  />

                  {/* Container do Produto com Moldura Tecnológica */}
                  <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl p-5 sm:p-7 lens-gradient-border shadow-2xl z-10">
                    {/* Imagem Oficial do Produto Flutuando Suavemente */}
                    <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-950/60 border border-white/10 flex items-center justify-center p-3 animate-lens-float">
                      <Image
                        src={settings.productBoxImage || "/images/lenses/optisync-box.jpg"}
                        alt={settings.productAltText || "Lentes Digitais OPTiSYNC HD"}
                        fill
                        sizes="(max-width: 768px) 100vw, 420px"
                        priority
                        className="object-contain p-2 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
                      />
                    </div>

                    {/* Barra de Status Tecnológica no Rodapé do Card */}
                    <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                        Surfaçagem Digital 3D
                      </span>
                      <span className="font-bold text-[#FFD62E] flex items-center gap-1">
                        <Award size={14} className="text-[#FFD62E]" />
                        Garantia 12 Meses
                      </span>
                    </div>
                  </div>

                  {/* Reflexo Espelhado do Produto no Piso */}
                  {settings.enableFloorReflection && (
                    <div className="w-full max-w-sm sm:max-w-md h-16 sm:h-20 overflow-hidden relative mt-1 lens-floor-reflection z-0 select-none">
                      <div className="relative aspect-[4/3] w-full">
                        <Image
                          src={settings.productBoxImage || "/images/lenses/optisync-box.jpg"}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 100vw, 420px"
                          aria-hidden="true"
                          className="object-contain p-2"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            3. BENEFÍCIOS & PILARES DA ENGENHARIA ÓPTICA
            ==================================================================== */}
        {settings.showBenefits && (
          <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-24 border-b border-white/10 relative">
            <div className="max-w-7xl mx-auto space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block font-mono">
                  DIFERENCIAIS CONSTRUTIVOS
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {settings.benefitsTitle || "Por que a OPTiSYNC HD transforma a sua visão?"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {settings.benefitsSubtitle ||
                    "Projetada para proporcionar nitidez contínua e conforto óptico com tratamentos certificados."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(settings.benefitsList || []).map((b: OptiSyncBenefitItem) => (
                  <article
                    key={b.id}
                    className="lens-gradient-border p-6 rounded-3xl space-y-3 hover:translate-y-[-3px] transition-transform duration-300 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                      {getBenefitIcon(b.icon)}
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">{b.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">{b.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            4. TABELA COMPARATIVA DIRETA: CONVENCIONAL VS OPTISYNC HD
            ==================================================================== */}
        {settings.showComparison && settings.comparisonRows && settings.comparisonRows.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-24 border-b border-white/10 relative">
            <div className="max-w-5xl mx-auto space-y-10">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block font-mono">
                  COMPARAÇÃO TÉCNICA
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {settings.comparisonTitle || "Lente Convencional vs OPTiSYNC HD"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  {settings.comparisonSubtitle ||
                    "Entenda as diferenças entre processos convencionais e o padrão digital OPTiSYNC."}
                </p>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-white/15 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04]">
                      <th className="py-4 px-4 sm:px-6 font-bold text-slate-300 w-1/3 uppercase text-[11px] tracking-wider">
                        Característica
                      </th>
                      <th className="py-4 px-4 sm:px-6 font-medium text-slate-400 w-1/3 uppercase text-[11px] tracking-wider">
                        Lentes Convencionais
                      </th>
                      <th className="py-4 px-4 sm:px-6 font-extrabold text-white bg-sky-950/40 w-1/3 border-l border-sky-500/30">
                        <div className="flex items-center gap-1.5 text-sky-300 uppercase text-[11px] tracking-wider">
                          <Sparkles size={14} className="text-[#FFD62E]" />
                          <span>OPTiSYNC HD</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {settings.comparisonRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-4 sm:px-6 font-bold text-slate-100">
                          {row.feature}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-slate-400 leading-relaxed">
                          <div className="flex items-start gap-2">
                            <XCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                            <span>{row.traditional}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-slate-100 font-medium bg-sky-950/20 border-l border-sky-500/20 leading-relaxed">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 size={15} className="text-[#FFD62E] shrink-0 mt-0.5" />
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
            5. DESTAQUE DO LABORATÓRIO PRÓPRIO EM ARAÇATUBA
            ==================================================================== */}
        {settings.showLabHighlight && (
          <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-24 border-b border-white/10">
            <div className="max-w-6xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#061233] via-[#040c26] to-[#020716] p-8 sm:p-12 lg:p-16 border border-sky-500/25 shadow-2xl">
                {/* Linha Divisória de Luz no Topo do Card */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

                <div className="relative z-10 max-w-3xl space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <Award size={14} />
                    <span>{settings.labBadge || "LABORATÓRIO ÓPTICO PRÓPRIO EM ARAÇATUBA"}</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
                    {settings.labTitle || "Do cálculo computadorizado à montagem milimétrica"}{" "}
                    <span className="text-[#FFD62E]">{settings.labTitleHighlight || "em nossa sede"}</span>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {settings.labDescription ||
                      "Com usinagem e lensometria computadorizada na Rua Princesa Isabel, 221 em Araçatuba/SP, suas lentes OPTiSYNC HD são confeccionadas e inspecionadas por profissionais técnicos em óptica, com montagem expressa e rastreabilidade total."}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs font-mono">
                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                      <span className="text-slate-400 block text-[10px] uppercase">Facetadoras</span>
                      <span className="text-white font-bold text-xs sm:text-sm">Corte Computadorizado</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                      <span className="text-slate-400 block text-[10px] uppercase">Inspeção</span>
                      <span className="text-white font-bold text-xs sm:text-sm">100% dos Pares Aferidos</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 col-span-2 sm:col-span-1">
                      <span className="text-slate-400 block text-[10px] uppercase">Origem</span>
                      <span className="text-[#FFD62E] font-bold text-xs sm:text-sm">
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
            6. LINHA DE MODELOS OPTISYNC
            ==================================================================== */}
        {settings.showModels && settings.modelsList && settings.modelsList.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-24 border-b border-white/10">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block font-mono">
                  LINHA COMPLETA
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {settings.modelsTitle || "Modelos OPTiSYNC para sua rotina"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  {settings.modelsSubtitle || "Configurações desenvolvidas para cada perfil e rotina de uso."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {settings.modelsList.map((model) => (
                  <article
                    key={model.id}
                    className="lens-gradient-border p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row gap-6 items-center shadow-xl hover:translate-y-[-2px] transition-transform"
                  >
                    <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-slate-950/80 border border-white/10 shrink-0 overflow-hidden flex items-center justify-center p-2 shadow-inner">
                      <Image
                        src={model.image || "/images/lenses/optisync-box.jpg"}
                        alt={model.name}
                        fill
                        sizes="160px"
                        className="object-contain p-2"
                      />
                    </div>

                    <div className="space-y-3 flex-1 text-center sm:text-left">
                      <div>
                        <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block font-mono">
                          {model.subtitle}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {model.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {model.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1">
                        {model.features.map((f, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] text-slate-200 font-medium"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            7. ESPECIFICAÇÕES TÉCNICAS (CAMPOS OPCIONAIS)
            ==================================================================== */}
        {settings.showSpecs && settings.techSpecs && settings.techSpecs.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-24 border-b border-white/10">
            <div className="max-w-5xl mx-auto space-y-10">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block font-mono">
                  FICHA TÉCNICA
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Especificações Ópticas de Laboratório
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {settings.techSpecs.map((spec, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 backdrop-blur-md"
                  >
                    <span className="text-[11px] text-slate-400 uppercase font-mono block">
                      {spec.label}
                    </span>
                    <p className="text-sm sm:text-base font-bold text-[#FFD62E] font-mono">
                      {spec.value}
                    </p>
                    {spec.detail && (
                      <p className="text-[11px] text-slate-400 leading-snug">{spec.detail}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            8. PERGUNTAS FREQUENTES (FAQ)
            ==================================================================== */}
        {settings.showFaq && settings.faqsList && settings.faqsList.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-24 border-b border-white/10">
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block font-mono">
                  TIRA-DÚVIDAS
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Perguntas Frequentes sobre a OPTiSYNC HD
                </h2>
              </div>

              <div className="space-y-4">
                {settings.faqsList.map((faq, index) => (
                  <article
                    key={index}
                    className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 backdrop-blur-md"
                  >
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-start gap-2.5">
                      <HelpCircle size={18} className="text-[#FFD62E] shrink-0 mt-0.5" />
                      <span>{faq.q}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-7 font-normal">
                      {faq.a}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ====================================================================
            9. CTA FINAL WHATSAPP (ATENDIMENTO ESPECIALIZADO)
            ==================================================================== */}
        {settings.showWhatsappCta && (
          <section className="px-4 sm:px-6 lg:px-10 py-16 sm:py-20">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block font-mono">
                {settings.ctaBadge || "ATENDIMENTO ESPECIALIZADO"}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {settings.ctaTitle || "Pronto para enxergar com definição"}{" "}
                <span className="text-[#FFD62E]">
                  {settings.ctaTitleHighlight || "OPTiSYNC HD?"}
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                {settings.ctaSubtitle ||
                  "Envie sua receita oftálmica diretamente aos nossos ópticos em Araçatuba para uma conferência técnica completa e orçamento sob medida."}
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[#FFD62E] hover:bg-[#ffe05c] text-[#06111F] font-bold text-sm tracking-wide transition-all shadow-xl active:scale-95 cursor-pointer"
                >
                  <MessageCircle size={18} className="text-[#06111F]" />
                  <span>{settings.ctaButtonText || "Consultar Óptico no WhatsApp"}</span>
                  <ArrowRight size={16} />
                </a>

                {settings.showColorsCta && (
                  <Link
                    href="/lentes#secao-cores"
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold text-sm border border-white/20 transition-all cursor-pointer backdrop-blur-md"
                  >
                    <Palette size={16} className="text-[#FFD62E]" />
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
