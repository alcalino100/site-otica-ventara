"use client";

import React, { useState, useEffect } from "react";
import { FolderTree, Plus, CheckCircle2 } from "lucide-react";
import { Category } from "@/types/ecommerce";
import { createClient } from "@/lib/supabase/client";

export default function AdminCategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      if (data) setCategories(data as Category[]);
    } catch (err) {
      console.warn("Erro ao buscar categorias:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);

    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-");

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({ name, slug, description: description || null })
        .select()
        .single();

      if (!error && data) {
        setCategories((prev) => [...prev, data as Category]);
        setName("");
        setDescription("");
        setFeedback("Categoria criada com sucesso!");
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <FolderTree size={22} className="text-amber-400" /> Categorias do Catálogo
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Estruture a navegação do site (ex: Grau, Solar, Clip-on, Infantil).
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Formulário de Criação */}
        <div className="bg-[#081724] border border-white/5 rounded-xl p-5 h-fit">
          <h2 className="text-sm font-semibold text-white mb-3">Nova Categoria</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nome</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Óculos de Grau"
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Descrição</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição opcional..."
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-400 hover:bg-amber-300 text-[#030c13] font-semibold text-xs tracking-wider uppercase py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Plus size={15} /> Cadastrar Categoria
            </button>
          </form>
        </div>

        {/* Lista de Categorias */}
        <div className="md:col-span-2 bg-[#081724] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">Categorias Cadastradas</span>
            <span className="text-xs text-slate-400">{categories.length} total</span>
          </div>

          {categories.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhuma categoria cadastrada no banco. Crie as categorias padrão no formulário ao lado.
            </div>
          ) : (
            <ul className="divide-y divide-white/5 text-xs text-slate-300">
              {categories.map((cat) => (
                <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                  <div>
                    <p className="font-semibold text-white">{cat.name}</p>
                    <p className="text-[11px] text-slate-500">/{cat.slug}</p>
                    {cat.description && <p className="text-slate-400 mt-1">{cat.description}</p>}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Ativa
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
