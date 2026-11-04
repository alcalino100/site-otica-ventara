import { createAdminClient } from "@/lib/supabase/admin";

export type PaymentMethodType = "pix" | "credit_card" | "boleto";
export type PaymentStatusType = "approved" | "pending" | "rejected" | "failed" | "cancelled";

export interface PaymentTransactionRecord {
  id?: string;
  order_id?: string | null;
  reference_code: string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_document?: string | null;
  customer_phone?: string | null;
  payment_method: PaymentMethodType;
  amount_in_cents: number;
  environment: "production" | "sandbox";
  status: PaymentStatusType;
  status_detail?: string | null;
  gateway?: string;
  gateway_payment_id?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  friendly_explanation?: string | null;
  request_payload?: any;
  response_payload?: any;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentAuditMetrics {
  totalCount: number;
  approvedCount: number;
  approvedAmountInCents: number;
  rejectedCount: number;
  rejectedAmountInCents: number;
  pendingCount: number;
  pendingAmountInCents: number;
  successRate: number; // Porcentagem de 0 a 100
}

/**
 * Traduz códigos técnicos do Mercado Pago (status_detail) para diagnósticos claros
 */
export function translateMercadoPagoStatusDetail(
  statusDetail?: string | null,
  status?: string | null
): string {
  if (!statusDetail && !status) return "Status não informado pelo gateway.";

  const detail = (statusDetail || "").toLowerCase().trim();

  const translations: Record<string, string> = {
    // Sucesso / Aprovados
    accredited: "Pagamento aprovado e creditado com sucesso.",
    approved: "Pagamento aprovado com sucesso.",

    // Pendentes
    pending_contingency: "Pagamento em análise de segurança. A instituição financeira está processando a transação.",
    pending_review_manual: "Pagamento em revisão manual pelo time de prevenção a fraudes.",
    pending_waiting_payment: "Aguardando pagamento do cliente.",
    pending_waiting_transfer: "Aguardando transferência via Pix.",

    // Recusas de Cartão de Crédito
    cc_rejected_bad_filled_card_number: "Cartão recusado: O número do cartão foi preenchido incorretamente.",
    cc_rejected_bad_filled_date: "Cartão recusado: A data de validade informada está incorreta ou expirada.",
    cc_rejected_bad_filled_other: "Cartão recusado: Alguns dados cadastrais do cartão foram preenchidos incorretamente.",
    cc_rejected_bad_filled_security_code: "Cartão recusado: O código de segurança (CVV) está incorreto.",
    cc_rejected_blacklist: "Cartão recusado: Transação bloqueada por regras de segurança do emissor.",
    cc_rejected_call_for_authorize: "Cartão recusado: O titular do cartão deve ligar para o banco para autorizar a compra.",
    cc_rejected_card_disabled: "Cartão recusado: O cartão está inativo ou bloqueado para compras na internet.",
    cc_rejected_card_error: "Cartão recusado: Falha de comunicação com a operadora do cartão.",
    cc_rejected_duplicated_payment: "Cartão recusado: Pagamento duplicado detectado para evitar cobrança em dobro.",
    cc_rejected_high_risk: "Transação recusada pelo sistema antifraude do Mercado Pago por motivo de segurança.",
    cc_rejected_insufficient_amount: "Cartão recusado: Saldo ou limite de crédito insuficiente no cartão.",
    cc_rejected_invalid_installments: "Cartão recusado: Quantidade de parcelas inválida para a bandeira do cartão.",
    cc_rejected_max_attempts: "Cartão recusado: Limite de tentativas consecutivas excedido. Tente outro cartão.",
    cc_rejected_other_reason: "Cartão recusado pelo banco emissor por motivo não especificado.",

    // Erros de autenticação / credenciais
    unauthorized: "Credenciais de Acesso inválidas ou ausentes na configuração do Mercado Pago.",
    "authorization value not present": "Access Token do Mercado Pago não encontrado no cabeçalho da requisição.",
    invalid_client: "Chaves de API do Mercado Pago inválidas ou revogadas.",
    bad_request: "A requisição enviada continha dados rejeitados pelo Mercado Pago.",
  };

  if (translations[detail]) {
    return translations[detail];
  }

  if (status === "approved" || status === "paid") {
    return "Pagamento aprovado.";
  }
  if (status === "pending" || status === "in_process") {
    return "Pagamento pendente de confirmação.";
  }
  if (status === "rejected" || status === "cancelled" || status === "failed") {
    return `Pagamento não concluído (${statusDetail || status}).`;
  }

  return statusDetail || status || "Transação processada.";
}

// Armazenamento em memória volátil para ambientes sem banco configurado / testes
const memoryAuditLog: PaymentTransactionRecord[] = [];

/**
 * Registra uma tentativa de pagamento na trilha de auditoria
 */
export async function recordPaymentTransaction(
  data: PaymentTransactionRecord
): Promise<PaymentTransactionRecord> {
  const explanation =
    data.friendly_explanation ||
    translateMercadoPagoStatusDetail(data.status_detail, data.status);

  const record: PaymentTransactionRecord = {
    ...data,
    friendly_explanation: explanation,
    gateway: data.gateway || "mercadopago",
    created_at: data.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const supabase = createAdminClient();
    const hasDb = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (hasDb) {
      const { data: inserted, error } = await supabase
        .from("payment_transactions")
        .insert({
          order_id: record.order_id || null,
          reference_code: record.reference_code,
          customer_name: record.customer_name || null,
          customer_email: record.customer_email || null,
          customer_document: record.customer_document || null,
          customer_phone: record.customer_phone || null,
          payment_method: record.payment_method,
          amount_in_cents: record.amount_in_cents,
          environment: record.environment,
          status: record.status,
          status_detail: record.status_detail || null,
          gateway: record.gateway,
          gateway_payment_id: record.gateway_payment_id || null,
          error_code: record.error_code || null,
          error_message: record.error_message || null,
          friendly_explanation: explanation,
          request_payload: record.request_payload || null,
          response_payload: record.response_payload || null,
          metadata: record.metadata || null,
        })
        .select()
        .single();

      if (!error && inserted) {
        return inserted as PaymentTransactionRecord;
      }
    }
  } catch (err) {
    console.warn("Aviso ao persistir auditoria de pagamento no Supabase, mantendo cópia em memória:", err);
  }

  // Fallback em memória
  const memoryRecord = {
    ...record,
    id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
  memoryAuditLog.unshift(memoryRecord);
  return memoryRecord;
}

/**
 * Atualiza o status de uma transação existente (ex: via webhook do Mercado Pago)
 */
export async function updatePaymentTransactionStatus(params: {
  gatewayPaymentId?: string;
  referenceCode?: string;
  status: PaymentStatusType;
  statusDetail?: string;
  responsePayload?: any;
}): Promise<void> {
  const friendly = translateMercadoPagoStatusDetail(params.statusDetail, params.status);

  try {
    const supabase = createAdminClient();
    const hasDb = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (hasDb) {
      let query = supabase.from("payment_transactions").update({
        status: params.status,
        status_detail: params.statusDetail || null,
        friendly_explanation: friendly,
        response_payload: params.responsePayload || undefined,
        updated_at: new Date().toISOString(),
      });

      if (params.gatewayPaymentId) {
        query = query.eq("gateway_payment_id", params.gatewayPaymentId);
      } else if (params.referenceCode) {
        query = query.eq("reference_code", params.referenceCode);
      }

      await query;
      return;
    }
  } catch (err) {
    console.warn("Aviso ao atualizar auditoria no banco:", err);
  }

  // Atualiza em memória se existir
  const item = memoryAuditLog.find(
    (t) =>
      (params.gatewayPaymentId && t.gateway_payment_id === params.gatewayPaymentId) ||
      (params.referenceCode && t.reference_code === params.referenceCode)
  );
  if (item) {
    item.status = params.status;
    item.status_detail = params.statusDetail;
    item.friendly_explanation = friendly;
    item.updated_at = new Date().toISOString();
  }
}

/**
 * Consulta a lista de transações com filtros, paginação e métricas consolidadas
 */
export async function listPaymentTransactions(options?: {
  status?: string;
  method?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  transactions: PaymentTransactionRecord[];
  metrics: PaymentAuditMetrics;
  total: number;
}> {
  const limit = Math.min(options?.limit || 50, 100);
  const offset = options?.offset || 0;

  try {
    const supabase = createAdminClient();
    const hasDb = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (hasDb) {
      // 1. Busca lista paginada
      let query = supabase
        .from("payment_transactions")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (options?.status && options.status !== "all") {
        query = query.eq("status", options.status);
      }
      if (options?.method && options.method !== "all") {
        query = query.eq("payment_method", options.method);
      }
      if (options?.search && options.search.trim()) {
        const q = options.search.trim();
        query = query.or(
          `reference_code.ilike.%${q}%,customer_name.ilike.%${q}%,customer_email.ilike.%${q}%,customer_document.ilike.%${q}%`
        );
      }

      query = query.range(offset, offset + limit - 1);
      const { data, count, error } = await query;

      if (!error && data) {
        // 2. Calcula métricas gerais
        const { data: allRecords } = await supabase
          .from("payment_transactions")
          .select("status, amount_in_cents");

        const records = allRecords || [];
        const approved = records.filter((r) => r.status === "approved");
        const rejected = records.filter((r) => r.status === "rejected" || r.status === "failed");
        const pending = records.filter((r) => r.status === "pending");

        const approvedSum = approved.reduce((acc, r) => acc + (r.amount_in_cents || 0), 0);
        const rejectedSum = rejected.reduce((acc, r) => acc + (r.amount_in_cents || 0), 0);
        const pendingSum = pending.reduce((acc, r) => acc + (r.amount_in_cents || 0), 0);

        const totalAttempts = records.length;
        const successRate =
          totalAttempts > 0 ? Math.round((approved.length / totalAttempts) * 100) : 0;

        return {
          transactions: data as PaymentTransactionRecord[],
          metrics: {
            totalCount: totalAttempts,
            approvedCount: approved.length,
            approvedAmountInCents: approvedSum,
            rejectedCount: rejected.length,
            rejectedAmountInCents: rejectedSum,
            pendingCount: pending.length,
            pendingAmountInCents: pendingSum,
            successRate,
          },
          total: count || data.length,
        };
      }
    }
  } catch (err) {
    console.warn("Aviso ao consultar transações do Supabase:", err);
  }

  // Fallback em memória
  let filtered = [...memoryAuditLog];
  if (options?.status && options.status !== "all") {
    filtered = filtered.filter((t) => t.status === options.status);
  }
  if (options?.method && options.method !== "all") {
    filtered = filtered.filter((t) => t.payment_method === options.method);
  }
  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    filtered = filtered.filter(
      (t) =>
        t.reference_code.toLowerCase().includes(q) ||
        t.customer_name?.toLowerCase().includes(q) ||
        t.customer_email?.toLowerCase().includes(q) ||
        t.customer_document?.includes(q)
    );
  }

  const approved = memoryAuditLog.filter((r) => r.status === "approved");
  const rejected = memoryAuditLog.filter((r) => r.status === "rejected" || r.status === "failed");
  const pending = memoryAuditLog.filter((r) => r.status === "pending");

  const approvedSum = approved.reduce((acc, r) => acc + (r.amount_in_cents || 0), 0);
  const rejectedSum = rejected.reduce((acc, r) => acc + (r.amount_in_cents || 0), 0);
  const pendingSum = pending.reduce((acc, r) => acc + (r.amount_in_cents || 0), 0);

  const totalAttempts = memoryAuditLog.length;
  const successRate = totalAttempts > 0 ? Math.round((approved.length / totalAttempts) * 100) : 0;

  return {
    transactions: filtered.slice(offset, offset + limit),
    metrics: {
      totalCount: totalAttempts,
      approvedCount: approved.length,
      approvedAmountInCents: approvedSum,
      rejectedCount: rejected.length,
      rejectedAmountInCents: rejectedSum,
      pendingCount: pending.length,
      pendingAmountInCents: pendingSum,
      successRate,
    },
    total: filtered.length,
  };
}
