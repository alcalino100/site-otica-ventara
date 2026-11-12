"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Globe,
  Sliders,
  CheckCircle2,
  Clock,
  Layout,
  Filter,
} from "lucide-react";
import { SITE_PAGES_LIST } from "@/lib/content/registry";
import { ContentPageDefinition } from "@/lib/content/types";

export default function AdminContentHubPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "page" | "global" | "template">("all");

  // Filtra páginas por categoria e pesquisa
  const filteredPages = useMemo(() => {
    return SITE_PAGES_LIST.filter((page) => {
      const matchesCategory =
        selectedCategory === "all" || page.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesTitle = page.title.toLowerCase().includes(q);
      const matchesPath = page.path.toLowerCase().includes(q);
      const matchesDesc = page.description.toLowerCase().includes(q);

      // Busca dentro dos campos das seções
      const matchesField = page.sections.some((sec) =>
        sec.fields.some(
          (f) =>
            f.label.toLowerCase().includes(q) ||
            (typeof f.default === "string" && f.default.toLowerCase().includes(q))
        )
      );

      return matchesCategory && (matchesTitle || matchesPath || matchesDesc || matchesField);
    });
  }, [selectedCategory, searchQuery]);

  // Contadores rápidos para o cabeçalho
  const totalPages = SITE_PAGES_LIST.length;
  const totalSections = SITE_PAGES_LIST.reduce((acc, p) => acc + p.sections.length, 0);
  const totalFields = SITE_PAGES_LIST.reduce(
    (acc, p) => acc + p.sections.reduce((sAcc, s) => sAcc + s.fields.length, 0),
    0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho do Hub */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles size={14} className="text-amber-400" />
            <span>Motor de Conteúdo & CMS Universal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Mapa do Site & Gestão de Conteúdo
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Edite qualquer texto, imagem, link e visibilidade de seções página por página, sem necessidade
            de deploy. Gerencie rascunhos, visualize alterações com segurança e publique diretamente no ar.
          </p>
        </div>

        {/* Métricas Rápidas */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-3 rounded-2xl bg-[#040e17] border border-white/10 text-center">
            <span className="block text-xl font-bold text-white">{totalPages}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Páginas</span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-[#040e17] border border-white/10 text-center">
            <span className="block text-xl font-bold text-amber-400">{totalSections}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Seções</span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-[#040e17] border border-white/10 text-center">
            <span className="block text-xl font-bold text-sky-400">{totalFields}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Campos</span>
          </div>
        </div>
      </div>

      {/* Barra de Busca "Procurar texto no site" & Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-xl">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Procurar texto, título, campo ou rota em todo o site..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Pílulas de Categoria */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === "all"
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            Todas ({SITE_PAGES_LIST.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("page")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === "page"
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            Páginas Principais
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("global")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === "global"
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            Elementos Globais
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("template")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === "template"
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                : "bg-slate-900 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            Templates
          </button>
        </div>
      </div>

      {/* Grade de Páginas do Mapa do Site */}
      {filteredPages.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-[#040e17] border border-white/10 text-slate-400">
          <Search size={32} className="mx-auto mb-3 text-slate-600" />
          <h3 className="text-base font-bold text-white">Nenhum conteúdo encontrado</h3>
          <p className="text-xs mt-1">Tente ajustar os termos de busca ou mudar a categoria selecionada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPages.map((page) => {
            const hasDedicatedEditor = Boolean(page.existingEditorUrl);
            const editUrl = hasDedicatedEditor
              ? page.existingEditorUrl!
              : `/admin/conteudo/${page.id}`;

            const fieldsCount = page.sections.reduce((acc, s) => acc + s.fields.length, 0);

            return (
              <div
                key={page.id}
                className="group relative rounded-2xl bg-[#040e17] border border-white/10 hover:border-amber-400/40 p-5 shadow-lg flex flex-col justify-between transition-all duration-200 hover:-translate-y-1"
              >
                <div>
                  {/* Topo do Card: Categoria & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      {page.category === "global"
                        ? "Global"
                        : page.category === "template"
                        ? "Template"
                        : "Página"}
                    </span>

                    {hasDedicatedEditor ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-semibold">
                        <Sliders size={11} />
                        Editor Especializado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                        <CheckCircle2 size={11} />
                        Editável via CMS
                      </span>
                    )}
                  </div>

                  {/* Título e Rota */}
                  <h2 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                    {page.title}
                  </h2>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{page.path}</p>

                  {/* Descrição */}
                  <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">
                    {page.description}
                  </p>

                  {/* Contagem de Seções / Campos */}
                  {!hasDedicatedEditor && (
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Layers size={13} className="text-slate-500" />
                        {page.sections.length} seções
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={13} className="text-slate-500" />
                        {fieldsCount} campos editáveis
                      </span>
                    </div>
                  )}
                </div>

                {/* Ações do Card */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  {page.path && (
                    <a
                      href={page.previewPath || page.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      title="Ver página no site"
                    >
                      <span>Abrir no site</span>
                      <ExternalLink size={12} />
                    </a>
                  )}

                  <Link
                    href={editUrl}
                    className={`ml-auto px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      hasDedicatedEditor
                        ? "bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-400/30 hover:border-sky-400/60"
                        : "bg-[#FFD62E] hover:bg-[#e6c129] text-slate-950 shadow-md shadow-amber-400/10 hover:scale-[1.02]"
                    }`}
                  >
                    <span>{hasDedicatedEditor ? "Abrir Editor" : "Editar Conteúdo"}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
