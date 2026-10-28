"use client";

import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Upload,
  Save,
  Sun,
  Glasses,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  HomepageBanner,
  ShowcaseMediaSettings,
  PromotionalShowcaseSettings,
  PromoProductItem,
} from "@/types/ecommerce";
import {
  DEFAULT_SHOWCASE_MEDIA,
  DEFAULT_PROMOTIONAL_SHOWCASE,
} from "@/lib/site-settings-constants";

export default function AdminBannersPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"banners" | "vitrines" | "promocoes">("banners");
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [showcaseMedia, setShowcaseMedia] = useState<ShowcaseMediaSettings>(DEFAULT_SHOWCASE_MEDIA);
  const [promotionalShowcase, setPromotionalShowcase] =
    useState<PromotionalShowcaseSettings>(DEFAULT_PROMOTIONAL_SHOWCASE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [isSavingPromo, setIsSavingPromo] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadingPromoId, setUploadingPromoId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Formulário de novo banner
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newCtaText, setNewCtaText] = useState("Explorar");
  const [newCtaUrl, setNewCtaUrl] = useState("#armacoes");
  const [newDesktopImg, setNewDesktopImg] = useState("");
  const [newMobileImg, setNewMobileImg] = useState("");
  const [newAltText, setNewAltText] = useState("");
  const [newSortOrder, setNewSortOrder] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("homepage_banners")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setBanners(data as HomepageBanner[]);
      } else {
        setBanners([]);
      }
    } catch (err) {
      console.warn("Erro ao carregar banners do Supabase:", err);
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShowcaseMedia = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.showcase_media) {
          setShowcaseMedia((prev) => ({ ...prev, ...data.showcase_media }));
        }
        if (data.promotional_showcase) {
          setPromotionalShowcase((prev) => ({ ...prev, ...data.promotional_showcase }));
        }
      }
    } catch (err) {
      console.warn("Erro ao carregar mídias das vitrines:", err);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchShowcaseMedia();
  }, []);

  const handleShowcaseUpload = async (
    field: keyof ShowcaseMediaSettings,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro no upload.");
      }

      if (data.url) {
        setShowcaseMedia((prev) => ({ ...prev, [field]: data.url }));
        setFeedback("Imagem enviada! Clique em 'Salvar Fotos das Seções' para aplicar.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Erro no upload.");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSaveShowcaseMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMedia(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showcase_media: showcaseMedia }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar fotos.");
      }

      setFeedback("Fotos das seções salvas e aplicadas com sucesso no site!");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || "Falha ao salvar fotos.");
    } finally {
      setIsSavingMedia(false);
    }
  };

  const handlePromoItemUpload = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPromoId(itemId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao fazer upload da foto.");
      }

      if (data.url) {
        setPromotionalShowcase((prev) => ({
          ...prev,
          items: prev.items.map((it) => (it.id === itemId ? { ...it, image: data.url } : it)),
        }));
        setFeedback("Foto do modelo atualizada! Clique em 'Salvar Ofertas Promocionais' para aplicar.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Falha no envio da imagem.");
    } finally {
      setUploadingPromoId(null);
    }
  };

  const handleSavePromotionalShowcase = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingPromo(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promotional_showcase: promotionalShowcase }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar vitrine promocional.");
      }

      setFeedback("Vitrine 25% OFF e modelos promocionais salvos com sucesso!");
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro inesperado ao salvar vitrine.");
    } finally {
      setIsSavingPromo(false);
    }
  };

  const handleAddPromoItem = () => {
    const newItem: PromoProductItem = {
      id: `promo-${Date.now()}`,
      name: "Novo Modelo em Oferta",
      category: "Armação de Grau",
      tag: "Oferta",
      discountBadge: "-25% OFF",
      originalPrice: "R$ 499,00",
      promotionalPrice: "R$ 374,25",
      installment: "10x de R$ 37,42 sem juros",
      image: "/images/products/urbano-black.png",
      colorName: "Preto Clássico",
      colorHex: "#0f172a",
      slug: "ventara-safari",
      description: "Armação leve em acetato com garantia de 1 ano.",
      extraColorsCount: 2,
    };
    setPromotionalShowcase((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleDeletePromoItem = (id: string) => {
    if (confirm("Remover este modelo da vitrine de ofertas?")) {
      setPromotionalShowcase((prev) => ({
        ...prev,
        items: prev.items.filter((it) => it.id !== id),
      }));
    }
  };

  const isValidUrl = (url: string): boolean => {
    if (!url) return false;
    // Permite âncoras locais (#armacoes, #lentes) e URLs absolutas seguras (https://)
    if (url.startsWith("#") || url.startsWith("/")) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newTitle.trim()) {
      setFormError("O título do banner é obrigatório.");
      return;
    }

    if (!newDesktopImg.trim()) {
      setFormError("Informe a URL da imagem para desktop.");
      return;
    }

    if (!newAltText.trim()) {
      setFormError("O texto alternativo de acessibilidade (Alt) é obrigatório.");
      return;
    }

    if (!isValidUrl(newCtaUrl)) {
      setFormError("Destino do botão inválido. Use um link seguro (#ancora ou https://).");
      return;
    }

    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          subtitle: newSubtitle.trim() || null,
          cta_text: newCtaText.trim() || null,
          cta_url: newCtaUrl.trim() || null,
          image_url_desktop: newDesktopImg.trim(),
          image_url_mobile: newMobileImg.trim() || null,
          alt_text: newAltText.trim(),
          sort_order: newSortOrder,
          is_published: true,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setFormError(json.error || "Erro ao cadastrar banner no Supabase.");
        return;
      }

      if (json.banner) {
        setBanners((prev) => [...prev, json.banner as HomepageBanner]);
      }

      setFeedback("Banner criado com sucesso!");
      setIsCreating(false);
      setNewTitle("");
      setNewSubtitle("");
      setNewDesktopImg("");
      setNewMobileImg("");
      setNewAltText("");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Falha na comunicação com o servidor.");
    }
  };

  const togglePublish = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_published: !current }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setFeedback("Não foi possível atualizar o banner.");
        setTimeout(() => setFeedback(null), 3000);
        return;
      }

      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, is_published: !current } : b))
      );
      setFeedback(!current ? "Banner publicado." : "Banner despublicado.");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error(err);
      setFeedback("Erro na comunicação com o servidor.");
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const deleteBanner = async (id: string, title: string) => {
    if (!window.confirm(`Deseja remover o banner "${title}"?`)) return;

    try {
      const res = await fetch("/api/admin/banners", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setFeedback("Não foi possível remover o banner.");
        setTimeout(() => setFeedback(null), 3000);
        return;
      }

      setBanners((prev) => prev.filter((b) => b.id !== id));
      setFeedback("Banner removido.");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error(err);
      setFeedback("Erro ao remover banner.");
      setTimeout(() => setFeedback(null), 3000);
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
            DESTAQUES &amp; COMUNICAÇÃO VISUAL
          </span>
          <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
            Gestão de <span className="font-normal text-amber-400">Banners &amp; Vitrines</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure os banners rotativos, fotos dos óculos esportivos, lifestyle de armações e banner de garantia.
          </p>
        </div>

        {activeTab === "banners" && (
          <button
            type="button"
            onClick={() => setIsCreating((prev) => !prev)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all self-start sm:self-auto cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            <span>{isCreating ? "Fechar Formulário" : "Novo Banner"}</span>
          </button>
        )}
      </div>

      {/* Seletor de Abas */}
      <div className="flex items-center gap-2 bg-[#06111f] p-2 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("banners")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "banners"
              ? "bg-amber-400 text-slate-950 font-bold shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ImageIcon size={14} />
          <span>Banners Rotativos ({banners.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vitrines")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "vitrines"
              ? "bg-amber-400 text-slate-950 font-bold shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sun size={14} />
          <span>Fotos das Vitrines (Esportivos &amp; Seções)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("promocoes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "promocoes"
              ? "bg-amber-400 text-slate-950 font-bold shadow-md"
              : "text-amber-400 hover:bg-amber-400/10 border border-amber-400/30"
          }`}
        >
          <Sparkles size={14} />
          <span>Vitrine 25% OFF (Fundo Branco)</span>
        </button>
      </div>

      {/* ABA 2: FOTOS DAS VITRINES E SEÇÕES */}
      {activeTab === "vitrines" && (
        <form onSubmit={handleSaveShowcaseMedia} className="space-y-6">
          <div className="bg-[#06111f] border border-amber-400/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  FOTOS EM DESTAQUE NO SITE
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Fotos das Seções &amp; Vitrines Interativas
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Troque facilmente as fotos dos modelos usando óculos esportivos, solares contemporâneos e armações de grau.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSavingMedia}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer self-start sm:self-auto"
              >
                <Save size={15} />
                <span>{isSavingMedia ? "Salvando..." : "Salvar Fotos das Seções"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* 1. Vitrine Esportiva (Hero Masculino - Conforme foto do usuário) */}
              <div className="bg-[#091829] border border-amber-400/30 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <Sun size={16} className="text-amber-400" />
                    <span>Óculos Esportivos (Hero Masculino)</span>
                  </span>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    Vitrine Principal
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Foto do modelo masculino ao ar livre com óculos esportivos ("Mais que óculos, é sobre você").
                </p>

                <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/40 border border-white/10 relative group">
                  <img
                    src={showcaseMedia.heroMaleSolar || "/images/lifestyle/male-solar.jpg"}
                    alt="Óculos Esportivos Masculino"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                    <Upload size={14} />
                    <span>{uploadingField === "heroMaleSolar" ? "Enviando Imagem..." : "Trocar Foto dos Óculos Esportivos"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingField !== null}
                      onChange={(e) => handleShowcaseUpload("heroMaleSolar", e)}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={showcaseMedia.heroMaleSolar}
                    onChange={(e) =>
                      setShowcaseMedia({ ...showcaseMedia, heroMaleSolar: e.target.value })
                    }
                    placeholder="/images/lifestyle/male-solar.jpg"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* 2. Vitrine Solar Feminina */}
              <div className="bg-[#091829] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <Sun size={16} className="text-amber-400" />
                    <span>Vitrine Solar Contemporânea (Feminina)</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-300 bg-white/5 px-2 py-0.5 rounded-full">
                    Solar Feminino
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Foto da modelo feminina com óculos de sol contemporâneo ("Elegância e luz para o seu olhar").
                </p>

                <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/40 border border-white/10 relative group">
                  <img
                    src={showcaseMedia.heroFemaleSolar || "/images/lifestyle/female-solar.jpg"}
                    alt="Solar Feminino"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-white/15">
                    <Upload size={14} />
                    <span>{uploadingField === "heroFemaleSolar" ? "Enviando Imagem..." : "Trocar Foto Solar Feminino"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingField !== null}
                      onChange={(e) => handleShowcaseUpload("heroFemaleSolar", e)}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={showcaseMedia.heroFemaleSolar}
                    onChange={(e) =>
                      setShowcaseMedia({ ...showcaseMedia, heroFemaleSolar: e.target.value })
                    }
                    placeholder="/images/lifestyle/female-solar.jpg"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* 3. Vitrine Grau Masculino */}
              <div className="bg-[#091829] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <Glasses size={16} className="text-amber-400" />
                    <span>Vitrine Grau Masculino (Titânio &amp; Acetato)</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-300 bg-white/5 px-2 py-0.5 rounded-full">
                    Grau Masculino
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Foto do modelo com armação de grau executiva ("Precisão que define sua presença").
                </p>

                <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/40 border border-white/10 relative group">
                  <img
                    src={showcaseMedia.heroMaleGrau || "/images/lifestyle/male-grau.jpg"}
                    alt="Grau Masculino"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-white/15">
                    <Upload size={14} />
                    <span>{uploadingField === "heroMaleGrau" ? "Enviando..." : "Trocar Foto Grau Masculino"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingField !== null}
                      onChange={(e) => handleShowcaseUpload("heroMaleGrau", e)}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={showcaseMedia.heroMaleGrau}
                    onChange={(e) =>
                      setShowcaseMedia({ ...showcaseMedia, heroMaleGrau: e.target.value })
                    }
                    placeholder="/images/lifestyle/male-grau.jpg"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* 4. Vitrine Grau Feminino */}
              <div className="bg-[#091829] border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <Glasses size={16} className="text-amber-400" />
                    <span>Vitrine Grau Feminino (Acetato Premium)</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-300 bg-white/5 px-2 py-0.5 rounded-full">
                    Grau Feminino
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Foto da modelo com armação de grau autoral ("Harmonização facial e leveza contínua").
                </p>

                <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/40 border border-white/10 relative group">
                  <img
                    src={showcaseMedia.heroFemaleGrau || "/images/lifestyle/female-grau.jpg"}
                    alt="Grau Feminino"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-white/15">
                    <Upload size={14} />
                    <span>{uploadingField === "heroFemaleGrau" ? "Enviando..." : "Trocar Foto Grau Feminino"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingField !== null}
                      onChange={(e) => handleShowcaseUpload("heroFemaleGrau", e)}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={showcaseMedia.heroFemaleGrau}
                    onChange={(e) =>
                      setShowcaseMedia({ ...showcaseMedia, heroFemaleGrau: e.target.value })
                    }
                    placeholder="/images/lifestyle/female-grau.jpg"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* 5. Banner de Garantia 12 Meses (Desktop e Mobile) */}
              <div className="md:col-span-2 bg-[#091829] border border-amber-400/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-400" />
                    <span>Banner de 12 Meses de Garantia (OPTiSYNC HD)</span>
                  </span>
                  <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    Garantia Oficial
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Banner exibido na página inicial do site logo abaixo do hero cinematográfico.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Desktop */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-300 block">
                      Versão Desktop (Horizontal 3:1)
                    </span>
                    <div className="aspect-[3/1] w-full rounded-xl overflow-hidden bg-black/40 border border-white/10">
                      <img
                        src={showcaseMedia.warrantyBannerDesktop || "/images/banners/optisync-12-meses-garantia-desktop.jpg"}
                        alt="Banner Garantia Desktop"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-white/15">
                      <Upload size={13} />
                      <span>{uploadingField === "warrantyBannerDesktop" ? "Enviando..." : "Trocar Banner Desktop"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingField !== null}
                        onChange={(e) => handleShowcaseUpload("warrantyBannerDesktop", e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Mobile */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-300 block">
                      Versão Mobile (Proporcional 2.4:1)
                    </span>
                    <div className="aspect-[2.4/1] w-full rounded-xl overflow-hidden bg-black/40 border border-white/10">
                      <img
                        src={showcaseMedia.warrantyBannerMobile || "/images/banners/optisync-12-meses-garantia-desktop.jpg"}
                        alt="Banner Garantia Mobile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm border border-white/15">
                      <Upload size={13} />
                      <span>{uploadingField === "warrantyBannerMobile" ? "Enviando..." : "Trocar Banner Mobile"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingField !== null}
                        onChange={(e) => handleShowcaseUpload("warrantyBannerMobile", e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ABA 3: VITRINE PROMOCIONAL 25% OFF (FUNDO BRANCO) */}
      {activeTab === "promocoes" && (
        <form onSubmit={handleSavePromotionalShowcase} className="space-y-6">
          <div className="bg-[#06111f] border border-amber-400/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  VITRINE EDITÁVEL · FUNDO BRANCO
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Vitrine 25% OFF em Modelos Selecionados
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                  Edite o título, texto do selo, subtítulo e cada um dos modelos em oferta especial com fotos, descontos, preços e cores. Esta seção é exibida com fundo branco limpo na home do site.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddPromoItem}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-all border border-white/15"
                >
                  <Plus size={15} />
                  <span>Novo Modelo</span>
                </button>

                <button
                  type="submit"
                  disabled={isSavingPromo}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
                >
                  <Save size={15} />
                  <span>{isSavingPromo ? "Salvando..." : "Salvar Vitrine"}</span>
                </button>
              </div>
            </div>

            {/* Configurações Gerais do Bloco */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs bg-[#0b1728] p-5 rounded-2xl border border-white/10">
              <div className="sm:col-span-2 lg:col-span-1 flex items-center justify-between p-3 rounded-xl bg-[#040c16] border border-white/10">
                <div>
                  <span className="text-white font-semibold block">Exibir Vitrine no Site</span>
                  <span className="text-[10px] text-slate-400">Ativa ou oculta a seção</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={promotionalShowcase.isEnabled}
                    onChange={(e) =>
                      setPromotionalShowcase({ ...promotionalShowcase, isEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Selo Superior (Tag)</label>
                <input
                  type="text"
                  value={promotionalShowcase.pillText}
                  onChange={(e) =>
                    setPromotionalShowcase({ ...promotionalShowcase, pillText: e.target.value })
                  }
                  placeholder="Ex: OFERTA POR TEMPO LIMITADO"
                  className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Título Principal</label>
                <input
                  type="text"
                  value={promotionalShowcase.title}
                  onChange={(e) =>
                    setPromotionalShowcase({ ...promotionalShowcase, title: e.target.value })
                  }
                  placeholder="Ex: Até 25% OFF em modelos selecionados"
                  className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Texto do Link de Ofertas</label>
                <input
                  type="text"
                  value={promotionalShowcase.ctaText || "Ver todas as ofertas"}
                  onChange={(e) =>
                    setPromotionalShowcase({ ...promotionalShowcase, ctaText: e.target.value })
                  }
                  placeholder="Ex: Ver todas as ofertas"
                  className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <label className="block text-slate-400 mb-1 font-medium">Subtítulo / Descrição da Seção</label>
                <input
                  type="text"
                  value={promotionalShowcase.subtitle}
                  onChange={(e) =>
                    setPromotionalShowcase({ ...promotionalShowcase, subtitle: e.target.value })
                  }
                  placeholder="Subtítulo descritivo"
                  className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Modelos em Oferta */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Tag size={15} className="text-amber-400" />
                  <span>Modelos com Desconto ({promotionalShowcase.items.length})</span>
                </h3>
                <span className="text-xs text-slate-400">
                  Cada card possui botão direto para comprar no WhatsApp com mensagem personalizada
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {promotionalShowcase.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-[#0b1728] border border-white/10 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-amber-400/40 transition-colors"
                  >
                    <div>
                      {/* Top bar do card */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeletePromoItem(item.id)}
                          className="p-1 rounded-md text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Remover modelo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Preview da imagem em fundo branco como no site */}
                      <div className="aspect-[4/3] w-full rounded-xl bg-white p-3 flex items-center justify-center overflow-hidden border border-slate-200 mb-2 relative">
                        <span className="absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                          {item.discountBadge || "-25% OFF"}
                        </span>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Botão de Trocar Imagem via Upload */}
                      <label className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-xs mb-3">
                        <Upload size={12} />
                        <span>
                          {uploadingPromoId === item.id ? "Enviando..." : "Trocar Foto do Óculos"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingPromoId === item.id}
                          onChange={(e) => handlePromoItemUpload(item.id, e)}
                        />
                      </label>

                      {/* Campos Editáveis */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block text-slate-400 text-[11px] mb-0.5">Nome do Modelo</label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              setPromotionalShowcase((prev) => ({
                                ...prev,
                                items: prev.items.map((it) =>
                                  it.id === item.id ? { ...it, name: e.target.value } : it
                                ),
                              }))
                            }
                            className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-slate-400 text-[11px] mb-0.5">Categoria</label>
                            <input
                              type="text"
                              value={item.category}
                              onChange={(e) =>
                                setPromotionalShowcase((prev) => ({
                                  ...prev,
                                  items: prev.items.map((it) =>
                                    it.id === item.id ? { ...it, category: e.target.value } : it
                                  ),
                                }))
                              }
                              className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[11px] mb-0.5">Selo Desconto</label>
                            <input
                              type="text"
                              value={item.discountBadge}
                              onChange={(e) =>
                                setPromotionalShowcase((prev) => ({
                                  ...prev,
                                  items: prev.items.map((it) =>
                                    it.id === item.id ? { ...it, discountBadge: e.target.value } : it
                                  ),
                                }))
                              }
                              className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-slate-400 text-[11px] mb-0.5">Preço Original</label>
                            <input
                              type="text"
                              value={item.originalPrice}
                              onChange={(e) =>
                                setPromotionalShowcase((prev) => ({
                                  ...prev,
                                  items: prev.items.map((it) =>
                                    it.id === item.id ? { ...it, originalPrice: e.target.value } : it
                                  ),
                                }))
                              }
                              className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[11px] mb-0.5">Preço c/ Desconto</label>
                            <input
                              type="text"
                              value={item.promotionalPrice}
                              onChange={(e) =>
                                setPromotionalShowcase((prev) => ({
                                  ...prev,
                                  items: prev.items.map((it) =>
                                    it.id === item.id ? { ...it, promotionalPrice: e.target.value } : it
                                  ),
                                }))
                              }
                              className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-400 text-[11px] mb-0.5">Parcelamento</label>
                          <input
                            type="text"
                            value={item.installment}
                            onChange={(e) =>
                              setPromotionalShowcase((prev) => ({
                                ...prev,
                                items: prev.items.map((it) =>
                                  it.id === item.id ? { ...it, installment: e.target.value } : it
                                ),
                              }))
                            }
                            className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-slate-400 text-[11px] mb-0.5">Nome da Cor</label>
                            <input
                              type="text"
                              value={item.colorName}
                              onChange={(e) =>
                                setPromotionalShowcase((prev) => ({
                                  ...prev,
                                  items: prev.items.map((it) =>
                                    it.id === item.id ? { ...it, colorName: e.target.value } : it
                                  ),
                                }))
                              }
                              className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[11px] mb-0.5">Slug do Produto</label>
                            <input
                              type="text"
                              value={item.slug}
                              onChange={(e) =>
                                setPromotionalShowcase((prev) => ({
                                  ...prev,
                                  items: prev.items.map((it) =>
                                    it.id === item.id ? { ...it, slug: e.target.value } : it
                                  ),
                                }))
                              }
                              className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleAddPromoItem}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-all border border-white/15"
              >
                <Plus size={15} />
                <span>Adicionar Mais um Modelo</span>
              </button>

              <button
                type="submit"
                disabled={isSavingPromo}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
              >
                <Save size={15} />
                <span>{isSavingPromo ? "Salvando..." : "Salvar Vitrine Promocional"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ABA 1: BANNERS ROTATIVOS */}
      {activeTab === "banners" && (
        <div className="space-y-6">

      {/* Formulário de Criação com Pré-visualização */}
      {isCreating && (
        <form onSubmit={handleCreateBanner} className="bg-[#06111f] border border-amber-400/30 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Sparkles size={16} className="text-amber-400" />
            Cadastrar Novo Banner
          </h3>

          {formError && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Título Principal do Banner *</label>
              <input
                type="text"
                placeholder="Ex: Nova Coleção Solar Ventara"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Subtítulo / Descrição Curta</label>
              <input
                type="text"
                placeholder="Ex: Proteção UV400 com design autoral exclusivo."
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Texto do Botão (CTA)</label>
              <input
                type="text"
                placeholder="Ex: Ver Coleção"
                value={newCtaText}
                onChange={(e) => setNewCtaText(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Link de Destino Seguro (URL ou #âncora) *</label>
              <input
                type="text"
                placeholder="Ex: #armacoes ou https://wa.me/..."
                value={newCtaUrl}
                onChange={(e) => setNewCtaUrl(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              />
            </div>

            <div className="sm:col-span-2 p-3 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
                <Sparkles size={14} /> Modelos Prontos de Alta Conversão:
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewTitle("OPTiSYNC HD · 12 Meses de Garantia");
                  setNewSubtitle("Lentes de alta precisão com certificado de garantia de 1 ano contra defeitos e descascamento do antirreflexo.");
                  setNewCtaText("Conhecer Lentes");
                  setNewCtaUrl("#lentes");
                  setNewDesktopImg("/images/banners/optisync-12-meses-garantia-desktop.jpg");
                  setNewMobileImg("/images/banners/optisync-12-meses-garantia-mobile.jpg");
                  setNewAltText("Banner Oficial Lentes OPTiSYNC HD com 12 Meses de Garantia e Certificado Óticas Ventara");
                }}
                className="text-[11px] font-bold px-3 py-1 rounded-lg bg-amber-400/20 text-amber-300 hover:bg-amber-400 hover:text-slate-950 border border-amber-400/40 transition-colors cursor-pointer"
              >
                + Usar Banner 12 Meses de Garantia OPTiSYNC
              </button>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">URL Imagem Desktop (1920x600px recomendado) *</label>
              <input
                type="text"
                placeholder="https://..."
                value={newDesktopImg}
                onChange={(e) => setNewDesktopImg(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">URL Imagem Mobile (Opcional, 800x800px)</label>
              <input
                type="text"
                placeholder="https://..."
                value={newMobileImg}
                onChange={(e) => setNewMobileImg(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Texto Alternativo de Acessibilidade (Alt Text) *</label>
              <input
                type="text"
                placeholder="Descreva visualmente o banner para leitores de tela..."
                value={newAltText}
                onChange={(e) => setNewAltText(e.target.value)}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] text-xs font-bold uppercase tracking-wider"
            >
              Gravar Banner
            </button>
          </div>
        </form>
      )}

      {/* Lista de Banners */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6">
        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-8">Carregando banners...</p>
        ) : banners.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <ImageIcon size={32} className="mx-auto text-slate-500" />
            <p className="text-sm font-medium text-white">Nenhum banner cadastrado</p>
            <p className="text-xs text-slate-400">
              Cadastre banners para divulgar novas coleções ou comunicados no topo da página.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="p-4 rounded-xl bg-[#091d33] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-12 rounded-lg bg-black/40 border border-white/10 overflow-hidden flex-shrink-0">
                    <img
                      src={banner.image_url_desktop}
                      alt={banner.alt_text}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{banner.title}</h4>
                    <p className="text-xs text-slate-400">{banner.subtitle || "Sem subtítulo"}</p>
                    <span className="text-[10px] text-amber-400 font-mono mt-0.5 block">
                      Destino: {banner.cta_url}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <button
                    type="button"
                    onClick={() => togglePublish(banner.id, banner.is_published)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      banner.is_published
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-700/40 text-slate-400 border border-slate-600/30"
                    }`}
                  >
                    {banner.is_published ? (
                      <>
                        <Eye size={12} /> Publicado
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} /> Rascunho
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteBanner(banner.id, banner.title)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Excluir banner"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </div>
      )}
    </div>
  );
}
