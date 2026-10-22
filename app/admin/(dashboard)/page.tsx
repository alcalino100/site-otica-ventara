"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Users,
  ArrowRight,
  Plus,
  FileSpreadsheet,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Skeleton } from "@/components/ui/skeleton";
import { WordsStagger } from "@/registry/spell-ui/words-stagger";

interface DashboardStats {
  totalProducts: number;
  publishedProducts: number;
  pendingOrders: number;
  lowStockCount: number;
  confirmedSalesCount: number;
  confirmedSalesTotalInCents: number;
}

function AdminDashboardOverview() {
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    publishedProducts: 0,
    pendingOrders: 0,
    lowStockCount: 0,
    confirmedSalesCount: 0,
    confirmedSalesTotalInCents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      // Se o Supabase não estiver configurado no ambiente, usa dados padrão imediatamente sem esperar timeout
      if (!isSupabaseConfigured()) {
        const publishedCount = DEFAULT_CATALOG.filter((p) => p.is_published).length;
        setStats({
          totalProducts: DEFAULT_CATALOG.length,
          publishedProducts: publishedCount,
          pendingOrders: 0,
          lowStockCount: 0,
          confirmedSalesCount: 0,
          confirmedSalesTotalInCents: 0,
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Timeout de proteção de 2.5s para evitar bloqueio de rede
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Supabase timeout")), 2500)
        );

        const fetchPromise = Promise.all([
          supabase.from("products").select("id, is_published"),
          supabase.from("orders").select("id, status, total_in_cents"),
          supabase.from("product_variants").select("id, stock_quantity"),
        ]);

        const [productsRes, ordersRes, variantsRes] = (await Promise.race([
          fetchPromise,
          timeoutPromise,
        ])) as any;

        const products = productsRes?.data;
        const totalProducts = products ? products.length : DEFAULT_CATALOG.length;
        const publishedProducts = products
          ? products.filter((p: any) => p.is_published).length
          : DEFAULT_CATALOG.filter((p) => p.is_published).length;

        const orders = ordersRes?.data;
        const pendingOrders = orders
          ? orders.filter(
              (o: any) => o.status === "pending" || o.status === "awaiting_payment"
            ).length
          : 0;

        const CONFIRMED_STATUSES = ["paid", "preparing", "shipped", "delivered"];
        const paidOrders = orders
          ? orders.filter((o: any) => CONFIRMED_STATUSES.includes(o.status))
          : [];
        const confirmedSalesCount = paidOrders.length;
        const confirmedSalesTotalInCents = paidOrders.reduce(
          (acc: number, curr: any) => acc + (curr.total_in_cents || 0),
          0
        );

        const variants = variantsRes?.data;
        const lowStockCount = variants
          ? variants.filter((v: any) => v.stock_quantity <= 3).length
          : 0;

        setStats({
          totalProducts,
          publishedProducts,
          pendingOrders,
          lowStockCount,
          confirmedSalesCount,
          confirmedSalesTotalInCents,
        });
      } catch (err) {
        console.warn("Utilizando métricas estruturadas de fallback:", err);
        setStats({
          totalProducts: DEFAULT_CATALOG.length,
          publishedProducts: DEFAULT_CATALOG.length,
          pendingOrders: 0,
          lowStockCount: 0,
          confirmedSalesCount: 0,
          confirmedSalesTotalInCents: 0,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  const metricCards = [
    {
      title: "Produtos Cadastrados",
      value: stats.totalProducts,
      subtext: `${stats.publishedProducts} publicados na loja`,
      icon: Package,
      href: "/admin/produtos",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Pedidos Pendentes",
      value: stats.pendingOrders,
      subtext:
        stats.pendingOrders === 0
          ? "Nenhum pedido aguardando ação"
          : "Requer atenção ou confirmação",
      icon: ShoppingCart,
      href: "/admin/pedidos",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Alertas de Estoque Baixo",
      value: stats.lowStockCount,
      subtext:
        stats.lowStockCount === 0
          ? "Estoque em níveis normais"
          : "Variantes com 3 ou menos unidades",
      icon: AlertTriangle,
      href: "/admin/estoque",
      color: stats.lowStockCount > 0 ? "text-rose-400" : "text-emerald-400",
      bgColor: stats.lowStockCount > 0 ? "bg-rose-500/10" : "bg-emerald-500/10",
      borderColor:
        stats.lowStockCount > 0 ? "border-rose-500/20" : "border-emerald-500/20",
    },
    {
      title: "Vendas Confirmadas",
      value: stats.confirmedSalesCount,
      subtext: (stats.confirmedSalesTotalInCents / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      icon: CheckCircle2,
      href: "/admin/pedidos",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
  ];

  const operationalModules = [
    {
      title: "Métricas & Tráfego UTM",
      description:
        "Rastreamento de cliques em anúncios, visualizações de página de destino e gerador de links para criativos.",
      icon: TrendingUp,
      href: "/admin/metricas",
      actionText: "Ver Métricas & Gerador UTM",
    },
    {
      title: "Produtos & Catálogo",
      description:
        "Cadastro de armações, imagens, variantes de cor, medidas e status de publicação.",
      icon: Package,
      href: "/admin/produtos",
      actionText: "Gerenciar Produtos",
    },
    {
      title: "Importador CSV",
      description:
        "Upload e validação em lote de planilhas de armações com relatório de erros.",
      icon: FileSpreadsheet,
      href: "/admin/produtos/importar",
      actionText: "Importar Planilha",
    },
    {
      title: "Controle de Estoque",
      description:
        "Histórico de entradas/saídas, auditoria de movimentações e saldo por SKU.",
      icon: Boxes,
      href: "/admin/estoque",
      actionText: "Acessar Estoque",
    },
    {
      title: "Pedidos & Vendas",
      description:
        "Fluxo completo de pedidos: aguardando pagamento, preparação, envio e retirada.",
      icon: ShoppingCart,
      href: "/admin/pedidos",
      actionText: "Ver Pedidos",
    },
    {
      title: "Identidade Visual",
      description:
        "Configuração de logo, favicon, cores da marca (#06111F, #0756B8, #FFD62E) e textos.",
      icon: Palette,
      href: "/admin/identidade",
      actionText: "Editar Identidade",
    },
    {
      title: "Banners da Loja",
      description:
        "Banners institucionais com imagem para desktop e mobile, CTA seguro e ordenação.",
      icon: ImageIcon,
      href: "/admin/banners",
      actionText: "Gerenciar Banners",
    },
    {
      title: "Pagamentos (Gateways)",
      description:
        "Status de integração Pix e cartão (Asaas / Mercado Pago / Stripe) e webhooks.",
      icon: CreditCard,
      href: "/admin/pagamentos",
      actionText: "Status de Pagamentos",
    },
    {
      title: "Entrega & Retirada",
      description:
        "Configuração de retirada no Centro de Araçatuba e regras de frete.",
      icon: Truck,
      href: "/admin/entrega",
      actionText: "Configurar Frete",
    },
    {
      title: "Configurações Gerais",
      description:
        "Horários de funcionamento, WhatsApp de suporte e dados institucionais.",
      icon: Settings,
      href: "/admin/configuracoes",
      actionText: "Configurações",
    },
    {
      title: "Usuários & Permissões",
      description:
        "Gestão de operadores e níveis de acesso (super_admin, admin, editor).",
      icon: Users,
      href: "/admin/usuarios",
      actionText: "Gerenciar Equipe",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header com Boas-Vindas e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400 flex items-center gap-1.5 mb-1.5">
            <Sparkles size={13} /> PAINEL DE CONTROLE OFICIAL
          </span>
          <h1 className="text-2xl sm:text-4xl font-light text-white tracking-tight leading-tight">
            Central Administrativa da <span className="font-normal text-amber-400">Ótica Ventara</span>
          </h1>
          <div className="mt-2">
            <WordsStagger
              delay={0.1}
              duration={0.35}
              stagger={0.03}
              className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal"
            >
              Indicadores consolidados em tempo real com governança, rastreabilidade e integridade de dados.
            </WordsStagger>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/produtos/novo"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 !text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-400/10"
            style={{ color: "#06111f" }}
          >
            <Plus size={16} /> <span>Cadastrar Produto</span>
          </Link>
          <Link
            href="/admin/produtos/importar"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95"
          >
            <FileSpreadsheet size={16} className="text-amber-400" /> <span>Importar CSV</span>
          </Link>
        </div>
      </div>

      {/* Grade de Métricas Reais com NumberTicker e Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`p-6 rounded-2xl bg-[#071626]/90 backdrop-blur-sm border ${card.borderColor} hover:border-amber-400/40 hover:bg-[#0a1f33] transition-all duration-200 flex flex-col justify-between group shadow-lg active:scale-95`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {card.title}
                </span>
                <div
                  className={`p-2.5 rounded-xl ${card.bgColor} ${card.color} border border-white/5`}
                >
                  <Icon size={20} />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white tracking-tight">
                  {isLoading ? (
                    <Skeleton className="h-9 w-24 bg-white/10 rounded-lg" />
                  ) : (
                    <NumberTicker value={card.value} duration={1.2} />
                  )}
                </div>
                <div className="mt-1.5">
                  {isLoading ? (
                    <Skeleton className="h-3.5 w-36 bg-white/5 rounded mt-1" />
                  ) : (
                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      {card.subtext}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Módulos de Operação e Gestão */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Módulos Operacionais da Loja
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Acesso rápido a todos os setores de configuração e controle da ótica
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            10 áreas ativas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {operationalModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.title}
                href={mod.href}
                className="group p-6 rounded-2xl bg-[#061423]/90 hover:bg-[#091d33] border border-white/10 hover:border-amber-400/40 transition-all duration-200 flex flex-col justify-between shadow-md active:scale-95"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-4 group-hover:bg-amber-400 group-hover:text-[#06111f] transition-all duration-200 shadow-sm">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors mb-2">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-white/5 flex items-center justify-between text-xs text-slate-300 group-hover:text-amber-400 transition-colors">
                  <span className="font-semibold">{mod.actionText}</span>
                  <ArrowRight
                    size={14}
                    className="transform group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return <AdminDashboardOverview />;
}
