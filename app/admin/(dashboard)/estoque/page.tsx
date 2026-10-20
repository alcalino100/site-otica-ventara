"use client";

import React, { useState, useEffect } from "react";
import {
  Boxes,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { InventoryMovement } from "@/types/ecommerce";
import { Skeleton } from "@/components/ui/skeleton";

interface VariantStockItem {
  id: string;
  sku: string;
  color_name: string | null;
  stock_quantity: number;
  product_id: string;
  product_name?: string;
}

export default function AdminInventoryPage() {
  const supabase = createClient();
  const getDefaultStockItems = (): VariantStockItem[] =>
    DEFAULT_CATALOG.map((p) => ({
      id: p.id,
      sku: p.variants?.[0]?.sku || `VEN-${p.slug.toUpperCase().slice(0, 8)}`,
      color_name: p.variants?.[0]?.color_name || "Padrão",
      stock_quantity: p.variants?.[0]?.stock_quantity ?? 12,
      product_id: p.id,
      product_name: p.name,
    }));

  const [items, setItems] = useState<VariantStockItem[]>(() =>
    !isSupabaseConfigured() ? getDefaultStockItems() : []
  );
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [isLoading, setIsLoading] = useState(!isSupabaseConfigured() ? false : true);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal / Formulário de Ajuste Rápido
  const [selectedVariant, setSelectedVariant] = useState<VariantStockItem | null>(null);
  const [movementType, setMovementType] = useState<"in" | "out" | "adjustment">("in");
  const [quantityChange, setQuantityChange] = useState<number>(1);
  const [movementReason, setMovementReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadInventory = async () => {
    if (!isSupabaseConfigured()) {
      setItems(getDefaultStockItems());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase timeout")), 2500)
      );

      // 1. Variantes com produtos
      const variantsPromise = supabase
        .from("product_variants")
        .select(`
          id,
          sku,
          color_name,
          stock_quantity,
          product_id,
          product:products(name)
        `)
        .order("stock_quantity", { ascending: true });

      // 2. Histórico de Movimentações
      const movPromise = supabase
        .from("inventory_movements")
        .select(`
          *,
          product:products(name),
          variant:product_variants(sku, color_name)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      const [variantsRes, movRes] = (await Promise.race([
        Promise.all([variantsPromise, movPromise]),
        timeoutPromise,
      ])) as any;

      if (!variantsRes?.error && variantsRes?.data && variantsRes.data.length > 0) {
        const mapped = variantsRes.data.map((v: any) => ({
          id: v.id,
          sku: v.sku,
          color_name: v.color_name,
          stock_quantity: v.stock_quantity,
          product_id: v.product_id,
          product_name: v.product?.name || "Armação",
        }));
        setItems(mapped);
      } else {
        setItems(getDefaultStockItems());
      }

      if (!movRes?.error && movRes?.data) {
        setMovements(movRes.data as InventoryMovement[]);
      }
    } catch (err) {
      console.warn("Utilizando estoque padrão estruturado:", err);
      setItems(getDefaultStockItems());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleRegisterMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant || quantityChange <= 0) return;

    setIsSubmitting(true);
    try {
      const currentBalance = selectedVariant.stock_quantity;
      let newBalance = currentBalance;

      if (movementType === "in") {
        newBalance = currentBalance + quantityChange;
      } else if (movementType === "out") {
        newBalance = Math.max(0, currentBalance - quantityChange);
      } else if (movementType === "adjustment") {
        newBalance = quantityChange;
      }

      // 1. Atualiza variante
      await supabase
        .from("product_variants")
        .update({ stock_quantity: newBalance })
        .eq("id", selectedVariant.id);

      // 2. Grava histórico na tabela inventory_movements
      await supabase.from("inventory_movements").insert({
        product_id: selectedVariant.product_id,
        variant_id: selectedVariant.id,
        movement_type: movementType,
        quantity: quantityChange,
        balance_after: newBalance,
        reason: movementReason.trim() || `Ajuste manual (${movementType})`,
      });

      setFeedback(`Estoque de ${selectedVariant.sku} atualizado para ${newBalance} un.`);
      setSelectedVariant(null);
      setQuantityChange(1);
      setMovementReason("");
      loadInventory();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error(err);
      setFeedback("Erro ao registrar movimentação.");
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.product_name && item.product_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const lowStockCount = items.filter((i) => i.stock_quantity <= 3).length;

  return (
    <div className="space-y-6 w-full">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-20 right-6 z-50 bg-amber-400 text-[#06111f] font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
            AUDITORIA & CONTROLE FÍSICO
          </span>
          <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
            Gestão de <span className="font-normal text-amber-400">Estoque e Variantes</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe quantidades disponíveis por SKU, alertas de estoque baixo e auditoria de movimentações.
          </p>
        </div>

        {lowStockCount > 0 && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <AlertTriangle size={15} />
            <span>{lowStockCount} modelo(s) com estoque baixo (&le; 3 un)</span>
          </div>
        )}
      </div>

      {/* Modal / Card de Movimentação Manual */}
      {selectedVariant && (
        <div className="bg-[#06111f] border border-amber-400/40 rounded-2xl p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Registrar Movimentação: {selectedVariant.product_name} ({selectedVariant.sku})
              </h3>
              <p className="text-xs text-slate-400">
                Saldo atual: <strong className="text-amber-400">{selectedVariant.stock_quantity} un</strong>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedVariant(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleRegisterMovement} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Tipo de Movimento</label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as any)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3 py-2 text-white"
              >
                <option value="in">Entrada (+)</option>
                <option value="out">Saída (-)</option>
                <option value="adjustment">Balanço / Ajuste Absoluto</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">
                {movementType === "adjustment" ? "Novo Saldo Total" : "Quantidade"}
              </label>
              <input
                type="number"
                min={0}
                value={quantityChange}
                onChange={(e) => setQuantityChange(parseInt(e.target.value || "0", 10))}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Motivo / Justificativa</label>
              <input
                type="text"
                placeholder="Ex: Recebimento de fornecedor, devolução..."
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] font-bold uppercase tracking-wider text-xs transition-colors"
              >
                {isSubmitting ? "Gravando..." : "Confirmar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela de Estoque Atual */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Buscar por SKU ou modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a1b2e] border border-white/10 rounded-lg px-3 py-1.5 pl-8 text-xs text-white placeholder-slate-400"
            />
            <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
          </div>

          <span className="text-xs text-slate-400">{filteredItems.length} variantes monitoradas</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0"
              >
                <Skeleton className="h-4 w-40 bg-white/10 rounded" />
                <Skeleton className="h-4 w-28 bg-white/10 rounded" />
                <Skeleton className="h-4 w-24 bg-white/10 rounded" />
                <Skeleton className="h-4 w-16 bg-white/10 rounded" />
                <Skeleton className="h-6 w-20 bg-white/10 rounded-full" />
                <Skeleton className="h-7 w-20 bg-white/10 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">Nenhuma variante cadastrada.</p>
        ) : (
          <div className="overflow-x-auto border border-white/10 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#040c16] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Modelo</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Cor / Acabamento</th>
                  <th className="py-2.5 px-3">Saldo Disponível</th>
                  <th className="py-2.5 px-3">Condição</th>
                  <th className="py-2.5 px-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-medium text-white">{item.product_name}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{item.sku}</td>
                    <td className="py-3 px-3 text-slate-300">{item.color_name || "Padrão"}</td>
                    <td className="py-3 px-3 font-bold text-white">{item.stock_quantity} un</td>
                    <td className="py-3 px-3">
                      {item.stock_quantity <= 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-semibold uppercase">
                          Esgotado
                        </span>
                      ) : item.stock_quantity <= 3 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold uppercase">
                          Estoque Baixo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold uppercase">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVariant(item);
                          setQuantityChange(1);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-medium hover:text-amber-400 transition-colors"
                      >
                        Ajustar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Histórico Recente de Auditoria de Estoque */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Clock size={16} className="text-amber-400" />
          Histórico e Auditoria de Movimentações (Últimas 20)
        </h3>

        {movements.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">Nenhuma movimentação registrada até o momento.</p>
        ) : (
          <div className="overflow-x-auto border border-white/10 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#040c16] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Modelo</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Quantidade</th>
                  <th className="py-2.5 px-3">Saldo Posterior</th>
                  <th className="py-2.5 px-3">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(m.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-white font-medium">
                      {m.product?.name || "Armação"}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="uppercase text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5">
                        {m.movement_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {m.movement_type === "out" ? `-${m.quantity}` : `+${m.quantity}`}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-amber-400">{m.balance_after} un</td>
                    <td className="py-2.5 px-3 text-slate-400">{m.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
