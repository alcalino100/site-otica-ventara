"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Save,
  Send,
  Eye,
  Check,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Smartphone,
  Monitor,
  HelpCircle,
  FileText,
  Palette,
  ShieldCheck,
  Gift,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import {
  PromotionCampaignConfig,
  DEFAULT_PROMOTION_CONFIG,
  WheelSegment,
  PromotionParticipation,
  PromotionMetricsSummary,
  CouponStatus,
} from "@/types/promotion-wheel";
import { PromotionWheelModal } from "@/components/promotions/promotion-wheel-modal";

export default function AdminPromotionWheelPage() {
  const [activeTab, setActiveTab] = useState<
    "campanha" | "beneficios" | "aparencia" | "formulario" | "exibicao" | "participacoes"
  >("campanha");

  const [publishedConfig, setPublishedConfig] = useState<PromotionCampaignConfig>(DEFAULT_PROMOTION_CONFIG);
  const [draftConfig, setDraftConfig] = useState<PromotionCampaignConfig>(DEFAULT_PROMOTION_CONFIG);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Estados da aba Participações
  const [participations, setParticipations] = useState<PromotionParticipation[]>([]);
  const [metrics, setMetrics] = useState<PromotionMetricsSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CouponStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [redeemCode, setRedeemCode] = useState("");
  const [operatorName, setOperatorName] = useState("Gustavo Cordeiro (Técnico)");
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Estados da Prévia ao Vivo
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Carrega configurações do servidor
  useEffect(() => {
    async function loadAdminData() {
      setIsLoading(true);
      try {
        const [configRes, partRes] = await Promise.all([
          fetch("/api/admin/promotions/wheel"),
          fetch("/api/admin/promotions/wheel/participations"),
        ]);

        if (configRes.ok) {
          const data = await configRes.json();
          if (data.published) setPublishedConfig(data.published);
          if (data.draft) setDraftConfig(data.draft);
          if (data.revisions) setRevisions(data.revisions);
        }

        if (partRes.ok) {
          const partData = await partRes.json();
          setParticipations(partData.items || []);
          setMetrics(partData.metrics || null);
          setTotalPages(partData.totalPages || 1);
        }
      } catch (err) {
        console.error("Erro ao carregar dados do painel:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAdminData();
  }, []);

  const notify = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Salvar Rascunho
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/promotions/wheel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: draftConfig }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar rascunho.");
      notify("success", "Rascunho salvo com sucesso.");
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Publicar Campanha Oficial
  const handlePublish = async () => {
    // Validação de segurança antes de publicar
    if (draftConfig.distribution_mode === "WEIGHTED") {
      const totalWeight = draftConfig.segments.reduce((acc, s) => acc + (s.is_winner_eligible ? s.weight : 0), 0);
      if (totalWeight <= 0) {
        notify("error", "No modo PONDERADO, a soma dos pesos dos prêmios elegíveis deve ser maior que zero.");
        return;
      }
    }

    setIsPublishing(true);
    try {
      const res = await fetch("/api/admin/promotions/wheel/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: operatorName || "Administrador Ventara" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao publicar campanha.");

      setPublishedConfig(data.published);
      setDraftConfig(data.published);
      setIsPublishModalOpen(false);
      notify("success", "Campanha publicada e ativa no site público com sucesso!");
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  // Resgate manual de cupom no balcão da loja física
  const handleRedeemCoupon = async () => {
    if (!redeemCode.trim()) return;
    setIsRedeeming(true);
    try {
      const res = await fetch("/api/admin/promotions/wheel/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: redeemCode.trim(), operatorName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao resgatar cupom.");

      notify("success", data.message);
      setRedeemCode("");

      // Atualiza lista local de participações
      const partRes = await fetch("/api/admin/promotions/wheel/participations");
      if (partRes.ok) {
        const partData = await partRes.json();
        setParticipations(partData.items || []);
        setMetrics(partData.metrics || null);
      }
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setIsRedeeming(false);
    }
  };

  // Exportar Participações em CSV
  const handleExportCsv = () => {
    window.open("/api/admin/promotions/wheel/export", "_blank");
  };

  // Restaurar Configuração Padrão Ventara
  const handleResetToDefault = () => {
    if (confirm("Deseja realmente restaurar as cores e textos para a identidade oficial padrão da Óticas Ventara?")) {
      setDraftConfig({
        ...draftConfig,
        appearance: { ...DEFAULT_PROMOTION_CONFIG.appearance },
      });
      notify("success", "Identidade visual restaurada para o padrão oficial.");
    }
  };

  // Funções para gerenciar fatias da roleta (Benefícios)
  const handleAddSegment = () => {
    if (draftConfig.segments.length >= 12) {
      notify("error", "O limite máximo é de 12 fatias na roleta para garantir a legibilidade.");
      return;
    }
    const newId = `seg-${Date.now().toString(36)}`;
    const newSeg: WheelSegment = {
      id: newId,
      label: "10% OFF",
      sublabel: "Especial",
      is_winner_eligible: true,
      type: "percentage",
      value: 10,
      color: "#10283B",
      text_color: "#E8C765",
      weight: 10,
    };
    setDraftConfig({
      ...draftConfig,
      segments: [...draftConfig.segments, newSeg],
    });
  };

  const handleRemoveSegment = (index: number) => {
    if (draftConfig.segments.length <= 4) {
      notify("error", "A roleta precisa de no mínimo 4 fatias.");
      return;
    }
    const updated = [...draftConfig.segments];
    updated.splice(index, 1);
    setDraftConfig({ ...draftConfig, segments: updated });
  };

  const handleSegmentChange = (index: number, field: keyof WheelSegment, value: any) => {
    const updated = [...draftConfig.segments];
    updated[index] = { ...updated[index], [field]: value };
    setDraftConfig({ ...draftConfig, segments: updated });
  };

  // Cálculo das probabilidades no modo WEIGHTED
  const totalEligibleWeight = draftConfig.segments.reduce(
    (acc, s) => acc + (s.is_winner_eligible ? s.weight : 0),
    0
  );

  const hasUnsavedChanges = JSON.stringify(draftConfig) !== JSON.stringify(publishedConfig);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <RefreshCw size={32} className="animate-spin text-amber-400" />
        <p className="text-sm text-slate-400 font-medium">Carregando módulo promocional da Ótica Ventara...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* CABEÇALHO DO MÓDULO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Roleta Promocional &amp; Recuperação de Leads
                </h1>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    draftConfig.status === "active"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-amber-400/20 text-amber-300 border-amber-400/40"
                  }`}
                >
                  {draftConfig.status === "active" ? "Campanha Ativa" : "Desativada"}
                </span>
                {hasUnsavedChanges && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Alterações Não Salvas
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure a experiência de captura, regras de concessão transparente (10% garantido), gatilhos e cupons.
              </p>
            </div>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO DE TOPO */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-all cursor-pointer active:scale-95"
            title="Visualizar a roleta em modo demonstrativo"
          >
            <Eye size={14} className="text-amber-400" />
            <span>Prévia ao Vivo</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#091e33] hover:bg-[#0c2844] text-amber-300 text-xs font-bold border border-amber-400/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Salvar Rascunho</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPublishModalOpen(true)}
            disabled={isPublishing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isPublishing ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
            <span>Publicar Campanha</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK TOAST / ALERT */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            feedbackMessage.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/80 border-red-500/40 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
            <span className="font-medium">{feedbackMessage.text}</span>
          </div>
        </div>
      )}

      {/* NAVEGAÇÃO POR ABAS */}
      <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "campanha", label: "Campanha" },
          { id: "beneficios", label: "Benefícios & Fatias" },
          { id: "aparencia", label: "Aparência" },
          { id: "formulario", label: "Formulário & WhatsApp" },
          { id: "exibicao", label: "Gatilhos de Exibição" },
          { id: "participacoes", label: "Participações & Cupons" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-amber-400 text-slate-950 font-bold shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUNA PRINCIPAL: FORMULÁRIO DE EDIÇÃO */}
        <div className="lg:col-span-8 space-y-6">
          {/* ABA 1: CAMPANHA */}
          {activeTab === "campanha" && (
            <div className="p-6 rounded-3xl bg-[#06121C] border border-white/10 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-base font-bold text-white">Dados Gerais da Campanha</h2>
                <p className="text-xs text-slate-400">Identificação, período e regras de validade dos cupons.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Nome Interno da Campanha</label>
                  <input
                    type="text"
                    value={draftConfig.name}
                    onChange={(e) => setDraftConfig({ ...draftConfig, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Status Operacional</label>
                  <select
                    value={draftConfig.status}
                    onChange={(e) => setDraftConfig({ ...draftConfig, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#091a2e] border border-white/15 focus:border-amber-400 text-xs text-white outline-none"
                  >
                    <option value="active">Ativa no Site Público</option>
                    <option value="scheduled">Agendada por Data</option>
                    <option value="ended">Encerrada</option>
                    <option value="disabled">Desativada (Oculta)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Modo de Distribuição</label>
                  <select
                    value={draftConfig.distribution_mode}
                    onChange={(e) => setDraftConfig({ ...draftConfig, distribution_mode: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#091a2e] border border-white/15 focus:border-amber-400 text-xs text-white outline-none"
                  >
                    <option value="FIXED">FIXED (Benefício Garantido 10% · Recomendado)</option>
                    <option value="WEIGHTED">WEIGHTED (Probabilidades Ponderadas por Peso)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {draftConfig.distribution_mode === "FIXED"
                      ? "O visitante recebe 10% de desconto garantido, com segmentos decorativos alternados sem falsa promessa."
                      : "Modo avançado com prêmios e pesos calibrados pelo gestor."}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Validade do Cupom (Dias)</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={draftConfig.coupon_rules.validity_days}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        coupon_rules: {
                          ...draftConfig.coupon_rules,
                          validity_days: parseInt(e.target.value, 10) || 7,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <label className="text-xs font-semibold text-slate-300">Regulamento Resumido (Exibido no Cupom)</label>
                <textarea
                  rows={2}
                  value={draftConfig.coupon_rules.regulations_summary}
                  onChange={(e) =>
                    setDraftConfig({
                      ...draftConfig,
                      coupon_rules: {
                        ...draftConfig.coupon_rules,
                        regulations_summary: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-xs text-white outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* ABA 2: BENEFÍCIOS & FATIAS */}
          {activeTab === "beneficios" && (
            <div className="p-6 rounded-3xl bg-[#06121C] border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white">Editor de Fatias da Roleta</h2>
                  <p className="text-xs text-slate-400">
                    Configure de 4 a 12 fatias com transparência. No modo FIXED, prêmios vencedores garantem 10% OFF.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSegment}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Adicionar Fatia</span>
                </button>
              </div>

              {/* Lista de Segmentos */}
              <div className="space-y-3">
                {draftConfig.segments.map((seg, idx) => {
                  const probabilityPercent =
                    draftConfig.distribution_mode === "WEIGHTED" && totalEligibleWeight > 0 && seg.is_winner_eligible
                      ? ((seg.weight / totalEligibleWeight) * 100).toFixed(1)
                      : null;

                  return (
                    <div
                      key={seg.id || idx}
                      className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono font-bold text-amber-400">
                          {idx + 1}
                        </span>
                        <input
                          type="color"
                          value={seg.color}
                          onChange={(e) => handleSegmentChange(idx, "color", e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          title="Alterar cor da fatia"
                        />
                        <div>
                          <input
                            type="text"
                            value={seg.label}
                            onChange={(e) => handleSegmentChange(idx, "label", e.target.value)}
                            placeholder="Rótulo (ex: 10% OFF)"
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs font-bold text-white outline-none focus:border-amber-400"
                          />
                          <input
                            type="text"
                            value={seg.sublabel || ""}
                            onChange={(e) => handleSegmentChange(idx, "sublabel", e.target.value)}
                            placeholder="Subtítulo opcional"
                            className="ml-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-slate-300 outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={seg.is_winner_eligible}
                            onChange={(e) => handleSegmentChange(idx, "is_winner_eligible", e.target.checked)}
                            className="rounded border-white/20 bg-white/5 text-amber-400"
                          />
                          <span>Elegível para Ganho</span>
                        </label>

                        {draftConfig.distribution_mode === "WEIGHTED" && seg.is_winner_eligible && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-slate-400">Peso:</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={seg.weight}
                              onChange={(e) =>
                                handleSegmentChange(idx, "weight", parseInt(e.target.value, 10) || 1)
                              }
                              className="w-14 px-2 py-1 rounded bg-white/5 border border-white/15 text-xs font-mono text-amber-300"
                            />
                            {probabilityPercent && (
                              <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                                ({probabilityPercent}%)
                              </span>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveSegment(idx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remover fatia"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ABA 3: APARÊNCIA */}
          {activeTab === "aparencia" && (
            <div className="p-6 rounded-3xl bg-[#06121C] border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white">DNA Visual &amp; Cores</h2>
                  <p className="text-xs text-slate-400">Personalize a estética mantendo a identidade premium da ótica.</p>
                </div>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-400 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Restaurar Padrão Ventara</span>
                </button>
              </div>

              {/* Seletor de Cores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Fundo Modal</label>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                    <input
                      type="color"
                      value={draftConfig.appearance.bg_color}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          appearance: { ...draftConfig.appearance, bg_color: e.target.value },
                        })
                      }
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs text-slate-300">{draftConfig.appearance.bg_color}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Superfície Roleta</label>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                    <input
                      type="color"
                      value={draftConfig.appearance.surface_color}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          appearance: { ...draftConfig.appearance, surface_color: e.target.value },
                        })
                      }
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs text-slate-300">{draftConfig.appearance.surface_color}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Acento Dourado</label>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                    <input
                      type="color"
                      value={draftConfig.appearance.accent_color}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          appearance: {
                            ...draftConfig.appearance,
                            accent_color: e.target.value,
                            pointer_color: e.target.value,
                          },
                        })
                      }
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs text-slate-300">{draftConfig.appearance.accent_color}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Botão Principal</label>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                    <input
                      type="color"
                      value={draftConfig.appearance.button_bg}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          appearance: { ...draftConfig.appearance, button_bg: e.target.value },
                        })
                      }
                      className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs text-slate-300">{draftConfig.appearance.button_bg}</span>
                  </div>
                </div>
              </div>

              {/* Textos Principais */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Título Inicial</label>
                  <input
                    type="text"
                    value={draftConfig.appearance.title_text}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        appearance: { ...draftConfig.appearance, title_text: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Descrição do Formulário</label>
                  <input
                    type="text"
                    value={draftConfig.appearance.description_text}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        appearance: { ...draftConfig.appearance, description_text: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Texto do Botão CTA</label>
                  <input
                    type="text"
                    value={draftConfig.appearance.cta_button_text}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        appearance: { ...draftConfig.appearance, cta_button_text: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-xs text-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ABA 4: FORMULÁRIO & WHATSAPP */}
          {activeTab === "formulario" && (
            <div className="p-6 rounded-3xl bg-[#06121C] border border-white/10 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-base font-bold text-white">Configuração do Formulário &amp; Integração WhatsApp</h2>
                <p className="text-xs text-slate-400">
                  Rótulos, proteção de dados (LGPD) e mensagem do botão para finalizar o pedido com o Técnico Óptico.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Rótulo do Nome</label>
                  <input
                    type="text"
                    value={draftConfig.form.name_label}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        form: { ...draftConfig.form, name_label: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Rótulo do WhatsApp</label>
                  <input
                    type="text"
                    value={draftConfig.form.phone_label}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        form: { ...draftConfig.form, phone_label: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Explicação de Uso dos Dados (LGPD)</label>
                  <input
                    type="text"
                    value={draftConfig.form.phone_help}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        form: { ...draftConfig.form, phone_help: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Consentimento Opcional de Ofertas</label>
                  <input
                    type="text"
                    value={draftConfig.form.marketing_opt_in_label}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        form: { ...draftConfig.form, marketing_opt_in_label: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-xs text-white outline-none"
                  />
                  <p className="text-[11px] text-slate-400">Sempre desmarcado por padrão conforme diretrizes da LGPD.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Número Oficial WhatsApp da Loja</label>
                  <input
                    type="text"
                    value={draftConfig.form.whatsapp_number}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        form: { ...draftConfig.form, whatsapp_number: e.target.value },
                      })
                    }
                    placeholder="5518996155748"
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-xs text-white outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Link da Política de Privacidade</label>
                  <input
                    type="text"
                    value={draftConfig.form.privacy_policy_url}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        form: { ...draftConfig.form, privacy_policy_url: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">Mensagem Padrão do WhatsApp</label>
                  <textarea
                    rows={2}
                    value={draftConfig.form.whatsapp_default_message}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        form: { ...draftConfig.form, whatsapp_default_message: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-xs text-white outline-none resize-none font-mono text-[11px]"
                  />
                  <p className="text-[11px] text-slate-400">
                    Utilize a tag <code className="text-amber-400">{"{COUPON}"}</code> para ser substituída pelo código gerado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ABA 5: GATILHOS DE EXIBIÇÃO */}
          {activeTab === "exibicao" && (
            <div className="p-6 rounded-3xl bg-[#06121C] border border-white/10 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-base font-bold text-white">Gatilhos Comportamentais de Exibição</h2>
                <p className="text-xs text-slate-400">
                  Regras inteligentes para disparar a oferta sem incomodar o visitante.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-white">Ativar Campanha no Site</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Habilita ou suspende imediatamente a exibição do popup em todo o e-commerce.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftConfig.triggers.is_enabled}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        triggers: { ...draftConfig.triggers, is_enabled: e.target.checked },
                      })
                    }
                    className="w-5 h-5 rounded text-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Tempo Mínimo na Página</span>
                      <span className="text-xs font-mono text-amber-400">
                        {draftConfig.triggers.min_seconds_on_page}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="5"
                      value={draftConfig.triggers.min_seconds_on_page}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          triggers: {
                            ...draftConfig.triggers,
                            min_seconds_on_page: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-amber-400"
                    />
                    <p className="text-[11px] text-slate-400">
                      Conta apenas quando a aba estiver visível. Pausa ao trocar de janela.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Tempo de Inatividade</span>
                      <span className="text-xs font-mono text-amber-400">
                        {draftConfig.triggers.inactivity_seconds}s
                      </span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="180"
                      step="5"
                      value={draftConfig.triggers.inactivity_seconds}
                      onChange={(e) =>
                        setDraftConfig({
                          ...draftConfig,
                          triggers: {
                            ...draftConfig.triggers,
                            inactivity_seconds: parseInt(e.target.value, 10),
                          },
                        })
                      }
                      className="w-full accent-amber-400"
                    />
                    <p className="text-[11px] text-slate-400">
                      Dispara quando o visitante parar de rolar ou interagir com o catálogo.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-white">Intenção de Saída no Desktop (Exit-Intent)</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Detecta o cursor saindo pelo topo do navegador. <em>Aviso: Não se aplica a celulares.</em>
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftConfig.triggers.exit_intent_desktop}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        triggers: {
                          ...draftConfig.triggers,
                          exit_intent_desktop: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 rounded text-amber-400"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Intervalo após Fechamento (Cooldown)</span>
                    <span className="text-xs font-mono text-amber-400">
                      {draftConfig.triggers.cooldown_days_on_close} dias
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={draftConfig.triggers.cooldown_days_on_close}
                    onChange={(e) =>
                      setDraftConfig({
                        ...draftConfig,
                        triggers: {
                          ...draftConfig.triggers,
                          cooldown_days_on_close: parseInt(e.target.value, 10),
                        },
                      })
                    }
                    className="w-full accent-amber-400"
                  />
                  <p className="text-[11px] text-slate-400">
                    Se o visitante fechar a roleta sem girar, não exibe novamente pelo período selecionado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ABA 6: PARTICIPAÇÕES & CUPONS */}
          {activeTab === "participacoes" && (
            <div className="space-y-6">
              {/* Cards de Métricas em Tempo Real */}
              {metrics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-[#06121C] border border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Aberturas da Roleta
                    </span>
                    <p className="text-2xl font-bold font-mono text-white mt-1">{metrics.unique_opens}</p>
                    <span className="text-[10px] text-slate-500">Impressões: {metrics.total_impressions}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#06121C] border border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Leads Capturados
                    </span>
                    <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{metrics.valid_submissions}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold">{metrics.conversion_rate}% conversão</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#06121C] border border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Cupons Emitidos
                    </span>
                    <p className="text-2xl font-bold font-mono text-white mt-1">{metrics.coupons_issued}</p>
                    <span className="text-[10px] text-slate-400">100% autênticos</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#06121C] border border-white/10">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Cupons Resgatados
                    </span>
                    <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{metrics.coupons_used}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold">{metrics.redemption_rate}% resgate</span>
                  </div>
                </div>
              )}

              {/* Caixa de Validação / Resgate Rápido no Balcão */}
              <div className="p-5 rounded-2xl bg-[#091a2e] border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                    <ShieldCheck size={15} className="text-amber-400" />
                    <span>Validador de Cupons no Balcão da Loja Física</span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Digite o código apresentado pelo cliente no WhatsApp para aplicar o desconto de 10% e registrar o resgate.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Ex: VENTARA-10-8X9K2"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs font-mono font-bold text-amber-300 uppercase outline-none focus:border-amber-400 w-full sm:w-48"
                  />
                  <button
                    type="button"
                    onClick={handleRedeemCoupon}
                    disabled={isRedeeming || !redeemCode.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shrink-0 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isRedeeming ? "..." : "Resgatar"}
                  </button>
                </div>
              </div>

              {/* Tabela de Participações */}
              <div className="p-6 rounded-3xl bg-[#06121C] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou cupom..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                      title="Exportar dados para planilha Excel / CSV protegido contra fórmula injection"
                    >
                      <Download size={13} className="text-amber-400" />
                      <span>Exportar CSV</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-semibold">
                        <th className="py-2.5 px-3">Lead</th>
                        <th className="py-2.5 px-3">WhatsApp</th>
                        <th className="py-2.5 px-3">Benefício</th>
                        <th className="py-2.5 px-3">Código Cupom</th>
                        <th className="py-2.5 px-3">Data</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {participations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500">
                            Nenhuma participação registrada até o momento.
                          </td>
                        </tr>
                      ) : (
                        participations.map((p) => (
                          <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-3 font-medium text-white">{p.lead_name}</td>
                            <td className="py-3 px-3 font-mono text-slate-400">{p.lead_phone_masked}</td>
                            <td className="py-3 px-3 font-bold text-amber-400">{p.benefit_label}</td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-200">{p.coupon_code}</td>
                            <td className="py-3 px-3 text-slate-400 text-[11px]">
                              {new Date(p.created_at).toLocaleDateString("pt-BR")}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                  p.coupon_status === "used"
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                    : p.coupon_status === "issued"
                                    ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                                    : "bg-slate-500/20 text-slate-400 border-slate-500/40"
                                }`}
                              >
                                {p.coupon_status === "used"
                                  ? "Utilizado"
                                  : p.coupon_status === "issued"
                                  ? "Ativo"
                                  : p.coupon_status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLUNA LATERAL: PRÉVIA INTERATIVA AO VIVO */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          <div className="p-5 rounded-3xl bg-[#06121C] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={14} className="text-amber-400" />
                <span>Prévia ao Vivo</span>
              </span>
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-1 rounded ${previewDevice === "desktop" ? "bg-amber-400 text-slate-950" : "text-slate-400"}`}
                  title="Prévia Desktop"
                >
                  <Monitor size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-1 rounded ${previewDevice === "mobile" ? "bg-amber-400 text-slate-950" : "text-slate-400"}`}
                  title="Prévia Mobile"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            </div>

            {/* Simulação Visual do Card */}
            <div
              className={`p-4 rounded-2xl border transition-all text-center space-y-3 ${
                previewDevice === "mobile" ? "max-w-[280px] mx-auto text-xs" : ""
              }`}
              style={{
                backgroundColor: draftConfig.appearance.bg_color,
                borderColor: draftConfig.appearance.border_color,
                color: draftConfig.appearance.text_color,
              }}
            >
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                10% OFF Garantido
              </div>
              <h4 className="font-light text-sm text-white">{draftConfig.appearance.title_text}</h4>
              <p className="text-[11px] text-slate-400">{draftConfig.appearance.description_text}</p>
              <div
                className="py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md"
                style={{
                  backgroundColor: draftConfig.appearance.button_bg,
                  color: draftConfig.appearance.button_text,
                }}
              >
                {draftConfig.appearance.cta_button_text}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Abrir Janela de Demonstração</span>
              <ExternalLink size={13} />
            </button>
          </div>

          {/* Card com Informações de Versão & Auditoria */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px] block">
              Controle de Versão
            </span>
            <p className="text-white font-medium">
              Versão Publicada Atual: <strong className="text-amber-400 font-mono">v{publishedConfig.version}</strong>
            </p>
            <p className="text-slate-400 text-[11px]">
              Última publicação:{" "}
              {publishedConfig.published_at
                ? new Date(publishedConfig.published_at).toLocaleString("pt-BR")
                : "Versão inicial"}
            </p>
          </div>
        </div>
      </div>

      {/* MODAL DE PRÉVIA DEMONSTRATIVA */}
      {previewOpen && (
        <PromotionWheelModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          config={draftConfig}
          onCompleted={() => notify("success", "Giro demonstrativo concluído na prévia!")}
        />
      )}

      {/* MODAL DE CONFIRMAÇÃO DE PUBLICAÇÃO */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#06121C] border border-amber-400/40 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <Send size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Publicar Alterações no Site?</h3>
                <p className="text-xs text-slate-400">As novas regras entrarão em vigor para todos os visitantes.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs space-y-1.5">
              <p>
                • <strong>Versão a ser gerada:</strong> v{(publishedConfig.version || 1) + 1}
              </p>
              <p>
                • <strong>Modo:</strong> {draftConfig.distribution_mode}
              </p>
              <p>
                • <strong>Benefício:</strong> {draftConfig.fixed_benefit.label}
              </p>
              <p>
                • <strong>Fatias na roleta:</strong> {draftConfig.segments.length} segmentos
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md"
              >
                {isPublishing ? "Publicando..." : "Confirmar Publicação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
