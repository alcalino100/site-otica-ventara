"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  MousePointerClick,
  Eye,
  MessageCircle,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Globe,
  Smartphone,
  Monitor,
  ExternalLink,
  Tag,
  Share2,
} from "lucide-react";

interface AnalyticsData {
  summary: {
    total_pageviews: number;
    total_utm_visits: number;
    total_whatsapp_clicks: number;
    total_cart_adds: number;
  };
  campaigns: Record<
    string,
    {
      source: string;
      medium: string;
      content?: string;
      clicks?: number;
      landing_page_views: number;
      whatsapp_conversions?: number;
      last_visit_at?: string;
    }
  >;
  recent_visits: Array<{
    id: string;
    timestamp: string;
    path: string;
    referrer: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    device_type: "mobile" | "desktop" | "tablet";
  }>;
  updated_at?: string;
}

export default function AdminMetricasPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados do Gerador de Links UTM
  const [destUrl, setDestUrl] = useState("https://www.oticasventara.com.br");
  const [source, setSource] = useState("meta");
  const [medium, setMedium] = useState("cpc");
  const [campaign, setCampaign] = useState("promocao_outubro");
  const [content, setContent] = useState("criativo_1");
  const [copied, setCopied] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics/stats");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Monta a URL parametrizada do gerador
  const generatedUrl = `${destUrl}?utm_source=${encodeURIComponent(
    source.trim()
  )}&utm_medium=${encodeURIComponent(medium.trim())}&utm_campaign=${encodeURIComponent(
    campaign.trim()
  )}${content.trim() ? `&utm_content=${encodeURIComponent(content.trim())}` : ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const summary = data?.summary || {
    total_pageviews: 0,
    total_utm_visits: 0,
    total_whatsapp_clicks: 0,
    total_cart_adds: 0,
  };

  const conversionRate =
    summary.total_utm_visits > 0
      ? ((summary.total_whatsapp_clicks / summary.total_utm_visits) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-8">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
              <TrendingUp size={20} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
              Métricas & Análise de <strong className="font-semibold text-amber-400">UTMs</strong>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Acompanhe cliques de anúncios, visualizações de página de destino e gere links oficiais para criativos.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-amber-400" : ""} />
          <span>Atualizar Dados</span>
        </button>
      </div>

      {/* 4 Cards de Resumo Principal */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pageviews */}
        <div className="p-5 rounded-2xl bg-[#061423] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Visualizações</span>
            <Eye size={18} className="text-sky-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {summary.total_pageviews}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Total de páginas abertas</span>
        </div>

        {/* Visitas via Anúncios (UTMs) */}
        <div className="p-5 rounded-2xl bg-[#061423] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Tráfego Pago (UTM)</span>
            <MousePointerClick size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
            {summary.total_utm_visits}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Visitas com origem rastreada</span>
        </div>

        {/* Cliques WhatsApp */}
        <div className="p-5 rounded-2xl bg-[#061423] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Contatos WhatsApp</span>
            <MessageCircle size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
            {summary.total_whatsapp_clicks}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Leads gerados no WhatsApp</span>
        </div>

        {/* Taxa de Conversão */}
        <div className="p-5 rounded-2xl bg-[#061423] border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Conversão de Lead</span>
            <BarChart3 size={18} className="text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-white">
            {conversionRate}%
          </p>
          <span className="text-[11px] text-slate-400 mt-1">UTMs que iniciaram contato</span>
        </div>
      </div>

      {/* GERADOR DE LINKS UTM (Ferramenta Integrada para Criativos) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#07192b] via-[#092238] to-[#07192b] border border-amber-400/30 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="p-1.5 rounded-lg bg-amber-400 text-slate-950">
            <Share2 size={16} />
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            Gerador de Links UTM para Criativos e Campanhas
          </h2>
        </div>
        <p className="text-xs text-slate-300 mb-6">
          Preencha os campos abaixo para gerar a URL exata para colocar no Gerenciador de Anúncios da Meta (Facebook/Instagram), Google ou links de influenciadores.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* URL de Destino */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              URL de Destino
            </label>
            <select
              value={destUrl}
              onChange={(e) => setDestUrl(e.target.value)}
              className="w-full bg-[#030c14] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="https://www.oticasventara.com.br">Página Inicial (Home)</option>
              <option value="https://www.oticasventara.com.br/#armacoes">Catálogo de Armações</option>
              <option value="https://www.oticasventara.com.br/#lentes">Tabela de Lentes</option>
              <option value="https://www.oticasventara.com.br/medicao-por-foto">Serviço: Medição de DNP por Foto</option>
              <option value="https://www.oticasventara.com.br/produto/ventara-essencial">Produto: Ventara Essencial (Grau)</option>
              <option value="https://www.oticasventara.com.br/produto/ventara-aurora">Produto: Ventara Aurora (Solar)</option>
              <option value="https://www.oticasventara.com.br/produto/ventara-urbano">Produto: Ventara Urbano (Grau)</option>
              <option value="https://www.oticasventara.com.br/produto/ventara-horizonte">Produto: Ventara Horizonte (Solar)</option>
              <option value="https://www.oticasventara.com.br/produto/ventara-kids-flex">Produto: Ventara Kids Flex (Infantil Grau)</option>
              <option value="https://www.oticasventara.com.br/produto/ventara-kids-solar">Produto: Ventara Kids Solar UV400 (Infantil Solar)</option>
            </select>
          </div>

          {/* Origem (utm_source) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Origem (utm_source)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Ex: meta, instagram, google"
                className="w-full bg-[#030c14] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {["meta", "instagram", "google", "whatsapp"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSource(tag)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Mídia (utm_medium) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Mídia (utm_medium)
            </label>
            <input
              type="text"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder="Ex: cpc, stories, feed, reels"
              className="w-full bg-[#030c14] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <div className="flex gap-1.5 mt-1.5">
              {["cpc", "stories", "feed", "reels", "bio"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setMedium(tag)}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Campanha & Criativo */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Campanha / Criativo
            </label>
            <div className="space-y-1.5">
              <input
                type="text"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                placeholder="Nome da Campanha (utm_campaign)"
                className="w-full bg-[#030c14] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Identificador do Criativo (utm_content)"
                className="w-full bg-[#030c14] border border-white/15 rounded-xl px-3 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Link Formatado Pronto para Copiar */}
        <div className="p-4 rounded-2xl bg-[#030a11] border border-amber-400/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400 block mb-1">
              Link Gerado para Copiar e Colar no Anúncio:
            </span>
            <code className="text-xs font-mono text-emerald-400 break-all select-all block">
              {generatedUrl}
            </code>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-150 shrink-0 shadow-md cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={16} className="text-emerald-950 stroke-[3]" />
                <span>Link Copiado!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copiar Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabela de Campanhas Ativas */}
      <div className="rounded-3xl bg-[#061423] border border-white/10 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
          <span>Desempenho por Campanha</span>
          <span className="text-xs text-slate-400 font-normal">
            {Object.keys(data?.campaigns || {}).length} campanha(s) registrada(s)
          </span>
        </h2>

        {Object.keys(data?.campaigns || {}).length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Nenhuma campanha com UTM acessada ainda. Copie o link do gerador acima e teste no navegador!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Campanha</th>
                  <th className="pb-3 px-3">Origem / Mídia</th>
                  <th className="pb-3 px-3">Criativo</th>
                  <th className="pb-3 px-3 text-right">Páginas Vistas</th>
                  <th className="pb-3 px-3 text-right">Conversão WhatsApp</th>
                  <th className="pb-3 px-3 text-right">Último Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {Object.entries(data?.campaigns || {}).map(([key, camp]) => (
                  <tr key={key} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-white">
                      <span className="flex items-center gap-2">
                        <Tag size={13} className="text-amber-400" />
                        {key}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-amber-300 font-mono text-[11px]">
                        {camp.source} / {camp.medium}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {camp.content || "Padrão"}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                      {camp.landing_page_views}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {camp.whatsapp_conversions || 0}
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-400 text-[11px]">
                      {camp.last_visit_at
                        ? new Date(camp.last_visit_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recente"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feed de Acessos Recentes em Tempo Real */}
      <div className="rounded-3xl bg-[#061423] border border-white/10 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
          <span>Feed de Acessos Recentes</span>
          <span className="text-xs text-slate-400 font-normal">
            Últimas {data?.recent_visits?.length || 0} visitas registradas
          </span>
        </h2>

        {(!data?.recent_visits || data.recent_visits.length === 0) ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Nenhum acesso registrado nesta sessão ainda.
          </div>
        ) : (
          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto pr-2">
            {data.recent_visits.map((visit) => (
              <div
                key={visit.id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-lg bg-white/5 text-slate-400">
                    {visit.device_type === "mobile" ? (
                      <Smartphone size={14} className="text-amber-400" />
                    ) : (
                      <Monitor size={14} className="text-sky-400" />
                    )}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{visit.path}</span>
                      {visit.utm_campaign && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono">
                          {visit.utm_campaign}
                        </span>
                      )}
                      {visit.utm_source && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-300 font-mono">
                          {visit.utm_source}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Referência: {visit.referrer || "Acesso Direto"}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {new Date(visit.timestamp).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
