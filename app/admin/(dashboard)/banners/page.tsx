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
  InteractiveShowcaseSettings,
  ShowcaseVariationItem,
} from "@/types/ecommerce";
import {
  DEFAULT_SHOWCASE_MEDIA,
  DEFAULT_PROMOTIONAL_SHOWCASE,
  DEFAULT_HERO_BANNER,
  DEFAULT_INTERACTIVE_SHOWCASE,
} from "@/lib/site-settings-constants";
import { HeroSlidesManager } from "@/components/admin/hero-slides-manager";

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
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [interactiveShowcase, setInteractiveShowcase] =
    useState<InteractiveShowcaseSettings>(DEFAULT_INTERACTIVE_SHOWCASE);
  const [selectedShowcaseMode, setSelectedShowcaseMode] = useState<string>("solar_masculino");
  const [isSavingInteractive, setIsSavingInteractive] = useState(false);
  const [uploadingVarKey, setUploadingVarKey] = useState<string | null>(null);

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
        if (data.interactive_showcase) {
          setInteractiveShowcase((prev) => ({ ...prev, ...data.interactive_showcase }));
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
    const fetchAvailableProducts = async () => {
      try {
        const res = await fetch("/api/admin/products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products)) {
            setAvailableProducts(data.products);
          }
        }
      } catch (err) {
        console.warn("Erro ao buscar catálogo de produtos:", err);
      }
    };
    fetchAvailableProducts();
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

  const handleVariationImageUpload = async (
    modeKey: string,
    varIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadKey = `${modeKey}-${varIndex}`;
    setUploadingVarKey(uploadKey);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao fazer upload da imagem.");
      }

      if (data.url) {
        setInteractiveShowcase((prev) => {
          const currentMode = prev[modeKey] || DEFAULT_INTERACTIVE_SHOWCASE[modeKey];
          const updatedVars = [...currentMode.variations];
          updatedVars[varIndex] = {
            ...updatedVars[varIndex],
            imageUrl: data.url,
          };
          return {
            ...prev,
            [modeKey]: {
              ...currentMode,
              variations: updatedVars,
            },
          };
        });
        setFeedback("Foto do óculos enviada com sucesso! Clique em 'Salvar Vitrine Esportiva & Solares' para publicar.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Falha no envio da imagem.");
    } finally {
      setUploadingVarKey(null);
    }
  };

  const handleSaveInteractiveShowcase = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingInteractive(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interactive_showcase: interactiveShowcase }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar vitrine interativa.");
      }

      setFeedback("Vitrine Esportiva & Solares salva e atualizada com sucesso no site!");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro inesperado ao salvar vitrine.");
    } finally {
      setIsSavingInteractive(false);
    }
  };

  const handleUpdateModeField = (modeKey: string, field: string, value: any) => {
    setInteractiveShowcase((prev) => {
      const currentMode = prev[modeKey] || DEFAULT_INTERACTIVE_SHOWCASE[modeKey];
      return {
        ...prev,
        [modeKey]: {
          ...currentMode,
          [field]: value,
        },
      };
    });
  };

  const handleUpdateVariation = (
    modeKey: string,
    varIndex: number,
    field: string,
    value: any
  ) => {
    setInteractiveShowcase((prev) => {
      const currentMode = prev[modeKey] || DEFAULT_INTERACTIVE_SHOWCASE[modeKey];
      const updatedVars = [...currentMode.variations];
      updatedVars[varIndex] = {
        ...updatedVars[varIndex],
        [field]: value,
      };
      return {
        ...prev,
        [modeKey]: {
          ...currentMode,
          variations: updatedVars,
        },
      };
    });
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
    const firstProd = availableProducts[0];
    const newItem: PromoProductItem = {
      id: `promo-${Date.now()}`,
      name: firstProd ? firstProd.name : "Novo Modelo em Oferta",
      category: (firstProd?.category as any)?.name || "Armação de Grau",
      tag: "Oferta",
      discountBadge: "-25% OFF",
      originalPrice: firstProd?.price ? `R$ ${firstProd.price.toFixed(2).replace(".", ",")}` : "R$ 499,00",
      promotionalPrice: firstProd?.promotional_price ? `R$ ${firstProd.promotional_price.toFixed(2).replace(".", ",")}` : "R$ 374,25",
      installment: "10x sem juros",
      image: firstProd?.images?.[0]?.url || "/images/products/urbano-black.png",
      imageFit: "cover",
      colorName: "Preto Clássico",
      colorHex: "#0f172a",
      slug: firstProd?.slug || "ventara-onca",
      description: firstProd?.description || "Armação leve com garantia de 1 ano.",
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
          <span>Hero / Banner</span>
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
          <span>Vitrine Esportiva &amp; Solares (Produtos &amp; Fotos)</span>
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
          <span>Vitrine de Modelos (Fundo Branco)</span>
        </button>
      </div>

      {/* ABA 0: HERO / BANNER FULL-BLEED (CARROSSEL & SLIDES GERENCIÁVEIS) */}
      {activeTab === "hero" && <HeroSlidesManager />}

      {activeTab === "vitrines" && (
        <div className="space-y-8">
          {/* BLOCO 1: PRODUTOS E FOTOS DA LINHA ESPORTIVA & SOLAR (VITRINE INTERATIVA) */}
          <div className="bg-[#06111f] border border-amber-400/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Header com título, subtítulo e botão de salvar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  VITRINE INTERATIVA DA HOME
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 flex items-center gap-2">
                  <Sun className="text-amber-400" size={24} />
                  <span>Produtos &amp; Fotos da Linha Esportiva e Solares</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  Adicione e troque as <strong>fotos reais</strong> dos óculos esportivos e solares (ex: Ventara Horizonte Sport), ajuste títulos, acabamento e valores das 4 variações de cores que aparecem no seletor interativo da página inicial.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSaveInteractiveShowcase()}
                disabled={isSavingInteractive}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-400/20 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <Save size={16} />
                <span>{isSavingInteractive ? "Salvando..." : "Salvar Vitrine Esportiva & Solares"}</span>
              </button>
            </div>

            {/* Sub-abas dos 4 Modos da Vitrine Interativa */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Selecione o Modelo / Linha para Editar:
              </span>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  {
                    key: "solar_masculino",
                    label: "🕶️ Esportivo Masculino",
                    model: "Ventara Horizonte Sport",
                    desc: "Modelo do print do cliente (4 cores)",
                    badge: "Em destaque",
                  },
                  {
                    key: "solar_feminino",
                    label: "✨ Solar Feminino",
                    model: "Ventara Aurora Solar",
                    desc: "Design contemporâneo",
                    badge: "Solar",
                  },
                  {
                    key: "grau_masculino",
                    label: "👓 Grau em Titânio",
                    model: "Ventara Urbano Titanium",
                    desc: "Ultraleve e minimalista",
                    badge: "Grau",
                  },
                  {
                    key: "grau_feminino",
                    label: "💎 Grau Autoral Feminino",
                    model: "Ventara Essencial Acetato",
                    desc: "Harmonização facial",
                    badge: "Grau",
                  },
                ].map((m) => {
                  const isSelected = selectedShowcaseMode === m.key;
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setSelectedShowcaseMode(m.key)}
                      className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-400/15 border-amber-400 shadow-md ring-1 ring-amber-400/30"
                          : "bg-[#091829] border-white/10 hover:border-white/20 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isSelected ? "text-amber-400" : "text-white"}`}>
                          {m.label}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                            isSelected ? "bg-amber-400 text-slate-950" : "bg-white/10 text-slate-400"
                          }`}
                        >
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-200 truncate">{m.model}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{m.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Informações da Linha Selecionada */}
            {(() => {
              const activeModeData =
                interactiveShowcase[selectedShowcaseMode] ||
                DEFAULT_INTERACTIVE_SHOWCASE[selectedShowcaseMode] ||
                DEFAULT_INTERACTIVE_SHOWCASE.solar_masculino;

              return (
                <div className="space-y-6 pt-2">
                  <div className="bg-[#091829] border border-white/10 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          Dados da Seção no Site
                        </span>
                        <h3 className="text-sm font-bold text-white">
                          Textos de Destaque e Identificação da Linha
                        </h3>
                      </div>

                      {/* Dropdown de Vínculo com Catálogo */}
                      {availableProducts.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 whitespace-nowrap">
                            Vincular a produto da loja:
                          </span>
                          <select
                            value={activeModeData.featuredProductSlug || ""}
                            onChange={(e) => {
                              const selectedProd = availableProducts.find(
                                (p) => p.slug === e.target.value
                              );
                              if (selectedProd) {
                                handleUpdateModeField(
                                  selectedShowcaseMode,
                                  "featuredProductName",
                                  selectedProd.name
                                );
                                handleUpdateModeField(
                                  selectedShowcaseMode,
                                  "featuredProductSlug",
                                  selectedProd.slug
                                );
                              } else {
                                handleUpdateModeField(
                                  selectedShowcaseMode,
                                  "featuredProductSlug",
                                  e.target.value
                                );
                              }
                            }}
                            className="bg-[#040c16] border border-amber-400/40 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                          >
                            <option value="">Personalizado (Sem vínculo direto)</option>
                            {availableProducts.map((p) => {
                              const catName =
                                typeof p.category === "object" && p.category !== null
                                  ? p.category.name || ""
                                  : typeof p.category === "string"
                                  ? p.category
                                  : "";
                              return (
                                <option key={p.id} value={p.slug}>
                                  {p.name} {catName ? `(${catName})` : ""}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Nome do Modelo em Destaque
                        </label>
                        <input
                          type="text"
                          value={activeModeData.featuredProductName || ""}
                          onChange={(e) =>
                            handleUpdateModeField(
                              selectedShowcaseMode,
                              "featuredProductName",
                              e.target.value
                            )
                          }
                          placeholder="Ex: Ventara Horizonte Sport"
                          className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Tag da Seção (Topo)
                        </label>
                        <input
                          type="text"
                          value={activeModeData.sectionTag || ""}
                          onChange={(e) =>
                            handleUpdateModeField(
                              selectedShowcaseMode,
                              "sectionTag",
                              e.target.value
                            )
                          }
                          placeholder="Ex: LINHA ESPORTIVA & SOLAR"
                          className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Título Principal (Headline)
                        </label>
                        <input
                          type="text"
                          value={activeModeData.productHeadline || ""}
                          onChange={(e) =>
                            handleUpdateModeField(
                              selectedShowcaseMode,
                              "productHeadline",
                              e.target.value
                            )
                          }
                          placeholder="Ex: Performance em todos os detalhes."
                          className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        Descrição da Linha
                      </label>
                      <textarea
                        rows={2}
                        value={activeModeData.productDescription || ""}
                        onChange={(e) =>
                          handleUpdateModeField(
                            selectedShowcaseMode,
                            "productDescription",
                            e.target.value
                          )
                        }
                        placeholder="Ex: Óculos esportivos com curvatura panorâmica, proteção UV400..."
                        className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                      />
                    </div>
                  </div>

                  {/* CARDS DAS 4 VARIAÇÕES / CORES COM UPLOAD DE FOTOS */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          CORES &amp; FOTOS DOS ÓCULOS
                        </span>
                        <h4 className="text-sm font-bold text-white">
                          As 4 Variações Exibidas no Seletor (Foto Real de Cada Modelo)
                        </h4>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {activeModeData.variations.filter((v) => v.imageUrl && v.imageUrl.trim() !== "").length} de {activeModeData.variations.length} com fotos reais
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {activeModeData.variations.map((v, idx) => {
                        const uploadKey = `${selectedShowcaseMode}-${idx}`;
                        const isUploadingThis = uploadingVarKey === uploadKey;
                        const hasRealImage = Boolean(v.imageUrl && v.imageUrl.trim() !== "");

                        return (
                          <div
                            key={v.id || idx}
                            className={`bg-[#091829] border rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all ${
                              hasRealImage
                                ? "border-amber-400/40 shadow-sm"
                                : "border-white/10 hover:border-white/20"
                            }`}
                          >
                            {/* Topo do card com amostra de cor e SKU */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm shrink-0"
                                  style={{ backgroundColor: v.colorHex || "#0284c7" }}
                                />
                                <span className="text-xs font-bold text-white">
                                  Opção #{idx + 1}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                                {v.sku || `SKU-${idx + 1}`}
                              </span>
                            </div>

                            {/* Preview da Imagem */}
                            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center p-3 relative group">
                              {hasRealImage ? (
                                <img
                                  src={v.imageUrl}
                                  alt={v.name}
                                  className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="text-center p-3 space-y-1.5">
                                  <Glasses className="w-10 h-10 text-amber-400/50 mx-auto" />
                                  <span className="text-[10px] text-amber-400 font-semibold block">
                                    Ilustração Vetorial (Padrão)
                                  </span>
                                  <span className="text-[9px] text-slate-400 block leading-tight">
                                    Suba uma foto real do óculos para substituir a arte
                                  </span>
                                </div>
                              )}

                              {hasRealImage && (
                                <span className="absolute top-2 right-2 text-[9px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full shadow">
                                  ✓ Foto Real
                                </span>
                              )}
                            </div>

                            {/* Botão de Upload da Imagem */}
                            <div className="space-y-2">
                              <label className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.98]">
                                <Upload size={14} />
                                <span>{isUploadingThis ? "Enviando Imagem..." : "📷 Trocar Foto do Óculos"}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  disabled={uploadingVarKey !== null}
                                  onChange={(e) =>
                                    handleVariationImageUpload(selectedShowcaseMode, idx, e)
                                  }
                                  className="hidden"
                                />
                              </label>

                              {/* Input URL direto */}
                              <input
                                type="text"
                                value={v.imageUrl || ""}
                                onChange={(e) =>
                                  handleUpdateVariation(
                                    selectedShowcaseMode,
                                    idx,
                                    "imageUrl",
                                    e.target.value
                                  )
                                }
                                placeholder="Ou cole a URL da imagem..."
                                className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                              />
                            </div>

                            {/* Campos da Variação */}
                            <div className="space-y-2.5 pt-2 border-t border-white/5 text-xs">
                              <div>
                                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                                  Nome da Cor / Lente
                                </label>
                                <input
                                  type="text"
                                  value={v.name || ""}
                                  onChange={(e) =>
                                    handleUpdateVariation(
                                      selectedShowcaseMode,
                                      idx,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ex: Azul Safira Polarizado"
                                  className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                                  Acabamento / Armação
                                </label>
                                <input
                                  type="text"
                                  value={v.finish || ""}
                                  onChange={(e) =>
                                    handleUpdateVariation(
                                      selectedShowcaseMode,
                                      idx,
                                      "finish",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ex: Preto Fosco com Lente Azul..."
                                  className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                                    Preço (R$)
                                  </label>
                                  <input
                                    type="text"
                                    value={
                                      v.priceInCents
                                        ? (v.priceInCents / 100).toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })
                                        : ""
                                    }
                                    onChange={(e) => {
                                      const raw = e.target.value.replace(/\D/g, "");
                                      const cents = parseInt(raw, 10) || 0;
                                      handleUpdateVariation(
                                        selectedShowcaseMode,
                                        idx,
                                        "priceInCents",
                                        cents
                                      );
                                    }}
                                    placeholder="489,00"
                                    className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-400"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                                    Cor Amostra
                                  </label>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="color"
                                      value={v.colorHex || "#0284c7"}
                                      onChange={(e) =>
                                        handleUpdateVariation(
                                          selectedShowcaseMode,
                                          idx,
                                          "colorHex",
                                          e.target.value
                                        )
                                      }
                                      className="w-7 h-7 rounded border border-white/10 cursor-pointer bg-transparent p-0"
                                    />
                                    <input
                                      type="text"
                                      value={v.colorHex || ""}
                                      onChange={(e) =>
                                        handleUpdateVariation(
                                          selectedShowcaseMode,
                                          idx,
                                          "colorHex",
                                          e.target.value
                                        )
                                      }
                                      placeholder="#0284c7"
                                      className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white font-mono focus:outline-none focus:border-amber-400"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Barra de ação inferior para salvar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#091829] border border-amber-400/20">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Sparkles size={16} className="text-amber-400" />
                      <span>Todas as alterações são aplicadas instantaneamente no site após clicar em salvar.</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveInteractiveShowcase()}
                      disabled={isSavingInteractive}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <Save size={15} />
                      <span>{isSavingInteractive ? "Salvando..." : "Salvar Vitrine Esportiva & Solares"}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* BLOCO 2: FOTOS LIFESTYLE DE CAMPANHA & GARANTIA */}
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
        </div>
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
                  Vitrine de Modelos em Destaque &amp; Promocionais
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                  Edite o título, texto do selo, subtítulo e cada um dos modelos para exposição ou oferta especial com fotos, preços e vinculação direta aos produtos da loja.
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
                  placeholder="Ex: Modelos Selecionados em Destaque"
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
                        {item.discountBadge && item.discountBadge.trim() !== "" && (
                          <span className="absolute top-1.5 left-1.5 z-10 text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                            {item.discountBadge}
                          </span>
                        )}
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
                        {/* Seletor Rápido de Produto do Catálogo */}
                        <div className="p-2.5 rounded-xl bg-amber-400/5 border border-amber-400/25 mb-1">
                          <label className="block text-amber-300 text-[11px] font-bold mb-1 flex items-center justify-between">
                            <span>Vincular Produto da Loja</span>
                            <span className="text-[10px] text-slate-400 font-normal">Link automático</span>
                          </label>
                          <select
                            value={item.slug || ""}
                            onChange={(e) => {
                              const selSlug = e.target.value;
                              const found = availableProducts.find((p) => p.slug === selSlug);
                              setPromotionalShowcase((prev) => ({
                                ...prev,
                                items: prev.items.map((it) => {
                                  if (it.id !== item.id) return it;
                                  if (!found) return { ...it, slug: selSlug };
                                  const imgUrl =
                                    found.images?.find((img: any) => img.is_primary)?.url ||
                                    found.images?.[0]?.url ||
                                    (typeof found.images?.[0] === "string" ? found.images[0] : it.image);
                                  const formattedPrice = found.price
                                    ? `R$ ${(found.price).toFixed(2).replace(".", ",")}`
                                    : it.promotionalPrice;
                                  const origFormatted =
                                    found.promotional_price && found.price
                                      ? `R$ ${(found.price).toFixed(2).replace(".", ",")}`
                                      : "";
                                  const finalPromo = found.promotional_price
                                    ? `R$ ${(found.promotional_price).toFixed(2).replace(".", ",")}`
                                    : formattedPrice;
                                  return {
                                    ...it,
                                    slug: found.slug,
                                    name: it.name && it.name !== "Novo Modelo em Oferta" ? it.name : found.name,
                                    originalPrice: origFormatted || it.originalPrice,
                                    promotionalPrice: finalPromo || it.promotionalPrice,
                                    image: imgUrl || it.image,
                                    category:
                                      (found.category as any)?.name ||
                                      (typeof found.category === "string" ? found.category : it.category),
                                  };
                                }),
                              }));
                            }}
                            className="w-full bg-[#040c16] border border-amber-400/40 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer font-medium"
                          >
                            <option value="">-- Vincular produto da loja (/produto/slug) --</option>
                            {availableProducts.map((prod) => (
                              <option key={prod.id || prod.slug} value={prod.slug}>
                                {prod.name} (/produto/{prod.slug})
                              </option>
                            ))}
                          </select>
                        </div>

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
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-slate-400 text-[11px]">Selo Desconto</label>
                              {item.discountBadge && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPromotionalShowcase((prev) => ({
                                      ...prev,
                                      items: prev.items.map((it) =>
                                        it.id === item.id ? { ...it, discountBadge: "" } : it
                                      ),
                                    }))
                                  }
                                  className="text-[9px] text-amber-400 hover:underline cursor-pointer"
                                >
                                  Sem selo
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={item.discountBadge || ""}
                              onChange={(e) =>
                                setPromotionalShowcase((prev) => ({
                                  ...prev,
                                  items: prev.items.map((it) =>
                                    it.id === item.id ? { ...it, discountBadge: e.target.value } : it
                                  ),
                                }))
                              }
                              placeholder="Vazio = sem selo"
                              className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-slate-400 text-[11px] mb-0.5">Preço Original</label>
                            <input
                              type="text"
                              value={item.originalPrice || ""}
                              onChange={(e) =>
                                setPromotionalShowcase((prev) => ({
                                  ...prev,
                                  items: prev.items.map((it) =>
                                    it.id === item.id ? { ...it, originalPrice: e.target.value } : it
                                  ),
                                }))
                              }
                              placeholder="Vazio = sem risco"
                              className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-[11px] mb-0.5">Preço Final</label>
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
                            <label className="block text-slate-400 text-[11px] mb-0.5">Slug (/produto/[slug])</label>
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
                              className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
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
