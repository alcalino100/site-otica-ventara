"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { Hero } from "../components/sections/hero";
import { TrustSection } from "../components/sections/trust-section";
import { AboutSection } from "../components/sections/about-section";
import { CatalogSection } from "../components/catalog/catalog-section";
import { LensesSection } from "../components/sections/lenses-section";
import { FAQAccordion } from "../components/sections/faq-accordion";
import { ContactSection } from "../components/sections/contact-section";
import { Toast } from "../components/ui/toast";
import { Product } from "@/types/ecommerce";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { getStoredCart, saveStoredCart, CartProduct } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";

// Lazy loading modals to improve First Load JS and initial rendering performance
const CartModal = dynamic(
  () => import("../components/cart/cart-modal").then((mod) => mod.CartModal),
  { ssr: false }
);

const PrivacyTermsModal = dynamic(
  () => import("../components/legal/privacy-terms-modal").then((mod) => mod.PrivacyTermsModal),
  { ssr: false }
);

export default function Home() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>(DEFAULT_CATALOG);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
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

  const handleAddToCart = (product: Product) => {
    const primaryImg = product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url;
    const newItem: CartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category?.name || product.frame_type,
      color: product.variants?.[0]?.color_name || "Padrão",
      priceInCents: product.price_in_cents,
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

  return (
    <>
      <div className="preview">
        ÓTICA VENTARA · ARAÇATUBA-SP · CATÁLOGO ONLINE & ATENDIMENTO PERSONALIZADO
      </div>

      <Header
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onToggleSearch={() => setIsSearchOpen((prev) => !prev)}
        isSearchOpen={isSearchOpen}
      />

      <main>
        <Hero />
        <TrustSection />
        <AboutSection />
        <CatalogSection
          products={products}
          onSelectProduct={() => {}}
          onAddToCart={handleAddToCart}
          cartIds={cartIds}
          isSearchOpen={isSearchOpen}
        />
        <LensesSection />
        <FAQAccordion />
        <ContactSection onNotify={notify} />
      </main>

      <Footer onOpenLegal={(tab) => setLegalModal({ isOpen: true, tab })} />

      {/* Cart Modal com Persistência em LocalStorage e Redirecionamento WhatsApp */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      {/* Modal de Políticas de Privacidade e Termos de Uso (LGPD) */}
      <PrivacyTermsModal
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal((prev) => ({ ...prev, isOpen: false }))}
        defaultTab={legalModal.tab}
      />

      {/* Toast Notificações */}
      <Toast message={toastMessage} />
    </>
  );
}
