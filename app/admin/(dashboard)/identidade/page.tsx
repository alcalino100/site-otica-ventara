"use client";

import React, { useState, useEffect } from "react";
import {
  Palette,
  CheckCircle2,
  Save,
  Eye,
  MapPin,
  Phone,
  Instagram,
  Sparkles,
  Glasses,
  RotateCcw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SiteIdentitySettings, SiteAppearanceSettings } from "@/types/ecommerce";
import { useSiteSettings } from "@/components/providers/site-settings-provider";

export default function AdminIdentityPage() {
  const supabase = createClient();
  const { updateSettings } = useSiteSettings();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const defaultIdentity: SiteIdentitySettings = {
    store_name: "Ótica Ventara",
    tagline: "Mais que óculos. Seu jeito de ver o mundo.",
    address_street: "Rua Princesa Isabel, 221",
    address_neighborhood: "Centro",
    address_city: "Araçatuba",
    address_state: "SP",
    address_postal_code: "16010-250",
    phone_whatsapp: "(18) 99615-5748",
    instagram_handle: "@oticaventara",
    business_hours: "Segunda a Sexta: 09h às 18h · Sábados: 09h às 13h",
    logo_url: "",
    favicon_url: "",
  };

  const defaultAppearance: SiteAppearanceSettings = {
    color_navy: "#06111F",
    color_electric: "#0756B8",
    color_yellow: "#FFD62E",
    color_ice_white: "#F4F6FA",
  };

  const [identity, setIdentity] = useState<SiteIdentitySettings>(defaultIdentity);
  const [appearance, setAppearance] = useState<SiteAppearanceSettings>(defaultAppearance);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.identity) setIdentity((prev) => ({ ...prev, ...data.identity }));
          if (data.appearance) setAppearance((prev) => ({ ...prev, ...data.appearance }));
        }
      } catch (err) {
        console.warn("Usando configurações locais padrão:", err);
      }
    }

    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identity, appearance }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "Erro ao salvar alterações no servidor.");
      }

      // Aplica imediatamente ao tema do site e preview
      updateSettings(identity, appearance);

      setFeedback("Identidade visual e dados atualizados com sucesso!");
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error(err);
      setFeedback(err.message || "Erro ao salvar alterações.");
      setTimeout(() => setFeedback(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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
            PERSONALIZAÇÃO & MARCA
          </span>
          <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
            Identidade Visual e <span className="font-normal text-amber-400">Conteúdo Institucional</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie logos, paleta de cores controlada, contatos confirmados e textos institucionais.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIdentity(defaultIdentity);
            setAppearance(defaultAppearance);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw size={13} />
          <span>Restaurar Padrões</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulário de Configuração (Col 7) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* Seção 1: Marca & Textos */}
          <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles size={16} className="text-amber-400" />
              1. Marca e Posicionamento
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Nome Oficial da Loja</label>
                <input
                  type="text"
                  value={identity.store_name}
                  onChange={(e) => setIdentity({ ...identity, store_name: e.target.value })}
                  className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Slogan / Tagline Institucional</label>
                <input
                  type="text"
                  value={identity.tagline}
                  onChange={(e) => setIdentity({ ...identity, tagline: e.target.value })}
                  className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Paleta de Cores Controlada */}
          <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <Palette size={16} className="text-amber-400" />
              2. Paleta de Cores da Marca
            </h3>
            <p className="text-xs text-slate-400">
              Cores oficiais delimitadas no design system para preservar o contraste e a sofisticação visual.
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Azul-marinho (Fundo Premium)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.color_navy}
                    onChange={(e) => setAppearance({ ...appearance, color_navy: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={appearance.color_navy}
                    onChange={(e) => setAppearance({ ...appearance, color_navy: e.target.value })}
                    className="flex-1 bg-[#0a1b2e] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Azul Elétrico (Identidade)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.color_electric}
                    onChange={(e) => setAppearance({ ...appearance, color_electric: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={appearance.color_electric}
                    onChange={(e) => setAppearance({ ...appearance, color_electric: e.target.value })}
                    className="flex-1 bg-[#0a1b2e] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Amarelo (CTAs e Destaques)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.color_yellow}
                    onChange={(e) => setAppearance({ ...appearance, color_yellow: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={appearance.color_yellow}
                    onChange={(e) => setAppearance({ ...appearance, color_yellow: e.target.value })}
                    className="flex-1 bg-[#0a1b2e] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Branco Gelo (Leitura Confortável)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.color_ice_white}
                    onChange={(e) => setAppearance({ ...appearance, color_ice_white: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-white/20 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={appearance.color_ice_white}
                    onChange={(e) => setAppearance({ ...appearance, color_ice_white: e.target.value })}
                    className="flex-1 bg-[#0a1b2e] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção 3: Endereço & Contatos Confirmados */}
          <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
              <MapPin size={16} className="text-amber-400" />
              3. Loja Física & Canais Oficiais
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1">Logradouro e Número</label>
                  <input
                    type="text"
                    value={identity.address_street}
                    onChange={(e) => setIdentity({ ...identity, address_street: e.target.value })}
                    className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={identity.address_neighborhood}
                    onChange={(e) => setIdentity({ ...identity, address_neighborhood: e.target.value })}
                    className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={identity.address_city}
                    onChange={(e) => setIdentity({ ...identity, address_city: e.target.value })}
                    className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Estado</label>
                  <input
                    type="text"
                    value={identity.address_state}
                    onChange={(e) => setIdentity({ ...identity, address_state: e.target.value })}
                    className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">CEP</label>
                  <input
                    type="text"
                    value={identity.address_postal_code}
                    onChange={(e) => setIdentity({ ...identity, address_postal_code: e.target.value })}
                    className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-400 mb-1">WhatsApp Oficial</label>
                  <input
                    type="text"
                    value={identity.phone_whatsapp}
                    onChange={(e) => setIdentity({ ...identity, phone_whatsapp: e.target.value })}
                    className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Instagram (@)</label>
                  <input
                    type="text"
                    value={identity.instagram_handle}
                    onChange={(e) => setIdentity({ ...identity, instagram_handle: e.target.value })}
                    className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Horários de Atendimento</label>
                <input
                  type="text"
                  value={identity.business_hours}
                  onChange={(e) => setIdentity({ ...identity, business_hours: e.target.value })}
                  className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-400/10"
          >
            <Save size={16} />
            <span>{isSaving ? "Gravando no Banco..." : "Salvar Configurações de Identidade"}</span>
          </button>
        </form>

        {/* Pré-visualização Interativa (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-28 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Eye size={14} className="text-amber-400" /> Pré-Visualização em Tempo Real
              </span>
              <span className="text-[10px] text-slate-500 uppercase">Simulação</span>
            </div>

            {/* Card de Simulação de Cabeçalho / Hero */}
            <div
              className="rounded-2xl p-6 border border-white/15 shadow-2xl space-y-4 transition-colors"
              style={{ backgroundColor: appearance.color_navy }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2" style={{ color: appearance.color_yellow }}>
                  <Glasses size={20} />
                  <span className="text-sm font-bold tracking-wider text-white">
                    {identity.store_name.toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white">
                  Loja Ativa
                </span>
              </div>

              <div>
                <span
                  className="text-[10px] font-bold tracking-widest uppercase block mb-1"
                  style={{ color: appearance.color_yellow }}
                >
                  SEU ESTILO. SEU OLHAR.
                </span>
                <h4 className="text-base font-light text-white leading-snug">
                  {identity.tagline}
                </h4>
              </div>

              {/* Botões com as cores */}
              <div className="pt-2 flex items-center gap-2">
                <div
                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#06111f]"
                  style={{ backgroundColor: appearance.color_yellow }}
                >
                  Explorar Coleção
                </div>
                <div
                  className="px-3 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider text-white border"
                  style={{ borderColor: appearance.color_electric }}
                >
                  Falar no WhatsApp
                </div>
              </div>
            </div>

            {/* Card de Simulação de Contato */}
            <div className="bg-[#071626] border border-white/10 rounded-2xl p-5 space-y-3 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Endereço Confirmado
              </span>
              <p className="text-white font-medium flex items-start gap-2">
                <MapPin size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <span>
                  {identity.address_street}, {identity.address_neighborhood}
                  <br />
                  {identity.address_city}-{identity.address_state} · CEP {identity.address_postal_code}
                </span>
              </p>
              <p className="text-slate-300 flex items-center gap-2">
                <Phone size={14} className="text-amber-400 flex-shrink-0" />
                <span>{identity.phone_whatsapp}</span>
              </p>
              <p className="text-slate-300 flex items-center gap-2">
                <Instagram size={14} className="text-amber-400 flex-shrink-0" />
                <span>{identity.instagram_handle}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
