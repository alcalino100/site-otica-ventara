"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  Camera,
  AlertTriangle,
  Tag,
  CheckSquare,
  Square,
  Percent,
  DollarSign,
  ArrowRight,
  Filter,
  X,
  Clock,
  Layers,
} from "lucide-react";
import { Product } from "@/types/ecommerce";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEFAULT_CATALOG } from "@/lib/catalog-data";
import { Skeleton } from "@/components/ui/skeleton";

function getProductIssues(p: Product): string[] {
  const issues: string[] = [];
  const primaryImg = p.images?.find((img) => img.is_primary)?.url || p.images?.[0]?.url;
  if (!primaryImg) issues.push("Sem foto principal");
  if (!p.price_in_cents || p.price_in_cents <= 0) issues.push("Sem preço");
  if (!p.sku) issues.push("Sem SKU");
  if (!p.description || p.description.trim().length === 0) issues.push("Sem descrição");
  return issues;
}

function ProductsContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const initialStatus = searchParams.get("status") as "all" | "published" | "draft" | null;
  const initialDiscount = searchParams.get("hasDiscount") === "true";
  const initialSearch = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>(() =>
    !isSupabaseConfigured() ? DEFAULT_CATALOG : []
  );
  const [isLoading, setIsLoading] = useState(!isSupabaseConfigured() ? false : true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">(
    initialStatus || "all"
  );
  const [onlyDiscount, setOnlyDiscount] = useState<boolean>(initialDiscount);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Seleção em lote
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [showBatchPriceModal, setShowBatchPriceModal] = useState(false);
  const [batchPriceType, setBatchPriceType] = useState<"percentage" | "fixed">("percentage");
  const [batchPriceValue, setBatchPriceValue] = useState<string>("-10");

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
          variants:product_variants(stock_quantity, sku, color_name, price_in_cents, compare_at_price_in_cents)
        `)
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });

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

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

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
      setSelectedIds((prev) => prev.filter((id) => id !== productId));
      showFeedback(`"${productName}" removido com sucesso.`);
    } catch (err: any) {
      console.error("Erro ao excluir produto:", err);
      showFeedback(err.message || "Erro ao remover produto.");
    }
  };

  // ── Ações em Lote ──
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchPublish = async (publish: boolean) => {
    if (selectedIds.length === 0) return;
    const confirmMsg = publish
      ? `Publicar ${selectedIds.length} produto(s) selecionado(s)?`
      : `Mudar ${selectedIds.length} produto(s) para rascunho?`;

    if (!window.confirm(confirmMsg)) return;

    setIsBatchProcessing(true);
    try {
      const res = await fetch("/api/admin/products/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          ids: selectedIds,
          is_published: publish,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Erro ao atualizar lote");

      setProducts((prev) =>
        prev.map((p) =>
          selectedIds.includes(p.id) ? { ...p, is_published: publish } : p
        )
      );
      showFeedback(
        publish
          ? `${selectedIds.length} produtos publicados com sucesso!`
          : `${selectedIds.length} produtos movidos para rascunho.`
      );
      setSelectedIds([]);
    } catch (err: any) {
      showFeedback(err.message || "Falha ao processar lote.");
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleApplyBatchPrice = async () => {
    const val = parseFloat(batchPriceValue);
    if (isNaN(val)) {
      alert("Por favor insira um valor numérico válido.");
      return;
    }

    setIsBatchProcessing(true);
    try {
      const priceValInCents =
        batchPriceType === "fixed" ? Math.round(val * 100) : val;

      const res = await fetch("/api/admin/products/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_price",
          ids: selectedIds,
          priceType: batchPriceType,
          priceValue: priceValInCents,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || "Erro ao atualizar preços");

      // Atualiza localmente
      setProducts((prev) =>
        prev.map((p) => {
          if (!selectedIds.includes(p.id)) return p;
          let newPrice = p.price_in_cents;
          if (batchPriceType === "fixed") {
            newPrice = Math.max(0, Math.round(val * 100));
          } else {
            newPrice = Math.max(0, Math.round(p.price_in_cents * (1 + val / 100)));
          }
          return { ...p, price_in_cents: newPrice };
        })
      );

      showFeedback(`Preço atualizado para ${selectedIds.length} produtos!`);
      setShowBatchPriceModal(false);
      setSelectedIds([]);
    } catch (err: any) {
      showFeedback(err.message || "Falha ao atualizar preços.");
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Filtragem de produtos
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        p.variants?.some((v) => v.sku && v.sku.toLowerCase().includes(q)) ||
        p.category?.name?.toLowerCase().includes(q) ||
        (p.brand?.name && p.brand.name.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && p.is_published) ||
        (statusFilter === "draft" && !p.is_published);

      const hasDisc = (p.compare_at_price_in_cents || 0) > (p.price_in_cents || 0);
      const matchesDiscount = !onlyDiscount || hasDisc;

      return matchesSearch && matchesStatus && matchesDiscount;
    });
  }, [products, searchQuery, statusFilter, onlyDiscount]);

  // Lista de rascunhos com pendências para o painel didático
  const draftProductsWithIssues = useMemo(() => {
    return products
      .filter((p) => !p.is_published)
      .map((p) => ({
        product: p,
        issues: getProductIssues(p),
      }));
  }, [products]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
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
            PORTA ÚNICA DE ENTRADA · CATÁLOGO
          </span>
          <h1 className="text-xl sm:text-3xl font-light text-white tracking-tight mt-0.5">
            Gestão de <span className="font-normal text-amber-400">Produtos</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Cadastre aqui para atualizar o site inteiro. Banners e vitrines referenciam este cadastro automaticamente.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/produtos/fotos-lote"
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider transition-all active:scale-95"
            title="Upload de fotos em massa com casamento automático por SKU"
          >
            <Camera size={15} className="text-amber-400" />
            <span>Fotos em Lote</span>
          </Link>

          <Link
            href="/admin/produtos/importar"
            className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider transition-all active:scale-95"
          >
            <FileSpreadsheet size={15} className="text-amber-400" />
            <span>Importar CSV</span>
          </Link>

          <Link
            href="/admin/produtos/novo"
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#06111f] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/10"
            style={{ color: "#06111f" }}
          >
            <Plus size={16} />
            <span>Novo Produto</span>
          </Link>
        </div>
      </div>

      {/* PAINEL DE PENDÊNCIAS DE RASCUNHOS (DIDÁTICO) */}
      {draftProductsWithIssues.length > 0 && statusFilter !== "published" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1728] border border-amber-400/30 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle size={15} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Painel de Pendências de Rascunho</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                    {draftProductsWithIssues.length} produto(s)
                  </span>
                </h2>
                <p className="text-xs text-slate-300">
                  Produtos em rascunho não aparecem no site até que todas as pendências obrigatórias sejam resolvidas.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStatusFilter("draft")}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Filtrar apenas rascunhos</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {draftProductsWithIssues.slice(0, 6).map(({ product: p, issues }) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-[#06111f] border border-white/10 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    {issues.map((iss) => (
                      <span
                        key={iss}
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      >
                        {iss}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/admin/produtos/${p.id}`}
                  className="px-2.5 py-1 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-semibold shrink-0"
                >
                  Resolver
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

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
                Estas armações aparecem no pedestal interativo do topo do site. O cliente pode navegar com as setas. Clique na estrela para adicionar ou remover modelos.
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
                        className="max-h-full max-w-full object-contain rounded-lg"
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

      {/* BARRA DE FILTROS, BUSCA E STATUS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#06111f] p-3.5 rounded-2xl border border-white/10">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por nome, SKU, cor ou marca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a1b2e] border border-white/10 focus:border-amber-400 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-400 focus:outline-none transition-colors"
          />
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              statusFilter === "all"
                ? "bg-amber-400 !text-[#06111f] shadow-sm font-bold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              statusFilter === "published"
                ? "bg-amber-400 !text-[#06111f] shadow-sm font-bold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Publicados ({products.filter((p) => p.is_published).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              statusFilter === "draft"
                ? "bg-amber-400 !text-[#06111f] shadow-sm font-bold"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Rascunhos ({products.filter((p) => !p.is_published).length})
          </button>
          <button
            type="button"
            onClick={() => setOnlyDiscount((prev) => !prev)}
            className={`min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              onlyDiscount
                ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
            }`}
          >
            <Tag size={12} />
            <span>Ofertas</span>
          </button>
        </div>
      </div>

      {/* BARRA DE AÇÕES EM LOTE (QUANDO PRODUTOS ESTÃO SELECIONADOS) */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-40 p-4 rounded-2xl bg-amber-400 text-[#06111f] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in border border-amber-300">
          <div className="flex items-center gap-2">
            <CheckSquare size={18} />
            <span className="font-bold text-xs uppercase tracking-wider">
              {selectedIds.length} produto(s) selecionado(s)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowBatchPriceModal(true)}
              disabled={isBatchProcessing}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#06111f] hover:bg-[#0a1e35] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <Percent size={13} className="text-amber-400" />
              <span>Alterar Preço</span>
            </button>

            <button
              type="button"
              onClick={() => handleBatchPublish(true)}
              disabled={isBatchProcessing}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <Eye size={13} />
              <span>Publicar</span>
            </button>

            <button
              type="button"
              onClick={() => handleBatchPublish(false)}
              disabled={isBatchProcessing}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
            >
              <EyeOff size={13} />
              <span>Rascunho</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-[#06111f] font-semibold text-xs transition-all"
            >
              Desmarcar
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE ALTERAÇÃO DE PREÇO EM LOTE */}
      {showBatchPriceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#071626] border border-amber-400/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Percent size={16} className="text-amber-400" />
                <span>Alterar Preço em Lote</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowBatchPriceModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Você está alterando o preço de <strong className="text-amber-400">{selectedIds.length}</strong> produtos selecionados.
            </p>

            {/* Tipo de alteração */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBatchPriceType("percentage")}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                  batchPriceType === "percentage"
                    ? "border-amber-400 bg-amber-400/10 text-amber-300"
                    : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Porcentagem (%)
                <p className="text-[10px] font-normal text-slate-400 mt-0.5">Ex: -10% ou +5%</p>
              </button>

              <button
                type="button"
                onClick={() => setBatchPriceType("fixed")}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                  batchPriceType === "fixed"
                    ? "border-amber-400 bg-amber-400/10 text-amber-300"
                    : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                Preço Fixo (R$)
                <p className="text-[10px] font-normal text-slate-400 mt-0.5">Ex: 289,00</p>
              </button>
            </div>

            {/* Input de valor */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                {batchPriceType === "percentage" ? "Percentual de Ajuste (%)" : "Novo Preço (R$)"}
              </label>
              <input
                type="number"
                step="any"
                value={batchPriceValue}
                onChange={(e) => setBatchPriceValue(e.target.value)}
                placeholder={batchPriceType === "percentage" ? "-10" : "289.00"}
                className="w-full bg-[#0a1e35] border border-white/20 focus:border-amber-400 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none"
              />
            </div>

            {/* Prévia de aplicação */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-white block">Prévia de Exemplo:</span>
              <p className="text-[11px] text-slate-400">
                Produto de R$ 389,00 passará a ser{" "}
                <strong className="text-amber-400">
                  {batchPriceType === "percentage"
                    ? (
                        Math.max(0, 389 * (1 + (parseFloat(batchPriceValue) || 0) / 100))
                      ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : (
                        parseFloat(batchPriceValue) || 0
                      ).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </strong>
              </p>
            </div>

            {/* Ações do Modal */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBatchPriceModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApplyBatchPrice}
                disabled={isBatchProcessing}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                style={{ color: "#06111f" }}
              >
                {isBatchProcessing ? "Aplicando..." : "Confirmar e Aplicar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LISTAGEM RESPONSIVA (CARDS NO MOBILE, TABELA NO DESKTOP) */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {/* Barra superior de seleção em massa */}
        <div className="p-3.5 bg-[#040c16] border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              {selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? (
                <CheckSquare size={16} className="text-amber-400" />
              ) : (
                <Square size={16} />
              )}
              <span>Selecionar Todos ({filteredProducts.length})</span>
            </button>
          </div>
          <span>Mostrando {filteredProducts.length} produtos</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0"
              >
                <Skeleton className="w-10 h-10 rounded-xl bg-white/10" />
                <Skeleton className="h-4 w-44 bg-white/10 rounded" />
                <Skeleton className="h-6 w-20 bg-white/10 rounded-full" />
                <Skeleton className="h-4 w-16 bg-white/10 rounded" />
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
          <>
            {/* VERSÃO MOBILE: CARDS FACILMENTE ACESSÍVEIS COM UMA MÃO */}
            <div className="block md:hidden divide-y divide-white/5">
              {filteredProducts.map((p) => {
                const primaryImg =
                  p.images?.find((img) => img.is_primary)?.url || p.images?.[0]?.url;
                const isSelected = selectedIds.includes(p.id);
                const hasDisc =
                  (p.compare_at_price_in_cents || 0) > (p.price_in_cents || 0);

                return (
                  <div
                    key={p.id}
                    className={`p-4 space-y-3 transition-colors ${
                      isSelected ? "bg-amber-400/5" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSelectOne(p.id)}
                        className="mt-1 p-1 text-slate-400 hover:text-white"
                      >
                        {isSelected ? (
                          <CheckSquare size={18} className="text-amber-400" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>

                      <div className="w-16 h-16 rounded-xl bg-[#0a1e33] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {primaryImg ? (
                          <img
                            src={primaryImg}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package size={22} className="text-slate-500" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white truncate">{p.name}</p>
                        <p className="text-[11px] text-amber-400 font-mono mt-0.5">
                          SKU: {p.sku || "Não definido"}
                        </p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-bold text-amber-400 text-sm font-mono">
                            {((p.price_in_cents || 0) / 100).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                          {hasDisc && (
                            <span className="text-[10px] text-slate-400 line-through font-mono">
                              {((p.compare_at_price_in_cents || 0) / 100).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => togglePublish(p.id, p.is_published)}
                        className={`min-h-[44px] flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 ${
                          p.is_published
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-700/40 text-slate-300 border border-slate-600/30"
                        }`}
                      >
                        {p.is_published ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <Eye size={13} /> Publicado
                          </>
                        ) : (
                          <>
                            <EyeOff size={13} /> Rascunho
                          </>
                        )}
                      </button>

                      <Link
                        href={`/admin/produtos/${p.id}`}
                        className="min-h-[44px] flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold active:scale-95 transition-all"
                      >
                        <Pencil size={13} />
                        <span>Editar</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => deleteProduct(p.id, p.name)}
                        className="min-h-[44px] w-11 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all"
                        title="Remover produto"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* VERSÃO DESKTOP: TABELA COMPLETA */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#040c16] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4 w-10">
                      <button type="button" onClick={toggleSelectAll}>
                        {selectedIds.length > 0 && selectedIds.length === filteredProducts.length ? (
                          <CheckSquare size={15} className="text-amber-400" />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>
                    </th>
                    <th className="py-3.5 px-4">Produto</th>
                    <th className="py-3.5 px-4">Linha / Categoria</th>
                    <th className="py-3.5 px-4">Preço Atual</th>
                    <th className="py-3.5 px-4">Preço Original</th>
                    <th className="py-3.5 px-4">Carrossel Topo</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((p) => {
                    const primaryImg =
                      p.images?.find((img) => img.is_primary)?.url || p.images?.[0]?.url;
                    const priceFormatted = (p.price_in_cents / 100).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    });
                    const compareFormatted = p.compare_at_price_in_cents
                      ? (p.compare_at_price_in_cents / 100).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : null;
                    const isSelected = selectedIds.includes(p.id);

                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          isSelected ? "bg-amber-400/5" : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => toggleSelectOne(p.id)}
                            className="text-slate-400 hover:text-white"
                          >
                            {isSelected ? (
                              <CheckSquare size={15} className="text-amber-400" />
                            ) : (
                              <Square size={15} />
                            )}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#0a1e33] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
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
                            <span className="text-[11px] text-amber-400 font-mono">
                              SKU: {p.sku || "Sem SKU"}
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

                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {compareFormatted ? (
                            <span className="line-through">{compareFormatted}</span>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => toggleFeatured(p.id, p.is_featured)}
                            title={
                              p.is_featured
                                ? "Clique para remover do carrossel do topo"
                                : "Clique para incluir no carrossel do topo"
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
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 space-y-4">
          <Skeleton className="h-8 w-64 bg-white/10 rounded-xl" />
          <Skeleton className="h-44 w-full bg-white/5 rounded-2xl" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
