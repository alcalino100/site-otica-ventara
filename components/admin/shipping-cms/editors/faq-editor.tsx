"use client";

import React, { useState } from "react";
import { SectionFaqData } from "@/types/shipping-cms";
import { ShippingFaqItem } from "@/types/shipping";
import { Plus, Trash2, Eye, EyeOff, HelpCircle } from "lucide-react";

interface FaqEditorProps {
  data: SectionFaqData;
  onChange: (updated: SectionFaqData) => void;
}

export function FaqEditor({ data, onChange }: FaqEditorProps) {
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  const updateHeaderField = <K extends keyof SectionFaqData>(
    field: K,
    value: SectionFaqData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const updateFaqItem = (id: string, updates: Partial<ShippingFaqItem>) => {
    const updated = (data.faqs || []).map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    onChange({ ...data, faqs: updated });
  };

  const addFaqItem = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const newItem: ShippingFaqItem = {
      id: `faq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      is_active: true,
      sort_order: (data.faqs?.length || 0) + 1,
    };
    onChange({ ...data, faqs: [...(data.faqs || []), newItem] });
    setNewQuestion("");
    setNewAnswer("");
  };

  const removeFaqItem = (id: string) => {
    onChange({
      ...data,
      faqs: (data.faqs || []).filter((item) => item.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Textos da Seção */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Selo Superior (Badge)
          </label>
          <input
            type="text"
            maxLength={60}
            value={data.badge_text || ""}
            onChange={(e) => updateHeaderField("badge_text", e.target.value)}
            placeholder="Ex: Dúvidas Comuns"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Título da Seção
          </label>
          <input
            type="text"
            maxLength={60}
            value={data.title || ""}
            onChange={(e) => updateHeaderField("title", e.target.value)}
            placeholder="Ex: Perguntas Frequentes sobre Entregas"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Subtítulo da Seção
          </label>
          <textarea
            rows={2}
            maxLength={200}
            value={data.subtitle || ""}
            onChange={(e) => updateHeaderField("subtitle", e.target.value)}
            placeholder="Ex: Tire suas dúvidas sobre prazos, embalagens especiais, rastreio..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />
        </div>
      </div>

      {/* 2. Lista de FAQs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle size={14} className="text-amber-400" />
            <span>Perguntas Cadastradas ({data.faqs?.length || 0})</span>
          </h4>
        </div>

        <div className="space-y-3">
          {(data.faqs || []).map((faq, idx) => (
            <div
              key={faq.id}
              className={`p-4 rounded-xl border space-y-3 transition-colors ${
                faq.is_active
                  ? "bg-slate-900/80 border-slate-800"
                  : "bg-slate-950/40 border-slate-900 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono text-amber-400 font-bold">
                  Q{idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateFaqItem(faq.id, { is_active: !faq.is_active })}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                      faq.is_active
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {faq.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{faq.is_active ? "Ativa" : "Oculta"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => removeFaqItem(faq.id)}
                    title="Excluir pergunta"
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={150}
                  value={faq.question || ""}
                  onChange={(e) => updateFaqItem(faq.id, { question: e.target.value })}
                  placeholder="Pergunta (ex: Como rastrear meu pedido?)"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  maxLength={600}
                  value={faq.answer || ""}
                  onChange={(e) => updateFaqItem(faq.id, { answer: e.target.value })}
                  placeholder="Resposta detalhada e transparente..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-hidden focus:border-amber-400 leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Adicionar Nova Pergunta */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Plus size={14} className="text-amber-400" />
            <span>Adicionar Nova Pergunta Frequente</span>
          </h5>

          <input
            type="text"
            maxLength={150}
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Digite a nova pergunta..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />

          <textarea
            rows={2}
            maxLength={600}
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Digite a resposta que será exibida ao expandir..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={addFaqItem}
              disabled={!newQuestion.trim() || !newAnswer.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Inserir no FAQ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
