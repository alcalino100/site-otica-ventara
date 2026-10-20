"use client";

import React, { useState } from "react";
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
import { Product } from "../components/catalog/product-card";

// Lazy loading modals to improve First Load JS and initial rendering performance
const ProductModal = dynamic(
  () => import("../components/catalog/product-modal").then((mod) => mod.ProductModal),
  { ssr: false }
);

const CartModal = dynamic(
  () => import("../components/cart/cart-modal").then((mod) => mod.CartModal),
  { ssr: false }
);

const PrivacyTermsModal = dynamic(
  () => import("../components/legal/privacy-terms-modal").then((mod) => mod.PrivacyTermsModal),
  { ssr: false }
);

const products: Product[] = [
  { id: 1, name: "Ventara Essencial", category: "Grau", color: "Preto clássico", shape: "square" },
  { id: 2, name: "Ventara Aurora", category: "Solar", color: "Âmbar translúcido", shape: "round" },
  { id: 3, name: "Ventara Urbano", category: "Grau", color: "Grafite", shape: "round" },
  { id: 4, name: "Ventara Horizonte", category: "Solar", color: "Preto e dourado", shape: "square" },
];

export default function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; tab: "terms" | "privacy" }>({
    isOpen: false,
    tab: "privacy",
  });

  const notify = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => [...prev, product.id]);
    notify(`${product.name} adicionado à sua seleção.`);
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter((id) => id !== productId));
    notify("Item removido da seleção.");
  };

  const handleClearCart = () => {
    setCart([]);
    notify("Sua seleção foi limpa.");
  };

  return (
    <>
      <div className="preview">
        PROTÓTIPO VISUAL · PRODUTOS ILUSTRATIVOS · SEM VENDAS REAIS
      </div>

      <Header
        cartCount={cart.length}
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
          onSelectProduct={(product) => setSelectedProduct(product)}
          onAddToCart={handleAddToCart}
          cartIds={cart}
          isSearchOpen={isSearchOpen}
        />
        <LensesSection />
        <FAQAccordion />
        <ContactSection onNotify={notify} />
      </main>

      <Footer onOpenLegal={(tab) => setLegalModal({ isOpen: true, tab })} />

      {/* Lazy Loaded Interactive Modals */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        products={products}
        cartIds={cart}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onConsult={notify}
      />

      <PrivacyTermsModal
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal((prev) => ({ ...prev, isOpen: false }))}
        defaultTab={legalModal.tab}
      />

      {/* Accessible Spring Feedback Toast */}
      <Toast message={toastMessage} />
    </>
  );
}
