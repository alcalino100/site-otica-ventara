"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Plus, Copy, Check, Pause, Play, Trash2, History, Pencil, Wand2, X, ShieldCheck } from "lucide-react";
import { adminRequest } from "@/lib/admin-fetch";
import { generateCouponCode } from "@/lib/coupons";

type Status = "active" | "paused" | "scheduled" | "expired" | "exhausted";
interface Coupon {
  id: string; code: string; description: string | null;
  discount_type: "percentage" | "fixed"; discount_value: number;
  max_discount_cents: number | null; min_order_cents: number;
  starts_at: string | null; expires_at: string | null;
  max_uses_total: number | null; max_uses_per_customer: number; active: boolean;
  used: number; confirmed: number; discount_total_cents: number; status: Status;
}
interface Redemption { id: string; created_at: string; reference_code: string | null; customer_email: string; customer_phone: string; discount_in_cents: number; status: "reserved" | "confirmed" | "released" }

const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");
const toDateInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");
const endOfDay = (d: string) => (d ? new Date(`${d}T23:59:59`).toISOString() : null);
const startOfDay = (d: string) => (d ? new Date(`${d}T00:00:00`).toISOString() : null);

const STATUS: Record<Status, { text: string; cls: string }> = {
  active: { text: "Ativo", cls: "bg-emerald-400/15 text-emerald-300" },
  paused: { text: "Pausado", cls: "bg-white/10 text-slate-400" },
  scheduled: { text: "Agendado", cls: "bg-sky-400/15 text-sky-300" },
  expired: { text: "Expirado", cls: "bg-amber-400/15 text-amber-300" },
  exhausted: { text: "Esgotado", cls: "bg-amber-400/15 text-amber-300" },
};

interface FormState {
  id?: string; code: string; description: string; discount_type: "percentage" | "fixed"; discount_value: string;
  max_discount: string; min_order: string; starts_at: string; expires_at: string; max_uses_total: string; max_uses_per_customer: string;
}
const plus30 = () => new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
const emptyForm = (): FormState => ({ code: generateCouponCode(), description: "", discount_type: "percentage", discount_value: "10", max_discount: "", min_order: "", starts_at: "", expires_at: plus30(), max_uses_total: "", max_uses_per_customer: "1" });

const field = "w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none";

export default function AdminCuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [history, setHistory] = useState<{ coupon: Coupon; rows: Redemption[] } | null>(null);
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    const r = await adminRequest<{ coupons: Coupon[]; error?: string }>("/api/admin/coupons");
    setLoading(false);
    if (r.ok && r.data) {
      setCoupons(r.data.coupons || []);
      if (r.data.error) setMsg({ type: "err", text: r.data.error });
    } else setMsg({ type: "err", text: r.error || "Não foi possível carregar os cupons." });
  }, []);
  useEffect(() => { void load(); }, [load]);

  const openEdit = (c: Coupon) =>
    setForm({
      id: c.id, code: c.code, description: c.description || "", discount_type: c.discount_type, discount_value: String(c.discount_value),
      max_discount: c.max_discount_cents ? String(c.max_discount_cents / 100) : "", min_order: c.min_order_cents ? String(c.min_order_cents / 100) : "",
      starts_at: toDateInput(c.starts_at), expires_at: toDateInput(c.expires_at),
      max_uses_total: c.max_uses_total ? String(c.max_uses_total) : "", max_uses_per_customer: String(c.max_uses_per_customer),
    });

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setFormError("");
    const toCents = (v: string) => (v.trim() ? Math.round(Number(v.replace(",", ".")) * 100) : null);
    const payload = {
      id: form.id, code: form.code.trim().toUpperCase(), description: form.description,
      discount_type: form.discount_type, discount_value: Number(form.discount_value.replace(",", ".")),
      max_discount_cents: form.discount_type === "percentage" ? toCents(form.max_discount) : null,
      min_order_cents: toCents(form.min_order) ?? 0,
      starts_at: startOfDay(form.starts_at), expires_at: endOfDay(form.expires_at),
      max_uses_total: form.max_uses_total.trim() ? Number(form.max_uses_total) : null,
      max_uses_per_customer: Number(form.max_uses_per_customer || 1),
      active: true,
    };
    const r = await adminRequest("/api/admin/coupons", { method: form.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    if (r.ok) {
      setForm(null);
      setMsg({ type: "ok", text: form.id ? "Cupom atualizado." : "Cupom criado." });
      await load();
    } else setFormError(r.data?.error || r.error || "Não foi possível salvar.");
  };

  const toggle = async (c: Coupon) => {
    const r = await adminRequest("/api/admin/coupons", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id, active: !c.active }) });
    if (r.ok) { setMsg({ type: "ok", text: c.active ? `Cupom ${c.code} pausado. Ninguém mais consegue usar.` : `Cupom ${c.code} reativado.` }); await load(); }
    else setMsg({ type: "err", text: r.data?.error || r.error || "Não foi possível alterar." });
  };

  const remove = async (c: Coupon) => {
    if (!window.confirm(`Excluir o cupom ${c.code}? Esta ação não pode ser desfeita.`)) return;
    const r = await adminRequest(`/api/admin/coupons?id=${c.id}`, { method: "DELETE" });
    if (r.ok) { setMsg({ type: "ok", text: "Cupom excluído." }); await load(); }
    else setMsg({ type: "err", text: r.data?.error || r.error || "Não foi possível excluir." });
  };

  const openHistory = async (c: Coupon) => {
    const r = await adminRequest<{ rows: Redemption[] }>(`/api/admin/coupons?id=${c.id}&history=1`);
    setHistory({ coupon: c, rows: r.data?.rows || [] });
  };

  const copy = (code: string) => { void navigator.clipboard.writeText(code); setCopied(code); setTimeout(() => setCopied(""), 1500); };

  const active = coupons.filter((c) => c.status === "active").length;
  const confirmed = coupons.reduce((n, c) => n + c.confirmed, 0);
  const discountTotal = coupons.reduce((n, c) => n + c.discount_total_cents, 0);

  const set = (patch: Partial<FormState>) => setForm((f) => (f ? { ...f, ...patch } : f));

  return (
    <div className="space-y-8 pb-10" data-testid="cupons-page">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">Cupons de <strong className="font-semibold text-amber-400">Desconto</strong></h1>
          <p className="mt-1 text-sm text-slate-400">Crie cupons com limites para os clientes usarem no checkout. Cada uso é controlado: quantidade total, por cliente, validade e pedido mínimo.</p>
        </div>
        <button type="button" data-testid="new-coupon" onClick={() => { setFormError(""); setForm(emptyForm()); }} className="inline-flex items-center gap-2 self-start rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-300">
          <Plus className="h-4 w-4" /> Novo cupom
        </button>
      </div>

      {msg && <div role="status" className={`rounded-lg border p-3 text-sm ${msg.type === "ok" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-red-400/30 bg-red-400/10 text-red-200"}`}>{msg.text}</div>}

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#061423] p-5"><div className="text-xs text-slate-400">Cupons ativos</div><div className="mt-1 text-3xl font-semibold text-white">{active}</div></div>
        <div className="rounded-2xl border border-white/10 bg-[#061423] p-5"><div className="text-xs text-slate-400">Usos em compras pagas</div><div className="mt-1 text-3xl font-semibold text-white">{confirmed}</div></div>
        <div className="rounded-2xl border border-white/10 bg-[#061423] p-5"><div className="text-xs text-slate-400">Desconto concedido</div><div className="mt-1 text-3xl font-semibold text-white">{brl(discountTotal)}</div></div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#061423]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm" data-testid="coupons-table">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="px-5 py-3">Cupom</th><th className="px-3 py-3">Desconto</th><th className="px-3 py-3">Regras</th><th className="px-3 py-3">Validade</th><th className="px-3 py-3">Usos</th><th className="px-3 py-3">Status</th><th className="px-5 py-3 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {coupons.map((c) => (
                <tr key={c.id} data-testid={`coupon-row-${c.code}`}>
                  <td className="px-5 py-3">
                    <button type="button" onClick={() => copy(c.code)} className="inline-flex items-center gap-1.5 font-mono font-semibold text-white hover:text-amber-300" title="Copiar código">
                      {c.code} {copied === c.code ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                    </button>
                    {c.description && <div className="text-xs text-slate-400">{c.description}</div>}
                  </td>
                  <td className="px-3 py-3 font-medium text-white">{c.discount_type === "percentage" ? `${c.discount_value}%` : brl(c.discount_value * 100)}</td>
                  <td className="px-3 py-3 text-xs text-slate-300">
                    <div>{c.max_uses_per_customer === 1 ? "1 uso por cliente" : `${c.max_uses_per_customer} usos por cliente`}</div>
                    {c.min_order_cents > 0 && <div>Mínimo {brl(c.min_order_cents)}</div>}
                    {c.max_discount_cents && <div>Teto {brl(c.max_discount_cents)}</div>}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-300">{c.starts_at && <div>De {fmtDate(c.starts_at)}</div>}<div>{c.expires_at ? `Até ${fmtDate(c.expires_at)}` : "Sem prazo"}</div></td>
                  <td className="px-3 py-3 text-xs text-slate-300">
                    <div><b className="text-white">{c.used}</b>{c.max_uses_total ? ` / ${c.max_uses_total}` : " (sem limite)"}</div>
                    {c.max_uses_total ? <div className="mt-1 h-1.5 w-24 overflow-hidden rounded bg-white/10"><div className="h-full bg-amber-400" style={{ width: `${Math.min(100, (c.used / c.max_uses_total) * 100)}%` }} /></div> : null}
                  </td>
                  <td className="px-3 py-3"><span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS[c.status].cls}`}>{STATUS[c.status].text}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" aria-label={`Histórico de ${c.code}`} title="Histórico de usos" onClick={() => openHistory(c)} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5"><History className="h-4 w-4" /></button>
                      <button type="button" aria-label={`Editar ${c.code}`} title="Editar" onClick={() => { setFormError(""); openEdit(c); }} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5"><Pencil className="h-4 w-4" /></button>
                      <button type="button" aria-label={c.active ? `Pausar ${c.code}` : `Reativar ${c.code}`} title={c.active ? "Pausar" : "Reativar"} onClick={() => toggle(c)} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/5">{c.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
                      {c.used === 0 && <button type="button" aria-label={`Excluir ${c.code}`} title="Excluir" onClick={() => remove(c)} className="rounded-lg border border-red-400/30 p-2 text-red-400 hover:bg-red-400/10"><Trash2 className="h-4 w-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && coupons.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">Nenhum cupom ainda. Clique em “Novo cupom”.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <p className="flex items-start gap-2 text-xs text-slate-400"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /> Cada pedido reserva o uso do cupom. Se o pedido for cancelado ou o prazo de pagamento vencer, o uso volta automaticamente. Para parar um cupom na hora, use Pausar: o histórico é mantido.</p>

      {/* Formulário */}
      {form && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={form.id ? "Editar cupom" : "Novo cupom"}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-white/10 bg-[#061423] p-6 sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="!text-lg !font-semibold text-white">{form.id ? `Editar ${form.code}` : "Novo cupom"}</h2>
              <button type="button" aria-label="Fechar" onClick={() => setForm(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm sm:col-span-2"><span className="text-slate-200">Código que o cliente digita</span>
                <div className="mt-1 flex gap-2">
                  <input data-testid="f-code" className={`${field} font-mono`} value={form.code} disabled={!!form.id} onChange={(e) => set({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "") })} />
                  {!form.id && <button type="button" onClick={() => set({ code: generateCouponCode() })} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-sm text-slate-200 hover:bg-white/5"><Wand2 className="h-4 w-4" /> Gerar</button>}
                </div>
                <span className="text-xs text-slate-500">4 a 24 caracteres: letras, números e hífen. Código fácil de adivinhar (ex.: DESCONTO10) pode ser usado por qualquer um; use limites.</span>
              </label>
              <label className="text-sm sm:col-span-2"><span className="text-slate-200">Descrição interna (só você vê)</span><input className={`${field} mt-1`} placeholder="ex.: Campanha Black Friday" value={form.description} onChange={(e) => set({ description: e.target.value })} /></label>
              <label className="text-sm"><span className="text-slate-200">Tipo de desconto</span>
                <select data-testid="f-type" className={`${field} mt-1`} value={form.discount_type} onChange={(e) => set({ discount_type: e.target.value as "percentage" | "fixed" })}><option value="percentage">Porcentagem (%)</option><option value="fixed">Valor fixo (R$)</option></select></label>
              <label className="text-sm"><span className="text-slate-200">{form.discount_type === "percentage" ? "Porcentagem de desconto" : "Valor do desconto (R$)"}</span><input data-testid="f-value" inputMode="decimal" className={`${field} mt-1`} value={form.discount_value} onChange={(e) => set({ discount_value: e.target.value })} /></label>
              {form.discount_type === "percentage" && <label className="text-sm"><span className="text-slate-200">Teto do desconto em R$ (opcional)</span><input inputMode="decimal" className={`${field} mt-1`} placeholder="ex.: 150" value={form.max_discount} onChange={(e) => set({ max_discount: e.target.value })} /></label>}
              <label className="text-sm"><span className="text-slate-200">Pedido mínimo em R$ (opcional)</span><input inputMode="decimal" className={`${field} mt-1`} placeholder="ex.: 300" value={form.min_order} onChange={(e) => set({ min_order: e.target.value })} /></label>
              <label className="text-sm"><span className="text-slate-200">Começa em (opcional)</span><input type="date" className={`${field} mt-1`} value={form.starts_at} onChange={(e) => set({ starts_at: e.target.value })} /></label>
              <label className="text-sm"><span className="text-slate-200">Vale até</span><input data-testid="f-expires" type="date" className={`${field} mt-1`} value={form.expires_at} onChange={(e) => set({ expires_at: e.target.value })} /></label>
              <label className="text-sm"><span className="text-slate-200">Limite total de usos</span><input data-testid="f-total" inputMode="numeric" className={`${field} mt-1`} placeholder="vazio = sem limite" value={form.max_uses_total} onChange={(e) => set({ max_uses_total: e.target.value.replace(/\D/g, "") })} /></label>
              <label className="text-sm"><span className="text-slate-200">Usos por cliente</span><input inputMode="numeric" className={`${field} mt-1`} value={form.max_uses_per_customer} onChange={(e) => set({ max_uses_per_customer: e.target.value.replace(/\D/g, "") })} /><span className="text-xs text-slate-500">O mesmo e-mail, telefone ou CPF conta como a mesma pessoa.</span></label>
            </div>
            <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/5 p-3 text-xs text-amber-200">Segurança: todo cupom precisa de <b>validade</b> ou de <b>limite total de usos</b>. Não é possível criar cupom sem nenhum limite.</p>
            {formError && <div role="alert" data-testid="form-error" className="mt-3 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{formError}</div>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setForm(null)} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">Cancelar</button>
              <button type="button" data-testid="save-coupon" onClick={save} disabled={saving} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-60">{saving ? "Salvando…" : "Salvar cupom"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Histórico */}
      {history && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/70 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Histórico de usos">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-white/10 bg-[#061423] p-6 sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="!text-lg !font-semibold text-white">Usos de {history.coupon.code}</h2>
              <button type="button" aria-label="Fechar" onClick={() => setHistory(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10"><X className="h-5 w-5" /></button>
            </div>
            <table className="w-full text-sm" data-testid="history-table">
              <thead className="text-left text-xs uppercase text-slate-400"><tr><th className="py-2">Quando</th><th>Pedido</th><th>Cliente</th><th>Desconto</th><th>Situação</th></tr></thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {history.rows.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 text-xs">{new Date(r.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="font-mono text-xs">{r.reference_code || "—"}</td>
                    <td className="text-xs">{r.customer_email || r.customer_phone || "—"}</td>
                    <td>{brl(r.discount_in_cents)}</td>
                    <td className="text-xs">{r.status === "confirmed" ? "Compra paga" : r.status === "reserved" ? "Aguardando pagamento" : "Devolvido"}</td>
                  </tr>
                ))}
                {history.rows.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-400">Nenhum uso ainda.</td></tr>}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-slate-500">E-mails e telefones aparecem mascarados por privacidade.</p>
          </div>
        </div>
      )}
    </div>
  );
}
