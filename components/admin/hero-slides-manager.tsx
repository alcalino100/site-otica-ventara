"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Sparkles,
  Upload,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Layers,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Monitor,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Tag,
  Palette,
} from "lucide-react";
import {
  HeroSlide,
  HeroCarouselSettings,
  HeroFocalPoint,
  HeroFitMode,
  HeroTransitionType,
} from "@/types/ecommerce";
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_HERO_SETTINGS,
} from "@/lib/site-settings-constants";

export function HeroSlidesManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [settings, setSettings] = useState<HeroCarouselSettings>(DEFAULT_HERO_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Estado do slide sendo editado (null = nenhum / fechado)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSavingSlide, setIsSavingSlide] = useState(false);
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const notify = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Carrega dados iniciais do hero
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resSlides, resSettings] = await Promise.all([
        fetch("/api/admin/hero"),
        fetch("/api/admin/hero/settings"),
      ]);

      if (resSlides.ok) {
        const data = await resSlides.json();
        setSlides(data.slides || DEFAULT_HERO_SLIDES);
      }
      if (resSettings.ok) {
        const data = await resSettings.json();
        setSettings(data.settings || DEFAULT_HERO_SETTINGS);
      }
    } catch (err: any) {
      console.warn("Erro ao buscar dados do Hero:", err);
      setSlides(DEFAULT_HERO_SLIDES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Salva configurações gerais do carrossel
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/admin/hero/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Erro ao salvar configurações do carrossel.");
      notify("success", "Configurações do carrossel atualizadas com sucesso!");
    } catch (err: any) {
      notify("error", err.message || "Falha ao salvar configurações.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Cria um novo slide
  const handleCreateNewSlide = () => {
    const newSlide: HeroSlide = {
      id: "",
      sort_order: slides.length,
      is_active: true,
      image_url_desktop:
        "https://yfokjztrhecjlijvmvmr.supabase.co/storage/v1/object/public/product-images/products/1792716830393-u708m6.jpg",
      image_url_mobile: null,
      alt_text: "Nova foto da coleção Ventara",
      focal_point_desktop: "center",
      custom_position_x: 50,
      custom_position_y: 50,
      focal_point_mobile: "center",
      fit_mode: "cover",
      overlay_intensity: 75,
      overlay_color: "#02070D",
      click_url: null,
      show_only_photo: false,
      show_badge_quality: true,
      badge_quality_text: "QUALIDADE QUE VOCÊ VÊ",
      show_badge_style: true,
      badge_style_text: "ARMAÇÕES DE QUALIDADE E ESTILO",
      show_badge_stock: true,
      badge_stock_text: "Em Estoque · Envio Imediato",
      show_badge_curation: true,
      badge_curation_text: "Curadoria Autoral Ventara · Acetato Premium",
      badge_curation_url: "/catalogo",
      show_title: true,
      title_text: "Mais que óculos,\né sobre você.",
      show_description: true,
      description_text:
        "Na Óticas Ventara, unimos tecnologia de precisão, curadoria autoral em acetato nobre e laboratório próprio para cuidar da sua visão em todos os momentos.",
      show_buttons: true,
      primary_button_text: "Catálogo de Lentes",
      primary_button_url: "/lentes",
      secondary_button_text: "Ver armações",
      secondary_button_url: "#armacoes",
      show_trust_markers: true,
    };
    setEditingSlide(newSlide);
  };

  // Salva o slide (criação ou edição)
  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    if (!editingSlide.image_url_desktop) {
      alert("Por favor, envie ou informe a imagem para desktop.");
      return;
    }

    setIsSavingSlide(true);
    try {
      const isNew = !editingSlide.id;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch("/api/admin/hero", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSlide),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar slide.");
      }

      notify("success", isNew ? "Novo slide publicado!" : "Slide atualizado com sucesso!");
      setEditingSlide(null);
      await loadData();
    } catch (err: any) {
      notify("error", err.message || "Erro ao salvar slide.");
    } finally {
      setIsSavingSlide(false);
    }
  };

  // Upload de imagem Desktop
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "desktop" | "mobile"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !editingSlide) return;

    if (type === "desktop") setIsUploadingDesktop(true);
    else setIsUploadingMobile(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/hero/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao fazer upload da imagem.");
      }

      if (data.url) {
        setEditingSlide((prev) =>
          prev
            ? {
                ...prev,
                [type === "desktop" ? "image_url_desktop" : "image_url_mobile"]: data.url,
              }
            : null
        );
        notify("success", `Foto ${type === "desktop" ? "Desktop" : "Mobile"} enviada com sucesso!`);
      }
    } catch (err: any) {
      notify("error", err.message || "Falha no envio do arquivo.");
    } finally {
      if (type === "desktop") setIsUploadingDesktop(false);
      else setIsUploadingMobile(false);
    }
  };

  // Toggle ativo/inativo direto na lista
  const handleToggleActive = async (slide: HeroSlide) => {
    const updatedStatus = !slide.is_active;
    try {
      const res = await fetch("/api/admin/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: slide.id, is_active: updatedStatus }),
      });
      if (res.ok) {
        setSlides((prev) =>
          prev.map((s) => (s.id === slide.id ? { ...s, is_active: updatedStatus } : s))
        );
        notify("success", `Slide ${updatedStatus ? "ativado" : "desativado"}.`);
      }
    } catch (err) {
      notify("error", "Não foi possível alternar o status do slide.");
    }
  };

  // Reordenação de slides (subir / descer)
  const handleMoveSlide = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(targetIndex, 0, moved);

    const reordered = newSlides.map((s, idx) => ({ id: s.id, sort_order: idx }));
    setSlides(newSlides);

    try {
      await fetch("/api/admin/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder: reordered }),
      });
      notify("success", "Ordem dos slides atualizada.");
    } catch {
      notify("error", "Erro ao persistir nova ordem.");
    }
  };

  // Excluir slide
  const handleDeleteSlide = async (id: string) => {
    if (!confirm("Tem certeza de que deseja excluir este slide do Hero?")) return;

    try {
      const res = await fetch(`/api/admin/hero?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSlides((prev) => prev.filter((s) => s.id !== id));
        notify("success", "Slide excluído com sucesso.");
      } else {
        throw new Error("Erro ao excluir.");
      }
    } catch (err: any) {
      notify("error", err.message || "Falha ao excluir slide.");
    }
  };

  // Helper para preview da posição do fundo
  const getFocalPosition = (slide: HeroSlide, mode: "desktop" | "mobile") => {
    const focal =
      mode === "mobile"
        ? slide.focal_point_mobile || "bottom"
        : slide.focal_point_desktop || "center";
    if (focal === "custom") {
      return `${slide.custom_position_x ?? 50}% ${slide.custom_position_y ?? (mode === "mobile" ? 80 : 50)}%`;
    }
    switch (focal) {
      case "top":
        return "center top";
      case "bottom":
        return "center bottom";
      case "left":
        return "left center";
      case "right":
        return "right center";
      default:
        return mode === "mobile" ? "center bottom" : "center center";
    }
  };

  return (
    <div className="space-y-8">
      {/* ALERTA DE FEEDBACK FLUTUANTE */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border text-sm transition-all ${
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
          <span>{feedback.message}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. CONFIGURAÇÕES GERAIS DO CARROSSEL */}
      {/* =================================================================== */}
      <div className="bg-[#06111f] border border-amber-400/25 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-[10px] font-bold tracking-wider uppercase">
              <Settings2 size={12} />
              <span>Controle do Carrossel Full-Bleed</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Configurações Globais do Hero</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Defina o comportamento de transição, autoplay e visibilidade das setas e indicadores.
              (Se houver apenas 1 foto ativa, ela será exibida fixa automaticamente).
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleSaveSettings()}
            disabled={isSavingSettings}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer self-start sm:self-auto"
          >
            <Save size={15} />
            <span>{isSavingSettings ? "Salvando..." : "Salvar Configurações"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Autoplay & Tempo */}
          <div className="bg-[#030913] p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white">Transição Automática (Autoplay)</label>
              <input
                type="checkbox"
                checked={settings.autoplay}
                onChange={(e) => setSettings((prev) => ({ ...prev, autoplay: e.target.checked }))}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </div>
            {settings.autoplay && (
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Tempo entre slides</span>
                  <span className="text-amber-400 font-mono">{(settings.interval_ms / 1000).toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min={2000}
                  max={12000}
                  step={500}
                  value={settings.interval_ms}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, interval_ms: Number(e.target.value) }))
                  }
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Tipo de Transição */}
          <div className="bg-[#030913] p-4 rounded-xl border border-white/5 space-y-3">
            <label className="text-xs font-semibold text-white block">Efeito de Transição</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, transition_type: "fade" }))}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                  settings.transition_type === "fade"
                    ? "bg-amber-400/15 border-amber-400 text-amber-300 font-bold"
                    : "border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                Fade (Suave)
              </button>
              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, transition_type: "slide" }))}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                  settings.transition_type === "slide"
                    ? "bg-amber-400/15 border-amber-400 text-amber-300 font-bold"
                    : "border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                Slide (Lateral)
              </button>
            </div>
          </div>

          {/* Controles Visuais (Setas, Bolinhas, Pausa no Hover) */}
          <div className="bg-[#030913] p-4 rounded-xl border border-white/5 space-y-2.5">
            <label className="text-xs font-semibold text-white block">Controles &amp; Comportamento</label>
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Exibir Setas de Navegação</span>
              <input
                type="checkbox"
                checked={settings.show_arrows}
                onChange={(e) => setSettings((prev) => ({ ...prev, show_arrows: e.target.checked }))}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Exibir Indicadores (Bolinhas)</span>
              <input
                type="checkbox"
                checked={settings.show_indicators}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, show_indicators: e.target.checked }))
                }
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span>Pausar ao passar o mouse</span>
              <input
                type="checkbox"
                checked={settings.pause_on_hover}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, pause_on_hover: e.target.checked }))
                }
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Selo Mercado Pago (Compra Segura) */}
          <div className="bg-[#030913] p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-white block">Selo Mercado Pago</label>
                <span className="text-[10px] text-slate-400">Compra Segura no Hero</span>
              </div>
              <input
                type="checkbox"
                checked={settings.show_secure_badge ?? true}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, show_secure_badge: e.target.checked }))
                }
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </div>
            {(settings.show_secure_badge ?? true) && (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">Texto do Selo</label>
                <input
                  type="text"
                  value={settings.secure_badge_text || "Compra segura com Mercado Pago"}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, secure_badge_text: e.target.value }))
                  }
                  placeholder="Compra segura com Mercado Pago"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. GERENCIADOR DE SLIDES & FOTOS */}
      {/* =================================================================== */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/25 text-blue-300 text-[10px] font-bold tracking-wider uppercase">
              <Layers size={12} />
              <span>Coleção de Slides ({slides.length})</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Fotos do Hero Full-Bleed</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adicione fotos em alta resolução que ocuparão todo o fundo do site. Arraste ou use os botões para reordenar.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateNewSlide}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Adicionar Foto / Slide</span>
          </button>
        </div>

        {/* LISTA DE SLIDES CADASTRADOS */}
        {slides.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <p className="text-sm text-slate-400">Nenhum slide cadastrado ainda.</p>
            <button
              type="button"
              onClick={handleCreateNewSlide}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-slate-950 text-xs font-bold"
            >
              <Plus size={14} />
              <span>Adicionar Primeira Foto</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {slides.map((slide, index) => (
              <div
                key={slide.id || index}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  slide.is_active
                    ? "bg-[#040c16] border-white/10 hover:border-amber-400/30"
                    : "bg-[#03080f]/60 border-white/5 opacity-60"
                }`}
              >
                {/* Miniatura e Informações */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-white/10 bg-slate-900 shrink-0">
                    <img
                      src={slide.image_url_desktop}
                      alt={slide.alt_text}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white truncate">
                        {slide.alt_text || "Foto do Hero"}
                      </span>
                      {slide.is_active ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Ativo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-bold">
                          Inativo
                        </span>
                      )}
                      {slide.show_only_photo && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                          Somente Foto
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1 flex-wrap">
                      <span>Focal: <strong>{slide.focal_point_desktop}</strong></span>
                      <span>Overlay: <strong>{slide.overlay_intensity}%</strong></span>
                      {slide.image_url_mobile && (
                        <span className="text-sky-300 flex items-center gap-1">
                          <Smartphone size={10} /> Foto Mobile
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações (Reordenar, Toggle Ativo, Editar, Excluir) */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveSlide(index, "up")}
                    disabled={index === 0}
                    title="Mover para cima"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSlide(index, "down")}
                    disabled={index === slides.length - 1}
                    title="Mover para baixo"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(slide)}
                    title={slide.is_active ? "Desativar slide" : "Ativar slide"}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${
                      slide.is_active
                        ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {slide.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSlide({ ...slide })}
                    className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-semibold cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slide.id)}
                    title="Excluir slide"
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 3. MODAL / EDITOR DO SLIDE SELECIONADO */}
      {/* =================================================================== */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#06111f] border border-amber-400/30 rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho do Editor */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>{editingSlide.id ? "Editar Slide do Hero" : "Novo Slide do Hero"}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Configure fotos, ponto focal, overlay e visibilidade de textos e badges.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingSlide(null)}
                className="text-slate-400 hover:text-white text-sm px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            {/* LIVE PREVIEW INTEGRADO NO EDITOR */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Eye size={13} className="text-amber-400" />
                  <span>Pré-visualização do Hero</span>
                </span>
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer ${
                      previewMode === "desktop"
                        ? "bg-amber-400 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Monitor size={12} />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer ${
                      previewMode === "mobile"
                        ? "bg-amber-400 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Smartphone size={12} />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Box de Prévia */}
              <div
                className={`relative mx-auto rounded-xl overflow-hidden border border-amber-400/30 bg-[#02070D] transition-all ${
                  previewMode === "mobile" ? "max-w-[320px] aspect-[9/16]" : "w-full aspect-[16/8]"
                }`}
              >
                {/* Imagem de Fundo com Posição Focal */}
                {/* Foto apenas no modo Desktop */}
                {previewMode === "desktop" ? (
                  <>
                    <img
                      src={editingSlide.image_url_desktop}
                      alt="Prévia do slide"
                      className={`absolute inset-0 w-full h-full transition-all duration-300 ${
                        editingSlide.fit_mode === "contain"
                          ? "object-contain"
                          : "object-cover"
                      }`}
                      style={{
                        objectPosition: getFocalPosition(editingSlide, previewMode),
                      }}
                    />

                    {/* Overlay Dinâmico Desktop */}
                    <div
                      className="absolute inset-0"
                      style={{
                        opacity: editingSlide.show_only_photo
                          ? 0.08
                          : (editingSlide.overlay_intensity ?? 75) / 100,
                        background: `linear-gradient(to right, ${editingSlide.overlay_color || "#02070D"} 0%, ${editingSlide.overlay_color || "#02070D"}E6 40%, transparent 100%)`,
                      }}
                    />
                  </>
                ) : (
                  /* Modo Mobile: Fundo Escuro Sem Foto */
                  <div className="absolute inset-0 bg-[#02070D]">
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-400/[0.04] blur-2xl" />
                    <div className="absolute bottom-4 -left-10 w-36 h-36 rounded-full bg-sky-500/[0.04] blur-2xl" />
                  </div>
                )}

                {/* Conteúdo Sobreposto na Prévia */}
                {!editingSlide.show_only_photo ? (
                  previewMode === "mobile" ? (
                    /* PRÉVIA MOBILE FLUIDA (EM DUAS ZONAS) */
                    <div className="absolute inset-0 p-3.5 flex flex-col justify-between z-10 text-white overflow-hidden pointer-events-none">
                      {/* Zona 1: Textos, Botões e Selo Mercado Pago */}
                      <div className="space-y-1.5 max-w-full">
                        {editingSlide.show_badge_quality && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-950/80 border border-white/10 text-amber-300 text-[8px] font-bold uppercase">
                            {editingSlide.badge_quality_text || "QUALIDADE QUE VOCÊ VÊ"}
                          </span>
                        )}
                        {editingSlide.show_title && (
                          <h4 className="text-xs font-light leading-tight">
                            Mais que óculos, <strong className="text-amber-400">é sobre você.</strong>
                          </h4>
                        )}
                        {editingSlide.show_description && (
                          <p className="text-[8px] text-slate-300 line-clamp-2">
                            Tecnologia, curadoria autoral e laboratório próprio...
                          </p>
                        )}
                        {editingSlide.show_buttons && (
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[7px]">
                              {editingSlide.primary_button_text || "Catálogo"}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-white/20 text-white text-[7px]">
                              {editingSlide.secondary_button_text || "Armações"}
                            </span>
                          </div>
                        )}
                        {(settings.show_secure_badge ?? true) && (
                          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-900/90 border border-white/15 text-[6.5px] text-slate-200 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#009EE3]" />
                            <span className="truncate max-w-[130px]">
                              {settings.secure_badge_text || "Compra segura Mercado Pago"}
                            </span>
                          </div>
                        )}
                        {editingSlide.show_trust_markers && (
                          <div className="flex items-center gap-2 pt-1 border-t border-white/10 text-[6.5px] text-slate-300">
                            <span>Lab Próprio</span>
                            <span>Pronto em 1h</span>
                            <span>100% Autoral</span>
                          </div>
                        )}
                      </div>

                      {/* Zona 2: Badge sutil sobre o óculos na base */}
                      {editingSlide.show_badge_stock && (
                        <div className="self-start px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/10 text-[6.5px] text-slate-300">
                          {editingSlide.badge_stock_text || "Em Estoque · Envio Imediato"}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* PRÉVIA DESKTOP */
                    <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between z-10 text-white pointer-events-none">
                      <div className="max-w-[62%] space-y-1.5">
                        {editingSlide.show_badge_quality && (
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-bold uppercase">
                            {editingSlide.badge_quality_text || "QUALIDADE QUE VOCÊ VÊ"}
                          </span>
                        )}
                        {editingSlide.show_title && (
                          <h4 className="text-base sm:text-xl font-light leading-tight">
                            Mais que óculos, <strong className="text-amber-400">é sobre você.</strong>
                          </h4>
                        )}
                        {editingSlide.show_description && (
                          <p className="text-[10px] text-slate-300 line-clamp-2 max-w-md">
                            {editingSlide.description_text ||
                              "Na Óticas Ventara, unimos tecnologia de precisão e curadoria autoral..."}
                          </p>
                        )}
                        {editingSlide.show_buttons && (
                          <div className="flex items-center gap-2 pt-1.5">
                            <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-bold text-[9px]">
                              {editingSlide.primary_button_text || "Catálogo de Lentes"}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-slate-900 border border-white/20 text-white text-[9px]">
                              {editingSlide.secondary_button_text || "Ver armações"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Badges Flutuantes na Direita Desktop */}
                      <div className="absolute top-5 right-5 flex flex-col items-end gap-2 max-w-[35%]">
                        {editingSlide.show_badge_style && (
                          <div className="px-3 py-1.5 rounded-full bg-slate-950/90 border border-amber-400/40 text-[9px] text-amber-300 font-bold uppercase truncate">
                            {editingSlide.badge_style_text}
                          </div>
                        )}
                        {editingSlide.show_badge_stock && (
                          <div className="px-3 py-1 rounded-full bg-slate-950/90 border border-white/10 text-[9px] text-slate-300 truncate">
                            {editingSlide.badge_stock_text}
                          </div>
                        )}
                        {editingSlide.show_badge_curation && (
                          <div className="px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[9px] truncate">
                            {editingSlide.badge_curation_text}
                          </div>
                        )}
                      </div>

                      {/* Rodapé Desktop */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
                        {editingSlide.show_trust_markers ? (
                          <div className="flex items-center gap-3">
                            <span>Lab Próprio · Araçatuba-SP</span>
                            <span>Pronto em 1h</span>
                            <span>100% Autoral</span>
                          </div>
                        ) : (
                          <span>ESTILO · PRESENÇA · IDENTIDADE</span>
                        )}
                        {(settings.show_secure_badge ?? true) && (
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-white/15 text-slate-200 text-[8.5px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#009EE3]" />
                            <span>{settings.secure_badge_text || "Compra segura com Mercado Pago"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="absolute top-3 left-3 bg-purple-900/80 text-purple-200 text-[9px] font-bold px-2 py-0.5 rounded">
                    [Modo Somente Foto Ativo]
                  </div>
                )}
              </div>
            </div>

            {/* FORMULÁRIO DE EDIÇÃO */}
            <form onSubmit={handleSaveSlide} className="space-y-6">
              {/* SEÇÃO 1: FOTOS (DESKTOP E MOBILE) */}
              <div className="bg-[#030913] p-5 rounded-xl border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Monitor size={14} className="text-amber-400" />
                  <span>1. Imagens do Fundo (Desktop &amp; Mobile)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Foto Desktop */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Foto Desktop (Full-Bleed) *
                    </label>
                    <input
                      type="text"
                      value={editingSlide.image_url_desktop}
                      onChange={(e) =>
                        setEditingSlide((prev) =>
                          prev ? { ...prev, image_url_desktop: e.target.value } : null
                        )
                      }
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-lg bg-[#06111f] border border-white/10 text-xs text-white"
                      required
                    />
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-xs font-semibold cursor-pointer border border-amber-400/30">
                      <Upload size={14} />
                      <span>{isUploadingDesktop ? "Enviando..." : "Fazer Upload Desktop (Máx 5MB)"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleImageUpload(e, "desktop")}
                        className="hidden"
                        disabled={isUploadingDesktop}
                      />
                    </label>
                  </div>

                  {/* Foto Mobile Opcional */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Foto Mobile (Opcional - Formato Vertical)
                    </label>
                    <input
                      type="text"
                      value={editingSlide.image_url_mobile || ""}
                      onChange={(e) =>
                        setEditingSlide((prev) =>
                          prev ? { ...prev, image_url_mobile: e.target.value || null } : null
                        )
                      }
                      placeholder="https://... (deixe vazio para usar a mesma do desktop)"
                      className="w-full px-3 py-2 rounded-lg bg-[#06111f] border border-white/10 text-xs text-white"
                    />
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold cursor-pointer border border-sky-400/30">
                      <Smartphone size={14} />
                      <span>{isUploadingMobile ? "Enviando..." : "Fazer Upload Mobile"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleImageUpload(e, "mobile")}
                        className="hidden"
                        disabled={isUploadingMobile}
                      />
                    </label>
                  </div>
                </div>

                {/* Alt text e Link de Clique */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Texto Alternativo (Alt Text)
                    </label>
                    <input
                      type="text"
                      value={editingSlide.alt_text}
                      onChange={(e) =>
                        setEditingSlide((prev) =>
                          prev ? { ...prev, alt_text: e.target.value } : null
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#06111f] border border-white/10 text-xs text-white"
                      placeholder="Ex: Campanha Solar Ventara 2026"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Link ao Clicar no Slide (Opcional)
                    </label>
                    <input
                      type="text"
                      value={editingSlide.click_url || ""}
                      onChange={(e) =>
                        setEditingSlide((prev) =>
                          prev ? { ...prev, click_url: e.target.value || null } : null
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#06111f] border border-white/10 text-xs text-white"
                      placeholder="Ex: /produto/ventara-safari"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: ENQUADRAMENTO FOCAL & OVERLAY */}
              <div className="bg-[#030913] p-5 rounded-xl border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Palette size={14} className="text-amber-400" />
                  <span>2. Enquadramento (Ponto Focal) &amp; Overlay Escuro</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Ponto Focal Desktop */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Ponto Focal (Desktop)
                    </label>
                    <select
                      value={editingSlide.focal_point_desktop}
                      onChange={(e) =>
                        setEditingSlide((prev) =>
                          prev
                            ? { ...prev, focal_point_desktop: e.target.value as HeroFocalPoint }
                            : null
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#06111f] border border-white/10 text-xs text-white"
                    >
                      <option value="center">Centro</option>
                      <option value="top">Topo</option>
                      <option value="bottom">Base</option>
                      <option value="left">Esquerda</option>
                      <option value="right">Direita</option>
                      <option value="custom">Personalizado (X e Y)</option>
                    </select>
                  </div>

                  {/* Modo de Ajuste */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Modo de Ajuste da Foto
                    </label>
                    <select
                      value={editingSlide.fit_mode}
                      onChange={(e) =>
                        setEditingSlide((prev) =>
                          prev ? { ...prev, fit_mode: e.target.value as HeroFitMode } : null
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#06111f] border border-white/10 text-xs text-white"
                    >
                      <option value="cover">Cover (Cobrir tudo)</option>
                      <option value="contain">Contain (Sem corte)</option>
                    </select>
                  </div>

                  {/* Intensidade do Overlay */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span>Intensidade do Overlay</span>
                      <span className="text-amber-400 font-mono">
                        {editingSlide.overlay_intensity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={editingSlide.overlay_intensity}
                      onChange={(e) =>
                        setEditingSlide((prev) =>
                          prev ? { ...prev, overlay_intensity: Number(e.target.value) } : null
                        )
                      }
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Sliders de Ponto Focal Customizado se selecionado */}
                {editingSlide.focal_point_desktop === "custom" && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Posição Horizontal (X)</span>
                        <span className="font-mono text-amber-400">
                          {editingSlide.custom_position_x ?? 50}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={editingSlide.custom_position_x ?? 50}
                        onChange={(e) =>
                          setEditingSlide((prev) =>
                            prev
                              ? { ...prev, custom_position_x: Number(e.target.value) }
                              : null
                          )
                        }
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Posição Vertical (Y)</span>
                        <span className="font-mono text-amber-400">
                          {editingSlide.custom_position_y ?? 50}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={editingSlide.custom_position_y ?? 50}
                        onChange={(e) =>
                          setEditingSlide((prev) =>
                            prev
                              ? { ...prev, custom_position_y: Number(e.target.value) }
                              : null
                          )
                        }
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SEÇÃO 3: BADGES E TEXTOS SOBRE A FOTO COM CONTROLE INDIVIDUAL */}
              <div className="bg-[#030913] p-5 rounded-xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={14} className="text-amber-400" />
                    <span>3. Textos &amp; Badges Sobrepostos</span>
                  </h4>

                  {/* TOGGLE MESTRE: MOSTRAR SOMENTE A FOTO */}
                  <label className="flex items-center gap-2 text-xs font-bold text-purple-300 bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-400/40 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingSlide.show_only_photo}
                      onChange={(e) =>
                        setEditingSlide((prev) =>
                          prev ? { ...prev, show_only_photo: e.target.checked } : null
                        )
                      }
                      className="w-4 h-4 accent-purple-400 rounded cursor-pointer"
                    />
                    <span>Mostrar somente a foto (Sem nenhum texto)</span>
                  </label>
                </div>

                {!editingSlide.show_only_photo && (
                  <div className="space-y-4">
                    {/* Badge 1: ARMAÇÕES DE QUALIDADE E ESTILO */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-[#06111f] p-3 rounded-lg border border-white/5">
                      <div className="sm:col-span-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingSlide.show_badge_style}
                          onChange={(e) =>
                            setEditingSlide((prev) =>
                              prev ? { ...prev, show_badge_style: e.target.checked } : null
                            )
                          }
                          className="w-4 h-4 accent-amber-400 rounded"
                        />
                        <span className="text-xs text-white font-medium">Badge Superior</span>
                      </div>
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          value={editingSlide.badge_style_text}
                          onChange={(e) =>
                            setEditingSlide((prev) =>
                              prev ? { ...prev, badge_style_text: e.target.value } : null
                            )
                          }
                          disabled={!editingSlide.show_badge_style}
                          className="w-full px-3 py-1.5 rounded bg-[#030913] border border-white/10 text-xs text-white disabled:opacity-40"
                          placeholder="ARMAÇÕES DE QUALIDADE E ESTILO"
                        />
                      </div>
                    </div>

                    {/* Badge 2: Em Estoque · Envio Imediato */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-[#06111f] p-3 rounded-lg border border-white/5">
                      <div className="sm:col-span-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingSlide.show_badge_stock}
                          onChange={(e) =>
                            setEditingSlide((prev) =>
                              prev ? { ...prev, show_badge_stock: e.target.checked } : null
                            )
                          }
                          className="w-4 h-4 accent-amber-400 rounded"
                        />
                        <span className="text-xs text-white font-medium">Badge de Estoque</span>
                      </div>
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          value={editingSlide.badge_stock_text}
                          onChange={(e) =>
                            setEditingSlide((prev) =>
                              prev ? { ...prev, badge_stock_text: e.target.value } : null
                            )
                          }
                          disabled={!editingSlide.show_badge_stock}
                          className="w-full px-3 py-1.5 rounded bg-[#030913] border border-white/10 text-xs text-white disabled:opacity-40"
                          placeholder="Em Estoque · Envio Imediato"
                        />
                      </div>
                    </div>

                    {/* Badge 3: Curadoria Autoral Ventara */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-[#06111f] p-3 rounded-lg border border-white/5">
                      <div className="sm:col-span-4 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingSlide.show_badge_curation}
                          onChange={(e) =>
                            setEditingSlide((prev) =>
                              prev ? { ...prev, show_badge_curation: e.target.checked } : null
                            )
                          }
                          className="w-4 h-4 accent-amber-400 rounded"
                        />
                        <span className="text-xs text-white font-medium">Botão / Badge Curadoria</span>
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={editingSlide.badge_curation_text}
                          onChange={(e) =>
                            setEditingSlide((prev) =>
                              prev ? { ...prev, badge_curation_text: e.target.value } : null
                            )
                          }
                          disabled={!editingSlide.show_badge_curation}
                          className="w-full px-3 py-1.5 rounded bg-[#030913] border border-white/10 text-xs text-white disabled:opacity-40"
                          placeholder="Curadoria Autoral Ventara..."
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={editingSlide.badge_curation_url}
                          onChange={(e) =>
                            setEditingSlide((prev) =>
                              prev ? { ...prev, badge_curation_url: e.target.value } : null
                            )
                          }
                          disabled={!editingSlide.show_badge_curation}
                          className="w-full px-3 py-1.5 rounded bg-[#030913] border border-white/10 text-xs text-white disabled:opacity-40"
                          placeholder="/catalogo"
                        />
                      </div>
                    </div>

                    {/* Toggles Adicionais (Título, Descrição, Botões) */}
                    <div className="pt-2 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingSlide.show_title}
                          onChange={(e) =>
                            setEditingSlide((prev) =>
                              prev ? { ...prev, show_title: e.target.checked } : null
                            )
                          }
                          className="w-3.5 h-3.5 accent-amber-400"
                        />
                        <span>Título Principal</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingSlide.show_description}
                          onChange={(e) =>
                            setEditingSlide((prev) =>
                              prev ? { ...prev, show_description: e.target.checked } : null
                            )
                          }
                          className="w-3.5 h-3.5 accent-amber-400"
                        />
                        <span>Texto Descritivo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingSlide.show_buttons}
                          onChange={(e) =>
                            setEditingSlide((prev) =>
                              prev ? { ...prev, show_buttons: e.target.checked } : null
                            )
                          }
                          className="w-3.5 h-3.5 accent-amber-400"
                        />
                        <span>Botões de Ação</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingSlide.show_trust_markers}
                          onChange={(e) =>
                            setEditingSlide((prev) =>
                              prev ? { ...prev, show_trust_markers: e.target.checked } : null
                            )
                          }
                          className="w-3.5 h-3.5 accent-amber-400"
                        />
                        <span>Lab &amp; Diferenciais</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTÕES DE AÇÃO DO FORMULÁRIO */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingSlide}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
                >
                  <Save size={15} />
                  <span>{isSavingSlide ? "Salvando..." : "Salvar & Publicar Slide"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
