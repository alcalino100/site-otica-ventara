"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Play,
  Sparkles,
  Instagram,
  Video,
  Youtube,
  Facebook,
  Globe,
  RefreshCw,
} from "lucide-react";
import { LiveBroadcastSettings } from "@/types/ecommerce";
import { DEFAULT_LIVE_BROADCAST } from "@/lib/site-settings-constants";

export default function AdminLivePage() {
  const [settings, setSettings] = useState<LiveBroadcastSettings>(DEFAULT_LIVE_BROADCAST);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.live_broadcast) {
            setSettings({
              ...DEFAULT_LIVE_BROADCAST,
              ...data.live_broadcast,
            });
          }
        }
      } catch (err) {
        console.error("Erro ao carregar configurações de live:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          live_broadcast: settings,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao salvar configurações.");
      }

      setFeedback({
        type: "success",
        text: settings.enabled
          ? "🎉 Botão de LIVE ATIVADO com sucesso no site!"
          : "✅ Configurações salvas. Botão de LIVE está DESATIVADO no site.",
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Erro de conexão ao salvar.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const platforms = [
    {
      id: "instagram",
      label: "Instagram",
      icon: Instagram,
      defaultUrl: "https://www.instagram.com/oticaventara/",
      color: "from-pink-500 to-rose-600",
    },
    {
      id: "tiktok",
      label: "TikTok",
      icon: Video,
      defaultUrl: "https://www.tiktok.com/@oticaventara",
      color: "from-slate-900 to-cyan-600",
    },
    {
      id: "youtube",
      label: "YouTube",
      icon: Youtube,
      defaultUrl: "https://www.youtube.com/@oticaventara",
      color: "from-red-600 to-red-700",
    },
    {
      id: "facebook",
      label: "Facebook",
      icon: Facebook,
      defaultUrl: "https://www.facebook.com/share/19mUxSqUnf/?mibextid=wwXIfr",
      color: "from-blue-600 to-blue-700",
    },
    {
      id: "custom",
      label: "Outro Link",
      icon: Globe,
      defaultUrl: "https://",
      color: "from-emerald-600 to-teal-700",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <Radio size={22} className={settings.enabled ? "animate-pulse" : ""} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Transmissão Ao Vivo (Live no Site)</span>
                {settings.enabled && (
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                    NO AR
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Ative ou desative o botão flutuante de LIVE no site público e informe o link da sua transmissão.
              </p>
            </div>
          </div>
        </div>

        {/* Status Rápido no Topo */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              settings.enabled
                ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
                : "bg-white/10 hover:bg-white/15 text-slate-300"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                settings.enabled ? "bg-white animate-ping" : "bg-slate-500"
              }`}
            />
            <span>{settings.enabled ? "LIVE LIGADA (Visível no Site)" : "LIVE DESLIGADA (Oculta)"}</span>
          </button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm shadow-lg ${
            feedback.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/80 border-red-500/40 text-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Formulário Principal com Duas Colunas */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Controles e Configurações */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Chave Geral de Ativação */}
          <div className="p-6 rounded-3xl bg-[#06121f] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Interruptor Principal da Live</span>
                  {settings.enabled ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ligue apenas quando você for abrir a live no Instagram, TikTok, etc.
                </p>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7.5 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6.5 after:w-6.5 after:transition-all peer-checked:bg-red-600 shadow-inner"></div>
              </label>
            </div>

            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-colors ${
                settings.enabled
                  ? "bg-red-950/40 border-red-500/30 text-red-200"
                  : "bg-white/[0.03] border-white/5 text-slate-400"
              }`}
            >
              <Radio size={14} className={settings.enabled ? "text-red-400 animate-pulse" : "text-slate-500"} />
              <span>
                {settings.enabled
                  ? "O botão de LIVE está VISÍVEL e piscando no site agora. Visitantes serão redirecionados ao clicar."
                  : "O botão de LIVE está OCULTO no site. Ninguém vê o botão até você ligar a chave acima."}
              </span>
            </div>
          </div>

          {/* Card 2: Plataforma da Live */}
          <div className="p-6 rounded-3xl bg-[#06121f] border border-white/10 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white">Escolha onde você está fazendo a Live</h2>
            <p className="text-xs text-slate-400 -mt-2">
              Selecione a plataforma para ajustar automaticamente o ícone e link base.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              {platforms.map((p) => {
                const Icon = p.icon;
                const isSelected = settings.platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSettings((prev) => ({
                        ...prev,
                        platform: p.id as any,
                        live_url: prev.live_url && prev.live_url !== DEFAULT_LIVE_BROADCAST.live_url ? prev.live_url : p.defaultUrl,
                      }));
                    }}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-red-600/20 border-red-500 text-white shadow-lg shadow-red-600/20 scale-[1.02]"
                        : "bg-white/[0.02] border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={22} className={isSelected ? "text-red-400" : "text-slate-400"} />
                    <span className="text-xs font-bold">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Link e Detalhes da Live */}
          <div className="p-6 rounded-3xl bg-[#06121f] border border-white/10 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white">Link e Textos da Transmissão</h2>

            {/* Input Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Link da Live (URL onde as pessoas vão assistir):</span>
                {settings.live_url && (
                  <a
                    href={settings.live_url.startsWith("http") ? settings.live_url : `https://${settings.live_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-red-400 hover:text-red-300 inline-flex items-center gap-1 font-medium"
                  >
                    <span>Testar Link</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </label>
              <input
                type="url"
                required
                value={settings.live_url}
                onChange={(e) => setSettings({ ...settings, live_url: e.target.value })}
                placeholder="Ex: https://www.instagram.com/oticaventara/live"
                className="w-full px-4 py-2.5 rounded-xl bg-[#030911] border border-white/15 focus:border-red-500 text-sm text-white placeholder-slate-500 outline-none transition-colors font-mono"
              />
              <p className="text-[11px] text-slate-400">
                Cole o link direto da live ou o perfil da loja onde a live está acontecendo.
              </p>
            </div>

            {/* Título / Frase da Live */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Título Chamativo:
                </label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  placeholder="Ex: Estamos Ao Vivo!"
                  className="w-full px-4 py-2 rounded-xl bg-[#030911] border border-white/15 focus:border-red-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Texto do Botão / Chamada:
                </label>
                <input
                  type="text"
                  value={settings.call_to_action || ""}
                  onChange={(e) => setSettings({ ...settings, call_to_action: e.target.value })}
                  placeholder="Ex: Clique para assistir"
                  className="w-full px-4 py-2 rounded-xl bg-[#030911] border border-white/15 focus:border-red-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Botão de Salvar */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-slate-950 font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Salvando configurações...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Salvar Configurações da Live</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Coluna Direita: Pré-visualização do Botão em Tempo Real */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#06121f] border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-red-400" />
                <span>Pré-visualização no Site</span>
              </h2>
              <span className="text-[11px] font-semibold text-slate-400">
                {settings.enabled ? "Visível no site" : "Oculto no site"}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Veja exatamente como o botão aparece para os visitantes da Óticas Ventara (estilo da referência 3.jpeg):
            </p>

            {/* Caixa de Simulação de Tela de Celular / Navegador */}
            <div className="relative aspect-4/3 rounded-2xl bg-[#02070e] border border-white/15 p-6 flex flex-col justify-between overflow-hidden shadow-inner">
              {/* Topo simulando barra de navegador */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">oticasventara.com.br</span>
                <span className="text-[10px] text-slate-400">Simulação</span>
              </div>

              {/* Mensagem central */}
              <div className="text-center space-y-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
                  {settings.enabled ? "Transmissão Ativa" : "Transmissão Desligada"}
                </span>
                <p className="text-xs text-slate-400">
                  {settings.enabled
                    ? "O botão abaixo pisca no canto inferior direito convidando o visitante para a live."
                    : "Como a live está desligada, o botão não é exibido para nenhum visitante."}
                </p>
              </div>

              {/* Pré-visualização do Widget Flutuante da Live */}
              <div className="flex items-end justify-end gap-3 pt-4">
                {settings.enabled ? (
                  <div className="flex items-center gap-2">
                    {/* Tooltip Preview */}
                    <div className="px-3 py-1.5 rounded-xl bg-[#06111f] border border-red-500/40 text-white text-[10px] shadow-xl">
                      <div className="flex items-center gap-1 font-bold text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        <span>{settings.title}</span>
                      </div>
                      <span className="text-slate-300 text-[9px]">{settings.call_to_action}</span>
                    </div>

                    {/* Botão Oficial 3.jpeg */}
                    <div className="relative flex flex-col items-center">
                      <span className="absolute -inset-1 rounded-full bg-red-600 opacity-40 animate-ping pointer-events-none" />

                      <div className="relative w-12 h-12 rounded-full bg-gradient-to-b from-red-500 via-red-600 to-red-700 p-1 flex items-center justify-center shadow-lg shadow-red-600/50 border-2 border-white/80">
                        <Play size={18} className="text-white fill-white translate-x-0.5" />
                        <div className="absolute top-1 left-1.5 w-5 h-2 rounded-full bg-white/40 blur-[0.5px] -rotate-12 pointer-events-none" />
                      </div>

                      <div className="-mt-2 relative z-10 px-2.5 py-0.5 rounded-full bg-gradient-to-b from-red-500 to-red-700 border border-white/90 shadow-md">
                        <span className="text-[9px] font-black tracking-widest text-white uppercase drop-shadow-xs">
                          {settings.label || "LIVE"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-white/20 text-slate-400 text-xs text-center w-full">
                    Botão de Live Oculto (Ligue a chave acima para exibir)
                  </div>
                )}
              </div>
            </div>

            {/* Dica de Operação */}
            <div className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 text-amber-200 text-xs space-y-1">
              <p className="font-bold text-amber-300">💡 Como usar no dia a dia da Ótica:</p>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                Quando for iniciar uma live pelo celular no Instagram ou TikTok, abra o painel da Ventara, clique em
                <strong> LIVE LIGADA</strong> e salve. Assim que a live terminar, basta voltar aqui e desligar.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
