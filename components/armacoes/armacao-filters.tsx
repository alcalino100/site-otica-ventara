"use client";

import React from "react";
import { Filter, RotateCcw, Check, Sparkles } from "lucide-react";

export interface FilterState {
  category: string;
  shape: string;
  material: string;
  color: string;
  priceRange: string;
  onlyInStock: boolean;
  search: string;
}

interface ArmacaoFiltersProps {
  filters: FilterState;
  onChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  availableShapes: string[];
  availableMaterials: string[];
  availableColors: string[];
  activeCount: number;
  totalProductsCount: number;
}

export function ArmacaoFilters({
  filters,
  onChange,
  onReset,
  availableShapes,
  availableMaterials,
  availableColors,
  activeCount,
  totalProductsCount,
}: ArmacaoFiltersProps) {
  const defaultColors = [
    { id: "all", name: "Todas as Cores", hex: "transparent" },
    { id: "preto", name: "Preto", hex: "#0f172a" },
    { id: "tartaruga", name: "Tartaruga", hex: "#78350f" },
    { id: "ouro", name: "Dourado", hex: "#eab308" },
    { id: "prata", name: "Prata", hex: "#94a3b8" },
    { id: "ambar", name: "Âmbar", hex: "#d97706" },
    { id: "transparente", name: "Transparente", hex: "#f1f5f9" },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      {/* Header da Sidebar */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-amber-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Filtros do Catálogo
          </h2>
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Limpar filtros"
          >
            <RotateCcw size={12} />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* 1. Seção: Coleção & Categoria */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Coleção
        </h3>

        <div className="space-y-1.5 text-xs">
          {[
            { id: "all", label: "Todas as Coleções" },
            { id: "grau-feminino", label: "Grau Feminino" },
            { id: "grau-masculino", label: "Grau Masculino" },
            { id: "solar", label: "Óculos de Sol" },
            { id: "infantil", label: "Infantil / Kids" },
            { id: "destaques", label: "Destaques & Ofertas" },
          ].map((cat) => {
            const isSelected = filters.category === cat.id;
            return (
              <label
                key={cat.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-slate-700 hover:text-slate-900 select-none"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="filter-collection"
                    checked={isSelected}
                    onChange={() => onChange({ category: cat.id })}
                    className="accent-amber-500 w-3.5 h-3.5"
                  />
                  <span className={isSelected ? "font-bold text-amber-700" : ""}>
                    {cat.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Seção: Formato do Aro */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Formato do Aro
        </h3>

        <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
          <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-slate-700 hover:text-slate-900 select-none">
            <input
              type="radio"
              name="filter-shape"
              checked={filters.shape === "all"}
              onChange={() => onChange({ shape: "all" })}
              className="accent-amber-500 w-3.5 h-3.5"
            />
            <span className={filters.shape === "all" ? "font-bold text-amber-700" : ""}>
              Todos os Formatos
            </span>
          </label>

          {availableShapes.map((shape) => {
            const isSelected = filters.shape === shape;
            return (
              <label
                key={shape}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-slate-700 hover:text-slate-900 select-none"
              >
                <input
                  type="radio"
                  name="filter-shape"
                  checked={isSelected}
                  onChange={() => onChange({ shape })}
                  className="accent-amber-500 w-3.5 h-3.5"
                />
                <span className={isSelected ? "font-bold text-amber-700" : ""}>
                  {shape}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Seção: Cor */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Cor
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {defaultColors.map((c) => {
            const isSelected = filters.color === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange({ color: isSelected ? "all" : c.id })}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-50 border-amber-400 text-amber-950 font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0 shadow-xs"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="truncate text-[11px]">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Seção: Faixa de Preço */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Faixa de Preço
        </h3>

        <div className="space-y-1.5 text-xs">
          {[
            { id: "all", label: "Qualquer Preço" },
            { id: "under-350", label: "Até R$ 350" },
            { id: "350-450", label: "R$ 350 a R$ 450" },
            { id: "above-450", label: "Acima de R$ 450" },
          ].map((range) => {
            const isSelected = filters.priceRange === range.id;
            return (
              <label
                key={range.id}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-slate-700 hover:text-slate-900 select-none"
              >
                <input
                  type="radio"
                  name="filter-price"
                  checked={isSelected}
                  onChange={() => onChange({ priceRange: range.id })}
                  className="accent-amber-500 w-3.5 h-3.5"
                />
                <span className={isSelected ? "font-bold text-amber-700" : ""}>
                  {range.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Seção: Disponibilidade em Estoque */}
      <div className="bg-white border border-slate-200/90 shadow-xs rounded-2xl p-4 sm:p-5">
        <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 hover:text-slate-900 select-none text-xs">
          <input
            type="checkbox"
            checked={filters.onlyInStock}
            onChange={(e) => onChange({ onlyInStock: e.target.checked })}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
          <span>Apenas em Estoque</span>
        </label>
      </div>
    </aside>
  );
}

export default ArmacaoFilters;
