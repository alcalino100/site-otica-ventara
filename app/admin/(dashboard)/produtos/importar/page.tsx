"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Download,
  Camera,
  Layers,
  Sparkles,
} from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";

interface ParsedProductRow {
  lineNumber: number;
  name: string;
  slug: string;
  category: string;
  sku: string;
  priceNumber: number;
  priceInCents: number;
  originalPriceNumber?: number | null;
  originalPriceInCents?: number | null;
  frame_type: "Grau" | "Solar" | "Clip-on";
  frame_material: string;
  frame_shape: string;
  stock: number;
  description?: string;
  isValid: boolean;
  errors: string[];
}

export default function AdminProductImportPage() {
  const [csvContent, setCsvContent] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    successCount: number;
    errorCount: number;
  } | null>(null);

  const sampleCsvTemplate = `name,sku,category,price,original_price,frame_type,frame_material,frame_shape,stock,description
Ventara Clássico Ouro,VEN-CLS-01,Grau,389.00,459.00,Grau,Acetato Italiano,Retangular,8,Armação clássica com ponte anatômica e acabamento polido.
Ventara Sunset Tartaruga,VEN-SUN-02,Solar,459.00,549.00,Solar,Acetato Nobre,Redondo,5,Óculos de sol polarizado com proteção UV400 completa.
Ventara Titanio Leve,VEN-TIT-03,Grau,520.00,,Grau,Metal Titânio,Quadrado,12,Estrutura ultra-leve em titânio cirúrgico para conforto contínuo.`;

  const parseCsvText = (text: string) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length <= 1) {
      setParsedRows([]);
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name");
    const skuIdx = headers.indexOf("sku");
    const catIdx = headers.indexOf("category");
    const priceIdx = headers.indexOf("price");
    const origPriceIdx = headers.indexOf("original_price");
    const typeIdx = headers.indexOf("frame_type");
    const matIdx = headers.indexOf("frame_material");
    const shapeIdx = headers.indexOf("frame_shape");
    const stockIdx = headers.indexOf("stock");
    const descIdx = headers.indexOf("description");

    const rows: ParsedProductRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = line.split(",").map((c) => c.trim());
      const errors: string[] = [];

      const name = cols[nameIdx] || "";
      if (!name || name.length < 3) {
        errors.push("Nome inválido ou muito curto (mínimo 3 caracteres)");
      }

      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const sku = (cols[skuIdx] || `VEN-${slug.slice(0, 10).toUpperCase()}`).toUpperCase();
      if (!sku || sku.length < 3) {
        errors.push("SKU obrigatório para casar fotos e inventário");
      }

      const rawPrice = cols[priceIdx] || "0";
      const priceNum = parseFloat(rawPrice.replace("R$", "").replace(",", "."));
      if (isNaN(priceNum) || priceNum <= 0) {
        errors.push("Preço atual inválido (deve ser maior que zero)");
      }

      let originalPriceNum: number | null = null;
      let originalPriceInCents: number | null = null;
      if (origPriceIdx >= 0 && cols[origPriceIdx]) {
        const rawOrig = cols[origPriceIdx].replace("R$", "").replace(",", ".");
        const parsedOrig = parseFloat(rawOrig);
        if (!isNaN(parsedOrig) && parsedOrig > priceNum) {
          originalPriceNum = parsedOrig;
          originalPriceInCents = Math.round(parsedOrig * 100);
        } else if (!isNaN(parsedOrig) && parsedOrig <= priceNum) {
          errors.push("Preço original deve ser maior que o preço atual para caracterizar oferta");
        }
      }

      const rawType = cols[typeIdx] || "Grau";
      const frameType: "Grau" | "Solar" | "Clip-on" =
        rawType.toLowerCase() === "solar"
          ? "Solar"
          : rawType.toLowerCase() === "clip-on"
          ? "Clip-on"
          : "Grau";

      const stock = parseInt(cols[stockIdx] || "5", 10);
      if (isNaN(stock) || stock < 0) {
        errors.push("Estoque não pode ser negativo");
      }

      rows.push({
        lineNumber: i + 1,
        name,
        slug,
        sku,
        category: cols[catIdx] || "Geral",
        priceNumber: isNaN(priceNum) ? 0 : priceNum,
        priceInCents: isNaN(priceNum) ? 0 : Math.round(priceNum * 100),
        originalPriceNumber: originalPriceNum,
        originalPriceInCents,
        frame_type: frameType,
        frame_material: cols[matIdx] || "Acetato Premium",
        frame_shape: cols[shapeIdx] || "Clássico",
        stock: isNaN(stock) ? 0 : stock,
        description: cols[descIdx] || undefined,
        isValid: errors.length === 0,
        errors,
      });
    }

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      parseCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleImportValid = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setIsProcessing(true);
    let success = 0;
    let failed = 0;

    for (const row of validRows) {
      try {
        // Insere produto via API em status RASCUNHO (segurança contra publicação acidental)
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: row.name,
            slug: `${row.slug}-${Math.floor(100 + Math.random() * 900)}`,
            sku: row.sku,
            description:
              row.description ||
              `Armação ${row.name} em ${row.frame_material}. Curadoria oficial Ótica Ventara com excelente ergonomia e acabamento.`,
            price_in_cents: row.priceInCents,
            compare_at_price_in_cents: row.originalPriceInCents || null,
            frame_type: row.frame_type,
            frame_material: row.frame_material,
            frame_shape: row.frame_shape,
            status: "rascunho",
            is_published: false,
            availability: "disponivel",
            color_name: "Padrão",
            stock_quantity: row.stock,
          }),
        });

        const resData = await res.json();
        if (!res.ok || resData.error) {
          failed++;
          continue;
        }

        success++;
      } catch (err) {
        console.error("Erro na importação da linha:", row, err);
        failed++;
      }
    }

    setIsProcessing(false);
    setImportSummary({ successCount: success, errorCount: failed });
  };

  const downloadSampleTemplate = () => {
    const blob = new Blob([sampleCsvTemplate], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "modelo-importacao-ventara.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const errorCount = parsedRows.filter((r) => !r.isValid).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <AdminBreadcrumb />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="text-amber-500" size={26} />
            Importação de Armações em Lote (CSV)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cadastre dezenas ou centenas de armações com um único clique. Os produtos são criados
            em <strong>RASCUNHO</strong> com SKU único obrigatório para posterior casamento de fotos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/produtos/fotos-lote"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-500 transition-colors shadow-2xs"
          >
            <Camera size={15} />
            <span>Fotos em Lote</span>
          </Link>

          <Link
            href="/admin/produtos"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={15} />
            <span>Voltar aos Produtos</span>
          </Link>
        </div>
      </div>

      {/* Regra de Ouro: Rascunho Inicial Seguro */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <Sparkles className="text-amber-400 shrink-0 mt-0.5" size={18} />
        <div className="space-y-1 text-xs text-slate-300">
          <strong className="block text-white font-bold">
            Garantia de Segurança Ventara: Nenhum produto sem foto vai ao ar automaticamente
          </strong>
          <p>
            Todos os itens importados entram no catálogo com status <span className="bg-white/10 px-1.5 py-0.2 rounded font-mono text-amber-300">Rascunho</span>. Após enviar a planilha, utilize a ferramenta de <strong>Fotos em Lote</strong> para casar as imagens pelo SKU. Somente produtos com SKU, preço, foto e aprovação do lojista são publicados no site.
          </p>
        </div>
      </div>

      {/* Box de Instruções e Download de Modelo */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">1. Baixe o Modelo da Planilha</h3>
            <p className="text-xs text-slate-500">
              Preencha com seus dados ou exporte do seu software óptico no formato CSV.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadSampleTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download size={15} />
            <span>Baixar Modelo CSV</span>
          </button>
        </div>

        {/* Upload do Arquivo */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-2">2. Selecione o arquivo CSV preenchido</h3>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-sm transition-all active:scale-95">
              <Upload size={16} />
              <span>Selecionar Arquivo CSV</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {parsedRows.length > 0 && (
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={15} />
                  {validCount} linhas válidas
                </span>
                {errorCount > 0 && (
                  <span className="text-rose-700 flex items-center gap-1">
                    <AlertCircle size={15} />
                    {errorCount} linhas com erro
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback de Importação Concluída */}
      {importSummary && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-3">
          <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={20} />
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-emerald-950 text-sm">Importação em Lote Concluída!</h4>
            <p className="text-emerald-800">
              <strong>{importSummary.successCount}</strong> produtos cadastrados em <strong>RASCUNHO</strong> com sucesso.
              {importSummary.errorCount > 0 && (
                <span> ({importSummary.errorCount} falhas reportadas).</span>
              )}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/admin/produtos/fotos-lote"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shadow-2xs"
              >
                <Camera size={15} />
                <span>Casar Fotos pelo SKU Agora</span>
              </Link>
              <Link
                href="/admin/produtos"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-xs hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <span>Ver Produtos no Painel</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pré-visualização das Linhas Analisadas */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                3. Pré-visualização e Validação Linha a Linha ({parsedRows.length} linhas)
              </h3>
              <p className="text-xs text-slate-500">
                Verifique os dados antes de salvar no banco de dados.
              </p>
            </div>

            {validCount > 0 && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleImportValid}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <span>Salvando no banco de dados...</span>
                ) : (
                  <span>Importar {validCount} Produtos Válidos em Rascunho</span>
                )}
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Linha</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Preço Atual</th>
                  <th className="p-3">Preço Original</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Status Validação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((row) => (
                  <tr
                    key={row.lineNumber}
                    className={row.isValid ? "hover:bg-slate-50/60" : "bg-rose-50/40"}
                  >
                    <td className="p-3 text-slate-400 font-mono">{row.lineNumber}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{row.sku}</td>
                    <td className="p-3 font-semibold text-slate-900">{row.name}</td>
                    <td className="p-3 text-slate-600">{row.category}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">
                      R$ {row.priceNumber.toFixed(2)}
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {row.originalPriceNumber ? `R$ ${row.originalPriceNumber.toFixed(2)}` : "-"}
                    </td>
                    <td className="p-3 text-slate-600">{row.frame_type}</td>
                    <td className="p-3">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12} /> Válido (Rascunho)
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                            <AlertCircle size={12} /> Erro
                          </span>
                          <span className="block text-[10px] text-rose-600">
                            {row.errors.join("; ")}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
