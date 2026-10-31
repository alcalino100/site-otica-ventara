"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  Layers,
  ShieldCheck,
  Save,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Clock,
  Zap,
  RotateCcw,
  Plus,
  Trash2,
  Palette,
  Upload,
  Award,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Gauge,
  SlidersHorizontal,
} from "lucide-react";
import { AdminLensItem, DEFAULT_LENSES } from "@/lib/lenses-data";
import {
  DEFAULT_LAB_SHOWCASE,
  DEFAULT_HOMOLOGATED_BRANDS,
  DEFAULT_LENSES_SECTION_SETTINGS,
} from "@/lib/site-settings-constants";
import {
  LabShowcaseSettings,
  HomologatedBrand,
  LensesSectionSettings,
  PartnerLogoItem,
} from "@/types/ecommerce";
import { LensOpticalGraphic } from "@/components/ui/lens-optical-graphic";
import {
  parsePriceToNumber,
  hasValidDiscount,
  calculateDiscountPercent,
} from "@/lib/utils/price";

export default function AdminLensesPage() {
  const [lenses, setLenses] = useState<AdminLensItem[]>(DEFAULT_LENSES);
  const [labShowcase, setLabShowcase] = useState<LabShowcaseSettings>(DEFAULT_LAB_SHOWCASE);
  const [homologatedBrands, setHomologatedBrands] = useState<HomologatedBrand[]>(DEFAULT_HOMOLOGATED_BRANDS);
  const [lensesSection, setLensesSection] = useState<LensesSectionSettings>(DEFAULT_LENSES_SECTION_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingLab, setIsSavingLab] = useState(false);
  const [isUploadingLab, setIsUploadingLab] = useState(false);
  const [isSavingBrands, setIsSavingBrands] = useState(false);
  const [uploadingBrandId, setUploadingBrandId] = useState<string | null>(null);
  const [isSavingLensesSection, setIsSavingLensesSection] = useState(false);
  const [isUploadingGraphic, setIsUploadingGraphic] = useState(false);
  const [uploadingLogoId, setUploadingLogoId] = useState<string | null>(null);
  const [selectedLens, setSelectedLens] = useState<AdminLensItem | null>(null);
  const [isNewLens, setIsNewLens] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  const validatePrices = (currentVal: string, originalVal?: string): string | null => {
    if (!originalVal || !originalVal.trim()) return null;
    const currentNum = parsePriceToNumber(currentVal);
    const originalNum = parsePriceToNumber(originalVal);
    if (currentNum !== null && originalNum !== null && originalNum <= currentNum) {
      return `O preço antigo (${originalVal}) deve ser estritamente maior que o preço atual (${currentVal}).`;
    }
    return null;
  };
  const [categoryFilter, setCategoryFilter] = useState<
    | "all"
    | "destaque-lab"
    | "marcas-homologadas"
    | "imagens-secao"
    | "visao-simples"
    | "multifocal"
    | "tratamentos"
    | "coloridas"
  >("all");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLens) return;

    setIsUploading(true);
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
        setSelectedLens({ ...selectedLens, boxImage: data.url });
      }
    } catch (err: any) {
      alert(err.message || "Falha no envio da imagem.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLabImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLab(true);
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
        setLabShowcase((prev) => ({ ...prev, boxImage: data.url }));
        setFeedback("Foto da caixa/marca enviada! Clique em 'Salvar Destaque' para publicar no site.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Falha no envio da imagem.");
    } finally {
      setIsUploadingLab(false);
    }
  };

  const handleSaveLabShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLab(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lab_showcase: labShowcase }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar informações do laboratório parceiro.");
      }

      setFeedback("Destaque do laboratório/marca atualizado e publicado no site!");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro inesperado ao salvar destaque do laboratório.");
    } finally {
      setIsSavingLab(false);
    }
  };

  const handleBrandBoxUpload = async (brandId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBrandId(brandId);
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
        setHomologatedBrands((prev) =>
          prev.map((b) => (b.id === brandId ? { ...b, boxImage: data.url } : b))
        );
        setFeedback("Foto da caixa atualizada! Clique em 'Salvar Marcas Homologadas' para aplicar.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Falha no envio da imagem.");
    } finally {
      setUploadingBrandId(null);
    }
  };

  const handleBrandLogoUpload = async (brandId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBrandId(`${brandId}-logo`);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao fazer upload da logo.");
      }

      if (data.url) {
        setHomologatedBrands((prev) =>
          prev.map((b) => (b.id === brandId ? { ...b, logo: data.url } : b))
        );
        setFeedback("Logo da marca atualizado! Clique em 'Salvar Marcas Homologadas' para aplicar.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Falha no envio da logo.");
    } finally {
      setUploadingBrandId(null);
    }
  };

  const handleSaveBrands = async () => {
    setIsSavingBrands(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homologated_brands: homologatedBrands }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar marcas homologadas.");
      }

      setFeedback("Marcas homologadas, fotos das caixas e especificações salvas com sucesso!");
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error(err);
      setFeedback(err.message || "Erro inesperado ao salvar marcas homologadas.");
    } finally {
      setIsSavingBrands(false);
    }
  };

  const handleGraphicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGraphic(true);
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
        setLensesSection((prev) => ({
          ...prev,
          graphicImageUrl: data.url,
          useCustomGraphic: true,
        }));
        setFeedback("Imagem do Símbolo Óptico enviada! Clique em 'Salvar Imagens da Seção' para publicar.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Falha no envio da imagem.");
    } finally {
      setIsUploadingGraphic(false);
    }
  };

  const handlePartnerLogoUpload = async (logoId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogoId(logoId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao fazer upload da logo.");
      }

      if (data.url) {
        setLensesSection((prev) => ({
          ...prev,
          partnerLogos: prev.partnerLogos.map((item) =>
            item.id === logoId ? { ...item, src: data.url } : item
          ),
        }));
        setFeedback("Logo da marca atualizada! Clique em 'Salvar Imagens da Seção' para publicar.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Falha no envio da logo.");
    } finally {
      setUploadingLogoId(null);
    }
  };

  const handleAddPartnerLogo = () => {
    const newLogo: PartnerLogoItem = {
      id: `partner-${Date.now()}`,
      name: "Nova Marca",
      src: "/logos/optisync.svg",
      alt: "Nova Marca Parceira",
    };
    setLensesSection((prev) => ({
      ...prev,
      partnerLogos: [...prev.partnerLogos, newLogo],
    }));
  };

  const handleRemovePartnerLogo = (id: string) => {
    setLensesSection((prev) => ({
      ...prev,
      partnerLogos: prev.partnerLogos.filter((p) => p.id !== id),
    }));
  };

  // Reordenação de logos do carrossel (mover para esquerda / direita)
  const handleMovePartnerLogo = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lensesSection.partnerLogos.length) return;

    setLensesSection((prev) => {
      const updated = [...prev.partnerLogos];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, partnerLogos: updated };
    });
  };

  // Reordenação de marcas homologadas (mover para cima / baixo)
  const handleMoveBrand = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= homologatedBrands.length) return;

    setHomologatedBrands((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  // Adicionar nova marca homologada
  const handleAddHomologatedBrand = () => {
    const newBrand: HomologatedBrand = {
      id: `brand-${Date.now()}`,
      name: "Novo Laboratório Homologado",
      logo: "/logos/optisync.svg",
      boxImage: "/images/lenses/optisync-box.jpg",
      badge: "Garantia Homologada",
      desc: "Lentes de alta precisão com tratamentos multicamadas certificados e montagem expressa em laboratório próprio.",
    };
    setHomologatedBrands((prev) => [...prev, newBrand]);
  };

  // Remover marca homologada
  const handleRemoveHomologatedBrand = (id: string) => {
    if (homologatedBrands.length <= 1) {
      alert("É necessário manter pelo menos uma marca homologada.");
      return;
    }
    if (confirm("Deseja realmente remover esta marca homologada?")) {
      setHomologatedBrands((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleSaveLensesSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLensesSection(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lenses_section: lensesSection }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar imagens e textos da seção de lentes.");
      }

      setFeedback("Imagens, símbolo óptico e logos da seção de lentes atualizados com sucesso!");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro inesperado ao salvar configurações.");
    } finally {
      setIsSavingLensesSection(false);
    }
  };

  useEffect(() => {
    async function loadLenses() {
      try {
        const res = await fetch("/api/admin/lenses");
        if (res.ok) {
          const data = await res.json();
          if (data.lenses && Array.isArray(data.lenses) && data.lenses.length > 0) {
            setLenses(data.lenses);
          }
        }
      } catch (err) {
        console.warn("Utilizando lentes padrão:", err);
      } finally {
        setIsLoading(false);
      }
    }

    async function loadLabSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.lab_showcase) {
            setLabShowcase((prev) => ({ ...prev, ...data.lab_showcase }));
          }
          if (data.homologated_brands && Array.isArray(data.homologated_brands) && data.homologated_brands.length > 0) {
            setHomologatedBrands(data.homologated_brands);
          }
          if (data.lenses_section) {
            setLensesSection((prev) => ({ ...prev, ...data.lenses_section }));
          }
        }
      } catch (err) {}
    }

    loadLenses();
    loadLabSettings();
  }, []);

  const handleSaveAll = async (updatedList: AdminLensItem[]) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/lenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lenses: updatedList }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar alterações.");
      }

      setLenses(updatedList);
      setFeedback("Catálogo de lentes, preços e especificações atualizado com sucesso!");
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error(err);
      setFeedback(err.message || "Erro inesperado ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateLens = (itemToSave: AdminLensItem) => {
    const err = validatePrices(itemToSave.startingPrice, itemToSave.originalPrice);
    if (err) {
      setPriceError(err);
      return;
    }
    setPriceError(null);

    let newList: AdminLensItem[];
    if (isNewLens) {
      newList = [itemToSave, ...lenses];
    } else {
      newList = lenses.map((item) => (item.id === itemToSave.id ? itemToSave : item));
    }
    setLenses(newList);
    setSelectedLens(null);
    setIsNewLens(false);
    handleSaveAll(newList);
  };

  const handleDeleteLens = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover a lente "${name}" do catálogo?`)) {
      const updated = lenses.filter((l) => l.id !== id);
      setLenses(updated);
      handleSaveAll(updated);
    }
  };

  const handleOpenNewModal = () => {
    const newItem: AdminLensItem = {
      id: `lente-${Date.now()}`,
      name: "",
      category:
        categoryFilter !== "all" &&
        categoryFilter !== "destaque-lab" &&
        categoryFilter !== "marcas-homologadas" &&
        categoryFilter !== "imagens-secao"
          ? categoryFilter
          : "visao-simples",
      brandName: "Novo Laboratório Homologado",
      brandLogo: "/logos/optisync.svg",
      treatment: "Antirreflexo Multicamadas + Proteção UV400",
      badge: "Novo Parceiro",
      startingPrice: "R$ 149,90",
      installment: "10x de R$ 14,99 sem juros",
      leadTime: "Pronto em até 1 hora",
      description: "Lente óptica de alta precisão com certificado de garantia de laboratório.",
      features: [
        "Antirreflexo multicamadas antirrisco",
        "Proteção integral contra radiação UV400",
        "Montagem de alta precisão em facetadora digital",
      ],
      isActive: true,
      colorHex: "#1e40af",
    };
    setSelectedLens(newItem);
    setIsNewLens(true);
    setPriceError(null);
  };

  const filteredLenses = lenses.filter((l) => {
    if (categoryFilter === "all") return true;
    return l.category === categoryFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Eye className="text-amber-400" size={24} />
            <span>Gestão de Lentes, Preços &amp; Fornecedores</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure valores, adicione novos laboratórios parceiros e gerencie as 8 cores solares exibidas no site.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleOpenNewModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
          >
            <Plus size={16} />
            <span>Adicionar Nova Lente</span>
          </button>

          <Link
            href="/#lentes"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold tracking-wider transition-all"
          >
            <span>Ver no Site</span>
            <ExternalLink size={13} className="text-amber-400" />
          </Link>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Filtros de Categoria */}
      <div className="flex items-center gap-2 bg-[#06111f] p-3 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setCategoryFilter("all")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            categoryFilter === "all"
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Todas ({lenses.length})
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter("visao-simples")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            categoryFilter === "visao-simples"
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Visão Simples (Monofocais)
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter("multifocal")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            categoryFilter === "multifocal"
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Multifocais (Progressivas)
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter("tratamentos")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            categoryFilter === "tratamentos"
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Filtro Azul &amp; Fotossensíveis
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter("coloridas")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            categoryFilter === "coloridas"
              ? "bg-amber-400 text-slate-950 shadow-sm font-bold"
              : "text-amber-400 hover:bg-amber-400/10"
          }`}
        >
          <Palette size={13} />
          <span>Lentes Solares &amp; Coloridas</span>
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter("destaque-lab")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            categoryFilter === "destaque-lab"
              ? "bg-amber-400 text-slate-950 shadow-sm font-bold"
              : "text-amber-400 hover:bg-amber-400/10 border border-amber-400/30"
          }`}
        >
          <Award size={13} />
          <span>Destaque Lab &amp; Marca Própria</span>
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter("marcas-homologadas")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            categoryFilter === "marcas-homologadas"
              ? "bg-amber-400 text-slate-950 shadow-sm font-bold"
              : "text-amber-400 hover:bg-amber-400/10 border border-amber-400/30"
          }`}
        >
          <ShieldCheck size={13} />
          <span>Marcas Homologadas ({homologatedBrands.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilter("imagens-secao")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            categoryFilter === "imagens-secao"
              ? "bg-amber-400 text-slate-950 shadow-sm font-bold"
              : "text-amber-400 hover:bg-amber-400/10 border border-amber-400/30"
          }`}
        >
          <SlidersHorizontal size={13} />
          <span>Carrossel de Parceiros (Logos &amp; Velocidade)</span>
        </button>
      </div>

      {/* SEÇÃO 1: FORMULÁRIO DO DESTAQUE DA MARCA PRÓPRIA / LABORATÓRIO PARCEIRO */}
      {categoryFilter === "destaque-lab" && (
        <form
          onSubmit={handleSaveLabShowcase}
          className="bg-[#06111f] border border-amber-400/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                PERSONALIZAÇÃO DE PARCERIAS
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Destaque do Laboratório Parceiro / Marca Própria
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Altere a foto da caixa da lente, o laboratório homologado, prazos e textos que aparecem em destaque na seção de lentes do site.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSavingLab}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer self-start sm:self-auto"
            >
              <Save size={15} />
              <span>{isSavingLab ? "Salvando..." : "Salvar Destaque"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Coluna 1: Foto da Caixa com Uploader Imediato */}
            <div className="lg:col-span-5 space-y-4">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Foto da Caixa / Lente do Laboratório *
              </label>

              <div className="bg-[#091829] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <div className="w-full max-w-[260px] aspect-square bg-white rounded-xl p-3 flex items-center justify-center shadow-lg border border-amber-400/20 overflow-hidden mb-4">
                  <img
                    src={labShowcase.boxImage || "/images/lenses/optisync-box.jpg"}
                    alt="Preview Caixa Lente"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="w-full space-y-2.5">
                  <label className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm">
                    <Upload size={15} />
                    <span>{isUploadingLab ? "Enviando Imagem..." : "Trocar Foto da Caixa"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLabImageUpload}
                      disabled={isUploadingLab}
                      className="hidden"
                    />
                  </label>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">
                      Ou informe o caminho/URL da imagem:
                    </span>
                    <input
                      type="text"
                      value={labShowcase.boxImage}
                      onChange={(e) =>
                        setLabShowcase({ ...labShowcase, boxImage: e.target.value })
                      }
                      className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                      placeholder="/images/lenses/optisync-box.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 2: Informações Técnicas e Textos */}
            <div className="lg:col-span-7 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Nome da Marca / Laboratório *
                  </label>
                  <input
                    type="text"
                    required
                    value={labShowcase.brandName}
                    onChange={(e) =>
                      setLabShowcase({ ...labShowcase, brandName: e.target.value })
                    }
                    placeholder="Ex: OPTiSYNC HD, Essilor, Zeiss"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Badge Superior *
                  </label>
                  <input
                    type="text"
                    required
                    value={labShowcase.badge}
                    onChange={(e) =>
                      setLabShowcase({ ...labShowcase, badge: e.target.value })
                    }
                    placeholder="Ex: VENTARA EXCLUSIVO ou PARCEIRO OFICIAL"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Título do Destaque *
                  </label>
                  <input
                    type="text"
                    required
                    value={labShowcase.headline}
                    onChange={(e) =>
                      setLabShowcase({ ...labShowcase, headline: e.target.value })
                    }
                    placeholder="Ex: OPTiSYNC HD · Filtro Azul & Antirreflexo"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Prazo / Subtítulo *
                  </label>
                  <input
                    type="text"
                    required
                    value={labShowcase.subtitle}
                    onChange={(e) =>
                      setLabShowcase({ ...labShowcase, subtitle: e.target.value })
                    }
                    placeholder="Ex: Montagem Expressa em até 1 Hora"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Descrição Técnica do Laboratório *
                </label>
                <textarea
                  rows={3}
                  required
                  value={labShowcase.description}
                  onChange={(e) =>
                    setLabShowcase({ ...labShowcase, description: e.target.value })
                  }
                  className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Vantagem 1
                  </label>
                  <input
                    type="text"
                    value={labShowcase.feature1}
                    onChange={(e) =>
                      setLabShowcase({ ...labShowcase, feature1: e.target.value })
                    }
                    placeholder="Filtro Azul Incluso"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Vantagem 2
                  </label>
                  <input
                    type="text"
                    value={labShowcase.feature2}
                    onChange={(e) =>
                      setLabShowcase({ ...labShowcase, feature2: e.target.value })
                    }
                    placeholder="Antirreflexo Multicamadas"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Vantagem 3
                  </label>
                  <input
                    type="text"
                    value={labShowcase.feature3}
                    onChange={(e) =>
                      setLabShowcase({ ...labShowcase, feature3: e.target.value })
                    }
                    placeholder="Garantia de Fábrica"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Texto do Botão WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={labShowcase.ctaText}
                    onChange={(e) =>
                      setLabShowcase({ ...labShowcase, ctaText: e.target.value })
                    }
                    placeholder="Ex: Pedir Orçamento OPTiSYNC"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Mensagem Padrão do WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={labShowcase.whatsappMessage}
                    onChange={(e) =>
                      setLabShowcase({ ...labShowcase, whatsappMessage: e.target.value })
                    }
                    placeholder="Mensagem ao clicar no botão"
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* SEÇÃO: FORMULÁRIO DAS MARCAS & LABORATÓRIOS HOMOLOGADOS (TODAS AS FOTOS DE CAIXAS) */}
      {categoryFilter === "marcas-homologadas" && (
        <div className="bg-[#06111f] border border-amber-400/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                LABORATÓRIOS &amp; FORNECEDORES OFICIAIS
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Marcas Homologadas &amp; Fotos das Caixas ({homologatedBrands.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                Altere a ordem, fotos das caixas, logos e descrições de cada marca parceira (Perego, Correct, Orgalens, HOYA, Kodak, Varilux, OPTiSYNC). Essas marcas aparecem no site e você pode adicionar novas ou reordenar livremente.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
              <button
                type="button"
                onClick={handleAddHomologatedBrand}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/40 text-xs font-bold transition-all cursor-pointer"
              >
                <Plus size={15} />
                <span>Adicionar Nova Marca</span>
              </button>

              <button
                type="button"
                onClick={handleSaveBrands}
                disabled={isSavingBrands}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
              >
                <Save size={15} />
                <span>{isSavingBrands ? "Salvando..." : "Salvar Marcas Homologadas"}</span>
              </button>
            </div>
          </div>

          {/* Grid com os parceiros homologados e reordenação */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {homologatedBrands.map((brand, idx) => (
              <div
                key={brand.id || idx}
                className="bg-[#0b1728] border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-amber-400 border border-white/10">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-[130px]">
                        {brand.name}
                      </span>
                    </div>

                    {/* Botões de Reordenação e Exclusão */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveBrand(idx, "up")}
                        disabled={idx === 0}
                        title="Subir posição"
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveBrand(idx, "down")}
                        disabled={idx === homologatedBrands.length - 1}
                        title="Descer posição"
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <ArrowDown size={13} />
                      </button>
                      {homologatedBrands.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHomologatedBrand(brand.id)}
                          title="Remover marca"
                          className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 transition-colors cursor-pointer ml-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Preview idêntico ao do site oficial (fundo branco orgânico com a caixa e logo) */}
                  <div className="relative w-full aspect-[4/3] rounded-xl bg-white p-3 flex items-center justify-center overflow-hidden shadow-inner mb-3 border border-slate-200">
                    {/* Logo no Canto Superior Esquerdo */}
                    <div className="absolute top-2 left-2 max-h-6 max-w-[95px] flex items-center bg-white/95 px-1.5 py-0.5 rounded shadow-xs z-10 border border-slate-100">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-h-4 max-w-full object-contain"
                      />
                    </div>

                    {/* Badge no Canto Superior Direito */}
                    <span className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 border border-amber-400/40 z-10">
                      {brand.badge}
                    </span>

                    {/* Imagem da Caixa */}
                    <img
                      src={brand.boxImage}
                      alt={`Embalagem ${brand.name}`}
                      className="max-h-full max-w-full object-contain drop-shadow-md"
                    />
                  </div>

                  {/* Botões de Upload da Caixa e Logo */}
                  <div className="space-y-2 mb-4">
                    <label className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-sm">
                      <Upload size={13} />
                      <span>
                        {uploadingBrandId === brand.id ? "Enviando..." : "Trocar Foto da Caixa"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingBrandId === brand.id}
                        onChange={(e) => handleBrandBoxUpload(brand.id, e)}
                      />
                    </label>

                    <label className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium text-[11px] cursor-pointer transition-all">
                      <ImageIcon size={12} />
                      <span>
                        {uploadingBrandId === `${brand.id}-logo` ? "Enviando..." : "Trocar Logo (.svg/.png)"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingBrandId === `${brand.id}-logo`}
                        onChange={(e) => handleBrandLogoUpload(brand.id, e)}
                      />
                    </label>
                  </div>

                  {/* Campos Editáveis */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Nome da Marca</label>
                      <input
                        type="text"
                        value={brand.name}
                        onChange={(e) =>
                          setHomologatedBrands((prev) =>
                            prev.map((b) => (b.id === brand.id ? { ...b, name: e.target.value } : b))
                          )
                        }
                        className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Selo / Badge</label>
                      <input
                        type="text"
                        value={brand.badge}
                        onChange={(e) =>
                          setHomologatedBrands((prev) =>
                            prev.map((b) => (b.id === brand.id ? { ...b, badge: e.target.value } : b))
                          )
                        }
                        className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Descrição Resumida</label>
                      <textarea
                        rows={2}
                        value={brand.desc}
                        onChange={(e) =>
                          setHomologatedBrands((prev) =>
                            prev.map((b) => (b.id === brand.id ? { ...b, desc: e.target.value } : b))
                          )
                        }
                        className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="button"
              onClick={handleSaveBrands}
              disabled={isSavingBrands}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
            >
              <Save size={15} />
              <span>{isSavingBrands ? "Salvando..." : "Salvar Todas as Marcas Homologadas"}</span>
            </button>
          </div>
        </div>
      )}

      {/* SEÇÃO: FORMULÁRIO DE IMAGENS DA SEÇÃO DE LENTES & SÍMBOLO ÓPTICO */}
      {categoryFilter === "imagens-secao" && (
        <form
          onSubmit={handleSaveLensesSection}
          className="bg-[#06111f] border border-amber-400/30 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl"
        >
          {/* Header da Aba */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                VISUAIS &amp; SÍMBOLO ÓPTICO DA SEÇÃO
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Imagens da Seção de Lentes &amp; Padrão Óptico
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                Personalize o símbolo/imagem do card de lentes de alta precisão, os textos de apresentação da seção e gerencie todas as logos que deslizam no carrossel de laboratórios parceiros.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSavingLensesSection}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer self-start sm:self-auto"
            >
              <Save size={15} />
              <span>{isSavingLensesSection ? "Salvando..." : "Salvar Imagens da Seção"}</span>
            </button>
          </div>

          {/* BLOCO 1: SÍMBOLO ÓPTICO / IMAGEM DO CARD */}
          <div className="bg-[#0a1526] border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>Imagem do Banner &amp; Símbolo Óptico (Página Inicial e /lentes)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Esta imagem é exibida no banner destacado de Lentes de Grau na Página Inicial e na página de catálogo (/lentes).
                </p>
              </div>

              {/* Toggle Custom vs Imagem Padrão */}
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-200 cursor-pointer bg-[#050f1d] px-3.5 py-2 rounded-xl border border-white/10 hover:border-amber-400/40 transition-colors">
                <input
                  type="checkbox"
                  checked={lensesSection.useCustomGraphic}
                  onChange={(e) =>
                    setLensesSection({
                      ...lensesSection,
                      useCustomGraphic: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 focus:ring-offset-0 bg-slate-900 border-slate-700"
                />
                <span>Usar Imagem Personalizada (Upload)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Preview ao Vivo do Card como fica no site */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-[#040c16] rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Prévia em Tempo Real (Banner da Home e /lentes)
                </span>
                <div className="relative p-5 rounded-3xl bg-gradient-to-br from-[#0f1d30] to-[#08121f] border border-slate-700/80 shadow-2xl flex flex-col items-center text-center max-w-[260px] w-full">
                  {lensesSection.useCustomGraphic && lensesSection.graphicImageUrl ? (
                    <div className="w-[180px] h-[140px] flex items-center justify-center relative overflow-hidden rounded-2xl bg-white/5 p-2">
                      <img
                        src={lensesSection.graphicImageUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain drop-shadow-[0_0_20px_rgba(56,189,248,0.35)]"
                      />
                    </div>
                  ) : (
                    <div className="w-[180px] h-[140px] flex items-center justify-center relative overflow-hidden rounded-2xl bg-white/5 p-2">
                      <img
                        src="/images/banners/lentes-3d-reflexo.png"
                        alt="Preview Lentes Padrão"
                        className="max-h-24 w-auto object-contain drop-shadow-md"
                      />
                    </div>
                  )}
                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 block">
                      {lensesSection.badgeTag || "PADRÃO ÓPTICO VENTARA"}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 mt-0.5 block">
                      {lensesSection.badgeSubtitle || "Antirreflexo Multicamadas & Alinhamento Dióptrico"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controles de Upload e Textos do Card */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Upload de Nova Imagem / Foto do Símbolo
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer transition-all shadow-md">
                      <Upload size={14} />
                      <span>{isUploadingGraphic ? "Enviando Imagem..." : "Escolher Imagem (PNG / JPG / WebP / SVG)"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleGraphicUpload}
                        disabled={isUploadingGraphic}
                        className="hidden"
                      />
                    </label>

                    {lensesSection.graphicImageUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          setLensesSection({
                            ...lensesSection,
                            graphicImageUrl: "",
                            useCustomGraphic: false,
                          })
                        }
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                      >
                        <RotateCcw size={13} />
                        <span>Restaurar Vetor 3D Padrão</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Envie uma foto em fundo transparente ou escuro para que os efeitos de brilho óptico se integrem perfeitamente.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    URL Direta da Imagem (Opcional)
                  </label>
                  <input
                    type="text"
                    value={lensesSection.graphicImageUrl || ""}
                    onChange={(e) =>
                      setLensesSection({
                        ...lensesSection,
                        graphicImageUrl: e.target.value,
                        useCustomGraphic: Boolean(e.target.value),
                      })
                    }
                    placeholder="https://... ou /images/..."
                    className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Texto do Selo / Tag Superior
                    </label>
                    <input
                      type="text"
                      value={lensesSection.badgeTag}
                      onChange={(e) =>
                        setLensesSection({
                          ...lensesSection,
                          badgeTag: e.target.value,
                        })
                      }
                      placeholder="PADRÃO ÓPTICO VENTARA"
                      className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Subtítulo do Selo / Especificação
                    </label>
                    <input
                      type="text"
                      value={lensesSection.badgeSubtitle}
                      onChange={(e) =>
                        setLensesSection({
                          ...lensesSection,
                          badgeSubtitle: e.target.value,
                        })
                      }
                      placeholder="Antirreflexo Multicamadas & Alinhamento Dióptrico"
                      className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BLOCO 2: APRESENTAÇÃO DA SEÇÃO */}
          <div className="bg-[#0a1526] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Edit3 size={16} className="text-amber-400" />
              <span>Textos de Apresentação da Seção</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título Principal da Seção
                </label>
                <input
                  type="text"
                  value={lensesSection.sectionTitle}
                  onChange={(e) =>
                    setLensesSection({
                      ...lensesSection,
                      sectionTitle: e.target.value,
                    })
                  }
                  placeholder="Lentes de Alta Precisão para cada necessidade da sua visão."
                  className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subtítulo / Descrição da Seção
                </label>
                <textarea
                  rows={2}
                  value={lensesSection.sectionSubtitle}
                  onChange={(e) =>
                    setLensesSection({
                      ...lensesSection,
                      sectionSubtitle: e.target.value,
                    })
                  }
                  placeholder="Organizamos as melhores marcas do mercado óptico internacional..."
                  className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </div>
          </div>

          {/* BLOCO 3: CARROSSEL DE LOGOS DOS PARCEIROS & LABORATÓRIOS */}
          <div className="bg-[#0a1526] border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award size={16} className="text-amber-400" />
                  <span>Carrossel de Parceiros Tecnológicos ({lensesSection.partnerLogos.length} Marcas)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Altere a ordem das logos, ajuste a velocidade do carrossel e troque ou adicione marcas parceiras.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddPartnerLogo}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Plus size={14} />
                <span>Adicionar Nova Marca / Logo</span>
              </button>
            </div>

            {/* CONTROLE DE VELOCIDADE DA ANIMAÇÃO */}
            <div className="bg-[#050f1d] border border-white/10 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Gauge size={16} className="text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Velocidade do Carrossel Animado
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs font-bold self-start sm:self-auto">
                  <span>{lensesSection.ribbonSpeedSeconds || 28} segundos</span>
                  <span className="text-slate-400 font-normal">por volta completa</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Quanto menor o número de segundos, mais rápido as logos se movimentam na tela do site.
              </p>

              <div className="flex items-center gap-4 pt-1">
                <span className="text-[11px] font-bold text-slate-400 shrink-0">Rápido (10s)</span>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="2"
                  value={lensesSection.ribbonSpeedSeconds || 28}
                  onChange={(e) =>
                    setLensesSection({
                      ...lensesSection,
                      ribbonSpeedSeconds: Number(e.target.value),
                    })
                  }
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-[11px] font-bold text-slate-400 shrink-0">Lento (60s)</span>
              </div>

              {/* Predefinições Rápidas */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Predefinições:</span>
                {[
                  { label: "Muito Rápido (16s)", val: 16 },
                  { label: "Rápido (22s)", val: 22 },
                  { label: "Padrão (28s)", val: 28 },
                  { label: "Suave (36s)", val: 36 },
                  { label: "Lento (48s)", val: 48 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() =>
                      setLensesSection({
                        ...lensesSection,
                        ribbonSpeedSeconds: preset.val,
                      })
                    }
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      (lensesSection.ribbonSpeedSeconds || 28) === preset.val
                        ? "bg-amber-400 text-slate-950 font-bold shadow-xs"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tag Superior do Carrossel
                </label>
                <input
                  type="text"
                  value={lensesSection.ribbonTag}
                  onChange={(e) =>
                    setLensesSection({
                      ...lensesSection,
                      ribbonTag: e.target.value,
                    })
                  }
                  placeholder="PARCEIROS TECNOLÓGICOS & LENTES HOMOLOGADAS"
                  className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subtítulo / Descrição do Carrossel
                </label>
                <input
                  type="text"
                  value={lensesSection.ribbonSubtitle}
                  onChange={(e) =>
                    setLensesSection({
                      ...lensesSection,
                      ribbonSubtitle: e.target.value,
                    })
                  }
                  placeholder="Garantia de procedência direta com laboratórios certificados e montagem expressa"
                  className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Lista de Logos com Controles de Reordenação (Ordem das Logos) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                <span>Ordem das Logos no Carrossel (Use as setas para reorganizar):</span>
                <span className="text-[11px] text-amber-400">{lensesSection.partnerLogos.length} parceiros configurados</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {lensesSection.partnerLogos.map((logo, idx) => (
                  <div
                    key={logo.id || idx}
                    className="p-3.5 rounded-xl bg-[#050f1d] border border-white/10 flex flex-col justify-between space-y-3 relative group hover:border-amber-400/40 transition-colors"
                  >
                    {/* Barra Superior do Card: Posição e Botões de Reordenação */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        Posição #{idx + 1}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMovePartnerLogo(idx, "left")}
                          disabled={idx === 0}
                          title="Mover para a esquerda (aparecer antes)"
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <ArrowLeft size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePartnerLogo(idx, "right")}
                          disabled={idx === lensesSection.partnerLogos.length - 1}
                          title="Mover para a direita (aparecer depois)"
                          className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Preview da Logo */}
                      <div className="w-20 h-12 rounded-lg bg-[#030812] border border-white/5 p-1.5 flex items-center justify-center shrink-0">
                        <img
                          src={logo.src}
                          alt={logo.alt || logo.name}
                          className="max-h-8 max-w-full object-contain"
                        />
                      </div>

                      {/* Informações e Botão de Trocar Logo */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <input
                          type="text"
                          value={logo.name}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setLensesSection((prev) => ({
                              ...prev,
                              partnerLogos: prev.partnerLogos.map((p) =>
                                p.id === logo.id ? { ...p, name: newName, alt: newName } : p
                              ),
                            }));
                          }}
                          placeholder="Nome da Marca"
                          className="w-full bg-transparent border-b border-white/10 focus:border-amber-400 text-xs font-semibold text-white px-0 py-0.5 focus:outline-none"
                        />

                        <div className="flex items-center gap-2 pt-0.5">
                          <label className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer inline-flex items-center gap-1">
                            <Upload size={10} />
                            <span>{uploadingLogoId === logo.id ? "Enviando..." : "Alterar Logo"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePartnerLogoUpload(logo.id, e)}
                              disabled={uploadingLogoId === logo.id}
                              className="hidden"
                            />
                          </label>

                          {lensesSection.partnerLogos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePartnerLogo(logo.id)}
                              className="text-[10px] text-red-400/80 hover:text-red-400 font-medium ml-auto cursor-pointer"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botão de Salvar no Rodapé */}
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={isSavingLensesSection}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
            >
              <Save size={15} />
              <span>{isSavingLensesSection ? "Salvando..." : "Salvar Todas as Configurações da Seção"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Grade de Lentes */}
      {categoryFilter !== "destaque-lab" &&
        categoryFilter !== "marcas-homologadas" &&
        categoryFilter !== "imagens-secao" && (
        <div className="space-y-4">
          {/* Card Resumo do Destaque Lab */}
          <div className="bg-[#06111f] border border-amber-400/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-amber-400/30">
                <img
                  src={labShowcase.boxImage || "/images/lenses/optisync-box.jpg"}
                  alt={labShowcase.brandName}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Destaque Atual: {labShowcase.headline}</span>
                  <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    {labShowcase.badge}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400">
                  {labShowcase.brandName} · {labShowcase.subtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCategoryFilter("destaque-lab")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 font-semibold text-xs tracking-wider transition-all self-start sm:self-auto cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Editar Destaque Lab</span>
            </button>
          </div>

          {/* Card de Acesso Rápido às Marcas Homologadas */}
          <div className="bg-[#06111f] border border-blue-400/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-blue-400/30 overflow-hidden">
                <img
                  src={homologatedBrands[1]?.boxImage || "/images/lenses/newflash-box.jpg"}
                  alt="Laboratórios Homologados"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Marcas Homologadas ({homologatedBrands.length} parceiros oficiais)</span>
                  <span className="text-[10px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                    Fotos das Caixas
                  </span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Perego, Correct, Orgalens, HOYA, Kodak, Varilux e OPTiSYNC
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCategoryFilter("marcas-homologadas")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold text-xs tracking-wider transition-all self-start sm:self-auto cursor-pointer"
            >
              <ShieldCheck size={13} />
              <span>Gerenciar Fotos das Caixas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLenses.map((lens) => (
          <div
            key={lens.id}
            className="bg-[#06111f] border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400/40 transition-all shadow-md group relative"
          >
            <div>
              {/* Header do Card */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  {lens.colorHex && (
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: lens.colorHex }}
                    />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                    {lens.badge || lens.brandName}
                  </span>
                </div>

                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Clock size={12} /> {lens.leadTime}
                </span>
              </div>

              {/* Nome & Marca */}
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">{lens.brandName}</p>
              <h3 className="text-base font-bold text-white tracking-tight mb-2">{lens.name}</h3>

              {/* Imagem da Caixa (Estilo Panda Elite) */}
              {lens.boxImage && (
                <div className="w-full h-28 bg-white rounded-xl p-2 mb-3 flex items-center justify-center overflow-hidden">
                  <img src={lens.boxImage} alt={lens.name} className="max-h-full max-w-full object-contain" />
                </div>
              )}

              {/* Tratamento */}
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-amber-300 font-medium mb-3 flex items-start gap-1.5">
                <Zap size={14} className="shrink-0 mt-0.5 text-amber-400" />
                <span>{lens.treatment}</span>
              </div>

              {/* Preço de Referência com Destaque Promocional */}
              <div className="mb-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">
                  Preço de Referência
                </span>
                <div className="flex items-baseline gap-2 flex-wrap">
                  {hasValidDiscount(lens.startingPrice, lens.originalPrice) && (
                    <span className="text-xs line-through text-slate-400 font-mono">
                      {lens.originalPrice}
                    </span>
                  )}
                  <span className="text-xl font-extrabold text-amber-400 font-mono">
                    {lens.startingPrice}
                  </span>
                  {hasValidDiscount(lens.startingPrice, lens.originalPrice) && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      -{calculateDiscountPercent(lens.startingPrice, lens.originalPrice)}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{lens.installment}</p>
              </div>

              {/* Descrição */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                {lens.description}
              </p>

              {/* Recursos / Qualidades */}
              <ul className="space-y-1 mb-4 text-[11px] text-slate-400">
                {lens.features.slice(0, 3).map((feat, i) => (
                  <li key={i} className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ações: Editar e Excluir */}
            <div className="pt-3 border-t border-white/5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedLens(lens);
                  setIsNewLens(false);
                  setPriceError(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={13} />
                <span>Editar Lente &amp; Preço</span>
              </button>

              <button
                type="button"
                onClick={() => handleDeleteLens(lens.id, lens.name)}
                aria-label={`Excluir lente ${lens.name}`}
                className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

      {/* Modal de Edição ou Criação de Lente */}
      {selectedLens && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#081724] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 size={18} className="text-amber-400" />
                  <span>{isNewLens ? "Adicionar Nova Lente / Laboratório" : `Editar Lente: ${selectedLens.name}`}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Altere valores, qualidades específicas, tratamentos e parcerias de laboratório.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedLens(null);
                  setIsNewLens(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateLens(selectedLens);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Categoria da Lente *</label>
                  <select
                    value={selectedLens.category}
                    onChange={(e) =>
                      setSelectedLens({
                        ...selectedLens,
                        category: e.target.value as AdminLensItem["category"],
                      })
                    }
                    className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="visao-simples">Visão Simples (Monofocal)</option>
                    <option value="multifocal">Multifocal (Progressiva)</option>
                    <option value="tratamentos">Filtro Luz Azul &amp; Fotossensíveis</option>
                    <option value="coloridas">Lentes Coloridas &amp; Solares</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Marca Homologada / Laboratório *</label>
                  <input
                    type="text"
                    required
                    value={selectedLens.brandName}
                    onChange={(e) => setSelectedLens({ ...selectedLens, brandName: e.target.value })}
                    className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    placeholder="Ex: OPTiSYNC HD, Perego, Hoya, Varilux..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Nome Comercial da Lente *</label>
                  <input
                    type="text"
                    required
                    value={selectedLens.name}
                    onChange={(e) => setSelectedLens({ ...selectedLens, name: e.target.value })}
                    className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    placeholder="Ex: OPTiSYNC HD Antirreflexo"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Selo / Badge em Destaque</label>
                  <input
                    type="text"
                    value={selectedLens.badge || ""}
                    onChange={(e) => setSelectedLens({ ...selectedLens, badge: e.target.value })}
                    className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    placeholder="Ex: Ventara Exclusivo, Alta Nitidez..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Preço de Venda (Atual) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: R$ 149,90"
                    value={selectedLens.startingPrice}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedLens({ ...selectedLens, startingPrice: val });
                      setPriceError(validatePrices(val, selectedLens.originalPrice));
                    }}
                    className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-medium">Preço Antigo (Original) - Opcional</label>
                    <span className="text-[10px] text-slate-400">Para exibição riscada</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ex: R$ 199,90"
                    value={selectedLens.originalPrice || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedLens({ ...selectedLens, originalPrice: val });
                      setPriceError(validatePrices(selectedLens.startingPrice, val));
                    }}
                    className={`w-full bg-[#040e17] border rounded-lg px-3 py-2 text-white font-mono focus:outline-none ${
                      priceError
                        ? "border-rose-500 focus:border-rose-400"
                        : "border-slate-700 focus:border-amber-400"
                    }`}
                  />
                  {hasValidDiscount(selectedLens.startingPrice, selectedLens.originalPrice) && (
                    <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                      <Sparkles size={12} className="shrink-0" />
                      <span>Desconto calculado: -{calculateDiscountPercent(selectedLens.startingPrice, selectedLens.originalPrice)}%</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Mensagem de Erro de Validação de Preço */}
              {priceError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
                >
                  <AlertCircle size={15} className="shrink-0 text-rose-400" />
                  <span>{priceError}</span>
                </div>
              )}

              {/* Toggle de Badge de Desconto */}
              {selectedLens.originalPrice && selectedLens.originalPrice.trim() !== "" && (
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 font-semibold block text-xs">Exibir Selo de Desconto %</span>
                    <span className="text-[11px] text-slate-400">
                      Exibe o selo com a porcentagem calculada (ex: -28%) no card da lente.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedLens.showDiscountBadge ?? true}
                      onChange={(e) =>
                        setSelectedLens({
                          ...selectedLens,
                          showDiscountBadge: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Parcelamento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 10x de R$ 14,99 sem juros"
                    value={selectedLens.installment}
                    onChange={(e) => setSelectedLens({ ...selectedLens, installment: e.target.value })}
                    className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Prazo de Montagem *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pronto em até 1 hora"
                    value={selectedLens.leadTime}
                    onChange={(e) => setSelectedLens({ ...selectedLens, leadTime: e.target.value })}
                    className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {selectedLens.category === "coloridas" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Cor Hexadecimal</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedLens.colorHex || "#1e40af"}
                        onChange={(e) => setSelectedLens({ ...selectedLens, colorHex: e.target.value })}
                        className="w-10 h-9 p-0.5 rounded bg-transparent border border-slate-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedLens.colorHex || "#1e40af"}
                        onChange={(e) => setSelectedLens({ ...selectedLens, colorHex: e.target.value })}
                        className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Identificador de Cor</label>
                    <input
                      type="text"
                      placeholder="Ex: azul, marrom, amarelo..."
                      value={selectedLens.lensColorId || ""}
                      onChange={(e) => setSelectedLens({ ...selectedLens, lensColorId: e.target.value })}
                      className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Foto da Embalagem / Caixa 3D (Estilo Panda Elite)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={selectedLens.boxImage || ""}
                    onChange={(e) => setSelectedLens({ ...selectedLens, boxImage: e.target.value })}
                    className="flex-1 bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    placeholder="URL da foto ou envie do seu dispositivo ao lado →"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer transition-colors shrink-0">
                    <Upload size={14} />
                    <span>{isUploading ? "Enviando..." : "Enviar Foto"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                  {selectedLens.boxImage && (
                    <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 border border-slate-600">
                      <img src={selectedLens.boxImage} alt="Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] text-slate-400 shrink-0">Modelos rápidos:</span>
                  {[
                    { label: "OPTiSYNC HD", path: "/images/lenses/optisync-box.jpg" },
                    { label: "Fotossensível", path: "/images/lenses/optisync-fotossensivel-box.jpg" },
                    { label: "Colorida", path: "/images/lenses/optisync-colorida-box.jpg" },
                    { label: "HOYA", path: "/images/lenses/hoya-box.jpg" },
                    { label: "Kodak", path: "/images/lenses/kodak-box.jpg" },
                    { label: "Orgalens", path: "/images/lenses/orgaline-box.jpg" },
                    { label: "Correct", path: "/images/lenses/correct-box.jpg" },
                    { label: "New Flash", path: "/images/lenses/newflash-box.jpg" },
                  ].map((preset) => (
                    <button
                      key={preset.path}
                      type="button"
                      onClick={() => setSelectedLens({ ...selectedLens, boxImage: preset.path })}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 whitespace-nowrap border border-white/5 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Tratamento em Destaque</label>
                <input
                  type="text"
                  value={selectedLens.treatment}
                  onChange={(e) => setSelectedLens({ ...selectedLens, treatment: e.target.value })}
                  className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  placeholder="Ex: Antirreflexo Super AR + Proteção UV400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Descrição e Qualidade Específica da Lente
                </label>
                <textarea
                  rows={3}
                  value={selectedLens.description}
                  onChange={(e) => setSelectedLens({ ...selectedLens, description: e.target.value })}
                  className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  Diferenciais e Benefícios (um por linha)
                </label>
                <textarea
                  rows={4}
                  value={selectedLens.features.join("\n")}
                  onChange={(e) =>
                    setSelectedLens({
                      ...selectedLens,
                      features: e.target.value.split("\n").filter((f) => f.trim().length > 0),
                    })
                  }
                  className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Cada linha digitada será exibida como um item com marcador dourado no card do site.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLens(null);
                    setIsNewLens(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save size={15} />
                  <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
