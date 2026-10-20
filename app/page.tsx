"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { Hero } from "../components/sections/hero";
import { CategoriesSection } from "../components/sections/categories-section";
import { CatalogSection } from "../components/catalog/catalog-section";
import { LensesSection } from "../components/sections/lenses-section";
import { AboutSection } from "../components/sections/about-section";
import { StoreSection } from "../components/sections/store-section";
import { WhatsAppSection } from "../components/sections/whatsapp-section";
import { FAQAccordion } from "../components/sections/faq-accordion";
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

      {/* 1. Header Oficial: Logo, Navegação, Busca e Carrinho */}
      <Header
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onToggleSearch={() => setIsSearchOpen((prev) => !prev)}
        isSearchOpen={isSearchOpen}
      />

      <main>
        {/* 2. Hero Editorial com iluminação cênica e pedestal */}
        <Hero />

        {/* 3. Seção de Categorias / Coleções: "Um estilo para chamar de seu." */}
        <CategoriesSection />

        {/* 4. Seção de Produtos / Seleção Editorial: "Escolhas que combinam com você." */}
        <CatalogSection
          products={products}
          onSelectProduct={() => {}}
          onAddToCart={handleAddToCart}
          cartIds={cartIds}
          isSearchOpen={isSearchOpen}
        />

        {/* 5. Seção de Lentes / Tecnologia Visual: "Seu dia pede uma visão que acompanha você." */}
        <LensesSection />

        {/* 6. Seção Institucional: "A diferença está nos detalhes." */}
        <AboutSection />

        {/* 7. Seção da Loja Física: "Vamos encontrar seus próximos óculos?" */}
        <StoreSection />

        {/* 8. CTA Final / Contato Direto: "Seu próximo olhar começa aqui." */}
        <WhatsAppSection onNotify={notify} />

        {/* 9. FAQ com Dúvidas Frequentes */}
        <FAQAccordion />
      </main>

      {/* 10. Rodapé Oficial */}
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
