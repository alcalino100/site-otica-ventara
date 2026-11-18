import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, FlaskConical, Glasses, MapPin, MessageCircle, Phone, Ruler, Sparkles, Wrench } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { PageBackground } from "@/components/ui/page-background";
import { DraftPreviewBanner } from "@/components/content/draft-preview-banner";
import { FloatingEditButton } from "@/components/content/floating-edit-button";
import { getPageContent } from "@/lib/content/repository";
import { resolveBackgroundConfig } from "@/lib/content/background-presets";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { BUSINESS, breadcrumbJsonLd, buildPageMetadata, faqJsonLd, opticianJsonLd } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: "Ótica em Araçatuba | Óticas Ventara | Rua Princesa Isabel, 221",
  description:
    "Ótica em Araçatuba-SP: óculos de grau e de sol, lentes com montagem expressa no laboratório próprio, visagismo e ajustes gratuitos. Rua Princesa Isabel, 221, Centro.",
  path: "/otica-em-aracatuba",
  image: "/images/store/fachada-otica-ventara.jpg",
});

interface PageProps {
  searchParams?: Promise<{ preview?: string }>;
}

const DIFERENCIAL_ICONS = [FlaskConical, Ruler, Sparkles, Wrench];

export default async function OticaEmAracatubaPage({ searchParams }: PageProps) {
  const resolved = searchParams ? await searchParams : {};
  const isDraft = resolved.preview === "draft";
  const c = await getPageContent("oticaAracatuba", isDraft ? "draft" : "published");
  const bgConfig = resolveBackgroundConfig(c.backgroundPreset, c);

  const faqs = [1, 2, 3, 4]
    .map((i) => ({ question: String(c[`faq${i}Question`] ?? ""), answer: String(c[`faq${i}Answer`] ?? "") }))
    .filter((f) => f.question.trim() && f.answer.trim());

  const diferenciais = [1, 2, 3, 4].map((i, idx) => ({
    title: String(c[`diferencial${i}Title`] ?? ""),
    text: String(c[`diferencial${i}Text`] ?? ""),
    Icon: DIFERENCIAL_ICONS[idx],
  }));

  const mapsUrl = String(c.mapsUrl || "").trim();
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    `${BUSINESS.street}, ${BUSINESS.neighborhood}, ${BUSINESS.city} - ${BUSINESS.state}`
  )}&output=embed`;
  const whatsappUrl = buildWhatsAppUrl("Olá! Vi a página da Ventara em Araçatuba e gostaria de atendimento.");

  return (
    <>
      <JsonLd
        data={[
          { ...opticianJsonLd(), ...(mapsUrl ? { hasMap: mapsUrl } : {}) },
          faqJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Ótica em Araçatuba", path: "/otica-em-aracatuba" },
          ]),
        ]}
      />
      <DraftPreviewBanner pageId="oticaAracatuba" isDraft={isDraft} />
      <PageBackground config={bgConfig} />
      <div className="min-h-screen bg-[#06111f] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
        <Header theme="dark" />

        <main className="flex-1">
          {/* Topo */}
          <section className="relative py-14 sm:py-20 overflow-hidden border-b border-white/10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0756b8]/20 blur-[130px] rounded-full pointer-events-none" />
            <div className="max-w-[1100px] mx-auto px-4 sm:px-8 relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-6">
                <MapPin size={14} className="text-amber-400" />
                <span>{c.heroBadge}</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-light text-white tracking-tight leading-tight">
                {c.heroTitle} <span className="font-semibold text-amber-400">{c.heroHighlight}</span>
              </h1>
              <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">{c.heroSubtitle}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/armacoes"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Glasses size={16} />
                  <span>Ver armações</span>
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  <MessageCircle size={16} className="text-amber-400" />
                  <span>Falar no WhatsApp</span>
                </a>
              </div>
            </div>
          </section>

          {/* Apresentação */}
          <section className="py-14 sm:py-20">
            <div className="max-w-[900px] mx-auto px-4 sm:px-8 text-center">
              <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight">{c.aboutTitle}</h2>
              <p className="mt-5 text-sm sm:text-base text-slate-300 leading-relaxed">{c.aboutText}</p>
            </div>
          </section>

          {/* Diferenciais */}
          <section className="pb-14 sm:pb-20">
            <div className="max-w-[1100px] mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {diferenciais.map(({ title, text, Icon }, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Visite a loja */}
          <section className="py-14 sm:py-20 border-y border-white/10 bg-white/[0.02]">
            <div className="max-w-[1100px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight mb-6">{c.visitTitle}</h2>
                <address className="not-italic space-y-4 text-sm text-slate-200">
                  <p className="flex items-start gap-3">
                    <MapPin size={18} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      {BUSINESS.street}, {BUSINESS.neighborhood}
                      <br />
                      {BUSINESS.city}-{BUSINESS.state} · CEP {BUSINESS.postalCode}
                    </span>
                  </p>
                  <p className="flex items-start gap-3">
                    <Clock size={18} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>{c.visitHours}</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <Phone size={18} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <a href="tel:+551833042808" className="hover:text-amber-300">(18) 3304-2808</a>
                      {" · WhatsApp "}
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-300">(18) 99615-5748</a>
                    </span>
                  </p>
                </address>
                <div className="mt-6 flex flex-wrap gap-3">
                  {mapsUrl && (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      <MapPin size={15} />
                      <span>Como chegar</span>
                    </a>
                  )}
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/10 min-h-[320px] bg-slate-900">
                <iframe
                  title="Mapa da Óticas Ventara em Araçatuba"
                  src={embedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full min-h-[320px] border-0"
                />
              </div>
            </div>
          </section>

          {/* Explore */}
          <section className="py-14 sm:py-16">
            <div className="max-w-[1100px] mx-auto px-4 sm:px-8">
              <h2 className="text-xl sm:text-2xl font-light text-white text-center mb-8">O que você encontra na Ventara</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { href: "/armacoes", label: "Armações de grau e sol" },
                  { href: "/lentes", label: "Lentes de grau" },
                  { href: "/medicao-por-foto", label: "Medição de DNP" },
                  { href: "/entregas", label: "Entregas para todo o Brasil" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="group flex items-center justify-between gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 text-sm text-slate-100 transition-all"
                  >
                    <span>{l.label}</span>
                    <ArrowRight size={16} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Perguntas frequentes */}
          {faqs.length > 0 && (
            <section className="pb-14 sm:pb-20">
              <div className="max-w-[900px] mx-auto px-4 sm:px-8">
                <h2 className="text-2xl sm:text-3xl font-light text-white text-center tracking-tight mb-8">Perguntas frequentes</h2>
                <div className="space-y-3">
                  {faqs.map((f, i) => (
                    <details key={i} className="group p-5 rounded-2xl bg-white/[0.03] border border-white/10 open:border-amber-400/30">
                      <summary className="cursor-pointer list-none text-sm font-semibold text-white flex items-center justify-between gap-3">
                        <span>{f.question}</span>
                        <span className="text-amber-400 text-lg leading-none group-open:rotate-45 transition-transform">+</span>
                      </summary>
                      <p className="mt-3 text-sm text-slate-300 leading-relaxed">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Convite final */}
          <section className="pb-16 sm:pb-24">
            <div className="max-w-[900px] mx-auto px-4 sm:px-8">
              <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#091d33] to-[#040e18] border border-amber-400/25 text-center">
                <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight">{c.ctaTitle}</h2>
                <p className="mt-3 text-sm text-slate-300 max-w-xl mx-auto">{c.ctaText}</p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <MessageCircle size={16} />
                  <span>Conversar com um consultor</span>
                </a>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
      <FloatingEditButton pageId="oticaAracatuba" />
    </>
  );
}
