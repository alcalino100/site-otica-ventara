import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloatingButton } from "@/components/ui/whatsapp-floating-button";
import { ShippingHero } from "@/components/sections/shipping/shipping-hero";
import { ShippingLocalDelivery } from "@/components/sections/shipping/shipping-local-delivery";
import { ShippingNationalDelivery } from "@/components/sections/shipping/shipping-national-delivery";
import { ShippingCarriersGrid } from "@/components/sections/shipping/shipping-carriers-grid";
import { ShippingHowItWorks } from "@/components/sections/shipping/shipping-how-it-works";
import { ShippingFaq } from "@/components/sections/shipping/shipping-faq";
import { ShippingWhatsAppCta } from "@/components/sections/shipping/shipping-whatsapp-cta";
import { getShippingData } from "@/lib/shipping-repository";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { pageSettings } = await getShippingData();

  const title = `${pageSettings.hero_title || "Rede de Entregas Ventara"} | Ótica Ventara`;
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
          url: pageSettings.local_image_url || "/images/shipping/van-ventara-aracatuba.jpg",
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

  return (
    <div className="min-h-screen bg-[#02070D] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      <Header />

      <main className="flex-1">
        {/* 1. Hero */}
        <ShippingHero
          title={pageSettings.hero_title}
          subtitle={pageSettings.hero_subtitle}
          ctaText={pageSettings.hero_cta_text}
          ctaUrl={pageSettings.hero_cta_url}
        />

        {/* 2. Entrega em Araçatuba e região */}
        <ShippingLocalDelivery
          title={pageSettings.local_title}
          description={pageSettings.local_description}
          cities={pageSettings.local_cities}
          timeframe={pageSettings.local_timeframe}
          conditions={pageSettings.local_conditions}
          imageUrl={pageSettings.local_image_url}
        />

        {/* 3. Envio para todo o Brasil */}
        <ShippingNationalDelivery
          title={pageSettings.national_title}
          description={pageSettings.national_description}
          timeframe={pageSettings.national_timeframe}
          conditions={pageSettings.national_conditions}
          imageUrl={pageSettings.national_image_url}
        />

        {/* 4. Transportadoras que utilizamos */}
        <ShippingCarriersGrid
          title={pageSettings.carriers_section_title}
          subtitle={pageSettings.carriers_section_subtitle}
          carriers={carriers}
        />

        {/* 5. Como funciona (fluxo técnico em 6 etapas) */}
        <ShippingHowItWorks
          title={pageSettings.timeline_section_title}
          subtitle={pageSettings.timeline_section_subtitle}
          steps={timelineSteps}
        />

        {/* 6. Perguntas frequentes */}
        <ShippingFaq
          title={pageSettings.faq_section_title}
          subtitle={pageSettings.faq_section_subtitle}
          faqs={faqs}
        />

        {/* 7. CTA final para WhatsApp */}
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
