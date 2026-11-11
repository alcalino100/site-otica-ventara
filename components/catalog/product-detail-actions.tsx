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
  Truck,
  Store,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Product, ProductVariant } from "@/types/ecommerce";
import { getStoredCart, saveStoredCart, addToCart, CartProduct } from "@/lib/cart";
import { CartModal } from "@/components/cart/cart-modal";
import { LensLeadModal } from "@/components/catalog/lens-lead-modal";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { formatProductPricing } from "@/lib/pricing";

interface ProductDetailActionsProps {
  product: Product;
  onAddedNotification?: (message: string) => void;
  selectedVariant?: ProductVariant | null;
  onSelectVariant?: (v: ProductVariant) => void;
}

export function ProductDetailActions({
  product,
  onAddedNotification,
  selectedVariant: propSelectedVariant,
  onSelectVariant,
}: ProductDetailActionsProps) {
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartModalView, setCartModalView] = useState<"items" | "checkout">("items");
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);

  // Configurações Globais do Site (Frete e Identidade)
  const { shipping, identity } = useSiteSettings();

  // Variantes de Cor disponíveis
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
            price_in_cents: product.price_in_cents,
            compare_at_price_in_cents: product.compare_at_price_in_cents,
            image_url: null,
            is_available: true,
            sort_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

  const [internalVariant, setInternalVariant] = useState(variants[0]);
  const currentVariant = propSelectedVariant || internalVariant;

  const handleVariantChange = (v: ProductVariant) => {
    setInternalVariant(v);
    if (onSelectVariant) {
      onSelectVariant(v);
    }
  };

  const toggleWishlist = () => setIsWishlist((prev) => !prev);

  // Estoque real da variante atual
  const currentStock =
    typeof currentVariant.stock_quantity === "number"
      ? currentVariant.stock_quantity
      : 10;
  const isOutOfStock = currentStock <= 0;
  const lowStockThreshold = product.low_stock_threshold || 3;
  const isLowStock = !isOutOfStock && currentStock <= lowStockThreshold;

  // Preço e Regras de Parcelamento Unificadas
  const activePriceInCents =
    typeof currentVariant.price_in_cents === "number" && currentVariant.price_in_cents > 0
      ? currentVariant.price_in_cents
      : product.price_in_cents;

  const activeCompareAtInCents =
    typeof currentVariant.compare_at_price_in_cents === "number" &&
    currentVariant.compare_at_price_in_cents > 0
      ? currentVariant.compare_at_price_in_cents
      : product.compare_at_price_in_cents;

  const pricing = formatProductPricing({
    price_in_cents: activePriceInCents,
    compare_at_price_in_cents: activeCompareAtInCents,
  });

  // Modalidade de Compra: "Grau Completo" vs "Somente Armação"
  const [purchaseMode, setPurchaseMode] = useState<"with_lenses" | "frame_only">("with_lenses");

  // Opções de Lentes
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

  const [selectedLens, setSelectedLens] = useState(lensOptions[1]);
  const [isLensModalOpen, setIsLensModalOpen] = useState(false);
  const [lensForModal, setLensForModal] = useState(lensOptions[1]);

  const handleSelectLens = (lens: (typeof lensOptions)[0]) => {
    setSelectedLens(lens);
    if (lens.id === "none") {
      setPurchaseMode("frame_only");
    } else {
      setPurchaseMode("with_lenses");
      if (lens.hasWhatsApp) {
        setLensForModal(lens);
        setIsLensModalOpen(true);
      }
    }
  };

  // Cálculo de Frete por CEP
  const [cepInput, setCepInput] = useState("");
  const [shippingResult, setShippingResult] = useState<{
    calculated: boolean;
    feeText: string;
    deadlineText: string;
    isFree: boolean;
  } | null>(null);

  const handleCalculateShipping = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = cepInput.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    if (!shipping || typeof shipping.default_shipping_fee_cents !== "number") {
      return;
    }

    const isFree = activePriceInCents >= (shipping.free_shipping_threshold_cents || 35000);
    const feeFormatted = isFree
      ? "Grátis"
      : (shipping.default_shipping_fee_cents / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

    setShippingResult({
      calculated: true,
      feeText: feeFormatted,
      deadlineText: "Entrega em 3 a 7 dias úteis",
      isFree,
    });
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 8);
    if (val.length > 5) {
      val = `${val.slice(0, 5)}-${val.slice(5)}`;
    }
    setCepInput(val);
    if (shippingResult) setShippingResult(null);
  };

  // Montagem do Item de Carrinho
  const createCartItem = (): Omit<CartProduct, "addedAt"> => {
    const primaryImg =
      currentVariant.image_url ||
      product.images?.find((i) => i.is_primary)?.url ||
      product.images?.[0]?.url;

    return {
      id: `${product.id}::${currentVariant.id}`,
      productId: product.id,
      variantId: currentVariant.id,
      sku: currentVariant.sku || product.sku,
      name: product.name,
      slug: product.slug,
      category: product.category?.name || product.frame_type,
      color: currentVariant.color_name || "Padrão",
      colorHex: currentVariant.color_hex || "#1e293b",
      priceInCents: activePriceInCents,
      originalPriceInCents: activeCompareAtInCents || null,
      imageUrl: primaryImg,
      quantity: 1,
      stockQuantity: currentStock,
    };
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const item = createCartItem();
    const updated = addToCart(item);
    setCartItems(updated);
    setIsAdded(true);
    if (onAddedNotification) {
      onAddedNotification(`${product.name} (${currentVariant.color_name}) adicionado à seleção.`);
    }
    // Abre a gaveta do carrinho automaticamente para usabilidade sem atrito
    setCartModalView("items");
    setIsCartOpen(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const item = createCartItem();
    const updated = addToCart(item);
    setCartItems(updated);
    setCartModalView("checkout");
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (id: string) => {
    const current = getStoredCart().filter((i) => i.id !== id);
    saveStoredCart(current);
    setCartItems(current);
  };

  const handleClearCart = () => {
    saveStoredCart([]);
    setCartItems([]);
  };

  // URL Direta de Dúvidas no WhatsApp
  const categoryLabel = product.frame_type === "Solar" ? "Óculos Solar" : "Armação de Grau";
  const finalPriceInReais = activePriceInCents / 100;
  const dimensionsSummary = [
    product.dimensions_lens_mm ? `Lente ${product.dimensions_lens_mm} mm` : null,
    product.dimensions_bridge_mm ? `Ponte ${product.dimensions_bridge_mm} mm` : null,
    product.dimensions_temple_mm ? `Haste ${product.dimensions_temple_mm} mm` : null,
  ].filter(Boolean).join(" · ");

  const whatsappQueryText =
    `Olá equipe da Ótica Ventara! Tenho dúvidas sobre a armação:\n\n` +
    `👓 *${product.name}* (${categoryLabel})\n` +
    `• Cor: *${currentVariant.color_name}* (SKU: ${currentVariant.sku || "N/A"})\n` +
    (dimensionsSummary ? `• Medidas: ${dimensionsSummary}\n` : "") +
    `• Preço: R$ ${finalPriceInReais.toFixed(2).replace(".", ",")}\n\n` +
    `Poderiam me orientar sobre este modelo?`;
  const whatsappUrl = buildWhatsAppUrl(whatsappQueryText);

  // WhatsApp para aviso de reposição quando esgotado
  const whatsappRestockText =
    `Olá! Gostaria de ser avisado(a) quando a armação *${product.name}* na cor *${currentVariant.color_name}* voltar ao estoque na Ótica Ventara.`;
  const whatsappRestockUrl = buildWhatsAppUrl(whatsappRestockText);

  return (
    <div className="space-y-6 pt-2">
      {/* 1. Seletor de Cores com Miniaturas e Nome Escrito ao Lado */}
      {variants.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 uppercase tracking-wider">
              Selecione a cor:
            </span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              {currentVariant.color_name}
            </span>
          </div>

          <div
            className="flex items-center gap-3 flex-wrap"
            role="radiogroup"
            aria-label="Cores disponíveis para esta armação"
          >
            {variants.map((v) => {
              const isSelected = currentVariant.id === v.id;
              const hasPhoto = Boolean(v.image_url);
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleVariantChange(v)}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl text-xs font-medium border transition-all active:scale-95 cursor-pointer ${
                    isSelected
                      ? "bg-amber-50 text-amber-950 border-amber-500 shadow-xs ring-2 ring-amber-400 font-bold"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Miniatura com foto da cor ou swatch */}
                  {hasPhoto ? (
                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-black/10 shrink-0 bg-slate-100">
                      <img
                        src={v.image_url!}
                        alt={v.color_name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  ) : (
                    <span
                      className="w-5 h-5 rounded-full border border-black/15 shadow-2xs shrink-0 ml-1"
                      style={{ backgroundColor: v.color_hex || "#1e293b" }}
                    />
                  )}
                  <span>{v.color_name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Alerta de Estoque Real (Urgência Real sem Fraude) */}
      {isOutOfStock ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
          <AlertTriangle size={16} className="shrink-0 text-red-600" />
          <span>
            <strong>Modelo esgotado nesta cor.</strong> Deseja ser avisado na reposição?
          </span>
        </div>
      ) : isLowStock ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
          <AlertTriangle size={16} className="shrink-0 text-amber-600" />
          <span>
            <strong>Últimas unidades disponíveis!</strong> Restam apenas {currentStock}{" "}
            {currentStock === 1 ? "peça" : "peças"} em estoque.
          </span>
        </div>
      ) : null}

      {/* 3. Opção em Destaque: "Compre com seu grau" vs "Somente a armação" */}
      <div className="space-y-3 pt-3 border-t border-slate-200/80">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers size={14} className="text-amber-600" />
            Configuração da Compra
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Sparkles size={11} className="text-amber-600" />
            Laboratório Ventara
          </span>
        </div>

        {/* Abas de Escolha Rápida */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setPurchaseMode("with_lenses");
              if (selectedLens.id === "none") setSelectedLens(lensOptions[1]);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              purchaseMode === "with_lenses"
                ? "bg-white text-slate-950 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            👓 Compre com seu Grau
          </button>
          <button
            type="button"
            onClick={() => {
              setPurchaseMode("frame_only");
              setSelectedLens(lensOptions[0]);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              purchaseMode === "frame_only"
                ? "bg-white text-slate-950 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Somente a Armação
          </button>
        </div>

        {/* Grade de Lentes quando em modo Grau */}
        {purchaseMode === "with_lenses" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {lensOptions.slice(1).map((lens) => {
              const isChosen = selectedLens.id === lens.id;
              const LensIcon = lens.icon;
              return (
                <button
                  key={lens.id}
                  type="button"
                  onClick={() => handleSelectLens(lens)}
                  className={`p-3 rounded-xl border text-left transition-all active:scale-[0.98] flex flex-col justify-between cursor-pointer ${
                    isChosen
                      ? "bg-amber-50/90 border-amber-400 text-slate-900 ring-1 ring-amber-400"
                      : "bg-white border-slate-200 text-slate-700 hover:border-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <LensIcon size={14} className="text-amber-600 shrink-0" />
                    <span className="text-xs font-bold leading-tight">{lens.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 leading-tight">
                    {lens.desc}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Botões de Ação Principais */}
      <div className="space-y-3 pt-3 border-t border-slate-200/80">
        {isOutOfStock ? (
          <a
            href={whatsappRestockUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[48px] bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md"
          >
            <MessageCircle size={18} className="text-emerald-400" />
            <span>Avise-me quando chegar no WhatsApp</span>
          </a>
        ) : (
          <>
            {/* Botão Primário: Adicionar ao Carrinho (Min 48px, Abre Gaveta com Resumo) */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full min-h-[48px] bg-[#ffd62e] hover:bg-[#ffcd00] active:scale-95 text-[#06111f] font-extrabold text-sm tracking-wider uppercase py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
            >
              {isAdded ? (
                <>
                  <Check size={18} className="text-emerald-800 stroke-[3]" />
                  <span className="font-bold text-emerald-950">Adicionado ao Carrinho!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} className="text-[#06111f]" />
                  <span>Adicionar ao Carrinho</span>
                </>
              )}
            </button>

            {/* Linha com Botão Secundário WhatsApp + Favoritos */}
            <div className="flex items-center gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wider uppercase py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
              >
                <MessageCircle size={16} className="text-white" />
                <span>Dúvidas no WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={toggleWishlist}
                className={`p-3 rounded-2xl border transition-all active:scale-95 cursor-pointer shrink-0 ${
                  isWishlist
                    ? "bg-red-500/10 border-red-500/30 text-red-600"
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-900"
                }`}
                title={isWishlist ? "Remover dos favoritos" : "Salvar nos favoritos"}
                aria-label="Favoritar armação"
              >
                <Heart size={18} className={isWishlist ? "fill-red-500 text-red-500" : ""} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* 5. Bloco de Frete por CEP (Apenas se configurado no Admin) */}
      {shipping && typeof shipping.default_shipping_fee_cents === "number" && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 text-xs text-slate-700">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Truck size={14} className="text-amber-600" />
              Simular Prazo e Frete
            </span>
            {shipping.store_pickup_enabled && (
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Retirada Grátis em Araçatuba
              </span>
            )}
          </div>

          <form onSubmit={handleCalculateShipping} className="flex gap-2">
            <input
              type="text"
              placeholder="00000-000"
              value={cepInput}
              onChange={handleCepChange}
              maxLength={9}
              className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-mono text-xs"
            />
            <button
              type="submit"
              disabled={cepInput.replace(/\D/g, "").length !== 8}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold rounded-xl transition-all cursor-pointer text-xs"
            >
              Calcular
            </button>
          </form>

          {shippingResult && (
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between font-semibold">
                <span>Envio Nacional</span>
                <span className={shippingResult.isFree ? "text-emerald-700 font-bold" : "text-slate-900"}>
                  {shippingResult.feeText}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{shippingResult.deadlineText}</p>
              {shipping.store_pickup_enabled && (
                <div className="pt-2 border-t border-slate-200/60 flex items-start gap-1.5 text-[11px] text-slate-600">
                  <Store size={13} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Retirada na Loja Física:</strong> Grátis em até 2 horas na Rua Princesa Isabel, 221 - Centro, Araçatuba-SP.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. Barra Fixa Inferior no Mobile (Respeita safe-area e não cobre WhatsApp) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-50 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center justify-between gap-3 shadow-2xl">
        <div className="min-w-0">
          <span className="text-[10px] text-slate-500 uppercase block font-semibold truncate">
            {currentVariant.color_name}
          </span>
          <span className="text-base font-bold text-slate-950 font-mono">
            {pricing.currentPriceFormatted}
          </span>
        </div>

        <button
          type="button"
          onClick={isOutOfStock ? undefined : handleAddToCart}
          disabled={isOutOfStock}
          className="flex-1 min-h-[48px] bg-[#ffd62e] disabled:bg-slate-300 text-[#06111f] font-extrabold text-xs tracking-wider uppercase py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer"
        >
          <ShoppingBag size={16} />
          <span>{isOutOfStock ? "Esgotado" : "Adicionar"}</span>
        </button>
      </div>

      {/* Gaveta do Carrinho com Revalidação Dinâmica */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        initialView={cartModalView}
      />

      {/* Modal de Consultoria de Lentes */}
      <LensLeadModal
        isOpen={isLensModalOpen}
        onClose={() => setIsLensModalOpen(false)}
        productName={product.name}
        frameType={product.frame_type}
        colorName={currentVariant.color_name || "Padrão"}
        selectedLensName={lensForModal.name}
        selectedLensDesc={lensForModal.desc}
      />
    </div>
  );
}
