"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Download, Mail, MessageCircle, Check, Trash2, Send, AlertTriangle, BellRing } from "lucide-react";
import { adminRequest } from "@/lib/admin-fetch";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

interface Cart {
  id: string; token: string; name: string | null; email: string | null; phone: string | null;
  items: Array<{ name: string; quantity: number; priceInCents: number }>; item_count: number; subtotal_cents: number;
  status: string; contacted_at: string | null; recovery_email_sent_at: string | null; recovered_at: string | null;
  recovered_value_cents: number | null; last_activity_at: string; state: "active" | "abandoned" | "recovered" | "unsubscribed";
}
interface Settings { owner_emails: string; notify_paid: boolean; notify_new_order: boolean; recovery_enabled: boolean; recovery_delay_hours: number; recovery_coupon_code: string; customer_paid: boolean; customer_unpaid: boolean; customer_shipped: boolean }
interface Data {
  stats: { abandoned: number; abandoned_value_cents: number; recovered: number; recovered_value_cents: number; reachable: number };
  carts: Cart[]; settings: Settings; email_configured: boolean; cron_configured: boolean;
  email_log: Array<{ id: string; created_at: string; kind: string; to_email: string; status: string; error: string | null }>;
  error?: string;
}

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const ago = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (m < 60) return `há ${m} min`;
  if (m < 60 * 24) return `há ${Math.floor(m / 60)} h`;
  return `há ${Math.floor(m / 1440)} d`;
};
const KIND: Record<string, string> = { sale_paid: "Venda paga", new_order: "Novo pedido", recovery: "Recuperação", test: "Teste", customer_paid: "Cliente: compra confirmada", customer_unpaid: "Cliente: sem pagamento", customer_shipped: "Cliente: pedido pronto/enviado" };
const field = "w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none";

function Toggle({ on, onChange, label, testId }: { on: boolean; onChange: (v: boolean) => void; label: string; testId?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} data-testid={testId} onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-slate-600"}`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

export default function AdminRecuperacaoPage() {
  const [data, setData] = useState<Data | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [state, setState] = useState("abandoned");
  const [days, setDays] = useState("7");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState("");

  const load = useCallback(async (keepSettings = true) => {
    const r = await adminRequest<Data>(`/api/admin/recovery?state=${state}&days=${days}`);
    if (r.ok && r.data) {
      setData(r.data);
      if (r.data.error) setMsg({ type: "err", text: r.data.error });
      if (!keepSettings || !settings) setSettings(r.data.settings);
    } else setMsg({ type: "err", text: r.error || "Não foi possível carregar." });
  }, [state, days, settings]);
  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [state, days]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const waLink = (c: Cart) => {
    const first = (c.name || "").trim().split(/\s+/)[0];
    const names = c.items.slice(0, 2).map((i) => i.name).join(" e ");
    const coupon = settings?.recovery_coupon_code ? ` Use o cupom ${settings.recovery_coupon_code} para ganhar um desconto.` : "";
    const text = `Oi${first ? `, ${first}` : ""}! Aqui é da Ótica Ventara 👓 Vi que você separou ${names || "uns óculos"} e não finalizou. Posso te ajudar com alguma dúvida?${coupon} Seu carrinho continua salvo: ${origin}/?retomar=${c.token}`;
    return buildWhatsAppUrl(text, c.phone);
  };

  const act = async (id: string, action: string, ok: string) => {
    setBusy(id + action);
    const r = await adminRequest("/api/admin/recovery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
    setBusy("");
    setMsg(r.ok ? { type: "ok", text: ok } : { type: "err", text: r.data?.error || r.error || "Não foi possível concluir." });
    await load();
  };
  const markContacted = (c: Cart) => act(c.id, "contacted", "Marcado como contactado.");

  const remove = async (c: Cart) => {
    if (!window.confirm("Excluir este carrinho e os dados do cliente?")) return;
    await adminRequest(`/api/admin/recovery?id=${c.id}`, { method: "DELETE" });
    await load();
  };

  const saveSettings = async () => {
    if (!settings) return;
    setBusy("settings");
    const r = await adminRequest("/api/admin/recovery", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    setBusy("");
    setMsg(r.ok ? { type: "ok", text: "Configurações salvas." } : { type: "err", text: r.data?.error || r.error || "Não foi possível salvar." });
    if (r.ok) await load(false);
  };

  const [preview, setPreview] = useState<{ kind: string; subject: string; html: string } | null>(null);
  const openPreview = async (kind: string) => {
    const r = await adminRequest(`/api/admin/recovery?preview=${kind}`);
    if (r.ok && r.data?.html) setPreview({ kind, subject: r.data.subject, html: r.data.html });
    else setMsg({ type: "err", text: r.data?.error || r.error || "Não foi possível carregar a prévia." });
  };
  const testCustomer = async (kind: string) => {
    const to = (settings?.owner_emails || "").split(/[,;\s]+/)[0];
    setBusy("tc-" + kind);
    const r = await adminRequest("/api/admin/recovery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "test_customer", kind, to }) });
    setBusy("");
    setMsg(r.ok ? { type: "ok", text: `Exemplo enviado para ${to}.` } : { type: "err", text: r.data?.error || r.error || "Falha no teste." });
  };

  const testEmail = async () => {
    const to = (settings?.owner_emails || "").split(/[,;\s]+/)[0];
    setBusy("test");
    const r = await adminRequest("/api/admin/recovery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "test_email", to }) });
    setBusy("");
    setMsg(r.ok ? { type: "ok", text: `E-mail de teste enviado para ${to}.` } : { type: "err", text: r.data?.error || r.error || "Falha no teste." });
    await load();
  };

  const set = (p: Partial<Settings>) => setSettings((s) => (s ? { ...s, ...p } : s));
  const st = data?.stats;

  return (
    <div className="space-y-8 pb-10" data-testid="recuperacao-page">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl font-light tracking-tight text-white sm:text-3xl">Recuperação & <strong className="font-semibold text-amber-400">Avisos</strong></h1>
        <p className="mt-1 text-sm text-slate-400">Receba um e-mail a cada venda e traga de volta quem deixou itens no carrinho sem finalizar.</p>
      </div>

      {msg && <div role="status" className={`rounded-lg border p-3 text-sm ${msg.type === "ok" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-red-400/30 bg-red-400/10 text-red-200"}`}>{msg.text}</div>}

      {data && !data.email_configured && (
        <div data-testid="email-warning" className="flex gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div><b>O envio de e-mail ainda não está conectado.</b> Crie uma conta gratuita em resend.com, verifique o domínio e cadastre na Vercel as variáveis <code className="rounded bg-black/30 px-1">RESEND_API_KEY</code> e <code className="rounded bg-black/30 px-1">NOTIFY_FROM_EMAIL</code>. Enquanto isso, a lista de carrinhos e o botão de WhatsApp já funcionam.</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#061423] p-5"><div className="text-xs text-slate-400">Carrinhos abandonados</div><div className="mt-1 text-3xl font-semibold text-white" data-testid="stat-abandoned">{st?.abandoned ?? 0}</div></div>
        <div className="rounded-2xl border border-white/10 bg-[#061423] p-5"><div className="text-xs text-slate-400">Valor parado</div><div className="mt-1 text-3xl font-semibold text-white">{brl(st?.abandoned_value_cents ?? 0)}</div></div>
        <div className="rounded-2xl border border-white/10 bg-[#061423] p-5"><div className="text-xs text-slate-400">Recuperados</div><div className="mt-1 text-3xl font-semibold text-emerald-300">{st?.recovered ?? 0}</div></div>
        <div className="rounded-2xl border border-white/10 bg-[#061423] p-5"><div className="text-xs text-slate-400">Valor recuperado</div><div className="mt-1 text-3xl font-semibold text-emerald-300">{brl(st?.recovered_value_cents ?? 0)}</div></div>
      </div>

      {/* Lista */}
      <section className="rounded-2xl border border-white/10 bg-[#061423]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
          <div className="flex flex-wrap gap-2">
            {[["abandoned", "Abandonados"], ["recovered", "Recuperados"], ["all", "Todos"]].map(([k, l]) => (
              <button key={k} type="button" data-testid={`tab-${k}`} onClick={() => setState(k)} className={`rounded-full px-4 py-1.5 text-sm font-medium ${state === k ? "bg-amber-400 text-slate-950" : "bg-white/10 text-slate-200 hover:bg-white/15"}`}>{l}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select aria-label="Período" value={days} onChange={(e) => setDays(e.target.value)} className="rounded border border-white/15 bg-[#061423] px-2 py-1.5 text-sm text-slate-100">
              <option value="1">Últimas 24 h</option><option value="7">Últimos 7 dias</option><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option>
            </select>
            <a href={`/api/admin/recovery/export?days=${days === "1" ? 7 : days}`} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/5"><Download className="h-4 w-4" /> Exportar CSV</a>
          </div>
        </div>

        <ul className="divide-y divide-white/5" data-testid="cart-list">
          {(data?.carts || []).map((c) => (
            <li key={c.id} className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between" data-testid={`cart-${c.id}`}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">{c.name || "Sem nome"}</span>
                  <span className="text-xs text-slate-400">{ago(c.last_activity_at)}</span>
                  {c.state === "recovered" && <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-semibold text-emerald-300">Recuperado {c.recovered_value_cents ? brl(c.recovered_value_cents) : ""}</span>}
                  {c.state === "unsubscribed" && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-400">Sem lembretes</span>}
                  {c.recovery_email_sent_at && <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-xs text-sky-300">E-mail enviado</span>}
                  {c.contacted_at && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs text-amber-300">Contactado</span>}
                </div>
                <div className="mt-0.5 text-xs text-slate-400">{[c.phone, c.email].filter(Boolean).join(" · ")}</div>
                <div className="mt-1 text-sm text-slate-200">{c.items.map((i) => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join(", ") || "—"}</div>
                <div className="text-sm font-medium text-white">{brl(c.subtotal_cents)}</div>
              </div>
              {c.state !== "recovered" && c.state !== "unsubscribed" && (
                <div className="flex flex-wrap gap-2">
                  {c.phone && <a href={waLink(c)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp para ${c.name || "cliente"}`} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-400"><MessageCircle className="h-4 w-4" /> WhatsApp</a>}
                  {c.email && <button type="button" disabled={!data?.email_configured || busy === c.id + "send_recovery"} onClick={() => act(c.id, "send_recovery", "E-mail de recuperação enviado.")} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-40"><Mail className="h-4 w-4" /> Enviar e-mail</button>}
                  <button type="button" onClick={() => markContacted(c)} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"><Check className="h-4 w-4" /> Contactado</button>
                  <button type="button" aria-label="Excluir carrinho" onClick={() => remove(c)} className="rounded-lg border border-red-400/30 p-2 text-red-400 hover:bg-red-400/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              )}
            </li>
          ))}
          {data && data.carts.length === 0 && <li className="p-10 text-center text-slate-400">Nenhum carrinho nesta lista. Eles aparecem aqui depois que o cliente informa e-mail ou telefone e fica 1 hora sem comprar.</li>}
        </ul>
        <p className="border-t border-white/5 p-4 text-xs text-slate-500">Só guardamos o carrinho de quem aceitou os cookies de marketing e não clicou em “Não quero lembretes”. Os dados são apagados após 90 dias.</p>
      </section>

      {/* Configurações */}
      {settings && (
        <>
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#061423] p-5">
            <h2 className="flex items-center gap-2 !text-lg !font-semibold text-white"><BellRing className="h-5 w-5 text-amber-400" /> Avisos de venda</h2>
            <label className="block text-sm"><span className="text-slate-200">E-mails que recebem os avisos (separe por vírgula)</span>
              <input data-testid="owner-emails" className={`${field} mt-1`} placeholder="dono@oticasventara.com.br" value={settings.owner_emails} onChange={(e) => set({ owner_emails: e.target.value })} /></label>
            <div className="flex items-center justify-between text-sm text-slate-200"><span>Avisar quando uma venda for <b>paga</b></span><Toggle on={settings.notify_paid} onChange={(v) => set({ notify_paid: v })} label="Avisar venda paga" testId="toggle-paid" /></div>
            <div className="flex items-center justify-between text-sm text-slate-200"><span>Avisar também quando um pedido for <b>criado</b> (antes de pagar)</span><Toggle on={settings.notify_new_order} onChange={(v) => set({ notify_new_order: v })} label="Avisar novo pedido" testId="toggle-new" /></div>
            <button type="button" onClick={testEmail} disabled={busy === "test" || !settings.owner_emails.trim()} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-40"><Send className="h-4 w-4" /> {busy === "test" ? "Enviando…" : "Enviar e-mail de teste"}</button>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-[#061423] p-5">
            <h2 className="!text-lg !font-semibold text-white">E-mail automático de recuperação</h2>
            <div className="flex items-center justify-between text-sm text-slate-200"><span>Enviar 1 e-mail para quem abandonou o carrinho</span><Toggle on={settings.recovery_enabled} onChange={(v) => set({ recovery_enabled: v })} label="Recuperação automática" testId="toggle-recovery" /></div>
            <label className="block text-sm"><span className="text-slate-200">Esperar quantas horas depois do abandono</span>
              <select className={`${field} mt-1`} value={settings.recovery_delay_hours} onChange={(e) => set({ recovery_delay_hours: Number(e.target.value) })}>
                {[1, 2, 4, 8, 12, 24, 48].map((h) => <option key={h} value={h}>{h} {h === 1 ? "hora" : "horas"}</option>)}
              </select></label>
            <label className="block text-sm"><span className="text-slate-200">Cupom para oferecer (opcional)</span>
              <input className={`${field} mt-1 font-mono`} placeholder="ex.: VOLTA10 (crie em Cupons)" value={settings.recovery_coupon_code} onChange={(e) => set({ recovery_coupon_code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "") })} /></label>
            {data && !data.cron_configured && <p className="text-xs text-amber-300">Para o envio automático rodar sozinho, cadastre <code className="rounded bg-black/30 px-1">CRON_SECRET</code> na Vercel (qualquer texto longo e aleatório). Sem isso, use o botão “Enviar e-mail” em cada carrinho.</p>}
            <p className="text-xs text-slate-500">O envio automático roda 1 vez por dia, às 10h. Cada cliente recebe no máximo 1 lembrete e pode se descadastrar pelo link do e-mail.</p>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/10 bg-[#061423] p-5" data-testid="customer-emails">
          <h2 className="flex items-center gap-2 !text-lg !font-semibold text-white"><Mail className="h-5 w-5 text-amber-400" /> E-mails para o cliente</h2>
          <p className="text-sm text-slate-300">Mensagens automáticas enviadas ao comprador. Todas começam <b>desligadas</b>: veja a prévia, mande um exemplo para você e só então ligue.</p>
          {([
            ["paid", "customer_paid", "Compra confirmada", "Quando o pagamento é aprovado."],
            ["unpaid", "customer_unpaid", "Pedido sem pagamento", "Quando o pedido vence sem ser pago e é cancelado."],
            ["shipped", "customer_shipped", "Pedido pronto / despachado", "Quando você muda o status do pedido para enviado ou pronto para retirada."],
          ] as const).map(([kind, key, title, desc]) => (
            <div key={kind} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="min-w-0 text-sm text-slate-200"><b className="text-white">{title}</b><br /><span className="text-slate-400">{desc}</span></div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => openPreview(kind)} data-testid={`preview-${kind}`} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5">Ver prévia</button>
                <button type="button" onClick={() => testCustomer(kind)} disabled={!settings.owner_emails.trim() || busy === "tc-" + kind} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/5 disabled:opacity-40">{busy === "tc-" + kind ? "Enviando…" : "Enviar exemplo para mim"}</button>
                <Toggle on={settings[key]} onChange={(v) => set({ [key]: v } as Partial<Settings>)} label={title} testId={`toggle-customer-${kind}`} />
              </div>
            </div>
          ))}
          <p className="text-xs text-slate-400">Não esqueça de clicar em <b>Salvar</b> depois de ligar ou desligar. Cada cliente recebe cada e-mail no máximo uma vez por pedido.</p>
        </section>
        {preview && (
          <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4" onClick={() => setPreview(null)}>
            <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#061423]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm text-slate-200"><span><b>Assunto:</b> {preview.subject}</span><button type="button" onClick={() => setPreview(null)} className="text-slate-400 hover:text-white">Fechar</button></div>
              <iframe title="Prévia do e-mail" sandbox="" srcDoc={preview.html} className="h-[70vh] w-full bg-white" data-testid="preview-frame" />
            </div>
          </div>
        )}
        </>

      )}
      {settings && <div className="flex justify-end"><button type="button" data-testid="save-settings" onClick={saveSettings} disabled={busy === "settings"} className="rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-60">{busy === "settings" ? "Salvando…" : "Salvar configurações"}</button></div>}

      {data && data.email_log.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-[#061423] p-5">
          <h2 className="mb-3 !text-lg !font-semibold text-white">Últimos e-mails</h2>
          <ul className="divide-y divide-white/5 text-sm" data-testid="email-log">
            {data.email_log.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-slate-200">
                <span>{KIND[l.kind] || l.kind} → {l.to_email}</span>
                <span className="flex items-center gap-3 text-xs text-slate-400">{new Date(l.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  <span className={l.status === "sent" ? "text-emerald-300" : l.status === "failed" ? "text-red-400" : "text-slate-400"}>{l.status === "sent" ? "Enviado" : l.status === "failed" ? `Falha${l.error ? `: ${l.error}` : ""}` : "Não enviado"}</span></span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
