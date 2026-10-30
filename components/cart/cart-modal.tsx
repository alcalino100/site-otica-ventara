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
  Truck,
  Store,
  Tag,
} from "lucide-react";
import { Button } from "../ui/button";
import { CartProduct, buildWhatsAppCartUrl } from "@/lib/cart";
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

export function CartModal({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  initialView = "items",
}: CartModalProps) {
  const [view, setView] = useState<ModalView>(initialView);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sincroniza visualização inicial ao abrir gaveta
  useEffect(() => {
    if (isOpen) {
      if (initialView && cartItems.length > 0) {
        setView(initialView);
      } else if (cartItems.length === 0) {
        setView("items");
      }
    }
  }, [isOpen, initialView, cartItems.length]);

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
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("Araçatuba");
  const [state, setState] = useState("SP");

  // Dados do Pedido Criado
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [pixData, setPixData] = useState<{
    qrCode: string;
    qrCodeBase64: string | null;
    ticketUrl?: string;
    expiresAt: string;
  } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(30 * 60);

  // Regras de Frete e Cupom de Desconto
  const { shipping } = useSiteSettings();
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

  // Timer regressivo para expiração do Pix
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
      } catch (err) {
        // Falha silenciosa no polling
      }
    };

    pollingRef.current = setInterval(checkStatus, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [view, createdOrder, onClearCart]);

  // Formatação de valores e regras dinâmicas
  const subtotalCents = cartItems.reduce(
    (acc, it) => acc + (it.priceInCents || 0),
    0
  );

  const freeThreshold = shipping?.free_shipping_threshold_cents ?? 35000;
  const defaultFee = shipping?.default_shipping_fee_cents ?? 2500;
  const isPickup = deliveryType === "store_pickup";
  const shippingFeeCents = isPickup || subtotalCents >= freeThreshold ? 0 : defaultFee;

  // Cálculo de desconto do cupom
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

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponFeedback(null);
  };

  const handleCopyPix = () => {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleWhatsAppConsultation = () => {
    setIsSubmitting(true);
    const whatsappUrl = buildWhatsAppCartUrl(cartItems);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || customerName.trim().length < 3) {
      setErrorMessage("Por favor, informe seu nome completo.");
      return;
    }

    if (!customerEmail.includes("@")) {
      setErrorMessage("Por favor, informe um e-mail válido.");
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Por favor, informe seu telefone/WhatsApp com DDD.");
      return;
    }

    const cleanCpf = customerDocument.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      setErrorMessage("Por favor, informe um CPF válido (11 dígitos).");
      return;
    }

    if (deliveryType === "delivery" && (!street.trim() || !number.trim())) {
      setErrorMessage("Por favor, preencha o endereço completo de entrega.");
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload = cartItems.map((it) => {
        let prodId = it.id;
        if (prodId.length > 36 && prodId[36] === "-") {
          prodId = prodId.slice(0, 36);
        } else if (!prodId || prodId.length < 10) {
          prodId = it.slug || prodId;
        }
        return {
          product_id: prodId,
          quantity: 1,
        };
      });

      const shippingAddress =
        deliveryType === "delivery"
          ? {
              street: street.trim(),
              number: number.trim(),
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
          customer_phone: cleanPhone,
          customer_document: cleanCpf,
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
          expiresAt: data.payment.expires_at || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        });
        setTimeLeftSeconds(30 * 60);
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

          {/* Cart Drawer lateral amplo */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Sua seleção de armações e pagamento"
            className="relative z-10 w-full sm:max-w-[580px] md:max-w-[640px] h-full bg-[#050e18] text-white border-l border-white/10 shadow-[-30px_0_80px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden"
            initial={{ transform: "translateX(100%)" }}
            animate={{ transform: "translateX(0%)" }}
            exit={{ transform: "translateX(100%)" }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header com Navegação */}
            <div className="p-6 sm:p-7 pb-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {view !== "items" && view !== "success" ? (
                    <button
                      type="button"
                      onClick={() => setView("items")}
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors mr-1 cursor-pointer"
                    >
                      <ArrowLeft size={16} />
                      <span>Voltar</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-400 tracking-[0.2em] uppercase">
                      ÓTICA VENTARA · ATENDIMENTO EXCLUSIVO
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors active:scale-90 cursor-pointer"
                  aria-label="Fechar gaveta"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {view === "items" && "Sua Seleção"}
                  {view === "checkout" && "Finalizar Pedido"}
                  {view === "pix" && "Pagamento via Pix"}
                  {view === "success" && "Pedido Confirmado"}
                </h2>
                {view === "items" && (
                  <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium flex-shrink-0">
                    {cartItems.length}{" "}
                    {cartItems.length === 1 ? "armação selecionada" : "armações selecionadas"}
                  </span>
                )}
                {view === "pix" && (
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-mono font-semibold flex items-center gap-1.5">
                    <Clock size={13} /> {timeFormatted}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-[13px] text-slate-400 mt-1 leading-relaxed">
                {view === "items" &&
                  "Armações salvas para orientação e compras diretas via Mercado Pago."}
                {view === "checkout" &&
                  "Preencha seus dados para entrega e pagamento 100% seguro pelo Mercado Pago."}
                {view === "pix" &&
                  "Escaneie o QR Code ou copie o código Pix abaixo para concluir no app do seu banco."}
                {view === "success" &&
                  "Seu pedido foi registrado com sucesso e nossa equipe já está trabalhando!"}
              </p>
            </div>

            {/* CONTEÚDO PRINCIPAL BASEADO NA TELA ATIVA */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-5">
              {/* VIEW 1: ITENS DA SELEÇÃO */}
              {view === "items" && (
                <>
                  {cartItems.length === 0 ? (
                    <div className="py-24 text-center flex flex-col items-center justify-center">
                      <div className="w-20 h-20 rounded-3xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-5 shadow-inner">
                        <ShoppingBag size={32} />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Sua seleção está vazia
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-7 leading-relaxed">
                        Explore nossa coleção de armações e adicione suas favoritas para comprar ou consultar medidas e lentes personalizadas.
                      </p>
                      <Button
                        variant="dark"
                        onClick={onClose}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wider uppercase px-7 py-3.5 rounded-xl active:scale-95"
                      >
                        EXPLORAR ARMAÇÕES
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3.5">
                        {cartItems.map((item, index) => {
                          const isSolar = item.category?.toLowerCase().includes("solar");
                          const isAmber =
                            item.slug.includes("aurora") ||
                            Boolean(item.color?.toLowerCase().includes("âmbar"));
                          const isRound =
                            item.name.toLowerCase().includes("aurora") ||
                            item.name.toLowerCase().includes("urbano");

                          return (
                            <div
                              key={`${item.id}-${index}`}
                              className="p-4 rounded-2xl bg-[#091a2e]/80 border border-white/5 hover:border-white/15 transition-all flex gap-4 items-center group"
                            >
                              <div className="w-24 sm:w-28 h-18 rounded-xl bg-[#030910] border border-white/10 flex items-center justify-center p-2 relative overflow-hidden flex-shrink-0">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                  />
                                ) : (
                                  <FrameArt
                                    solar={isSolar}
                                    amber={isAmber}
                                    round={isRound}
                                    className="w-full h-full object-contain"
                                  />
                                )}
                              </div>

                              <div className="flex-1 min-w-0 pr-1">
                                <h4 className="text-sm sm:text-base font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                                  {item.name}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                  <span className="truncate">{item.category}</span>
                                  <span>·</span>
                                  <span className="truncate">{item.color}</span>
                                </div>
                                {item.priceInCents ? (
                                  <div className="flex items-baseline gap-2 mt-1.5">
                                    <span className="text-sm font-bold text-amber-400">
                                      {(item.priceInCents / 100).toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      })}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      ou em até 10x de{" "}
                                      {(item.priceInCents / 1000).toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                      })}
                                    </span>
                                  </div>
                                ) : null}
                              </div>

                              <button
                                type="button"
                                onClick={() => onRemoveItem(item.id)}
                                className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all flex-shrink-0 cursor-pointer"
                                aria-label={`Remover ${item.name}`}
                                title="Remover da seleção"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Informações de Compra Segura */}
                      <div className="p-4 rounded-2xl bg-[#071626] border border-[#009ee3]/20 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#009ee3]">
                          <ShieldCheck size={16} />
                          <span>PAGAMENTO PROCESSADO PELO MERCADO PAGO</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Pague com <strong>Pix instantâneo</strong> (aprovação em segundos) ou parcele no <strong>cartão de crédito em até 10x sem juros</strong> com proteção antifraude.
                        </p>
                      </div>

                      {/* Badge da Loja Física */}
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 leading-relaxed">
                        <MapPin size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Retirada Cortesia:</strong> Rua Princesa Isabel, 221 - Centro, Araçatuba-SP. Montagem precisa e ajuste facial gratuito.
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* VIEW 2: CHECKOUT MERCADO PAGO */}
              {view === "checkout" && (
                <form id="checkout-form" onSubmit={handleSubmitCheckout} className="space-y-5">
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5">
                      <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* 1. Dados Pessoais */}
                  <div className="space-y-3 bg-[#06111f] border border-white/10 rounded-2xl p-4 sm:p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      1. Seus Dados de Contato
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="text-slate-300 font-medium block mb-1">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Ex: Gustavo Silva"
                          className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-300 font-medium block mb-1">
                            E-mail *
                          </label>
                          <input
                            type="email"
                            required
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="seu@email.com"
                            className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-slate-300 font-medium block mb-1">
                            WhatsApp / Celular *
                          </label>
                          <input
                            type="tel"
                            required
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="(18) 99999-9999"
                            className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-slate-300 font-medium block mb-1">
                          CPF (Obrigatório para emissão de nota e Pix) *
                        </label>
                        <input
                          type="text"
                          required
                          value={customerDocument}
                          onChange={(e) => setCustomerDocument(e.target.value)}
                          placeholder="000.000.000-00"
                          maxLength={14}
                          className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Modalidade de Entrega */}
                  <div className="space-y-3 bg-[#06111f] border border-white/10 rounded-2xl p-4 sm:p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      2. Opção de Entrega
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setDeliveryType("store_pickup")}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          deliveryType === "store_pickup"
                            ? "bg-amber-400/15 border-amber-400 text-white"
                            : "bg-[#040c16] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold text-xs text-white">
                          <Store size={15} className="text-amber-400" />
                          <span>Retirada na Loja</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Rua Princesa Isabel, 221 · Araçatuba-SP
                        </p>
                        <span className="text-[11px] font-bold text-emerald-400 mt-2 block">
                          GRÁTIS
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType("delivery")}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          deliveryType === "delivery"
                            ? "bg-amber-400/15 border-amber-400 text-white"
                            : "bg-[#040c16] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold text-xs text-white">
                          <Truck size={15} className="text-amber-400" />
                          <span>Envio pelos Correios</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Entrega expressa com seguro total
                        </p>
                        <span className="text-[11px] font-bold text-amber-400 mt-2 block">
                          {subtotalCents >= 35000 ? "GRÁTIS (acima de R$ 350)" : "R$ 25,00"}
                        </span>
                      </button>
                    </div>

                    {deliveryType === "delivery" && (
                      <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-slate-300 font-medium block mb-1">CEP</label>
                            <input
                              type="text"
                              value={postalCode}
                              onChange={(e) => setPostalCode(e.target.value)}
                              placeholder="16010-250"
                              className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-slate-300 font-medium block mb-1">Bairro</label>
                            <input
                              type="text"
                              value={neighborhood}
                              onChange={(e) => setNeighborhood(e.target.value)}
                              placeholder="Centro"
                              className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="text-slate-300 font-medium block mb-1">Rua / Logradouro</label>
                            <input
                              type="text"
                              value={street}
                              onChange={(e) => setStreet(e.target.value)}
                              placeholder="Rua Princesa Isabel"
                              className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-slate-300 font-medium block mb-1">Número</label>
                            <input
                              type="text"
                              value={number}
                              onChange={(e) => setNumber(e.target.value)}
                              placeholder="221"
                              className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bloco de Cupom de Desconto */}
                  <div className="space-y-3 bg-[#06111f] border border-white/10 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Tag size={14} />
                        <span>Cupom de Desconto</span>
                      </span>
                      {appliedCoupon ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          {appliedCoupon.code} aplicado
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsCouponOpen((prev) => !prev)}
                          className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                        >
                          {isCouponOpen ? "Ocultar" : "Adicionar Cupom"}
                        </button>
                      )}
                    </div>

                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                        <div className="text-emerald-300">
                          <strong>{appliedCoupon.code}</strong> · Desconto de{" "}
                          <span className="font-bold">
                            {appliedCoupon.discountType === "percentage"
                              ? `${appliedCoupon.discountValue}% OFF`
                              : `R$ ${appliedCoupon.discountValue.toFixed(2)} OFF`}
                          </span>{" "}
                          ({discountFormatted})
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded bg-white/5 cursor-pointer"
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      isCouponOpen && (
                        <div className="space-y-2 pt-1">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                              placeholder="Digite o cupom (ex: VENTARA10)"
                              className="flex-1 bg-[#040c16] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:border-amber-400"
                            />
                            <button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={isValidatingCoupon || !couponInput.trim()}
                              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0"
                            >
                              {isValidatingCoupon ? "..." : "Aplicar"}
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Ganhou cupom na Roleta ou tem código promocional? Digite aqui para abater no total.
                          </p>
                        </div>
                      )
                    )}

                    {couponFeedback && (
                      <p
                        className={`text-[11px] font-medium ${
                          couponFeedback.type === "success"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {couponFeedback.text}
                      </p>
                    )}
                  </div>

                  {/* 3. Forma de Pagamento */}
                  <div className="space-y-3 bg-[#06111f] border border-white/10 rounded-2xl p-4 sm:p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      3. Pagamento Mercado Pago
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("pix")}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === "pix"
                            ? "bg-emerald-500/15 border-emerald-400 text-white"
                            : "bg-[#040c16] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold text-xs text-emerald-400">
                          <QrCode size={16} />
                          <span>Pix Instantâneo</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">
                          Aprovação em segundos com QR Code dinâmico do Mercado Pago.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("credit_card")}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          paymentMethod === "credit_card"
                            ? "bg-[#009ee3]/20 border-[#009ee3] text-white"
                            : "bg-[#040c16] border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-semibold text-xs text-[#009ee3]">
                          <CreditCard size={16} />
                          <span>Cartão de Crédito</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">
                          Em até 10x sem juros via Mercado Pago com proteção antifraude.
                        </p>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* VIEW 3: TELA DE PAGAMENTO PIX */}
              {view === "pix" && pixData && (
                <div className="space-y-5 text-center">
                  <div className="p-4 rounded-2xl bg-amber-400/[0.06] border border-amber-400/20">
                    <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-widest block">
                      PEDIDO REGISTRADO: {createdOrder?.reference_code}
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {totalFormatted}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Pague via Pix no app do seu banco para confirmação imediata.
                    </p>
                  </div>

                  {/* QR Code Container */}
                  <div className="p-5 rounded-2xl bg-white max-w-[260px] mx-auto shadow-xl border-4 border-slate-900">
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
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Código Pix (Copia e Cola):</span>
                      <span className="text-[11px] text-amber-400 font-mono">
                        Expira em {timeFormatted}
                      </span>
                    </label>

                    <div className="flex items-center gap-2 bg-[#040c16] border border-white/10 rounded-xl p-2.5">
                      <input
                        type="text"
                        readOnly
                        value={pixData.qrCode}
                        className="bg-transparent text-xs text-slate-300 font-mono flex-1 outline-none truncate"
                      />
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
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

                  {/* Indicador de Polling em Tempo Real */}
                  <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-medium pt-1">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span>Aguardando transferência bancária (verificando a cada 3s)...</span>
                  </div>

                  {/* Passos Rápidos */}
                  <div className="p-4 rounded-xl bg-[#06111f] border border-white/10 text-xs text-slate-300 text-left space-y-1.5">
                    <div className="font-semibold text-white">Como pagar:</div>
                    <ol className="list-decimal list-inside space-y-1 text-slate-400">
                      <li>Abra o aplicativo do seu banco preferido.</li>
                      <li>Escolha a opção <strong>Pix com QR Code</strong> ou <strong>Pix Copia e Cola</strong>.</li>
                      <li>Cole o código copiado ou aponte a câmera para o QR Code.</li>
                      <li>Confirme o valor de <strong>{totalFormatted}</strong>.</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* VIEW 4: TELA DE SUCESSO / CONFIRMAÇÃO */}
              {view === "success" && (
                <div className="py-12 text-center space-y-5 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 size={44} className="stroke-[2.5]" />
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400">
                      PAGAMENTO CONFIRMADO PELO MERCADO PAGO
                    </span>
                    <h3 className="text-2xl font-bold text-white">
                      Parabéns! Pedido Concluído
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Seu pedido foi registrado com sucesso. Nossa equipe técnica já foi notificada e dará início à preparação das suas armações.
                    </p>
                  </div>

                  {createdOrder?.reference_code && (
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                      <span className="text-slate-400">Código de Rastreamento:</span>
                      <p className="text-base font-bold text-amber-400 font-mono">
                        {createdOrder.reference_code}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 flex flex-col gap-3 w-full max-w-sm">
                    {createdOrder?.reference_code && (
                      <a
                        href={`/rastreio?ref=${encodeURIComponent(createdOrder.reference_code)}`}
                        className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <span>Acompanhar Pedido em Tempo Real</span>
                        <ArrowRight size={15} />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        setView("items");
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                    >
                      Voltar à Página Inicial
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RODAPÉ FINANCEIRO E BOTÕES DE AÇÃO */}
            {view === "items" && cartItems.length > 0 && (
              <div className="p-6 sm:p-7 pt-4 border-t border-white/10 bg-[#040b14]/95 backdrop-blur-md flex-shrink-0 space-y-3.5">
                {subtotalCents > 0 && (
                  <div className="space-y-1 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <div className="flex items-baseline justify-between text-xs sm:text-sm">
                      <span className="text-slate-400 font-medium">Subtotal das armações:</span>
                      <span className="text-xl sm:text-2xl font-bold text-amber-400">
                        {subtotalFormatted}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between text-[11px] text-slate-400">
                      <span>Condição no Cartão:</span>
                      <span>em até 10x de {installmentFormatted} sem juros no Mercado Pago</span>
                    </div>
                  </div>
                )}

                {/* Botão Primário: Finalizar Compra com Mercado Pago */}
                <button
                  type="button"
                  onClick={() => setView("checkout")}
                  className="w-full h-14 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-bold text-xs sm:text-sm tracking-wider uppercase px-6 rounded-2xl shadow-xl shadow-amber-950/40 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2.5 select-none"
                >
                  <CreditCard size={19} className="text-slate-950 flex-shrink-0" />
                  <span className="whitespace-nowrap font-bold">
                    FINALIZAR COMPRA COM MERCADO PAGO
                  </span>
                  <ArrowRight size={17} className="text-slate-950 flex-shrink-0" />
                </button>

                {/* Botão Secundário: Atendimento Consultivo no WhatsApp */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleWhatsAppConsultation}
                  className="w-full h-12 bg-[#128c7e] hover:bg-[#0d6e63] active:scale-[0.98] text-white font-bold text-xs tracking-wider uppercase px-6 rounded-2xl shadow-lg transition-all duration-150 cursor-pointer flex items-center justify-center gap-2.5 border-none select-none"
                >
                  <MessageCircle size={18} className="text-white flex-shrink-0" />
                  <span className="whitespace-nowrap font-bold">
                    CONSULTAR LENTES NO WHATSAPP
                  </span>
                </button>

                {/* Ações Secundárias */}
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors py-1 cursor-pointer"
                  >
                    Limpar toda a seleção
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs text-slate-400 hover:text-white transition-colors py-1 cursor-pointer"
                  >
                    Continuar navegando
                  </button>
                </div>
              </div>
            )}

            {/* RODAPÉ DO CHECKOUT */}
            {view === "checkout" && (
              <div className="p-6 sm:p-7 pt-4 border-t border-white/10 bg-[#040b14]/95 backdrop-blur-md flex-shrink-0 space-y-3">
                <div className="space-y-1 bg-white/[0.02] p-3 rounded-xl border border-white/5 text-xs">
                  <div className="flex items-baseline justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="text-white font-mono">{subtotalFormatted}</span>
                  </div>
                  {discountCents > 0 && (
                    <div className="flex items-baseline justify-between text-emerald-400 font-semibold">
                      <span>Desconto ({appliedCoupon?.code}):</span>
                      <span className="font-mono">-{discountFormatted}</span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between text-slate-400">
                    <span>Frete:</span>
                    <span className="text-emerald-400 font-mono font-semibold">
                      {shippingFormatted}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1 border-t border-white/10 text-sm font-bold text-white">
                    <span>Total a Pagar:</span>
                    <span className="text-amber-400 font-mono text-base">{totalFormatted}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 font-bold text-xs sm:text-sm tracking-wider uppercase px-6 rounded-2xl shadow-xl shadow-amber-950/40 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 select-none"
                >
                  {isSubmitting ? (
                    <span className="font-bold">PROCESSANDO PEDIDO...</span>
                  ) : paymentMethod === "pix" ? (
                    <>
                      <QrCode size={18} />
                      <span>GERAR PIX NO MERCADO PAGO ({totalFormatted})</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      <span>PAGAR COM CARTÃO NO MERCADO PAGO ({totalFormatted})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
