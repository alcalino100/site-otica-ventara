"use client";

import { restoreCartFromToken } from "@/lib/cart-recovery-client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Header } from "../layout/header";
import { Footer } from "../layout/footer";
import { Hero } from "../sections/hero";
import { WarrantyBannerSection } from "../sections/warranty-banner-section";
import { InteractiveShowcase } from "../sections/interactive-showcase";
import { ZentaraBanner } from "../sections/zentara-banner";
import { CatalogSection } from "../catalog/catalog-section";
import { Toast } from "../ui/toast";
import { Product, OptiSyncPageSettings, HeroSlide, HeroCarouselSettings } from "@/types/ecommerce";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { normalizeProduct } from "@/lib/products";
import { getStoredCart, saveStoredCart, CartProduct } from "@/lib/cart";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { PageBackgroundConfig } from "@/lib/content/background-presets";

// Seções abaixo da dobra: código carregado em pacotes separados (o HTML continua vindo pronto do servidor).
const PromotionalOffersSection = dynamic(() => import("../sections/promotional-offers-section").then((mod) => mod.PromotionalOffersSection));
const LensesPricingSection = dynamic(() => import("../sections/lenses-pricing-section").then((mod) => mod.LensesPricingSection));
const ColoredLensesShowcase = dynamic(() => import("../sections/colored-lenses-showcase").then((mod) => mod.ColoredLensesShowcase));
const PhotochromicSection = dynamic(() => import("../optisync/photochromic-section").then((mod) => mod.PhotochromicSection));
const StoreSection = dynamic(() => import("../sections/store-section").then((mod) => mod.StoreSection));
const WhatsAppSection = dynamic(() => import("../sections/whatsapp-section").then((mod) => mod.WhatsAppSection));
const FAQAccordion = dynamic(() => import("../sections/faq-accordion").then((mod) => mod.FAQAccordion));
const WhyChooseSection = dynamic(() => import("../sections/why-choose-section").then((mod) => mod.WhyChooseSection));

// Lazy loading modals to improve First Load JS and initial rendering performance
const CartModal = dynamic(
  () => import("../cart/cart-modal").then((mod) => mod.CartModal),
  { ssr: false }
);

const PrivacyTermsModal = dynamic(
  () => import("../legal/privacy-terms-modal").then((mod) => mod.PrivacyTermsModal),
  { ssr: false }
);

const PromotionWheelTrigger = dynamic(
  () => import("../promotions/promotion-wheel-trigger").then((mod) => mod.PromotionWheelTrigger),
  { ssr: false }
);

interface HomeClientProps {
  homeContent: Record<string, any>;
  headerContent: Record<string, any>;
  footerContent: Record<string, any>;
  /** Fundo OptiSYNC resolvido no servidor; só é enviado quando o toggle da seção da loja está ligado. */
  storeOptisyncBackground?: PageBackgroundConfig | null;
  /** Dados da seção OPTiSYNC Fotossensível (mesmos da página /optisync); null = seção oculta. */
  photochromicSection?: {
    photochromic: OptiSyncPageSettings["photochromicLine"];
    content: Record<string, any>;
  } | null;
  /** Slides do carrossel já resolvidos no servidor (evita piscar os slides antigos ao abrir o site). */
  heroData?: { slides: HeroSlide[]; settings: HeroCarouselSettings };
  homeCatalogPicks?: string[];
}

export function HomeClient({
  homeContent,
  headerContent,
  footerContent,
  storeOptisyncBackground = null,
  photochromicSection = null,
  heroData,
  homeCatalogPicks,
}: HomeClientProps) {
  const supabase = createClient();
  // Com banco configurado, não parte do catálogo de demonstração (evita piscar produtos já removidos).
  const [products, setProducts] = useState<Product[]>(isSupabaseConfigured() ? [] : DEFAULT_CATALOG);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartInitialView, setCartInitialView] = useState<"items" | "checkout">("items");
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; tab: "terms" | "privacy" }>({
    isOpen: false,
    tab: "privacy",
  });

  // Carrega carrinho do localStorage ao iniciar
  useEffect(() => {
    const loaded = getStoredCart();
    setCartItems(loaded);

    // Link do e-mail de recuperação (/?retomar=TOKEN): devolve os itens e abre o carrinho
    const token = new URLSearchParams(window.location.search).get("retomar");
    if (token) {
      void restoreCartFromToken(token, (items) => {
        const current = getStoredCart();
        const merged = [...current, ...items.filter((it) => !current.some((c) => c.id === it.id))];
        saveStoredCart(merged);
        setCartItems(getStoredCart());
        setCartInitialView("items");
        setIsCartOpen(true);
      });
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Tenta carregar produtos publicados do Supabase se existirem
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const fetchSupabaseProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            *,
            category:categories(*),
            images:product_images(*),
            variants:product_variants(*)
          `)
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .order("id", { ascending: true })
          .range(0, 99);

        if (!error && Array.isArray(data)) {
          setProducts(data.map(normalizeProduct));
        }
      } catch (err) {
        console.warn("Utilizando catálogo padrão estruturado:", err);
      }
    };

    fetchSupabaseProducts();
  }, []);

  const notify = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleAddToCart = (product: Product | any) => {
    const primaryImg =
      product.imageUrl ||
      product.images?.find((i: any) => i.is_primary)?.url ||
      product.images?.[0]?.url;
    const price =
      typeof product.priceInCents === "number"
        ? product.priceInCents
        : product.price_in_cents || 0;
    const color =
      product.color ||
      product.variants?.[0]?.color_name ||
      "Padrão";
    const category =
      typeof product.category === "string"
        ? product.category
        : product.category?.name || product.frame_type || "Armação";

    const firstVariant = product.variants?.[0];
    const variantId = product.variantId || firstVariant?.id;
    const stock =
      typeof product.stockQuantity === "number"
        ? product.stockQuantity
        : typeof firstVariant?.stock_quantity === "number"
        ? firstVariant.stock_quantity
        : 10;

    const newItem: CartProduct = {
      id: `${product.id}::${variantId || "default"}`,
      productId: product.id,
      variantId,
      sku: product.sku || firstVariant?.sku,
      name: product.name,
      slug: product.slug,
      category,
      color,
      priceInCents: price,
      imageUrl: primaryImg,
      quantity: 1,
      stockQuantity: stock,
    };

    const updated = [...cartItems, newItem];
    setCartItems(updated);
    saveStoredCart(updated);
    notify(`${product.name} adicionado à sua seleção.`);
  };

  const handleRemoveFromCart = (productId: string) => {
    const updated = cartItems.filter((item) => item.id !== productId);
    setCartItems(updated);
    saveStoredCart(updated);
    notify("Item removido da seleção.");
  };

  const handleClearCart = () => {
    setCartItems([]);
    saveStoredCart([]);
    notify("Sua seleção foi limpa.");
  };

  const cartIds = cartItems.map((item) => item.id);

  const handleOpenCart = (view: "items" | "checkout" = "items") => {
    setCartInitialView(view);
    setIsCartOpen(true);
  };

  const handleBuyNowFromShowcase = (item: CartProduct) => {
    handleAddToCart(item);
    setCartInitialView("checkout");
    setIsCartOpen(true);
  };

  return (
    <>
      {/* 1. Header Oficial Fixo com Suporte a Conteúdo Dinâmico */}
      <Header
        cartCount={cartItems.length}
        onOpenCart={() => handleOpenCart("items")}
        onToggleSearch={() => setIsSearchOpen((prev) => !prev)}
        isSearchOpen={isSearchOpen}
        bagTooltip={headerContent.bagTooltip}
        contactBtnText={headerContent.contactBtnText}
      />

      <main>
        {/* 2. Hero Cinematográfico com Conteúdo Dinâmico */}
        <Hero
          products={products}
          badge={homeContent.heroBadge}
          title={homeContent.heroTitle}
          description={homeContent.heroDescription}
          ctaText={homeContent.heroCtaText}
          ctaLink={homeContent.heroCtaLink}
          initialSlides={heroData?.slides}
          initialSettings={heroData?.settings}
        />

        {/* 3. Banner Oficial 12 Meses de Garantia OPTiSYNC HD */}
        <WarrantyBannerSection
          desktopUrl={homeContent.warrantyBannerDesktop}
          mobileUrl={homeContent.warrantyBannerMobile}
          whatsappMessage={homeContent.warrantyWhatsappMessage}
        />

        {/* 4. Vitrine Editorial Interativa */}
        <InteractiveShowcase
          onAddToCart={handleAddToCart}
          onOpenCart={handleOpenCart}
          onBuyNow={handleBuyNowFromShowcase}
          showcaseEyebrow={homeContent.showcaseEyebrow}
          showcaseTitle={homeContent.showcaseTitle}
          showcaseSubtitle={homeContent.showcaseSubtitle}
        />

        {/* 4.1 Lentes Zentara */}
        <ZentaraBanner />

        {/* 5. Catálogo de Óculos */}
        <CatalogSection
          products={products}
          onSelectProduct={() => {}}
          onAddToCart={handleAddToCart}
          cartIds={cartIds}
          isSearchOpen={isSearchOpen}
          pickedIds={homeCatalogPicks}
          catalogEyebrow={homeContent.catalogEyebrow}
          catalogTitle={homeContent.catalogTitle}
          catalogTitleHighlight={homeContent.catalogTitleHighlight}
          catalogDescription={homeContent.catalogDescription}
        />

        {/* 5.1. Vitrine Promocional: Até X% OFF */}
        <PromotionalOffersSection
          products={products}
          onAddToCart={handleAddToCart}
          cartIds={cartIds}
          offersBadge={homeContent.offersBadge}
          offersTitle={homeContent.offersTitle}
          offersSubtitle={homeContent.offersSubtitle}
          offersAllLinkText={homeContent.offersAllLinkText}
        />

        {/* 6. Por que escolher Óticas Ventara */}
        <WhyChooseSection
          eyebrow={homeContent.whyEyebrow}
          title={homeContent.whyTitle}
          subtitle={homeContent.whySubtitle}
          lensesCtaText={homeContent.whyLensesCtaText}
          medicaoCtaText={homeContent.whyMedicaoCtaText}
        />

        {/* 7. Nosso Espaço Físico em Araçatuba */}
        <StoreSection
          eyebrow={homeContent.storeEyebrow}
          title={homeContent.storeTitle}
          description={homeContent.storeDescription}
          address={homeContent.storeAddress}
          phone={homeContent.storePhone}
          hours={homeContent.storeHours}
          useOptisyncBackground={homeContent.storeUseOptisyncBg === true}
          optisyncBackground={storeOptisyncBackground}
        />

        {/* 8. Catálogo de Lentes de Grau */}
        <LensesPricingSection
          eyebrow={homeContent.lensesEyebrow}
          title={homeContent.lensesTitle}
          subtitle={homeContent.lensesSubtitle}
          prescriptionWhatsappMessage={homeContent.lensesPrescriptionWhatsapp}
          medicaoBtnText={homeContent.lensesMedicaoBtnText}
        />

        {/* 8.1. OPTiSYNC HD Fotossensível (mesma seção da página /optisync) */}
        {photochromicSection && (
          <div className="theme-futuristic-lenses relative isolate overflow-hidden bg-[#000933] text-[#F4F6FF]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(60% 50% at 8% 0%, rgba(122,44,255,0.28), transparent 70%), radial-gradient(50% 45% at 100% 100%, rgba(0,68,201,0.25), transparent 70%)",
              }}
            />
            <PhotochromicSection
              id="fotossensivel"
              photochromic={photochromicSection.photochromic}
              content={photochromicSection.content}
              className="scroll-mt-24 px-4 sm:px-6 lg:px-10 py-12 sm:py-20 relative"
              ctaText={homeContent.photochromicHomeCtaText || "Conheça as lentes OPTiSYNC"}
              ctaHref={homeContent.photochromicHomeCtaLink || "/optisync"}
            />
          </div>
        )}

        {/* 9. Lentes Solares & Performance */}
        <ColoredLensesShowcase
          eyebrow={homeContent.coloredEyebrow}
          title={homeContent.coloredTitle}
          subtitle={homeContent.coloredSubtitle}
        />

        {/* 10. CTA Final Direto para o WhatsApp */}
        <WhatsAppSection
          onNotify={notify}
          eyebrow={homeContent.whatsappEyebrow}
          title={homeContent.whatsappTitle}
          subtitle={homeContent.whatsappSubtitle}
          buttonText={homeContent.whatsappButtonText}
          whatsappMessage={homeContent.whatsappMessage}
        />

        {/* 11. FAQ com Dúvidas Frequentes */}
        <FAQAccordion
          eyebrow={homeContent.faqEyebrow}
          title={homeContent.faqTitle}
          subtitle={homeContent.faqSubtitle}
        />
      </main>

      {/* 12. Rodapé Oficial */}
      <Footer
        onOpenLegal={(tab) => setLegalModal({ isOpen: true, tab })}
        cnpj={footerContent.cnpj}
        address={footerContent.address}
        hours={footerContent.hours}
        copyright={footerContent.copyright}
      />

      {/* Cart Modal com Persistência em LocalStorage e Redirecionamento WhatsApp */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        initialView={cartInitialView}
      />

      {/* Modal de Políticas de Privacidade e Termos de Uso (LGPD) */}
      <PrivacyTermsModal
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal((prev) => ({ ...prev, isOpen: false }))}
        defaultTab={legalModal.tab}
      />

      {/* Campanha de Recuperação: Roleta Promocional com Captura de Leads */}
      <PromotionWheelTrigger
        onOpenPrivacyModal={() => setLegalModal({ isOpen: true, tab: "privacy" })}
      />

      {/* Toast Notificações */}
      <Toast message={toastMessage} />
    </>
  );
}
