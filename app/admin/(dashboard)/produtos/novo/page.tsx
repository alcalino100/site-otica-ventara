"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Upload,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  Trash2,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Eye,
  Check,
  Tag,
  Layers,
  Move,
} from "lucide-react";
import { FrameType, FrameShape, FrameMaterial, FrameGender, Product } from "@/types/ecommerce";
import { formatCurrencyBRL, formatProductPricing } from "@/lib/pricing";
import { ImageFocusEditor } from "@/components/admin/image-focus-editor";
import { focusForSave, focusObjectPosition } from "@/lib/image-focus";
import { FaceFitEditor } from "@/components/admin/face-fit-editor";
import type { FaceShapeFit } from "@/lib/face-shapes";

interface VariantFormItem {
  id: string;
  name: string;
  sku: string;
  color_hex: string;
  image_url?: string;
  price_real?: string;
  compare_price_real?: string;
  is_available: boolean;
}

interface ImageUploadItem {
  url: string;
  alt_text: string;
  is_primary: boolean;
  width?: number;
  height?: number;
  isDarkWarning?: boolean;
  isLowResWarning?: boolean;
  isVerticalWarning?: boolean;
  aspectWarningText?: string;
  /** Posição da foto nos cards (% do object-position); vazio = automático. */
  focus_x?: number | null;
  focus_y?: number | null;
}

export default function NewProductQuickFlowPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- Passo 1: Fotos ---
  const [images, setImages] = useState<ImageUploadItem[]>([]);
  const [focusEditIdx, setFocusEditIdx] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  // --- Passo 2: Identificação ---
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [brandName, setBrandName] = useState("Ventara Eyewear");
  const [frameType, setFrameType] = useState<FrameType>("Grau");
  const [gender, setGender] = useState<FrameGender>("Unissex");

  // --- Passo 3: Preços ---
  const [priceReal, setPriceReal] = useState("389,00");
  const [comparePriceReal, setComparePriceReal] = useState("");

  // --- Passo 4: Variações (Cores e Acabamentos) ---
  const [variants, setVariants] = useState<VariantFormItem[]>([
    {
      id: "var-1",
      name: "Preto Clássico",
      sku: "",
      color_hex: "#0f172a",
      is_available: true,
    },
  ]);

  // --- Passo 5: Descrição e Ficha Técnica ---
  const [description, setDescription] = useState("");
  const [frameShape, setFrameShape] = useState<FrameShape>("Quadrado");
  const [frameMaterial, setFrameMaterial] = useState<FrameMaterial>("Acetato Premium");
  const [lensMm, setLensMm] = useState<number | "">("");
  const [bridgeMm, setBridgeMm] = useState<number | "">("");
  const [templeMm, setTempleMm] = useState<number | "">("");
  const [frameWidthMm, setFrameWidthMm] = useState<number | "">("");
  const [lensHeightMm, setLensHeightMm] = useState<number | "">("");
  const [hasTempleEngraving, setHasTempleEngraving] = useState<boolean>(false);
  const [materialOrigin, setMaterialOrigin] = useState<string>("");
  const [faceFit, setFaceFit] = useState<FaceShapeFit>({});

  // Carregar padrões inteligentes do último produto cadastrado
  useEffect(() => {
    try {
      const savedType = localStorage.getItem("ventara_last_frame_type") as FrameType;
      const savedMaterial = localStorage.getItem("ventara_last_frame_material") as FrameMaterial;
      const savedGender = localStorage.getItem("ventara_last_gender") as FrameGender;
      if (savedType) setFrameType(savedType);
      if (savedMaterial) setFrameMaterial(savedMaterial);
      if (savedGender) setGender(savedGender);
    } catch {
      // Ignora erro de localStorage
    }
  }, []);

  // Atualizar slug e SKU base ao digitar o nome
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(generatedSlug);

    if (!sku || sku.startsWith("VEN-")) {
      const cleanPart = generatedSlug.replace(/[^a-z0-9]/g, "").slice(0, 8).toUpperCase();
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const newSku = `VEN-${cleanPart || "PROD"}-${randomSuffix}`;
      setSku(newSku);

      // Atualiza o SKU da primeira variante se estiver vazio
      setVariants((prev) =>
        prev.map((v, idx) =>
          idx === 0 && (!v.sku || v.sku.startsWith("VEN-"))
            ? { ...v, sku: `${newSku}-01` }
            : v
        )
      );
    }
  };

  // Upload e análise de imagem (qualidade, resolução e luminosidade)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const newUploaded: ImageUploadItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const resData = await res.json();
        if (res.ok && resData.url) {
          // Analisar dimensões da imagem no cliente
          const img = new window.Image();
          img.src = resData.url;
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });

          const isLowRes = img.naturalWidth > 0 && img.naturalWidth < 1000;
          let isVerticalWarning = false;
          let aspectWarningText: string | undefined;
          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            const ratio = img.naturalWidth / img.naturalHeight;
            if (ratio < 0.95) {
              isVerticalWarning = true;
              aspectWarningText =
                "Esta foto está em proporção vertical (retrato). Na vitrine ela será enquadrada em 4:3 com fundo neutro #F7F7F4 para evitar cortes nas pontas da armação. Recomendamos fotos horizontais em 4:3 com fundo claro.";
            } else if (ratio < 1.15 || ratio > 1.6) {
              aspectWarningText =
                "Esta foto está fora da proporção 4:3 recomendada. Na vitrine será enquadrada centralizada com fundo neutro #F7F7F4 sem distorção.";
            }
          }

          newUploaded.push({
            url: resData.url,
            is_primary: images.length === 0 && newUploaded.length === 0,
            alt_text: `${name || "Armação Ventara"} - Foto ${images.length + newUploaded.length + 1}`,
            width: img.naturalWidth,
            height: img.naturalHeight,
            isLowResWarning: isLowRes,
            isVerticalWarning,
            aspectWarningText,
          });
        }
      }

      if (newUploaded.length > 0) {
        setImages((prev) => [...prev, ...newUploaded]);
        setSuccessMessage(`${newUploaded.length} foto(s) enviada(s) com sucesso.`);
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        throw new Error("Não foi possível processar o envio das fotos.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Falha ao enviar fotos. Tente novamente.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddDirectUrl = () => {
    if (!urlInput.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        url: urlInput.trim(),
        alt_text: `${name || "Armação Ventara"} - Foto ${prev.length + 1}`,
        is_primary: prev.length === 0,
      },
    ]);
    setUrlInput("");
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length > 0 && !next.some((img) => img.is_primary)) {
        next[0].is_primary = true;
      }
      return next;
    });
  };

  const handleSetPrimary = (idx: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === idx,
      }))
    );
  };

  // Gerenciamento de Variações
  const handleAddVariant = () => {
    const nextIdx = variants.length + 1;
    const baseSkuClean = sku || `VEN-${slug.toUpperCase().slice(0, 6) || "ITEM"}`;
    setVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}`,
        name: `Variação ${nextIdx}`,
        sku: `${baseSkuClean}-${String(nextIdx).padStart(2, "0")}`,
        color_hex: "#475569",
        is_available: true,
      },
    ]);
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) {
      setErrorMessage("O produto deve ter ao menos uma variação (cor padrão).");
      return;
    }
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  // Validação de pendências para publicação segura
  const numCurrentPrice =
    parseFloat(priceReal.replace(/\./g, "").replace(",", ".")) || 0;
  const numComparePrice = comparePriceReal
    ? parseFloat(comparePriceReal.replace(/\./g, "").replace(",", "."))
    : null;

  const currentPriceInCents = Math.round(numCurrentPrice * 100);
  const comparePriceInCents = numComparePrice ? Math.round(numComparePrice * 100) : null;

  const hasPhotos = images.length > 0;
  const hasName = name.trim().length > 0;
  const hasSku = sku.trim().length > 0;
  const hasPrice = currentPriceInCents > 0;
  const hasDescription = description.trim().length > 0;

  // Verifica SKUs duplicados entre variações
  const variantSkus = variants.map((v) => v.sku.trim().toUpperCase());
  const hasDuplicateVariantSkus = new Set(variantSkus).size !== variantSkus.length;

  const isReadyToPublish =
    hasPhotos && hasName && hasSku && hasPrice && hasDescription && !hasDuplicateVariantSkus;

  const pendingReasons: string[] = [];
  if (!hasPhotos) pendingReasons.push("Foto principal não cadastrada");
  if (!hasName) pendingReasons.push("Nome do modelo ausente");
  if (!hasSku) pendingReasons.push("SKU do produto ausente");
  if (!hasPrice) pendingReasons.push("Preço de venda inválido ou zero");
  if (!hasDescription) pendingReasons.push("Ficha/descrição não preenchida");
  if (hasDuplicateVariantSkus) pendingReasons.push("Existem variações com o mesmo SKU");

  // Preço e Desconto calculados pela camada matemática única
  const calculatedPricing = formatProductPricing({
    price_in_cents: currentPriceInCents,
    compare_at_price_in_cents: comparePriceInCents,
  });

  // Onde o produto aparecerá no site
  const willAppearIn = [
    { name: "Início (Catálogo Geral)", active: isReadyToPublish },
    { name: "Armações (/armacoes)", active: isReadyToPublish },
    {
      name: "Ofertas em Destaque",
      active: isReadyToPublish && calculatedPricing.hasDiscount,
      badge: calculatedPricing.hasDiscount ? calculatedPricing.discountBadgeText : null,
    },
    { name: "Página de Detalhes (/produto/[slug])", active: true },
    { name: "Checkout & Link de WhatsApp Oficial", active: true },
  ];

  // Salvar produto (com opção de cadastrar outro em sequência)
  const handleSave = async (andCreateAnother = false) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!hasName) {
      setErrorMessage("Por favor, informe o nome do produto no Passo 2.");
      setCurrentStep(2);
      return;
    }

    if (!hasSku) {
      setErrorMessage("O SKU do produto é obrigatório.");
      setCurrentStep(2);
      return;
    }

    if (hasDuplicateVariantSkus) {
      setErrorMessage("Não é permitido salvar variações com o mesmo SKU. Ajuste no Passo 4.");
      setCurrentStep(4);
      return;
    }

    setIsSubmitting(true);

    try {
      // Salva padrões no localStorage para agilizar o próximo cadastro
      try {
        localStorage.setItem("ventara_last_frame_type", frameType);
        localStorage.setItem("ventara_last_frame_material", frameMaterial);
        localStorage.setItem("ventara_last_gender", gender);
      } catch {
        // Ignora
      }

      const payload = {
        name: name.trim(),
        slug: slug.trim() || `armacao-${Date.now()}`,
        sku: sku.trim().toUpperCase(),
        description: description.trim() || null,
        price_in_cents: currentPriceInCents,
        compare_at_price_in_cents: comparePriceInCents,
        status: isReadyToPublish ? "publicado" : "rascunho",
        availability: "disponivel",
        is_published: isReadyToPublish,
        is_featured: false,
        frame_type: frameType,
        frame_shape: frameShape,
        frame_material: frameMaterial,
        gender: gender,
        dimensions_lens_mm: typeof lensMm === "number" && lensMm > 0 ? lensMm : null,
        dimensions_bridge_mm: typeof bridgeMm === "number" && bridgeMm > 0 ? bridgeMm : null,
        dimensions_temple_mm: typeof templeMm === "number" && templeMm > 0 ? templeMm : null,
        dimensions_frame_width_mm: typeof frameWidthMm === "number" && frameWidthMm > 0 ? frameWidthMm : null,
        dimensions_lens_height_mm: typeof lensHeightMm === "number" && lensHeightMm > 0 ? lensHeightMm : null,
        has_temple_engraving: hasTempleEngraving,
        material_origin: materialOrigin.trim() || null,
        face_shape_fit: faceFit,
        images: images.map((img, idx) => ({
          url: img.url,
          is_primary: img.is_primary,
          alt_text: img.alt_text || `${name} - Foto ${idx + 1}`,
          sort_order: idx,
          ...(focusForSave(img) ?? {}),
        })),
        variants: variants.map((v, idx) => {
          const varPriceNum = v.price_real
            ? parseFloat(v.price_real.replace(/\./g, "").replace(",", "."))
            : null;
          const varCompareNum = v.compare_price_real
            ? parseFloat(v.compare_price_real.replace(/\./g, "").replace(",", "."))
            : null;

          return {
            sku: (v.sku || `${sku}-${idx + 1}`).trim().toUpperCase(),
            color_name: v.name.trim() || "Padrão",
            color_hex: v.color_hex || "#0f172a",
            size: "Único",
            stock_quantity: 5,
            price_in_cents: varPriceNum ? Math.round(varPriceNum * 100) : currentPriceInCents,
            compare_at_price_in_cents: varCompareNum ? Math.round(varCompareNum * 100) : comparePriceInCents,
            image_url: v.image_url || images[0]?.url || null,
            is_available: v.is_available,
            sort_order: idx,
          };
        }),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar produto.");
      }

      // Cadastrou, mas o banco ainda não tem as colunas da posição da foto: mostra o aviso por mais tempo
      const warn = data.warning ? ` Atenção: ${data.warning}` : "";
      const messageTime = warn ? 9000 : 4000;

      if (andCreateAnother) {
        setSuccessMessage(`Produto "${name}" cadastrado com sucesso! Formulário pronto para o próximo.${warn}`);
        // Reseta formulário mantendo tipo, material e linha
        setName("");
        setSlug("");
        setSku("");
        setImages([]);
        setFaceFit({});
        setDescription("");
        setPriceReal("389,00");
        setComparePriceReal("");
        setVariants([
          {
            id: `var-${Date.now()}`,
            name: "Preto Clássico",
            sku: "",
            color_hex: "#0f172a",
            is_available: true,
          },
        ]);
        setCurrentStep(1);
        setTimeout(() => setSuccessMessage(null), messageTime);
      } else {
        setSuccessMessage(`Produto "${name}" cadastrado com sucesso! Redirecionando...${warn}`);
        setTimeout(() => {
          router.push("/admin/produtos");
          router.refresh();
        }, warn ? 7000 : 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Erro inesperado ao cadastrar produto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: "Fotos", desc: "Foto primeiro" },
    { num: 2, label: "Identificação", desc: "Nome e SKU" },
    { num: 3, label: "Preços", desc: "Venda e Oferta" },
    { num: 4, label: "Variações", desc: "Cores e acabamento" },
    { num: 5, label: "Ficha Técnica", desc: "Medidas e material" },
    { num: 6, label: "Revisão", desc: "Prévia ao vivo" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Cabeçalho Superior com Navegação Amigável */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/produtos"
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              <span>Voltar a Produtos</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Cadastro Rápido
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Cadastrar Novo Produto
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastre uma vez e veja refletir automaticamente em todo o site, vitrines e WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/10 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={isSubmitting ? "animate-spin" : ""} />
            <span>Salvar e Cadastrar Outro</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 disabled:opacity-50 cursor-pointer"
          >
            <Save size={14} />
            <span>{isSubmitting ? "Salvando..." : isReadyToPublish ? "Publicar no Site" : "Salvar Rascunho"}</span>
          </button>
        </div>
      </div>

      {/* Alertas de Feedback */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">
            <span className="font-bold block">Atenção</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Barra de Progresso em Etapas Guiadas */}
      <div className="bg-[#0b1728] border border-white/10 rounded-2xl p-3 sm:p-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {stepsList.map((step) => {
            const isActive = currentStep === step.num;
            const isCompleted = currentStep > step.num;
            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num)}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                  isActive
                    ? "bg-amber-400/15 border-amber-400 text-amber-300 font-bold"
                    : isCompleted
                    ? "bg-white/5 border-emerald-500/40 text-emerald-400"
                    : "bg-transparent border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isActive
                        ? "bg-amber-400 text-slate-950"
                        : isCompleted
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <Check size={10} /> : step.num}
                  </span>
                  <span className="truncate">{step.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:block truncate">
                  {step.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTEÚDO DA ETAPA ATUAL */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        {/* ETAPA 1: FOTOS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ImageIcon size={18} className="text-amber-400" />
                  <span>Passo 1: Fotos da Armação (Foto Primeiro)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adicione as fotos do produto. O sistema aplicará bordas arredondadas e formato único padrão para todo o site.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {images.length} foto(s) adicionada(s)
              </span>
            </div>

            {/* Dropzone de Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-400/40 hover:border-amber-400 rounded-2xl p-8 text-center cursor-pointer bg-amber-400/5 hover:bg-amber-400/10 transition-all flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <Upload size={24} />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">
                  Clique ou arraste fotos aqui
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  JPG, PNG ou WEBP (recomendado fotos de boa iluminação com fundo claro)
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                disabled={isUploading}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Inserir URL Direta */}
            <div className="flex items-center gap-2 bg-[#0b1728] p-3 rounded-xl border border-white/10 text-xs">
              <span className="text-slate-400 shrink-0">Ou cole a URL direta da foto:</span>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://exemplo.com/foto-armacao.jpg"
                className="flex-1 bg-[#040c16] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleAddDirectUrl}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
              >
                Adicionar
              </button>
            </div>

            {/* Grid de Imagens Carregadas com Prévia Formatada */}
            {images.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 block">
                  Fotos Carregadas (clique em Principal para definir a capa):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative bg-[#0b1728] border rounded-2xl overflow-hidden p-2.5 space-y-2 transition-all ${
                        img.is_primary ? "border-amber-400 ring-2 ring-amber-400/40" : "border-white/10"
                      }`}
                    >
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-white p-2 flex items-center justify-center relative">
                        <img
                          src={img.url}
                          alt={img.alt_text}
                          className="max-h-full max-w-full object-contain"
                        />
                        {img.is_primary && (
                          <span className="absolute top-1.5 left-1.5 bg-amber-400 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-md shadow-xs">
                            Capa
                          </span>
                        )}
                      </div>

                      {/* Avisos de Qualidade */}
                      {img.isLowResWarning && (
                        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] flex items-center gap-1">
                          <AlertTriangle size={12} className="shrink-0" />
                          <span>Resolução &lt; 1000px</span>
                        </div>
                      )}

                      {img.aspectWarningText && (
                        <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[10px] space-y-1">
                          <div className="flex items-center gap-1 font-bold text-amber-300">
                            <AlertTriangle size={12} className="shrink-0" />
                            <span>Aviso de Proporção</span>
                          </div>
                          <p className="leading-tight text-slate-300">{img.aspectWarningText}</p>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setFocusEditIdx(idx)}
                        className="w-full inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-lg border border-white/15 text-[11px] font-semibold text-slate-200 transition-colors hover:border-amber-400/60 hover:text-white"
                      >
                        <Move size={12} aria-hidden="true" />
                        {focusObjectPosition(img) ? "Posição ajustada" : "Ajustar posição"}
                      </button>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          className={`px-2 py-1 rounded-md font-semibold transition-colors ${
                            img.is_primary
                              ? "text-amber-400 bg-amber-400/10 cursor-default"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {img.is_primary ? "Principal" : "Tornar Capa"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1 rounded-md"
                          title="Remover foto"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={img.alt_text}
                        onChange={(e) => {
                          const val = e.target.value;
                          setImages((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, alt_text: val } : item))
                          );
                        }}
                        placeholder="Descrição da foto (Alt text)"
                        className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  ))}
                </div>

                {focusEditIdx !== null && images[focusEditIdx] && (
                  <ImageFocusEditor
                    imageUrl={images[focusEditIdx].url}
                    productName={name || undefined}
                    initialX={images[focusEditIdx].focus_x}
                    initialY={images[focusEditIdx].focus_y}
                    onClose={() => setFocusEditIdx(null)}
                    onApply={(focus) => {
                      setImages((prev) =>
                        prev.map((img, i) =>
                          i === focusEditIdx ? { ...img, focus_x: focus?.x ?? null, focus_y: focus?.y ?? null } : img
                        )
                      );
                      setFocusEditIdx(null);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* ETAPA 2: IDENTIFICAÇÃO */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag size={18} className="text-amber-400" />
                <span>Passo 2: Nome, Marca e SKU</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                O SKU identifica a armação para casar fotos e estoque automaticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Nome do Modelo <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Ventara Safari Acetato"
                  className="w-full bg-[#0b1728] border border-white/15 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Código Único / SKU <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="Ex: VEN-SAFARI-01"
                  className="w-full bg-[#0b1728] border border-white/15 rounded-xl px-3.5 py-2 text-white font-mono uppercase text-xs focus:outline-none focus:border-amber-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Gerado automaticamente; usado para importar planilhas e casar fotos por nome de arquivo.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Marca / Linha
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Ex: Ventara Eyewear, Kids Adventure, HD"
                  className="w-full bg-[#0b1728] border border-white/15 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tipo de Armação
                </label>
                <select
                  value={frameType}
                  onChange={(e) => setFrameType(e.target.value as FrameType)}
                  className="w-full bg-[#0b1728] border border-white/15 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Grau">Armação de Grau</option>
                  <option value="Solar">Óculos de Sol</option>
                  <option value="Clip-on">Clip-on (2 em 1)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Público / Gênero
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as FrameGender)}
                  className="w-full bg-[#0b1728] border border-white/15 rounded-xl px-3.5 py-2 text-white text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Unissex">Unissex</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Infantil">Infantil (Kids)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3: PREÇOS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                <span>Passo 3: Preço de Venda e Desconto</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Defina o preço uma única vez. O percentual e as 10x sem juros são calculados matematicamente para todo o site.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="bg-[#0b1728] p-5 rounded-2xl border border-white/10 space-y-3">
                <label className="block text-slate-300 font-bold text-sm">
                  Preço Atual de Venda (R$) <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">R$</span>
                  <input
                    type="text"
                    value={priceReal}
                    onChange={(e) => setPriceReal(e.target.value)}
                    placeholder="389,00"
                    className="w-full bg-[#040c16] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-base font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Parcelamento automático: 10x de {calculatedPricing.installmentFormatted} sem juros.
                </p>
              </div>

              <div className="bg-[#0b1728] p-5 rounded-2xl border border-white/10 space-y-3">
                <label className="block text-slate-300 font-bold text-sm">
                  Preço Original / De (Opcional para Ofertas)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">R$</span>
                  <input
                    type="text"
                    value={comparePriceReal}
                    onChange={(e) => setComparePriceReal(e.target.value)}
                    placeholder="518,00"
                    className="w-full bg-[#040c16] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-base font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                {calculatedPricing.hasDiscount ? (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-between">
                    <span>Desconto Calculado:</span>
                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                      {calculatedPricing.discountBadgeText}
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Preencha apenas se for vender em oferta com preço "De / Por".
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 4: VARIAÇÕES DE COR E ACABAMENTO */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers size={18} className="text-amber-400" />
                  <span>Passo 4: Variações de Cor e Acabamento</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cada variação pode ter sua própria cor, SKU, foto e preço específico.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-semibold text-xs border border-amber-400/30 transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Adicionar Mais uma Cor</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={v.id}
                  className="bg-[#0b1728] border border-white/10 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
                >
                  <div className="sm:col-span-1 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-slate-400 text-[11px]">
                      {idx + 1}
                    </span>
                    <input
                      type="color"
                      value={v.color_hex}
                      onChange={(e) => {
                        const hex = e.target.value;
                        setVariants((prev) =>
                          prev.map((item) => (item.id === v.id ? { ...item, color_hex: hex } : item))
                        );
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      title="Escolher cor da amostra"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-slate-400 text-[10px] mb-0.5">Nome da Cor / Acabamento</label>
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) =>
                          prev.map((item) => (item.id === v.id ? { ...item, name: val } : item))
                        );
                      }}
                      placeholder="Ex: Tartaruga Safari, Preto Fosco"
                      className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-slate-400 text-[10px] mb-0.5">SKU da Variação</label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setVariants((prev) =>
                          prev.map((item) => (item.id === v.id ? { ...item, sku: val } : item))
                        );
                      }}
                      placeholder="Ex: VEN-SAFARI-01"
                      className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono uppercase text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-slate-400 text-[10px] mb-0.5">Preço Específico (Opcional)</label>
                    <input
                      type="text"
                      value={v.price_real || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((prev) =>
                          prev.map((item) => (item.id === v.id ? { ...item, price_real: val } : item))
                        );
                      }}
                      placeholder={priceReal}
                      className="w-full bg-[#040c16] border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="sm:col-span-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.id)}
                      disabled={variants.length <= 1}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 disabled:opacity-30 transition-colors"
                      title="Remover variação"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hasDuplicateVariantSkus && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>Existem variações com o mesmo SKU. Cada variação deve ter um código exclusivo.</span>
              </div>
            )}
          </div>
        )}

        {/* ETAPA 5: FICHA TÉCNICA E DESCRIÇÃO */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag size={18} className="text-amber-400" />
                <span>Passo 5: Descrição e Ficha Técnica</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Essenciais para a confiança do cliente no detalhe do produto e para publicação oficial.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Descrição Autoral do Modelo <span className="text-amber-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Armação leve em acetato nobre italiano com acabamento polido à mão. Ponte anatômica confortável e encaixe perfeito para rostos médios e finos."
                  className="w-full bg-[#0b1728] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Material do Aro</label>
                  <select
                    value={frameMaterial}
                    onChange={(e) => setFrameMaterial(e.target.value as FrameMaterial)}
                    className="w-full bg-[#0b1728] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="Acetato Premium">Acetato Premium</option>
                    <option value="Metal Titânio">Metal Titânio</option>
                    <option value="Injetado">Injetado Leve</option>
                    <option value="Madeira / Misto">Madeira / Misto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Formato do Aro</label>
                  <select
                    value={frameShape}
                    onChange={(e) => setFrameShape(e.target.value as FrameShape)}
                    className="w-full bg-[#0b1728] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="Quadrado">Quadrado</option>
                    <option value="Redondo">Redondo</option>
                    <option value="Gatinho">Gatinho</option>
                    <option value="Retangular">Retangular</option>
                    <option value="Hexagonal">Hexagonal</option>
                    <option value="Aviador">Aviador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Largura da Lente / Aro (mm)</label>
                  <input
                    type="number"
                    placeholder="ex: 52"
                    value={lensMm}
                    onChange={(e) => setLensMm(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-[#0b1728] border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Ponte Nasal (mm)</label>
                  <input
                    type="number"
                    placeholder="ex: 18"
                    value={bridgeMm}
                    onChange={(e) => setBridgeMm(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-[#0b1728] border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Comprimento da Haste (mm)</label>
                  <input
                    type="number"
                    placeholder="ex: 145"
                    value={templeMm}
                    onChange={(e) => setTempleMm(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-[#0b1728] border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Largura Frontal Total (mm)</label>
                  <input
                    type="number"
                    placeholder="ex: 138"
                    value={frameWidthMm}
                    onChange={(e) => setFrameWidthMm(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-[#0b1728] border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Altura da Lente (mm)</label>
                  <input
                    type="number"
                    placeholder="ex: 42"
                    value={lensHeightMm}
                    onChange={(e) => setLensHeightMm(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-[#0b1728] border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Origem do Material (opcional)</label>
                  <input
                    type="text"
                    placeholder="ex: Itália, Japão (deixe vazio se padrão)"
                    value={materialOrigin}
                    onChange={(e) => setMaterialOrigin(e.target.value)}
                    className="w-full bg-[#0b1728] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Checkbox de Gravação na Haste */}
              <div className="pt-3 border-t border-white/10 flex items-center gap-3">
                <input
                  id="chk-has-engraving"
                  type="checkbox"
                  checked={hasTempleEngraving}
                  onChange={(e) => setHasTempleEngraving(e.target.checked)}
                  className="rounded border-white/20 bg-[#0b1728] text-amber-500 focus:ring-amber-400 h-4 w-4"
                />
                <label htmlFor="chk-has-engraving" className="text-xs text-slate-300 cursor-pointer">
                  As medidas (lente · ponte · haste) vêm gravadas na haste deste modelo físico
                </label>
              </div>

              <FaceFitEditor value={faceFit} onChange={setFaceFit} frameShape={frameShape} />
            </div>
          </div>
        )}

        {/* ETAPA 6: REVISÃO E PRÉVIA AO VIVO */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Eye size={18} className="text-amber-400" />
                <span>Passo 6: Revisão e Onde Este Produto Aparecerá</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Confira como o card será renderizado e a lista de páginas alimentadas automaticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Prévia do Card Idêntico ao Site */}
              <div className="md:col-span-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-xl text-slate-900 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  {calculatedPricing.hasDiscount ? (
                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      {calculatedPricing.discountBadgeText}
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      NOVIDADE
                    </span>
                  )}
                  <span className="text-slate-500 font-medium">Aro {frameShape}</span>
                </div>

                <div className="aspect-[4/3] w-full rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-3">
                  {images[0]?.url ? (
                    <img
                      src={images[0].url}
                      alt={name || "Prévia"}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Sem foto cadastrada</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    VENTARA · {frameType.toUpperCase()}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 truncate">
                    {name || "Nome do Modelo"}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {description || "Descrição da armação..."}
                  </p>
                </div>

                {variants.length >= 2 && (
                  <div className="flex items-center gap-1.5 pt-1 text-xs">
                    <div className="flex items-center -space-x-1">
                      {variants.slice(0, 4).map((v) => (
                        <span
                          key={v.id}
                          className="w-3 h-3 rounded-full border border-white"
                          style={{ backgroundColor: v.color_hex }}
                          title={v.name}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-amber-700 font-semibold">
                      {variants.length} cores
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-2">
                    {calculatedPricing.hasDiscount && calculatedPricing.originalPriceFormatted && (
                      <span className="text-xs text-slate-400 line-through">
                        {calculatedPricing.originalPriceFormatted}
                      </span>
                    )}
                    <span className="text-base font-extrabold text-slate-900">
                      {calculatedPricing.currentPriceFormatted}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    10x de {calculatedPricing.installmentFormatted} sem juros
                  </span>
                </div>
              </div>

              {/* Status de Publicação e Onde Aparecerá */}
              <div className="md:col-span-7 space-y-4 text-xs">
                {isReadyToPublish ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                    <span className="font-bold text-sm flex items-center gap-1.5">
                      <CheckCircle2 size={16} /> Pronto para Publicação Oficial
                    </span>
                    <p className="text-[11px] text-emerald-200/80">
                      Todos os requisitos preenchidos (Foto, Nome, SKU, Preço e Ficha Técnica).
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
                    <span className="font-bold text-sm flex items-center gap-1.5">
                      <AlertTriangle size={16} /> Salvar como Rascunho com Pendências
                    </span>
                    <p className="text-[11px] text-amber-200/80">
                      O produto será salvo em segurança mas não aparecerá no site público até que as seguintes pendências sejam resolvidas:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {pendingReasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-[#0b1728] p-5 rounded-2xl border border-white/10 space-y-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block">
                    Este produto aparecerá em:
                  </span>
                  <div className="space-y-2">
                    {willAppearIn.map((place, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          place.active
                            ? "bg-emerald-500/5 border-emerald-500/25 text-emerald-300"
                            : "bg-white/5 border-white/5 text-slate-500"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className={place.active ? "text-emerald-400" : "text-slate-600"} />
                          <span className="font-medium">{place.name}</span>
                        </div>
                        {place.badge && (
                          <span className="bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full">
                            {place.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BARRAS DE NAVEGAÇÃO ENTRE ETAPAS (ANTERIOR / PRÓXIMO) */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Etapa Anterior</span>
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer"
            >
              <span>Próxima Etapa</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} />
                <span>Salvar e Cadastrar Outro</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-400/20 cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                <span>{isSubmitting ? "Gravando..." : isReadyToPublish ? "Salvar e Publicar" : "Salvar Rascunho"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
