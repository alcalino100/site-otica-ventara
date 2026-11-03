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
  Upload,
  Clock,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { SiteShippingSettings } from "@/types/ecommerce";
import {
  ShippingPageSettings,
  ShippingCarrier,
  ShippingFaqItem,
  CityChip,
} from "@/types/shipping";
import {
  DEFAULT_SHIPPING_PAGE_SETTINGS,
  DEFAULT_SHIPPING_CARRIERS,
  DEFAULT_SHIPPING_FAQS,
  DEFAULT_CITY_CHIPS,
} from "@/lib/shipping-constants";
import { ShippingLocalDelivery } from "@/components/sections/shipping/shipping-local-delivery";

export default function AdminShippingPage() {
  const [activeTab, setActiveTab] = useState<
    "regional" | "hero" | "national" | "carriers" | "faqs" | "checkout"
  >("regional");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Estado da Página Pública /entregas
  const [pageSettings, setPageSettings] = useState<ShippingPageSettings>(
    DEFAULT_SHIPPING_PAGE_SETTINGS
  );
  const [carriers, setCarriers] = useState<ShippingCarrier[]>(
    DEFAULT_SHIPPING_CARRIERS
  );
  const [faqs, setFaqs] = useState<ShippingFaqItem[]>(DEFAULT_SHIPPING_FAQS);

  // Estado para adicionar nova cidade
  const [newCityName, setNewCityName] = useState("");

  // 2. Estado de Checkout / Retirada
  const defaultCheckoutShipping: SiteShippingSettings = {
    store_pickup_enabled: true,
    free_shipping_threshold_cents: 35000,
    default_shipping_fee_cents: 2500,
    pickup_address:
      "Rua Princesa Isabel, 221, Centro, Araçatuba-SP, CEP 16010-250",
  };
  const [checkoutSettings, setCheckoutSettings] =
    useState<SiteShippingSettings>(defaultCheckoutShipping);

  useEffect(() => {
    let isMounted = true;

    async function loadAllShippingData() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        // Busca dados da página pública
        const res = await fetch("/api/admin/shipping", {
          signal: controller.signal,
        });
        if (res.ok && isMounted) {
          const json = await res.json();
          if (json.pageSettings) setPageSettings(json.pageSettings);
          if (json.carriers) setCarriers(json.carriers);
          if (json.faqs) setFaqs(json.faqs);
        }

        // Busca dados de checkout em settings
        const resSettings = await fetch("/api/admin/settings", {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (resSettings.ok && isMounted) {
          const jsonSettings = await resSettings.json();
          if (jsonSettings.shipping) {
            setCheckoutSettings((prev) => ({
              ...prev,
              ...jsonSettings.shipping,
            }));
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
  const handleSavePublicPage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    setErrorMessage(null);

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

      if (res.ok) {
        setFeedback("Alterações de logística e entregas salvas com sucesso!");
      } else {
        const errJson = await res.json().catch(() => ({}));
        setErrorMessage(
          errJson.error || "Ocorreu um erro ao salvar as configurações."
        );
      }
    } catch {
      setErrorMessage("Erro de conexão ao salvar.");
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setFeedback(null);
        setErrorMessage(null);
      }, 5000);
    }
  };

  // Upload genérico de fotos (van, hero, etc.)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "regional_image_url" | "hero_image_url"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFeedback(null);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/shipping/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.url) {
        setPageSettings((prev) => ({ ...prev, [field]: json.url }));
        setFeedback("Foto enviada com sucesso! Clique em 'Salvar Alterações'.");
      } else {
        setErrorMessage(json.error || "Falha no upload da foto.");
      }
    } catch {
      setErrorMessage("Erro de conexão durante o upload.");
    } finally {
      setIsUploading(false);
    }
  };

  // Gerenciamento de Cidades (Chips)
  const handleAddCity = () => {
    const trimmed = newCityName.trim();
    if (!trimmed) return;

    const currentCities = pageSettings.regional_cities || [];
    const newChip: CityChip = {
      id: `city-${Date.now()}`,
      name: trimmed,
      sort_order: currentCities.length + 1,
    };

    setPageSettings((prev) => ({
      ...prev,
      regional_cities: [...(prev.regional_cities || []), newChip],
    }));
    setNewCityName("");
  };

  const handleUpdateCityName = (id: string, name: string) => {
    setPageSettings((prev) => ({
      ...prev,
      regional_cities: (prev.regional_cities || []).map((c) =>
        c.id === id ? { ...c, name } : c
      ),
    }));
  };

  const handleRemoveCity = (id: string) => {
    setPageSettings((prev) => ({
      ...prev,
      regional_cities: (prev.regional_cities || []).filter((c) => c.id !== id),
    }));
  };

  const handleMoveCity = (index: number, direction: "up" | "down") => {
    const cities = [...(pageSettings.regional_cities || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cities.length) return;

    const temp = cities[index];
    cities[index] = cities[targetIndex];
    cities[targetIndex] = temp;

    // Atualiza sort_order
    cities.forEach((c, idx) => {
      c.sort_order = idx + 1;
    });

    setPageSettings((prev) => ({ ...prev, regional_cities: cities }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
              <Truck size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Gestão de Entregas &amp; Logística
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Configure a página pública{" "}
            <span className="text-amber-400 font-mono">/entregas</span>, o bloco
            regional de Araçatuba e as transportadoras.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/entregas"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            <Eye size={14} />
            <span>Ver no Site</span>
            <ExternalLink size={12} className="text-slate-400" />
          </a>

          <button
            onClick={() => handleSavePublicPage()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-amber-400/20"
          >
            <Save size={14} />
            <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
          </button>
        </div>
      </div>

      {/* Feedback & Erros */}
      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs sm:text-sm flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navegação por Abas */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        <button
          type="button"
          data-testid="tab-regional"
          onClick={() => setActiveTab("regional")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "regional"
              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/15"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Navigation size={15} />
          <span>Entrega Regional (Araçatuba)</span>
          <span className="w-2 h-2 rounded-full bg-amber-500 ml-1" />
        </button>

        <button
          type="button"
          data-testid="tab-hero"
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "hero"
              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/15"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Sparkles size={15} />
          <span>Hero &amp; Destaques</span>
        </button>

        <button
          type="button"
          data-testid="tab-national"
          onClick={() => setActiveTab("national")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "national"
              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/15"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Globe2 size={15} />
          <span>Envio Nacional</span>
        </button>

        <button
          type="button"
          data-testid="tab-carriers"
          onClick={() => setActiveTab("carriers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "carriers"
              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/15"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Truck size={15} />
          <span>Transportadoras Utilizadas</span>
        </button>

        <button
          type="button"
          data-testid="tab-faqs"
          onClick={() => setActiveTab("faqs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "faqs"
              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/15"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <HelpCircle size={15} />
          <span>Perguntas Frequentes</span>
        </button>

        <button
          type="button"
          data-testid="tab-checkout"
          onClick={() => setActiveTab("checkout")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "checkout"
              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/15"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Store size={15} />
          <span>Retirada &amp; Frete Loja</span>
        </button>
      </div>

      {/* =========================================================================
          ABA 1: BLOCO REGIONAL (100% EDITÁVEL + PRÉ-VISUALIZAÇÃO AO VIVO)
         ========================================================================= */}
      {activeTab === "regional" && (
        <div className="space-y-8">
          {/* Card de Configurações */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Navigation size={18} className="text-amber-400" />
                  <span>Configuração da Entrega Expressa Regional</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Edite textos, títulos em duas cores, chips de cidades, fotos e
                  gradiente com pré-visualização ao vivo.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pageSettings.regional_is_enabled !== false}
                    onChange={(e) =>
                      setPageSettings((prev) => ({
                        ...prev,
                        regional_is_enabled: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                  <span className="ml-2.5 text-xs font-semibold text-slate-300">
                    {pageSettings.regional_is_enabled !== false
                      ? "Bloco Ativo no Site"
                      : "Bloco Oculto"}
                  </span>
                </label>
              </div>
            </div>

            {/* Campos de Textos e Título em Duas Cores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Selo / Badge (Topo)
                </label>
                <input
                  type="text"
                  value={pageSettings.regional_badge_text || ""}
                  onChange={(e) =>
                    setPageSettings((prev) => ({
                      ...prev,
                      regional_badge_text: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
                  placeholder="LOGÍSTICA PRÓPRIA REGIONAL"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Título das Cidades
                </label>
                <input
                  type="text"
                  value={pageSettings.regional_cities_heading || ""}
                  onChange={(e) =>
                    setPageSettings((prev) => ({
                      ...prev,
                      regional_cities_heading: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
                  placeholder="CIDADES ATENDIDAS COM ROTA LOCAL"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Título Parte 1 (Cor Branca)
                </label>
                <input
                  type="text"
                  value={pageSettings.regional_title_part1 || ""}
                  onChange={(e) =>
                    setPageSettings((prev) => ({
                      ...prev,
                      regional_title_part1: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none font-semibold"
                  placeholder="Entrega Expressa em"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-400 mb-1.5">
                  Título Parte 2 (Cor Amarelo Ventara)
                </label>
                <input
                  type="text"
                  value={pageSettings.regional_title_part2 || ""}
                  onChange={(e) =>
                    setPageSettings((prev) => ({
                      ...prev,
                      regional_title_part2: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-400/40 text-xs text-amber-400 focus:border-amber-400 outline-none font-bold"
                  placeholder="Araçatuba e Região"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Descrição Completa
                </label>
                <textarea
                  rows={2}
                  value={pageSettings.regional_description || ""}
                  onChange={(e) =>
                    setPageSettings((prev) => ({
                      ...prev,
                      regional_description: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none leading-relaxed"
                  placeholder="Com frota própria e equipe dedicada..."
                />
              </div>
            </div>

            {/* Gerenciamento de Cidades (Chips) */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={15} />
                    <span>Lista de Cidades Atendidas (Chips com Bolinha Amarela)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Adicione, renomeie, reordene e remova municípios atendidos.
                  </p>
                </div>

                {/* Campo para adicionar nova cidade */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCity()}
                    placeholder="Nome da cidade (ex: Birigui)"
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-amber-400 w-48"
                  />
                  <button
                    type="button"
                    onClick={handleAddCity}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase transition-all"
                  >
                    <Plus size={14} />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>

              {/* Lista reordenável de chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {(pageSettings.regional_cities || []).map((city, idx) => (
                  <div
                    key={city.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 group"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                      <input
                        type="text"
                        value={city.name}
                        onChange={(e) =>
                          handleUpdateCityName(city.id, e.target.value)
                        }
                        className="bg-transparent text-xs text-white font-medium outline-none focus:border-b focus:border-amber-400 flex-1 min-w-0"
                      />
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveCity(idx, "up")}
                        disabled={idx === 0}
                        title="Subir posição"
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <MoveUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCity(idx, "down")}
                        disabled={
                          idx === (pageSettings.regional_cities || []).length - 1
                        }
                        title="Descer posição"
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <MoveDown size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCity(city.id)}
                        title="Remover cidade"
                        className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 ml-0.5"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Imagem de Fundo da Van e Controles de Gradiente */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Foto da Van &amp; Enquadramento
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    URL da Imagem
                  </label>
                  <input
                    type="text"
                    value={pageSettings.regional_image_url || ""}
                    onChange={(e) =>
                      setPageSettings((prev) => ({
                        ...prev,
                        regional_image_url: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none font-mono"
                    placeholder="/images/shipping/van-ventara-aracatuba.jpg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Focal Point (Alinhamento)
                  </label>
                  <select
                    value={pageSettings.regional_focal_point || "center right"}
                    onChange={(e) =>
                      setPageSettings((prev) => ({
                        ...prev,
                        regional_focal_point: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
                  >
                    <option value="center right">Centro-Direita (Recomendado)</option>
                    <option value="center center">Centro</option>
                    <option value="right top">Superior Direito</option>
                    <option value="right bottom">Inferior Direito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Intensidade do Gradiente de Leitura
                  </label>
                  <select
                    value={pageSettings.regional_gradient_intensity || "strong"}
                    onChange={(e) =>
                      setPageSettings((prev) => ({
                        ...prev,
                        regional_gradient_intensity: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
                  >
                    <option value="strong">Forte (Garante contraste em mobile)</option>
                    <option value="medium">Médio</option>
                    <option value="subtle">Sutil (Mais foto visível)</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer border border-slate-700">
                    <Upload size={14} className="text-amber-400" />
                    <span>
                      {isUploading
                        ? "Enviando foto..."
                        : "Fazer upload de nova foto da Van"}
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) =>
                        handleFileUpload(e, "regional_image_url")
                      }
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400 ml-3">
                    PNG, JPG ou WebP até 5 MB
                  </span>
                </div>
              </div>
            </div>

            {/* Prazos e Condições Opcionais */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Campos Opcionais de Prazo e Frete
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-400" />
                      <span>Exibir Prazo Estimado</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={pageSettings.regional_show_timeframe || false}
                      onChange={(e) =>
                        setPageSettings((prev) => ({
                          ...prev,
                          regional_show_timeframe: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-amber-400"
                    />
                  </div>
                  <input
                    type="text"
                    value={pageSettings.regional_timeframe || ""}
                    onChange={(e) =>
                      setPageSettings((prev) => ({
                        ...prev,
                        regional_timeframe: e.target.value,
                      }))
                    }
                    disabled={!pageSettings.regional_show_timeframe}
                    placeholder="Consulte o prazo no checkout..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none disabled:opacity-40"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-blue-400" />
                      <span>Exibir Condições / Retirada</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={pageSettings.regional_show_conditions || false}
                      onChange={(e) =>
                        setPageSettings((prev) => ({
                          ...prev,
                          regional_show_conditions: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 accent-amber-400"
                    />
                  </div>
                  <input
                    type="text"
                    value={pageSettings.regional_conditions || ""}
                    onChange={(e) =>
                      setPageSettings((prev) => ({
                        ...prev,
                        regional_conditions: e.target.value,
                      }))
                    }
                    disabled={!pageSettings.regional_show_conditions}
                    placeholder="Opção de retirada gratuita no balcão..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PRÉ-VISUALIZAÇÃO AO VIVO IDÊNTICA AO SITE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Eye size={15} />
                <span>Pré-visualização ao vivo do Bloco Regional</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Visualização em tempo real conforme configurações acima
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-[#030913]">
              <ShippingLocalDelivery
                badgeText={pageSettings.regional_badge_text}
                titlePart1={pageSettings.regional_title_part1}
                titlePart2={pageSettings.regional_title_part2}
                description={pageSettings.regional_description}
                citiesHeading={pageSettings.regional_cities_heading}
                cities={pageSettings.regional_cities}
                imageUrl={pageSettings.regional_image_url}
                imageAlt={pageSettings.regional_image_alt}
                focalPoint={pageSettings.regional_focal_point}
                gradientIntensity={pageSettings.regional_gradient_intensity}
                showTimeframe={pageSettings.regional_show_timeframe}
                timeframe={pageSettings.regional_timeframe}
                showConditions={pageSettings.regional_show_conditions}
                conditions={pageSettings.regional_conditions}
                isLivePreview={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 2: HERO & CARDS DE DESTAQUE
         ========================================================================= */}
      {activeTab === "hero" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              <span>Hero da Página &amp; 3 Cards de Destaque</span>
            </h2>
            <p className="text-xs text-slate-400">
              Configure os títulos do Hero com o tema claro e o toggle do seguro
              de carga.
            </p>
          </div>

          {/* Configurações do Hero */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Selo / Badge do Hero
              </label>
              <input
                type="text"
                value={pageSettings.hero_badge_text || ""}
                onChange={(e) =>
                  setPageSettings((prev) => ({
                    ...prev,
                    hero_badge_text: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Subtítulo do Hero
              </label>
              <input
                type="text"
                value={pageSettings.hero_subtitle || ""}
                onChange={(e) =>
                  setPageSettings((prev) => ({
                    ...prev,
                    hero_subtitle: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Título Linha 1 (Peso Regular)
              </label>
              <input
                type="text"
                value={pageSettings.hero_title_line1 || ""}
                onChange={(e) =>
                  setPageSettings((prev) => ({
                    ...prev,
                    hero_title_line1: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-amber-400 mb-1.5">
                Título Linha 2 (Destaque Ventara)
              </label>
              <input
                type="text"
                value={pageSettings.hero_title_line2 || ""}
                onChange={(e) =>
                  setPageSettings((prev) => ({
                    ...prev,
                    hero_title_line2: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-amber-400/40 text-xs text-amber-400 focus:border-amber-400 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Botão Principal (Texto)
              </label>
              <input
                type="text"
                value={pageSettings.hero_cta_text || ""}
                onChange={(e) =>
                  setPageSettings((prev) => ({
                    ...prev,
                    hero_cta_text: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Botão Principal (Link)
              </label>
              <input
                type="text"
                value={pageSettings.hero_cta_url || ""}
                onChange={(e) =>
                  setPageSettings((prev) => ({
                    ...prev,
                    hero_cta_url: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Foto dos Óculos na Bancada (Lado Direito do Hero)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={pageSettings.hero_image_url || ""}
                  onChange={(e) =>
                    setPageSettings((prev) => ({
                      ...prev,
                      hero_image_url: e.target.value,
                    }))
                  }
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none font-mono"
                />
                <label className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 cursor-pointer border border-slate-700 shrink-0">
                  <Upload size={14} className="text-amber-400" />
                  <span>Upload Foto</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => handleFileUpload(e, "hero_image_url")}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Cards de Destaque & Toggle de Seguro */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              3 Cards de Destaque Abaixo do Hero
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">
                  Ativar Card &quot;Seguro de Carga Total&quot;
                </p>
                <p className="text-[11px] text-slate-400">
                  Se desativado (padrão), o card exibirá &quot;Envio para todo o
                  Brasil: Correios e transporte aéreo&quot;.
                </p>
              </div>
              <input
                type="checkbox"
                checked={pageSettings.show_cargo_insurance || false}
                onChange={(e) =>
                  setPageSettings((prev) => ({
                    ...prev,
                    show_cargo_insurance: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-amber-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="text-[11px] font-bold text-amber-400 uppercase">
                  Card 1: Regional
                </p>
                <input
                  type="text"
                  value={pageSettings.highlight_card_1_title || ""}
                  onChange={(e) =>
                    setPageSettings((prev) => ({
                      ...prev,
                      highlight_card_1_title: e.target.value,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                  placeholder="Título"
                />
                <input
                  type="text"
                  value={pageSettings.highlight_card_1_subtitle || ""}
                  onChange={(e) =>
                    setPageSettings((prev) => ({
                      ...prev,
                      highlight_card_1_subtitle: e.target.value,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 outline-none"
                  placeholder="Subtítulo"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="text-[11px] font-bold text-blue-400 uppercase">
                  Card 2: Nacional (Sem Seguro)
                </p>
                <input
                  type="text"
                  value={pageSettings.highlight_card_2_title || ""}
                  onChange={(e) =>
                    setPageSettings((prev) => ({
                      ...prev,
                      highlight_card_2_title: e.target.value,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                  placeholder="Título"
                />
                <input
                  type="text"
                  value={pageSettings.highlight_card_2_subtitle || ""}
                  onChange={(e) =>
                    setPageSettings((prev) => ({
                      ...prev,
                      highlight_card_2_subtitle: e.target.value,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 outline-none"
                  placeholder="Subtítulo"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="text-[11px] font-bold text-emerald-400 uppercase">
                  Card 3: Rastreio
                </p>
                <input
                  type="text"
                  value={pageSettings.highlight_card_3_title || ""}
                  onChange={(e) =>
                    setPageSettings((prev) => ({
                      ...prev,
                      highlight_card_3_title: e.target.value,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                  placeholder="Título"
                />
                <input
                  type="text"
                  value={pageSettings.highlight_card_3_subtitle || ""}
                  onChange={(e) =>
                    setPageSettings((prev) => ({
                      ...prev,
                      highlight_card_3_subtitle: e.target.value,
                    }))
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 outline-none"
                  placeholder="Subtítulo"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 3: ENVIO NACIONAL & PRAZO ESTIMADO
         ========================================================================= */}
      {activeTab === "national" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Globe2 size={18} className="text-amber-400" />
              <span>Envio para Todo o Brasil &amp; Prazo Estimado</span>
            </h2>
            <p className="text-xs text-slate-400">
              Configure o bloco nacional, os 3 cartões de envio e o card de
              prazo estimado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Título da Seção Nacional
              </label>
              <input
                type="text"
                value={pageSettings.national_title || ""}
                onChange={(e) =>
                  setPageSettings((prev) => ({
                    ...prev,
                    national_title: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Subtítulo da Seção Nacional
              </label>
              <input
                type="text"
                value={pageSettings.national_subtitle || ""}
                onChange={(e) =>
                  setPageSettings((prev) => ({
                    ...prev,
                    national_subtitle: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nota de Rastreamento Ponto a Ponto
              </label>
              <input
                type="text"
                value={pageSettings.national_tracking_note || ""}
                onChange={(e) =>
                  setPageSettings((prev) => ({
                    ...prev,
                    national_tracking_note: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Card de Prazo Estimado */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock size={15} className="text-amber-400" />
              <span>Card em Destaque: Prazo Estimado</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Título do Card
                </label>
                <input
                  type="text"
                  value={pageSettings.estimated_timeframe_title || ""}
                  onChange={(e) =>
                    setPageSettings((prev) => ({
                      ...prev,
                      estimated_timeframe_title: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Texto Informativo
                </label>
                <input
                  type="text"
                  value={pageSettings.estimated_timeframe_text || ""}
                  onChange={(e) =>
                    setPageSettings((prev) => ({
                      ...prev,
                      estimated_timeframe_text: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Cartões Nacionais (Correios, Transportadoras, Aéreo) */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Cartões Nacionais (Toggles e Prazos)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(pageSettings.national_cards || []).map((card, idx) => (
                <div
                  key={card.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {card.title}
                    </span>
                    <input
                      type="checkbox"
                      checked={card.is_active !== false}
                      onChange={(e) => {
                        const updated = [...(pageSettings.national_cards || [])];
                        updated[idx].is_active = e.target.checked;
                        setPageSettings((prev) => ({
                          ...prev,
                          national_cards: updated,
                        }));
                      }}
                      className="w-4 h-4 accent-amber-400"
                    />
                  </div>

                  <textarea
                    rows={3}
                    value={card.description}
                    onChange={(e) => {
                      const updated = [...(pageSettings.national_cards || [])];
                      updated[idx].description = e.target.value;
                      setPageSettings((prev) => ({
                        ...prev,
                        national_cards: updated,
                      }));
                    }}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none leading-relaxed"
                  />

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Prazo Médio
                    </label>
                    <input
                      type="text"
                      value={card.delivery_time}
                      onChange={(e) => {
                        const updated = [...(pageSettings.national_cards || [])];
                        updated[idx].delivery_time = e.target.value;
                        setPageSettings((prev) => ({
                          ...prev,
                          national_cards: updated,
                        }));
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-400 outline-none font-semibold"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 4: TRANSPORTADORAS UTILIZADAS (CRUD)
         ========================================================================= */}
      {activeTab === "carriers" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck size={18} className="text-amber-400" />
                <span>Transportadoras que Utilizamos</span>
              </h2>
              <p className="text-xs text-slate-400">
                Cards dinâmicos com operadores parceiros (Azul Cargo, Gollog,
                Sedex, etc.).
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const newCarrier: ShippingCarrier = {
                  id: `carrier-${Date.now()}`,
                  name: "Nova Transportadora",
                  slug: `carrier-${Date.now()}`,
                  description: "Descrição dos envios e abrangência logística.",
                  delivery_time: "Em média 2 a 5 dias úteis",
                  logo_url: "/images/shipping/envio-brasil-azul-cargo.png",
                  is_active: true,
                  sort_order: carriers.length + 1,
                };
                setCarriers([...carriers, newCarrier]);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase"
            >
              <Plus size={14} />
              <span>Adicionar Transportadora</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {carriers.map((carrier, idx) => (
              <div
                key={carrier.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                    #{idx + 1} {carrier.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={carrier.is_active}
                        onChange={(e) => {
                          const updated = [...carriers];
                          updated[idx].is_active = e.target.checked;
                          setCarriers(updated);
                        }}
                        className="w-4 h-4 accent-amber-400"
                      />
                      <span>Ativo</span>
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setCarriers(carriers.filter((_, i) => i !== idx))
                      }
                      className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded ml-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={carrier.name}
                    onChange={(e) => {
                      const updated = [...carriers];
                      updated[idx].name = e.target.value;
                      setCarriers(updated);
                    }}
                    placeholder="Nome"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                  />
                  <input
                    type="text"
                    value={carrier.delivery_time}
                    onChange={(e) => {
                      const updated = [...carriers];
                      updated[idx].delivery_time = e.target.value;
                      setCarriers(updated);
                    }}
                    placeholder="Prazo"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white outline-none"
                  />
                </div>

                <textarea
                  rows={2}
                  value={carrier.description}
                  onChange={(e) => {
                    const updated = [...carriers];
                    updated[idx].description = e.target.value;
                    setCarriers(updated);
                  }}
                  placeholder="Descrição"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none leading-relaxed"
                />

                <input
                  type="text"
                  value={carrier.logo_url}
                  onChange={(e) => {
                    const updated = [...carriers];
                    updated[idx].logo_url = e.target.value;
                    setCarriers(updated);
                  }}
                  placeholder="URL do Logo / Foto"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 5: PERGUNTAS FREQUENTES (FAQ)
         ========================================================================= */}
      {activeTab === "faqs" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle size={18} className="text-amber-400" />
                <span>Perguntas Frequentes sobre Entregas</span>
              </h2>
              <p className="text-xs text-slate-400">
                Acordeão acessível para tirar dúvidas de clientes sobre prazos e
                rastreio.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const newFaq: ShippingFaqItem = {
                  id: `faq-${Date.now()}`,
                  question: "Nova Pergunta sobre Entregas?",
                  answer: "Resposta explicativa detalhada.",
                  is_active: true,
                  sort_order: faqs.length + 1,
                };
                setFaqs([...faqs, newFaq]);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase"
            >
              <Plus size={14} />
              <span>Adicionar FAQ</span>
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={faq.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].question = e.target.value;
                      setFaqs(updated);
                    }}
                    className="text-xs font-bold text-white bg-transparent outline-none flex-1 focus:border-b focus:border-amber-400 mr-2"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-300 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={faq.is_active}
                        onChange={(e) => {
                          const updated = [...faqs];
                          updated[idx].is_active = e.target.checked;
                          setFaqs(updated);
                        }}
                        className="w-4 h-4 accent-amber-400"
                      />
                      <span>Ativo</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                      className="p-1 text-rose-400 hover:text-rose-300 rounded ml-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[idx].answer = e.target.value;
                    setFaqs(updated);
                  }}
                  className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 outline-none leading-relaxed"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          ABA 6: RETIRADA & FRETE LOJA
         ========================================================================= */}
      {activeTab === "checkout" && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Store size={18} className="text-amber-400" />
              <span>Retirada Física no Balcão &amp; Frete de Checkout</span>
            </h2>
            <p className="text-xs text-slate-400">
              Regras aplicadas diretamente na finalização da compra no carrinho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">
                  Permitir Retirada Gratuita na Loja
                </p>
                <p className="text-[11px] text-slate-400">
                  Opção para clientes retirarem na ótica física em Araçatuba.
                </p>
              </div>
              <input
                type="checkbox"
                checked={checkoutSettings.store_pickup_enabled}
                onChange={(e) =>
                  setCheckoutSettings((prev) => ({
                    ...prev,
                    store_pickup_enabled: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Endereço de Retirada
              </label>
              <input
                type="text"
                value={checkoutSettings.pickup_address}
                onChange={(e) =>
                  setCheckoutSettings((prev) => ({
                    ...prev,
                    pickup_address: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-400 outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
