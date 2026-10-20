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
  Check,
  FileCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ParsedProductRow {
  lineNumber: number;
  name: string;
  slug: string;
  category: string;
  priceNumber: number;
  priceInCents: number;
  frame_type: "Grau" | "Solar" | "Clip-on";
  frame_material: string;
  frame_shape: string;
  sku: string;
  stock: number;
  isValid: boolean;
  errors: string[];
}

export default function AdminProductImportPage() {
  const supabase = createClient();
  const [csvContent, setCsvContent] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    successCount: number;
    errorCount: number;
  } | null>(null);

  const sampleCsvTemplate = `name,category,price,frame_type,frame_material,frame_shape,sku,stock
Ventara Clássico Ouro,Grau,389.00,Grau,Acetato Italiano,Retangular,VEN-CLS-01,8
Ventara Sunset Tartaruga,Solar,459.00,Solar,Acetato Nobre,Redondo,VEN-SUN-02,5
Ventara Titanio Leve,Grau,520.00,Grau,Titânio,Quadrado,VEN-TIT-03,12`;

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
    const catIdx = headers.indexOf("category");
    const priceIdx = headers.indexOf("price");
    const typeIdx = headers.indexOf("frame_type");
    const matIdx = headers.indexOf("frame_material");
    const shapeIdx = headers.indexOf("frame_shape");
    const skuIdx = headers.indexOf("sku");
    const stockIdx = headers.indexOf("stock");

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

      const rawPrice = cols[priceIdx] || "0";
      const priceNum = parseFloat(rawPrice.replace("R$", "").replace(",", "."));
      if (isNaN(priceNum) || priceNum <= 0) {
        errors.push("Preço inválido (deve ser maior que zero)");
      }

      const rawType = cols[typeIdx] || "Grau";
      const frameType: "Grau" | "Solar" | "Clip-on" =
        rawType.toLowerCase() === "solar"
          ? "Solar"
          : rawType.toLowerCase() === "clip-on"
          ? "Clip-on"
          : "Grau";

      const sku = cols[skuIdx] || `SKU-${slug.slice(0, 8).toUpperCase()}`;
      const stock = parseInt(cols[stockIdx] || "5", 10);
      if (isNaN(stock) || stock < 0) {
        errors.push("Estoque não pode ser negativo");
      }

      rows.push({
        lineNumber: i + 1,
        name,
        slug,
        category: cols[catIdx] || "Geral",
        priceNumber: isNaN(priceNum) ? 0 : priceNum,
        priceInCents: isNaN(priceNum) ? 0 : Math.round(priceNum * 100),
        frame_type: frameType,
        frame_material: cols[matIdx] || "Acetato Premium",
        frame_shape: cols[shapeIdx] || "Clássico",
        sku,
        stock: isNaN(stock) ? 0 : stock,
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
        // Insere produto
        const { data: prodData, error: prodErr } = await supabase
          .from("products")
          .insert({
            name: row.name,
            slug: `${row.slug}-${Math.floor(Math.random() * 1000)}`,
            description: `Armação ${row.name} em ${row.frame_material}. Curadoria oficial Ótica Ventara com excelente ergonomia e acabamento.`,
            price_in_cents: row.priceInCents,
            frame_type: row.frame_type,
            frame_material: row.frame_material,
            frame_shape: row.frame_shape,
            is_published: true,
          })
          .select()
          .single();

        if (prodErr || !prodData) {
          failed++;
          continue;
        }

        // Insere variante
        await supabase.from("product_variants").insert({
          product_id: prodData.id,
          sku: row.sku,
          color_name: "Padrão",
          stock_quantity: row.stock,
        });

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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/produtos"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
              CADASTRO EM LOTE
            </span>
            <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
              Importador de Produtos por <span className="font-normal text-amber-400">CSV / Planilha</span>
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={downloadSampleTemplate}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <Download size={14} className="text-amber-400" />
          <span>Baixar Modelo CSV</span>
        </button>
      </div>

      {/* Caixa de Upload e Entrada de Texto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
              <Upload size={16} className="text-amber-400" />
              Upload de Arquivo CSV
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Selecione uma planilha no formato .csv exportada do seu sistema de gestão ou Excel.
            </p>

            <label className="border-2 border-dashed border-white/15 hover:border-amber-400/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center group">
              <FileSpreadsheet size={32} className="text-slate-400 group-hover:text-amber-400 mb-2 transition-colors" />
              <span className="text-xs font-semibold text-white">Clique para selecionar o arquivo</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Apenas arquivos .csv UTF-8</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="pt-4 text-[11px] text-slate-500">
            Colunas aceitas: name, category, price, frame_type, frame_material, frame_shape, sku, stock.
          </div>
        </div>

        <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Ou cole os dados CSV abaixo</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Insira as linhas separadas por vírgula para pré-visualizar antes da importação.
            </p>

            <textarea
              rows={7}
              placeholder={sampleCsvTemplate}
              value={csvContent}
              onChange={(e) => {
                setCsvContent(e.target.value);
                parseCsvText(e.target.value);
              }}
              className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setCsvContent(sampleCsvTemplate);
                parseCsvText(sampleCsvTemplate);
              }}
              className="text-xs text-amber-400 hover:underline"
            >
              Preencher com exemplo
            </button>
            <span className="text-xs text-slate-400">{parsedRows.length} linhas detectadas</span>
          </div>
        </div>
      </div>

      {/* Relatório de Validação e Prévia */}
      {parsedRows.length > 0 && (
        <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Relatório de Pré-Visualização</h3>
              <p className="text-xs text-slate-400">
                {validCount} modelo(s) pronto(s) para importação · {errorCount} linha(s) com pendências
              </p>
            </div>

            <button
              type="button"
              disabled={validCount === 0 || isProcessing}
              onClick={handleImportValid}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all"
            >
              {isProcessing ? (
                <span>Gravando no Banco...</span>
              ) : (
                <>
                  <FileCheck size={16} />
                  <span>Importar {validCount} Produtos Validados</span>
                </>
              )}
            </button>
          </div>

          {/* Feedback de Conclusão */}
          {importSummary && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <div>
                <p className="font-semibold">Importação concluída com sucesso!</p>
                <p className="text-slate-300">
                  {importSummary.successCount} produto(s) gravado(s) com suas variantes de estoque.
                </p>
              </div>
            </div>
          )}

          {/* Tabela de Validação */}
          <div className="overflow-x-auto border border-white/10 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#040c16] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Linha</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Nome da Armação</th>
                  <th className="py-2.5 px-3">Linha</th>
                  <th className="py-2.5 px-3">Preço</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Estoque</th>
                  <th className="py-2.5 px-3">Diagnóstico / Erro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {parsedRows.map((row) => (
                  <tr key={row.lineNumber} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 text-slate-400">{row.lineNumber}</td>
                    <td className="py-2.5 px-3">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold uppercase">
                          <Check size={10} /> Válido
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 text-[10px] font-semibold uppercase">
                          <AlertCircle size={10} /> Erro
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white">{row.name || "—"}</td>
                    <td className="py-2.5 px-3 text-slate-300">{row.frame_type}</td>
                    <td className="py-2.5 px-3 text-amber-400">
                      R$ {row.priceNumber.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">{row.sku}</td>
                    <td className="py-2.5 px-3 text-slate-200">{row.stock} un</td>
                    <td className="py-2.5 px-3 text-rose-400">
                      {row.errors.length > 0 ? row.errors.join("; ") : "Pronto"}
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
