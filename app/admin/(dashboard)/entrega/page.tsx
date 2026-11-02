"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  MapPin,
  CheckCircle2,
  Save,
  Store,
  Globe2,
  HelpCircle,
  Plus,
  Trash2,
  Eye,
  ExternalLink,
  Navigation,
  MoveUp,
  MoveDown,
  Layers,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SiteShippingSettings } from "@/types/ecommerce";
import {
  ShippingPageSettings,
  ShippingCarrier,
  ShippingFaqItem,
} from "@/types/shipping";
import {
  DEFAULT_SHIPPING_PAGE_SETTINGS,
  DEFAULT_SHIPPING_CARRIERS,
  DEFAULT_SHIPPING_FAQS,
} from "@/lib/shipping-constants";

export default function AdminShippingPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"page" | "carriers" | "faqs" | "checkout">("page");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Estado da Página Pública /entregas
  const [pageSettings, setPageSettings] = useState<ShippingPageSettings>(DEFAULT_SHIPPING_PAGE_SETTINGS);
  const [carriers, setCarriers] = useState<ShippingCarrier[]>(DEFAULT_SHIPPING_CARRIERS);
  const [faqs, setFaqs] = useState<ShippingFaqItem[]>(DEFAULT_SHIPPING_FAQS);

  // 2. Estado de Checkout / Retirada
  const defaultCheckoutShipping: SiteShippingSettings = {
    store_pickup_enabled: true,
    free_shipping_threshold_cents: 35000,
    default_shipping_fee_cents: 2500,
    pickup_address: "Rua Princesa Isabel, 221, Centro, Araçatuba-SP, CEP 16010-250",
  };
  const [checkoutSettings, setCheckoutSettings] = useState<SiteShippingSettings>(defaultCheckoutShipping);

  useEffect(() => {
    let isMounted = true;

    async function loadAllShippingData() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        // Busca dados da página pública
        const res = await fetch("/api/admin/shipping", { signal: controller.signal });
        if (res.ok && isMounted) {
          const json = await res.json();
          if (json.pageSettings) setPageSettings(json.pageSettings);
          if (json.carriers) setCarriers(json.carriers);
          if (json.faqs) setFaqs(json.faqs);
        }

        // Busca dados de checkout em settings
        const resSettings = await fetch("/api/admin/settings", { signal: controller.signal });
        clearTimeout(timeoutId);
        if (resSettings.ok && isMounted) {
          const jsonSettings = await resSettings.json();
          if (jsonSettings.shipping) {
            setCheckoutSettings((prev) => ({ ...prev, ...jsonSettings.shipping }));
          }
        }
      } catch (err) {
        console.warn("Usando configurações locais de entrega:", err);
      }
    }

    loadAllShippingData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Salvar dados da Página Pública (Configurações, Transportadoras e FAQs)
  const handleSavePublicPage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageSettings,
          carriers,
          faqs,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao salvar dados de envio.");
      }

      setFeedback("Página de Entregas atualizada com sucesso!");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFeedback(err.message || "Erro ao gravar dados.");
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Salvar dados de Checkout / Retirada Presencial
  const handleSaveCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping: checkoutSettings }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Erro ao gravar regras de checkout.");
      }

      setFeedback("Regras de frete e retirada presencial salvas com sucesso!");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFeedback(err.message || "Erro ao gravar dados.");
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Manipuladores de Transportadoras
  const addCarrier = () => {
    const newCarrier: ShippingCarrier = {
      id: `carrier-${Date.now()}`,
      name: "Nova Transportadora",
      slug: `transportadora-${Date.now()}`,
      description: "Descrição curta dos serviços logísticos e cobertura.",
      delivery_time: "De 2 a 5 dias úteis",
      logo_url: "/images/shipping/envio-brasil-azul-cargo.png",
      is_active: true,
      sort_order: carriers.length + 1,
    };
    setCarriers([...carriers, newCarrier]);
  };

  const removeCarrier = (index: number) => {
    setCarriers(carriers.filter((_, i) => i !== index));
  };

  const updateCarrier = (index: number, field: keyof ShippingCarrier, value: any) => {
    const updated = [...carriers];
    updated[index] = { ...updated[index], [field]: value };
    setCarriers(updated);
  };

  const moveCarrier = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= carriers.length) return;
    const updated = [...carriers];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setCarriers(updated.map((c, i) => ({ ...c, sort_order: i + 1 })));
  };

  // Manipuladores de FAQs
  const addFaq = () => {
    const newFaq: ShippingFaqItem = {
      id: `faq-${Date.now()}`,
      question: "Nova pergunta frequente sobre entrega?",
      answer: "Resposta detalhada explicando o funcionamento do envio.",
      category: "geral",
      is_active: true,
      sort_order: faqs.length + 1,
    };
    setFaqs([...faqs, newFaq]);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: keyof ShippingFaqItem, value: any) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const moveFaq = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;
    const updated = [...faqs];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setFaqs(updated.map((f, i) => ({ ...f, sort_order: i + 1 })));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-20 right-6 z-50 bg-amber-400 text-[#06111f] font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
            LOGÍSTICA & FULFILLMENT
          </span>
          <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
            Rede de Entregas e <span className="font-normal text-amber-400">Retirada Física</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie a página pública /entregas, frota de Araçatuba, transportadoras ativas, FAQ e regras de frete.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/entregas"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 hover:text-white hover:border-amber-400/40 transition-colors"
          >
            <Eye size={14} className="text-amber-400" />
            <span>Ver /entregas ao vivo</span>
            <ExternalLink size={12} className="text-slate-400" />
          </a>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("page")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "page"
              ? "bg-amber-400 text-[#06111f] shadow-lg shadow-amber-400/10 font-bold"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Globe2 size={15} />
          <span>Página /entregas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("carriers")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "carriers"
              ? "bg-amber-400 text-[#06111f] shadow-lg shadow-amber-400/10 font-bold"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Truck size={15} />
          <span>Transportadoras ({carriers.filter((c) => c.is_active).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("faqs")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "faqs"
              ? "bg-amber-400 text-[#06111f] shadow-lg shadow-amber-400/10 font-bold"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <HelpCircle size={15} />
          <span>Perguntas Frequentes ({faqs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("checkout")}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "checkout"
              ? "bg-amber-400 text-[#06111f] shadow-lg shadow-amber-400/10 font-bold"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Store size={15} />
          <span>Retirada & Frete Base</span>
        </button>
      </div>

      {/* ABA 1: CONFIGURAÇÕES DA PÁGINA PÚBLICA */}
      {activeTab === "page" && (
            <form onSubmit={handleSavePublicPage} className="space-y-6">
              {/* Bloco Geral & Publicação */}
              <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Globe2 size={16} className="text-amber-400" />
                    1. Visibilidade e Slug da Página
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-slate-300">Página Pública Ativa</span>
                    <input
                      type="checkbox"
                      checked={pageSettings.is_enabled}
                      onChange={(e) =>
                        setPageSettings({ ...pageSettings, is_enabled: e.target.checked })
                      }
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Slug da Rota</label>
                    <input
                      type="text"
                      value={pageSettings.slug}
                      onChange={(e) =>
                        setPageSettings({ ...pageSettings, slug: e.target.value })
                      }
                      className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                      placeholder="entregas"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Acessível em /entregas
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Título do Hero</label>
                    <input
                      type="text"
                      value={pageSettings.hero_title}
                      onChange={(e) =>
                        setPageSettings({ ...pageSettings, hero_title: e.target.value })
                      }
                      className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Subtítulo do Hero</label>
                    <input
                      type="text"
                      value={pageSettings.hero_subtitle}
                      onChange={(e) =>
                        setPageSettings({ ...pageSettings, hero_subtitle: e.target.value })
                      }
                      className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bloco Araçatuba e Região */}
              <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                  <Navigation size={16} className="text-amber-400" />
                  2. Bloco: Entrega Expressa em Araçatuba e Região
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Título do Bloco</label>
                      <input
                        type="text"
                        value={pageSettings.local_title}
                        onChange={(e) =>
                          setPageSettings({ ...pageSettings, local_title: e.target.value })
                        }
                        className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Imagem da Van Local</label>
                      <input
                        type="text"
                        value={pageSettings.local_image_url}
                        onChange={(e) =>
                          setPageSettings({ ...pageSettings, local_image_url: e.target.value })
                        }
                        className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Texto Institucional Regional</label>
                    <textarea
                      rows={3}
                      value={pageSettings.local_description}
                      onChange={(e) =>
                        setPageSettings({ ...pageSettings, local_description: e.target.value })
                      }
                      className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl p-3 text-white leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Cidades Atendidas (separadas por vírgula)</label>
                      <input
                        type="text"
                        value={pageSettings.local_cities}
                        onChange={(e) =>
                          setPageSettings({ ...pageSettings, local_cities: e.target.value })
                        }
                        className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Prazo Estimado</label>
                      <input
                        type="text"
                        value={pageSettings.local_timeframe}
                        onChange={(e) =>
                          setPageSettings({ ...pageSettings, local_timeframe: e.target.value })
                        }
                        className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Condições Especiais</label>
                      <input
                        type="text"
                        value={pageSettings.local_conditions}
                        onChange={(e) =>
                          setPageSettings({ ...pageSettings, local_conditions: e.target.value })
                        }
                        className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloco Envio Brasil */}
              <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                  <Truck size={16} className="text-amber-400" />
                  3. Bloco: Envio Seguro para Todo o Brasil
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 mb-1">Título do Bloco</label>
                      <input
                        type="text"
                        value={pageSettings.national_title}
                        onChange={(e) =>
                          setPageSettings({ ...pageSettings, national_title: e.target.value })
                        }
                        className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Imagem da Carga Expressa</label>
                      <input
                        type="text"
                        value={pageSettings.national_image_url}
                        onChange={(e) =>
                          setPageSettings({ ...pageSettings, national_image_url: e.target.value })
                        }
                        className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Texto Explicativo de Envio Nacional</label>
                    <textarea
                      rows={3}
                      value={pageSettings.national_description}
                      onChange={(e) =>
                        setPageSettings({ ...pageSettings, national_description: e.target.value })
                      }
                      className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl p-3 text-white leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Save size={16} />
                <span>{isSaving ? "Gravando no Banco..." : "Salvar Configurações da Página"}</span>
              </button>
            </form>
          )}

          {/* ABA 2: CRUD DE TRANSPORTADORAS */}
          {activeTab === "carriers" && (
            <form onSubmit={handleSavePublicPage} className="space-y-6">
              <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Truck size={16} className="text-amber-400" />
                      Transportadoras que Utilizamos
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Adicione e ordene as transportadoras exibidas na seção de parceiros logísticos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addCarrier}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 hover:bg-amber-400/25 text-xs font-semibold transition-all"
                  >
                    <Plus size={14} />
                    <span>Adicionar Transportadora</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {carriers.map((carrier, index) => (
                    <div
                      key={carrier.id || index}
                      className="p-4 rounded-xl bg-[#030913] border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            #{index + 1}
                          </span>
                          <span className="text-xs font-semibold text-white">{carrier.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400 mr-2">
                            <span>Ativa</span>
                            <input
                              type="checkbox"
                              checked={carrier.is_active}
                              onChange={(e) => updateCarrier(index, "is_active", e.target.checked)}
                              className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => moveCarrier(index, "up")}
                            disabled={index === 0}
                            className="p-1 rounded bg-white/5 text-slate-400 hover:text-white disabled:opacity-30"
                            title="Mover para cima"
                          >
                            <MoveUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveCarrier(index, "down")}
                            disabled={index === carriers.length - 1}
                            className="p-1 rounded bg-white/5 text-slate-400 hover:text-white disabled:opacity-30"
                            title="Mover para baixo"
                          >
                            <MoveDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCarrier(index)}
                            className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            title="Remover transportadora"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1">Nome</label>
                          <input
                            type="text"
                            value={carrier.name}
                            onChange={(e) => updateCarrier(index, "name", e.target.value)}
                            className="w-full bg-[#0a1b2e] border border-white/10 rounded-lg px-3 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Prazo Médio</label>
                          <input
                            type="text"
                            value={carrier.delivery_time}
                            onChange={(e) => updateCarrier(index, "delivery_time", e.target.value)}
                            className="w-full bg-[#0a1b2e] border border-white/10 rounded-lg px-3 py-2 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Caminho da Imagem/Logo</label>
                          <input
                            type="text"
                            value={carrier.logo_url}
                            onChange={(e) => updateCarrier(index, "logo_url", e.target.value)}
                            className="w-full bg-[#0a1b2e] border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[11px]"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-slate-400 mb-1">Descrição Curta</label>
                          <input
                            type="text"
                            value={carrier.description}
                            onChange={(e) => updateCarrier(index, "description", e.target.value)}
                            className="w-full bg-[#0a1b2e] border border-white/10 rounded-lg px-3 py-2 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Save size={16} />
                <span>{isSaving ? "Gravando no Banco..." : "Salvar Transportadoras"}</span>
              </button>
            </form>
          )}

          {/* ABA 3: CRUD DE FAQ */}
          {activeTab === "faqs" && (
            <form onSubmit={handleSavePublicPage} className="space-y-6">
              <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <HelpCircle size={16} className="text-amber-400" />
                      Perguntas Frequentes (FAQ de Entregas)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Edite as dúvidas sobre prazo, rastreio, embalagem e trocas exibidas no acordeão.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addFaq}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 hover:bg-amber-400/25 text-xs font-semibold transition-all"
                  >
                    <Plus size={14} />
                    <span>Adicionar Pergunta</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={faq.id || index}
                      className="p-4 rounded-xl bg-[#030913] border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          Pergunta #{index + 1}
                        </span>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-400 mr-2">
                            <span>Ativa</span>
                            <input
                              type="checkbox"
                              checked={faq.is_active}
                              onChange={(e) => updateFaq(index, "is_active", e.target.checked)}
                              className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => moveFaq(index, "up")}
                            disabled={index === 0}
                            className="p-1 rounded bg-white/5 text-slate-400 hover:text-white disabled:opacity-30"
                            title="Mover para cima"
                          >
                            <MoveUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFaq(index, "down")}
                            disabled={index === faqs.length - 1}
                            className="p-1 rounded bg-white/5 text-slate-400 hover:text-white disabled:opacity-30"
                            title="Mover para baixo"
                          >
                            <MoveDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFaq(index)}
                            className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            title="Remover pergunta"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-slate-400 mb-1">Pergunta</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => updateFaq(index, "question", e.target.value)}
                            className="w-full bg-[#0a1b2e] border border-white/10 rounded-lg px-3 py-2 text-white font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-400 mb-1">Resposta</label>
                          <textarea
                            rows={3}
                            value={faq.answer}
                            onChange={(e) => updateFaq(index, "answer", e.target.value)}
                            className="w-full bg-[#0a1b2e] border border-white/10 rounded-lg p-3 text-white leading-relaxed font-light"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Save size={16} />
                <span>{isSaving ? "Gravando no Banco..." : "Salvar Perguntas Frequentes"}</span>
              </button>
            </form>
          )}

          {/* ABA 4: RETIRADA NO ESPAÇO FÍSICO & FRETE BASE (CHECKOUT) */}
          {activeTab === "checkout" && (
            <form onSubmit={handleSaveCheckout} className="space-y-6">
              {/* Bloco 1: Retirada no Balcão */}
              <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Store size={16} className="text-amber-400" />
                    1. Retirada Presencial na Loja
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-slate-400">Habilitar no Checkout</span>
                    <input
                      type="checkbox"
                      checked={checkoutSettings.store_pickup_enabled}
                      onChange={(e) =>
                        setCheckoutSettings({
                          ...checkoutSettings,
                          store_pickup_enabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                    />
                  </label>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Endereço Oficial de Retirada</label>
                    <input
                      type="text"
                      value={checkoutSettings.pickup_address}
                      onChange={(e) =>
                        setCheckoutSettings({
                          ...checkoutSettings,
                          pickup_address: e.target.value,
                        })
                      }
                      className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      O cliente não paga frete ao selecionar retirada presencial.
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloco 2: Regras de Frete em Domicílio */}
              <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                  <Truck size={16} className="text-amber-400" />
                  2. Regras de Frete em Domicílio
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Valor para Frete Grátis (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={(checkoutSettings.free_shipping_threshold_cents / 100).toFixed(2)}
                      onChange={(e) =>
                        setCheckoutSettings({
                          ...checkoutSettings,
                          free_shipping_threshold_cents: Math.round(
                            parseFloat(e.target.value || "0") * 100
                          ),
                        })
                      }
                      className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Pedidos com subtotal igual ou superior a este valor recebem frete gratuito.
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Taxa Padrão de Frete (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={(checkoutSettings.default_shipping_fee_cents / 100).toFixed(2)}
                      onChange={(e) =>
                        setCheckoutSettings({
                          ...checkoutSettings,
                          default_shipping_fee_cents: Math.round(
                            parseFloat(e.target.value || "0") * 100
                          ),
                        })
                      }
                      className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Cobrado para pedidos abaixo da faixa de frete grátis.
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Save size={16} />
                <span>{isSaving ? "Gravando no Banco..." : "Salvar Configurações de Frete"}</span>
              </button>
            </form>
          )}
    </div>
  );
}
