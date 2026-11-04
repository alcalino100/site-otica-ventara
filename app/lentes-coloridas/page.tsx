import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Sun,
  Palette,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { COLORED_LENSES_LIST, ColoredLensPreset } from "@/lib/lenses-data";

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

export default function LentesColoridasPage() {
  return (
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
              Lentes Coloridas &amp; Solares{" "}
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
                com o seu grau
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              Seus óculos de sol favoritos com a sua graduação exata. Lentes polarizadas, 
              espelhadas e tonalidades clássicas produzidas em nosso laboratório próprio em Araçatuba.
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
              {COLORED_LENSES_LIST.length} cores exclusivas disponíveis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {COLORED_LENSES_LIST.map((lens) => (
              <div
                key={lens.id}
                className="group relative rounded-3xl bg-[#071322] border border-white/10 hover:border-amber-400/40 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 space-y-6"
              >
                {/* Top Badge & Color Disc */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold tracking-wider text-amber-300 uppercase">
                      {lens.badge}
                    </span>
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shadow-inner"
                      style={{ backgroundColor: lens.colorHex }}
                      title={`Cor: ${lens.colorName}`}
                    />
                  </div>

                  {/* Lens Image Container */}
                  <Link
                    href={`/lentes-coloridas/${lens.id}`}
                    className="relative aspect-square w-full rounded-2xl bg-[#040a14] border border-white/5 flex items-center justify-center p-6 overflow-hidden group-hover:border-amber-400/20 transition-colors"
                  >
                    <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={lens.discImage || "/images/lenses/optisync-colorida-box.jpg"}
                        alt={lens.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 320px"
                        className="object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                      />
                    </div>
                  </Link>

                  {/* Titles */}
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                      {lens.colorName}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {lens.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {lens.description}
                    </p>
                  </div>
                </div>

                {/* Preço & CTA */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">A partir de</span>
                      <span className="text-lg font-bold text-white">{lens.priceFormatted}</span>
                    </div>
                    <span className="text-[11px] text-amber-400/90 font-medium">
                      {lens.installmentFormatted}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/lentes-coloridas/${lens.id}`}
                      className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center text-xs font-semibold text-white transition-colors"
                    >
                      Ver Detalhes
                    </Link>

                    <a
                      href={`https://wa.me/5518997970808?text=Olá!%20Gostaria%20de%20pedir%20as%20lentes%20solares%20na%20cor%20${encodeURIComponent(
                        lens.colorName
                      )}%20(${encodeURIComponent(lens.name)})%20com%20o%20meu%20grau.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle size={13} />
                      <span>Pedir</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BENEFÍCIOS TÉCNICOS */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#06111f]/60 border-t border-white/10">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                DIFERENCIAL VENTARA
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-white">
                Como montamos o seu grau em lentes solares?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center">
                  <Palette size={20} />
                </div>
                <h3 className="text-sm font-bold text-white">Pigmentação em Banho Molecular</h3>
                <p className="text-slate-400 leading-relaxed">
                  As cores são absorvidas molecularmente no monômero da lente, garantindo que não descasquem e permaneçam com a mesma intensidade por anos.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-sm font-bold text-white">Filtro Polarizado Anti-Ofuscamento</h3>
                <p className="text-slate-400 leading-relaxed">
                  Bloqueia 100% da luz refletida em superfícies horizontais como asfalto, capô de carros e espelhos d’água, proporcionando alívio visual imediato.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <h3 className="text-sm font-bold text-white">Montagem Expressa em Araçatuba</h3>
                <p className="text-slate-400 leading-relaxed">
                  Nosso laboratório próprio corta e confere as lentes com lensômetro digital. Seu óculos de sol com grau pode ficar pronto em até 1 hora.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
