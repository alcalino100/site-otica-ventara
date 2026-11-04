import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sun,
  Palette,
  MessageCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { COLORED_LENSES_LIST, ColoredLensPreset } from "@/lib/lenses-data";

interface LensDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return COLORED_LENSES_LIST.map((lens) => ({
    id: lens.id,
  }));
}

export async function generateMetadata({ params }: LensDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const lens = COLORED_LENSES_LIST.find((l) => l.id === id);

  if (!lens) {
    return {
      title: "Lente Colorida não encontrada | Óticas Ventara",
    };
  }

  return {
    title: `${lens.name} (${lens.colorName}) com Grau | Óticas Ventara`,
    description: lens.description,
    openGraph: {
      title: `${lens.name} (${lens.colorName}) | Lentes Solares com Grau Ventara`,
      description: lens.description,
      images: [
        {
          url: lens.heroImage || "/images/lenses/optisync-colorida-box.jpg",
          width: 1200,
          height: 630,
          alt: `${lens.name} - Óticas Ventara`,
        },
      ],
    },
  };
}

export default async function LensDetailPage({ params }: LensDetailPageProps) {
  const { id } = await params;
  const lens = COLORED_LENSES_LIST.find((l) => l.id === id);

  if (!lens) {
    notFound();
  }

  const otherLenses = COLORED_LENSES_LIST.filter((l) => l.id !== id);

  const whatsAppMessage = encodeURIComponent(
    `Olá! Gostaria de encomendar as Lentes Solares na cor "${lens.colorName}" (${lens.name}) no valor de ${lens.priceFormatted}. Como faço para enviar minha receita de grau?`
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#040914] text-white selection:bg-amber-400 selection:text-slate-950 font-sans">
      <Header theme="dark" />

      <main className="flex-1 pt-24 pb-20">
        {/* BREADCRUMB & BACK LINK */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Link
            href="/lentes-coloridas"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Voltar para todas as cores</span>
          </Link>
        </div>

        {/* PRODUTO DETALHE */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* LADO ESQUERDO: IMAGEM DA LENTE */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-b from-[#08182b] to-[#040914] border border-white/10 p-8 flex items-center justify-center shadow-2xl overflow-hidden">
                <div
                  className="absolute inset-0 opacity-20 blur-3xl rounded-full"
                  style={{ backgroundColor: lens.colorHex }}
                />

                <div className="relative w-full h-full transform hover:scale-105 transition-transform duration-500">
                  <Image
                    src={lens.heroImage || "/images/lenses/optisync-colorida-box.jpg"}
                    alt={lens.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 500px"
                    priority
                    className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
                  />
                </div>

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-amber-300">
                    {lens.badge}
                  </span>
                </div>
              </div>
            </div>

            {/* LADO DIREITO: INFORMAÇÕES & ENCOMENDA */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-4 h-4 rounded-full border border-white/30"
                    style={{ backgroundColor: lens.colorHex }}
                  />
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                    {lens.categoryTag}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white tracking-tight">
                  {lens.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {lens.description}
                </p>
              </div>

              {/* BENEFÍCIOS */}
              <div className="p-5 rounded-2xl bg-[#071322] border border-white/10 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Benefícios Desta Tonalidade:
                </span>
                <ul className="space-y-2 text-xs text-slate-300">
                  {lens.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* INDICAÇÃO */}
              <div className="text-xs text-slate-400">
                <strong className="text-white">Ideal para:</strong> {lens.bestFor}
              </div>

              {/* PREÇO E AÇÕES */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-400/10 via-[#071322] to-[#071322] border border-amber-400/30 space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase block">Valor do Par com Grau</span>
                    <span className="text-2xl sm:text-3xl font-bold text-white">{lens.priceFormatted}</span>
                  </div>
                  <span className="text-xs text-amber-300 font-semibold">{lens.installmentFormatted}</span>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`https://wa.me/5518997970808?text=${whatsAppMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 cursor-pointer"
                  >
                    <MessageCircle size={16} />
                    <span>Pedir Lente no WhatsApp com meu Grau</span>
                  </a>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-amber-400" />
                    {lens.leadTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-amber-400" />
                    Garantia de 12 Meses
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OUTRAS CORES DISPONÍVEIS */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto border-t border-white/10 space-y-8">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              VARIAÇÃO DE ESTILO
            </span>
            <h2 className="text-xl sm:text-2xl font-light text-white mt-1">
              Conheça outras cores da coleção
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {otherLenses.slice(0, 6).map((other) => (
              <Link
                key={other.id}
                href={`/lentes-coloridas/${other.id}`}
                className="group p-4 rounded-2xl bg-[#071322] border border-white/10 hover:border-amber-400/40 text-center space-y-3 transition-colors"
              >
                <div className="relative aspect-square w-full rounded-xl bg-[#040a14] p-2 flex items-center justify-center overflow-hidden">
                  <Image
                    src={other.discImage || "/images/lenses/optisync-colorida-box.jpg"}
                    alt={other.name}
                    fill
                    sizes="120px"
                    className="object-contain transform group-hover:scale-110 transition-transform"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-amber-300 block truncate">
                    {other.colorName}
                  </span>
                  <span className="text-[11px] text-slate-400 block">{other.priceFormatted}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
