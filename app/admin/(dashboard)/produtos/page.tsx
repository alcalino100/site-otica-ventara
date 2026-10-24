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
  Star,
  Sparkles,
  Pencil,
} from "lucide-react";
import { Product } from "@/types/ecommerce";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>(() =>
    !isSupabaseConfigured() ? DEFAULT_CATALOG : []
  );
  const [isLoading, setIsLoading] = useState(!isSupabaseConfigured() ? false : true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!isSupabaseConfigured()) {
      setProducts(DEFAULT_CATALOG);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Supabase timeout")), 2500)
      );

      const fetchPromise = supabase
        .from("products")
        .select(`
          *,
          category:categories(name, slug),
          images:product_images(url, is_primary, alt_text),
          variants:product_variants(stock_quantity, sku, color_name)
        `)
        .order("created_at", { ascending: false });

      const { data, error } = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as any;

      if (error) {
        console.warn("Aviso ao consultar Supabase, utilizando catálogo estruturado:", error.message);
        setProducts(DEFAULT_CATALOG);
      } else if (data && data.length > 0) {
        setProducts(data as Product[]);
      } else {
        setProducts(DEFAULT_CATALOG);
      }
    } catch (err) {
      console.warn("Utilizando catálogo padrão estruturado:", err);
      setProducts(DEFAULT_CATALOG);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const togglePublish = async (productId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, is_published: !currentStatus }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "Não foi possível atualizar o status.");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, is_published: !currentStatus } : p
        )
      );
      showFeedback(!currentStatus ? "Produto publicado com sucesso!" : "Produto despublicado.");
    } catch (err: any) {
      console.error("Erro ao alternar status do produto:", err);
      showFeedback(err.message || "Não foi possível atualizar o status.");
    }
  };

  const toggleFeatured = async (productId: string, currentFeatured: boolean) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, is_featured: !currentFeatured }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "Não foi possível atualizar o destaque.");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, is_featured: !currentFeatured } : p
        )
      );
      showFeedback(
        !currentFeatured
          ? "Armação adicionada ao Carrossel do Topo (Hero)!"
          : "Armação removida do carrossel do topo."
      );
    } catch (err: any) {
      console.error("Erro ao alternar destaque do produto:", err);
      showFeedback(err.message || "Não foi possível atualizar o destaque.");
    }
  };

  const deleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o produto "${productName}"?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "Erro ao remover produto.");
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showFeedback(`"${productName}" removido com sucesso.`);
    } catch (err: any) {
      console.error("Erro ao excluir produto:", err);
      showFeedback(err.message || "Erro ao remover produto.");
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

      {/* Gerenciador do Carrossel de Destaques do Topo (Hero Spotlight - Pedestal) */}
      <div className="bg-gradient-to-r from-[#06111f] via-[#091a2e] to-[#06111f] p-4 sm:p-5 rounded-2xl border border-amber-400/20 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Star size={16} className="fill-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Carrossel do Topo (Hero Spotlight - Pedestal Neon)</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {products.filter((p) => p.is_featured && p.is_published).length} modelos ativos
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Estas armações aparecem no pedestal interativo do topo do site (<code className="text-amber-300">01 / 04</code>). O cliente pode navegar com as setas. Clique na estrela para adicionar ou remover modelos.
              </p>
            </div>
          </div>
        </div>

        {/* Miniaturas das armações no carrossel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {products
            .filter((p) => p.is_featured)
            .map((p, idx) => {
              const primaryImg =
                p.images?.find((img) => img.is_primary)?.url || p.images?.[0]?.url;
              return (
                <div
                  key={p.id}
                  className="relative group bg-[#040d18] border border-amber-400/30 rounded-xl p-2.5 flex flex-col justify-between hover:border-amber-400 transition-all shadow-sm"
                >
                  <span className="absolute top-1.5 left-1.5 text-[9px] font-mono text-amber-400 font-bold bg-[#06111f]/90 px-1.5 py-0.5 rounded border border-amber-400/20">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFeatured(p.id, true)}
                    title="Remover do carrossel do topo"
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white flex items-center justify-center text-[11px] font-bold transition-all"
                  >
                    ×
                  </button>
                  <div className="w-full h-14 flex items-center justify-center mt-3 mb-1">
                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <Package size={22} className="text-amber-400/60" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-medium text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-amber-400 font-mono">
                      {((p.price_in_cents || 0) / 100).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          {products.filter((p) => p.is_featured).length === 0 && (
            <div className="col-span-full py-4 text-center text-xs text-slate-400">
              Nenhuma armação selecionada para o carrossel do topo. Clique em &quot;Incluir&quot; na tabela abaixo para adicionar.
            </div>
          )}
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
                  <th className="py-3.5 px-4">Carrossel Topo (Hero)</th>
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
                          onClick={() => toggleFeatured(p.id, p.is_featured)}
                          title={
                            p.is_featured
                              ? "Clique para remover este produto do carrossel do topo"
                              : "Clique para incluir este produto no carrossel do topo"
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all active:scale-95 ${
                            p.is_featured
                              ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400/30"
                              : "bg-white/5 text-slate-400 border border-white/10 hover:border-amber-400/50 hover:text-amber-300"
                          }`}
                        >
                          <Star
                            size={12}
                            className={p.is_featured ? "fill-amber-400 text-amber-400" : "text-slate-400"}
                          />
                          <span>{p.is_featured ? "No Topo" : "Incluir"}</span>
                        </button>
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
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/produtos/${p.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold active:scale-95 transition-all"
                            title="Editar dados e fotos deste produto"
                          >
                            <Pencil size={13} />
                            <span>Editar</span>
                          </Link>

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
