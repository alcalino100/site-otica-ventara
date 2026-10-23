"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function RastreioPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  // Tema interativo para testar: "navy" (Azul Nobre Ventara), "black" (Preto Puro), "white" (Branco Clean)
  const [colorTheme, setColorTheme] = useState<"navy" | "black" | "white">("navy");

  // Carrega automaticamente o exemplo VEN-10294 por padrão para mostrar o sistema em funcionamento
  useEffect(() => {
    handleSearch("VEN-10294");
  }, []);

  const handleSearch = async (searchCode?: string) => {
    const codeToSearch = (searchCode || query).trim();
    if (!codeToSearch) {
      setError("Por favor, digite o código do pedido ou seu CPF.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/track?code=${encodeURIComponent(codeToSearch)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Pedido não localizado.");
      }

      setOrder(data.order);
      setQuery(data.order.reference_code);
    } catch (err: any) {
      setError(err.message || "Erro ao consultar rastreio.");
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const whatsappOrderUrl = order
    ? `https://wa.me/5518996155748?text=Ol%C3%A1%21%20Gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20meu%20pedido%20${order.reference_code}.`
    : "https://wa.me/5518996155748?text=Ol%C3%A1%21%20Gostaria%20de%20consultar%20o%20rastreio%20do%20meu%20pedido.";

  // Verifica se o pedido está pronto para retirada ou entregue
  const isReady =
    order &&
    (order.status === "ready_for_pickup" ||
      order.status === "delivered" ||
      order.status_label?.toLowerCase().includes("pronto"));

  // Configurações dinâmicas de estilo de acordo com o tema selecionado
  const isWhite = colorTheme === "white";
  const isBlack = colorTheme === "black";

  const rootBgClass = isWhite
    ? "bg-slate-50 text-slate-900"
    : isBlack
    ? "bg-black text-slate-100"
    : "bg-[#020912] bg-[radial-gradient(ellipse_at_50%_0%,#0e3860_0%,#041527_45%,#020912_100%)] text-slate-100";

  const headerBgClass = isWhite
    ? "bg-white/95 border-slate-200 text-slate-900 shadow-sm"
    : isBlack
    ? "bg-black/90 border-white/10 text-white"
    : "bg-[#041527]/90 border-white/10 text-white";

  const cardBgClass = isWhite
    ? "bg-white border-slate-200/90 shadow-xl text-slate-900"
    : isBlack
    ? "bg-[#0a0a0a] border-white/15 shadow-2xl text-white"
    : "bg-gradient-to-br from-[#06182c] to-[#030d1a] border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.65)] text-white";

  const subCardBgClass = isWhite
    ? "bg-slate-100/70 border-slate-200 text-slate-800"
    : "bg-white/[0.03] border-white/10 text-slate-300";

  const searchBoxClass = isWhite
    ? "bg-white border-slate-300 shadow-md focus-within:border-amber-500 text-slate-900"
    : isBlack
    ? "bg-[#111111] border-white/15 shadow-2xl focus-within:border-amber-400/60 text-white"
    : "bg-[#051528] border-white/15 shadow-2xl focus-within:border-amber-400/60 text-white";

  const inputClass = isWhite
    ? "text-slate-900 placeholder:text-slate-400"
    : "text-white placeholder:text-slate-500";

  const footerClass = isWhite
    ? "bg-white border-slate-200 text-slate-500"
    : isBlack
    ? "bg-black border-white/10 text-slate-500"
    : "bg-[#01060c] border-white/10 text-slate-500";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${rootBgClass} selection:bg-amber-400 selection:text-slate-950 font-sans`}>
      {/* Header Compacto */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${headerBgClass}`}>
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Voltar para a página inicial">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/"
              className={`transition-colors hidden sm:inline-block ${
                isWhite ? "text-slate-600 hover:text-slate-950" : "text-slate-300 hover:text-white"
              }`}
            >
              ← Voltar para a Loja
            </Link>
            <Link
              href="/responsavel-tecnico"
              className={`transition-colors hidden sm:inline-block ${
                isWhite ? "text-slate-600 hover:text-amber-600" : "text-slate-300 hover:text-amber-300"
              }`}
            >
              Responsável Técnico
            </Link>
            <a
              href="https://wa.me/5518996155748"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/25 transition-all"
            >
              <MessageCircle size={14} className="text-emerald-500" />
              <span>Suporte WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 sm:px-8 py-8 sm:py-14 space-y-8">
        {/* Banner de Apresentação */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-500 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Package size={14} className="text-amber-500 dark:text-amber-400" />
            <span>Rastreamento em Tempo Real</span>
          </div>
          <h1 className={`text-2xl sm:text-4xl font-light tracking-tight ${isWhite ? "text-slate-950" : "text-white"}`}>
            Acompanhe a Produção e <span className="font-normal text-amber-500 dark:text-amber-400">Entrega do seu Pedido</span>
          </h1>
          <p className={`text-xs sm:text-sm leading-relaxed ${isWhite ? "text-slate-600" : "text-slate-300"}`}>
            Consulte a cada etapa o corte na facetadora digital, a conferência do Técnico Óptico e o momento exato em que seus óculos estarão prontos para retirada ou entrega.
          </p>

          {/* Seletor Interativo de Tema / Cor de Fundo */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className={`text-[11px] font-medium flex items-center gap-1 ${isWhite ? "text-slate-500" : "text-slate-400"}`}>
              <Palette size={13} className="text-amber-400" />
              <span>Cor de fundo:</span>
            </span>
            <div className={`inline-flex items-center p-1 rounded-full border ${isWhite ? "bg-slate-200/80 border-slate-300" : "bg-white/5 border-white/10"}`}>
              <button
                type="button"
                onClick={() => setColorTheme("navy")}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  colorTheme === "navy"
                    ? "bg-[#0756b8] text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Azul Nobre Oficial da Ventara"
              >
                Azul Ventara
              </button>
              <button
                type="button"
                onClick={() => setColorTheme("black")}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  colorTheme === "black"
                    ? "bg-slate-800 text-white shadow-xs"
                    : isWhite ? "text-slate-600 hover:text-slate-950" : "text-slate-400 hover:text-white"
                }`}
                title="Preto Puro Luxo"
              >
                Preto Luxo
              </button>
              <button
                type="button"
                onClick={() => setColorTheme("white")}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  colorTheme === "white"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Branco Clean"
              >
                Branco Clean
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Busca de Rastreio */}
        <div className="max-w-xl mx-auto space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className={`flex items-center gap-2 p-1.5 rounded-2xl border transition-colors ${searchBoxClass}`}
          >
            <div className={`pl-3 ${isWhite ? "text-slate-400" : "text-slate-500"}`}>
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Digite o código (ex: VEN-10294) ou seu CPF..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm focus:outline-none uppercase font-mono ${inputClass}`}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <>
                  <span>Rastrear</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Atalhos de Exemplo Rápido */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className={isWhite ? "text-slate-500" : "text-slate-400"}>Exemplos em andamento:</span>
            <button
              onClick={() => handleSearch("VEN-10294")}
              className={`px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                isWhite
                  ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border-amber-400/30"
              }`}
            >
              VEN-10294 (Na Facetadora · Amarelo)
            </button>
            <button
              onClick={() => handleSearch("VEN-10380")}
              className={`px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                isWhite
                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              }`}
            >
              VEN-10380 (Pronto na Loja · Verde)
            </button>
            <button
              onClick={() => handleSearch("VEN-10415")}
              className={`px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                isWhite
                  ? "bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300"
                  : "bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-300 border-cyan-400/30"
              }`}
            >
              VEN-10415 (Multifocal)
            </button>
          </div>
        </div>

        {/* Feedback de Erro */}
        {error && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-red-950/80 border border-red-500/30 text-red-200 text-xs flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Pedido não encontrado</p>
              <p className="mt-0.5 text-slate-300">{error}</p>
            </div>
          </div>
        )}

        {/* Cartão de Status do Pedido Localizado */}
        {order && (
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-8 animate-in fade-in zoom-in-95 duration-200 transition-colors ${cardBgClass}`}>
            {/* Header do Pedido */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${isWhite ? "border-slate-200" : "border-white/10"}`}>
              <div>
                <div className="flex items-center gap-3">
                  <span className={`text-xl sm:text-2xl font-mono font-bold tracking-wider ${isWhite ? "text-slate-950" : "text-white"}`}>
                    {order.reference_code}
                  </span>
                  <button
                    onClick={() => handleCopy(order.reference_code)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isWhite
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300"
                        : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10"
                    }`}
                    title="Copiar código do pedido"
                  >
                    {copiedCode ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <p className={`text-xs mt-1 ${isWhite ? "text-slate-500" : "text-slate-400"}`}>
                  Cliente: <span className={`font-medium ${isWhite ? "text-slate-800" : "text-slate-200"}`}>{order.customer_name}</span> · Data:{" "}
                  {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>

              {/* Status Badge Dinâmico: Verde quando PRONTO, Amarelo/Âmbar quando em PRODUÇÃO */}
              {isReady ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider self-start sm:self-auto shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                  <span>{order.status_label}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-600 dark:text-amber-300 text-xs font-bold uppercase tracking-wider self-start sm:self-auto shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  <span>{order.status_label}</span>
                </div>
              )}
            </div>

            {/* Mensagem Técnica do Laboratório com Destaque Verde para Pronto / Amarelo para Produção */}
            {isReady ? (
              <div className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 shadow-sm ${
                isWhite
                  ? "bg-emerald-50/80 border-emerald-300 text-slate-900"
                  : "bg-emerald-950/40 border-emerald-500/35 text-white"
              }`}>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Status da Produção:
                    </p>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/40">
                      Pronto para Retirada na Loja
                    </span>
                  </div>
                  <p className={`text-xs sm:text-sm font-medium leading-relaxed ${isWhite ? "text-slate-800" : "text-emerald-100"}`}>
                    {order.status_description}
                  </p>
                  {order.estimated_delivery && (
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-300 mt-1 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-emerald-500" />
                      <span>{order.estimated_delivery}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 shadow-sm ${
                isWhite
                  ? "bg-amber-50/80 border-amber-300 text-slate-900"
                  : "bg-amber-400/[0.05] border-amber-400/25 text-white"
              }`}>
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Cpu size={20} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Status da Produção:
                  </p>
                  <p className={`text-xs sm:text-sm leading-relaxed ${isWhite ? "text-slate-800" : "text-slate-200"}`}>
                    {order.status_description}
                  </p>
                  {order.estimated_delivery && (
                    <p className="text-[11px] font-medium text-amber-600 dark:text-amber-300 mt-1 flex items-center gap-1.5">
                      <Clock size={13} />
                      <span>{order.estimated_delivery}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Linha do Tempo Visual (Stepper) */}
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-widest mb-6 ${isWhite ? "text-slate-500" : "text-slate-400"}`}>
                Evolução Técnica do Pedido
              </h3>

              <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-5 gap-3 relative">
                {order.timeline.map((step: any, idx: number) => {
                  const isDone = step.status === "completed";
                  const isCurrent = step.status === "current";
                  const stepIsReady = isCurrent && isReady;

                  return (
                    <div
                      key={idx}
                      className={`relative flex sm:flex-col items-start gap-3 sm:gap-2 p-3 rounded-2xl transition-all ${
                        stepIsReady
                          ? "bg-emerald-500/10 border border-emerald-500/30"
                          : isCurrent
                          ? "bg-amber-400/10 border border-amber-400/30"
                          : "border border-transparent"
                      }`}
                    >
                      {/* Círculo do Indicador */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-all ${
                          isDone
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-600 dark:text-emerald-300"
                            : stepIsReady
                            ? "bg-emerald-500/25 border-emerald-400 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"
                            : isCurrent
                            ? "bg-amber-400/20 border-amber-400 text-amber-600 dark:text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-pulse"
                            : isWhite
                            ? "bg-slate-200 border-slate-300 text-slate-500"
                            : "bg-white/5 border-white/10 text-slate-500"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          idx + 1
                        )}
                      </div>

                      {/* Texto do Passo */}
                      <div className="space-y-0.5">
                        <p
                          className={`text-xs font-bold ${
                            isDone
                              ? isWhite ? "text-slate-800" : "text-slate-200"
                              : stepIsReady
                              ? "text-emerald-600 dark:text-emerald-300 font-extrabold"
                              : isCurrent
                              ? "text-amber-600 dark:text-amber-300 font-extrabold"
                              : isWhite ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className={`text-[11px] leading-snug ${isWhite ? "text-slate-600" : "text-slate-400"}`}>
                          {step.description}
                        </p>
                        {step.timestamp && (
                          <p className={`text-[10px] font-mono mt-1 ${isWhite ? "text-slate-400" : "text-slate-500"}`}>
                            {step.timestamp}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Informações dos Itens e Retirada */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t ${isWhite ? "border-slate-200" : "border-white/10"}`}>
              {/* Itens do Pedido */}
              <div className={`p-4 rounded-2xl border space-y-2 ${subCardBgClass}`}>
                <p className={`text-[11px] font-bold uppercase tracking-wider ${isWhite ? "text-slate-500" : "text-slate-400"}`}>
                  Itens do Pedido
                </p>
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="text-xs">
                    <p className={`font-semibold ${isWhite ? "text-slate-900" : "text-white"}`}>{item.name}</p>
                    <p className={`text-[11px] ${isWhite ? "text-slate-600" : "text-slate-400"}`}>{item.variant}</p>
                    {item.lenses && (
                      <p className="text-amber-600 dark:text-amber-300/90 text-[11px] font-medium mt-0.5">
                        👓 {item.lenses}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Local de Entrega ou Retirada */}
              <div className={`p-4 rounded-2xl border space-y-2 ${subCardBgClass}`}>
                <p className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isWhite ? "text-slate-500" : "text-slate-400"}`}>
                  <MapPin size={13} className="text-amber-500 dark:text-amber-400" />
                  <span>Entrega / Retirada</span>
                </p>
                <p className={`text-xs font-medium ${isWhite ? "text-slate-900" : "text-white"}`}>
                  {order.delivery_label}
                </p>
                <p className={`text-[11px] leading-relaxed ${isWhite ? "text-slate-600" : "text-slate-400"}`}>
                  Óticas Ventara · Rua Princesa Isabel, 221 - Centro, Araçatuba-SP
                </p>
              </div>
            </div>

            {/* Rodapé do Card com Técnico Responsável e CTA WhatsApp */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t p-4 rounded-2xl ${
              isWhite ? "border-slate-200 bg-slate-100/60" : "border-white/10 bg-[#02070d]/60"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-amber-400/40 shrink-0">
                  <img
                    src="/images/team/gustavo-tecnico-optico.jpg"
                    alt="Gustavo Guimarães Cordeiro"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <p className={`text-xs font-bold flex items-center gap-1.5 ${isWhite ? "text-slate-900" : "text-white"}`}>
                    <span>Gustavo Guimarães Cordeiro</span>
                    <ShieldCheck size={14} className="text-amber-500 dark:text-amber-400" />
                  </p>
                  <p className={`text-[11px] ${isWhite ? "text-slate-600" : "text-slate-400"}`}>
                    Técnico Óptico Responsável pela Calibração
                  </p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400/90 font-mono mt-0.5">
                    Registro Nacional de Responsável Técnico
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/responsavel-tecnico"
                  className={`inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all ${
                    isWhite
                      ? "bg-white hover:bg-slate-200 border-slate-300 text-slate-800"
                      : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200"
                  }`}
                >
                  <span>Conhecer Perfil Técnico</span>
                  <ArrowRight size={13} />
                </Link>

                <a
                  href={whatsappOrderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-md transition-all active:scale-95"
                >
                  <MessageCircle size={14} />
                  <span>Dúvidas no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Simples */}
      <footer className={`py-8 border-t text-center text-xs transition-colors ${footerClass}`}>
        <p>Óticas Ventara Eyewear · Rua Princesa Isabel, 221 - Araçatuba-SP · Fixo: (18) 3304-2808</p>
      </footer>
    </div>
  );
}
