"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Save, Send, CheckCircle2, AlertTriangle, CircleOff, Info } from "lucide-react";
import { adminRequest } from "@/lib/admin-fetch";
import { TRACKING_EVENTS, AUDIT_PERIODS } from "@/lib/tracking/events";

interface Routing { meta: boolean; google: boolean; google_label: string }
interface Cfg {
  meta_pixel_id: string;
  meta_test_event_code: string;
  google_ads_id: string;
  google_ga4_id: string;
  meta_enabled: boolean;
  google_enabled: boolean;
  has_capi_token: boolean;
  capi_token_masked: string;
  events: Record<string, Routing>;
}
interface Row {
  id: string; created_at: string; event_key: string; destination: "meta" | "google";
  source: "browser" | "server"; status: "sent" | "failed" | "skipped"; event_id: string | null;
  value_in_cents: number | null; path: string | null; http_status: number | null; error: string | null;
}
interface Audit {
  summary: Record<string, { meta: { sent: number; failed: number }; google: { sent: number; failed: number }; last_at: string | null }>;
  totals: { sent: number; failed: number; skipped: number };
  rows: Row[];
  total_rows: number;
}

const labelOf = (k: string) => (k === "test" ? "Teste de conexão" : TRACKING_EVENTS.find((e) => e.key === k)?.label || k);
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });

function Toggle({ on, onChange, label, testId }: { on: boolean; onChange: (v: boolean) => void; label: string; testId?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      data-testid={testId}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-slate-600"}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

export default function AdminMarketingPage() {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [saved, setSaved] = useState<string>("");
  const [token, setToken] = useState("");
  const [clearToken, setClearToken] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [period, setPeriod] = useState("1h");
  const [fEvent, setFEvent] = useState("");
  const [fDest, setFDest] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [audit, setAudit] = useState<Audit | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);

  const snapshot = (c: Cfg | null, t: string, clr: boolean) => JSON.stringify([c, t, clr]);

  const loadConfig = useCallback(async () => {
    const r = await adminRequest<Cfg>("/api/admin/tracking/config");
    if (r.ok && r.data) {
      setCfg(r.data);
      setSaved(snapshot(r.data, "", false));
      setToken("");
      setClearToken(false);
    } else setMsg({ type: "err", text: r.error || "Não foi possível carregar a configuração." });
  }, []);

  const loadAudit = useCallback(async () => {
    setAuditLoading(true);
    const qs = new URLSearchParams({ period });
    if (fEvent) qs.set("event", fEvent);
    if (fDest) qs.set("destination", fDest);
    if (fStatus) qs.set("status", fStatus);
    const r = await adminRequest<Audit>(`/api/admin/tracking/events?${qs}`);
    if (r.ok && r.data) setAudit(r.data);
    setAuditLoading(false);
  }, [period, fEvent, fDest, fStatus]);

  useEffect(() => { void loadConfig(); }, [loadConfig]);
  useEffect(() => {
    void loadAudit();
    const t = setInterval(() => void loadAudit(), 30000);
    return () => clearInterval(t);
  }, [loadAudit]);

  const dirty = cfg ? snapshot(cfg, token, clearToken) !== saved : false;

  const metaConnected = !!cfg?.meta_pixel_id;
  const capiReady = metaConnected && (cfg?.has_capi_token || !!token) && !clearToken;
  const googleConnected = !!(cfg?.google_ads_id || cfg?.google_ga4_id);

  const setRoute = (key: string, patch: Partial<Routing>) =>
    setCfg((c) => (c ? { ...c, events: { ...c.events, [key]: { ...c.events[key], ...patch } } } : c));

  const save = async () => {
    if (!cfg) return;
    setSaving(true);
    setMsg(null);
    const r = await adminRequest("/api/admin/tracking/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cfg, meta_capi_token: token, clear_capi_token: clearToken }),
    });
    setSaving(false);
    if (r.ok) {
      setMsg({ type: "ok", text: "Salvo. As mudanças valem para os próximos visitantes em até 1 minuto. O histórico de eventos foi mantido." });
      await loadConfig();
    } else setMsg({ type: "err", text: r.data?.error || r.error || "Não foi possível salvar." });
  };

  const runTest = async () => {
    setTesting(true);
    setMsg(null);
    const r = await adminRequest<{ ok: boolean; error?: string; used_test_code?: boolean }>("/api/admin/tracking/test", { method: "POST" });
    setTesting(false);
    if (r.data?.ok) {
      setMsg({ type: "ok", text: r.data.used_test_code ? "Evento de teste enviado. Veja em Gerenciador de Eventos › Testar eventos." : "Evento enviado. Dica: informe o código de teste da Meta para ele aparecer na aba Testar eventos." });
    } else setMsg({ type: "err", text: r.data?.error || r.error || "A Meta recusou o teste." });
    void loadAudit();
  };

  const statusOf = useCallback(
    (key: string, dest: "meta" | "google") => {
      if (!cfg) return { tone: "off", text: "—" };
      const r = cfg.events[key];
      const destOn = dest === "meta" ? cfg.meta_enabled : cfg.google_enabled;
      const connected = dest === "meta" ? metaConnected : googleConnected;
      if (!r?.[dest]) return { tone: "off", text: "Desligado" };
      if (!destOn) return { tone: "warn", text: `${dest === "meta" ? "Meta" : "Google"} desativado` };
      if (!connected) return { tone: "warn", text: "Falta o ID" };
      return { tone: "on", text: "Enviando" };
    },
    [cfg, metaConnected, googleConnected]
  );

  const pill = (tone: string, text: string) => {
    const cls = tone === "on" ? "bg-emerald-400/15 text-emerald-300" : tone === "warn" ? "bg-amber-400/15 text-amber-300" : "bg-white/10 text-slate-400";
    const Icon = tone === "on" ? CheckCircle2 : tone === "warn" ? AlertTriangle : CircleOff;
    return (
      <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
        <Icon className="h-3 w-3" /> {text}
      </span>
    );
  };

  const eventOptions = useMemo(() => [...TRACKING_EVENTS.map((e) => ({ k: e.key as string, l: e.label })), { k: "test", l: "Teste de conexão" }], []);

  if (!cfg) return <div className="p-8 text-slate-400">{msg ? msg.text : "Carregando…"}</div>;

  const input = "w-full rounded-lg border border-white/15 px-3 py-2 text-sm bg-black/30 text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none";

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 pb-28 sm:p-8" data-testid="marketing-page">
      <header>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">Pixel Meta & <strong className="font-semibold text-amber-400">Google Ads</strong></h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure as conexões, escolha quais eventos cada plataforma recebe e acompanhe tudo o que foi enviado. Alterar aqui não apaga o histórico.
        </p>
      </header>

      {msg && (
        <div role="status" className={`rounded-lg border p-3 text-sm ${msg.type === "ok" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-red-400/30 bg-red-400/10 text-red-200"}`}>
          {msg.text}
        </div>
      )}

      {/* 1. Conexões */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#061423] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="!text-lg !font-semibold !leading-snug text-white">Meta (Pixel + API de Conversões)</h2>
            <div className="flex items-center gap-2 text-sm">
              {cfg.meta_enabled ? "Ativo" : "Desativado"}
              <Toggle on={cfg.meta_enabled} onChange={(v) => setCfg({ ...cfg, meta_enabled: v })} label="Ativar Meta" testId="toggle-meta" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="font-medium text-slate-200">ID do Pixel</span>
              <input data-testid="meta-pixel-id" className={input} inputMode="numeric" placeholder="ex.: 123456789012345" value={cfg.meta_pixel_id} onChange={(e) => setCfg({ ...cfg, meta_pixel_id: e.target.value.trim() })} />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-200">Token de acesso da API de Conversões</span>
              <input
                data-testid="meta-token"
                type="password"
                autoComplete="off"
                className={input}
                placeholder={cfg.has_capi_token && !clearToken ? `${cfg.capi_token_masked} (salvo — deixe vazio para manter)` : "Cole o token gerado no Gerenciador de Eventos"}
                value={token}
                onChange={(e) => { setToken(e.target.value); setClearToken(false); }}
              />
              {cfg.has_capi_token && (
                <button type="button" className="mt-1 text-xs text-red-400 underline" onClick={() => { setClearToken(true); setToken(""); }}>
                  {clearToken ? "O token será removido ao salvar" : "Remover token salvo"}
                </button>
              )}
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-200">Código de teste (opcional)</span>
              <input className={input} placeholder="ex.: TEST12345" value={cfg.meta_test_event_code} onChange={(e) => setCfg({ ...cfg, meta_test_event_code: e.target.value.trim() })} />
              <span className="text-xs text-slate-400">Usado só no botão “Enviar evento de teste”. Eventos reais nunca usam este código.</span>
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={runTest} disabled={testing || dirty || !capiReady} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:opacity-50">
                <Send className="h-4 w-4" /> {testing ? "Enviando…" : "Enviar evento de teste"}
              </button>
              {dirty && <span className="text-xs text-slate-400">Salve antes de testar.</span>}
            </div>
            <p className="text-xs text-slate-400 flex gap-1"><Info className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span> Com o token, cada evento também vai pelo servidor (mais confiável contra bloqueadores) e a Meta remove duplicados pelo mesmo ID.</span></p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#061423] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="!text-lg !font-semibold !leading-snug text-white">Google Ads / GA4</h2>
            <div className="flex items-center gap-2 text-sm">
              {cfg.google_enabled ? "Ativo" : "Desativado"}
              <Toggle on={cfg.google_enabled} onChange={(v) => setCfg({ ...cfg, google_enabled: v })} label="Ativar Google" testId="toggle-google" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="font-medium text-slate-200">ID do Google Ads</span>
              <input data-testid="google-ads-id" className={input} placeholder="AW-1234567890" value={cfg.google_ads_id} onChange={(e) => setCfg({ ...cfg, google_ads_id: e.target.value.trim().toUpperCase() })} />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-200">ID do Google Analytics 4 (opcional)</span>
              <input className={input} placeholder="G-XXXXXXXXXX" value={cfg.google_ga4_id} onChange={(e) => setCfg({ ...cfg, google_ga4_id: e.target.value.trim().toUpperCase() })} />
            </label>
            <p className="text-xs text-slate-400 flex gap-1"><Info className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span> Para contar como conversão no Google Ads, informe o <b>rótulo da conversão</b> do evento na tabela abaixo (Google Ads › Metas › Conversões › Configuração da tag). O Google é enviado só pelo navegador do visitante.</span></p>
          </div>
        </div>
      </section>

      {/* 2. Matriz de eventos */}
      <section className="rounded-xl border border-white/10 bg-[#061423] shadow-sm">
        <div className="border-b border-white/10 p-5">
          <h2 className="!text-lg !font-semibold !leading-snug text-white">Eventos enviados</h2>
          <p className="text-sm text-slate-400">Ligue ou desligue cada evento por plataforma. A coluna “{AUDIT_PERIODS[period].label}” mostra quantos foram realmente enviados.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm" data-testid="events-matrix">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Evento</th>
                <th className="px-3 py-3">Meta</th>
                <th className="px-3 py-3">Google</th>
                <th className="px-3 py-3">Rótulo Google Ads</th>
                <th className="px-5 py-3 text-right">{AUDIT_PERIODS[period].label}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {TRACKING_EVENTS.map((ev) => {
                const r = cfg.events[ev.key];
                const sm = statusOf(ev.key, "meta");
                const sg = statusOf(ev.key, "google");
                const a = audit?.summary[ev.key];
                return (
                  <tr key={ev.key} data-testid={`event-row-${ev.key}`}>
                    <td className="px-5 py-3">
                      <div className="font-medium text-white">{ev.label}</div>
                      <div className="text-xs text-slate-400">{ev.description}{ev.serverSide ? " Enviado também pelo servidor." : ""}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Toggle on={r.meta} onChange={(v) => setRoute(ev.key, { meta: v })} label={`${ev.label} no Meta`} testId={`toggle-${ev.key}-meta`} />
                        {pill(sm.tone, sm.text)}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Toggle on={r.google} onChange={(v) => setRoute(ev.key, { google: v })} label={`${ev.label} no Google`} testId={`toggle-${ev.key}-google`} />
                        {pill(sg.tone, sg.text)}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {ev.googleConversion ? (
                        <input className="w-36 rounded border border-white/15 bg-black/30 px-2 py-1 text-xs text-white placeholder:text-slate-500" placeholder="AbC-dEfGhIj" value={r.google_label} onChange={(e) => setRoute(ev.key, { google_label: e.target.value })} />
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-xs">
                      <div>Meta: <b>{a?.meta.sent ?? 0}</b>{a?.meta.failed ? <span className="text-red-400"> · {a.meta.failed} falhas</span> : null}</div>
                      <div>Google: <b>{a?.google.sent ?? 0}</b></div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-white/5 p-4 text-xs text-slate-400">
          Os eventos só são enviados para visitantes que aceitaram os cookies de marketing (LGPD). “Compra aprovada” é confirmada pelo Mercado Pago e enviada pelo servidor, sem depender de o cliente voltar ao site.
        </p>
      </section>

      {/* 3. Auditoria */}
      <section className="rounded-xl border border-white/10 bg-[#061423] shadow-sm" data-testid="audit-section">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
          <div>
            <h2 className="!text-lg !font-semibold !leading-snug text-white">Auditoria de eventos</h2>
            <p className="text-sm text-slate-400">“Navegador” = disparado no site do visitante (não há confirmação de recebimento). “Servidor” = resposta real da Meta.</p>
          </div>
          <button type="button" onClick={() => void loadAudit()} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-slate-200 hover:bg-white/5">
            <RefreshCw className={`h-4 w-4 ${auditLoading ? "animate-spin" : ""}`} /> Atualizar
          </button>
        </div>
        <div className="flex flex-wrap gap-2 p-5 pb-0">
          {Object.entries(AUDIT_PERIODS).map(([k, v]) => (
            <button key={k} type="button" data-testid={`period-${k}`} onClick={() => setPeriod(k)} className={`rounded-full px-4 py-1.5 text-sm font-medium ${period === k ? "bg-amber-400 text-slate-950" : "bg-white/10 text-slate-200 hover:bg-white/15"}`}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3 p-5">
          <div className="rounded-lg bg-emerald-400/10 p-3"><div className="text-xs text-emerald-300">Enviados</div><div className="text-2xl font-bold text-emerald-200">{audit?.totals.sent ?? 0}</div></div>
          <div className="rounded-lg bg-red-400/10 p-3"><div className="text-xs text-red-300">Com falha</div><div className="text-2xl font-bold text-red-200">{audit?.totals.failed ?? 0}</div></div>
          <div className="rounded-lg bg-white/5 p-3"><div className="text-xs text-slate-400">Ignorados</div><div className="text-2xl font-bold text-slate-100">{audit?.totals.skipped ?? 0}</div></div>
        </div>
        <div className="flex flex-wrap gap-3 px-5 pb-4 text-sm">
          <select aria-label="Filtrar evento" className="rounded border border-white/15 bg-[#061423] px-2 py-1.5 text-slate-100" value={fEvent} onChange={(e) => setFEvent(e.target.value)}>
            <option value="">Todos os eventos</option>
            {eventOptions.map((o) => <option key={o.k} value={o.k}>{o.l}</option>)}
          </select>
          <select aria-label="Filtrar destino" className="rounded border border-white/15 bg-[#061423] px-2 py-1.5 text-slate-100" value={fDest} onChange={(e) => setFDest(e.target.value)}>
            <option value="">Meta e Google</option><option value="meta">Meta</option><option value="google">Google</option>
          </select>
          <select aria-label="Filtrar status" className="rounded border border-white/15 bg-[#061423] px-2 py-1.5 text-slate-100" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="">Todos os status</option><option value="sent">Enviado</option><option value="failed">Falha</option><option value="skipped">Ignorado</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm" data-testid="audit-table">
            <thead className="bg-white/5 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="px-5 py-2">Quando</th><th className="px-3 py-2">Evento</th><th className="px-3 py-2">Destino</th><th className="px-3 py-2">Origem</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Valor</th><th className="px-5 py-2">Página / detalhe</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(audit?.rows || []).map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap px-5 py-2 text-slate-400">{fmtTime(r.created_at)}</td>
                  <td className="px-3 py-2 font-medium">{labelOf(r.event_key)}</td>
                  <td className="px-3 py-2">{r.destination === "meta" ? "Meta" : "Google"}</td>
                  <td className="px-3 py-2">{r.source === "server" ? "Servidor" : "Navegador"}</td>
                  <td className="px-3 py-2">{pill(r.status === "sent" ? "on" : r.status === "failed" ? "warn" : "off", r.status === "sent" ? "Enviado" : r.status === "failed" ? "Falha" : "Ignorado")}</td>
                  <td className="px-3 py-2">{r.value_in_cents != null ? (r.value_in_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</td>
                  <td className="px-5 py-2 text-xs text-slate-400">{r.error ? <span className="text-red-400">{r.error}</span> : r.path || "—"}</td>
                </tr>
              ))}
              {audit && audit.rows.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Nenhum evento neste período. Navegue no site aceitando os cookies de marketing para gerar eventos.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {audit && audit.total_rows > audit.rows.length && (
          <p className="p-4 text-xs text-slate-400">Mostrando os {audit.rows.length} mais recentes de {audit.total_rows}. Os totais acima consideram todos. O histórico é guardado por 90 dias.</p>
        )}
      </section>

      {/* Barra de salvar */}
      <div className={`fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-[#061423]/95 p-3 backdrop-blur transition-transform ${dirty ? "translate-y-0" : "translate-y-full"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <span className="text-sm text-slate-200">Você tem alterações não salvas.</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => void loadConfig()} className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">Descartar</button>
            <button type="button" data-testid="save-tracking" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-60">
              <Save className="h-4 w-4" /> {saving ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
