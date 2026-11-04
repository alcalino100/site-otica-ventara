"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  X,
  Copy,
  Check,
  CreditCard,
  QrCode,
  ShieldAlert,
  ArrowUpDown,
  FileJson,
  HelpCircle,
} from "lucide-react";
import { PaymentTransactionRecord, PaymentAuditMetrics } from "@/lib/payment-audit";

export function PaymentAuditPanel() {
  const [transactions, setTransactions] = useState<PaymentTransactionRecord[]>([]);
  const [metrics, setMetrics] = useState<PaymentAuditMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectedTx, setInspectedTx] = useState<PaymentTransactionRecord | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (methodFilter !== "all") params.set("method", methodFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("limit", "100");

      let res = await fetch(`/api/admin/payments/transactions?${params.toString()}`);
      if (!res.ok) {
        res = await fetch(`/api/admin/payments/audit?${params.toString()}`);
      }
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error("Erro ao carregar auditoria de pagamentos:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, methodFilter, searchQuery]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const exportToCsv = () => {
    if (transactions.length === 0) return;

    const headers = [
      "Data",
      "Referencia",
      "Cliente",
      "Email",
      "Documento",
      "Metodo",
      "Valor_Reais",
      "Ambiente",
      "Status",
      "Status_Detail",
      "Diagnostico",
      "Gateway_ID",
    ];

    const rows = transactions.map((t) => [
      t.created_at ? new Date(t.created_at).toLocaleString("pt-BR") : "",
      t.reference_code,
      `"${(t.customer_name || "").replace(/"/g, '""')}"`,
      t.customer_email || "",
      t.customer_document || "",
      t.payment_method,
      (t.amount_in_cents / 100).toFixed(2),
      t.environment,
      t.status,
      t.status_detail || "",
      `"${(t.friendly_explanation || t.error_message || "").replace(/"/g, '""')}"`,
      t.gateway_payment_id || "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auditoria-pagamentos-ventara-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. CARDS DE MÉTRICAS & TELEMETRIA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total de Tentativas */}
        <div className="bg-[#06111f] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium uppercase tracking-wider">Tentativas Totais</span>
            <Activity size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {metrics ? metrics.totalCount : "—"}
          </div>
          <p className="text-[11px] text-slate-500">
            Transações registradas pelo checkout e testes
          </p>
        </div>

        {/* Card 2: Aprovadas */}
        <div className="bg-[#06111f] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-emerald-400 text-xs">
            <span className="font-medium uppercase tracking-wider">Aprovadas</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-300">
            {metrics ? metrics.approvedCount : "—"}
          </div>
          <p className="text-[11px] text-slate-400">
            Volume: <strong className="text-emerald-400">{metrics ? formatCurrency(metrics.approvedAmountInCents) : "R$ 0,00"}</strong>
          </p>
        </div>

        {/* Card 3: Recusadas / Falhas */}
        <div className="bg-[#06111f] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-red-400 text-xs">
            <span className="font-medium uppercase tracking-wider">Recusadas / Falhas</span>
            <AlertCircle size={16} className="text-red-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-red-300">
            {metrics ? metrics.rejectedCount : "—"}
          </div>
          <p className="text-[11px] text-slate-400">
            Valor retido: <span className="text-red-400">{metrics ? formatCurrency(metrics.rejectedAmountInCents) : "R$ 0,00"}</span>
          </p>
        </div>

        {/* Card 4: Taxa de Aprovação */}
        <div className="bg-[#06111f] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-amber-400 text-xs">
            <span className="font-medium uppercase tracking-wider">Taxa de Conversão</span>
            <Activity size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-300">
            {metrics ? `${metrics.successRate}%` : "—"}
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics ? metrics.successRate : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS & AÇÕES */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por referência, cliente, email ou CPF..."
              className="w-full bg-[#040c16] border border-white/10 rounded-xl pl-10 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtros Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#040c16] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todos os Status</option>
              <option value="approved">Aprovados</option>
              <option value="pending">Pendentes</option>
              <option value="rejected">Recusados</option>
              <option value="failed">Falhas / Erros</option>
            </select>

            {/* Método */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-[#040c16] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="all">Todos os Métodos</option>
              <option value="pix">Pix</option>
              <option value="credit_card">Cartão de Crédito</option>
            </select>

            {/* Recarregar */}
            <button
              type="button"
              onClick={fetchTransactions}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors cursor-pointer"
              title="Atualizar lista"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-amber-400" : ""} />
            </button>

            {/* Exportar CSV */}
            <button
              type="button"
              onClick={exportToCsv}
              disabled={transactions.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors disabled:opacity-40 cursor-pointer"
              title="Exportar registros em CSV"
            >
              <Download size={14} className="text-amber-400" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Resumo */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
          <span>Mostrando <strong>{transactions.length}</strong> transações registradas</span>
          {(statusFilter !== "all" || methodFilter !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setMethodFilter("all");
                setSearchQuery("");
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* 3. TABELA DE AUDITORIA */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl overflow-hidden shadow-sm">
        {loading && transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-amber-400" />
            <span>Consultando registros de auditoria...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Activity size={32} className="mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-white">Nenhuma transação encontrada</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Quando clientes realizarem compras pelo checkout ou testes forem executados, as tentativas e diagnósticos de erro aparecerão aqui em tempo real.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Data / Hora</th>
                  <th className="py-3 px-4 font-semibold">Referência</th>
                  <th className="py-3 px-4 font-semibold">Cliente</th>
                  <th className="py-3 px-4 font-semibold">Método / Valor</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Diagnóstico do Gateway</th>
                  <th className="py-3 px-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {transactions.map((tx) => {
                  const isApproved = tx.status === "approved";
                  const isPending = tx.status === "pending";
                  const isRejected = tx.status === "rejected" || tx.status === "failed";
                  const dateFormatted = tx.created_at
                    ? new Date(tx.created_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  return (
                    <tr
                      key={tx.id || tx.reference_code}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Data / Hora */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {dateFormatted}
                      </td>

                      {/* Referência */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-white font-semibold text-xs flex items-center gap-1.5">
                          <span>{tx.reference_code}</span>
                          {tx.environment === "sandbox" && (
                            <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-sans uppercase">
                              Test
                            </span>
                          )}
                        </div>
                        {tx.gateway_payment_id && (
                          <span className="text-[10px] text-slate-500 font-mono block">
                            ID: {tx.gateway_payment_id}
                          </span>
                        )}
                      </td>

                      {/* Cliente */}
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium truncate max-w-[160px]">
                          {tx.customer_name || "Cliente Anônimo"}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                          {tx.customer_email || tx.customer_document || "—"}
                        </div>
                      </td>

                      {/* Método e Valor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-white font-semibold">
                          {tx.payment_method === "pix" ? (
                            <QrCode size={13} className="text-emerald-400" />
                          ) : (
                            <CreditCard size={13} className="text-blue-400" />
                          )}
                          <span>{formatCurrency(tx.amount_in_cents)}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase">
                          {tx.payment_method === "pix" ? "Pix Instantâneo" : "Cartão de Crédito"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 size={11} /> Aprovado
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            <Clock size={11} /> Pendente
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                            <AlertCircle size={11} /> Recusado
                          </span>
                        )}
                      </td>

                      {/* Diagnóstico */}
                      <td className="py-3.5 px-4 max-w-[280px]">
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {tx.friendly_explanation || tx.error_message || tx.status_detail || "Transação sem ocorrências."}
                        </p>
                      </td>

                      {/* Ação */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInspectedTx(tx)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                        >
                          <Eye size={12} className="text-amber-400" />
                          <span>Inspecionar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL / DRAWER DE INSPEÇÃO TÉCNICA DETALHADA */}
      {inspectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#06111f] border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Topo do Modal */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  AUDITORIA DE TRANSAÇÃO
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>Pedido: {inspectedTx.reference_code}</span>
                  {inspectedTx.environment === "sandbox" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded">
                      Sandbox
                    </span>
                  )}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedTx(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
              {/* Diagnóstico em Destaque */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                  inspectedTx.status === "approved"
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                    : inspectedTx.status === "pending"
                    ? "bg-amber-950/40 border-amber-500/30 text-amber-200"
                    : "bg-red-950/40 border-red-500/30 text-red-200"
                }`}
              >
                {inspectedTx.status === "approved" ? (
                  <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                ) : inspectedTx.status === "pending" ? (
                  <Clock size={20} className="text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-bold text-sm">
                    {inspectedTx.status === "approved"
                      ? "Pagamento Aprovado com Sucesso"
                      : inspectedTx.status === "pending"
                      ? "Pagamento Pendente"
                      : "Transação Não Concluída"}
                  </p>
                  <p className="text-xs leading-relaxed">
                    {inspectedTx.friendly_explanation || inspectedTx.error_message || "Sem diagnóstico detalhado retornado pelo gateway."}
                  </p>
                </div>
              </div>

              {/* Informações Gerais do Pedido */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#040c16] border border-white/5 rounded-2xl p-4">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Cliente</span>
                  <span className="text-white font-medium block truncate">
                    {inspectedTx.customer_name || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">E-mail</span>
                  <span className="text-white font-medium block truncate">
                    {inspectedTx.customer_email || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Documento (CPF)</span>
                  <span className="text-white font-medium block">
                    {inspectedTx.customer_document || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Método</span>
                  <span className="text-white font-medium uppercase block">
                    {inspectedTx.payment_method}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Valor Total</span>
                  <span className="text-emerald-400 font-bold block">
                    {formatCurrency(inspectedTx.amount_in_cents)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">ID Mercado Pago</span>
                  <span className="text-white font-mono text-[11px] block truncate">
                    {inspectedTx.gateway_payment_id || "N/A"}
                  </span>
                </div>
              </div>

              {/* Recomendações Práticas para o Lojista */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                  <HelpCircle size={14} />
                  <span>Ação Recomendada para Recuperação:</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {inspectedTx.status === "approved"
                    ? "O valor já está creditado na sua conta Mercado Pago. O pedido pode ser enviado para a montagem de laboratório ou expedição."
                    : inspectedTx.payment_method === "pix"
                    ? "Caso o cliente ainda não tenha pago, envie uma mensagem no WhatsApp com o código Pix Copia e Cola para facilitar a conclusão do pedido."
                    : "Em recusas de cartão (por limite ou suspeita antifraude), sugira ao cliente tentar novamente via Pix instantâneo com aprovação imediata ou utilizar outro cartão."}
                </p>
              </div>

              {/* Payload Técnico (Request / Response) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileJson size={14} className="text-amber-400" />
                    Telemetria Técnica (JSON)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        JSON.stringify(
                          {
                            reference_code: inspectedTx.reference_code,
                            status: inspectedTx.status,
                            status_detail: inspectedTx.status_detail,
                            error_message: inspectedTx.error_message,
                            request_payload: inspectedTx.request_payload,
                            response_payload: inspectedTx.response_payload,
                            metadata: inspectedTx.metadata,
                          },
                          null,
                          2
                        )
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                  >
                    {copiedPayload ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copiar Payload</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="bg-[#02070d] border border-white/10 rounded-2xl p-4 text-[10px] font-mono text-amber-300/90 overflow-x-auto max-h-48 leading-relaxed">
                  {JSON.stringify(
                    {
                      id: inspectedTx.id,
                      status: inspectedTx.status,
                      status_detail: inspectedTx.status_detail,
                      error_message: inspectedTx.error_message,
                      friendly_explanation: inspectedTx.friendly_explanation,
                      request: inspectedTx.request_payload,
                      response: inspectedTx.response_payload,
                      metadata: inspectedTx.metadata,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 border-t border-white/10 flex justify-end bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setInspectedTx(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
