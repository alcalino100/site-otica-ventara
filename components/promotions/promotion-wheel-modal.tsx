"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Sparkles,
  Check,
  Copy,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Gift,
  Phone,
  User,
  MessageCircle,
} from "lucide-react";
import {
  PromotionCampaignConfig,
  DEFAULT_PROMOTION_CONFIG,
  WheelLeadFormData,
  wheelLeadFormSchema,
  formatBrazilianPhone,
  WheelParticipateResponse,
} from "@/types/promotion-wheel";
import { PromotionWheelCanvas } from "./promotion-wheel-canvas";
import { BrandLogo } from "@/components/ui/brand-logo";

interface PromotionWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: PromotionCampaignConfig;
  onCompleted?: () => void;
  onOpenPrivacyModal?: () => void;
}

type ModalState = "form" | "submitting" | "spinning" | "result" | "error";

export function PromotionWheelModal({
  isOpen,
  onClose,
  config = DEFAULT_PROMOTION_CONFIG,
  onCompleted,
  onOpenPrivacyModal,
}: PromotionWheelModalProps) {
  const [modalState, setModalState] = useState<ModalState>("form");
  const [serverError, setServerError] = useState<string | null>(null);
  const [targetSegmentIndex, setTargetSegmentIndex] = useState<number | null>(null);
  const [resultData, setResultData] = useState<WheelParticipateResponse | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [idempotencyKey] = useState(() => `idem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  const modalRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const { appearance, segments, form: formConfig, coupon_rules } = config;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<WheelLeadFormData>({
    resolver: zodResolver(wheelLeadFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      marketingOptIn: false,
      hp_field: "",
    },
  });

  const phoneValue = watch("phone");

  // Formatação em tempo real da máscara de telefone brasileira
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBrazilianPhone(e.target.value);
    setValue("phone", formatted, { shouldValidate: true });
  };

  // Gerenciamento de acessibilidade: Foco preso (Focus Trap), restauração e fechamento por Escape
  useEffect(() => {
    if (isOpen) {
      startTimeRef.current = Date.now();
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && modalState !== "spinning" && modalState !== "submitting") {
          onClose();
        }

        // Foco preso no modal com Tab
        if (e.key === "Tab" && modalRef.current) {
          const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";

      // Foca no primeiro campo do formulário
      setTimeout(() => {
        const input = modalRef.current?.querySelector<HTMLInputElement>("input");
        input?.focus();
      }, 100);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        previouslyFocusedElementRef.current?.focus();
      };
    }
  }, [isOpen, modalState, onClose]);

  // Submissão do formulário e chamada da API
  const onSubmit = async (data: WheelLeadFormData) => {
    if (modalState === "submitting" || modalState === "spinning") return;

    setModalState("submitting");
    setServerError(null);

    const clientElapsedMs = Date.now() - startTimeRef.current;

    try {
      const res = await fetch("/api/promotions/wheel/participate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          marketingOptIn: !!data.marketingOptIn,
          campaignId: config.id,
          campaignVersion: config.version,
          idempotencyKey,
          clientElapsedMs,
          hp_field: data.hp_field || "",
        }),
      });

      const responseJson: WheelParticipateResponse = await res.json();

      if (!res.ok) {
        throw new Error((responseJson as any).error || "Não foi possível revelar seu benefício.");
      }

      setResultData(responseJson);
      setTargetSegmentIndex(responseJson.winning_segment_index);

      // Verifica se o usuário prefere movimento reduzido (prefers-reduced-motion)
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        // Exibe o resultado imediatamente sem rotação longa
        setModalState("result");
        onCompleted?.();
      } else {
        // Inicia a rotação física suave da roleta
        setModalState("spinning");
      }
    } catch (err: any) {
      setServerError(err.message || "Erro de conexão ao processar. Tente novamente.");
      setModalState("error");
    }
  };

  // Finalização da animação da roleta
  const handleSpinEnd = () => {
    setModalState("result");
    onCompleted?.();
  };

  // Cópia do cupom com feedback
  const handleCopyCoupon = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wheel-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-[960px] my-auto rounded-3xl overflow-hidden border shadow-2xl flex flex-col lg:flex-row transition-all duration-300"
        style={{
          backgroundColor: appearance.bg_color,
          borderColor: appearance.border_color,
          color: appearance.text_color,
        }}
      >
        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={onClose}
          disabled={modalState === "spinning" || modalState === "submitting"}
          className="absolute top-4 right-4 z-40 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
          aria-label="Fechar janela promocional"
        >
          <X size={18} />
        </button>

        {/* COLUNA ESQUERDA: ROLETA VISUAL (COMPACTA NO MOBILE, DESTAQUE NO DESKTOP) */}
        <div
          className="lg:w-1/2 p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10"
          style={{ backgroundColor: appearance.surface_color }}
        >
          {/* Luz de fundo suave e nobre */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] bg-amber-400/10 blur-[90px] rounded-full pointer-events-none" />

          {/* Badge Informativo da Campanha (Transparência Garantida - sem sorteio falso) */}
          <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-sm z-10 text-center">
            <Sparkles size={12} className="text-amber-400 shrink-0" />
            <span>{config.fixed_benefit.badge_text}</span>
          </div>

          {/* Componente Canvas da Roleta com Tamanho Otimizado para Mobile */}
          <div className="relative z-10 my-1">
            <PromotionWheelCanvas
              segments={segments}
              isSpinning={modalState === "spinning"}
              targetSegmentIndex={targetSegmentIndex}
              pointerColor={appearance.pointer_color}
              borderColor={appearance.border_color}
              onSpinEnd={handleSpinEnd}
              size={240}
            />
          </div>

          <p className="text-[10px] sm:text-[11px] text-slate-400 text-center mt-2 max-w-xs z-10">
            {modalState === "spinning"
              ? "Girando e revelando seu benefício exclusivo..."
              : "Gire para revelar seu código de desconto em armações e lentes."}
          </p>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO OU RESULTADO COM ACESSIBILIDADE ARIA-LIVE */}
        <div className="lg:w-1/2 p-4 sm:p-8 flex flex-col justify-between" aria-live="polite">
          {/* TELA DE RESULTADO REVELADO */}
          {modalState === "result" && resultData ? (
            <div className="space-y-6 my-auto animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <Gift size={14} className="text-emerald-400" />
                  <span>Benefício Confirmado</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                  Parabéns! Seu benefício é{" "}
                  <strong className="text-amber-400 font-bold">{resultData.benefit.label}</strong>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {resultData.benefit.description}
                </p>
              </div>

              {/* Box de Exibição do Cupom Exclusivo */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-amber-400/40 space-y-3 shadow-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Seu Código de Cupom Exclusivo:
                </span>
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#06121C] border border-white/15">
                  <span className="font-mono text-lg sm:text-xl font-bold tracking-wider text-amber-300 select-all">
                    {resultData.coupon.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCoupon(resultData.coupon.code)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
                  >
                    {copiedCoupon ? (
                      <>
                        <Check size={14} className="text-slate-950" />
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
                <div className="text-[11px] text-slate-400 space-y-1">
                  <p>
                    • <strong>Validade:</strong> 7 dias corridos (até{" "}
                    {new Date(resultData.coupon.expires_at).toLocaleDateString("pt-BR")}).
                  </p>
                  <p>• {resultData.coupon.regulations}</p>
                </div>
              </div>

              {/* Botões de Ação Final */}
              <div className="space-y-2 pt-2">
                <a
                  href="#armacoes"
                  onClick={onClose}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>{appearance.result_cta_text}</span>
                  <ArrowRight size={14} />
                </a>

                <a
                  href={`https://wa.me/${formConfig.whatsapp_number}?text=${encodeURIComponent(
                    formConfig.whatsapp_default_message.replace("{COUPON}", resultData.coupon.code)
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <MessageCircle size={15} className="text-emerald-400" />
                  <span>Chamar no WhatsApp e Garantir Armação</span>
                </a>
              </div>
            </div>
          ) : (
            /* FORMULÁRIO DE CAPTURA DO VISITANTE */
            <div className="space-y-5 my-auto">
              <div>
                <BrandLogo size="sm" />
                <h2 id="wheel-modal-title" className="text-2xl sm:text-3xl font-light text-white tracking-tight mt-3">
                  {appearance.title_text}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  {appearance.description_text}
                </p>
              </div>

              {/* Alerta de Erro Recuperável */}
              {serverError && (
                <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/30 text-xs text-red-200 flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Atenção</p>
                    <p className="mt-0.5 text-slate-300">{serverError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Campo Nome */}
                <div className="space-y-1">
                  <label htmlFor="lead-name" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <User size={13} className="text-amber-400" />
                    <span>{formConfig.name_label}</span>
                    <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="lead-name"
                    type="text"
                    placeholder={formConfig.name_placeholder}
                    {...register("name")}
                    disabled={modalState === "submitting" || modalState === "spinning"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 focus:border-amber-400 text-white placeholder:text-slate-500 text-xs sm:text-sm outline-none transition-colors"
                  />
                  {errors.name && (
                    <p className="text-[11px] text-amber-400 mt-0.5 font-medium">{errors.name.message}</p>
                  )}
                </div>

                {/* Campo Telefone / WhatsApp */}
                <div className="space-y-1">
                  <label htmlFor="lead-phone" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Phone size={13} className="text-amber-400" />
                    <span>{formConfig.phone_label}</span>
                    <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="lead-phone"
                    type="tel"
                    placeholder={formConfig.phone_placeholder}
                    value={phoneValue || ""}
                    onChange={handlePhoneChange}
                    disabled={modalState === "submitting" || modalState === "spinning"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 focus:border-amber-400 text-white placeholder:text-slate-500 text-xs sm:text-sm outline-none transition-colors font-mono"
                  />
                  {errors.phone ? (
                    <p className="text-[11px] text-amber-400 mt-0.5 font-medium">{errors.phone.message}</p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{formConfig.phone_help}</p>
                  )}
                </div>

                {/* Honeypot Invisível para Bots */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ display: "none" }}
                  {...register("hp_field")}
                />

                {/* Checkbox Opcional de Marketing (Desmarcado por Padrão) */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      {...register("marketingOptIn")}
                      disabled={modalState === "submitting" || modalState === "spinning"}
                      className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400/40 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-tight">
                      {formConfig.marketing_opt_in_label}
                    </span>
                  </label>
                </div>

                {/* Botão de Envio / Girar Roleta */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isValid || modalState === "submitting" || modalState === "spinning"}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-98"
                    style={{
                      backgroundColor: appearance.button_bg,
                      color: appearance.button_text,
                    }}
                  >
                    {modalState === "submitting" ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Confirmando seu benefício...</span>
                      </>
                    ) : modalState === "spinning" ? (
                      <>
                        <Sparkles size={15} className="animate-pulse" />
                        <span>Revelando...</span>
                      </>
                    ) : (
                      <>
                        <span>{appearance.cta_button_text}</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>

                {/* Rodapé e Privacidade */}
                <div className="text-[10px] text-slate-400 text-center space-y-1 pt-1">
                  <p>{appearance.footer_note}</p>
                  <p>
                    Ao participar, você concorda com nossos{" "}
                    <button
                      type="button"
                      onClick={() => onOpenPrivacyModal?.()}
                      className="text-amber-300 hover:underline inline font-medium"
                    >
                      Termos de Privacidade
                    </button>
                    .
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
