"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Order } from "@/types/ecommerce";
import { createClient } from "@/lib/supabase/client";

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      }
    } catch (err) {
      console.warn("Erro ao buscar pedidos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Pago</span>;
      case "awaiting_payment":
        return <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30">Aguardando Pagamento</span>;
      case "preparing":
        return <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30">Montagem de Lentes</span>;
      case "shipped":
        return <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/30">Enviado / Retirada</span>;
      case "delivered":
        return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-600/20 text-emerald-300">Entregue</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700/50 text-slate-400">Pendente</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShoppingCart size={22} className="text-amber-400" /> Pedidos e Atendimentos
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Acompanhe solicitações de armações, pagamentos e pedidos assistidos.
        </p>
      </div>

      <div className="bg-[#081724] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Carregando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingCart size={22} />
            </div>
            <h3 className="text-sm font-semibold text-white">Nenhum pedido registrado no momento</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Assim que os clientes concluírem a seleção no carrinho ou pelo checkout, os registros aparecerão organizados aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#040e17] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Referência</th>
                  <th className="py-3 px-4">Cliente & Contato</th>
                  <th className="py-3 px-4">Itens</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {orders.map((order) => {
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
                        <p className="text-[11px] text-slate-400">{order.customer_phone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        {order.items?.length || 1} item(ns)
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {totalFormatted}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(order.created_at).toLocaleDateString("pt-BR")}
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
