"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  Check,
  Copy,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Gift,
  Phone,
  User,
  MessageCircle,
  MapPin,
  Store,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  PromotionCampaignConfig,
  DEFAULT_PROMOTION_CONFIG,
  WheelLeadFormData,
  wheelLeadFormSchema,
  formatBrazilianPhone,
  WheelParticipateResponse,
} from "@/types/promotion-wheel";
import { PromotionWheelCanvas } from "@/components/promotions/promotion-wheel-canvas";
import { BrandLogo } from "@/components/ui/brand-logo";

type PageState = "form" | "submitting" | "spinning" | "result" | "error";

export function RoletaClient() {
  const [config, setConfig] = useState<PromotionCampaignConfig>(DEFAULT_PROMOTION_CONFIG);
  const [pageState, setPageState] = useState<PageState>("form");
  const [serverError, setServerError] = useState<string | null>(null);
  const [targetSegmentIndex, setTargetSegmentIndex] = useState<number | null>(null);
  const [resultData, setResultData] = useState<WheelParticipateResponse | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [showRegulations, setShowRegulations] = useState(false);
  const [wheelSize, setWheelSize] = useState(290);
  const [idempotencyKey] = useState(() => `roleta-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

  // Calibra diâmetro da roleta para caber integrado no celular
  useEffect(() => {
    const updateSize = () => {
      if (typeof window !== "undefined") {
        setWheelSize(window.innerWidth < 640 ? 200 : 290);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

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
      marketingOptIn: true,
      hp_field: "",
    },
  });

  const phoneValue = watch("phone");

  // Busca configuração atualizada da campanha na API (ou usa o padrão)
  useEffect(() => {
    fetch("/api/promotions/wheel/config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.config) {
          setConfig(data.config);
        }
      })
      .catch(() => {
        // Fallback seguro silencioso
      });
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBrazilianPhone(e.target.value);
    setValue("phone", formatted, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  const onSubmit = async (data: WheelLeadFormData) => {
    if (pageState === "submitting" || pageState === "spinning") return;

    setPageState("submitting");
    setServerError(null);

    try {
      const response = await fetch("/api/promotions/wheel/participate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          phone: data.phone,
          marketingOptIn: data.marketingOptIn,
          hp_field: data.hp_field || "",
          campaign_id: config.id,
          idempotency_key: idempotencyKey,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error || "Ocorreu um erro ao processar sua solicitação.");
      }

      setResultData(json);
      setTargetSegmentIndex(json.winning_segment_index ?? 0);
      setPageState("spinning");
    } catch (err: any) {
      setServerError(err.message || "Erro de conexão. Tente novamente.");
      setPageState("error");
    }
  };

  const handleSpinEnd = () => {
    setPageState("result");
  };

  const handleCopyCoupon = () => {
    if (!resultData?.coupon?.code) return;
    navigator.clipboard.writeText(resultData.coupon.code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 3000);
  };

  const whatsappMessage = resultData?.coupon?.code
    ? encodeURIComponent(
        `Olá Óticas Ventara! Acabei de girar a roleta no site e garanti meu cupom exclusivo *${resultData.coupon.code}* de 10% OFF. Gostaria de escolher minha armação!`
      )
    : encodeURIComponent("Olá Óticas Ventara! Gostaria de saber mais sobre as promoções ativas.");

  const whatsappUrl = `https://wa.me/5518996155748?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-[#06121C] text-[#F5F5F2] flex flex-col selection:bg-[#E8C765] selection:text-[#06121C]">
      {/* Header Fixo com Identidade Ventara */}
      <header className="sticky top-0 z-40 bg-[#06121C]/90 backdrop-blur-md border-b border-[#E8C765]/15 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90 transition-opacity">
          <BrandLogo size="sm" />
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#E8C765] hover:text-[#f3d98b] bg-[#10283B]/60 hover:bg-[#10283B] border border-[#E8C765]/25 px-3 py-1.5 rounded-full transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Ir para a Loja Virtual</span>
        </Link>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
        {/* Banner de Topo / Contexto QR Code Balcão */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8C765]/10 border border-[#E8C765]/30 text-[#E8C765] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Benefício Oficial · Loja Física & Online</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-display">
            Roleta de Benefícios Exclusivos
          </h1>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            Identifique seu WhatsApp, gire a roleta oficial da Óticas Ventara e receba seu cupom de desconto imediato
            para armações e lentes.
          </p>
        </div>

        {/* Card Central com a Roleta e Interação */}
        <div className="bg-[#10283B]/70 border border-[#E8C765]/25 rounded-2xl p-5 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Efeito Glow Dourado de Fundo */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#E8C765]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#E8C765]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center relative z-10">
            {/* Coluna da Roleta */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <div className="p-2 sm:p-4 rounded-full bg-[#06121C]/80 border border-[#E8C765]/20 shadow-inner">
                <PromotionWheelCanvas
                  segments={config.segments}
                  isSpinning={pageState === "spinning"}
                  targetSegmentIndex={targetSegmentIndex}
                  onSpinEnd={handleSpinEnd}
                  size={wheelSize}
                />
              </div>

              <p className="mt-2 text-xs text-gray-400 text-center flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#E8C765]" />
                <span>Válido no balcão da loja em Araçatuba e no WhatsApp</span>
              </p>
            </div>

            {/* Coluna de Ação (Formulário ou Resultado do Cupom) */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              {pageState === "result" && resultData ? (
                /* Estado Vencedor / Cupom Liberado */
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="p-4 rounded-xl bg-[#E8C765]/10 border border-[#E8C765]/35 text-center">
                    <span className="text-xs uppercase tracking-wider font-bold text-[#E8C765]">
                      🎉 Cupom Liberado com Sucesso!
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                      {resultData.benefit?.label || "10% OFF GARANTIDO"}
                    </h2>
                    <p className="text-xs text-gray-300 mt-1">
                      Válido por 7 dias para armações e lentes selecionadas.
                    </p>
                  </div>

                  {/* Cartão do Código Copiável */}
                  <div className="bg-[#06121C] border border-[#E8C765]/30 rounded-xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-gray-400 block">
                        Seu Código Exclusivo
                      </span>
                      <span className="text-xl sm:text-2xl font-mono font-black text-[#E8C765] tracking-wider">
                        {resultData.coupon?.code}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCoupon}
                      className="px-3.5 py-2.5 rounded-lg bg-[#E8C765] hover:bg-[#d4b455] text-[#06121C] text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                    >
                      {copiedCoupon ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-950" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Ações Primárias */}
                  <div className="space-y-2.5 pt-2">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.01]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Ativar Desconto com Atendente no WhatsApp</span>
                    </a>

                    <Link
                      href="/"
                      className="w-full py-3 px-4 rounded-xl bg-[#06121C] hover:bg-[#0A1E2C] border border-[#E8C765]/40 text-[#E8C765] font-bold text-sm flex items-center justify-center gap-2 transition-all hover:border-[#E8C765]"
                    >
                      <span>Ver Armações no Catálogo Virtual</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Aviso do Balcão */}
                  <div className="pt-2 border-t border-white/10 flex items-start gap-2 text-xs text-gray-400">
                    <MapPin className="w-4 h-4 text-[#E8C765] shrink-0 mt-0.5" />
                    <span>
                      <strong>Está no balcão da loja?</strong> Basta informar seu código ao atendente no caixa para
                      aplicar o desconto imediatamente na sua compra.
                    </span>
                  </div>
                </div>
              ) : (
                /* Formulário de Identificação e Giro (Compacto e Preciso no Mobile) */
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5 sm:space-y-4">
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-white mb-0.5">
                      {config.appearance?.title_text || "Seu próximo olhar merece um benefício"}
                    </h3>
                    <p className="text-[11px] sm:text-sm text-gray-300">
                      Preencha seu WhatsApp para vincular seu cupom e gire a roleta.
                    </p>
                  </div>

                  {/* Campo Honeypot anti-bot */}
                  <input type="text" {...register("hp_field")} className="hidden" tabIndex={-1} autoComplete="off" />

                  {/* Campo Nome */}
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-gray-300 mb-0.5 sm:mb-1">
                      {config.form?.name_label || "Seu nome completo"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <input
                        type="text"
                        {...register("name")}
                        disabled={pageState === "submitting" || pageState === "spinning"}
                        placeholder={config.form?.name_placeholder || "Ex: Mariana Silva"}
                        className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2.5 bg-[#06121C] border border-gray-700 focus:border-[#E8C765] rounded-lg sm:rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                      />
                    </div>
                    {errors.name && <p className="text-[10px] sm:text-xs text-rose-400 mt-0.5">{errors.name.message}</p>}
                  </div>

                  {/* Campo Telefone */}
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-gray-300 mb-0.5 sm:mb-1">
                      {config.form?.phone_label || "WhatsApp para identificação"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <input
                        type="tel"
                        {...register("phone")}
                        value={phoneValue || ""}
                        onChange={handlePhoneChange}
                        disabled={pageState === "submitting" || pageState === "spinning"}
                        placeholder={config.form?.phone_placeholder || "(18) 99999-9999"}
                        className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2.5 bg-[#06121C] border border-gray-700 focus:border-[#E8C765] rounded-lg sm:rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors font-mono"
                      />
                    </div>
                    {errors.phone && <p className="text-[10px] sm:text-xs text-rose-400 mt-0.5">{errors.phone.message}</p>}
                  </div>

                  {/* Mensagem de Erro do Servidor */}
                  {serverError && (
                    <div className="p-2 sm:p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  {/* Botão de Girar Roleta */}
                  <button
                    type="submit"
                    disabled={!isValid || pageState === "submitting" || pageState === "spinning"}
                    className="w-full py-2.5 sm:py-3.5 px-4 rounded-xl bg-[#E8C765] hover:bg-[#d4b455] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-[#06121C] font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-[#E8C765]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {pageState === "submitting" ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Validando identificação...</span>
                      </>
                    ) : pageState === "spinning" ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin text-[#06121C]" />
                        <span>Girando a Roleta...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Girar Roleta e Revelar Benefício</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] sm:text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Benefício real garantido. Uso intransferível por WhatsApp.</span>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Informações da Loja Física em Araçatuba */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#10283B]/40 border border-white/5 rounded-xl p-4 flex items-start gap-3">
            <Store className="w-5 h-5 text-[#E8C765] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">Loja Física Óticas Ventara</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Rua Princesa Isabel, 221 - Centro, Araçatuba - SP
              </p>
              <p className="text-xs text-[#E8C765] mt-1 font-semibold">
                Laboratório digital próprio com montagem expressa em até 1 hora.
              </p>
            </div>
          </div>

          <div className="bg-[#10283B]/40 border border-white/5 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">Transparência & Procedência</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Armações em acetato italiano e titânio nobre com garantia nacional e homologação óptica.
              </p>
              <button
                type="button"
                onClick={() => setShowRegulations(!showRegulations)}
                className="text-xs text-[#E8C765] mt-1 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>{showRegulations ? "Ocultar regulamento" : "Ver regulamento da promoção"}</span>
                {showRegulations ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Regulamento Expansível */}
        {showRegulations && (
          <div className="mt-4 p-4 rounded-xl bg-[#06121C] border border-white/10 text-xs text-gray-300 leading-relaxed animate-in fade-in duration-300">
            <h5 className="font-bold text-white mb-1.5">Regulamento Oficial da Campanha</h5>
            <p className="mb-2">
              {config.coupon_rules?.regulations_full ||
                "Válido por 7 dias a partir da data de emissão para compras na loja física da Óticas Ventara em Araçatuba-SP ou pedidos via WhatsApp. Benefício de 10% não cumulativo com outras promoções ativas."}
            </p>
            <p className="text-gray-400">
              Limite de 1 (uma) participação e cupom por número de WhatsApp identificado. Cupom pessoal e intransferível.
            </p>
          </div>
        )}
      </main>

      {/* Footer Minimalista */}
      <footer className="mt-auto py-5 border-t border-white/5 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Óticas Ventara Eyewear · Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
