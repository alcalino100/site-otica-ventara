"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Package,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Product } from "@/types/ecommerce";
import { createClient } from "@/lib/supabase/client";

export default function AdminProductsDashboard() {
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
          variants:product_variants(stock_quantity)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Aviso ao consultar Supabase (pode não estar configurado ainda):", error.message);
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
      statusFilter === "all"
        ? true
        : statusFilter === "published"
        ? p.is_published
        : !p.is_published;
    return matchesSearch && matchesStatus;
  });

  const totalPublished = products.filter((p) => p.is_published).length;
  const totalDraft = products.filter((p) => !p.is_published).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Catálogo de Armações e Produtos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie itens, preços, fotos, especificações técnicas de ótica e publicação.
          </p>
        </div>

        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#030c13] font-semibold text-xs tracking-wider uppercase px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-amber-400/10"
        >
          <Plus size={16} /> Cadastrar Nova Armação
        </Link>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#081724] border border-white/5 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total de Modelos</span>
            <Package size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{products.length}</p>
        </div>

        <div className="bg-[#081724] border border-white/5 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Publicados no Site</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{totalPublished}</p>
        </div>

        <div className="bg-[#081724] border border-white/5 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Rascunhos</span>
            <Clock size={18} className="text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-300 mt-2">{totalDraft}</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-[#081724] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome ou slug..."
            className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3.5 py-2 pl-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Filtrar:</span>
          {(["all", "published", "draft"] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setStatusFilter(filterKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === filterKey
                  ? "bg-amber-400 text-[#030c13]"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              {filterKey === "all" ? "Todos" : filterKey === "published" ? "Publicados" : "Rascunhos"}
            </button>
          ))}
        </div>
      </div>

      {/* Product List / Table */}
      <div className="bg-[#081724] border border-white/5 rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="inline-block animate-spin w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full mb-3" />
            <p>Carregando catálogo do Supabase...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto">
              <Sparkles size={28} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Nenhum produto encontrado</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {products.length === 0
                  ? "Seu banco de dados ainda não possui produtos cadastrados. Clique no botão abaixo para adicionar a primeira armação."
                  : "Nenhum produto corresponde aos filtros aplicados."}
              </p>
            </div>
            {products.length === 0 && (
              <Link
                href="/admin/produtos/novo"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#030c13] font-semibold text-xs tracking-wider uppercase px-4 py-2.5 rounded-lg transition-colors"
              >
                <Plus size={15} /> Cadastrar Primeira Armação
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#040e17] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Armação / Produto</th>
                  <th className="py-3 px-4">Tipo & Material</th>
                  <th className="py-3 px-4">Preço (R$)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredProducts.map((p) => {
                  const primaryImage = p.images?.find((img) => img.is_primary)?.url || p.images?.[0]?.url;
                  const priceFormatted = (p.price_in_cents / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  });

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10">
                          {primaryImage ? (
                            <img src={primaryImage} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={16} className="text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{p.name}</p>
                          <p className="text-[11px] text-slate-400">{p.slug}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-200">{p.frame_type}</span>
                        {p.frame_material && (
                          <span className="block text-[11px] text-slate-400">{p.frame_material}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-amber-300">
                        {priceFormatted}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => togglePublish(p.id, p.is_published)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                            p.is_published
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                              : "bg-slate-700/40 text-slate-400 border border-slate-600/30 hover:bg-slate-700/60"
                          }`}
                          title="Clique para alternar status de publicação"
                        >
                          {p.is_published ? (
                            <>
                              <Eye size={12} /> Publicado
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} /> Rascunho
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => deleteProduct(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Excluir produto"
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
    </div>
  );
}
