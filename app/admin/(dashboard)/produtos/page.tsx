"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Package,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { Product } from "@/types/ecommerce";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(name, slug),
          images:product_images(url, is_primary, alt_text),
          variants:product_variants(stock_quantity, sku, color_name)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Aviso ao consultar Supabase:", error.message);
        setProducts([]);
      } else if (data) {
        setProducts(data as Product[]);
      }
    } catch (err) {
      console.warn("Erro ao buscar produtos:", err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const togglePublish = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_published: !currentStatus })
        .eq("id", productId);

      if (!error) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, is_published: !currentStatus } : p
          )
        );
        showFeedback(!currentStatus ? "Produto publicado com sucesso!" : "Produto despublicado.");
      }
    } catch (err) {
      console.error(err);
      showFeedback("Não foi possível atualizar o status.");
    }
  };

  const deleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o produto "${productName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (!error) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        showFeedback(`"${productName}" removido.`);
      }
    } catch (err) {
      console.error(err);
      showFeedback("Erro ao remover produto.");
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && p.is_published) ||
      (statusFilter === "draft" && !p.is_published);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="fixed top-20 right-6 z-50 bg-amber-400 text-[#06111f] font-bold text-xs px-4 py-2.5 rounded-xl shadow-xl animate-fade-in flex items-center gap-2 border border-amber-300">
          <CheckCircle2 size={16} />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
            CATÁLOGO & ARMAÇÕES
          </span>
          <h1 className="text-xl sm:text-3xl font-light text-white tracking-tight mt-0.5">
            Gestão de <span className="font-normal text-amber-400">Produtos</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Cadastre, edite fotos, configure variantes e controle a publicação no site.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/produtos/importar"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider transition-all active:scale-95"
          >
            <FileSpreadsheet size={15} className="text-amber-400" />
            <span>Importar CSV</span>
          </Link>

          <Link
            href="/admin/produtos/novo"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 !text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md shadow-amber-400/10"
            style={{ color: "#06111f" }}
          >
            <Plus size={16} />
            <span>Novo Produto</span>
          </Link>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#06111f] p-3.5 rounded-2xl border border-white/10">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por nome ou slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a1b2e] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
          />
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              statusFilter === "all"
                ? "bg-amber-400 !text-[#06111f] shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              statusFilter === "published"
                ? "bg-amber-400 !text-[#06111f] shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Publicados
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              statusFilter === "draft"
                ? "bg-amber-400 !text-[#06111f] shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Rascunhos
          </button>
        </div>
      </div>

      {/* Tabela de Produtos com Skeleton Screens */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl bg-white/10" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-44 bg-white/10 rounded" />
                    <Skeleton className="h-3 w-28 bg-white/5 rounded" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 bg-white/10 rounded-full" />
                <Skeleton className="h-4 w-16 bg-white/10 rounded" />
                <Skeleton className="h-4 w-12 bg-white/10 rounded" />
                <Skeleton className="h-6 w-24 bg-white/10 rounded-full" />
                <Skeleton className="h-6 w-16 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Package size={36} className="mx-auto text-slate-500 stroke-[1.5]" />
            <p className="text-sm font-medium text-white">Nenhum produto encontrado</p>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              {searchQuery
                ? `Nenhum resultado corresponde à busca "${searchQuery}".`
                : "Ainda não há produtos cadastrados no banco de dados."}
            </p>
            <div className="pt-2">
              <Link
                href="/admin/produtos/novo"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 text-[#06111f] text-xs font-bold uppercase tracking-wider active:scale-95 transition-all"
                style={{ color: "#06111f" }}
              >
                <Plus size={15} /> Cadastrar Primeira Peça
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#040c16] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Produto</th>
                  <th className="py-3.5 px-4">Linha / Categoria</th>
                  <th className="py-3.5 px-4">Preço</th>
                  <th className="py-3.5 px-4">Estoque</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p) => {
                  const primaryImg =
                    p.images?.find((img) => img.is_primary)?.url || p.images?.[0]?.url;
                  const totalStock =
                    p.variants?.reduce((acc, v) => acc + (v.stock_quantity || 0), 0) ?? 0;
                  const priceFormatted = (p.price_in_cents / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  });

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0a1e33] border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {primaryImg ? (
                            <img
                              src={primaryImg}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={18} className="text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{p.name}</p>
                          <span className="text-[11px] text-slate-400 font-mono">
                            /produto/{p.slug}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-200 text-[11px]">
                          {p.category?.name || p.frame_type || "Geral"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-amber-400 font-mono">
                        {priceFormatted}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            totalStock <= 3 ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {totalStock} un
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => togglePublish(p.id, p.is_published)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all active:scale-95 ${
                            p.is_published
                              ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                              : "bg-slate-700/40 text-slate-300 border border-slate-600/30"
                          }`}
                        >
                          {p.is_published ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <Eye size={12} /> Publicado
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} /> Rascunho
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/produto/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
                            title="Ver no site"
                          >
                            <Eye size={15} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => deleteProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all"
                            title="Remover produto"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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
