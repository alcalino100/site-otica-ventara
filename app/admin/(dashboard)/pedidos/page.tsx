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
  Store,
  Plus,
  X,
  CreditCard,
  User,
  Phone,
  FileText,
  MapPin,
  Trash2,
} from "lucide-react";
import { Order, OrderStatus } from "@/types/ecommerce";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(!isSupabaseConfigured() ? false : true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Estado de Exclusão de Pedido
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteFeedback, setDeleteFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Estado do Modal de Criação Manual de Pedidos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_cpf: "",
    customer_phone: "",
    customer_email: "",
    delivery_type: "pickup", // "pickup" ou "shipping"
    street: "",
    number: "",
    neighborhood: "",
    city: "Araçatuba",
    state: "SP",
    postal_code: "",
    product_name: "Armação Ventara + Lentes OPTiSYNC HD",
    quantity: 1,
    unit_price: "249,90",
    payment_method: "in_store",
    initial_status: "ready_for_pickup",
    notes: "",
  });

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.orders)) {
          setOrders(json.orders as Order[]);
          return;
        }
      }

      // Fallback via client-side Supabase
      if (isSupabaseConfigured()) {
        const { data } = await supabase
          .from("orders")
          .select(`*, items:order_items(*)`)
          .order("created_at", { ascending: false });
        if (data) setOrders(data as Order[]);
      }
    } catch (err) {
      console.warn("Aviso ao buscar pedidos:", err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const isPickupOrder = (order: Order) => {
    const hasPostalTracking = Boolean(order.tracking_number && String(order.tracking_number).trim().length > 3);
    if (hasPostalTracking) return false;
    const addr = order.shipping_address as any;
    return (
      order.status === "ready_for_pickup" ||
      addr?.delivery_type === "pickup" ||
      addr?.store?.toLowerCase()?.includes("loja") ||
      addr?.store?.toLowerCase()?.includes("araçatuba") ||
      order.notes?.toLowerCase()?.includes("[retirada")
    );
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const isPickup = newStatus === "ready_for_pickup";
      const isShipping = newStatus === "shipped";
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
          delivery_type: isPickup ? "pickup" : isShipping ? "shipping" : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "Erro ao atualizar pedido.");
      }

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            let updatedAddress = o.shipping_address;
            if (isPickup) {
              updatedAddress = {
                street: o.shipping_address?.street || "",
                number: o.shipping_address?.number || "",
                neighborhood: o.shipping_address?.neighborhood || "",
                city: o.shipping_address?.city || "Araçatuba",
                state: o.shipping_address?.state || "SP",
                postal_code: o.shipping_address?.postal_code || "",
                complement: o.shipping_address?.complement,
              };
            }
            return {
              ...o,
              status: newStatus as OrderStatus,
              shipping_address: updatedAddress,
            };
          }
          return o;
        })
      );
    } catch (err) {
      console.error("Erro ao atualizar status do pedido:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    setDeleteFeedback(null);
    try {
      const res = await fetch(`/api/admin/orders?id=${encodeURIComponent(orderToDelete.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao excluir pedido.");
      }
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
      setDeleteFeedback({
        type: "success",
        text: `Pedido ${orderToDelete.reference_code} excluído com sucesso!`,
      });
      setOrderToDelete(null);
      setTimeout(() => setDeleteFeedback(null), 4000);
    } catch (err: any) {
      setDeleteFeedback({
        type: "error",
        text: err.message || "Erro de rede ao excluir pedido.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.customer_name.trim() || !formData.customer_phone.trim()) {
      setFormError("Informe o Nome e o Telefone do cliente.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Converte preço formatado para centavos (ex: "249,90" -> 24990)
      const sanitizedPrice = formData.unit_price.replace(/[^\d,.-]/g, "").replace(",", ".");
      const priceNum = parseFloat(sanitizedPrice) || 0;
      const unitPriceInCents = Math.round(priceNum * 100);
      const totalInCents = unitPriceInCents * (Number(formData.quantity) || 1);

      const payload = {
        customer_name: formData.customer_name,
        customer_cpf: formData.customer_cpf,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        delivery_type: formData.delivery_type,
        shipping_address:
          formData.delivery_type === "shipping"
            ? {
                street: formData.street,
                number: formData.number,
                neighborhood: formData.neighborhood,
                city: formData.city,
                state: formData.state,
                postal_code: formData.postal_code,
              }
            : null,
        items: [
          {
            product_name: formData.product_name,
            quantity: Number(formData.quantity) || 1,
            unit_price_in_cents: unitPriceInCents,
          },
        ],
        total_in_cents: totalInCents,
        payment_method: formData.payment_method,
        status: formData.initial_status,
        notes: formData.notes,
      };

      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "Erro ao registrar pedido.");
      }

      if (json.order) {
        setOrders((prev) => [json.order, ...prev]);
      }

      setIsModalOpen(false);
      // Reset form
      setFormData({
        customer_name: "",
        customer_cpf: "",
        customer_phone: "",
        customer_email: "",
        delivery_type: "pickup",
        street: "",
        number: "",
        neighborhood: "",
        city: "Araçatuba",
        state: "SP",
        postal_code: "",
        product_name: "Armação Ventara + Lentes OPTiSYNC HD",
        quantity: 1,
        unit_price: "249,90",
        payment_method: "in_store",
        initial_status: "ready_for_pickup",
        notes: "",
      });
    } catch (err: any) {
      setFormError(err.message || "Erro ao criar pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (order: Order) => {
    const isPickup = isPickupOrder(order);
    if (order.status === "ready_for_pickup" || (isPickup && order.status === "shipped")) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 inline-flex items-center gap-1 shadow-2xs">
          <Store size={11} /> Retirada na Loja
        </span>
      );
    }

    switch (order.status) {
      case "paid":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Pago
          </span>
        );
      case "awaiting_payment":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Aguardando Pagamento
          </span>
        );
      case "preparing":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Em Preparação / Ajuste
          </span>
        );
      case "shipped":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 inline-flex items-center gap-1 shadow-2xs">
            <Truck size={11} /> Enviado / Despachado
          </span>
        );
      case "delivered":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/25 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
            <CheckCircle2 size={11} /> Entregue / Concluído
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
            <XCircle size={11} /> Cancelado
          </span>
        );
      case "refunded":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700/50 text-slate-300">
            Reembolsado
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700/40 text-slate-400">
            Pendente
          </span>
        );
    }
  };

  const getSelectValue = (order: Order) => {
    if (isPickupOrder(order) && (order.status === "shipped" || order.status === "ready_for_pickup")) {
      return "ready_for_pickup";
    }
    return order.status;
  };

  const filteredOrders = orders.filter((o) => {
    const doc = o.customer_document || "";
    const matchesSearch =
      o.reference_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer_phone.includes(searchQuery) ||
      doc.includes(searchQuery);

    const pickup = isPickupOrder(o);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && (o.status === "pending" || o.status === "awaiting_payment")) ||
      (statusFilter === "paid" && o.status === "paid") ||
      (statusFilter === "pickup" && pickup) ||
      (statusFilter === "shipped" && !pickup && (o.status === "shipped" || o.status === "delivered")) ||
      (statusFilter === "delivered" && o.status === "delivered") ||
      (statusFilter === "cancelled" && (o.status === "cancelled" || o.status === "refunded"));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header com Botão + Novo Pedido Manual */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
            TRANSAÇÕES & FULFILLMENT
          </span>
          <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
            Gestão de <span className="font-normal text-amber-400">Pedidos e Vendas</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Separe entregas por Retirada na Loja física ou Despacho Correios, com cadastro manual de clientes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Novo Pedido Manual</span>
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#06111f] p-3 rounded-xl border border-white/10">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por código (VEN-...), nome, CPF ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a1b2e] border border-white/10 rounded-lg px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "Todos" },
            { id: "pending", label: "Pendentes" },
            { id: "paid", label: "Pagos" },
            { id: "pickup", label: "Retirada na Loja" },
            { id: "shipped", label: "Enviados" },
            { id: "delivered", label: "Entregues" },
            { id: "cancelled", label: "Cancelados" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-amber-400 text-[#06111f] font-semibold shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerta de Feedback de Exclusão */}
      {deleteFeedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
            deleteFeedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
              : "bg-rose-950/40 border-rose-500/30 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {deleteFeedback.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
            )}
            <span>{deleteFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setDeleteFeedback(null)}
            className="text-slate-400 hover:text-white p-1 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

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
                : "Quando clientes realizarem compras no site ou você cadastrar pedidos manuais, eles aparecerão aqui."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#040c16] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Código / Ref.</th>
                  <th className="py-3 px-4">Cliente & Documento</th>
                  <th className="py-3 px-4">Modalidade & Itens</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status Atual</th>
                  <th className="py-3 px-4">Alterar Status</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredOrders.map((order) => {
                  const totalFormatted = (order.total_in_cents / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  });
                  const pickup = isPickupOrder(order);

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-mono text-amber-300 font-semibold">
                        {order.reference_code}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{order.customer_name}</p>
                        {order.customer_document && (
                          <p className="text-[11px] text-amber-400/90 font-mono">
                            CPF: {order.customer_document}
                          </p>
                        )}
                        <p className="text-[11px] text-slate-400 font-mono">{order.customer_phone}</p>
                        <p className="text-[10px] text-slate-500">{order.customer_email}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          {pickup ? (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded flex items-center gap-1">
                              <Store size={10} /> Balcão Araçatuba
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded flex items-center gap-1">
                              <Truck size={10} /> Envio Correios
                            </span>
                          )}
                        </div>
                        <span className="font-medium text-white">
                          {order.items?.length || 1} item(ns)
                        </span>
                        {order.items && order.items.length > 0 && (
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                            {order.items.map((i) => `${i.quantity}x ${i.product_name}`).join(", ")}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-amber-400 font-mono">
                        {totalFormatted}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(order)}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          disabled={updatingId === order.id}
                          value={getSelectValue(order)}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="bg-[#0a1b2e] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          <option value="pending">Pendente</option>
                          <option value="awaiting_payment">Aguardando Pagamento</option>
                          <option value="paid">Pago</option>
                          <option value="preparing">Preparando / Ajuste</option>
                          <option value="ready_for_pickup">Retirada na Loja</option>
                          <option value="shipped">Enviado / Despachado</option>
                          <option value="delivered">Entregue / Concluído</option>
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

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(order)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-90 transition-all cursor-pointer inline-flex items-center justify-center"
                          title={`Excluir pedido ${order.reference_code}`}
                          aria-label={`Excluir pedido ${order.reference_code}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL PARA CRIAÇÃO DE NOVO PEDIDO MANUAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0c182b] border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                ADMINISTRAÇÃO · BALCÃO & WHATSAPP
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
                Registrar Novo Pedido
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Cadastre a venda manualmente informando CPF e modalidade de entrega do cliente.
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Nome Completo do Cliente *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Gustavo Pereira"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="w-full bg-[#06111f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <User size={14} className="absolute right-3 top-2.5 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    CPF do Cliente
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.customer_cpf}
                      onChange={(e) => setFormData({ ...formData, customer_cpf: e.target.value })}
                      className="w-full bg-[#06111f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                    <FileText size={14} className="absolute right-3 top-2.5 text-slate-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="(18) 99615-5748"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      className="w-full bg-[#06111f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                    <Phone size={14} className="absolute right-3 top-2.5 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    E-mail (opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="cliente@email.com"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="w-full bg-[#06111f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Modalidade de Entrega: Retirada na Loja vs Envio Correios */}
              <div className="pt-2 border-t border-white/10">
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Modalidade de Entrega
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, delivery_type: "pickup", initial_status: "ready_for_pickup" })}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formData.delivery_type === "pickup"
                        ? "bg-amber-400/15 border-amber-400 text-amber-300 font-bold"
                        : "bg-[#06111f] border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Store size={16} />
                    <span>Retirada na Loja Física</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, delivery_type: "shipping", initial_status: "shipped" })}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formData.delivery_type === "shipping"
                        ? "bg-purple-500/15 border-purple-400 text-purple-300 font-bold"
                        : "bg-[#06111f] border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Truck size={16} />
                    <span>Envio Correios / Despacho</span>
                  </button>
                </div>
              </div>

              {/* Endereço de Envio (se correios) */}
              {formData.delivery_type === "shipping" && (
                <div className="p-3.5 rounded-2xl bg-[#06111f] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                    <MapPin size={14} />
                    <span>Endereço para Despacho</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Rua / Avenida"
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        className="w-full bg-[#0a1b2e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Número"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        className="w-full bg-[#0a1b2e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Bairro"
                        value={formData.neighborhood}
                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                        className="w-full bg-[#0a1b2e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Cidade"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-[#0a1b2e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="CEP (00000-000)"
                        value={formData.postal_code}
                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                        className="w-full bg-[#0a1b2e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Detalhes do Produto e Valor */}
              <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Descrição do Produto / Lente
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ventara Safari Acetato + OPTiSYNC Blue"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full bg-[#06111f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Valor Total (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="249,90"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    className="w-full bg-[#06111f] border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold font-mono"
                  />
                </div>
              </div>

              {/* Status Inicial e Forma de Pagamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full bg-[#06111f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                  >
                    <option value="in_store">Balcão Loja Física (Pix/Cartão/Dinheiro)</option>
                    <option value="pix">Pix Direto</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="whatsapp_assisted">Atendimento WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Status Inicial
                  </label>
                  <select
                    value={formData.initial_status}
                    onChange={(e) => setFormData({ ...formData, initial_status: e.target.value })}
                    className="w-full bg-[#06111f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                  >
                    <option value="ready_for_pickup">Pronto para Retirada na Loja</option>
                    <option value="shipped">Enviado / Despachado</option>
                    <option value="paid">Pago (Aguardando Montagem)</option>
                    <option value="preparing">Em Preparação / Laboratório</option>
                    <option value="delivered">Entregue / Concluído</option>
                  </select>
                </div>
              </div>

              {/* Botões do Rodapé */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Cadastrar Pedido</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE PEDIDO */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0c182b] border border-rose-500/30 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Excluir Pedido Permanentemente
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tem certeza de que deseja excluir o pedido{" "}
                  <strong className="text-amber-400 font-mono">
                    {orderToDelete.reference_code}
                  </strong>{" "}
                  do cliente{" "}
                  <strong className="text-white">
                    {orderToDelete.customer_name}
                  </strong>
                  ? Esta ação removerá o pedido do banco de dados e não poderá ser desfeita.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteOrder}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-950/50 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <span>Excluindo...</span>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Confirmar Exclusão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}