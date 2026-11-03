import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { getShippingData } from "@/lib/shipping-repository";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { pageSettings } = await getShippingData();

  const title = `${pageSettings.hero_title_line1 || "Rede de Entregas"} ${pageSettings.hero_title_line2 || "Ventara"} | Ótica Ventara`;
  const description =
    pageSettings.hero_subtitle ||
    "Da nossa ótica em Araçatuba para todo o Brasil. Conheça nossa estrutura de envios, frota própria regional, transportadoras parceiras e rastreio em tempo real.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: pageSettings.regional_image_url || "/images/shipping/van-ventara-aracatuba.jpg",
          width: 1200,
          height: 630,
          alt: "Estrutura de entregas e logística da Ótica Ventara Eyewear",
        },
      ],
      type: "website",
    },
    alternates: {
      canonical: "/entregas",
    },
  };
}

export default async function EntregasPage() {
  const { pageSettings, carriers, faqs, timelineSteps } = await getShippingData();

  // Se a página for desativada no painel administrativo, retorna 404
  if (pageSettings.is_enabled === false) {
    notFound();
  }

  // Schema estruturado FAQPage para SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs
      .filter((f) => f.is_active !== false)
      .map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
  };

  return (
    <div className="min-h-screen bg-[#02070D] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Schema SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <main className="flex-1">
        {/* 1. Hero (Light Theme com curva amarela na base) */}
        <ShippingHero
          badgeText={pageSettings.hero_badge_text}
          titleLine1={pageSettings.hero_title_line1}
          titleLine2={pageSettings.hero_title_line2}
          subtitle={pageSettings.hero_subtitle}
          ctaText={pageSettings.hero_cta_text}
          ctaUrl={pageSettings.hero_cta_url}
          secondaryCtaText={pageSettings.hero_secondary_cta_text}
          secondaryCtaUrl={pageSettings.hero_secondary_cta_url}
          imageUrl={pageSettings.hero_image_url}
        />

        {/* 2. Highlight Cards (3 cards translúcidos empilhados / grid) */}
        {pageSettings.show_highlight_cards !== false && (
          <ShippingHighlightCards
            card1Title={pageSettings.highlight_card_1_title}
            card1Subtitle={pageSettings.highlight_card_1_subtitle}
            card2Title={pageSettings.highlight_card_2_title}
            card2Subtitle={pageSettings.highlight_card_2_subtitle}
            insuranceTitle={pageSettings.highlight_card_insurance_title}
            insuranceSubtitle={pageSettings.highlight_card_insurance_subtitle}
            card3Title={pageSettings.highlight_card_3_title}
            card3Subtitle={pageSettings.highlight_card_3_subtitle}
            showCargoInsurance={pageSettings.show_cargo_insurance}
          />
        )}

        {/* 3. Bloco "Entrega Expressa em Araçatuba e Região" (100% editável) */}
        {pageSettings.regional_is_enabled !== false && (
          <ShippingLocalDelivery
            badgeText={pageSettings.regional_badge_text}
            titlePart1={pageSettings.regional_title_part1}
            titlePart2={pageSettings.regional_title_part2}
            description={pageSettings.regional_description}
            citiesHeading={pageSettings.regional_cities_heading}
            cities={pageSettings.regional_cities}
            imageUrl={pageSettings.regional_image_url}
            imageAlt={pageSettings.regional_image_alt}
            focalPoint={pageSettings.regional_focal_point}
            gradientIntensity={pageSettings.regional_gradient_intensity}
            showTimeframe={pageSettings.regional_show_timeframe}
            timeframe={pageSettings.regional_timeframe}
            showConditions={pageSettings.regional_show_conditions}
            conditions={pageSettings.regional_conditions}
          />
        )}

        {/* 4. Card de Prazo Estimado */}
        {pageSettings.estimated_timeframe_is_enabled !== false && Boolean(pageSettings.estimated_timeframe_text) && (
          <ShippingEstimatedTimeframe
            title={pageSettings.estimated_timeframe_title}
            text={pageSettings.estimated_timeframe_text}
          />
        )}

        {/* 5. Bloco "Enviamos para todo o Brasil" */}
        {pageSettings.national_is_enabled !== false && (
          <ShippingNationalDelivery
            title={pageSettings.national_title}
            subtitle={pageSettings.national_subtitle}
            trackingNote={pageSettings.national_tracking_note}
            cards={pageSettings.national_cards}
            imageUrl={pageSettings.national_image_url}
          />
        )}

        {/* 6. Transportadoras que utilizamos */}
        <ShippingCarriersGrid
          title={pageSettings.carriers_section_title}
          subtitle={pageSettings.carriers_section_subtitle}
          carriers={carriers}
        />

        {/* 7. Como funciona nosso fluxo de entrega (6 etapas) */}
        <ShippingHowItWorks
          title={pageSettings.timeline_section_title}
          subtitle={pageSettings.timeline_section_subtitle}
          steps={timelineSteps}
        />

        {/* 8. Perguntas frequentes */}
        <ShippingFaq
          title={pageSettings.faq_section_title}
          subtitle={pageSettings.faq_section_subtitle}
          faqs={faqs}
        />

        {/* 9. CTA WhatsApp Final */}
        <ShippingWhatsAppCta
          title={pageSettings.whatsapp_cta_title}
          subtitle={pageSettings.whatsapp_cta_subtitle}
        />
      </main>

      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}
