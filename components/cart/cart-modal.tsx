"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Trash2,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Sparkles,
  QrCode,
  CreditCard,
  Copy,
  Check,
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Truck,
  Store,
  Tag,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  CartProduct,
  buildWhatsAppCartUrl,
  updateCartQuantity,
  saveStoredCart,
  getStoredCart,
} from "@/lib/cart";
import { FrameArt } from "../catalog/frame-art";
import { useSiteSettings } from "../providers/site-settings-provider";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartProduct[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  initialView?: ModalView;
}

type ModalView = "items" | "checkout" | "pix" | "success";
type CheckoutStep = 1 | 2 | 3 | 4;

export function CartModal({
  isOpen,
  onClose,
  cartItems: initialCartItems,
  onRemoveItem,
  onClearCart,
  initialView = "items",
}: CartModalProps) {
  const [view, setView] = useState<ModalView>(initialView);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estado local gerenciado para permitir atualizações de quantidade e revalidação dinâmica imediata
  const [items, setItems] = useState<CartProduct[]>(initialCartItems);
  const [priceChangeNotice, setPriceChangeNotice] = useState<string | null>(null);
  const [hasOutOfStockItem, setHasOutOfStockItem] = useState(false);

  // Item removido recentemente para suporte a "Desfazer"
  const [recentlyRemovedItem, setRecentlyRemovedItem] = useState<CartProduct | null>(null);
  const [undoToastVisible, setUndoToastVisible] = useState(false);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sincroniza itens com props
  useEffect(() => {
    setItems(initialCartItems);
  }, [initialCartItems]);

  // Sincroniza visualização inicial ao abrir
  useEffect(() => {
    if (isOpen) {
      if (initialView && initialCartItems.length > 0) {
        setView(initialView);
      } else if (initialCartItems.length === 0) {
        setView("items");
      }
      setCheckoutStep(1);
    }
  }, [isOpen, initialView, initialCartItems.length]);

  // REVALIDAÇÃO DINÂMICA DE PREÇO E ESTOQUE AO ABRIR O CARRINHO
  useEffect(() => {
    if (!isOpen || items.length === 0) return;

    let isMounted = true;
    async function validateCart() {
      try {
        const payload = items.map((it) => ({
          id: it.id,
          productId: it.productId || it.id.split("-")[0],
          variantId: it.variantId,
          priceInCents: it.priceInCents,
          quantity: it.quantity,
        }));

        const res = await fetch("/api/cart/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: payload }),
        });

        if (!res.ok) return;
        const data = await res.json();

        if (!isMounted) return;

        if (data.hasPriceChanges || data.hasOutOfStock) {
          const updatedItems = items.map((localItem) => {
            const match = data.items?.find((v: any) => v.id === localItem.id);
            if (match) {
              return {
                ...localItem,
                priceInCents: match.currentPriceInCents,
                stockQuantity: match.availableStock,
                isOutOfStock: match.isOutOfStock,
                priceChangedMessage: match.priceChanged ? match.message : undefined,
              };
            }
            return localItem;
          });

          setItems(updatedItems);
          saveStoredCart(updatedItems);

          if (data.hasPriceChanges) {
            setPriceChangeNotice(
              "Um ou mais preços foram atualizados de acordo com o catálogo atual da ótica."
            );
          }
          if (data.hasOutOfStock) {
            setHasOutOfStockItem(true);
          }
        } else {
          setHasOutOfStockItem(false);
          setPriceChangeNotice(null);
        }
      } catch (err) {
        console.warn("Aviso na revalidação do carrinho:", err);
      }
    }

    validateCart();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Form de Checkout
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerDocument, setCustomerDocument] = useState("");
  const [deliveryType, setDeliveryType] = useState<"store_pickup" | "delivery">("store_pickup");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "credit_card">("pix");

  // Endereço de Entrega
  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Araçatuba");
  const [state, setState] = useState("SP");
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // Dados do Pedido Criado
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeBase64: string | null;
    ticketUrl?: string;
    expiresAt: string;
  } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(15 * 60);

  // Regras de Frete e Cupom
  const { shipping, identity } = useSiteSettings();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    message?: string;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isCouponOpen, setIsCouponOpen] = useState(false);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Trava de scroll e ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (view === "checkout") setView("items");
        else onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen, onClose, view]);

  // Reset de tela ao reabrir
  useEffect(() => {
    if (isOpen && view === "success") {
      setView("items");
    }
  }, [isOpen]);

  // Timer regressivo para expiração do Pix (15 minutos conforme especificação)
  useEffect(() => {
    if (view !== "pix") return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [view]);

  // Polling em tempo real para verificar se o Pix foi pago via Webhook
  useEffect(() => {
    if (view !== "pix" || !createdOrder?.reference_code) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/orders/check-status?reference_code=${encodeURIComponent(
            createdOrder.reference_code
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.is_paid || data.status === "paid") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            onClearCart();
            setView("success");
          }
        }
      } catch {
        // Falha silenciosa no polling
      }
    };

    pollingRef.current = setInterval(checkStatus, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [view, createdOrder, onClearCart]);

  // Atualização de Quantidade de Item
  const handleUpdateQty = (itemId: string, newQty: number) => {
    const updated = updateCartQuantity(itemId, newQty);
    setItems(updated);
  };

  // Remoção de Item com Suporte a "Desfazer"
  const handleRemove = (itemId: string) => {
    const itemToRemove = items.find((i) => i.id === itemId);
    if (itemToRemove) {
      setRecentlyRemovedItem(itemToRemove);
      setUndoToastVisible(true);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => {
        setUndoToastVisible(false);
        setRecentlyRemovedItem(null);
      }, 6000);
    }
    const updated = items.filter((i) => i.id !== itemId);
    setItems(updated);
    saveStoredCart(updated);
    onRemoveItem(itemId);
  };

  const handleUndoRemove = () => {
    if (!recentlyRemovedItem) return;
    const restored = [...items, recentlyRemovedItem];
    setItems(restored);
    saveStoredCart(restored);
    setUndoToastVisible(false);
    setRecentlyRemovedItem(null);
  };

  // Busca Automática de CEP (ViaCEP)
  const handleCepLookup = async (cepValue: string) => {
    const clean = cepValue.replace(/\D/g, "");
    if (clean.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      if (res.ok) {
        const data = await res.json();
        if (!data.erro) {
          setStreet(data.logradouro || "");
          setNeighborhood(data.bairro || "");
          setCity(data.localidade || "Araçatuba");
          setState(data.uf || "SP");
        }
      }
    } catch (err) {
      console.warn("Aviso na busca de CEP:", err);
    } finally {
      setIsLoadingCep(false);
    }
  };

  // Máscaras de entrada
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (val.length > 9) {
      val = `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6, 9)}-${val.slice(9)}`;
    } else if (val.length > 6) {
      val = `${val.slice(0, 3)}.${val.slice(3, 6)}.${val.slice(6)}`;
    } else if (val.length > 3) {
      val = `${val.slice(0, 3)}.${val.slice(3)}`;
    }
    setCustomerDocument(val);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (val.length > 10) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    }
    setCustomerPhone(val);
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 8);
    if (val.length > 5) {
      val = `${val.slice(0, 5)}-${val.slice(5)}`;
    }
    setPostalCode(val);
    if (val.replace(/\D/g, "").length === 8) {
      handleCepLookup(val);
    }
  };

  // Cálculos Financeiros
  const subtotalCents = items.reduce(
    (acc, it) => acc + (it.priceInCents || 0) * (it.quantity || 1),
    0
  );

  const freeThreshold = shipping?.free_shipping_threshold_cents ?? 35000;
  const defaultFee = shipping?.default_shipping_fee_cents ?? 2500;
  const isPickup = deliveryType === "store_pickup";
  const isFreeShipping = subtotalCents >= freeThreshold;
  const shippingFeeCents = isPickup || isFreeShipping ? 0 : defaultFee;
  const remainingForFreeShippingCents = Math.max(0, freeThreshold - subtotalCents);

  // Cupom de Desconto
  let discountCents = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountCents = Math.round((subtotalCents * appliedCoupon.discountValue) / 100);
    } else {
      discountCents = Math.min(
        subtotalCents,
        Math.round(appliedCoupon.discountValue * 100)
      );
    }
  }

  const totalCents = Math.max(0, subtotalCents + shippingFeeCents - discountCents);

  const subtotalFormatted = (subtotalCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const discountFormatted = (discountCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const shippingFormatted =
    shippingFeeCents === 0
      ? "Grátis"
      : (shippingFeeCents / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
  const totalFormatted = (totalCents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const installmentFormatted = (totalCents / 1000).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setIsValidatingCoupon(true);
    setCouponFeedback(null);
    try {
      const res = await fetch("/api/checkout/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountType: data.discountType,
          discountValue: data.discountValue,
          message: data.message,
        });
        setCouponFeedback({ type: "success", text: data.message });
        setCouponInput("");
      } else {
        setCouponFeedback({
          type: "error",
          text: data.message || "Cupom inválido ou expirado.",
        });
      }
    } catch {
      setCouponFeedback({
        type: "error",
        text: "Erro de conexão ao validar cupom.",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleWhatsAppConsultation = () => {
    setIsSubmitting(true);
    const whatsappUrl = buildWhatsAppCartUrl(items, {
      name: customerName,
      deliveryType,
      address:
        deliveryType === "delivery"
          ? `${street}, ${number} - ${neighborhood}, ${city}-${state} (CEP: ${postalCode})`
          : undefined,
    });
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setIsSubmitting(false);
    onClose();
  };

  // Navegação entre as 4 Etapas do Checkout
  const validateStep = (step: CheckoutStep): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!customerName.trim() || customerName.trim().length < 3) {
        setErrorMessage("Por favor, informe seu nome completo.");
        return false;
      }
      if (!customerEmail.includes("@")) {
        setErrorMessage("Por favor, informe um e-mail válido.");
        return false;
      }
      const cleanPhone = customerPhone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        setErrorMessage("Por favor, informe seu celular/WhatsApp com DDD.");
        return false;
      }
      const cleanCpf = customerDocument.replace(/\D/g, "");
      if (cleanCpf.length !== 11) {
        setErrorMessage("Por favor, informe um CPF válido (11 dígitos).");
        return false;
      }
    } else if (step === 2) {
      if (deliveryType === "delivery") {
        if (postalCode.replace(/\D/g, "").length !== 8) {
          setErrorMessage("Por favor, informe um CEP válido com 8 dígitos.");
          return false;
        }
        if (!street.trim() || !number.trim() || !neighborhood.trim()) {
          setErrorMessage("Por favor, preencha o logradouro, número e bairro para a entrega.");
          return false;
        }
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(checkoutStep)) {
      if (checkoutStep < 4) {
        setCheckoutStep((prev) => (prev + 1) as CheckoutStep);
      }
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    if (checkoutStep > 1) {
      setCheckoutStep((prev) => (prev - 1) as CheckoutStep);
    } else {
      setView("items");
    }
  };

  // Submissão Final do Checkout
  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const itemsPayload = items.map((it) => {
        let prodId = it.productId || it.id;
        if (prodId.length > 36 && prodId[36] === "-") {
          prodId = prodId.slice(0, 36);
        } else if (!prodId || prodId.length < 10) {
          prodId = it.slug || prodId;
        }
        return {
          product_id: prodId,
          variant_id: it.variantId,
          quantity: it.quantity || 1,
        };
      });

      const shippingAddress =
        deliveryType === "delivery"
          ? {
              street: street.trim(),
              number: number.trim(),
              complement: complement.trim() || undefined,
              neighborhood: neighborhood.trim(),
              city: city.trim(),
              state: state.trim(),
              postal_code: postalCode.replace(/\D/g, ""),
            }
          : undefined;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim().toLowerCase(),
          customer_phone: customerPhone.replace(/\D/g, ""),
          customer_document: customerDocument.replace(/\D/g, ""),
          delivery_type: deliveryType,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
          items: itemsPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Não foi possível concluir o checkout. Tente novamente.");
        setIsSubmitting(false);
        return;
      }

      setCreatedOrder(data.order);

      if (paymentMethod === "pix" && data.payment?.pix_copia_e_cola) {
        setPixData({
          qrCode: data.payment.pix_copia_e_cola,
          qrCodeBase64: data.payment.pix_qr_code_base64 || null,
          ticketUrl: data.payment.ticket_url,
          expiresAt: data.payment.expires_at || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        });
        setTimeLeftSeconds(15 * 60);
        setView("pix");
      } else if (paymentMethod === "credit_card") {
        if (data.payment?.checkout_url) {
          window.open(data.payment.checkout_url, "_blank", "noopener,noreferrer");
        }
        onClearCart();
        setView("success");
      } else {
        onClearCart();
        setView("success");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro de conexão ao processar o checkout.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const minutesRemaining = Math.floor(timeLeftSeconds / 60);
  const secondsRemaining = timeLeftSeconds % 60;
  const timeFormatted = `${String(minutesRemaining).padStart(2, "0")}:${String(
    secondsRemaining
  ).padStart(2, "0")}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="cart-modal-root fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop cinematográfico */}
          <motion.div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
          />

          {/* Cart Drawer lateral desktop / Tela Cheia mobile */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Sua seleção de armações e pagamento"
            className="relative z-10 w-full sm:max-w-[580px] md:max-w-[640px] h-full bg-white text-slate-900 border-l border-slate-200 shadow-[-20px_0_60px_rgba(0,0,0,0.25)] flex flex-col justify-between overflow-hidden"
            initial={{ transform: "translateX(100%)" }}
            animate={{ transform: "translateX(0%)" }}
            exit={{ transform: "translateX(100%)" }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header com Navegação e Breadcrumb de Etapas */}
            <div className="p-5 sm:p-6 pb-4 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {view === "checkout" ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-semibold transition-colors mr-1 cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                      <span>{checkoutStep === 1 ? "Voltar ao Carrinho" : "Etapa Anterior"}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 tracking-[0.2em] uppercase">
                      ÓTICA VENTARA · ATENDIMENTO EXCLUSIVO
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors active:scale-90 cursor-pointer"
                  aria-label="Fechar carrinho"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  {view === "items" && "Seu Carrinho"}
                  {view === "checkout" && (
                    <>
                      {checkoutStep === 1 && "1. Seus Dados"}
                      {checkoutStep === 2 && "2. Entrega"}
                      {checkoutStep === 3 && "3. Pagamento"}
                      {checkoutStep === 4 && "4. Revisão do Pedido"}
                    </>
                  )}
                  {view === "pix" && "Pagamento via Pix"}
                  {view === "success" && "Pedido Confirmado"}
                </h2>
                {view === "items" && (
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-medium shrink-0">
                    {items.length} {items.length === 1 ? "item" : "itens"}
                  </span>
                )}
                {view === "pix" && (
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-mono font-semibold flex items-center gap-1.5">
                    <Clock size={13} /> {timeFormatted}
                  </span>
                )}
              </div>

              {/* Stepper Visual no Checkout (Etapas 1 a 4) */}
              {view === "checkout" && (
                <div className="grid grid-cols-4 gap-2 pt-3">
                  {[
                    { step: 1, label: "Dados" },
                    { step: 2, label: "Entrega" },
                    { step: 3, label: "Pagamento" },
                    { step: 4, label: "Revisão" },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`text-center py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                        checkoutStep === s.step
                          ? "bg-amber-400 text-slate-950 border-amber-400 shadow-2xs"
                          : checkoutStep > s.step
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      }`}
                    >
                      {s.step}. {s.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AVISOS DE REVALIDAÇÃO DINÂMICA (Preço alterado ou Estoque Esgotado) */}
            {priceChangeNotice && view === "items" && (
              <div className="bg-amber-50 border-b border-amber-200 p-3.5 text-xs text-amber-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-600 shrink-0" />
                  <span>{priceChangeNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPriceChangeNotice(null)}
                  className="text-amber-800 hover:text-amber-950 font-bold text-xs"
                >
                  OK
                </button>
              </div>
            )}

            {hasOutOfStockItem && view === "items" && (
              <div className="bg-red-50 border-b border-red-200 p-3.5 text-xs text-red-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-600 shrink-0" />
                <span>
                  <strong>Atenção:</strong> Um ou mais itens no seu carrinho estão esgotados. Remova-os para concluir o pedido.
                </span>
              </div>
            )}

            {/* BARRA DE FRETE GRÁTIS DINÂMICA */}
            {view === "items" && items.length > 0 && (
              <div className="bg-slate-50 border-b border-slate-200 p-3.5 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <Truck size={14} className="text-amber-600" />
                    Frete Grátis Nacional (compras acima de R$ {(freeThreshold / 100).toFixed(0)})
                  </span>
                  <span className={isFreeShipping ? "text-emerald-700 font-bold" : "text-slate-600 font-mono"}>
                    {isFreeShipping
                      ? "Parabéns! Frete Grátis Garantido!"
                      : `Faltam ${(remainingForFreeShippingCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}
                  </span>
                </div>

                {/* Barra de Progresso */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (subtotalCents / freeThreshold) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* TOAST DE DESFAZER REMOÇÃO */}
            {undoToastVisible && recentlyRemovedItem && (
              <div className="mx-4 mt-3 p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs shadow-lg animate-in fade-in slide-in-from-top-2">
                <span>Armação removida da sua seleção.</span>
                <button
                  type="button"
                  onClick={handleUndoRemove}
                  className="font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  Desfazer
                </button>
              </div>
            )}

            {/* CONTEÚDO PRINCIPAL */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-white">
              {/* VIEW 1: ITENS DA SELEÇÃO COM CONTROLE DE QUANTIDADE E ESTOQUE */}
              {view === "items" && (
                <>
                  {items.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center">
                      <div className="w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-inner">
                        <ShoppingBag size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        Seu carrinho está vazio
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                        Explore nosso catálogo de armações solares e de grau com curadoria autoral da Ótica Ventara.
                      </p>
                      <Button
                        variant="dark"
                        onClick={onClose}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wider uppercase px-6 py-3 rounded-xl active:scale-95"
                      >
                        EXPLORAR ARMAÇÕES
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {items.map((item) => {
                        const itemQty = item.quantity || 1;
                        const itemStock = typeof item.stockQuantity === "number" ? item.stockQuantity : 10;
                        const isOut = Boolean(item.isOutOfStock) || itemStock <= 0;
                        const itemTotalFormatted = (
                          ((item.priceInCents || 0) * itemQty) /
                          100
                        ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

                        return (
                          <div
                            key={item.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                              isOut
                                ? "bg-red-50/60 border-red-200"
                                : "bg-slate-50 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              {/* Foto da Variante */}
                              <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 relative overflow-hidden shrink-0">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                  />
                                ) : (
                                  <span
                                    className="w-6 h-6 rounded-full border border-black/10"
                                    style={{ backgroundColor: item.colorHex || "#1e293b" }}
                                  />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-semibold text-slate-900 truncate">
                                  {item.name}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                  <span className="truncate">{item.category}</span>
                                  <span>·</span>
                                  <span className="font-medium text-slate-700">Cor: {item.color}</span>
                                </div>

                                {item.priceChangedMessage && (
                                  <span className="text-[10px] text-amber-700 font-medium block mt-1">
                                    {item.priceChangedMessage}
                                  </span>
                                )}

                                {isOut ? (
                                  <span className="text-xs font-bold text-red-600 block mt-1">
                                    Item Esgotado
                                  </span>
                                ) : (
                                  <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-sm font-bold text-slate-950 font-mono">
                                      {itemTotalFormatted}
                                    </span>
                                    {itemQty > 1 && (
                                      <span className="text-[11px] text-slate-500">
                                        ({(item.priceInCents / 100).toLocaleString("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        })}{" "}
                                        cada)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Controles de Quantidade e Ação de Remover */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                              {!isOut && (
                                <div className="flex items-center border border-slate-200 bg-white rounded-xl overflow-hidden shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(item.id, itemQty - 1)}
                                    disabled={itemQty <= 1}
                                    className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors"
                                    aria-label="Diminuir quantidade"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="px-2.5 text-xs font-bold text-slate-900 font-mono">
                                    {itemQty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQty(item.id, itemQty + 1)}
                                    disabled={itemQty >= itemStock}
                                    className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors"
                                    aria-label="Aumentar quantidade"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemove(item.id)}
                                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                aria-label="Remover item"
                                title="Remover item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* VIEW 2: CHECKOUT EM 4 ETAPAS CLARAS */}
              {view === "checkout" && (
                <div className="space-y-5">
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                      <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* ETAPA 1: SEUS DADOS */}
                  {checkoutStep === 1 && (
                    <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                          1. Seus Dados de Identificação
                        </h3>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Compra como visitante (sem senha)
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="text-slate-700 font-medium block mb-1">
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Ex: Carlos Eduardo de Souza"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-700 font-medium block mb-1">
                              E-mail *
                            </label>
                            <input
                              type="email"
                              required
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder="seu@email.com"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-slate-700 font-medium block mb-1">
                              Celular / WhatsApp *
                            </label>
                            <input
                              type="tel"
                              required
                              value={customerPhone}
                              onChange={handlePhoneChange}
                              placeholder="(18) 99999-9999"
                              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-slate-700 font-medium block mb-1">
                            CPF (Obrigatório para emissão de NF e Pix) *
                          </label>
                          <input
                            type="text"
                            required
                            value={customerDocument}
                            onChange={handleCpfChange}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-amber-500 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ETAPA 2: ENTREGA */}
                  {checkoutStep === 2 && (
                    <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs">
                      <div className="border-b border-slate-200 pb-2.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                          2. Modalidade de Entrega
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setDeliveryType("store_pickup")}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            deliveryType === "store_pickup"
                              ? "bg-amber-50 border-2 border-amber-500 text-slate-900 shadow-2xs"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                            <Store size={15} className="text-amber-600" />
                            <span>Retirada na Loja Física</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Rua Princesa Isabel, 221 · Centro, Araçatuba-SP
                          </p>
                          <span className="text-[11px] font-bold text-emerald-700 mt-2 block">
                            GRÁTIS (Pronto em 2h)
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeliveryType("delivery")}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            deliveryType === "delivery"
                              ? "bg-amber-50 border-2 border-amber-500 text-slate-900 shadow-2xs"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                            <Truck size={15} className="text-amber-600" />
                            <span>Envio Nacional Seguro</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Entrega expressa com seguro total
                          </p>
                          <span className="text-[11px] font-bold text-amber-700 mt-2 block">
                            {isFreeShipping ? "GRÁTIS" : shippingFormatted}
                          </span>
                        </button>
                      </div>

                      {deliveryType === "delivery" && (
                        <div className="space-y-3 pt-3 border-t border-slate-200 text-xs">
                          <div>
                            <label className="text-slate-700 font-medium block mb-1">
                              CEP de Entrega *
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={postalCode}
                                onChange={handlePostalCodeChange}
                                placeholder="16010-250"
                                maxLength={9}
                                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono text-xs focus:outline-hidden focus:border-amber-500"
                              />
                              {isLoadingCep && (
                                <span className="text-xs text-slate-400 self-center">Buscando...</span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                              <label className="text-slate-700 font-medium block mb-1">Rua / Logradouro *</label>
                              <input
                                type="text"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                placeholder="Rua Princesa Isabel"
                                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-hidden focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="text-slate-700 font-medium block mb-1">Número *</label>
                              <input
                                type="text"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                placeholder="221"
                                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-hidden focus:border-amber-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-slate-700 font-medium block mb-1">Complemento (opcional)</label>
                              <input
                                type="text"
                                value={complement}
                                onChange={(e) => setComplement(e.target.value)}
                                placeholder="Apto 42 / Bloco B"
                                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-hidden focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="text-slate-700 font-medium block mb-1">Bairro *</label>
                              <input
                                type="text"
                                value={neighborhood}
                                onChange={(e) => setNeighborhood(e.target.value)}
                                placeholder="Centro"
                                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-hidden focus:border-amber-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-slate-700 font-medium block mb-1">Cidade</label>
                              <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-hidden focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="text-slate-700 font-medium block mb-1">Estado (UF)</label>
                              <input
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                maxLength={2}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs uppercase font-mono focus:outline-hidden focus:border-amber-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ETAPA 3: PAGAMENTO MERCADO PAGO */}
                  {checkoutStep === 3 && (
                    <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs">
                      <div className="border-b border-slate-200 pb-2.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                          3. Forma de Pagamento
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("pix")}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            paymentMethod === "pix"
                              ? "bg-emerald-50 border-2 border-emerald-500 text-slate-900 shadow-2xs"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-semibold text-xs text-emerald-700">
                            <QrCode size={16} />
                            <span>Pix Instantâneo</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">
                            Aprovação imediata com QR Code dinâmico do Mercado Pago.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("credit_card")}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            paymentMethod === "credit_card"
                              ? "bg-sky-50 border-2 border-[#009ee3] text-slate-900 shadow-2xs"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2 font-semibold text-xs text-[#009ee3]">
                            <CreditCard size={16} />
                            <span>Cartão de Crédito</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1">
                            Em até 10x sem juros no Mercado Pago com proteção antifraude.
                          </p>
                        </button>
                      </div>

                      {/* Cupom de Desconto */}
                      <div className="pt-3 border-t border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Tag size={13} className="text-amber-600" />
                            Cupom de Desconto
                          </span>
                          {appliedCoupon ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {appliedCoupon.code} aplicado (-{discountFormatted})
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsCouponOpen((p) => !p)}
                              className="text-amber-700 font-semibold text-xs hover:underline"
                            >
                              {isCouponOpen ? "Ocultar" : "Inserir cupom"}
                            </button>
                          )}
                        </div>

                        {isCouponOpen && !appliedCoupon && (
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                              placeholder="CÓDIGO DO CUPOM"
                              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono uppercase focus:outline-hidden focus:border-amber-500"
                            />
                            <button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={isValidatingCoupon || !couponInput.trim()}
                              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl disabled:opacity-40 cursor-pointer"
                            >
                              {isValidatingCoupon ? "..." : "Aplicar"}
                            </button>
                          </div>
                        )}

                        {couponFeedback && (
                          <p className={`text-[11px] font-medium ${couponFeedback.type === "success" ? "text-emerald-700" : "text-red-600"}`}>
                            {couponFeedback.text}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ETAPA 4: REVISÃO DO PEDIDO */}
                  {checkoutStep === 4 && (
                    <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-2xs">
                      <div className="border-b border-slate-200 pb-2.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                          4. Revisão Geral do Pedido
                        </h3>
                      </div>

                      {/* Resumo dos Itens */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase text-slate-500">Itens Selecionados</span>
                        <div className="divide-y divide-slate-200">
                          {items.map((it) => (
                            <div key={it.id} className="py-2 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-semibold text-slate-900">{it.name}</span>
                                <span className="text-slate-500 block text-[11px]">
                                  Cor: {it.color} · Qtd: {it.quantity || 1}
                                </span>
                              </div>
                              <span className="font-bold text-slate-900 font-mono">
                                {(((it.priceInCents || 0) * (it.quantity || 1)) / 100).toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resumo da Entrega e Pagamento */}
                      <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-3 text-xs text-slate-700">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Cliente</span>
                          <span className="font-semibold text-slate-900">{customerName}</span>
                          <span className="block text-[11px] text-slate-500">{customerPhone}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Modalidade</span>
                          <span className="font-semibold text-slate-900">
                            {deliveryType === "store_pickup" ? "Retirada em Loja" : "Envio Nacional"}
                          </span>
                          <span className="block text-[11px] text-slate-500">
                            {paymentMethod === "pix" ? "Pix Instantâneo" : "Cartão de Crédito"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dados Institucionais Visíveis no Rodapé do Checkout */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                    <div className="font-semibold text-slate-700">
                      Ótica Ventara Eyewear · CNPJ 54.892.147/0001-30
                    </div>
                    <div>Rua Princesa Isabel, 221 - Centro, Araçatuba-SP · WhatsApp: {identity.phone_whatsapp}</div>
                  </div>
                </div>
              )}

              {/* VIEW 3: TELA DE PAGAMENTO PIX */}
              {view === "pix" && pixData && (
                <div className="space-y-5 text-center">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-widest block">
                      PEDIDO REGISTRADO: {createdOrder?.reference_code}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      {totalFormatted}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pague via Pix no app do seu banco para confirmação imediata.
                    </p>
                  </div>

                  {/* QR Code Container */}
                  <div className="p-5 rounded-2xl bg-white max-w-[260px] mx-auto shadow-lg border-2 border-slate-200">
                    {pixData.qrCodeBase64 ? (
                      <img
                        src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                        alt="QR Code Pix Mercado Pago"
                        className="w-full h-auto object-contain"
                      />
                    ) : (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                          pixData.qrCode
                        )}`}
                        alt="QR Code Pix"
                        className="w-full h-auto object-contain"
                      />
                    )}
                  </div>

                  {/* Pix Copia e Cola */}
                  <div className="space-y-2 text-left max-w-md mx-auto">
                    <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span>Código Pix (Copia e Cola):</span>
                      <span className="text-[11px] text-amber-700 font-mono">
                        Expira em {timeFormatted}
                      </span>
                    </label>

                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl p-2.5">
                      <input
                        type="text"
                        readOnly
                        value={pixData.qrCode}
                        className="bg-transparent text-xs text-slate-800 font-mono flex-1 outline-hidden truncate"
                      />
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        {copiedPix ? (
                          <>
                            <Check size={14} className="text-emerald-950 stroke-[3]" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-emerald-700 font-medium pt-1">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span>Aguardando confirmação bancária (verificando a cada 3s)...</span>
                  </div>
                </div>
              )}

              {/* VIEW 4: TELA DE SUCESSO / CONFIRMAÇÃO */}
              {view === "success" && (
                <div className="py-12 text-center space-y-5 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 size={44} className="stroke-[2.5]" />
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-700">
                      PAGAMENTO CONFIRMADO PELO MERCADO PAGO
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Parabéns! Pedido Concluído
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Seu pedido foi registrado com sucesso. Nossa equipe técnica já foi notificada e dará início à preparação das suas armações.
                    </p>
                  </div>

                  {createdOrder?.reference_code && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <span className="text-slate-500">Código do Pedido:</span>
                      <p className="text-base font-bold text-amber-700 font-mono">
                        {createdOrder.reference_code}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 flex flex-col gap-3 w-full max-w-sm">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        setView("items");
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Voltar à Loja
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RODAPÉ FINANCEIRO E BOTÕES DE AÇÃO */}
            {view === "items" && items.length > 0 && (
              <div className="p-5 sm:p-6 pt-3 border-t border-slate-200 bg-white shrink-0 space-y-3">
                {subtotalCents > 0 && (
                  <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-baseline justify-between text-xs sm:text-sm">
                      <span className="text-slate-600 font-medium">Subtotal das armações:</span>
                      <span className="text-xl font-bold text-slate-950 font-mono">
                        {subtotalFormatted}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-[11px] text-slate-500">
                      <span>Condição no Cartão:</span>
                      <span>em até 10x de {installmentFormatted} sem juros no Mercado Pago</span>
                    </div>
                  </div>
                )}

                {/* Botão Primário: Finalizar Compra */}
                <button
                  type="button"
                  onClick={() => setView("checkout")}
                  disabled={hasOutOfStockItem}
                  className="w-full min-h-[48px] bg-[#ffd62e] hover:bg-[#ffcd00] disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-[0.98] text-[#06111f] font-extrabold text-xs sm:text-sm tracking-wider uppercase px-6 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
                >
                  <CreditCard size={18} className="text-[#06111f] shrink-0" />
                  <span>FINALIZAR COMPRA</span>
                  <ArrowRight size={16} className="text-[#06111f] shrink-0" />
                </button>

                {/* Botão Secundário: Dúvidas e Atendimento no WhatsApp */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleWhatsAppConsultation}
                  className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase px-6 rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
                >
                  <MessageCircle size={17} className="text-white shrink-0" />
                  <span>FECHAR PEDIDO NO WHATSAPP</span>
                </button>

                {/* Ações Secundárias */}
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Esvaziar carrinho
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Continuar comprando
                  </button>
                </div>
              </div>
            )}

            {/* RODAPÉ DO CHECKOUT */}
            {view === "checkout" && (
              <div className="p-5 sm:p-6 pt-3 border-t border-slate-200 bg-white shrink-0 space-y-3">
                <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-baseline justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="text-slate-900 font-mono font-medium">{subtotalFormatted}</span>
                  </div>
                  {discountCents > 0 && (
                    <div className="flex items-baseline justify-between text-emerald-700 font-semibold">
                      <span>Desconto ({appliedCoupon?.code}):</span>
                      <span className="font-mono">-{discountFormatted}</span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between text-slate-600">
                    <span>Frete:</span>
                    <span className="text-emerald-700 font-mono font-semibold">
                      {shippingFormatted}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-200 text-sm font-bold text-slate-900">
                    <span>Total a Pagar:</span>
                    <span className="text-amber-700 font-mono text-base font-bold">{totalFormatted}</span>
                  </div>
                </div>

                {checkoutStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full min-h-[48px] bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-bold text-xs sm:text-sm tracking-wider uppercase px-6 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 select-none"
                  >
                    <span>AVANÇAR PARA A PRÓXIMA ETAPA</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitCheckout}
                    disabled={isSubmitting}
                    className="w-full min-h-[48px] bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-bold text-xs sm:text-sm tracking-wider uppercase px-6 rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 select-none"
                  >
                    {isSubmitting ? (
                      <span className="font-bold">PROCESSANDO PEDIDO NO MERCADO PAGO...</span>
                    ) : paymentMethod === "pix" ? (
                      <>
                        <QrCode size={18} />
                        <span>PAGAR COM PIX MERCADO PAGO ({totalFormatted})</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        <span>PAGAR COM CARTÃO MERCADO PAGO ({totalFormatted})</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
