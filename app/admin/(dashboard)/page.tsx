"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  Palette,
  Image as ImageIcon,
  Boxes,
  CreditCard,
  Truck,
  Settings,
  Plus,
  FileSpreadsheet,
  Sparkles,
  TrendingUp,
  Search,
  Tag,
  Download,
  Camera,
  Glasses,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Skeleton } from "@/components/ui/skeleton";

interface CoreStats {
  publishedProducts: number;
  draftProducts: number;
  discountProducts: number;
  totalProducts: number;
  pendingOrders: number;
  confirmedSalesTotalInCents: number;
}

export default function AdminDashboardOverview() {
  const router = useRouter();
  const supabase = createClient();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState<CoreStats>({
    publishedProducts: 0,
    draftProducts: 0,
    discountProducts: 0,
    totalProducts: 0,
    pendingOrders: 0,
    confirmedSalesTotalInCents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");

  // Atalho de teclado '/' ou 'Ctrl+K' / 'Cmd+K' para focar na busca global
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    async function loadStats() {
      if (!isSupabaseConfigured()) {
        const pub = DEFAULT_CATALOG.filter((p) => p.is_published).length;
        const draft = DEFAULT_CATALOG.filter((p) => !p.is_published).length;
        const disc = DEFAULT_CATALOG.filter(
          (p) => (p.compare_at_price_in_cents || 0) > (p.price_in_cents || 0)
        ).length;

        setStats({
          publishedProducts: pub,
          draftProducts: draft,
          discountProducts: disc,
          totalProducts: DEFAULT_CATALOG.length,
          pendingOrders: 0,
          confirmedSalesTotalInCents: 0,
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Supabase timeout")), 2500)
        );

        const fetchPromise = Promise.all([
          supabase.from("products").select("id, is_published, price_in_cents, compare_at_price_in_cents"),
          supabase.from("orders").select("id, status, total_in_cents"),
        ]);

        const [productsRes, ordersRes] = (await Promise.race([
          fetchPromise,
          timeoutPromise,
        ])) as any;

        const products = productsRes?.data || [];
        const publishedProducts = products.filter((p: any) => p.is_published).length;
        const draftProducts = products.filter((p: any) => !p.is_published).length;
        const discountProducts = products.filter(
          (p: any) => (p.compare_at_price_in_cents || 0) > (p.price_in_cents || 0)
        ).length;

        const orders = ordersRes?.data || [];
        const pendingOrders = orders.filter(
          (o: any) => o.status === "pending" || o.status === "awaiting_payment"
        ).length;
        const CONFIRMED_STATUSES = ["paid", "preparing", "shipped", "delivered"];
        const confirmedSalesTotalInCents = orders
          .filter((o: any) => CONFIRMED_STATUSES.includes(o.status))
          .reduce((acc: number, curr: any) => acc + (curr.total_in_cents || 0), 0);

        setStats({
          publishedProducts: products.length > 0 ? publishedProducts : DEFAULT_CATALOG.filter((p) => p.is_published).length,
          draftProducts: products.length > 0 ? draftProducts : DEFAULT_CATALOG.filter((p) => !p.is_published).length,
          discountProducts: products.length > 0 ? discountProducts : DEFAULT_CATALOG.filter((p) => (p.compare_at_price_in_cents || 0) > (p.price_in_cents || 0)).length,
          totalProducts: products.length > 0 ? products.length : DEFAULT_CATALOG.length,
          pendingOrders,
          confirmedSalesTotalInCents,
        });
      } catch (err) {
        console.warn("Utilizando métricas estruturadas de fallback:", err);
        const pub = DEFAULT_CATALOG.filter((p) => p.is_published).length;
        const draft = DEFAULT_CATALOG.filter((p) => !p.is_published).length;
        const disc = DEFAULT_CATALOG.filter(
          (p) => (p.compare_at_price_in_cents || 0) > (p.price_in_cents || 0)
        ).length;
        setStats({
          publishedProducts: pub,
          draftProducts: draft,
          discountProducts: disc,
          totalProducts: DEFAULT_CATALOG.length,
          pendingOrders: 0,
          confirmedSalesTotalInCents: 0,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      router.push(`/admin/produtos?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  // Os 3 números centrais úteis do topo
  const coreMetricCards = [
    {
      title: "Produtos Publicados",
      value: stats.publishedProducts,
      subtext: "Visíveis imediatamente no catálogo e busca",
      icon: CheckCircle2,
      href: "/admin/produtos?status=published",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      badge: "No Ar",
    },
    {
      title: "Rascunhos com Pendência",
      value: stats.draftProducts,
      subtext: "Sem foto principal, preço, SKU ou descrição",
      icon: AlertTriangle,
      href: "/admin/produtos?status=draft",
      color: stats.draftProducts > 0 ? "text-amber-400" : "text-slate-400",
      bgColor: stats.draftProducts > 0 ? "bg-amber-500/10" : "bg-white/5",
      borderColor: stats.draftProducts > 0 ? "border-amber-500/30" : "border-white/10",
      badge: stats.draftProducts > 0 ? "Requer Ação" : "Em Dia",
    },
    {
      title: "Ofertas Ativas",
      value: stats.discountProducts,
      subtext: "Com desconto calculado de 'De / Por'",
      icon: Tag,
      href: "/admin/produtos?hasDiscount=true",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      badge: "Com Desconto",
    },
  ];

  const operationalModules = [
    {
      title: "Produtos & Catálogo",
      description: "Porta única de entrada: cadastro de armações, fotos e variações com reflexo em todo o site.",
      icon: Package,
      href: "/admin/produtos",
      actionText: "Gerenciar Produtos",
      highlight: true,
    },
    {
      title: "Banners & Vitrines",
      description: "Vitrines do site vinculadas aos produtos por referência direta e busca, sem duplicação de dados.",
      icon: ImageIcon,
      href: "/admin/banners",
      actionText: "Vincular Vitrines",
    },
    {
      title: "Lentes & Tratamentos",
      description: "Preços de lentes monofocais, multifocais, filtros blue cut e fotossensíveis.",
      icon: Glasses,
      href: "/admin/lentes",
      actionText: "Configurar Lentes",
    },
    {
      title: "Pedidos & WhatsApp",
      description: "Fluxo de pedidos recebidos pelo checkout da loja e contatos iniciados via WhatsApp.",
      icon: ShoppingCart,
      href: "/admin/pedidos",
      actionText: "Ver Pedidos",
    },
    {
      title: "Controle de Estoque",
      description: "Histórico de entradas e saídas, auditoria de movimentações e saldo por SKU.",
      icon: Boxes,
      href: "/admin/estoque",
      actionText: "Ver Estoque",
    },
    {
      title: "Métricas de Tráfego UTM",
      description: "Rastreamento de cliques em anúncios e campanhas de redes sociais.",
      icon: TrendingUp,
      href: "/admin/metricas",
      actionText: "Ver Métricas",
    },
    {
      title: "Entrega & Retirada",
      description: "Configuração de retirada no Centro de Araçatuba e regras de frete.",
      icon: Truck,
      href: "/admin/entrega",
      actionText: "Configurar Frete",
    },
    {
      title: "Identidade Visual & Cores",
      description: "Configuração de logotipo, favicon, paleta oficial da marca e textos da loja.",
      icon: Palette,
      href: "/admin/identidade",
      actionText: "Editar Identidade",
    },
    {
      title: "Configurações Gerais",
      description: "Horários de atendimento, número oficial de WhatsApp e dados fiscais.",
      icon: Settings,
      href: "/admin/configuracoes",
      actionText: "Configurações",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header Oficial com Boas-Vindas e Ações Rápidas Mobile-First */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400 flex items-center gap-1.5 mb-1">
            <Sparkles size={13} /> PAINEL DE CONTROLE OFICIAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Central Administrativa da <span className="font-normal text-amber-400">Ótica Ventara</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Cadastre os produtos uma única vez para abastecer todo o site: banners, ofertas, armações, busca e WhatsApp.
          </p>
        </div>

        {/* Botões Rápidos Mobile First (Área de toque >= 44px) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/produtos/novo"
            className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#06111f] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/10"
            style={{ color: "#06111f" }}
          >
            <Plus size={16} /> <span>Novo Produto</span>
          </Link>
          <Link
            href="/admin/produtos/fotos-lote"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider transition-all active:scale-95"
            title="Upload em lote com associação automática por SKU"
          >
            <Camera size={15} className="text-amber-400" />
            <span className="hidden sm:inline">Fotos em Lote</span>
            <span className="sm:hidden">Fotos</span>
          </Link>
          <Link
            href="/admin/produtos/importar"
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider transition-all active:scale-95"
          >
            <FileSpreadsheet size={15} className="text-amber-400" />
            <span className="hidden sm:inline">Importar CSV</span>
            <span className="sm:hidden">CSV</span>
          </Link>
        </div>
      </div>

      {/* 2. Barra de Busca Global no Topo (Atalho / ou Ctrl+K) */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-4 text-amber-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar qualquer produto por nome, SKU, cor ou marca... (Pressione '/' ou Ctrl+K)"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full min-h-[48px] bg-[#071626] border border-white/15 focus:border-amber-400 rounded-2xl pl-12 pr-28 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all shadow-lg"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono font-bold text-slate-400 bg-white/5 border border-white/10 rounded-md">
              /
            </kbd>
            <button
              type="submit"
              className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
              style={{ color: "#06111f" }}
            >
              Buscar
            </button>
          </div>
        </div>
      </form>

      {/* 3. OS 3 NÚMEROS ÚTEIS NO TOPO */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Painel Geral do Catálogo
          </h2>
          <span className="text-xs text-slate-400">
            Total de {stats.totalProducts} produtos cadastrados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coreMetricCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className={`p-5 rounded-2xl bg-[#071626] border ${card.borderColor} hover:border-amber-400/50 hover:bg-[#0a1f33] transition-all duration-200 flex flex-col justify-between group shadow-lg active:scale-95`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      {card.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {card.badge}
                    </span>
                  </div>
                  <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                    <Icon size={18} />
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-bold text-white tracking-tight flex items-baseline gap-2">
                    {isLoading ? (
                      <Skeleton className="h-9 w-20 bg-white/10 rounded-lg" />
                    ) : (
                      <NumberTicker value={card.value} duration={1.2} />
                    )}
                    <span className="text-xs font-normal text-slate-400">
                      de {stats.totalProducts}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {card.subtext}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Abrir lista filtrada</span>
                  <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. Banner de Auditoria de Dados e Transparência */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#071626] via-[#091f35] to-[#071626] border border-amber-400/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Auditoria de Integridade do Catálogo</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300">
                Somente Leitura
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
              Relatório diagnóstico completo gerado com SKUs pendentes, anomalias de vitrines e inconsistências de fotos para validação humana.
            </p>
          </div>
        </div>

        <a
          href="/api/admin/auditoria"
          download="auditoria-produtos-ventara.csv"
          className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shrink-0 shadow-md"
          style={{ color: "#06111f" }}
        >
          <Download size={15} />
          <span>Baixar Relatório CSV</span>
        </a>
      </div>

      {/* 5. Módulos Operacionais da Ótica */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Módulos do Sistema
            </h2>
            <p className="text-xs text-slate-400">
              Acesso a todas as seções e ferramentas da loja
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
          >
            <span>Ver site ao vivo</span>
            <ExternalLink size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {operationalModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.title}
                href={module.href}
                className={`p-4 rounded-xl bg-[#06111f] border transition-all flex flex-col justify-between group active:scale-95 ${
                  module.highlight
                    ? "border-amber-400/40 bg-[#071626]"
                    : "border-white/10 hover:border-amber-400/30 hover:bg-[#071626]"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-lg bg-white/5 text-amber-400">
                      <Icon size={16} />
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                      {module.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {module.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-400 transition-colors">
                  <span>{module.actionText}</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
