"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  Layers,
  ShieldCheck,
  Save,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Clock,
  Zap,
  RotateCcw,
  Plus,
  Trash2,
} from "lucide-react";
import { AdminLensItem, DEFAULT_LENSES } from "@/lib/lenses-data";

export default function AdminLensesPage() {
  const [lenses, setLenses] = useState<AdminLensItem[]>(DEFAULT_LENSES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLens, setSelectedLens] = useState<AdminLensItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "visao-simples" | "multifocal" | "tratamentos">("all");

  useEffect(() => {
    async function loadLenses() {
      try {
        const res = await fetch("/api/admin/lenses");
        if (res.ok) {
          const data = await res.json();
          if (data.lenses && Array.isArray(data.lenses)) {
            setLenses(data.lenses);
          }
        }
      } catch (err) {
        console.warn("Utilizando lentes padrão:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadLenses();
  }, []);

  const handleSaveAll = async (updatedList: AdminLensItem[]) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/lenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lenses: updatedList }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar alterações.");
      }

      setLenses(updatedList);
      setFeedback("Catálogo de lentes, preços e especificações atualizado com sucesso!");
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error(err);
      setFeedback(err.message || "Erro inesperado ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateLens = (updated: AdminLensItem) => {
    const newList = lenses.map((item) => (item.id === updated.id ? updated : item));
    setLenses(newList);
    setSelectedLens(null);
    handleSaveAll(newList);
  };

  const filteredLenses = lenses.filter((l) => {
    if (categoryFilter === "all") return true;
    return l.category === categoryFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Eye className="text-amber-400" size={24} />
            <span>Gestão de Lentes, Preços &amp; Qualidades</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure os valores de referência, tratamentos específicos, descrições técnicas e marcas homologadas exibidas no site.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/#lentes"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold tracking-wider transition-all"
          >
            <span>Ver no Site</span>
            <ExternalLink size={13} className="text-amber-400" />
          </Link>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filtros de Categoria */}
      <div className="flex items-center gap-2 bg-[#06111f] p-3 rounded-2xl border border-white/10 overflow-x-auto">
        <button
          type="button"
          onClick={() => setCategoryFilter("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            categoryFilter === "all"
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Todas ({lenses.length})
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter("visao-simples")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            categoryFilter === "visao-simples"
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Visão Simples (Monofocais)
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter("multifocal")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            categoryFilter === "multifocal"
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Multifocais (Progressivas)
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter("tratamentos")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            categoryFilter === "tratamentos"
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Filtro Azul &amp; Fotossensíveis
        </button>
      </div>

      {/* Grade de Lentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLenses.map((lens) => (
          <div
            key={lens.id}
            className="bg-[#06111f] border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400/40 transition-all shadow-md group"
          >
            <div>
              {/* Header do Card */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  {lens.badge || lens.brandName}
                </span>

                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Clock size={12} /> {lens.leadTime}
                </span>
              </div>

              {/* Nome & Marca */}
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">{lens.brandName}</p>
              <h3 className="text-base font-bold text-white tracking-tight mb-2">{lens.name}</h3>

              {/* Tratamento */}
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-amber-300 font-medium mb-3 flex items-start gap-1.5">
                <Zap size={14} className="shrink-0 mt-0.5 text-amber-400" />
                <span>{lens.treatment}</span>
              </div>

              {/* Preço de Referência */}
              <div className="mb-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Preço de Referência</span>
                <span className="text-xl font-extrabold text-amber-400 font-mono">{lens.startingPrice}</span>
                <p className="text-[11px] text-slate-400">{lens.installment}</p>
              </div>

              {/* Descrição */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                {lens.description}
              </p>

              {/* Recursos / Qualidades */}
              <ul className="space-y-1 mb-4 text-[11px] text-slate-400">
                {lens.features.slice(0, 3).map((feat, i) => (
                  <li key={i} className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ação: Editar */}
            <div className="pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setSelectedLens(lens)}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={13} />
                <span>Editar Lente &amp; Preço</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição da Lente Selecionada */}
      {selectedLens && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#081724] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 size={18} className="text-amber-400" />
                  Editar Lente: {selectedLens.name}
                </h2>
                <p className="text-xs text-slate-400">
                  Altere valores, qualidades específicas e tratamentos da lente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLens(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateLens(selectedLens);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Nome Comercial da Lente *</label>
                  <input
                    type="text"
                    required
                    value={selectedLens.name}
                    onChange={(e) => setSelectedLens({ ...selectedLens, name: e.target.value })}
                    className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Marca Homologada *</label>
                  <input
                    type="text"
                    required
                    value={selectedLens.brandName}
                    onChange={(e) => setSelectedLens({ ...selectedLens, brandName: e.target.value })}
                    className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Preço de Referência *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: R$ 149,90"
                    value={selectedLens.startingPrice}
                    onChange={(e) => setSelectedLens({ ...selectedLens, startingPrice: e.target.value })}
                    className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Parcelamento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 10x de R$ 14,99 sem juros"
                    value={selectedLens.installment}
                    onChange={(e) => setSelectedLens({ ...selectedLens, installment: e.target.value })}
                    className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Prazo de Montagem *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pronto em até 1 hora"
                    value={selectedLens.leadTime}
                    onChange={(e) => setSelectedLens({ ...selectedLens, leadTime: e.target.value })}
                    className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Tratamento em Destaque</label>
                  <input
                    type="text"
                    value={selectedLens.treatment}
                    onChange={(e) => setSelectedLens({ ...selectedLens, treatment: e.target.value })}
                    className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Selo / Badge em Destaque</label>
                  <input
                    type="text"
                    value={selectedLens.badge || ""}
                    onChange={(e) => setSelectedLens({ ...selectedLens, badge: e.target.value })}
                    className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Descrição e Qualidade Específica da Lente
                </label>
                <textarea
                  rows={3}
                  value={selectedLens.description}
                  onChange={(e) => setSelectedLens({ ...selectedLens, description: e.target.value })}
                  className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Diferenciais e Benefícios (um por linha)
                </label>
                <textarea
                  rows={4}
                  value={selectedLens.features.join("\n")}
                  onChange={(e) =>
                    setSelectedLens({
                      ...selectedLens,
                      features: e.target.value.split("\n").filter((f) => f.trim().length > 0),
                    })
                  }
                  className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Cada linha digitada será exibida como um item com ícone de verificação no card do site.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedLens(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  <Save size={15} />
                  <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
