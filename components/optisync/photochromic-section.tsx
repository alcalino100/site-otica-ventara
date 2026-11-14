import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PhotochromicSlider } from "@/components/optisync/photochromic-slider";
import type { OptiSyncPageSettings } from "@/types/ecommerce";

interface PhotochromicSectionProps {
  /** Configuração da linha fotossensível (mesma da página /optisync). */
  photochromic?: OptiSyncPageSettings["photochromicLine"];
  /** Conteúdo editável (CMS) da página /optisync. */
  content: Record<string, any>;
  id?: string;
  className?: string;
}

/**
 * Bloco "OPTiSYNC HD Fotossensível": simulador de transição + 3 fases de luminosidade + diferenciais.
 * Compartilhado entre /optisync e a home: textos e imagens vêm do mesmo conteúdo do admin.
 */
export function PhotochromicSection({
  photochromic,
  content,
  id = "linha-fotossensivel",
  className = "scroll-mt-24 sm:scroll-mt-28 px-4 sm:px-6 lg:px-10 py-10 sm:py-20 lg:py-24 border-b border-white/10 relative",
}: PhotochromicSectionProps) {
  if (photochromic?.enabled === false) return null;

  return (
    <section id={id} className={className}>
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold text-[#7A2CFF] uppercase tracking-widest block font-mono">
              {content.photochromicBadge || photochromic?.badge || "TECNOLOGIA FOTOSSENSÍVEL ADULTO"}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {content.photochromicTitle || photochromic?.title || "OPTiSYNC HD"}{" "}
              <span className="text-[#FFC21A]">{content.photochromicTitleHighlight || photochromic?.titleHighlight || "Fotossensível"}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#B8C2E6] leading-relaxed">
              {content.photochromicDescription ||
                photochromic?.description ||
                "Lentes inteligentes que clareiam com rapidez em ambientes internos e escurecem sob o sol, bloqueando 100% dos raios UVA/UVB com conforto total."}
            </p>
          </div>

          {(content.photochromicCtaLink || photochromic?.ctaLink) && (
            <Link
              href={content.photochromicCtaLink || photochromic?.ctaLink || "/lentes?linha=fotossensivel"}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#7A2CFF] to-[#0044C9] hover:from-[#9247FF] hover:to-[#1E5BFF] text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
            >
              <span>{content.photochromicCtaText || photochromic?.ctaText || "Ver Modelos Fotossensíveis"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Grid Principal: Simulador Interativo + Grade dos 3 Estados */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
          {/* Coluna Esquerda (7 cols): Simulador Interativo com Teclado e Touch */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-xs font-mono text-[#FFC21A] uppercase">{content.simulatorEyebrow || "Simulador Dinâmico"}</span>
              <h3 className="text-base sm:text-lg font-bold text-white">{content.simulatorTitle || "Transição Óptica Inteligente"}</h3>
            </div>

            <PhotochromicSlider
              clearImageUrl={photochromic?.clearStateImageUrl}
              darkImageUrl={photochromic?.darkStateImageUrl}
              bannerImageUrl={photochromic?.halfDarkBannerUrl}
              altText="Comparação de lentes fotossensíveis límpida vs escurecida"
              transitionSpeedText={content.transitionSpeedText || photochromic?.transitionSpeedText || "Ativação em até 30 segundos sob radiação UV"}
              indoorLabel={content.indoorLabel || "Ambiente Interno"}
              outdoorLabel={content.outdoorLabel || "Sol Pleno"}
              instructionsText={content.simulatorInstructions || "Arraste ou use as setas do teclado (← / →) para simular o escurecimento"}
            />
          </div>

          {/* Coluna Direita (5 cols): Arte 4 (3 Estados Homem/Mulher) ou Arte 7 */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">
            <div className="space-y-0.5 sm:space-y-1">
              <span className="text-xs font-mono text-sky-400 uppercase">{content.phasesEyebrow || "Ambientes de Uso"}</span>
              <h3 className="text-base sm:text-lg font-bold text-white">{content.phasesTitle || "3 Fases de Luminosidade"}</h3>
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
                  {content.phasesSubtitle || "Ambiente Interno · Meia Luz · Sol Pleno"}
                </p>
                <p className="text-[10px] sm:text-[11px] text-[#B8C2E6] leading-relaxed">
                  {content.phasesNote || "A molécula fotossensível reage aos fótons UV sem distorcer as cores reais."}
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
  );
}
