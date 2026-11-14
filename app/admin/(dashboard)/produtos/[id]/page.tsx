"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Upload,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Sliders,
  Trash2,
  Star,
  Plus,
  Loader2,
  Move,
} from "lucide-react";
import { FrameType, FrameShape, FrameMaterial, FrameGender, Product } from "@/types/ecommerce";
import { ImageFocusEditor } from "@/components/admin/image-focus-editor";
import { FaceFitEditor } from "@/components/admin/face-fit-editor";
import { normalizeFaceFit, type FaceShapeFit } from "@/lib/face-shapes";
import { focusForSave, focusObjectPosition, normalizeFocusValue } from "@/lib/image-focus";

interface ImageItem {
  id?: string;
  url: string;
  is_primary: boolean;
  alt_text?: string | null;
  /** Posição da foto nos cards (% do object-position); vazio = automático. */
  focus_x?: number | null;
  focus_y?: number | null;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [priceReal, setPriceReal] = useState("389,00");
  const [comparePriceReal, setComparePriceReal] = useState("");
  const [frameType, setFrameType] = useState<FrameType>("Grau");
  const [frameShape, setFrameShape] = useState<FrameShape>("Quadrado");
  const [frameMaterial, setFrameMaterial] = useState<FrameMaterial>("Acetato Premium");
  const [gender, setGender] = useState<FrameGender>("Unissex");
  const [lensMm, setLensMm] = useState<number | "">("");
  const [bridgeMm, setBridgeMm] = useState<number | "">("");
  const [templeMm, setTempleMm] = useState<number | "">("");
  const [frameWidthMm, setFrameWidthMm] = useState<number | "">("");
  const [lensHeightMm, setLensHeightMm] = useState<number | "">("");
  const [hasTempleEngraving, setHasTempleEngraving] = useState<boolean>(false);
  const [materialOrigin, setMaterialOrigin] = useState<string>("");
  const [faceFit, setFaceFit] = useState<FaceShapeFit>({});
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Multiple Images State (2, 3, 4+ fotos como pedido pelo cliente)
  const [images, setImages] = useState<ImageItem[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [focusEditIdx, setFocusEditIdx] = useState<number | null>(null);

  // Variant / Estoque
  const [colorName, setColorName] = useState("Padrão");
  const [stockQuantity, setStockQuantity] = useState(5);

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/products?id=${productId}`);
        const data = await res.json();

        if (!res.ok || !data.product) {
          throw new Error(data.error || "Produto não encontrado.");
        }

        const p: Product = data.product;
        setName(p.name || "");
        setSlug(p.slug || "");
        setDescription(p.description || "");

        // Preço
        if (p.price_in_cents) {
          setPriceReal((p.price_in_cents / 100).toFixed(2).replace(".", ","));
        }
        if (p.compare_at_price_in_cents) {
          setComparePriceReal((p.compare_at_price_in_cents / 100).toFixed(2).replace(".", ","));
        }

        if (p.frame_type) setFrameType(p.frame_type as FrameType);
        if (p.frame_shape) setFrameShape(p.frame_shape as FrameShape);
        if (p.frame_material) setFrameMaterial(p.frame_material as FrameMaterial);
        if (p.gender) setGender(p.gender as FrameGender);

        setLensMm(p.dimensions_lens_mm ?? "");
        setBridgeMm(p.dimensions_bridge_mm ?? "");
        setTempleMm(p.dimensions_temple_mm ?? "");
        setFrameWidthMm(p.dimensions_frame_width_mm ?? "");
        setLensHeightMm(p.dimensions_lens_height_mm ?? "");
        setHasTempleEngraving(Boolean(p.has_temple_engraving));
        setMaterialOrigin(p.material_origin || "");
        setFaceFit(normalizeFaceFit(p.face_shape_fit));
        setIsPublished(p.is_published ?? true);
        setIsFeatured(p.is_featured ?? false);

        // Imagens
        if (p.images && p.images.length > 0) {
          setImages(
            p.images.map((img, idx) => ({
              id: img.id,
              url: img.url,
              is_primary: img.is_primary ?? idx === 0,
              alt_text: img.alt_text,
              focus_x: normalizeFocusValue(img.focus_x),
              focus_y: normalizeFocusValue(img.focus_y),
            }))
          );
        }

        // Variantes / Estoque
        if (p.variants && p.variants.length > 0) {
          setColorName(p.variants[0].color_name || "Padrão");
          setStockQuantity(p.variants[0].stock_quantity ?? 5);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "Erro ao carregar dados do produto.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);
    setIsUploading(true);
    setSuccessMessage(`Enviando ${files.length} foto(s) para o Storage...`);

    try {
      const newUploaded: ImageItem[] = [];

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
          newUploaded.push({
            url: resData.url,
            is_primary: images.length === 0 && newUploaded.length === 0,
            alt_text: `${name || "Armação"} - Foto ${images.length + newUploaded.length + 1}`,
          });
        }
      }

      if (newUploaded.length > 0) {
        setImages((prev) => [...prev, ...newUploaded]);
        setSuccessMessage(`${newUploaded.length} foto(s) carregada(s) com sucesso!`);
      } else {
        throw new Error("Não foi possível enviar as fotos.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Falha no upload: ${err.message}. Você também pode colar a URL direta da imagem abaixo.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        url: urlInput.trim(),
        is_primary: prev.length === 0,
        alt_text: `${name || "Armação"} - Foto ${prev.length + 1}`,
      },
    ]);
    setUrlInput("");
  };

  const handleSetPrimary = (idx: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_primary: i === idx,
      }))
    );
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== idx);
      // Se removeu a primária, torna a primeira restante primária
      if (filtered.length > 0 && !filtered.some((img) => img.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const cleanPrice = priceReal.replace(/\./g, "").replace(",", ".");
      const priceInCents = Math.round(parseFloat(cleanPrice) * 100);

      if (isNaN(priceInCents) || priceInCents < 0) {
        setErrorMessage("Por favor, informe um preço de venda válido.");
        setIsSubmitting(false);
        return;
      }

      let compareAtPriceInCents: number | null = null;
      if (comparePriceReal.trim()) {
        const cleanCompare = comparePriceReal.replace(/\./g, "").replace(",", ".");
        compareAtPriceInCents = Math.round(parseFloat(cleanCompare) * 100);
      }

      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          name,
          slug,
          description: description || null,
          price_in_cents: priceInCents,
          compare_at_price_in_cents: compareAtPriceInCents,
          is_published: isPublished,
          is_featured: isFeatured,
          frame_type: frameType,
          frame_shape: frameShape,
          frame_material: frameMaterial,
          gender,
          dimensions_lens_mm: typeof lensMm === "number" && lensMm > 0 ? lensMm : null,
          dimensions_bridge_mm: typeof bridgeMm === "number" && bridgeMm > 0 ? bridgeMm : null,
          dimensions_temple_mm: typeof templeMm === "number" && templeMm > 0 ? templeMm : null,
          dimensions_frame_width_mm: typeof frameWidthMm === "number" && frameWidthMm > 0 ? frameWidthMm : null,
          dimensions_lens_height_mm: typeof lensHeightMm === "number" && lensHeightMm > 0 ? lensHeightMm : null,
          has_temple_engraving: hasTempleEngraving,
          material_origin: materialOrigin.trim() || null,
          face_shape_fit: faceFit,
          images: images.map((img, i) => ({
            url: img.url,
            is_primary: img.is_primary,
            sort_order: i,
            alt_text: img.alt_text || `${name} foto ${i + 1}`,
            ...(focusForSave(img) ?? {}),
          })),
          color_name: colorName,
          stock_quantity: stockQuantity,
        }),
      });

      const resData = await res.json();
      if (!res.ok || resData.error) {
        throw new Error(resData.error || "Erro ao atualizar armação.");
      }

      if (resData.warning) {
        // Salvou, mas o banco ainda não tem as colunas da posição da foto: não redireciona para o aviso ser lido
        setErrorMessage(resData.warning);
        return;
      }

      setSuccessMessage("Armação atualizada com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push("/admin/produtos");
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erro inesperado ao salvar alterações.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="animate-spin text-amber-400" size={32} />
          <p className="text-xs">Carregando dados da armação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/produtos"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Voltar para lista de produtos
        </Link>
        <span className="text-[11px] font-mono text-slate-400">
          ID: {productId}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Editar Armação / Produto
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Atualize dados técnicos, cadastre 2 a 4 fotos (frontal, lateral e interna) e gerencie o estoque.
          </p>
        </div>
      </div>

      {/* Alertas de Feedback */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Informações Básicas e Preço */}
        <div className="bg-[#081724] border border-white/5 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <Sliders size={16} className="text-amber-400" />
            Informações Comerciais
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-product-name" className="block text-xs font-medium text-slate-300 mb-1">
                Nome da Armação *
              </label>
              <input
                id="edit-product-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label htmlFor="edit-product-slug" className="block text-xs font-medium text-slate-300 mb-1">
                Slug (URL Amigável) *
              </label>
              <input
                id="edit-product-slug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-product-description" className="block text-xs font-medium text-slate-300 mb-1">
              Descrição Detalhada e Sensorial
            </label>
            <textarea
              id="edit-product-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-product-price" className="block text-xs font-medium text-slate-300 mb-1">
                Preço de Venda à Vista (R$) *
              </label>
              <input
                id="edit-product-price"
                type="text"
                required
                value={priceReal}
                onChange={(e) => setPriceReal(e.target.value)}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label htmlFor="edit-product-compare-price" className="block text-xs font-medium text-slate-300 mb-1">
                Preço Comparativo &quot;De&quot; (R$ - Opcional)
              </label>
              <input
                id="edit-product-compare-price"
                type="text"
                value={comparePriceReal}
                onChange={(e) => setComparePriceReal(e.target.value)}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Especificações Técnicas de Ótica */}
        <div className="bg-[#081724] border border-white/5 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <Sliders size={16} className="text-amber-400" />
            Especificações Técnicas de Óptica
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label htmlFor="edit-frame-type" className="block text-xs font-medium text-slate-300 mb-1">
                Tipo de Óculos
              </label>
              <select
                id="edit-frame-type"
                value={frameType}
                onChange={(e) => setFrameType(e.target.value as FrameType)}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Grau">Grau</option>
                <option value="Solar">Solar</option>
                <option value="Clip-on">Clip-on</option>
                <option value="Infantil">Infantil</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-frame-shape" className="block text-xs font-medium text-slate-300 mb-1">
                Formato do Aro
              </label>
              <select
                id="edit-frame-shape"
                value={frameShape}
                onChange={(e) => setFrameShape(e.target.value as FrameShape)}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Quadrado">Quadrado</option>
                <option value="Redondo">Redondo</option>
                <option value="Gatinho">Gatinho</option>
                <option value="Aviador">Aviador</option>
                <option value="Geométrico">Geométrico</option>
                <option value="Retangular">Retangular</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-frame-material" className="block text-xs font-medium text-slate-300 mb-1">
                Material da Estrutura
              </label>
              <select
                id="edit-frame-material"
                value={frameMaterial}
                onChange={(e) => setFrameMaterial(e.target.value as FrameMaterial)}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Acetato Premium">Acetato Premium</option>
                <option value="Metal Nobre">Metal / Aço Cirúrgico</option>
                <option value="Titânio">Titânio Ultraleve</option>
                <option value="Injetado Leve">Injetado TR-90</option>
                <option value="Misto">Misto (Acetato + Metal)</option>
              </select>
            </div>

            <div>
              <label htmlFor="edit-frame-gender" className="block text-xs font-medium text-slate-300 mb-1">
                Gênero / Perfil
              </label>
              <select
                id="edit-frame-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as FrameGender)}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Unissex">Unissex</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Infantil">Infantil</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label htmlFor="edit-lens-mm" className="block text-xs font-medium text-slate-300 mb-1">
                Largura da Lente / Aro (mm)
              </label>
              <input
                id="edit-lens-mm"
                type="number"
                placeholder="ex: 52"
                value={lensMm}
                onChange={(e) => setLensMm(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label htmlFor="edit-bridge-mm" className="block text-xs font-medium text-slate-300 mb-1">
                Ponte Nasal (mm)
              </label>
              <input
                id="edit-bridge-mm"
                type="number"
                placeholder="ex: 18"
                value={bridgeMm}
                onChange={(e) => setBridgeMm(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label htmlFor="edit-temple-mm" className="block text-xs font-medium text-slate-300 mb-1">
                Comprimento da Haste (mm)
              </label>
              <input
                id="edit-temple-mm"
                type="number"
                placeholder="ex: 145"
                value={templeMm}
                onChange={(e) => setTempleMm(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label htmlFor="edit-frame-width-mm" className="block text-xs font-medium text-slate-300 mb-1">
                Largura Frontal Total (mm)
              </label>
              <input
                id="edit-frame-width-mm"
                type="number"
                placeholder="ex: 138"
                value={frameWidthMm}
                onChange={(e) => setFrameWidthMm(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label htmlFor="edit-lens-height-mm" className="block text-xs font-medium text-slate-300 mb-1">
                Altura da Lente (mm)
              </label>
              <input
                id="edit-lens-height-mm"
                type="number"
                placeholder="ex: 42"
                value={lensHeightMm}
                onChange={(e) => setLensHeightMm(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label htmlFor="edit-material-origin" className="block text-xs font-medium text-slate-300 mb-1">
                Origem do Material (opcional)
              </label>
              <input
                id="edit-material-origin"
                type="text"
                placeholder="ex: Itália, Japão (vazio se padrão)"
                value={materialOrigin}
                onChange={(e) => setMaterialOrigin(e.target.value)}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center gap-3">
            <input
              id="edit-has-engraving"
              type="checkbox"
              checked={hasTempleEngraving}
              onChange={(e) => setHasTempleEngraving(e.target.checked)}
              className="rounded border-slate-700 bg-[#040e17] text-amber-500 focus:ring-amber-400 h-4 w-4"
            />
            <label htmlFor="edit-has-engraving" className="text-xs text-slate-300 cursor-pointer">
              As medidas vêm gravadas na haste deste modelo físico
            </label>
          </div>
        </div>

        {/* Bloco 3: Fotos Múltiplas (2 a 4 fotos - frontal, lateral, detalhe interno) */}
        <div className="bg-[#081724] border border-white/5 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <ImageIcon size={16} className="text-amber-400" />
              Galeria de Fotos da Armação ({images.length} fotos)
            </h2>
            <span className="text-[11px] text-amber-400 font-medium">
              Recomendado: 2 a 4 fotos (Frontal, Lateral, Ângulo interno)
            </span>
          </div>

          {/* Upload de Múltiplos Arquivos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="border-2 border-dashed border-slate-700 hover:border-amber-400/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#040e17] h-full min-h-[110px]">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1.5 text-amber-400">
                    <Loader2 size={24} className="animate-spin" />
                    <span className="text-xs">Enviando fotos...</span>
                  </div>
                ) : (
                  <>
                    <Upload size={22} className="text-slate-400 mb-1" />
                    <span className="text-xs text-slate-300 font-medium">Adicionar Fotos (Múltiplas)</span>
                    <span className="text-[10px] text-slate-500">Selecione 2, 3 ou 4 fotos do seu computador</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={isUploading}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label htmlFor="edit-image-url-input" className="block text-xs font-medium text-slate-300 mb-1">
                Ou adicione via URL direta
              </label>
              <div className="flex gap-2">
                <input
                  id="edit-image-url-input"
                  type="url"
                  placeholder="https://..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Cole a URL da foto e clique no botão para adicionar à galeria.
              </p>
            </div>
          </div>

          {/* Grade de Fotos Atuais com Opções de Capa e Exclusão */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative group bg-[#040d18] border rounded-xl overflow-hidden flex flex-col justify-between ${
                    img.is_primary ? "border-amber-400 shadow-md ring-1 ring-amber-400/50" : "border-slate-800"
                  }`}
                >
                  <div className="w-full aspect-square bg-slate-950 flex items-center justify-center p-2">
                    <img
                      src={img.url}
                      alt={img.alt_text || `Foto ${idx + 1}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="px-2 pt-2 bg-[#06111f] border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setFocusEditIdx(idx)}
                      className="w-full inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-lg border border-slate-700 text-[11px] font-semibold text-slate-200 transition-colors hover:border-amber-400/60 hover:text-white"
                    >
                      <Move size={12} aria-hidden="true" />
                      {focusObjectPosition(img) ? "Posição ajustada" : "Ajustar posição"}
                    </button>
                  </div>

                  <div className="p-2 bg-[#06111f] flex items-center justify-between text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                        img.is_primary ? "text-amber-400" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Star size={11} className={img.is_primary ? "fill-amber-400" : ""} />
                      <span>{img.is_primary ? "Foto de Capa" : "Tornar Capa"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      title="Excluir esta foto"
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
              Nenhuma foto cadastrada ainda. Adicione fotos acima para que o cliente veja todos os ângulos da peça.
            </div>
          )}

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

          {/* Indicação por formato de rosto */}
          <FaceFitEditor value={faceFit} onChange={setFaceFit} frameShape={frameShape} />

          {/* Estoque e Publicação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <label htmlFor="edit-color-name" className="block text-xs font-medium text-slate-300 mb-1">
                Cor Principal da Armação
              </label>
              <input
                id="edit-color-name"
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label htmlFor="edit-stock-quantity" className="block text-xs font-medium text-slate-300 mb-1">
                Estoque Disponível (unidades)
              </label>
              <input
                id="edit-stock-quantity"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-3 border-t border-white/5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-slate-700 text-amber-400 focus:ring-0 bg-[#040e17] w-4 h-4"
              />
              <span className="text-xs text-white">Publicar visível no catálogo imediatamente</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-slate-700 text-amber-400 focus:ring-0 bg-[#040e17] w-4 h-4"
              />
              <span className="text-xs text-white">Destacar no Pedestal Neon do Topo (Hero)</span>
            </label>
          </div>
        </div>

        {/* Barra de Salvamento Fixa no Rodapé (Sticky Save Bar) */}
        <div className="sticky bottom-0 bg-[#030c13]/95 backdrop-blur-md border-t border-white/10 p-4 -mx-4 sm:-mx-8 lg:-mx-10 px-4 sm:px-8 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3 z-30 shadow-2xl">
          <div className="text-xs text-slate-400">
            {errorMessage && <span className="text-rose-400 font-medium">⚠️ {errorMessage}</span>}
            {successMessage && <span className="text-emerald-400 font-medium">✓ {successMessage}</span>}
            {!errorMessage && !successMessage && <span>Altere os dados e salve para sincronizar no catálogo</span>}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/produtos"
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-semibold transition-all"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
