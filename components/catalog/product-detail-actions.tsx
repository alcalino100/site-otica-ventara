"use client";

import React, { useState } from "react";
import { ShoppingBag, MessageCircle, Check, ArrowRight } from "lucide-react";
import { Product } from "@/types/ecommerce";
import { getStoredCart, saveStoredCart, buildWhatsAppProductUrl, CartProduct } from "@/lib/cart";

interface ProductDetailActionsProps {
  product: Product;
}

export function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    const currentCart = getStoredCart();
    const primaryImg = product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url;

    const cartItem: CartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category?.name || product.frame_type,
      color: product.variants?.[0]?.color_name || "Padrão",
      priceInCents: product.price_in_cents,
      imageUrl: primaryImg,
    };

    // Adiciona se ainda não estiver ou incrementa
    saveStoredCart([...currentCart, cartItem]);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const whatsappUrl = buildWhatsAppProductUrl(product.name, product.slug);

  return (
    <div className="space-y-3 pt-4">
      <button
        type="button"
        onClick={handleAdd}
        className="w-full bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-[#030c13] font-semibold text-xs tracking-wider uppercase py-3.5 px-6 rounded-full flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-400/10"
      >
        {isAdded ? (
          <>
            <Check size={17} className="text-emerald-950 stroke-[3]" />
            <span>Adicionado à Seleção!</span>
          </>
        ) : (
          <>
            <ShoppingBag size={17} />
            <span>Adicionar à Seleção</span>
          </>
        )}
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-[#11283c] hover:bg-[#16334d] border border-amber-400/30 text-white font-medium text-xs tracking-wider uppercase py-3.5 px-6 rounded-full flex items-center justify-center gap-2 transition-colors text-center"
      >
        <MessageCircle size={17} className="text-emerald-400" />
        <span>Consultar Lentes no WhatsApp</span>
        <ArrowRight size={14} className="text-slate-400" />
      </a>

      <p className="text-[11px] text-slate-400 text-center pt-1 leading-relaxed">
        Atendimento consultivo na loja em Araçatuba-SP ou suporte digital via WhatsApp.
      </p>
    </div>
  );
}
