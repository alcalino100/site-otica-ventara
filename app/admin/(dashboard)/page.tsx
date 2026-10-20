"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Eye,
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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
      setIsLoading(true);
      try {
        // 1. Produtos
        const { data: products } = await supabase
          .from("products")
          .select("id, is_published");

        const totalProducts = products ? products.length : 0;
        const publishedProducts = products ? products.filter((p) => p.is_published).length : 0;

        // 2. Pedidos
        const { data: orders } = await supabase
          .from("orders")
          .select("id, status, total_in_cents");

        const pendingOrders = orders
          ? orders.filter((o) => o.status === "pending" || o.status === "awaiting_payment").length
          : 0;

        const paidOrders = orders ? orders.filter((o) => o.status === "paid") : [];
        const confirmedSalesCount = paidOrders.length;
        const confirmedSalesTotalInCents = paidOrders.reduce((acc, curr) => acc + (curr.total_in_cents || 0), 0);

        // 3. Estoque Baixo (quantidades <= 3)
        const { data: variants } = await supabase
          .from("product_variants")
          .select("id, stock_quantity");

        const lowStockCount = variants
          ? variants.filter((v) => v.stock_quantity <= 3).length
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
        console.warn("Aviso ao carregar estatísticas reais do Supabase:", err);
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
      subtext: stats.pendingOrders === 0 ? "Nenhum pedido aguardando ação" : "Requer atenção ou confirmação",
      icon: ShoppingCart,
      href: "/admin/pedidos",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Alertas de Estoque Baixo",
      value: stats.lowStockCount,
      subtext: stats.lowStockCount === 0 ? "Estoque em níveis normais" : "Variantes com 3 ou menos unidades",
      icon: AlertTriangle,
      href: "/admin/estoque",
      color: stats.lowStockCount > 0 ? "text-rose-400" : "text-emerald-400",
      bgColor: stats.lowStockCount > 0 ? "bg-rose-500/10" : "bg-emerald-500/10",
      borderColor: stats.lowStockCount > 0 ? "border-rose-500/20" : "border-emerald-500/20",
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
      title: "Produtos & Catálogo",
      description: "Cadastro de armações, imagens, variantes de cor, medidas e status de publicação.",
      icon: Package,
      href: "/admin/produtos",
      actionText: "Gerenciar Produtos",
    },
    {
      title: "Importador CSV",
      description: "Upload e validação em lote de planilhas de armações com relatório de erros.",
      icon: FileSpreadsheet,
      href: "/admin/produtos/importar",
      actionText: "Importar Planilha",
    },
    {
      title: "Controle de Estoque",
      description: "Histórico de entradas/saídas, auditoria de movimentações e saldo por SKU.",
      icon: Boxes,
      href: "/admin/estoque",
      actionText: "Acessar Estoque",
    },
    {
      title: "Pedidos & Vendas",
      description: "Fluxo completo de pedidos: aguardando pagamento, preparação, envio e retirada.",
      icon: ShoppingCart,
      href: "/admin/pedidos",
      actionText: "Ver Pedidos",
    },
    {
      title: "Identidade Visual",
      description: "Configuração de logo, favicon, cores da marca (#06111F, #0756B8, #FFD62E) e textos.",
      icon: Palette,
      href: "/admin/identidade",
      actionText: "Editar Identidade",
    },
    {
      title: "Banners da Loja",
      description: "Banners institucionais com imagem para desktop e mobile, CTA seguro e ordenação.",
      icon: ImageIcon,
      href: "/admin/banners",
      actionText: "Gerenciar Banners",
    },
    {
      title: "Pagamentos (Gateways)",
      description: "Status de integração Pix e cartão (Asaas / Mercado Pago / Stripe) e webhooks.",
      icon: CreditCard,
      href: "/admin/pagamentos",
      actionText: "Status de Pagamentos",
    },
    {
      title: "Entrega & Retirada",
      description: "Configuração de retirada no Centro de Araçatuba e regras de frete.",
      icon: Truck,
      href: "/admin/entrega",
      actionText: "Configurar Frete",
    },
    {
      title: "Configurações Gerais",
      description: "Horários de funcionamento, WhatsApp de suporte e dados institucionais.",
      icon: Settings,
      href: "/admin/configuracoes",
      actionText: "Configurações",
    },
    {
      title: "Usuários & Permissões",
      description: "Gestão de operadores e níveis de acesso (super_admin, admin, editor).",
      icon: Users,
      href: "/admin/usuarios",
      actionText: "Gerenciar Equipe",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header com Boas-Vindas e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
            PAINEL DE CONTROLE OFICIAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight mt-1">
            Central Administrativa da <span className="font-normal text-amber-400">Ótica Ventara</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Indicadores derivados exclusivamente de dados reais do banco de dados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/produtos/novo"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all"
          >
            <Plus size={16} /> Cadastrar Produto
          </Link>
          <Link
            href="/admin/produtos/importar"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <FileSpreadsheet size={16} className="text-amber-400" /> Importar CSV
          </Link>
        </div>
      </div>

      {/* Grade de Métricas Reais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className={`p-6 rounded-2xl bg-[#071626] border ${card.borderColor} hover:border-amber-400/40 transition-all duration-200 flex flex-col justify-between group`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400">{card.title}</span>
                <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-white tracking-tight">
                  {isLoading ? "..." : card.value}
                </span>
                <p className="text-xs text-slate-400 mt-1">{card.subtext}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Módulos de Operação e Gestão */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white tracking-wide">
            Módulos Operacionais da Loja
          </h2>
          <span className="text-xs text-slate-400">10 áreas modulares</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {operationalModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.title}
                href={mod.href}
                className="group p-6 rounded-2xl bg-[#061423] hover:bg-[#091d33] border border-white/10 hover:border-amber-400/40 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mb-4 group-hover:bg-amber-400 group-hover:text-[#06111f] transition-colors">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors mb-1.5">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-400 transition-colors">
                  <span className="font-medium">{mod.actionText}</span>
                  <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
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
