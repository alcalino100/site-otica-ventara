"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Truck,
  RotateCcw,
  XCircle,
  Package,
} from "lucide-react";
import { Order, OrderStatus } from "@/types/ecommerce";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(*)
        `)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data as Order[]);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn("Erro ao buscar pedidos:", err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (!error) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error("Erro ao atualizar status do pedido:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "paid":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Pago</span>;
      case "awaiting_payment":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">Aguardando Pagamento</span>;
      case "preparing":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">Em Preparação / Ajuste</span>;
      case "shipped":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">Enviado / Disponível Retirada</span>;
      case "delivered":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600/25 text-emerald-300 border border-emerald-500/40">Entregue / Concluído</span>;
      case "cancelled":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">Cancelado</span>;
      case "refunded":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700/50 text-slate-300">Reembolsado</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700/40 text-slate-400">Pendente</span>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.reference_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_phone.includes(searchQuery);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && (o.status === "pending" || o.status === "awaiting_payment")) ||
      (statusFilter === "paid" && o.status === "paid") ||
      (statusFilter === "shipped" && (o.status === "shipped" || o.status === "delivered")) ||
      (statusFilter === "cancelled" && (o.status === "cancelled" || o.status === "refunded"));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
            TRANSAÇÕES & FULFILLMENT
          </span>
          <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
            Gestão de <span className="font-normal text-amber-400">Pedidos e Vendas</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe status de pagamentos, montagem de lentes e etapas de entrega ou retirada.
          </p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#06111f] p-3 rounded-xl border border-white/10">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por código (VEN-...), nome, e-mail ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a1b2e] border border-white/10 rounded-lg px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto overflow-x-auto">
          {[
            { id: "all", label: "Todos" },
            { id: "pending", label: "Pendentes" },
            { id: "paid", label: "Pagos" },
            { id: "shipped", label: "Enviados/Retirada" },
            { id: "cancelled", label: "Cancelados" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? "bg-amber-400 text-[#06111f] font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0"
              >
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 bg-white/10 rounded" />
                  <Skeleton className="h-3 w-20 bg-white/5 rounded" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 bg-white/10 rounded" />
                  <Skeleton className="h-3 w-48 bg-white/5 rounded" />
                </div>
                <Skeleton className="h-4 w-24 bg-white/10 rounded" />
                <Skeleton className="h-4 w-20 bg-white/10 rounded" />
                <Skeleton className="h-6 w-24 bg-white/10 rounded-full" />
                <Skeleton className="h-8 w-28 bg-white/10 rounded-xl" />
                <Skeleton className="h-3 w-20 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#091a2e] flex items-center justify-center mx-auto text-slate-400">
              <ShoppingCart size={22} />
            </div>
            <h3 className="text-sm font-semibold text-white">Nenhum pedido localizado</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `Nenhum resultado corresponde à busca "${searchQuery}".`
                : "Quando clientes realizarem compras no site, os dados reais serão listados aqui sem simulações falsas."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#040c16] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Código / Referência</th>
                  <th className="py-3 px-4">Cliente & Contato</th>
                  <th className="py-3 px-4">Itens Selecionados</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status Atual</th>
                  <th className="py-3 px-4">Alterar Status</th>
                  <th className="py-3 px-4">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredOrders.map((order) => {
                  const totalFormatted = (order.total_in_cents / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  });

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-mono text-amber-300 font-semibold">
                        {order.reference_code}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{order.customer_name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{order.customer_phone}</p>
                        <p className="text-[10px] text-slate-500">{order.customer_email}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-white">
                          {order.items?.length || 1} item(ns)
                        </span>
                        {order.items && order.items.length > 0 && (
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                            {order.items.map((i) => `${i.quantity}x ${i.product_name}`).join(", ")}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-amber-400">
                        {totalFormatted}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          disabled={updatingId === order.id}
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                          className="bg-[#0a1b2e] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          <option value="pending">Pendente</option>
                          <option value="awaiting_payment">Aguardando Pagamento</option>
                          <option value="paid">Pago</option>
                          <option value="preparing">Preparando / Ajuste</option>
                          <option value="shipped">Enviado / Retirada</option>
                          <option value="delivered">Entregue</option>
                          <option value="cancelled">Cancelado</option>
                          <option value="refunded">Reembolsado</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(order.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
