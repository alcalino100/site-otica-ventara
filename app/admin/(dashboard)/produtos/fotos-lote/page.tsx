"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileSpreadsheet,
  Link2,
  Sparkles,
  RefreshCw,
  ImageIcon,
} from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";

interface PhotoResult {
  fileName: string;
  detectedSku: string;
  status: "matched" | "orphan" | "error";
  productId?: string;
  productName?: string;
  imageUrl?: string;
  isPrimary?: boolean;
  message?: string;
}

interface ProductOption {
  id: string;
  name: string;
  sku?: string;
}

export default function BulkPhotosPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<PhotoResult[]>([]);
  const [summary, setSummary] = useState<{
    totalFiles: number;
    matchedCount: number;
    orphanCount: number;
  } | null>(null);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [bindingInProgress, setBindingInProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Carrega produtos para permitir vinculação manual das órfãs
    async function loadProducts() {
      try {
        const res = await fetch("/api/admin/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products)) {
            setProducts(
              data.products.map((p: any) => ({
                id: p.id,
                name: p.name,
                sku: p.sku || p.variants?.[0]?.sku,
              }))
            );
          }
        }
      } catch (err) {
        console.error("Erro ao carregar lista de produtos:", err);
      }
    }
    loadProducts();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      setUploadResults([]);
      setSummary(null);
    }
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/admin/products/bulk-photos", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro no processamento do lote de fotos.");
        setIsUploading(false);
        return;
      }

      setSummary(data.summary);
      setUploadResults(data.results);
    } catch (err: any) {
      alert("Falha de rede ao enviar fotos: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualBind = async (resultIndex: number, productId: string) => {
    const item = uploadResults[resultIndex];
    if (!item.imageUrl || !productId) return;

    setBindingInProgress((prev) => ({ ...prev, [item.fileName]: true }));
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          images: [{ url: item.imageUrl, is_primary: true }],
        }),
      });

      if (res.ok) {
        const prod = products.find((p) => p.id === productId);
        setUploadResults((prev) =>
          prev.map((r, idx) =>
            idx === resultIndex
              ? {
                  ...r,
                  status: "matched",
                  productId,
                  productName: prod?.name || "Produto Vinculado",
                  message: undefined,
                }
              : r
          )
        );
        if (summary) {
          setSummary({
            ...summary,
            matchedCount: summary.matchedCount + 1,
            orphanCount: Math.max(0, summary.orphanCount - 1),
          });
        }
      } else {
        alert("Não foi possível vincular a foto ao produto selecionado.");
      }
    } catch (err: any) {
      alert("Erro ao vincular: " + err.message);
    } finally {
      setBindingInProgress((prev) => ({ ...prev, [item.fileName]: false }));
    }
  };

  const matchedItems = uploadResults.filter((r) => r.status === "matched");
  const orphanItems = uploadResults.filter((r) => r.status === "orphan");

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <AdminBreadcrumb />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Camera className="text-amber-500" size={26} />
            Upload de Fotos em Lote (Casamento por SKU)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Envie centenas de fotos de armações simultaneamente. O sistema reconhece o SKU
            no nome do arquivo (ex.: <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-mono font-bold">VEN-CLS-01.jpg</code>) e vincula à armação correspondente de forma 100% automática.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/produtos/importar"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span>Importar CSV</span>
          </Link>
          <Link
            href="/admin/produtos"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <ArrowLeft size={15} />
            <span>Voltar aos Produtos</span>
          </Link>
        </div>
      </div>

      {/* Regra de Nomenclatura */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <Sparkles className="text-amber-600 shrink-0 mt-0.5" size={18} />
        <div className="space-y-1 text-xs text-amber-900">
          <strong className="block font-bold">Como nomear os arquivos para o casamento automático:</strong>
          <p>
            Basta nomear a foto com o <strong>SKU exato</strong> cadastrado no produto, como:
          </p>
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
            <span className="bg-white/80 border border-amber-200 px-2 py-0.5 rounded">VEN-KID-01.jpg</span>
            <span className="bg-white/80 border border-amber-200 px-2 py-0.5 rounded">VEN-SAF-02_frente.png</span>
            <span className="bg-white/80 border border-amber-200 px-2 py-0.5 rounded">VEN-ONCA-03.webp</span>
          </div>
          <p className="text-[11px] text-amber-800/80 pt-1">
            Fotos sem SKU cadastrado serão guardadas com segurança na aba de <strong>Órfãs / Pendentes</strong> para vinculação manual com 1 clique.
          </p>
        </div>
      </div>

      {/* Área de Seleção de Arquivos */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center space-y-4 hover:border-amber-400 transition-colors">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <Upload size={28} />
        </div>

        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-base font-bold text-slate-900">
            Arraste fotos ou clique para selecionar
          </h3>
          <p className="text-xs text-slate-500">
            Suporte a JPG, PNG, WEBP. Você pode selecionar de 1 a centenas de arquivos de uma só vez.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-sm transition-all active:scale-95">
            <Camera size={16} />
            <span>Escolher Arquivos</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {selectedFiles.length > 0 && (
            <button
              type="button"
              disabled={isUploading}
              onClick={handleStartUpload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Processando {selectedFiles.length} fotos...</span>
                </>
              ) : (
                <>
                  <Upload size={15} />
                  <span>Iniciar Upload ({selectedFiles.length} selecionadas)</span>
                </>
              )}
            </button>
          )}
        </div>

        {selectedFiles.length > 0 && !summary && (
          <p className="text-xs font-semibold text-slate-700">
            {selectedFiles.length} foto(s) pronta(s) para envio e processamento.
          </p>
        )}
      </div>

      {/* Sumário e Resultados */}
      {summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total de Fotos Processadas
              </span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                {summary.totalFiles}
              </span>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Casadas com Sucesso
              </span>
              <span className="text-2xl font-bold text-emerald-800 mt-1 block">
                {summary.matchedCount}
              </span>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                Pendentes / Órfãs (Sem SKU)
              </span>
              <span className="text-2xl font-bold text-amber-800 mt-1 block">
                {summary.orphanCount}
              </span>
            </div>
          </div>

          {/* Fotos Casadas com Sucesso */}
          {matchedItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>Fotos Casadas com Sucesso ({matchedItems.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {matchedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.fileName}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-900 block truncate">
                        {item.productName || item.detectedSku}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono block truncate">
                        SKU: {item.detectedSku}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 size={11} /> Vinculada
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fotos Órfãs / Pendentes com Vinculação Manual */}
          {orphanItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-300 p-5 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-600" />
                <span>Fotos Pendentes de SKU ({orphanItems.length}) — Vincular Manualmente</span>
              </h3>
              <p className="text-xs text-slate-500">
                Estas fotos foram enviadas, mas nenhum produto possui o SKU detectado no nome do arquivo. Selecione o produto correspondente abaixo para vincular:
              </p>

              <div className="space-y-3">
                {uploadResults.map((item, idx) => {
                  if (item.status !== "orphan") return null;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-amber-50/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.fileName}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {item.fileName}
                          </span>
                          <span className="text-[11px] text-amber-700 font-mono block truncate">
                            SKU detectado: {item.detectedSku}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs max-w-xs"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleManualBind(idx, e.target.value);
                            }
                          }}
                        >
                          <option value="" disabled>
                            Selecione o produto para vincular...
                          </option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} {p.sku ? `(${p.sku})` : ""}
                            </option>
                          ))}
                        </select>
                        {bindingInProgress[item.fileName] && (
                          <RefreshCw size={14} className="animate-spin text-amber-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
