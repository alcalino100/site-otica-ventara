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
  HeroBannerSettings,
} from "@/types/ecommerce";
import {
  DEFAULT_SHOWCASE_MEDIA,
  DEFAULT_PROMOTIONAL_SHOWCASE,
  DEFAULT_HERO_BANNER,
} from "@/lib/site-settings-constants";

export default function AdminBannersPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"hero" | "banners" | "vitrines" | "promocoes">("hero");
  const [banners, setBanners] = useState<HomepageBanner[]>([]);
  const [heroBanner, setHeroBanner] = useState<HeroBannerSettings>(DEFAULT_HERO_BANNER);
  const [showcaseMedia, setShowcaseMedia] = useState<ShowcaseMediaSettings>(DEFAULT_SHOWCASE_MEDIA);
  const [promotionalShowcase, setPromotionalShowcase] =
    useState<PromotionalShowcaseSettings>(DEFAULT_PROMOTIONAL_SHOWCASE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
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
        if (data.hero_banner) {
          setHeroBanner((prev) => ({ ...prev, ...data.hero_banner }));
        }
      }
    } catch (err) {
      console.warn("Erro ao carregar mídias das vitrines:", err);
    }
  };

  const handleSaveHeroBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingHero(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero_banner: heroBanner }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar banner do header.");
      }

      setFeedback("Banner principal, degradê e botões atualizados com sucesso!");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(err.message || "Erro inesperado ao salvar banner principal.");
    } finally {
      setIsSavingHero(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHero(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao enviar imagem do banner.");
      }

      if (data.url) {
        setHeroBanner((prev) => ({ ...prev, bannerImageUrl: data.url, mode: "fixed_banner" }));
        setFeedback("Imagem do banner principal enviada! Clique em 'Salvar Banner' para publicar.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Falha no envio da imagem.");
    } finally {
      setIsUploadingHero(false);
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
      imageFit: "cover",
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
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "hero"
              ? "bg-amber-400 text-slate-950 font-bold shadow-md"
              : "text-amber-400 hover:bg-amber-400/10 border border-amber-400/30"
          }`}
        >
          <Sparkles size={14} />
          <span>Banner Principal (Header Fixo)</span>
        </button>

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

      {/* ABA 0: BANNER PRINCIPAL (HEADER FIXO COM DEGRADÊ) */}
      {activeTab === "hero" && (
        <form onSubmit={handleSaveHeroBanner} className="space-y-6">
          <div className="bg-[#06111f] border border-amber-400/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Header da Aba */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  CABEÇALHO &amp; DESTAQUE PRINCIPAL
                </span>
                <h2 className="text-xl font-bold text-white mt-1">
                  Banner Fixo &amp; Degradê do Header
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                  Personalize o banner focado no lado direito da tela inicial, os efeitos de transição do degradê e os botões de ação do topo do site.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSavingHero}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer self-start sm:self-auto"
              >
                <Save size={15} />
                <span>{isSavingHero ? "Salvando..." : "Salvar Banner do Header"}</span>
              </button>
            </div>

            {/* Prévia em Tempo Real */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                <span>Prévia em Tempo Real (Visual do Header)</span>
              </span>

              <div className="relative rounded-2xl border border-slate-700/80 bg-[#02070D] p-5 sm:p-8 overflow-hidden min-h-[280px] flex flex-col justify-center shadow-2xl">
                {/* Banner de Fundo (Modo Full Bleed) ou Lado Direito (Modo Card Box) */}
                {heroBanner.mode === "fixed_banner" ? (
                  heroBanner.layoutStyle === "card_box" ? (
                    /* Modo Card Box na Direita */
                    <div className="absolute inset-y-4 right-4 w-[48%] rounded-xl overflow-hidden border border-white/10 shadow-xl pointer-events-none">
                      <img
                        src={heroBanner.bannerImageUrl || "/images/lifestyle/female-grau.jpg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition:
                            heroBanner.backgroundPosition === "custom"
                              ? `${heroBanner.customPositionX ?? 80}% ${heroBanner.customPositionY ?? 50}%`
                              : heroBanner.backgroundPosition || "80% 50%",
                          opacity: (heroBanner.bannerOpacity ?? 100) / 100,
                        }}
                      />
                      <div
                        className="absolute inset-0 transition-all duration-300"
                        style={{
                          background: (() => {
                            const solidColor = heroBanner.gradientColor || "#02070D";
                            return `linear-gradient(to right, ${solidColor} 0%, transparent 100%)`;
                          })(),
                        }}
                      />
                    </div>
                  ) : (
                    /* Modo Full Bleed (Cobre o lado direito suavemente) */
                    <div
                      className={`absolute inset-y-0 right-0 pointer-events-none overflow-hidden transition-all duration-300 ${
                        heroBanner.desktopWidth === "full_100"
                          ? "w-full inset-0"
                          : heroBanner.desktopWidth === "wide_65"
                          ? "w-[65%]"
                          : "w-[54%]"
                      }`}
                      style={{
                        maskImage:
                          "linear-gradient(to right, transparent 0%, black 24%, black 88%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
                        WebkitMaskImage:
                          "linear-gradient(to right, transparent 0%, black 24%, black 88%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
                        maskComposite: "intersect",
                        WebkitMaskComposite: "source-in",
                      }}
                    >
                      <img
                        src={heroBanner.bannerImageUrl || "/images/lifestyle/female-grau.jpg"}
                        alt="Preview"
                        className="w-full h-full object-cover transition-all duration-300"
                        style={{
                          objectPosition:
                            heroBanner.backgroundPosition === "custom"
                              ? `${heroBanner.customPositionX ?? 80}% ${heroBanner.customPositionY ?? 50}%`
                              : heroBanner.backgroundPosition || "80% 50%",
                          transform: `scale(${(heroBanner.desktopZoom ?? 100) / 100})`,
                          opacity: (heroBanner.bannerOpacity ?? 100) / 100,
                        }}
                      />
                      <div
                        className="absolute inset-0 transition-all duration-300"
                        style={{
                          background: (() => {
                            const solidColor = heroBanner.gradientColor || "#02070D";
                            const alpha = Math.min(
                              Math.max((heroBanner.gradientIntensity || 85) / 100, 0.2),
                              1
                            );
                            switch (heroBanner.gradientDirection) {
                              case "to-left":
                                return `linear-gradient(to right, ${solidColor} 0%, ${solidColor} 34%, rgba(2, 7, 13, ${alpha * 0.92}) 54%, rgba(2, 7, 13, ${alpha * 0.45}) 74%, transparent 96%)`;
                              case "to-right":
                                return `linear-gradient(to left, ${solidColor} 0%, ${solidColor} 34%, rgba(2, 7, 13, ${alpha * 0.92}) 54%, rgba(2, 7, 13, ${alpha * 0.45}) 74%, transparent 96%)`;
                              case "to-bottom":
                                return `linear-gradient(to bottom, ${solidColor} 0%, rgba(2, 7, 13, ${alpha * 0.85}) 40%, rgba(2, 7, 13, ${alpha * 0.3}) 75%, ${solidColor} 100%)`;
                              case "radial":
                                return `radial-gradient(ellipse at 80% 50%, transparent 20%, rgba(2, 7, 13, ${alpha * 0.6}) 60%, ${solidColor} 88%)`;
                              default:
                                return `linear-gradient(to right, ${solidColor} 0%, ${solidColor} 34%, rgba(2, 7, 13, ${alpha * 0.92}) 54%, transparent 96%)`;
                            }
                          })(),
                        }}
                      />
                      {/* Vignettes superior e inferior */}
                      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#02070D] to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#02070D] to-transparent" />
                    </div>
                  )
                ) : (
                  <div className="absolute inset-y-0 right-0 w-full sm:w-[50%] flex items-center justify-center bg-slate-900/60 border-l border-white/10 pointer-events-none">
                    <span className="text-xs font-semibold text-amber-300">
                      [Modo Carrossel 3D de Armações no Pedestal Ativo]
                    </span>
                  </div>
                )}

                {/* Conteúdo Esquerdo da Prévia */}
                <div className="relative z-10 max-w-md space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 block">
                    ● QUALIDADE QUE VOCÊ VÊ
                  </span>
                  <h3 className="text-xl sm:text-2xl font-light text-white leading-tight">
                    Mais que óculos, <br />
                    é sobre <strong className="font-semibold text-amber-400">você.</strong>
                  </h3>
                  <p className="text-[11px] text-slate-300 line-clamp-2">
                    Na Óticas Ventara, unimos tecnologia, qualidade e atendimento especializado...
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] shadow-sm">
                      {heroBanner.primaryButtonText || "Catálogo de Lentes"}
                    </span>
                    <span className="px-3 py-1.5 rounded-full bg-slate-900 text-white font-semibold text-[10px] border border-slate-700">
                      {heroBanner.secondaryButtonText || "Ver armações"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SELEÇÃO DE MODO: BANNER FIXO VS CARROSSEL 3D */}
            <div className="bg-[#0a1526] border border-white/10 rounded-2xl p-5 space-y-3">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Modo de Exibição do Lado Direito do Header
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHeroBanner((prev) => ({ ...prev, mode: "fixed_banner" }))}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    heroBanner.mode === "fixed_banner"
                      ? "bg-amber-400/10 border-amber-400 text-white shadow-md shadow-amber-400/10"
                      : "bg-[#040c16] border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-400">
                      Banner Fixo com Degradê
                    </span>
                    {heroBanner.mode === "fixed_banner" && (
                      <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Foto de modelo/loja em alta resolução com efeito de degradê suave cobrindo a transição para o fundo do site.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setHeroBanner((prev) => ({ ...prev, mode: "carousel_3d" }))}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    heroBanner.mode === "carousel_3d"
                      ? "bg-amber-400/10 border-amber-400 text-white shadow-md shadow-amber-400/10"
                      : "bg-[#040c16] border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-400">
                      Carrossel 3D com Pedestal
                    </span>
                    {heroBanner.mode === "carousel_3d" && (
                      <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Exibe as armações em destaque rotacionando sobre o pedestal cilíndrico com anel neon azul.
                  </p>
                </button>
              </div>
            </div>

            {/* CONFIGURAÇÕES DO BANNER FIXO E DEGRADÊ */}
            {heroBanner.mode === "fixed_banner" && (
              <div className="bg-[#0a1526] border border-white/10 rounded-2xl p-5 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon size={15} className="text-amber-400" />
                    <span>Imagem do Banner Fixo (Lado Direito)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Envie uma foto em alta definição com foco na modelo ou produto do lado direito.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  <div className="lg:col-span-4 aspect-video rounded-xl bg-[#040c16] border border-white/10 overflow-hidden relative">
                    <img
                      src={heroBanner.bannerImageUrl || "/images/lifestyle/female-grau.jpg"}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="lg:col-span-8 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer shadow-md transition-all">
                        <Upload size={14} />
                        <span>{isUploadingHero ? "Enviando..." : "Escolher Imagem (Upload)"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageUpload}
                          disabled={isUploadingHero}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          setHeroBanner((prev) => ({
                            ...prev,
                            bannerImageUrl:
                              "https://yfokjztrhecjlijvmvmr.supabase.co/storage/v1/object/public/product-images/products/1792716830393-u708m6.jpg",
                            layoutStyle: "card_box",
                            customPositionX: 50,
                            customPositionY: 50,
                          }))
                        }
                        className="text-xs px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors shadow-xs"
                      >
                        ✨ Ventara Safari (Armação Completa)
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setHeroBanner((prev) => ({
                            ...prev,
                            bannerImageUrl:
                              "https://yfokjztrhecjlijvmvmr.supabase.co/storage/v1/object/public/product-images/products/1792778393371-a3xj7o.jpg",
                          }))
                        }
                        className="text-xs px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        Ventara Safari (Macro)
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setHeroBanner((prev) => ({
                            ...prev,
                            bannerImageUrl: "/images/products/ventara-sport-fire.jpg",
                          }))
                        }
                        className="text-xs px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        Ventara Sport Fire
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setHeroBanner((prev) => ({
                            ...prev,
                            bannerImageUrl: "/images/lifestyle/female-grau.jpg",
                          }))
                        }
                        className="text-xs px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        Modelo Feminino Grau
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setHeroBanner((prev) => ({
                            ...prev,
                            bannerImageUrl: "/images/lifestyle/male-solar.jpg",
                          }))
                        }
                        className="text-xs px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        Modelo Masculino Solar
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        URL Direta da Imagem
                      </label>
                      <input
                        type="text"
                        value={heroBanner.bannerImageUrl}
                        onChange={(e) =>
                          setHeroBanner((prev) => ({ ...prev, bannerImageUrl: e.target.value }))
                        }
                        placeholder="/images/lifestyle/female-grau.jpg ou https://..."
                        className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* ENQUADRAMENTO & POSIÇÃO DA FOTO (ESTILO ELEMENTOR) */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles size={13} />
                      <span>Enquadramento & Posição da Foto (Estilo Elementor)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Controle onde a foto fica posicionada e escolha se cobre todo o fundo ou fica em bloco.
                    </p>
                  </div>

                  {/* 1. Escolha de Layout: Vitrine Atelier de Luxo vs Fundo Inteiro */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Estilo de Layout no Header:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setHeroBanner((prev) => ({ ...prev, layoutStyle: "card_box" }))
                        }
                        className={`p-3 rounded-xl border text-left transition-all ${
                          heroBanner.layoutStyle === "card_box"
                            ? "border-amber-400 bg-amber-400/10 shadow-md"
                            : "border-white/10 bg-[#040c16] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">
                            ✨ Vitrine Atelier de Luxo
                          </span>
                          <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full">
                            Recomendado
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          O óculos aparece por inteiro, nítido e elegante, com reflexo de bancada e cantos curvos de luxo. Zero distorção.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setHeroBanner((prev) => ({ ...prev, layoutStyle: "full_bleed" }))
                        }
                        className={`p-3 rounded-xl border text-left transition-all ${
                          heroBanner.layoutStyle !== "card_box"
                            ? "border-amber-400 bg-amber-400/10 shadow-md"
                            : "border-white/10 bg-[#040c16] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">
                            Fundo Inteiro com Degradê
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          A foto preenche o fundo da seção com degradê suave cobrindo o texto. Ideal para fotos panorâmicas.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* 2. Largura da Foto no Desktop (Evita zoom excessivo no óculos) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Largura da Foto no Desktop:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setHeroBanner((prev) => ({ ...prev, desktopWidth: "natural_55" }))
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          heroBanner.desktopWidth === "natural_55" || !heroBanner.desktopWidth
                            ? "border-amber-400 bg-amber-400/10 shadow-sm"
                            : "border-white/10 bg-[#040c16] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-white">55% da Tela</span>
                          <span className="text-[9px] font-semibold text-amber-400 bg-amber-400/20 px-1.5 py-0.5 rounded-full">
                            Recomendado
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Proporção natural do óculos sem zoom excessivo, focado na direita.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setHeroBanner((prev) => ({ ...prev, desktopWidth: "wide_65" }))
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          heroBanner.desktopWidth === "wide_65"
                            ? "border-amber-400 bg-amber-400/10 shadow-sm"
                            : "border-white/10 bg-[#040c16] hover:border-white/20"
                        }`}
                      >
                        <span className="text-xs font-bold text-white block mb-0.5">65% da Tela</span>
                        <p className="text-[10px] text-slate-400">
                          Lado direito amplo com maior presença visual.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setHeroBanner((prev) => ({ ...prev, desktopWidth: "full_100" }))
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          heroBanner.desktopWidth === "full_100"
                            ? "border-amber-400 bg-amber-400/10 shadow-sm"
                            : "border-white/10 bg-[#040c16] hover:border-white/20"
                        }`}
                      >
                        <span className="text-xs font-bold text-white block mb-0.5">100% Tela Cheia</span>
                        <p className="text-[10px] text-slate-400">
                          Foto estendida por toda a largura do header.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* 3. Escala / Zoom do Óculos */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-[#040c16] border border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">
                        Zoom / Escala do Óculos ({heroBanner.desktopZoom ?? 100}%)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Diminua para afastar o óculos ou aumente para aproximar
                      </span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="150"
                      value={heroBanner.desktopZoom ?? 100}
                      onChange={(e) =>
                        setHeroBanner((prev) => ({
                          ...prev,
                          desktopZoom: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>60% (Mais Afastado / Completo)</span>
                      <span>100% (Natural)</span>
                      <span>150% (Aproximado)</span>
                    </div>
                  </div>

                  {/* 2. Posição do Foco (Background Position do Elementor) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Posição do Foco da Foto (Background Position):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: "Direita Central (Foco Produto)", value: "80% 50%", x: 80, y: 50 },
                        { label: "Centro (Centralizado)", value: "center center", x: 50, y: 50 },
                        { label: "Direita Topo", value: "right top", x: 100, y: 0 },
                        { label: "Direita Base", value: "right bottom", x: 100, y: 100 },
                        { label: "Centro Topo", value: "center top", x: 50, y: 0 },
                        { label: "Centro Base", value: "center bottom", x: 50, y: 100 },
                        { label: "Esquerda Central", value: "left center", x: 0, y: 50 },
                        { label: "Personalizado (Sliders)", value: "custom", x: heroBanner.customPositionX ?? 80, y: heroBanner.customPositionY ?? 50 },
                      ].map((pos) => {
                        const isSelected =
                          heroBanner.backgroundPosition === pos.value ||
                          (!heroBanner.backgroundPosition && pos.value === "80% 50%");
                        return (
                          <button
                            key={pos.value}
                            type="button"
                            onClick={() =>
                              setHeroBanner((prev) => ({
                                ...prev,
                                backgroundPosition: pos.value,
                                customPositionX: pos.x,
                                customPositionY: pos.y,
                              }))
                            }
                            className={`px-3 py-2 rounded-xl text-[11px] font-semibold text-left transition-all border ${
                              isSelected
                                ? "bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-sm"
                                : "bg-[#040c16] text-slate-300 border-white/10 hover:border-white/20"
                            }`}
                          >
                            {pos.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Sliders Interativos de Ajuste Fino X e Y (Elementor Focal Point) */}
                  <div className="p-4 rounded-xl bg-[#040c16] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Ajuste Fino de Coordenadas (Eixo X / Eixo Y)
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md">
                        X: {heroBanner.customPositionX ?? 80}% | Y: {heroBanner.customPositionY ?? 50}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Eixo Horizontal X */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Posição Horizontal (Eixo X)</span>
                          <span className="font-mono text-white">{heroBanner.customPositionX ?? 80}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={heroBanner.customPositionX ?? 80}
                          onChange={(e) =>
                            setHeroBanner((prev) => ({
                              ...prev,
                              backgroundPosition: "custom",
                              customPositionX: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                          <span>0% (Esquerda)</span>
                          <span>50% (Centro)</span>
                          <span>100% (Direita)</span>
                        </div>
                      </div>

                      {/* Eixo Vertical Y */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>Posição Vertical (Eixo Y)</span>
                          <span className="font-mono text-white">{heroBanner.customPositionY ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={heroBanner.customPositionY ?? 50}
                          onChange={(e) =>
                            setHeroBanner((prev) => ({
                              ...prev,
                              backgroundPosition: "custom",
                              customPositionY: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-amber-400 cursor-pointer"
                        />
                        <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                          <span>0% (Topo)</span>
                          <span>50% (Centro)</span>
                          <span>100% (Base)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Opacidade da Imagem */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">
                        Opacidade da Imagem de Fundo
                      </span>
                      <span className="font-mono font-bold text-amber-400">
                        {heroBanner.bannerOpacity ?? 100}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={heroBanner.bannerOpacity ?? 100}
                      onChange={(e) =>
                        setHeroBanner((prev) => ({
                          ...prev,
                          bannerOpacity: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* OPÇÕES DO DEGRADÊ */}
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Opções de Degradê (Filtro e Transição)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Direção */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Direção do Degradê
                      </label>
                      <select
                        value={heroBanner.gradientDirection}
                        onChange={(e) =>
                          setHeroBanner((prev) => ({
                            ...prev,
                            gradientDirection: e.target.value as any,
                          }))
                        }
                        className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="to-left">Da Direita para Esquerda (Foco no Banner)</option>
                        <option value="to-right">Da Esquerda para Direita</option>
                        <option value="to-bottom">De Cima para Baixo</option>
                        <option value="radial">Radial Suave Central</option>
                      </select>
                    </div>

                    {/* Cor do Fundo */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Cor Base do Degradê
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={heroBanner.gradientColor || "#02070D"}
                          onChange={(e) =>
                            setHeroBanner((prev) => ({ ...prev, gradientColor: e.target.value }))
                          }
                          className="w-9 h-8 rounded-lg bg-transparent border border-white/10 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={heroBanner.gradientColor}
                          onChange={(e) =>
                            setHeroBanner((prev) => ({ ...prev, gradientColor: e.target.value }))
                          }
                          placeholder="#02070D"
                          className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setHeroBanner((prev) => ({ ...prev, gradientColor: "#02070D" }))
                          }
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                        >
                          Ventara (#02070D)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setHeroBanner((prev) => ({ ...prev, gradientColor: "#071527" }))
                          }
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                        >
                          Noturno
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setHeroBanner((prev) => ({ ...prev, gradientColor: "#000000" }))
                          }
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                        >
                          Preto
                        </button>
                      </div>
                    </div>

                    {/* Intensidade */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          Intensidade da Cobertura
                        </label>
                        <span className="text-xs font-mono text-amber-400 font-bold">
                          {heroBanner.gradientIntensity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={30}
                        max={100}
                        step={5}
                        value={heroBanner.gradientIntensity}
                        onChange={(e) =>
                          setHeroBanner((prev) => ({
                            ...prev,
                            gradientIntensity: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Controla o quanto o degradê se funde com a imagem.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PERSONALIZAÇÃO DOS BOTÕES E TEXTOS */}
            <div className="bg-[#0a1526] border border-white/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag size={15} className="text-amber-400" />
                <span>Textos dos Botões e Selos do Header</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Texto do Botão 1 (Amarelo Principal)
                  </label>
                  <input
                    type="text"
                    value={heroBanner.primaryButtonText}
                    onChange={(e) =>
                      setHeroBanner((prev) => ({ ...prev, primaryButtonText: e.target.value }))
                    }
                    placeholder="Catálogo de Lentes"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Link do Botão 1
                  </label>
                  <input
                    type="text"
                    value={heroBanner.primaryButtonLink}
                    onChange={(e) =>
                      setHeroBanner((prev) => ({ ...prev, primaryButtonLink: e.target.value }))
                    }
                    placeholder="/lentes"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Texto do Botão 2 (Secundário)
                  </label>
                  <input
                    type="text"
                    value={heroBanner.secondaryButtonText}
                    onChange={(e) =>
                      setHeroBanner((prev) => ({ ...prev, secondaryButtonText: e.target.value }))
                    }
                    placeholder="Ver armações"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Link do Botão 2
                  </label>
                  <input
                    type="text"
                    value={heroBanner.secondaryButtonLink}
                    onChange={(e) =>
                      setHeroBanner((prev) => ({ ...prev, secondaryButtonLink: e.target.value }))
                    }
                    placeholder="#armacoes"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Badge Lateral Dourado
                  </label>
                  <input
                    type="text"
                    value={heroBanner.badgeTag}
                    onChange={(e) =>
                      setHeroBanner((prev) => ({ ...prev, badgeTag: e.target.value }))
                    }
                    placeholder="ARMAÇÕES DE QUALIDADE E ESTILO"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subtítulo do Selo Inferior
                  </label>
                  <input
                    type="text"
                    value={heroBanner.badgeSubtitle || ""}
                    onChange={(e) =>
                      setHeroBanner((prev) => ({ ...prev, badgeSubtitle: e.target.value }))
                    }
                    placeholder="Curadoria Autoral Ventara · Acetato Premium"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Salvar Banner */}
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={isSavingHero}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
              >
                <Save size={15} />
                <span>{isSavingHero ? "Salvando..." : "Salvar Configurações do Header"}</span>
              </button>
            </div>
          </div>
        </form>
      )}
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

                      {/* Preview da foto como aparece no site */}
                      <div className={`aspect-[4/3] w-full rounded-xl overflow-hidden border border-slate-200 mb-2 relative ${
                        item.imageFit === "contain"
                          ? "bg-white p-3 flex items-center justify-center"
                          : "bg-slate-900"
                      }`}>
                        <span className="absolute top-1.5 left-1.5 z-10 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                          {item.discountBadge || "-25% OFF"}
                        </span>
                        <img
                          src={item.image}
                          alt={item.name}
                          className={
                            item.imageFit === "contain"
                              ? "max-h-full max-w-full object-contain"
                              : "w-full h-full object-cover object-center"
                          }
                        />
                      </div>

                      {/* Botão de Trocar Imagem via Upload */}
                      <label className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-xs mb-2">
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

                      {/* Ajuste de Enquadramento da Foto */}
                      <div className="mb-3 p-2 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                        <label className="block text-slate-300 text-[11px] font-medium">
                          Enquadramento da Imagem:
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setPromotionalShowcase((prev) => ({
                                ...prev,
                                items: prev.items.map((it) =>
                                  it.id === item.id ? { ...it, imageFit: "cover" } : it
                                ),
                              }))
                            }
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold text-center transition-all ${
                              item.imageFit !== "contain"
                                ? "bg-amber-400 text-slate-950 font-bold shadow-xs"
                                : "bg-white/5 text-slate-400 hover:text-white"
                            }`}
                          >
                            Preencher Completo
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPromotionalShowcase((prev) => ({
                                ...prev,
                                items: prev.items.map((it) =>
                                  it.id === item.id ? { ...it, imageFit: "contain" } : it
                                ),
                              }))
                            }
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold text-center transition-all ${
                              item.imageFit === "contain"
                                ? "bg-amber-400 text-slate-950 font-bold shadow-xs"
                                : "bg-white/5 text-slate-400 hover:text-white"
                            }`}
                          >
                            Ajustar c/ Bordas
                          </button>
                        </div>
                      </div>

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
