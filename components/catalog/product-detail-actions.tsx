"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  MessageCircle,
  Check,
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { Product } from "@/types/ecommerce";
import { getStoredCart, saveStoredCart, CartProduct } from "@/lib/cart";
import { CartModal } from "@/components/cart/cart-modal";

interface ProductDetailActionsProps {
  product: Product;
  onAddedNotification?: (message: string) => void;
}

export function ProductDetailActions({
  product,
  onAddedNotification,
}: ProductDetailActionsProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartModalView, setCartModalView] = useState<"items" | "checkout">("checkout");
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);

  useEffect(() => {
    setCartItems(getStoredCart());
  }, []);

  // Variantes de Cor disponíveis
  const variants =
    product.variants && product.variants.length > 0
      ? product.variants
      : [
          {
            id: "v-default-1",
            color_name: "Preto Clássico",
            color_hex: "#111827",
            sku: `${product.slug.toUpperCase()}-BLK`,
          },
          {
            id: "v-default-2",
            color_name: "Âmbar Translúcido",
            color_hex: "#b45309",
            sku: `${product.slug.toUpperCase()}-AMB`,
          },
          {
            id: "v-default-3",
            color_name: "Grafite Nobre",
            color_hex: "#374151",
            sku: `${product.slug.toUpperCase()}-GRF`,
          },
        ];

  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  // Opções de Lentes para Consultoria
  const lensOptions = [
    {
      id: "none",
      name: "Somente a armação",
      desc: "Sem lentes de grau (ou provar na loja)",
      icon: Sparkles,
    },
    {
      id: "monofocal",
      name: "Lentes Monofocais",
      desc: "Miopia, hipermetropia ou astigmatismo",
      icon: Layers,
    },
    {
      id: "multifocal",
      name: "Lentes Multifocais",
      desc: "Transição contínua perto e longe",
      icon: Layers,
    },
    {
      id: "blue_filter",
      name: "Filtro Luz Azul / Antirreflexo",
      desc: "Conforto para telas e direção noturna",
      icon: ShieldCheck,
    },
  ];

  const [selectedLens, setSelectedLens] = useState(lensOptions[0]);

  const handleRemoveFromCart = (id: string) => {
    const updated = cartItems.filter((i) => i.id !== id);
    setCartItems(updated);
    saveStoredCart(updated);
  };

  const handleClearCart = () => {
    setCartItems([]);
    saveStoredCart([]);
  };

  const createCartItem = (): CartProduct => {
    const primaryImg =
      product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url;

    return {
      id: `${product.id}-${selectedVariant.id}`,
      name: `${product.name} - ${selectedVariant.color_name}`,
      slug: product.slug,
      category: product.category?.name || product.frame_type,
      color: selectedVariant.color_name || "Padrão",
      priceInCents: product.price_in_cents,
      imageUrl: primaryImg,
    };
  };

  const handleBuyNow = () => {
    const currentCart = getStoredCart();
    const item = createCartItem();
    const exists = currentCart.some((it) => it.id === item.id);
    const updated = exists ? currentCart : [...currentCart, item];
    saveStoredCart(updated);
    setCartItems(updated);
    setCartModalView("checkout");
    setIsCartOpen(true);
  };

  const handleAdd = () => {
    const currentCart = getStoredCart();
    const item = createCartItem();
    const exists = currentCart.some((it) => it.id === item.id);
    const updated = exists ? currentCart : [...currentCart, item];
    saveStoredCart(updated);
    setCartItems(updated);
    setIsAdded(true);
    if (onAddedNotification) {
      onAddedNotification(`${product.name} adicionado à sua seleção.`);
    }
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Monta mensagem detalhada e personalizada para o WhatsApp oficial
  const categoryLabel =
    product.frame_type === "Solar" ? "Óculos Solar" : "Armação de Grau";
  const whatsappText = encodeURIComponent(
    `Olá! Gostei da armação "${product.name}" (${categoryLabel}) na Ótica Ventara.\n` +
      `• Cor selecionada: ${selectedVariant.color_name}\n` +
      `• Interesse em lentes: ${selectedLens.name} (${selectedLens.desc})\n` +
      `Gostaria de saber mais sobre disponibilidade e valores para minha receita.`
  );
  const whatsappUrl = `https://wa.me/5518996155748?text=${whatsappText}`;

  return (
    <div className="space-y-6 pt-2">
      {/* Seletor Interativo de Cores */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 uppercase tracking-wider">
            Cor da Armação:
          </span>
          <span className="font-bold text-amber-600">{selectedVariant.color_name}</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {variants.map((v) => {
            const isSelected = selectedVariant.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all active:scale-95 ${
                  isSelected
                    ? "bg-amber-50 text-amber-900 border-amber-400 shadow-2xs font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs flex-shrink-0"
                  style={{ backgroundColor: v.color_hex || "#1e293b" }}
                />
                <span>{v.color_name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guia Interativo de Escolha de Lentes */}
      <div className="space-y-3 pt-3 border-t border-slate-200/80">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={14} className="text-amber-600" />
            Precisa de lentes para esta armação?
          </span>
          <span className="text-[11px] text-amber-600 font-semibold">
            Consultoria Técnica
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {lensOptions.map((lens) => {
            const isChosen = selectedLens.id === lens.id;
            const LensIcon = lens.icon;
            return (
              <button
                key={lens.id}
                type="button"
                onClick={() => setSelectedLens(lens)}
                className={`p-3 rounded-xl border text-left transition-all active:scale-95 flex items-start gap-2.5 ${
                  isChosen
                    ? "bg-amber-50/80 border-amber-400 text-slate-900 shadow-2xs"
                    : "bg-white border-slate-200/80 text-slate-700 hover:border-slate-300"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                    isChosen
                      ? "bg-amber-400 text-slate-950 font-bold"
                      : "bg-slate-100 text-amber-600"
                  }`}
                >
                  <LensIcon size={14} />
                </div>
                <div>
                  <p className="text-xs font-semibold leading-tight text-slate-900">{lens.name}</p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    {lens.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botões de Ação com Micro-Interações */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80">
        {/* Botão Primário: Comprar Agora direto para o Checkout Mercado Pago */}
        <button
          type="button"
          onClick={handleBuyNow}
          className="w-full bg-[#ffd62e] hover:bg-[#ffcd00] active:scale-95 text-[#06111f] font-extrabold text-xs sm:text-sm tracking-wider uppercase py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md hover:shadow-xl cursor-pointer"
        >
          <CreditCard size={18} className="text-[#06111f]" />
          <span>COMPRAR AGORA</span>
        </button>

        {/* Botão Secundário: Adicionar à Seleção / Sacola para continuar navegando */}
        <button
          type="button"
          onClick={handleAdd}
          className="w-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-semibold text-xs tracking-wider uppercase py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          {isAdded ? (
            <>
              <Check size={16} className="text-emerald-400 stroke-[3]" />
              <span className="font-bold text-emerald-300">Adicionado à Seleção!</span>
            </>
          ) : (
            <>
              <ShoppingBag size={16} className="text-amber-400" />
              <span>Adicionar à seleção</span>
            </>
          )}
        </button>

        {/* Botão Terciário: Consultar Lentes no WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wider uppercase py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all active:scale-95 text-center shadow-md hover:shadow-lg cursor-pointer group"
        >
          <MessageCircle size={18} className="text-white" />
          <span>Consultar Lentes no WhatsApp</span>
          <ArrowRight
            size={14}
            className="text-white group-hover:translate-x-1 transition-transform"
          />
        </a>

        <p className="text-[11px] text-slate-500 text-center pt-1 leading-relaxed">
          Atendimento consultivo na loja em Araçatuba-SP ou suporte digital via WhatsApp.
        </p>
      </div>

      {/* Cart Modal com Abertura Direta em Checkout */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        initialView={cartModalView}
      />
    </div>
  );
}
