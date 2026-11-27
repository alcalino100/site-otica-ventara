"use client";

import React, { useEffect, useState } from "react";
import { ExternalLink, ImagePlus, Loader2 } from "lucide-react";
import { adminRequest } from "@/lib/admin-fetch";
import { formatBRL, parseBRLToCents, ZENTARA_DEFAULT_IMAGE, type ZentaraOption } from "@/lib/zentara-options";

interface Draft extends Omit<ZentaraOption, "priceCents" | "oldPriceCents" | "highlights"> {
  price: string;
  oldPrice: string;
  specs: string;
}

const field = "w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-violet-400 focus:outline-none";
const label = "mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400";
const toInput = (c: number | null) => (c ? (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "");

const toDraft = (o: ZentaraOption): Draft => ({ ...o, price: toInput(o.priceCents), oldPrice: toInput(o.oldPriceCents), specs: o.highlights.join("\n") });

export default function AdminZentaraPage() {
  const [items, setItems] = useState<Draft[] | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await adminRequest<{ options: ZentaraOption[] }>("/api/admin/zentara");
      if (r.ok && r.data) setItems(r.data.options.map(toDraft));
      else setMsg({ type: "err", text: r.error || "Não foi possível carregar." });
    })();
  }, []);

  const update = (id: string, patch: Partial<Draft>) => setItems((l) => l && l.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  const upload = async (id: string, file: File | undefined) => {
    if (!file) return;
    setUploading(id);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Erro ao enviar a imagem.");
      update(id, { imageUrl: data.url });
    } catch (e: any) {
      setMsg({ type: "err", text: e.message || "Falha no envio da imagem." });
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!items) return;
    const options: Array<Record<string, unknown>> = [];
    for (const d of items) {
      const priceCents = parseBRLToCents(d.price);
      const oldPriceCents = parseBRLToCents(d.oldPrice);
      if (priceCents === undefined || oldPriceCents === undefined) {
        setMsg({ type: "err", text: `${d.name}: preço inválido. Use o formato 299,90.` });
        return;
      }
      options.push({
        id: d.id, name: d.name, tagline: d.tagline, badge: d.badge, imageUrl: d.imageUrl, active: d.active,
        highlights: d.specs.split("\n").map((s) => s.trim()).filter(Boolean),
        priceCents, oldPriceCents,
      });
    }
    setSaving(true);
    setMsg(null);
    const r = await adminRequest<{ options: ZentaraOption[] }>("/api/admin/zentara", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ options }),
    });
    setSaving(false);
    if (r.ok && r.data) {
      setItems(r.data.options.map(toDraft));
      setMsg({ type: "ok", text: "Salvo! A página /zentara já foi atualizada." });
    } else setMsg({ type: "err", text: r.error || "Não foi possível salvar." });
  };

  if (!items) return <div className="p-6 text-slate-300">{msg?.text || "Carregando…"}</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6" data-testid="admin-zentara">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Lentes Zentara</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">Edite os três cartões de compra da página /zentara: preço promocional (roxo), preço antigo (riscado), foto, selo e especificações.</p>
        </div>
        <a href="/zentara" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/5">
          Ver página <ExternalLink size={14} />
        </a>
      </header>

      {msg && (
        <div role="status" data-testid="zentara-msg" className={`rounded-lg border px-4 py-3 text-sm ${msg.type === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : "border-red-500/40 bg-red-500/10 text-red-200"}`}>{msg.text}</div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {items.map((d) => {
          const p = parseBRLToCents(d.price);
          const o = parseBRLToCents(d.oldPrice);
          return (
            <section key={d.id} data-testid={`adm-zentara-${d.index}`} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">{d.name}</h2>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={d.active} onChange={(e) => update(d.id, { active: e.target.checked })} data-testid={`adm-ativo-${d.index}`} /> Exibir
                </label>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.imageUrl} alt={d.name} className="aspect-[4/3] w-full object-cover" />
                {d.badge && <span className="absolute right-2 top-2 rounded-md bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{d.badge}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500">
                  {uploading === d.id ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} Trocar foto
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { void upload(d.id, e.target.files?.[0]); e.target.value = ""; }} />
                </label>
                {d.imageUrl !== ZENTARA_DEFAULT_IMAGE && (
                  <button type="button" onClick={() => update(d.id, { imageUrl: ZENTARA_DEFAULT_IMAGE })} className="rounded-full border border-white/20 px-4 py-2 text-xs text-slate-200 hover:bg-white/5">Voltar à foto padrão</button>
                )}
              </div>

              <div><label className={label}>Nome</label><input className={field} value={d.name} maxLength={60} onChange={(e) => update(d.id, { name: e.target.value })} /></div>
              <div><label className={label}>Selo preto na foto</label><input className={field} value={d.badge} maxLength={24} placeholder="Ex.: Zentara, Ultrafina…" onChange={(e) => update(d.id, { badge: e.target.value })} data-testid={`adm-selo-${d.index}`} /></div>
              <div><label className={label}>Frase de destaque</label><input className={field} value={d.tagline} maxLength={120} onChange={(e) => update(d.id, { tagline: e.target.value })} /></div>
              <div><label className={label}>Especificações (uma por linha)</label><textarea className={`${field} min-h-[110px]`} value={d.specs} onChange={(e) => update(d.id, { specs: e.target.value })} data-testid={`adm-specs-${d.index}`} /></div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className={label}>Preço promocional (R$)</label><input className={field} inputMode="decimal" placeholder="299,90" value={d.price} onChange={(e) => update(d.id, { price: e.target.value })} data-testid={`adm-preco-${d.index}`} /></div>
                <div><label className={label}>Preço antigo (R$)</label><input className={field} inputMode="decimal" placeholder="499,90" value={d.oldPrice} onChange={(e) => update(d.id, { oldPrice: e.target.value })} data-testid={`adm-antigo-${d.index}`} /></div>
              </div>
              <p className="text-xs text-slate-500">
                No site: {o ? <s className="text-slate-300">{formatBRL(o)}</s> : null} {p ? <b className="text-violet-300">{formatBRL(p)}</b> : "Consulte o valor"}
              </p>
            </section>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving} data-testid="zentara-salvar" className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-8 py-3 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60">
          {saving && <Loader2 size={16} className="animate-spin" />} Salvar alterações
        </button>
      </div>
    </div>
  );
}
