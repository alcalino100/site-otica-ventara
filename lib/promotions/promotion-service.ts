import crypto from "crypto";
import {
  PromotionCampaignConfig,
  DEFAULT_PROMOTION_CONFIG,
  WheelParticipatePayload,
  WheelParticipateResponse,
  PromotionParticipation,
  PromotionMetricsSummary,
  CouponStatus,
  normalizeBrazilianPhone,
  maskPhoneForDisplay,
} from "@/types/promotion-wheel";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/client";

// Armazenamento em memória (fallback seguro quando Supabase não estiver configurado ou em ambiente de desenvolvimento)
let inMemoryCampaignConfig: PromotionCampaignConfig = { ...DEFAULT_PROMOTION_CONFIG };
let inMemoryDraftConfig: PromotionCampaignConfig = { ...DEFAULT_PROMOTION_CONFIG };
let inMemoryRevisions: Array<{ id: string; version: number; published_at: string; author: string }> = [
  {
    id: "rev-init",
    version: 1,
    published_at: new Date().toISOString(),
    author: "Sistema (Padrão Ventara)",
  },
];

// Armazenamento em memória (iniciado vazio para dados reais de produção)
let inMemoryParticipations: PromotionParticipation[] = [];
let inMemoryImpressions = 0;
let inMemoryOpens = 0;

/**
 * Gera um código de cupom único, amigável para leitura e seguro contra adivinhação
 */
export function generateCouponCode(prefix = "VENTARA-10"): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // Sem 0, O, 1, I para evitar confusão de leitura
  let randomPart = "";
  for (let i = 0; i < 5; i++) {
    const idx = crypto.randomInt(0, chars.length);
    randomPart += chars[idx];
  }
  return `${prefix}-${randomPart}`;
}

/**
 * Camada de Serviço para Roleta e Campanhas
 */
export const PromotionService = {
  /**
   * Obtém a configuração pública e sanitizada da campanha ativa
   */
  async getPublicCampaignConfig(): Promise<PromotionCampaignConfig | null> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from("campaigns")
          .select("config")
          .eq("status", "active")
          .order("published_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data && data.config) {
          return data.config as PromotionCampaignConfig;
        }
      } catch (err) {
        console.warn("[PromotionService] Fallback para configuração local ativa:", err);
      }
    }

    // Se estiver desativada, retorna nulo para não exibir o componente
    if (inMemoryCampaignConfig.status === "disabled") {
      return null;
    }

    return inMemoryCampaignConfig;
  },

  /**
   * Obtém o rascunho atual e a versão publicada para o painel administrativo
   */
  async getAdminCampaignData(): Promise<{
    published: PromotionCampaignConfig;
    draft: PromotionCampaignConfig;
    revisions: Array<{ id: string; version: number; published_at: string; author: string }>;
  }> {
    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        const { data: campaignRow } = await supabase
          .from("campaigns")
          .select("config, draft_config, version")
          .limit(1)
          .maybeSingle();

        const { data: revs } = await supabase
          .from("campaign_revisions")
          .select("id, version, published_at, author")
          .order("version", { ascending: false });

        if (campaignRow) {
          return {
            published: campaignRow.config || inMemoryCampaignConfig,
            draft: campaignRow.draft_config || campaignRow.config || inMemoryDraftConfig,
            revisions: revs && revs.length > 0 ? revs : inMemoryRevisions,
          };
        }
      } catch (err) {
        console.warn("[PromotionService] Usando fallback administrativo:", err);
      }
    }

    return {
      published: inMemoryCampaignConfig,
      draft: inMemoryDraftConfig,
      revisions: inMemoryRevisions,
    };
  },

  /**
   * Salva alterações no rascunho (sem afetar a versão publicada)
   */
  async saveDraft(draft: PromotionCampaignConfig): Promise<boolean> {
    draft.updated_at = new Date().toISOString();
    inMemoryDraftConfig = { ...draft };

    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase
          .from("campaigns")
          .upsert({
            id: draft.id,
            name: draft.name,
            draft_config: draft,
            updated_at: draft.updated_at,
          });
      } catch (err) {
        console.error("[PromotionService] Erro ao persistir rascunho no Supabase:", err);
      }
    }

    return true;
  },

  /**
   * Publica o rascunho como nova versão oficial da campanha
   */
  async publishDraft(author = "Administrador Ótica Ventara"): Promise<PromotionCampaignConfig> {
    const newVersion = (inMemoryCampaignConfig.version || 1) + 1;
    const publishedAt = new Date().toISOString();

    const publishedConfig: PromotionCampaignConfig = {
      ...inMemoryDraftConfig,
      version: newVersion,
      published_at: publishedAt,
      updated_at: publishedAt,
    };

    inMemoryCampaignConfig = { ...publishedConfig };
    inMemoryDraftConfig = { ...publishedConfig };

    const newRev = {
      id: `rev-${newVersion}-${Date.now().toString(36)}`,
      version: newVersion,
      published_at: publishedAt,
      author,
    };
    inMemoryRevisions.unshift(newRev);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createAdminClient();
        await supabase.from("campaigns").upsert({
          id: publishedConfig.id,
          name: publishedConfig.name,
          version: newVersion,
          status: publishedConfig.status,
          config: publishedConfig,
          draft_config: publishedConfig,
          published_at: publishedAt,
          updated_at: publishedAt,
        });

        await supabase.from("campaign_revisions").insert({
          campaign_id: publishedConfig.id,
          version: newVersion,
          config_snapshot: publishedConfig,
          author,
          published_at: publishedAt,
        });
      } catch (err) {
        console.error("[PromotionService] Erro ao publicar no Supabase:", err);
      }
    }

    return publishedConfig;
  },

  /**
   * Processa a submissão de participação do visitante no servidor
   * - Valida honeypot e tempo de preenchimento plausível
   * - Normaliza o telefone brasileiro
   * - Garante idempotência e unicidade
   * - Seleciona o segmento vencedor via criptografia segura
   * - Emite cupom vinculado à participação
   */
  async processParticipation(
    payload: WheelParticipatePayload,
    ip = "127.0.0.1",
    userAgent = "Unknown"
  ): Promise<WheelParticipateResponse> {
    // 1. Verificação antiautomação (Honeypot preenchido ou preenchimento instantâneo < 1.2s)
    if (payload.hp_field && payload.hp_field.length > 0) {
      throw new Error("Acesso inválido detectado.");
    }
    if (payload.clientElapsedMs && payload.clientElapsedMs < 1200) {
      throw new Error("Envio excessivamente rápido. Por favor, tente novamente.");
    }

    const campaign = inMemoryCampaignConfig;

    // 2. Valida status e datas da campanha
    if (campaign.status === "disabled") {
      throw new Error("Esta campanha não está mais disponível no momento.");
    }

    const now = new Date();
    if (campaign.starts_at && new Date(campaign.starts_at) > now) {
      throw new Error("Esta campanha ainda não iniciou.");
    }
    if (campaign.ends_at && new Date(campaign.ends_at) < now) {
      throw new Error("Esta campanha foi encerrada.");
    }

    const normalizedPhone = normalizeBrazilianPhone(payload.phone);
    if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
      throw new Error("Número de WhatsApp inválido.");
    }

    // 3. Verificação de participação prévia (Deduplicação por telefone normalizado e campanha)
    const existing = inMemoryParticipations.find(
      (p) =>
        p.campaign_id === campaign.id &&
        (p.lead_phone_normalized === normalizedPhone ||
          p.lead_phone_masked === maskPhoneForDisplay(normalizedPhone))
    );

    if (existing && campaign.triggers.single_entry_per_campaign) {
      // Resposta neutra que devolve o benefício sem duplicar cupons
      const segmentIndex = campaign.segments.findIndex((s) => s.id === existing.winning_segment_id);
      return {
        success: true,
        already_participated: true,
        winning_segment_id: existing.winning_segment_id,
        winning_segment_index: segmentIndex >= 0 ? segmentIndex : 0,
        benefit: {
          type: "percentage",
          value: 10,
          label: existing.benefit_label,
          description: "Seu cupom de 10% já foi emitido anteriormente para este número.",
        },
        coupon: {
          code: existing.coupon_code,
          expires_at: existing.coupon_expires_at,
          regulations: campaign.coupon_rules.regulations_summary,
          min_purchase_cents: campaign.coupon_rules.min_purchase_cents,
          is_cumulative: campaign.coupon_rules.is_cumulative,
        },
        message: "Identificamos sua participação anterior! Seu cupom continua ativo.",
      };
    }

    // 4. Seleção segura do benefício e segmento vencedor no SERVIDOR
    let winningSegment = campaign.segments[0];
    let winningSegmentIndex = 0;

    if (campaign.distribution_mode === "FIXED") {
      // No modo FIXED, o benefício garantido é rigorosamente 10%
      // Filtra apenas os segmentos elegíveis de 10%
      const eligibleSegments = campaign.segments
        .map((seg, idx) => ({ seg, idx }))
        .filter((item) => item.seg.is_winner_eligible && item.seg.value === campaign.fixed_benefit.value);

      if (eligibleSegments.length > 0) {
        const pick = eligibleSegments[crypto.randomInt(0, eligibleSegments.length)];
        winningSegment = pick.seg;
        winningSegmentIndex = pick.idx;
      }
    } else {
      // Modo WEIGHTED: seleção por pesos probabilísticos reais com crypto.randomInt
      const eligibleSegments = campaign.segments
        .map((seg, idx) => ({ seg, idx }))
        .filter((item) => item.seg.is_winner_eligible && item.seg.weight > 0);

      const totalWeight = eligibleSegments.reduce((sum, item) => sum + item.seg.weight, 0);

      if (totalWeight > 0) {
        let randomWeightPoint = crypto.randomInt(0, totalWeight);
        for (const item of eligibleSegments) {
          if (randomWeightPoint < item.seg.weight) {
            winningSegment = item.seg;
            winningSegmentIndex = item.idx;
            break;
          }
          randomWeightPoint -= item.seg.weight;
        }
      }
    }

    // 5. Emissão do cupom e registro da participação
    const couponCode = generateCouponCode("VENTARA-10");
    const expiresAt = new Date(Date.now() + campaign.coupon_rules.validity_days * 86400000).toISOString();
    const maskedPhone = maskPhoneForDisplay(normalizedPhone);

    const participationRecord: PromotionParticipation = {
      id: `part-${Date.now()}-${crypto.randomInt(100, 999)}`,
      campaign_id: campaign.id,
      campaign_version: campaign.version,
      lead_id: `lead-${Date.now()}`,
      lead_name: payload.name.trim(),
      lead_phone_normalized: normalizedPhone,
      lead_phone_masked: maskedPhone,
      benefit_label: winningSegment.label,
      winning_segment_id: winningSegment.id,
      coupon_code: couponCode,
      coupon_status: "issued",
      coupon_expires_at: expiresAt,
      created_at: new Date().toISOString(),
    };

    inMemoryParticipations.unshift(participationRecord);

    return {
      success: true,
      winning_segment_id: winningSegment.id,
      winning_segment_index: winningSegmentIndex,
      benefit: {
        type: winningSegment.type,
        value: winningSegment.value,
        label: winningSegment.label,
        description: "Desconto garantido para sua próxima armação na Óticas Ventara.",
      },
      coupon: {
        code: couponCode,
        expires_at: expiresAt,
        regulations: campaign.coupon_rules.regulations_summary,
        min_purchase_cents: campaign.coupon_rules.min_purchase_cents,
        is_cumulative: campaign.coupon_rules.is_cumulative,
      },
      message: "Benefício revelado com sucesso!",
    };
  },

  /**
   * Registra eventos de visualização / abertura do modal
   */
  async recordImpression(): Promise<void> {
    inMemoryImpressions += 1;
  },

  async recordOpen(): Promise<void> {
    inMemoryOpens += 1;
  },

  /**
   * Lista participações com busca, paginação e filtros
   */
  async getParticipations(params?: {
    search?: string;
    status?: CouponStatus | "all";
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: PromotionParticipation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    let list = [...inMemoryParticipations];

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.lead_name.toLowerCase().includes(q) ||
          p.coupon_code.toLowerCase().includes(q) ||
          p.lead_phone_masked.includes(q)
      );
    }

    if (params?.status && params.status !== "all") {
      list = list.filter((p) => p.coupon_status === params.status);
    }

    const total = list.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return {
      items,
      total,
      page,
      totalPages,
    };
  },

  /**
   * Resgata um cupom manualmente no balcão da loja física
   */
  async redeemCoupon(code: string, operatorName: string): Promise<PromotionParticipation> {
    const item = inMemoryParticipations.find((p) => p.coupon_code.toUpperCase() === code.trim().toUpperCase());
    if (!item) {
      throw new Error("Cupom não localizado.");
    }
    if (item.coupon_status === "used") {
      throw new Error(`Este cupom já foi utilizado em ${new Date(item.used_at || "").toLocaleDateString("pt-BR")}.`);
    }
    if (item.coupon_status === "cancelled") {
      throw new Error("Este cupom foi cancelado.");
    }
    if (new Date(item.coupon_expires_at) < new Date()) {
      item.coupon_status = "expired";
      throw new Error("Este cupom expirou a validade.");
    }

    item.coupon_status = "used";
    item.used_at = new Date().toISOString();
    item.used_by_operator = operatorName;

    return item;
  },

  /**
   * Resumo de métricas analíticas da promoção
   */
  async getMetricsSummary(): Promise<PromotionMetricsSummary> {
    const totalSubmissions = inMemoryParticipations.length;
    const totalCouponsIssued = inMemoryParticipations.filter((p) => p.coupon_status !== "cancelled").length;
    const totalCouponsUsed = inMemoryParticipations.filter((p) => p.coupon_status === "used").length;

    const conversionRate = inMemoryOpens > 0 ? (totalSubmissions / inMemoryOpens) * 100 : 0;
    const redemptionRate = totalCouponsIssued > 0 ? (totalCouponsUsed / totalCouponsIssued) * 100 : 0;

    return {
      total_impressions: inMemoryImpressions,
      unique_opens: inMemoryOpens,
      valid_submissions: totalSubmissions,
      coupons_issued: totalCouponsIssued,
      coupons_used: totalCouponsUsed,
      conversion_rate: Number(conversionRate.toFixed(1)),
      redemption_rate: Number(redemptionRate.toFixed(1)),
    };
  },

  /**
   * Exporta participações em CSV seguro contra fórmula injection (RFC 4180)
   */
  async exportParticipationsCsv(): Promise<string> {
    const headers = [
      "ID",
      "Nome",
      "Telefone",
      "Campanha",
      "Versão",
      "Benefício",
      "Cupom",
      "Status",
      "Data Emissão",
      "Data Resgate",
      "Operador Resgate",
    ];

    const rows = inMemoryParticipations.map((p) => {
      // Protege contra formula injection em Excel (=, +, -, @)
      const sanitize = (val: string | null | undefined) => {
        if (!val) return '""';
        let clean = String(val).replace(/"/g, '""');
        if (/^[=+\-@]/.test(clean)) {
          clean = `'${clean}`;
        }
        return `"${clean}"`;
      };

      return [
        sanitize(p.id),
        sanitize(p.lead_name),
        sanitize(p.lead_phone_masked),
        sanitize(p.campaign_id),
        sanitize(String(p.campaign_version)),
        sanitize(p.benefit_label),
        sanitize(p.coupon_code),
        sanitize(p.coupon_status),
        sanitize(new Date(p.created_at).toLocaleString("pt-BR")),
        sanitize(p.used_at ? new Date(p.used_at).toLocaleString("pt-BR") : ""),
        sanitize(p.used_by_operator || ""),
      ].join(",");
    });

    return [headers.join(","), ...rows].join("\r\n");
  },
};
