"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Upload,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Sliders,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FrameType, FrameShape, FrameMaterial, FrameGender } from "@/types/ecommerce";

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();

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
  const [lensMm, setLensMm] = useState<number>(53);
  const [bridgeMm, setBridgeMm] = useState<number>(18);
  const [templeMm, setTempleMm] = useState<number>(145);
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Image & Variant State
  const [imageUrl, setImageUrl] = useState("");
  const [colorName, setColorName] = useState("Preto Clássico");
  const [stockQuantity, setStockQuantity] = useState(5);

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(generatedSlug);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setSuccessMessage("Enviando foto para o Storage...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok || resData.error) {
        throw new Error(resData.error || "Falha no upload");
      }

      setImageUrl(resData.url);
      setSuccessMessage("Imagem carregada com sucesso no Supabase Storage!");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Falha no upload para o Storage: ${err.message}. Você também pode colar a URL direta da imagem abaixo.`);
      setSuccessMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      // Converte preço formatado para centavos inteiros (ex: "389,00" -> 38900)
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          dimensions_lens_mm: lensMm || null,
          dimensions_bridge_mm: bridgeMm || null,
          dimensions_temple_mm: templeMm || null,
          imageUrl: imageUrl.trim() || null,
          color_name: colorName,
          stock_quantity: stockQuantity,
        }),
      });

      const resData = await res.json();
      if (!res.ok || resData.error) {
        throw new Error(resData.error || "Erro ao cadastrar armação.");
      }

      setSuccessMessage("Armação cadastrada com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push("/admin/produtos");
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erro inesperado ao salvar. Verifique se o Supabase está online.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Voltar para lista de produtos
        </Link>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Cadastrar Nova Armação
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Preencha os dados técnicos da armação, fotos e valor para inclusão no catálogo.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2.5 text-xs text-red-300">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Informações Básicas */}
        <div className="bg-[#081724] border border-white/5 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            Identificação do Produto
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome da Armação *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Ventara Essencial Titanium"
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Slug (identificador de URL) *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ventara-essencial-titanium"
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Descrição Comercial da Armação
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o conforto, a ergonomia, o acabamento e os detalhes de estilo desta armação..."
              className="w-full bg-[#040e17] border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Preço de Venda (R$) *
              </label>
              <input
                type="text"
                required
                value={priceReal}
                onChange={(e) => setPriceReal(e.target.value)}
                placeholder="Ex: 389,00"
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-semibold placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Preço Comparativo 'De' (R$ - opcional)
              </label>
              <input
                type="text"
                value={comparePriceReal}
                onChange={(e) => setComparePriceReal(e.target.value)}
                placeholder="Ex: 489,00"
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Especificações Técnicas de Ótica */}
        <div className="bg-[#081724] border border-white/5 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <Sliders size={16} className="text-amber-400" />
            Especificações de Ótica e Medidas
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tipo</label>
              <select
                value={frameType}
                onChange={(e) => setFrameType(e.target.value as FrameType)}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Grau">Óculos de Grau</option>
                <option value="Solar">Óculos de Sol</option>
                <option value="Clip-on">Clip-on 2 em 1</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Formato do Aro</label>
              <select
                value={frameShape}
                onChange={(e) => setFrameShape(e.target.value as FrameShape)}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Quadrado">Quadrado</option>
                <option value="Redondo">Redondo</option>
                <option value="Retangular">Retangular</option>
                <option value="Gatinho">Gatinho</option>
                <option value="Aviador">Aviador</option>
                <option value="Hexagonal">Hexagonal</option>
                <option value="Oval">Oval</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Material</label>
              <select
                value={frameMaterial}
                onChange={(e) => setFrameMaterial(e.target.value as FrameMaterial)}
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Acetato Premium">Acetato Premium</option>
                <option value="Metal Titânio">Metal Titânio</option>
                <option value="Injetado">Injetado / TR90</option>
                <option value="Madeira / Misto">Misto</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Gênero</label>
              <select
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Lente (Largura mm)
              </label>
              <input
                type="number"
                value={lensMm}
                onChange={(e) => setLensMm(parseInt(e.target.value) || 0)}
                placeholder="53"
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ponte Nasal (mm)
              </label>
              <input
                type="number"
                value={bridgeMm}
                onChange={(e) => setBridgeMm(parseInt(e.target.value) || 0)}
                placeholder="18"
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Haste (Comprimento mm)
              </label>
              <input
                type="number"
                value={templeMm}
                onChange={(e) => setTempleMm(parseInt(e.target.value) || 0)}
                placeholder="145"
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Fotos, Estoque e Publicação */}
        <div className="bg-[#081724] border border-white/5 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-2">
            <ImageIcon size={16} className="text-amber-400" />
            Fotografia, Estoque e Publicação
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Upload de Foto (Supabase Storage)
              </label>
              <label className="border-2 border-dashed border-slate-700 hover:border-amber-400/50 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#040e17]">
                <Upload size={20} className="text-slate-400 mb-1.5" />
                <span className="text-xs text-slate-300 font-medium">Clique para escolher imagem</span>
                <span className="text-[10px] text-slate-500">PNG, JPG ou WEBP de alta resolução</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ou cole a URL direta da imagem
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 mb-3"
              />
              {imageUrl && (
                <div className="w-20 h-20 rounded-lg border border-white/10 overflow-hidden bg-black flex items-center justify-center">
                  <img src={imageUrl} alt="Prévia" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cor Principal da Armação
              </label>
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="Ex: Âmbar Translúcido, Preto Fosco..."
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Estoque Disponível (unidades)
              </label>
              <input
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
                className="rounded border-slate-700 text-amber-400 focus:ring-amber-400"
              />
              <span className="text-xs text-slate-300 font-medium">Publicar imediatamente no site</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-slate-700 text-amber-400 focus:ring-amber-400"
              />
              <span className="text-xs text-slate-300 font-medium">Destacar no carrossel da Home</span>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-[#030c13] font-semibold text-xs tracking-wider uppercase px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-amber-400/10 disabled:opacity-50"
          >
            <Save size={15} />
            {isSubmitting ? "Cadastrando Armação..." : "Salvar e Publicar"}
          </button>
        </div>
      </form>
    </div>
  );
}
