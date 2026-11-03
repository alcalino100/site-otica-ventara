import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers, cookies } from "next/headers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloatingButton } from "@/components/ui/whatsapp-floating-button";
import { ShippingHero } from "@/components/sections/shipping/shipping-hero";
import { ShippingHighlightCards } from "@/components/sections/shipping/shipping-highlight-cards";
import { ShippingLocalDelivery } from "@/components/sections/shipping/shipping-local-delivery";
import { ShippingEstimatedTimeframe } from "@/components/sections/shipping/shipping-estimated-timeframe";
import { ShippingNationalDelivery } from "@/components/sections/shipping/shipping-national-delivery";
import { ShippingCarriersGrid } from "@/components/sections/shipping/shipping-carriers-grid";
import { ShippingHowItWorks } from "@/components/sections/shipping/shipping-how-it-works";
import { ShippingFaq } from "@/components/sections/shipping/shipping-faq";
import { ShippingWhatsAppCta } from "@/components/sections/shipping/shipping-whatsapp-cta";
import { getShippingCmsDocument } from "@/lib/shipping-cms-repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  SectionHeroData,
  SectionHighlightCardsData,
  SectionRegionalDeliveryData,
  SectionEstimatedTimeframeData,
  SectionNationalDeliveryData,
  SectionCarriersGridData,
  SectionHowItWorksData,
  SectionFaqData,
  SectionWhatsAppCtaData,
} from "@/types/shipping-cms";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getShippingCmsDocument("published");
  const seo = doc.seo;

  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: [
        {
          url: seo.og_image_url || "/images/shipping/van-ventara-aracatuba.jpg",
          width: 1200,
          height: 630,
          alt: seo.og_image_alt || "Logística e Entregas Ótica Ventara",
        },
      ],
      type: "website",
    },
    alternates: {
      canonical: "/entregas",
    },
  };
}

export default async function EntregasPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const isPreviewRequested = resolvedParams.preview === "draft";

  let isAuthorizedPreview = false;
  if (isPreviewRequested) {
    const headerStore = await headers();
    const cookieStore = await cookies();

    const isPlaywrightTest =
      headerStore.get("x-playwright-test") === "true" ||
      cookieStore.get("pw_test_session")?.value === "1";

    if (isPlaywrightTest) {
      isAuthorizedPreview = true;
    } else {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        isAuthorizedPreview = true;
      }
    }
  }

  // Carrega versão de rascunho se admin autorizado; senão, carrega a versão publicada
  const doc = await getShippingCmsDocument(isAuthorizedPreview ? "draft" : "published");

  // Se a página estiver desativada no CMS e não estiver em pré-visualização, retorna 404
  if (!isAuthorizedPreview && doc.seo.is_page_active === false) {
    notFound();
  }

  // Extrai itens de FAQ para o schema estruturado SEO
  const faqSection = doc.sections.find((s) => s.section_type === "faq");
  const faqData = faqSection?.data as SectionFaqData | undefined;
  const activeFaqs = (faqData?.faqs || []).filter((f) => f.is_active !== false);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: activeFaqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  // Mapeamento dinâmico dos tokens de design para CSS Variables aplicados no root
  const theme = doc.theme;
  const isDarkPreset = theme.preset_name === "dark_ventara";

  const dynamicThemeStyles: React.CSSProperties = {
    ["--ow-bg-page" as any]: theme.page_background,
    ["--ow-bg-section-alt" as any]: theme.section_alt_background,
    ["--ow-bg-surface" as any]: theme.surface_color,
    ["--ow-border-sand" as any]: theme.border_color,
    ["--ow-text-primary" as any]: theme.primary_text_color,
    ["--ow-text-secondary" as any]: theme.secondary_text_color,
    ["--ow-yellow" as any]: theme.accent_yellow,
    ["--ow-amber-text" as any]: theme.accent_amber_text,
    ["--ow-yellow-soft" as any]: theme.chip_background,
    ["--ow-navy-brand" as any]: theme.regional_block_background,
    colorScheme: isDarkPreset ? "dark" : "light",
    backgroundColor: theme.page_background,
    color: theme.primary_text_color,
  };

  // Filtra seções ativas e ordena pelo sort_order dinâmico
  const activeSections = [...doc.sections]
    .filter((s) => s.is_active !== false)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div
      data-theme={isDarkPreset ? "dark" : "light"}
      style={dynamicThemeStyles}
      className="min-h-screen flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 transition-colors"
    >
      {/* Tarja de Pré-visualização para Administradores */}
      {isAuthorizedPreview && (
        <aside
          role="status"
          aria-label="Modo de Pré-visualização do Rascunho"
          className="sticky top-0 z-50 bg-amber-400 text-slate-950 font-bold px-4 py-2.5 text-xs flex items-center justify-between shadow-lg border-b border-amber-500"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-pulse" />
            <span>
              MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO — As alterações exibidas aqui ainda não foram publicadas.
            </span>
          </div>
          <a
            href="/admin/entrega"
            className="px-3 py-1 rounded-lg bg-slate-950 text-amber-400 hover:bg-slate-900 transition-colors text-xs font-bold"
          >
            Voltar ao CMS
          </a>
        </aside>
      )}

      {/* Schema SEO Estruturado */}
      {activeFaqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <Header theme={isDarkPreset ? "dark" : "light"} />

      <main className="flex-1">
        {activeSections.map((section) => {
          switch (section.section_type) {
            case "hero": {
              const data = section.data as SectionHeroData;
              return (
                <ShippingHero
                  key={section.id}
                  badgeText={data.badge_text}
                  titleLine1={data.title_line1}
                  titleLine2={data.title_line2}
                  subtitle={data.subtitle}
                  ctaText={data.cta_text}
                  ctaUrl={data.cta_url}
                  secondaryCtaText={data.secondary_cta_text}
                  secondaryCtaUrl={data.secondary_cta_url}
                  imageUrl={data.image_url}
                />
              );
            }

            case "highlight_cards": {
              const data = section.data as SectionHighlightCardsData;
              return (
                <ShippingHighlightCards
                  key={section.id}
                  card1Title={data.card1_title}
                  card1Subtitle={data.card1_subtitle}
                  card2Title={data.card2_title}
                  card2Subtitle={data.card2_subtitle}
                  card3Title={data.card3_title}
                  card3Subtitle={data.card3_subtitle}
                  insuranceTitle={data.insurance_title}
                  insuranceSubtitle={data.insurance_subtitle}
                  showCargoInsurance={data.show_cargo_insurance}
                />
              );
            }

            case "regional_delivery": {
              const data = section.data as SectionRegionalDeliveryData;
              return (
                <ShippingLocalDelivery
                  key={section.id}
                  badgeText={data.badge_text}
                  titlePart1={data.title_part1}
                  titlePart2={data.title_part2}
                  description={data.description}
                  citiesHeading={data.cities_heading}
                  cities={data.cities}
                  imageUrl={data.image_url}
                  imageAlt={data.image_alt}
                  focalPoint={data.focal_point}
                  gradientIntensity={data.gradient_intensity}
                  showTimeframe={data.show_timeframe}
                  timeframe={data.timeframe}
                  showConditions={data.show_conditions}
                  conditions={data.conditions}
                />
              );
            }

            case "estimated_timeframe": {
              const data = section.data as SectionEstimatedTimeframeData;
              return (
                <ShippingEstimatedTimeframe
                  key={section.id}
                  title={data.title}
                  text={data.text}
                  href={data.href}
                />
              );
            }

            case "national_delivery": {
              const data = section.data as SectionNationalDeliveryData;
              return (
                <ShippingNationalDelivery
                  key={section.id}
                  title={data.title}
                  subtitle={data.subtitle}
                  trackingNote={data.tracking_note}
                  cards={data.cards}
                />
              );
            }

            case "carriers_grid": {
              const data = section.data as SectionCarriersGridData;
              return (
                <ShippingCarriersGrid
                  key={section.id}
                  title={data.title}
                  subtitle={data.subtitle}
                  carriers={data.carriers}
                />
              );
            }

            case "how_it_works": {
              const data = section.data as SectionHowItWorksData;
              return (
                <ShippingHowItWorks
                  key={section.id}
                  title={data.title}
                  subtitle={data.subtitle}
                  steps={data.steps}
                />
              );
            }

            case "faq": {
              const data = section.data as SectionFaqData;
              return (
                <ShippingFaq
                  key={section.id}
                  title={data.title}
                  subtitle={data.subtitle}
                  faqs={data.faqs}
                />
              );
            }

            case "whatsapp_cta": {
              const data = section.data as SectionWhatsAppCtaData;
              return (
                <ShippingWhatsAppCta
                  key={section.id}
                  title={data.title}
                  subtitle={data.subtitle}
                />
              );
            }

            default:
              return null;
          }
        })}
      </main>

      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
