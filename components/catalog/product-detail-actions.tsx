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
  Heart,
} from "lucide-react";
import { Product } from "@/types/ecommerce";
import { getStoredCart, saveStoredCart, CartProduct } from "@/lib/cart";
import { CartModal } from "@/components/cart/cart-modal";
import { LensLeadModal } from "@/components/catalog/lens-lead-modal";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface ProductDetailActionsProps {
  product: Product;
  onAddedNotification?: (message: string) => void;
}

export function ProductDetailActions({
  product,
  onAddedNotification,
}: ProductDetailActionsProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartModalView, setCartModalView] = useState<"items" | "checkout">("checkout");
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);

  useEffect(() => {
    setCartItems(getStoredCart());
    try {
      const saved = localStorage.getItem("ventara_wishlist");
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list) && list.includes(product.id)) {
          setIsWishlist(true);
        }
      }
    } catch {
      // Ignora erro de localStorage
    }
  }, [product.id]);

  const toggleWishlist = () => {
    try {
      const saved = localStorage.getItem("ventara_wishlist");
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(list)) list = [];
      if (list.includes(product.id)) {
        list = list.filter((id) => id !== product.id);
        setIsWishlist(false);
        if (onAddedNotification) onAddedNotification("Removido dos favoritos.");
      } else {
        list.push(product.id);
        setIsWishlist(true);
        if (onAddedNotification) onAddedNotification("Adicionado aos seus favoritos!");
      }
      localStorage.setItem("ventara_wishlist", JSON.stringify(list));
    } catch {
      setIsWishlist(!isWishlist);
    }
  };

  // Variantes de Cor disponíveis a partir das cadastradas
  const variants =
    product.variants && product.variants.length > 0
      ? product.variants
      : [
          {
            id: `v-${product.id}-default`,
            product_id: product.id,
            sku: product.sku || `${product.slug.toUpperCase()}-01`,
            color_name: "Padrão",
            color_hex: "#111827",
            size: "Único",
            stock_quantity: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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
      hasWhatsApp: false,
    },
    {
      id: "monofocal",
      name: "Lentes Monofocais (Visão Simples)",
      desc: "Miopia, hipermetropia ou astigmatismo",
      icon: Layers,
      hasWhatsApp: true,
      whatsappLabel: "Lentes Monofocais / Visão Simples",
    },
    {
      id: "multifocal",
      name: "Lentes Multifocais",
      desc: "Transição contínua perto e longe",
      icon: Layers,
      hasWhatsApp: true,
      whatsappLabel: "Lentes Multifocais",
    },
    {
      id: "blue_filter",
      name: "Filtro Luz Azul / Antirreflexo",
      desc: "Conforto para telas e direção noturna",
      icon: ShieldCheck,
      hasWhatsApp: true,
      whatsappLabel: "Filtro Luz Azul e Antirreflexo",
    },
  ];

  const [selectedLens, setSelectedLens] = useState(lensOptions[0]);
  const [isLensModalOpen, setIsLensModalOpen] = useState(false);
  const [lensForModal, setLensForModal] = useState(lensOptions[1]);

  const handleSelectLens = (lens: (typeof lensOptions)[0]) => {
    setSelectedLens(lens);

    if (lens.hasWhatsApp) {
      setLensForModal(lens);
      setIsLensModalOpen(true);
    }
  };

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
  const whatsappText =
    `Olá! Gostei da armação "${product.name}" (${categoryLabel}) na Ótica Ventara.\n` +
    `• Cor selecionada: ${selectedVariant.color_name}\n` +
    `• Interesse em lentes: ${selectedLens.name} (${selectedLens.desc})\n` +
    `Gostaria de saber mais sobre disponibilidade e valores para minha receita.`;
  const whatsappUrl = buildWhatsAppUrl(whatsappText);

  return (
    <div className="space-y-6 pt-2">
      {/* Seletor Interativo de Cores: apenas exibido quando houver 2 ou mais variantes */}
      {variants.length >= 2 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 uppercase tracking-wider">
              Cor da Armação:
            </span>
            <span className="font-bold text-amber-600">{selectedVariant.color_name}</span>
          </div>

          <div
            className="flex items-center gap-2.5 flex-wrap"
            role="radiogroup"
            aria-label="Cores disponíveis para esta armação"
          >
            {variants.map((v) => {
              const isSelected = selectedVariant.id === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedVariant(v)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all active:scale-95 cursor-pointer ${
                    isSelected
                      ? "bg-amber-50 text-amber-900 border-amber-400 shadow-2xs font-semibold ring-1 ring-amber-400"
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
      )}

      {/* Guia Interativo de Escolha de Lentes */}
      <div className="space-y-3 pt-3 border-t border-slate-200/80">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={14} className="text-amber-600" />
            Precisa de lentes para esta armação?
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full shadow-2xs">
            <Sparkles size={11} className="text-amber-600" />
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
                onClick={() => handleSelectLens(lens)}
                className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] flex items-start gap-3 cursor-pointer relative group ${
                  isChosen
                    ? "bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-white border-amber-400 text-slate-900 shadow-2xs ring-1 ring-amber-400/40"
                    : "bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-slate-50/60 hover:shadow-2xs"
                }`}
                title={lens.hasWhatsApp ? `Consultar ${lens.name} no WhatsApp` : lens.name}
              >
                <div
                  className={`p-2 rounded-xl flex-shrink-0 mt-0.5 transition-colors ${
                    isChosen
                      ? "bg-amber-400 text-slate-950 shadow-2xs"
                      : "bg-slate-100 text-amber-700 group-hover:bg-amber-100 group-hover:text-amber-800"
                  }`}
                >
                  <LensIcon size={15} />
                </div>
                <div className="min-w-0 flex-1 pr-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-semibold leading-tight text-slate-900">
                      {lens.name}
                    </p>
                    {lens.hasWhatsApp && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300/80 px-2 py-0.5 rounded-full shadow-2xs shrink-0 tracking-wide">
                        <MessageCircle size={10} className="fill-emerald-600 text-emerald-600" />
                        <span>WhatsApp</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight mt-1">
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

        {/* Botão Secundário: Adicionar à Seleção + Favoritos */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-semibold text-xs tracking-wider uppercase py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
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

          <button
            type="button"
            onClick={toggleWishlist}
            className={`p-3.5 rounded-2xl border transition-all active:scale-95 cursor-pointer ${
              isWishlist
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            }`}
            title={isWishlist ? "Remover dos favoritos" : "Salvar nos favoritos"}
            aria-label="Favoritar armação"
          >
            <Heart size={18} className={isWishlist ? "fill-red-400 text-red-400" : ""} />
          </button>
        </div>

        {/* Botão Terciário: Consultar Lentes no WhatsApp (Abre Modal de Consultoria / Lead) */}
        <a
          href={whatsappUrl}
          onClick={(e) => {
            e.preventDefault();
            setLensForModal(selectedLens.hasWhatsApp ? selectedLens : lensOptions[1]);
            setIsLensModalOpen(true);
          }}
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

      {/* Modal de Captação e Consultoria de Lentes estilo Ótica Vendrame */}
      <LensLeadModal
        isOpen={isLensModalOpen}
        onClose={() => setIsLensModalOpen(false)}
        productName={product.name}
        frameType={product.frame_type}
        colorName={selectedVariant.color_name || "Padrão"}
        selectedLensName={lensForModal.name}
        selectedLensDesc={lensForModal.desc}
      />
    </div>
  );
}
