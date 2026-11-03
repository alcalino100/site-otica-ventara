"use client";

import React from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";

interface CmsSectionAccordionProps {
  id: string;
  sectionType?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  isActive: boolean;
  isOpen: boolean;
  index: number;
  totalCount: number;
  onToggleOpen: () => void;
  onToggleActive: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  children: React.ReactNode;
}

export function CmsSectionAccordion({
  id,
  sectionType,
  title,
  subtitle,
  badge,
  isActive,
  isOpen,
  index,
  totalCount,
  onToggleOpen,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  children,
}: CmsSectionAccordionProps) {
  const contentId = `section-content-${id}`;
  const headerId = `section-header-${id}`;
  const testId = `cms-accordion-${sectionType || id}`;

  return (
    <div
      data-testid={testId}
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isOpen
          ? "bg-slate-900/90 border-slate-700 shadow-md"
          : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700"
      }`}
    >
      {/* Barra de Título do Acordeão */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 gap-3">
        {/* Controles de Ordenação e Indicador */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={index === 0}
              title="Mover seção para cima"
              aria-label={`Mover seção ${title} para cima`}
              className={`p-1 rounded-md transition-colors ${
                index === 0
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <ArrowUp size={13} />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={index === totalCount - 1}
              title="Mover seção para baixo"
              aria-label={`Mover seção ${title} para baixo`}
              className={`p-1 rounded-md transition-colors ${
                index === totalCount - 1
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <ArrowDown size={13} />
            </button>
          </div>

          <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center font-bold">
            {index + 1}
          </span>
        </div>

        {/* Título e Status - Clicável para expandir */}
        <button
          type="button"
          id={headerId}
          aria-expanded={isOpen}
          aria-controls={contentId}
          onClick={onToggleOpen}
          className="flex-1 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 py-1"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
              {title}
            </h3>
            {badge && (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {badge}
              </span>
            )}
            {!isActive && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Oculta na Página
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-[11px] text-slate-400 truncate max-w-xs">{subtitle}</p>
          )}
        </button>

        {/* Ações Rápidas: Ativar/Desativar e Seta Expandir */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleActive}
            title={isActive ? "Ocultar esta seção da página" : "Exibir esta seção na página"}
            aria-label={isActive ? "Desativar seção" : "Ativar seção"}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
              isActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
            }`}
          >
            {isActive ? <Eye size={12} /> : <EyeOff size={12} />}
            <span className="hidden sm:inline">{isActive ? "Ativa" : "Oculta"}</span>
          </button>

          <button
            type="button"
            onClick={onToggleOpen}
            aria-label={isOpen ? "Recolher seção" : "Expandir seção"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Conteúdo Expansível */}
      {isOpen && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={headerId}
          className="p-4 sm:p-6 border-t border-slate-800/80 bg-slate-950/40 animate-in fade-in duration-200"
        >
          {children}
        </div>
      )}
    </div>
  );
}
