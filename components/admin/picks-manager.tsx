"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowUp, ArrowDown, X, Plus, Search, LayoutGrid } from "lucide-react";

export interface PickItem {
  id: string;
  name: string;
  image?: string | null;
}

interface Props {
  title: string;
  description: string;
  items: PickItem[];
  initialIds: string[];
  /** Salva a lista; devolve mensagem de erro (ou null se deu certo). */
  onSave: (ids: string[]) => Promise<string | null>;
  onFeedback: (msg: string) => void;
  testId?: string;
}

/** Escolhe quais óculos aparecem primeiro (e em que ordem) na vitrine "Escolhas que combinam com você" da Home. */
export function PicksManager({ title, description, items, initialIds, onSave, onFeedback, testId = "picks-manager" }: Props) {
  const [ids, setIds] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIds(initialIds);
    setSaved(initialIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialIds)]);

  const byId = useMemo(() => new Map(items.map((p) => [p.id, p])), [items]);
  const picked = ids.map((id) => byId.get(id)).filter((p): p is PickItem => !!p);
  const dirty = JSON.stringify(ids) !== JSON.stringify(saved);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => !ids.includes(p.id) && (!q || p.name.toLowerCase().includes(q))).slice(0, 8);
  }, [items, ids, query]);

  const move = (i: number, d: -1 | 1) =>
    setIds((prev) => {
      const j = i + d;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = async () => {
    setSaving(true);
    const erro = await onSave(ids);
    setSaving(false);
    if (!erro) {
      setSaved(ids);
      onFeedback("Salvo! Aparece no site em até 1 minuto.");
    } else {
      onFeedback(erro);
    }
  };

  const thumb = (p: PickItem) => p.image || undefined;

  return (
    <div className="bg-[#06111f] p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4" data-testid={testId}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-400/15 border border-sky-400/30 flex items-center justify-center text-sky-300">
            <LayoutGrid size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <p className="text-[11px] text-slate-300">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          data-testid={`${testId}-save`}
          className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? "Salvando..." : dirty ? "Salvar vitrine" : "Salvo"}
        </button>
      </div>

      {picked.length > 0 ? (
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {picked.map((p, i) => (
            <li key={p.id} className="flex items-center gap-2 bg-[#040d18] border border-white/10 rounded-xl p-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 w-5 text-center">{i + 1}</span>
              {thumb(p) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb(p)} alt="" className="w-10 h-10 rounded-lg object-cover bg-white/5" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white/5" />
              )}
              <span className="flex-1 min-w-0 text-xs text-white truncate">{p.name}</span>
              <button type="button" aria-label="Subir" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 text-slate-300 hover:text-white disabled:opacity-30">
                <ArrowUp size={14} />
              </button>
              <button type="button" aria-label="Descer" onClick={() => move(i, 1)} disabled={i === picked.length - 1} className="p-1 text-slate-300 hover:text-white disabled:opacity-30">
                <ArrowDown size={14} />
              </button>
              <button type="button" aria-label="Remover" onClick={() => setIds((prev) => prev.filter((x) => x !== p.id))} className="p-1 text-rose-300 hover:text-rose-200">
                <X size={14} />
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-xs text-slate-400">Nada escolhido ainda.</p>
      )}

      <div className="space-y-2">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar para adicionar..."
            className="w-full bg-[#040d18] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setIds((prev) => [...prev, p.id])}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-200 hover:border-amber-400/60 hover:text-amber-300"
            >
              <Plus size={12} /> {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
