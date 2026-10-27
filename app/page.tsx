"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { Hero } from "../components/sections/hero";
import { WarrantyBannerSection } from "../components/sections/warranty-banner-section";
import { WhyChooseSection } from "../components/sections/why-choose-section";
import { InteractiveShowcase } from "../components/sections/interactive-showcase";
import { CatalogSection } from "../components/catalog/catalog-section";
import { LensesPricingSection } from "../components/sections/lenses-pricing-section";
import { ColoredLensesShowcase } from "../components/sections/colored-lenses-showcase";
import { StoreSection } from "../components/sections/store-section";
import { WhatsAppSection } from "../components/sections/whatsapp-section";
import { FAQAccordion } from "../components/sections/faq-accordion";
import { Toast } from "../components/ui/toast";
import { Product } from "@/types/ecommerce";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { getStoredCart, saveStoredCart, CartProduct } from "@/lib/cart";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

// Lazy loading modals to improve First Load JS and initial rendering performance
const CartModal = dynamic(
  () => import("../components/cart/cart-modal").then((mod) => mod.CartModal),
  { ssr: false }
);

const PrivacyTermsModal = dynamic(
  () => import("../components/legal/privacy-terms-modal").then((mod) => mod.PrivacyTermsModal),
  { ssr: false }
);

const PromotionWheelTrigger = dynamic(
  () => import("../components/promotions/promotion-wheel-trigger").then((mod) => mod.PromotionWheelTrigger),
  { ssr: false }
);

export default function Home() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>(DEFAULT_CATALOG);
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
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setProducts(data as Product[]);
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

    const newItem: CartProduct = {
      id: product.id || `cart-${Date.now()}`,
      name: product.name,
      slug: product.slug,
      category,
      color,
      priceInCents: price,
      imageUrl: primaryImg,
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
      {/* 1. Header Oficial Fixo: Logo, Navegação Conforme Mockup, Busca e Carrinho */}
      <Header
        cartCount={cartItems.length}
        onOpenCart={() => handleOpenCart("items")}
        onToggleSearch={() => setIsSearchOpen((prev) => !prev)}
        isSearchOpen={isSearchOpen}
      />

      <main>
        {/* 2. Hero Cinematográfico com Carrossel de Óculos em Destaque do Admin */}
        <Hero products={products} />

        {/* 3. Banner Oficial 12 Meses de Garantia OPTiSYNC HD */}
        <WarrantyBannerSection />

        {/* 4. Vitrine Editorial Interativa ("Mais que óculos, é sobre você") */}
        <InteractiveShowcase
          onAddToCart={handleAddToCart}
          onOpenCart={handleOpenCart}
          onBuyNow={handleBuyNowFromShowcase}
        />

        {/* 5. "Escolhas que combinam com você" + Catálogo de Óculos logo abaixo */}
        <CatalogSection
          products={products}
          onSelectProduct={() => {}}
          onAddToCart={handleAddToCart}
          cartIds={cartIds}
          isSearchOpen={isSearchOpen}
        />

        {/* 6. Apresentação da Óticas Ventara, Responsável Técnico e Laboratório Próprio */}
        <WhyChooseSection />

        {/* 7. Nosso Espaço Físico em Araçatuba (Fachada Real, Endereço, Fixo (18) 3304-2808 e Google Maps) */}
        <StoreSection />

        {/* 8. Seção de Lentes de Alta Precisão (Visão Simples, Multifocal, Marcas Homologadas e Símbolo Óptico) */}
        <LensesPricingSection />

        {/* 9. Coleção Exclusiva de Lentes Coloridas e Solares (8 Cores) */}
        <ColoredLensesShowcase />

        {/* 10. CTA Final Direto para o WhatsApp */}
        <WhatsAppSection onNotify={notify} />

        {/* 10. FAQ com Dúvidas Frequentes */}
        <FAQAccordion />
      </main>

      {/* 12. Rodapé Oficial */}
      <Footer onOpenLegal={(tab) => setLegalModal({ isOpen: true, tab })} />

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
