import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Sun,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getStoredColoredLenses } from "@/lib/lenses-server";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { getPageContent } from "@/lib/content/repository";
import { PageBackground } from "@/components/ui/page-background";
import { resolveBackgroundConfig } from "@/lib/content/background-presets";
import { DraftPreviewBanner } from "@/components/content/draft-preview-banner";
import { FloatingEditButton } from "@/components/content/floating-edit-button";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Lentes Coloridas e Solares com Grau | Óticas Ventara",
  description:
    "Lentes solares polarizadas, espelhadas e degradê com a sua graduação exata. Proteção UV400 total e montagem expressa em laboratório próprio em Araçatuba.",
  openGraph: {
    title: "Lentes Coloridas e Solares com Grau | Óticas Ventara",
    description:
      "Transforme qualquer armação em óculos de sol com seu grau. Cores clássicas G-15, cinza fumê, marrom âmbar e espelhados.",
    images: [
      {
        url: "/images/lenses/optisync-colorida-box.jpg",
        width: 1200,
        height: 630,
        alt: "Catálogo de Lentes Coloridas e Solares com Grau Óticas Ventara",
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: "/lentes-coloridas",
  },
};

interface LentesColoridasPageProps {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function LentesColoridasPage({ searchParams }: LentesColoridasPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isDraft = resolvedParams.preview === "draft";

  const [coloredLenses, content] = await Promise.all([
    getStoredColoredLenses(),
    getPageContent("lentesColoridas", isDraft ? "draft" : "published"),
  ]);

  const bgConfig = resolveBackgroundConfig(content.backgroundPreset, content);

  return (
    <>
      <DraftPreviewBanner pageId="lentesColoridas" isDraft={isDraft} />
      <PageBackground config={bgConfig} />
      <div className="min-h-screen flex flex-col bg-[#040914] text-white selection:bg-amber-400 selection:text-slate-950 font-sans">
        <Header theme="dark" />

        <main className="flex-1 pt-24 pb-20">
          {/* HERO SECTION */}
          <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20 border-b border-white/10 overflow-hidden">
            <div className="max-w-6xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sun size={15} className="text-amber-400" />
                <span>Proteção UV400 &amp; Grau Personalizado</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight text-white max-w-3xl mx-auto leading-tight">
                {content.coloredHeaderTitle || (
                  <>
                    Lentes Coloridas &amp; Solares{" "}
                    <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
                      com o seu grau
                    </span>
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
                {content.coloredHeaderSubtitle ||
                  "Seus óculos de sol favoritos com a sua graduação exata. Lentes polarizadas, espelhadas e tonalidades clássicas produzidas em nosso laboratório próprio em Araçatuba."}
              </p>

              <div className="pt-2 flex flex-wrap justify-center items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-amber-400" />
                  100% Proteção UVA/UVB 400
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-amber-400" />
                  Filtro Antirreflexo Traseiro
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-amber-400" />
                  Pronto em até 1 hora
                </span>
              </div>
            </div>
          </section>

          {/* CATÁLOGO DE CORES */}
          <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  COLEÇÃO SOLAR &amp; ESTÉTICA
                </span>
                <h2 className="text-xl sm:text-2xl font-light text-white mt-1">
                  Escolha a sua tonalidade de lente
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {coloredLenses.length} tonalidades disponíveis para confecção imediata
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {coloredLenses.map((lens) => (
                <div
                  key={lens.id}
                  className="rounded-3xl bg-gradient-to-b from-[#0a1626] to-[#050e1a] border border-white/10 hover:border-amber-400/40 transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1"
                >
                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Imagem do Disco da Lente */}
                    <div className="relative aspect-square w-full max-w-[200px] mx-auto flex items-center justify-center">
                      <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full overflow-hidden filter drop-shadow-2xl group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={lens.discImage || "/images/lenses/solar/organic-cinza-fume.png"}
                          alt={lens.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                          {lens.colorName}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                          {lens.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                        {lens.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {lens.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block">A partir de</span>
                        <span className="text-lg font-bold text-white font-mono">
                          {lens.priceFormatted || "R$ 139,90"}
                        </span>
                      </div>
                      <span className="text-xs text-amber-400 font-medium">
                        {lens.installmentFormatted || "10x sem juros"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-white/[0.02] border-t border-white/5">
                    <a
                      href={buildWhatsAppUrl(
                        `Olá! Gostei da lente solar "${lens.name}" (${lens.colorName}) e gostaria de orçar com a minha receita de grau.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/10 hover:bg-amber-400 text-white hover:text-slate-950 text-xs font-bold uppercase tracking-wider transition-all duration-200"
                    >
                      <MessageCircle size={15} />
                      <span>Consultar no WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* BENEFÍCIOS DO LABORATÓRIO VENTARA */}
          <section className="px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10 bg-[#06111f]">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  LABORATÓRIO PRÓPRIO
                </span>
                <h2 className="text-2xl sm:text-3xl font-light text-white">
                  Por que fazer suas lentes solares na Ventara?
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-[#081726] border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Clock size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-white">Montagem em 1 Hora</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sem intermediários. Temos laboratório digital computadorizado em Araçatuba para surfaçagem e coloração expressa.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#081726] border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    {content.safetyTitle || "Proteção UV400 Certificada"}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {content.safetyText ||
                      "Coloração molecular homogênea com curvas calculadas para não alterar as dioptrias de miopia, hipermetropia ou astigmatismo."}
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#081726] border border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-white">Qualquer Armação</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Fabricamos as lentes solares para armações que você já tem, armações compradas no site ou modelos novos da nossa curadoria.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
      <FloatingEditButton pageId="lentesColoridas" />
    </>
  );
}
