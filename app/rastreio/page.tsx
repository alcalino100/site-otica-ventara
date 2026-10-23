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
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

export default function RastreioPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#02070d] text-slate-100 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Header Compacto */}
      <header className="sticky top-0 z-50 bg-[#040d1a]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Voltar para a página inicial">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/"
              className="text-slate-300 hover:text-white transition-colors hidden sm:inline-block"
            >
              ← Voltar para a Loja
            </Link>
            <Link
              href="/responsavel-tecnico"
              className="text-slate-300 hover:text-amber-300 transition-colors hidden sm:inline-block"
            >
              Responsável Técnico
            </Link>
            <a
              href="https://wa.me/5518996155748"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all"
            >
              <MessageCircle size={14} className="text-emerald-400" />
              <span>Suporte WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 sm:px-8 py-10 sm:py-16 space-y-10">
        {/* Banner de Apresentação */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Package size={14} className="text-amber-400" />
            <span>Rastreamento em Tempo Real</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-light text-white tracking-tight">
            Acompanhe a Produção e <span className="font-normal text-amber-400">Entrega do seu Pedido</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Consulte a cada etapa o corte na facetadora digital, a conferência do Técnico Óptico e o momento exato em que seus óculos estarão prontos para retirada ou entrega.
          </p>
        </div>

        {/* Barra de Busca de Rastreio */}
        <div className="max-w-xl mx-auto space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#06111f] border border-white/15 shadow-2xl focus-within:border-amber-400/60 transition-colors"
          >
            <div className="pl-3 text-slate-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Digite o código (ex: VEN-10294) ou seu CPF..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none uppercase font-mono"
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
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
            <span>Exemplos em andamento:</span>
            <button
              onClick={() => handleSearch("VEN-10294")}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 border border-white/10 font-mono transition-colors"
            >
              VEN-10294 (Na Facetadora)
            </button>
            <button
              onClick={() => handleSearch("VEN-10380")}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-300 border border-white/10 font-mono transition-colors"
            >
              VEN-10380 (Pronto na Loja)
            </button>
            <button
              onClick={() => handleSearch("VEN-10415")}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 font-mono transition-colors"
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
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#06111f] to-[#040d1a] border border-white/15 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header do Pedido */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider">
                    {order.reference_code}
                  </span>
                  <button
                    onClick={() => handleCopy(order.reference_code)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
                    title="Copiar código do pedido"
                  >
                    {copiedCode ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Cliente: <span className="text-slate-200 font-medium">{order.customer_name}</span> · Data:{" "}
                  {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider self-start sm:self-auto shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>{order.status_label}</span>
              </div>
            </div>

            {/* Mensagem Técnica do Laboratório */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                <Cpu size={18} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white">Status da Produção:</p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {order.status_description}
                </p>
                {order.estimated_delivery && (
                  <p className="text-[11px] font-medium text-amber-300 mt-1 flex items-center gap-1.5">
                    <Clock size={13} />
                    <span>{order.estimated_delivery}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Linha do Tempo Visual (Stepper) */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                Evolução Técnica do Pedido
              </h3>

              <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-5 gap-3 relative">
                {order.timeline.map((step: any, idx: number) => {
                  const isDone = step.status === "completed";
                  const isCurrent = step.status === "current";

                  return (
                    <div
                      key={idx}
                      className="relative flex sm:flex-col items-start gap-3 sm:gap-2 p-3 rounded-2xl transition-all"
                      style={{
                        backgroundColor: isCurrent ? "rgba(251, 191, 36, 0.05)" : "transparent",
                        borderColor: isCurrent ? "rgba(251, 191, 36, 0.2)" : "transparent",
                      }}
                    >
                      {/* Círculo do Indicador */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-all ${
                          isDone
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                            : isCurrent
                            ? "bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)] animate-pulse"
                            : "bg-white/5 border-white/10 text-slate-500"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : (
                          idx + 1
                        )}
                      </div>

                      {/* Texto do Passo */}
                      <div className="space-y-0.5">
                        <p
                          className={`text-xs font-bold ${
                            isDone
                              ? "text-slate-200"
                              : isCurrent
                              ? "text-amber-300 font-extrabold"
                              : "text-slate-500"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {step.description}
                        </p>
                        {step.timestamp && (
                          <p className="text-[10px] text-slate-500 font-mono mt-1">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              {/* Itens do Pedido */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Itens do Pedido
                </p>
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="text-xs">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-slate-400 text-[11px]">{item.variant}</p>
                    {item.lenses && (
                      <p className="text-amber-300/90 text-[11px] font-medium mt-0.5">
                        👓 {item.lenses}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Local de Entrega ou Retirada */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-amber-400" />
                  <span>Entrega / Retirada</span>
                </p>
                <p className="text-xs text-white font-medium">
                  {order.delivery_label}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Óticas Ventara · Rua Princesa Isabel, 221 - Centro, Araçatuba-SP
                </p>
              </div>
            </div>

            {/* Rodapé do Card com Técnico e CTA WhatsApp */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10 bg-[#02070d]/50 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400/30 shrink-0">
                  <img
                    src="/images/team/gustavo-tecnico-optico.jpg"
                    alt="Gustavo Guimarães Cordeiro"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Gustavo Guimarães Cordeiro</span>
                    <ShieldCheck size={14} className="text-amber-400" />
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Técnico Óptico Responsável pela Calibração
                  </p>
                </div>
              </div>

              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-md transition-all active:scale-95"
              >
                <MessageCircle size={15} />
                <span>Dúvidas no WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer Simples */}
      <footer className="py-8 bg-[#010408] border-t border-white/10 text-center text-xs text-slate-500">
        <p>Óticas Ventara Eyewear · Rua Princesa Isabel, 221 - Araçatuba-SP · Fixo: (18) 3304-2808</p>
      </footer>
    </div>
  );
}
