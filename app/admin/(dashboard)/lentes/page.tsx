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
import {
  AdminLensItem,
  DEFAULT_LENSES,
  isLensInColorSection,
  isLensInGeneralCatalog,
} from "@/lib/lenses-data";
import {
  DEFAULT_LAB_SHOWCASE,
  DEFAULT_HOMOLOGATED_BRANDS,
  DEFAULT_LENSES_SECTION_SETTINGS,
  DEFAULT_OPTISYNC_SETTINGS,
} from "@/lib/site-settings-constants";
import {
  LabShowcaseSettings,
  HomologatedBrand,
  LensesSectionSettings,
  PartnerLogoItem,
  OptiSyncPageSettings,
} from "@/types/ecommerce";
import { LensOpticalGraphic } from "@/components/ui/lens-optical-graphic";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
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
  const [optisyncSettings, setOptisyncSettings] = useState<OptiSyncPageSettings>(DEFAULT_OPTISYNC_SETTINGS);
  const [isSavingOptisync, setIsSavingOptisync] = useState(false);
  const [isUploadingOptisyncDesktopBg, setIsUploadingOptisyncDesktopBg] = useState(false);
  const [isUploadingOptisyncMobileBg, setIsUploadingOptisyncMobileBg] = useState(false);
  const [isUploadingOptisyncProduct, setIsUploadingOptisyncProduct] = useState(false);
  const [hexErrors, setHexErrors] = useState<Record<string, string>>({});
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
  const [uploadingLensField, setUploadingLensField] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: "",
    name: "",
  });
  const [deleteBrandConfirm, setDeleteBrandConfirm] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({
    isOpen: false,
    id: "",
    name: "",
  });
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "success" | "warning" | "info" } | null>(
    null
  );

  const validatePrices = (currentVal: string, originalVal?: string): string | null => {
    if (!originalVal || !originalVal.trim()) return null;
    const currentNum = parsePriceToNumber(currentVal);
    const originalNum = parsePriceToNumber(originalVal);
    if (currentNum !== null && originalNum !== null && originalNum <= currentNum) {
      return `O preço antigo (${originalVal}) deve ser estritamente maior que o preço atual (${currentVal}).`;
    }
    return null;
  };

  const validateHexColor = (key: string, val: string): boolean => {
    const isValid = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val);
    setHexErrors((prev) => {
      const copy = { ...prev };
      if (isValid) {
        delete copy[key];
      } else {
        copy[key] = "Hexadecimal inválido (use o formato #RRGGBB).";
      }
      return copy;
    });
    return isValid;
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
    | "secao-cores"
    | "optisync-cms"
  >("all");

  const handleLensImageUpload = async (
    field: "boxImage" | "discImage" | "heroImage",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !selectedLens) return;

    setUploadingLensField(field);
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
        setSelectedLens({ ...selectedLens, [field]: data.url });
      }
    } catch (err: any) {
      alert(err.message || "Falha no envio da imagem.");
    } finally {
      setUploadingLensField(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) =>
    handleLensImageUpload("boxImage", e);

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

  const handleRemovePartnerLogo = async (id: string, name?: string) => {
    if (confirm(`Deseja realmente remover a logo parceira "${name || "selecionada"}"?`)) {
      const updatedLogos = lensesSection.partnerLogos.filter((p) => p.id !== id);
      const updatedSection = { ...lensesSection, partnerLogos: updatedLogos };
      setLensesSection(updatedSection);
      try {
        await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lenses_section: updatedSection }),
        });
        setToastMessage({
          message: "Logo parceira removida e atualizada no site!",
          type: "success",
        });
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err: any) {
        console.error("Erro ao salvar remoção da logo:", err);
      }
    }
  };

  // Reordenação de logos do carrossel (mover para esquerda / direita)
  const handleMovePartnerLogo = async (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lensesSection.partnerLogos.length) return;

    const updated = [...lensesSection.partnerLogos];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const updatedSection = { ...lensesSection, partnerLogos: updated };
    setLensesSection(updatedSection);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lenses_section: updatedSection }),
      });
    } catch {}
  };

  // Reordenação de marcas homologadas (mover para cima / baixo)
  const handleMoveBrand = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= homologatedBrands.length) return;

    const updated = [...homologatedBrands];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setHomologatedBrands(updated);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homologated_brands: updated }),
      });
    } catch {}
  };

  // Adicionar nova marca homologada com persistência imediata
  const handleAddHomologatedBrand = async () => {
    const newBrand: HomologatedBrand = {
      id: `brand-${Date.now()}`,
      name: "Novo Laboratório Homologado",
      logo: "/logos/optisync.svg",
      boxImage: "/images/lenses/optisync-box.jpg",
      badge: "Garantia Homologada",
      desc: "Lentes de alta precisão com tratamentos multicamadas certificados e montagem expressa em laboratório próprio.",
    };
    const updated = [...homologatedBrands, newBrand];
    setHomologatedBrands(updated);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homologated_brands: updated }),
      });
      setToastMessage({
        message: "Novo laboratório homologado adicionado e salvo com sucesso!",
        type: "success",
      });
      setTimeout(() => setToastMessage(null), 3000);
    } catch {}
  };

  // Remover marca homologada / fornecedor com diálogo e persistência imediata
  const handleRemoveHomologatedBrand = (id: string, name: string) => {
    if (homologatedBrands.length <= 1) {
      alert("É necessário manter pelo menos um laboratório ou fornecedor homologado.");
      return;
    }
    setDeleteBrandConfirm({ isOpen: true, id, name });
  };

  const handleConfirmDeleteBrand = async () => {
    if (!deleteBrandConfirm.id) return;
    const brandId = deleteBrandConfirm.id;
    const brandName = deleteBrandConfirm.name;
    const updated = homologatedBrands.filter((b) => b.id !== brandId);
    setHomologatedBrands(updated);
    setDeleteBrandConfirm({ isOpen: false, id: "", name: "" });
    setIsSavingBrands(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homologated_brands: updated }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar exclusão da marca no banco de dados.");
      }
      setToastMessage({
        message: `Fornecedor/Laboratório "${brandName}" removido com sucesso!`,
        type: "success",
      });
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      console.error("Erro ao excluir fornecedor:", err);
      alert(err.message || "Erro inesperado ao excluir fornecedor no banco de dados.");
      loadLabSettings();
    } finally {
      setIsSavingBrands(false);
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

  const handleSaveOptisyncSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (Object.keys(hexErrors).length > 0) {
      alert("Por favor corrija as cores hexadecimais inválidas antes de salvar.");
      return;
    }
    setIsSavingOptisync(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optisync_page_settings: optisyncSettings }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar configurações da página OPTiSYNC.");
      }
      setFeedback("Configurações visuais e textos da página OPTiSYNC publicados com sucesso!");
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erro inesperado ao salvar página OPTiSYNC.");
    } finally {
      setIsSavingOptisync(false);
    }
  };

  const handleOptisyncImageUpload = async (
    target: "desktopBg" | "mobileBg" | "productImage",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === "desktopBg") setIsUploadingOptisyncDesktopBg(true);
    if (target === "mobileBg") setIsUploadingOptisyncMobileBg(true);
    if (target === "productImage") setIsUploadingOptisyncProduct(true);

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
        setOptisyncSettings((prev) => {
          if (target === "desktopBg") {
            return {
              ...prev,
              bgMode: "custom_image",
              customBgDesktopUrl: data.url,
            };
          }
          if (target === "mobileBg") {
            return {
              ...prev,
              customBgMobileUrl: data.url,
            };
          }
          return {
            ...prev,
            productBoxImage: data.url,
          };
        });
        setFeedback("Imagem enviada com sucesso! Clique em 'Salvar Configurações OPTiSYNC' para publicar.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || "Falha no envio da imagem.");
    } finally {
      setIsUploadingOptisyncDesktopBg(false);
      setIsUploadingOptisyncMobileBg(false);
      setIsUploadingOptisyncProduct(false);
    }
  };

  const handleResetOptisyncDefaults = () => {
    if (confirm("Deseja restaurar as configurações padrão de fábrica (efeitos em código, gradientes e cores) da página OPTiSYNC?")) {
      setOptisyncSettings(DEFAULT_OPTISYNC_SETTINGS);
      setHexErrors({});
    }
  };

  const colorSectionLenses = lenses
    .filter(isLensInColorSection)
    .sort((a, b) => (a.colorSectionOrder ?? 0) - (b.colorSectionOrder ?? 0));

  const handleMoveColorLens = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= colorSectionLenses.length) return;

    const sourceItem = colorSectionLenses[index];
    const targetItem = colorSectionLenses[targetIndex];

    const updatedLenses = lenses.map((l) => {
      if (l.id === sourceItem.id) {
        return { ...l, colorSectionOrder: targetIndex };
      }
      if (l.id === targetItem.id) {
        return { ...l, colorSectionOrder: index };
      }
      return l;
    });

    setLenses(updatedLenses);
    try {
      await handleSaveAll(updatedLenses);
    } catch {}
  };

  const loadLenses = async () => {
    try {
      const res = await fetch(`/api/admin/lenses?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lenses && Array.isArray(data.lenses)) {
          setLenses(data.lenses);
        }
      }
    } catch (err) {
      console.warn("Utilizando lentes padrão:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLabSettings = async () => {
    try {
      const res = await fetch(`/api/admin/settings?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lab_showcase) {
          setLabShowcase((prev) => ({ ...prev, ...data.lab_showcase }));
        }
        if (data.homologated_brands && Array.isArray(data.homologated_brands)) {
          setHomologatedBrands(data.homologated_brands);
        }
        if (data.lenses_section) {
          setLensesSection((prev) => ({ ...prev, ...data.lenses_section }));
        }
        if (data.optisync_page_settings) {
          setOptisyncSettings((prev) => ({ ...prev, ...data.optisync_page_settings }));
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
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
        throw new Error(data.error || "Erro ao salvar alterações no catálogo de lentes.");
      }

      setLenses(updatedList);
      setFeedback("Catálogo de lentes, preços e especificações atualizado com sucesso!");
      setTimeout(() => setFeedback(null), 3500);
      return data;
    } catch (err: any) {
      console.error("Erro ao salvar catálogo de lentes:", err);
      setFeedback(err.message || "Erro inesperado ao salvar.");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateLens = async (itemToSave: AdminLensItem) => {
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
    try {
      await handleSaveAll(newList);
      setToastMessage({
        message: isNewLens
          ? `Lente "${itemToSave.name}" adicionada ao catálogo!`
          : `Lente "${itemToSave.name}" atualizada com sucesso!`,
        type: "success",
      });
      setTimeout(() => setToastMessage(null), 3500);
    } catch (saveErr: any) {
      alert(saveErr.message || "Erro ao salvar lente.");
      loadLenses();
    }
  };

  const handleDeleteLens = (id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    const deletedId = deleteConfirm.id;
    const deletedName = deleteConfirm.name;
    const updated = lenses.filter((l) => l.id !== deletedId);
    setLenses(updated);
    setDeleteConfirm({ isOpen: false, id: "", name: "" });

    try {
      await handleSaveAll(updated);
      setToastMessage({
        message: `Lente "${deletedName}" removida do catálogo com sucesso.`,
        type: "success",
      });
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setToastMessage({
        message: `Erro ao excluir lente: ${err.message}`,
        type: "warning",
      });
      loadLenses();
    }
  };

  const handleOpenNewModal = () => {
    const isColoridas = categoryFilter === "coloridas" || categoryFilter === "secao-cores";
    const newItem: AdminLensItem = {
      id: `lente-${Date.now()}`,
      name: isColoridas ? "Nova Lente Solar Colorida" : "",
      category:
        isColoridas
          ? "coloridas"
          : categoryFilter === "visao-simples" ||
            categoryFilter === "multifocal" ||
            categoryFilter === "tratamentos"
          ? categoryFilter
          : "visao-simples",
      brandName: isColoridas ? "OPTiSYNC Solar HD" : "Novo Laboratório Homologado",
      brandLogo: "/logos/optisync.svg",
      treatment: isColoridas
        ? "Proteção UV400 + Polarizado HD"
        : "Antirreflexo Multicamadas + Proteção UV400",
      badge: isColoridas ? "Solar Premium" : "Novo Parceiro",
      startingPrice: isColoridas ? "R$ 199,90" : "R$ 149,90",
      installment: isColoridas ? "10x de R$ 19,99 sem juros" : "10x de R$ 14,99 sem juros",
      leadTime: "Pronto em até 1 hora",
      description: isColoridas
        ? "Lente solar polarizada de alta fidelidade cromática com 100% de absorção UV400 e nitidez aprimorada."
        : "Lente óptica de alta precisão com certificado de garantia de laboratório.",
      features: isColoridas
        ? [
            "Filtro polarizado para bloqueio de reflexos intensos",
            "Proteção 100% UVA/UVB com camada UV400",
            "Facetagem digital no laboratório em até 1 hora",
          ]
        : [
            "Antirreflexo multicamadas antirrisco",
            "Proteção integral contra radiação UV400",
            "Montagem de alta precisão em facetadora digital",
          ],
      isActive: true,
      showInGeneralCatalog: !isColoridas,
      showInColorSection: isColoridas,
      colorSectionOrder: isColoridas ? colorSectionLenses.length : undefined,
      colorHex: isColoridas ? "#166534" : "#1e40af",
      colorName: isColoridas ? "Verde G-15 Polarizado" : undefined,
      categoryTag: isColoridas ? "Uso Diário & Alta Claridade" : undefined,
      bestFor: isColoridas ? "Dias ensolarados, direção e esportes ao ar livre" : undefined,
      boxImage: "/images/lenses/optisync-colorida-box.jpg",
      discImage: isColoridas ? "/images/lenses/solar/disc-verde.png" : undefined,
      heroImage: isColoridas ? "/images/lenses/solar/hero-lens-verde.png" : undefined,
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
          onClick={() => setCategoryFilter("secao-cores")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            categoryFilter === "secao-cores"
              ? "bg-amber-400 text-slate-950 shadow-sm font-bold"
              : "text-amber-400 hover:bg-amber-400/10 border border-amber-400/30"
          }`}
        >
          <Palette size={13} />
          <span>Seção de Cores &amp; Mostruário ({colorSectionLenses.length})</span>
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
        <button
          type="button"
          onClick={() => setCategoryFilter("optisync-cms")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            categoryFilter === "optisync-cms"
              ? "bg-amber-400 text-slate-950 shadow-sm font-bold"
              : "text-amber-400 hover:bg-amber-400/10 border border-amber-400/30"
          }`}
        >
          <Sparkles size={13} />
          <span>Página OPTiSYNC (CMS &amp; Efeitos)</span>
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
                          onClick={() => handleRemoveHomologatedBrand(brand.id, brand.name)}
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

      {/* SEÇÃO: MOSTRUÁRIO DE CORES & SEÇÃO DE CORES (RODAPÉ) */}
      {categoryFilter === "secao-cores" && (
        <div className="bg-[#06111f] border border-amber-400/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                SEÇÃO EXCLUSIVA DE CORES &amp; MOSTRUÁRIO
              </span>
              <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                <Palette className="text-amber-400" size={20} />
                <span>Gestão da Seção de Cores ({colorSectionLenses.length} Amostras Ativas)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                Estas lentes aparecem <strong>exclusivamente na seção de cores</strong>, no rodapé da página de lentes e na página inicial. Elas não entram na listagem do catálogo geral superior. Reordene a exibição, altere a cor hexadecimal, foto do disco ou edite detalhes.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  handleOpenNewModal();
                  setTimeout(() => {
                    setSelectedLens((prev) =>
                      prev
                        ? {
                            ...prev,
                            category: "coloridas",
                            showInGeneralCatalog: false,
                            showInColorSection: true,
                            colorSectionOrder: colorSectionLenses.length,
                          }
                        : null
                    );
                  }, 10);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Nova Cor / Amostra</span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveAll(lenses)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
              >
                <Save size={15} />
                <span>{isSaving ? "Salvando..." : "Salvar Amostras"}</span>
              </button>
            </div>
          </div>

          {/* Dica / Alerta sobre visibilidade */}
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-xs flex items-center gap-2.5">
            <ShieldCheck size={16} className="shrink-0 text-blue-400" />
            <span>
              <strong>Regra de exibição:</strong> Se todas as cores forem desativadas ou removidas da seção de cores, o mostruário é automaticamente ocultado na loja para não deixar espaço em branco.
            </span>
          </div>

          {colorSectionLenses.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-[#030914] p-8">
              <Palette size={36} className="mx-auto text-slate-600 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Nenhuma cor ativa na Seção de Cores</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                No momento, nenhuma lente solar está marcada com &quot;Exibir na Seção de Cores&quot;. A seção está oculta no site público.
              </p>
              <button
                type="button"
                onClick={handleOpenNewModal}
                className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-300 transition-colors"
              >
                Adicionar Primeira Amostra
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                <span>Ordem de exibição no mostruário (Use as setas para reposicionar):</span>
                <span className="text-[11px] text-amber-400">{colorSectionLenses.length} amostras configuradas</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {colorSectionLenses.map((lens, idx) => (
                  <div
                    key={lens.id}
                    className="p-4 rounded-2xl bg-[#081527] border border-white/10 flex flex-col justify-between space-y-3 relative hover:border-amber-400/40 transition-colors"
                  >
                    {/* Header do Card com Ordem e Ações Rápidas */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          Posição #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white truncate max-w-[140px]">
                          {lens.colorName || lens.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveColorLens(idx, "up")}
                          disabled={idx === 0}
                          title="Mover para cima (exibir antes no mostruário)"
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveColorLens(idx, "down")}
                          disabled={idx === colorSectionLenses.length - 1}
                          title="Mover para baixo (exibir depois no mostruário)"
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Linha Principal: Amostra, Disco e Campos Rápidos */}
                    <div className="grid grid-cols-12 gap-3 items-center">
                      {/* Amostra Visual & Disco */}
                      <div className="col-span-4 flex items-center gap-2 bg-[#040e1c] p-2 rounded-xl border border-white/5">
                        <div
                          className="w-9 h-9 rounded-full shrink-0 border-2 border-white/30 shadow-md relative overflow-hidden"
                          style={{ backgroundColor: lens.colorHex || "#166534" }}
                        >
                          {lens.discImage && (
                            <img
                              src={lens.discImage}
                              alt={lens.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex flex-col gap-1 min-w-0">
                          <input
                            type="color"
                            value={lens.colorHex || "#166534"}
                            onChange={(e) => {
                              const val = e.target.value;
                              validateHexColor(`lens-${lens.id}`, val);
                              setLenses((prev) =>
                                prev.map((l) => (l.id === lens.id ? { ...l, colorHex: val } : l))
                              );
                            }}
                            className="w-7 h-5 p-0 bg-transparent border-0 cursor-pointer"
                            title="Escolher cor da amostra"
                          />
                          <input
                            type="text"
                            value={lens.colorHex || "#166534"}
                            onChange={(e) => {
                              const val = e.target.value;
                              validateHexColor(`lens-${lens.id}`, val);
                              setLenses((prev) =>
                                prev.map((l) => (l.id === lens.id ? { ...l, colorHex: val } : l))
                              );
                            }}
                            className="w-16 bg-black/40 border border-white/10 rounded px-1 text-[10px] font-mono text-white"
                          />
                        </div>
                      </div>

                      {/* Campos Textuais Rápidos */}
                      <div className="col-span-8 space-y-1.5 text-xs">
                        <input
                          type="text"
                          value={lens.colorName || lens.name}
                          placeholder="Nome da Tonalidade (ex: Verde G-15 Polarizado)"
                          onChange={(e) => {
                            const val = e.target.value;
                            setLenses((prev) =>
                              prev.map((l) =>
                                l.id === lens.id ? { ...l, colorName: val, name: val } : l
                              )
                            );
                          }}
                          className="w-full bg-[#040e1c] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={lens.categoryTag || ""}
                            placeholder="Texto Curto / Indicação"
                            onChange={(e) => {
                              const val = e.target.value;
                              setLenses((prev) =>
                                prev.map((l) =>
                                  l.id === lens.id ? { ...l, categoryTag: val } : l
                                )
                              );
                            }}
                            className="flex-1 bg-[#040e1c] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-amber-400"
                          />

                          <input
                            type="text"
                            value={lens.startingPrice}
                            placeholder="Preço (ex: R$ 199,90)"
                            onChange={(e) => {
                              const val = e.target.value;
                              setLenses((prev) =>
                                prev.map((l) =>
                                  l.id === lens.id ? { ...l, startingPrice: val } : l
                                )
                              );
                            }}
                            className="w-24 bg-[#040e1c] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Rodapé do Card com Status e Botão Editar Detalhes */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-2.5 text-[11px]">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                          <input
                            type="checkbox"
                            checked={lens.isActive}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setLenses((prev) =>
                                prev.map((l) => (l.id === lens.id ? { ...l, isActive: val } : l))
                              );
                            }}
                            className="rounded text-amber-400 bg-slate-900 border-slate-700"
                          />
                          <span>Ativa no site</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white" title="Se marcado, esta cor também entra na grade superior de /lentes">
                          <input
                            type="checkbox"
                            checked={lens.showInGeneralCatalog ?? false}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setLenses((prev) =>
                                prev.map((l) =>
                                  l.id === lens.id ? { ...l, showInGeneralCatalog: val } : l
                                )
                              );
                            }}
                            className="rounded text-blue-400 bg-slate-900 border-slate-700"
                          />
                          <span>Também no Catálogo Geral</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLens(lens);
                            setIsNewLens(false);
                          }}
                          className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 size={12} />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLens(lens.id, lens.name)}
                          className="text-red-400/80 hover:text-red-400 cursor-pointer ml-1"
                          title="Remover cor"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveAll(lenses)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
            >
              <Save size={15} />
              <span>{isSaving ? "Salvando..." : "Salvar Alterações da Seção de Cores"}</span>
            </button>
          </div>
        </div>
      )}

      {/* SEÇÃO: CMS VISUAL & EFEITOS DA PÁGINA OPTISYNC */}
      {categoryFilter === "optisync-cms" && (
        <form
          onSubmit={handleSaveOptisyncSettings}
          className="bg-[#06111f] border border-amber-400/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                PÁGINA EXCLUSIVA /OPTISYNC · CMS TOTAL
              </span>
              <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                <Sparkles className="text-amber-400" size={20} />
                <span>Personalização Visual da Página OPTiSYNC HD</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                Altere a arte de fundo personalizada (desktop e mobile), as cores dos gradientes, a intensidade dos feixes elétricos de luz, o reflexo espelhado no piso e todos os blocos de conteúdo da página sem novo deploy.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handleResetOptisyncDefaults}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold tracking-wider transition-all cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Restaurar Padrão</span>
              </button>

              <Link
                href="/optisync"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold tracking-wider transition-all"
              >
                <span>Ver /optisync ao Vivo</span>
                <ExternalLink size={13} className="text-blue-400" />
              </Link>

              <button
                type="submit"
                disabled={isSavingOptisync}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
              >
                <Save size={15} />
                <span>{isSavingOptisync ? "Salvando..." : "Salvar Configurações"}</span>
              </button>
            </div>
          </div>

          {/* CARD 1: FUNDO, FEIXES E ATMOSFERA VISUAL */}
          <div className="bg-[#0a1526] border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" />
                  <span>Fundo Tecnológico, Feixes de Luz &amp; Reflexo no Piso</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Escolha se deseja o clima recriado por código leve (CSS/SVG) ou a arte gráfica própria do cliente.
                </p>
              </div>

              {/* Seletor de Modo */}
              <div className="flex items-center bg-[#040e1c] p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() =>
                    setOptisyncSettings((prev) => ({ ...prev, bgMode: "code" }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    optisyncSettings.bgMode === "code"
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Efeitos em Código (CSS/SVG)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOptisyncSettings((prev) => ({ ...prev, bgMode: "custom_image" }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    optisyncSettings.bgMode === "custom_image"
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Arte Gráfica Própria (Upload)
                </button>
              </div>
            </div>

            {/* Upload de Arte Gráfica Própria (quando em custom_image) */}
            {optisyncSettings.bgMode === "custom_image" && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-4">
                <span className="text-xs font-bold text-amber-300 block uppercase tracking-wider">
                  Arte de Fundo do Cliente (Desktop &amp; Mobile)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Arte Desktop */}
                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold block">
                      Arte de Fundo Desktop (1920x1080 recomendado)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={optisyncSettings.customBgDesktopUrl || ""}
                        placeholder="URL da arte desktop..."
                        onChange={(e) =>
                          setOptisyncSettings((prev) => ({
                            ...prev,
                            customBgDesktopUrl: e.target.value,
                          }))
                        }
                        className="flex-1 bg-[#040e1c] border border-white/10 rounded-xl px-3 py-2 text-white"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer shrink-0">
                        <Upload size={14} />
                        <span>{isUploadingOptisyncDesktopBg ? "Enviando..." : "Upload Desktop"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleOptisyncImageUpload("desktopBg", e)}
                          disabled={isUploadingOptisyncDesktopBg}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Arte Mobile */}
                  <div className="space-y-2">
                    <label className="text-slate-300 font-semibold block">
                      Arte de Fundo Mobile (Opcional - ex: vertical)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={optisyncSettings.customBgMobileUrl || ""}
                        placeholder="URL da arte mobile..."
                        onChange={(e) =>
                          setOptisyncSettings((prev) => ({
                            ...prev,
                            customBgMobileUrl: e.target.value,
                          }))
                        }
                        className="flex-1 bg-[#040e1c] border border-white/10 rounded-xl px-3 py-2 text-white"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer shrink-0">
                        <Upload size={14} />
                        <span>{isUploadingOptisyncMobileBg ? "Enviando..." : "Upload Mobile"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleOptisyncImageUpload("mobileBg", e)}
                          disabled={isUploadingOptisyncMobileBg}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-slate-300 text-xs font-semibold block mb-1">
                      Ponto Focal da Imagem
                    </label>
                    <select
                      value={optisyncSettings.bgFocalPoint || "center"}
                      onChange={(e) =>
                        setOptisyncSettings((prev) => ({
                          ...prev,
                          bgFocalPoint: e.target.value as any,
                        }))
                      }
                      className="w-full bg-[#040e1c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="center">Centralizado (Center)</option>
                      <option value="top">Topo (Top)</option>
                      <option value="bottom">Base (Bottom)</option>
                      <option value="left">Esquerda (Left)</option>
                      <option value="right">Direita (Right)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 text-xs font-semibold">
                        Overlay de Escurecimento / Legibilidade
                      </label>
                      <span className="text-xs text-amber-400 font-mono">
                        {optisyncSettings.bgOverlayOpacity ?? 50}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={optisyncSettings.bgOverlayOpacity ?? 50}
                      onChange={(e) =>
                        setOptisyncSettings((prev) => ({
                          ...prev,
                          bgOverlayOpacity: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Controles de Cores, Feixes e Intensidade */}
            <div className="space-y-4 pt-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Paleta Cromática &amp; Efeitos Tecnológicos
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Gradiente Base From */}
                <div className="space-y-1">
                  <label className="text-slate-400 block">Gradiente Início (Índigo Profundo)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={optisyncSettings.gradientBaseFrom || "#040B2B"}
                      onChange={(e) => {
                        const val = e.target.value;
                        validateHexColor("gradFrom", val);
                        setOptisyncSettings((prev) => ({ ...prev, gradientBaseFrom: val }));
                      }}
                      className="w-8 h-8 p-0 rounded bg-transparent border border-white/10 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={optisyncSettings.gradientBaseFrom || "#040B2B"}
                      onChange={(e) => {
                        const val = e.target.value;
                        validateHexColor("gradFrom", val);
                        setOptisyncSettings((prev) => ({ ...prev, gradientBaseFrom: val }));
                      }}
                      className="w-full bg-[#040e1c] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
                    />
                  </div>
                  {hexErrors["gradFrom"] && (
                    <span className="text-[10px] text-rose-400 block">{hexErrors["gradFrom"]}</span>
                  )}
                </div>

                {/* Gradiente Base To */}
                <div className="space-y-1">
                  <label className="text-slate-400 block">Gradiente Fim (Azul Noturno)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={optisyncSettings.gradientBaseTo || "#0A1A6B"}
                      onChange={(e) => {
                        const val = e.target.value;
                        validateHexColor("gradTo", val);
                        setOptisyncSettings((prev) => ({ ...prev, gradientBaseTo: val }));
                      }}
                      className="w-8 h-8 p-0 rounded bg-transparent border border-white/10 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={optisyncSettings.gradientBaseTo || "#0A1A6B"}
                      onChange={(e) => {
                        const val = e.target.value;
                        validateHexColor("gradTo", val);
                        setOptisyncSettings((prev) => ({ ...prev, gradientBaseTo: val }));
                      }}
                      className="w-full bg-[#040e1c] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
                    />
                  </div>
                  {hexErrors["gradTo"] && (
                    <span className="text-[10px] text-rose-400 block">{hexErrors["gradTo"]}</span>
                  )}
                </div>

                {/* Feixe Azul Elétrico */}
                <div className="space-y-1">
                  <label className="text-slate-400 block">Feixe de Luz Azul Elétrico</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={optisyncSettings.beamColorBlue || "#1E4BFF"}
                      onChange={(e) => {
                        const val = e.target.value;
                        validateHexColor("beamBlue", val);
                        setOptisyncSettings((prev) => ({ ...prev, beamColorBlue: val }));
                      }}
                      className="w-8 h-8 p-0 rounded bg-transparent border border-white/10 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={optisyncSettings.beamColorBlue || "#1E4BFF"}
                      onChange={(e) => {
                        const val = e.target.value;
                        validateHexColor("beamBlue", val);
                        setOptisyncSettings((prev) => ({ ...prev, beamColorBlue: val }));
                      }}
                      className="w-full bg-[#040e1c] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
                    />
                  </div>
                  {hexErrors["beamBlue"] && (
                    <span className="text-[10px] text-rose-400 block">{hexErrors["beamBlue"]}</span>
                  )}
                </div>

                {/* Feixe Roxo Elétrico */}
                <div className="space-y-1">
                  <label className="text-slate-400 block">Feixe de Luz Roxo Elétrico</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={optisyncSettings.beamColorPurple || "#7A2CFF"}
                      onChange={(e) => {
                        const val = e.target.value;
                        validateHexColor("beamPurple", val);
                        setOptisyncSettings((prev) => ({ ...prev, beamColorPurple: val }));
                      }}
                      className="w-8 h-8 p-0 rounded bg-transparent border border-white/10 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={optisyncSettings.beamColorPurple || "#7A2CFF"}
                      onChange={(e) => {
                        const val = e.target.value;
                        validateHexColor("beamPurple", val);
                        setOptisyncSettings((prev) => ({ ...prev, beamColorPurple: val }));
                      }}
                      className="w-full bg-[#040e1c] border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs"
                    />
                  </div>
                  {hexErrors["beamPurple"] && (
                    <span className="text-[10px] text-rose-400 block">{hexErrors["beamPurple"]}</span>
                  )}
                </div>
              </div>

              {/* Sliders de Intensidade e Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400">Intensidade dos Feixes</span>
                    <span className="text-amber-400 font-mono">{optisyncSettings.beamsIntensity ?? 70}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={optisyncSettings.beamsIntensity ?? 70}
                    onChange={(e) =>
                      setOptisyncSettings((prev) => ({
                        ...prev,
                        beamsIntensity: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400">Brilho Radial do Produto</span>
                    <span className="text-amber-400 font-mono">{optisyncSettings.glowIntensity ?? 60}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={optisyncSettings.glowIntensity ?? 60}
                    onChange={(e) =>
                      setOptisyncSettings((prev) => ({
                        ...prev,
                        glowIntensity: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#040e1c] rounded-xl border border-white/5">
                  <span className="text-slate-300 font-medium">Animação dos Feixes</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={optisyncSettings.enableAnimation ?? true}
                      onChange={(e) =>
                        setOptisyncSettings((prev) => ({
                          ...prev,
                          enableAnimation: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-[#040e1c] rounded-xl border border-white/5">
                  <span className="text-slate-300 font-medium">Reflexo Espelhado no Piso</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={optisyncSettings.enableFloorReflection ?? true}
                      onChange={(e) =>
                        setOptisyncSettings((prev) => ({
                          ...prev,
                          enableFloorReflection: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: PRODUTO EM PRIMEIRO PLANO & TEXTOS DO HERO */}
          <div className="bg-[#0a1526] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Eye size={16} className="text-amber-400" />
              <span>Produto em Primeiro Plano (Hero) &amp; Textos</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Foto do Produto */}
              <div className="lg:col-span-5 space-y-3">
                <label className="text-xs font-semibold text-slate-300 block">
                  Foto do Produto em Destaque (Caixa / Lente)
                </label>
                <div className="p-4 bg-[#040e1c] border border-white/10 rounded-2xl flex flex-col items-center justify-center">
                  <div className="w-full max-w-[220px] aspect-square bg-[#030914] rounded-xl p-3 flex items-center justify-center shadow-lg border border-amber-400/20 overflow-hidden mb-3">
                    <img
                      src={optisyncSettings.productBoxImage || "/images/lenses/optisync-box.jpg"}
                      alt="Preview Produto"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="w-full space-y-2">
                    <label className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer">
                      <Upload size={14} />
                      <span>{isUploadingOptisyncProduct ? "Enviando..." : "Trocar Foto do Produto"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleOptisyncImageUpload("productImage", e)}
                        disabled={isUploadingOptisyncProduct}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      value={optisyncSettings.productBoxImage || ""}
                      onChange={(e) =>
                        setOptisyncSettings((prev) => ({
                          ...prev,
                          productBoxImage: e.target.value,
                        }))
                      }
                      placeholder="/images/lenses/optisync-box.jpg"
                      className="w-full bg-[#040e1c] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Textos do Hero */}
              <div className="lg:col-span-7 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Badge Superior</label>
                    <input
                      type="text"
                      value={optisyncSettings.heroBadge || ""}
                      onChange={(e) =>
                        setOptisyncSettings((prev) => ({ ...prev, heroBadge: e.target.value }))
                      }
                      className="w-full bg-[#040e1c] border border-white/10 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Título Hero</label>
                    <input
                      type="text"
                      value={optisyncSettings.heroTitle || ""}
                      onChange={(e) =>
                        setOptisyncSettings((prev) => ({ ...prev, heroTitle: e.target.value }))
                      }
                      className="w-full bg-[#040e1c] border border-white/10 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Destaque do Título (Dourado)</label>
                  <input
                    type="text"
                    value={optisyncSettings.heroTitleHighlight || ""}
                    onChange={(e) =>
                      setOptisyncSettings((prev) => ({ ...prev, heroTitleHighlight: e.target.value }))
                    }
                    className="w-full bg-[#040e1c] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Texto Lead / Descrição</label>
                  <textarea
                    rows={3}
                    value={optisyncSettings.heroDescription || ""}
                    onChange={(e) =>
                      setOptisyncSettings((prev) => ({ ...prev, heroDescription: e.target.value }))
                    }
                    className="w-full bg-[#040e1c] border border-white/10 rounded-xl px-3 py-2 text-white leading-relaxed resize-none"
                  />
                </div>

                {/* Selos de Características */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Selo 1 (ex: Filtro Azul)</label>
                    <input
                      type="text"
                      value={optisyncSettings.heroFeatures?.[0] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOptisyncSettings((prev) => {
                          const f = [...(prev.heroFeatures || ["Filtro azul", "Antirreflexo", "Montagem rápida"])];
                          f[0] = val;
                          return { ...prev, heroFeatures: f };
                        });
                      }}
                      className="w-full bg-[#040e1c] border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Selo 2 (ex: Antirreflexo)</label>
                    <input
                      type="text"
                      value={optisyncSettings.heroFeatures?.[1] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOptisyncSettings((prev) => {
                          const f = [...(prev.heroFeatures || ["Filtro azul", "Antirreflexo", "Montagem rápida"])];
                          f[1] = val;
                          return { ...prev, heroFeatures: f };
                        });
                      }}
                      className="w-full bg-[#040e1c] border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-0.5">Selo 3 (ex: Montagem 1h)</label>
                    <input
                      type="text"
                      value={optisyncSettings.heroFeatures?.[2] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOptisyncSettings((prev) => {
                          const f = [...(prev.heroFeatures || ["Filtro azul", "Antirreflexo", "Montagem rápida"])];
                          f[2] = val;
                          return { ...prev, heroFeatures: f };
                        });
                      }}
                      className="w-full bg-[#040e1c] border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: VISIBILIDADE DAS SEÇÕES DA PÁGINA */}
          <div className="bg-[#0a1526] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers size={16} className="text-amber-400" />
              <span>Visibilidade das Seções da Página /optisync</span>
            </h3>
            <p className="text-xs text-slate-400">
              Ative ou desative cada bloco de conteúdo individualmente de acordo com a estratégia comercial.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[
                { key: "showHero", label: "Hero Principal" },
                { key: "showBenefits", label: "Bloco de Benefícios" },
                { key: "showModels", label: "Modelos da Linha" },
                { key: "showComparison", label: "Tabela Comparativa" },
                { key: "showSpecs", label: "Especificações Técnicas" },
                { key: "showFaq", label: "Perguntas Frequentes (FAQ)" },
                { key: "showWhatsappCta", label: "CTA Especialista WhatsApp" },
                { key: "showColorsCta", label: "Link p/ Seção de Cores" },
              ].map((sec) => (
                <div
                  key={sec.key}
                  className="flex items-center justify-between p-3 bg-[#040e1c] rounded-xl border border-white/5"
                >
                  <span className="text-slate-300 font-medium">{sec.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(optisyncSettings as any)[sec.key] ?? true}
                      onChange={(e) =>
                        setOptisyncSettings((prev) => ({
                          ...prev,
                          [sec.key]: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Botão de Salvar no Rodapé */}
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={isSavingOptisync}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
            >
              <Save size={15} />
              <span>{isSavingOptisync ? "Salvando..." : "Salvar Todas as Configurações OPTiSYNC"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Grade de Lentes */}
      {categoryFilter !== "destaque-lab" &&
        categoryFilter !== "marcas-homologadas" &&
        categoryFilter !== "imagens-secao" &&
        categoryFilter !== "secao-cores" &&
        categoryFilter !== "optisync-cms" && (
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

              {/* Visibilidade no Site: Catálogo Geral vs Seção de Cores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-700/80">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-slate-200 font-semibold block text-xs">Exibir no Catálogo Geral</span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Grade superior de /lentes, filtros e contagens
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedLens.showInGeneralCatalog ?? selectedLens.category !== "coloridas"}
                      onChange={(e) =>
                        setSelectedLens({
                          ...selectedLens,
                          showInGeneralCatalog: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3 sm:border-l sm:border-white/10 sm:pl-3">
                  <div>
                    <span className="text-slate-200 font-semibold block text-xs">Exibir na Seção de Cores</span>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      Mostruário de amostras coloridas no rodapé
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedLens.showInColorSection ?? selectedLens.category === "coloridas"}
                      onChange={(e) =>
                        setSelectedLens({
                          ...selectedLens,
                          showInColorSection: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5.5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
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
                <div className="space-y-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <Palette size={16} className="text-amber-400" />
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      Configurações Específicas de Lente Colorida &amp; Solar
                    </span>
                  </div>

                  {/* Nome da Cor e Categoria Solar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">
                        Nome Comercial da Tonalidade *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Verde G-15 Polarizado, Âmbar Solar..."
                        value={selectedLens.colorName || ""}
                        onChange={(e) =>
                          setSelectedLens({ ...selectedLens, colorName: e.target.value })
                        }
                        className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">
                        Tag de Categoria Solar
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Uso Diário & Condução, Alta Luminosidade..."
                        value={selectedLens.categoryTag || ""}
                        onChange={(e) =>
                          setSelectedLens({ ...selectedLens, categoryTag: e.target.value })
                        }
                        className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Indicação de Uso */}
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">
                      Indicação de Uso (Melhor para)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Condução diurna, dias muito ensolarados e esportes ao ar livre"
                      value={selectedLens.bestFor || ""}
                      onChange={(e) =>
                        setSelectedLens({ ...selectedLens, bestFor: e.target.value })
                      }
                      className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Seletor de Cores e Identificador */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Cor Hexadecimal</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={selectedLens.colorHex || "#1e40af"}
                          onChange={(e) =>
                            setSelectedLens({ ...selectedLens, colorHex: e.target.value })
                          }
                          className="w-10 h-9 p-0.5 rounded bg-transparent border border-slate-700 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedLens.colorHex || "#1e40af"}
                          onChange={(e) =>
                            setSelectedLens({ ...selectedLens, colorHex: e.target.value })
                          }
                          className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">
                        Identificador Interno de Cor (Filtro)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: verde, ambar, cinza, azul, vermelho..."
                        value={selectedLens.lensColorId || ""}
                        onChange={(e) =>
                          setSelectedLens({ ...selectedLens, lensColorId: e.target.value })
                        }
                        className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  {/* Foto do Disco Solar (Lente Colorida Redonda) */}
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">
                      Foto do Disco Solar (Lente Redonda / Mostruário)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={selectedLens.discImage || ""}
                        onChange={(e) =>
                          setSelectedLens({ ...selectedLens, discImage: e.target.value })
                        }
                        className="flex-1 bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        placeholder="URL da foto do disco ou faça upload →"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer transition-colors shrink-0">
                        <Upload size={14} />
                        <span>
                          {uploadingLensField === "discImage" ? "Enviando..." : "Enviar Disco"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLensImageUpload("discImage", e)}
                          disabled={uploadingLensField !== null}
                        />
                      </label>
                      {selectedLens.discImage && (
                        <div className="w-12 h-12 bg-[#040e17] rounded-lg p-1 flex items-center justify-center shrink-0 border border-slate-600">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedLens.discImage}
                            alt="Preview Disco"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                      <span className="text-[10px] text-slate-400 shrink-0">Discos rápidos:</span>
                      {[
                        { label: "Verde G-15", path: "/images/lenses/solar/disc-verde.png" },
                        { label: "Âmbar", path: "/images/lenses/solar/disc-marrom.png" },
                        { label: "Cinza Fumê", path: "/images/lenses/solar/disc-cinza-fume.png" },
                        { label: "Azul Safira", path: "/images/lenses/solar/disc-azul-espelhado.png" },
                        { label: "Vermelho Rubi", path: "/images/lenses/solar/disc-vermelho-espelhado.png" },
                        { label: "Amarelo Night", path: "/images/lenses/solar/disc-amarelo.png" },
                        { label: "Degradê", path: "/images/lenses/solar/disc-degrade.png" },
                      ].map((preset) => (
                        <button
                          key={preset.path}
                          type="button"
                          onClick={() => setSelectedLens({ ...selectedLens, discImage: preset.path })}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 whitespace-nowrap border border-white/5 cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Foto do Modelo / Hero Editorial */}
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">
                      Foto do Modelo / Editorial com a Lente (Hero)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={selectedLens.heroImage || ""}
                        onChange={(e) =>
                          setSelectedLens({ ...selectedLens, heroImage: e.target.value })
                        }
                        className="flex-1 bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                        placeholder="URL da foto do modelo usando a lente solar →"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs cursor-pointer transition-colors shrink-0">
                        <Upload size={14} />
                        <span>
                          {uploadingLensField === "heroImage" ? "Enviando..." : "Enviar Modelo"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLensImageUpload("heroImage", e)}
                          disabled={uploadingLensField !== null}
                        />
                      </label>
                      {selectedLens.heroImage && (
                        <div className="w-12 h-12 bg-[#040e17] rounded-lg p-1 flex items-center justify-center shrink-0 border border-slate-600">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedLens.heroImage}
                            alt="Preview Modelo"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                      <span className="text-[10px] text-slate-400 shrink-0">Modelos rápidos:</span>
                      {[
                        { label: "Modelo Verde", path: "/images/lenses/solar/hero-lens-verde.png" },
                        { label: "Modelo Âmbar", path: "/images/lenses/solar/hero-lens-marrom.png" },
                        { label: "Modelo Cinza", path: "/images/lenses/solar/hero-lens-cinza-fume.png" },
                        { label: "Modelo Azul", path: "/images/lenses/solar/hero-lens-azul-espelhado.png" },
                        { label: "Modelo Vermelho", path: "/images/lenses/solar/hero-lens-vermelho-espelhado.png" },
                        { label: "Modelo Amarelo", path: "/images/lenses/solar/hero-lens-amarelo.png" },
                        { label: "Modelo Degradê", path: "/images/lenses/solar/hero-lens-degrade.png" },
                      ].map((preset) => (
                        <button
                          key={preset.path}
                          type="button"
                          onClick={() => setSelectedLens({ ...selectedLens, heroImage: preset.path })}
                          className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 whitespace-nowrap border border-white/5 cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
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

      {/* Diálogo de Confirmação para Remoção de Lente */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Remover Lente do Catálogo"
        message={`Tem certeza que deseja excluir "${deleteConfirm.name}"? Esta ação removerá o produto do catálogo da loja.`}
        confirmText="Sim, Remover Lente"
        cancelText="Voltar"
        variant="danger"
        isLoading={isSaving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: "", name: "" })}
      />

      {/* Diálogo de Confirmação para Remoção de Fornecedor / Marca Homologada */}
      <ConfirmDialog
        isOpen={deleteBrandConfirm.isOpen}
        title="Remover Laboratório / Fornecedor"
        message={`Tem certeza que deseja remover o fornecedor "${deleteBrandConfirm.name}"? Esta ação removerá a marca e as fotos das caixas do catálogo.`}
        confirmText="Sim, Remover Fornecedor"
        cancelText="Voltar"
        variant="danger"
        isLoading={isSavingBrands}
        onConfirm={handleConfirmDeleteBrand}
        onCancel={() => setDeleteBrandConfirm({ isOpen: false, id: "", name: "" })}
      />

      {/* Notificação Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
