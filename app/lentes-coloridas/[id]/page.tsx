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
import { getStoredColoredLenses, getStoredColoredLensById } from "@/lib/lenses-server";
import { COLORED_LENSES_LIST } from "@/lib/lenses-data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const revalidate = 60;

interface LensDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const lenses = await getStoredColoredLenses();
  return lenses.map((lens) => ({
    id: lens.id,
  }));
}

export async function generateMetadata({ params }: LensDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const lens = (await getStoredColoredLensById(id)) || COLORED_LENSES_LIST.find((l) => l.id === id);

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
          url: lens.heroImage || lens.discImage || "/images/lenses/optisync-colorida-box.jpg",
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
  const lens = (await getStoredColoredLensById(id)) || COLORED_LENSES_LIST.find((l) => l.id === id);

  if (!lens) {
    notFound();
  }

  const allLenses = await getStoredColoredLenses();
  const otherLenses = allLenses.filter((l) => l.id !== lens.id);

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* LADO ESQUERDO: IMAGEM DA LENTE / VITRINE */}
            <div className="space-y-4">
              <div
                className="relative aspect-square w-full rounded-3xl border border-white/10 p-8 flex items-center justify-center overflow-hidden shadow-2xl"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${lens.gradientFrom || "#1e293b"}22, #040914 80%)`,
                }}
              >
                <div className="relative w-4/5 h-4/5">
                  <Image
                    src={lens.discImage || "/images/lenses/optisync-colorida-box.jpg"}
                    alt={lens.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]"
                  />
                </div>

                {/* Badge Flutuante */}
                <div className="absolute top-5 left-5">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-amber-300 uppercase tracking-wider">
                    {lens.badge}
                  </span>
                </div>
              </div>

              {/* Selo de Garantia e Laboratório */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-2xl bg-[#071322] border border-white/10 space-y-1">
                  <Clock size={16} className="mx-auto text-amber-400" />
                  <span className="text-slate-400 block text-[10px] uppercase">Prazo</span>
                  <span className="text-white font-semibold">{lens.leadTime}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#071322] border border-white/10 space-y-1">
                  <ShieldCheck size={16} className="mx-auto text-emerald-400" />
                  <span className="text-slate-400 block text-[10px] uppercase">Garantia</span>
                  <span className="text-white font-semibold">12 Meses</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#071322] border border-white/10 space-y-1">
                  <Sun size={16} className="mx-auto text-amber-400" />
                  <span className="text-slate-400 block text-[10px] uppercase">Proteção</span>
                  <span className="text-white font-semibold">100% UV400</span>
                </div>
              </div>
            </div>

            {/* LADO DIREITO: INFORMAÇÕES & PEDIDO NO WHATSAPP */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/30"
                    style={{ backgroundColor: lens.colorHex }}
                  />
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                    {lens.categoryTag}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight leading-tight">
                  {lens.name}
                </h1>

                <p className="text-sm text-slate-300 leading-relaxed font-normal pt-1">
                  {lens.description}
                </p>
              </div>

              {/* CARD DE PREÇO */}
              <div className="p-6 rounded-3xl bg-[#071322] border border-white/10 space-y-3">
                <div className="flex items-baseline justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs text-slate-400 uppercase block">Valor do Par com Grau</span>
                    <span className="text-3xl font-bold text-white font-mono">{lens.priceFormatted}</span>
                  </div>
                  <span className="text-xs text-amber-400 font-semibold bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
                    {lens.installmentFormatted}
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Preço do par completo para visão de longe, perto ou neutro (sem grau).
                </p>
              </div>

              {/* BENEFÍCIOS ESPECÍFICOS DA TONALIDADE */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Diferenciais e Benefícios Ópticos:
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {lens.benefits.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* MELHOR INDICAÇÃO */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block">
                  Indicação de Uso Ideal:
                </span>
                <p className="text-slate-300">{lens.bestFor}</p>
              </div>

              {/* CTA WHATSAPP COM A RECEITA */}
              <div className="space-y-3 pt-2">
                <a
                  href={buildWhatsAppUrl(whatsAppMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
                >
                  <MessageCircle size={18} />
                  <span>Pedir Lente no WhatsApp com meu Grau</span>
                </a>

                <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                  Envie sua foto da receita médica pelo WhatsApp. Nosso óptico faz a conferência gratuita da DNP e das dioptrias antes da montagem.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* OUTRAS CORES DISPONÍVEIS */}
        {otherLenses.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 py-16 border-t border-white/10 max-w-6xl mx-auto space-y-8">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                EXPLORE MAIS
              </span>
              <h2 className="text-xl sm:text-2xl font-light text-white mt-1">
                Outras Tonalidades Solares
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {otherLenses.map((ol) => (
                <Link
                  key={ol.id}
                  href={`/lentes-coloridas/${ol.id}`}
                  className="p-4 rounded-2xl bg-[#071322] border border-white/10 hover:border-amber-400/40 text-center space-y-2 group transition-all"
                >
                  <div className="relative aspect-square w-full rounded-xl bg-[#040a14] p-2 flex items-center justify-center overflow-hidden">
                    <Image
                      src={ol.discImage || "/images/lenses/optisync-colorida-box.jpg"}
                      alt={ol.name}
                      fill
                      sizes="120px"
                      className="object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block truncate">{ol.colorName}</span>
                    <span className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors block truncate">
                      {ol.priceFormatted}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
