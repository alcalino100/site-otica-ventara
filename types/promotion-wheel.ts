import { z } from "zod";

/**
 * Tipos de benefício suportados pela campanha
 */
export type BenefitType = "percentage" | "fixed_cents" | "decorative";

/**
 * Modos de distribuição de prêmios
 */
export type DistributionMode = "FIXED" | "WEIGHTED";

/**
 * Status da campanha promocional
 */
export type CampaignStatus = "active" | "scheduled" | "ended" | "disabled";

/**
 * Status do cupom emitido
 */
export type CouponStatus = "issued" | "used" | "expired" | "cancelled";

/**
 * Segmento individual da roleta
 */
export interface WheelSegment {
  id: string;
  label: string;
  sublabel?: string;
  is_winner_eligible: boolean;
  type: BenefitType;
  value: number; // Porcentagem (ex: 10) ou valor em centavos
  color: string;
  text_color: string;
  weight: number; // Peso para modo WEIGHTED (1-100)
  max_grants?: number;
  granted_count?: number;
}

/**
 * Configuração de regras do cupom
 */
export interface CouponRulesConfig {
  validity_days: number;
  min_purchase_cents: number;
  allowed_categories: string[];
  is_cumulative: boolean;
  regulations_summary: string;
  regulations_full: string;
}

/**
 * Configuração de aparência e branding
 */
export interface AppearanceConfig {
  logo_url?: string;
  bg_color: string;
  surface_color: string;
  text_color: string;
  accent_color: string;
  button_bg: string;
  button_text: string;
  pointer_color: string;
  border_color: string;
  font_family: string;
  title_text: string;
  description_text: string;
  cta_button_text: string;
  footer_note: string;
  result_title: string;
  result_cta_action: "catalog" | "whatsapp" | "checkout";
  result_cta_text: string;
  animation_intensity: "normal" | "gentle" | "vibrant";
}

/**
 * Configuração do formulário de captura de lead
 */
export interface FormConfig {
  name_label: string;
  name_placeholder: string;
  phone_label: string;
  phone_placeholder: string;
  phone_help: string;
  marketing_opt_in_label: string;
  privacy_policy_url: string;
  whatsapp_number: string;
  whatsapp_default_message: string;
}

/**
 * Configuração dos gatilhos de exibição
 */
export interface TriggersConfig {
  is_enabled: boolean;
  min_seconds_on_page: number; // Padrão: 30s de aba visível
  inactivity_seconds: number; // Padrão: 45s sem interação
  exit_intent_desktop: boolean; // Padrão: true (clientY <= 0)
  cooldown_days_on_close: number; // Padrão: 7 dias
  single_entry_per_campaign: boolean; // Padrão: true
  target_devices: "all" | "desktop" | "mobile";
  excluded_paths: string[];
  require_no_cart_items: boolean;
}

/**
 * Benefício fixo para o modo FIXED
 */
export interface FixedBenefitConfig {
  type: "percentage" | "fixed_cents";
  value: number; // ex: 10
  label: string; // ex: '10% OFF'
  badge_text: string; // ex: 'Benefício desta campanha: 10% de desconto'
}

/**
 * Estrutura completa de uma campanha promocional
 */
export interface PromotionCampaignConfig {
  id: string;
  name: string;
  version: number;
  status: CampaignStatus;
  starts_at: string | null;
  ends_at: string | null;
  timezone: string;
  distribution_mode: DistributionMode;
  fixed_benefit: FixedBenefitConfig;
  coupon_rules: CouponRulesConfig;
  appearance: AppearanceConfig;
  segments: WheelSegment[];
  form: FormConfig;
  triggers: TriggersConfig;
  updated_at: string;
  published_at?: string | null;
}

/**
 * Configuração padrão oficial Óticas Ventara (DNA Visual Premium)
 */
export const DEFAULT_PROMOTION_CONFIG: PromotionCampaignConfig = {
  id: "camp-ventara-revelacao-v1",
  name: "Campanha de Revelação Ventara · 10% OFF Garantido",
  version: 1,
  status: "active",
  starts_at: null,
  ends_at: null,
  timezone: "America/Sao_Paulo",
  distribution_mode: "FIXED",
  fixed_benefit: {
    type: "percentage",
    value: 10,
    label: "10% OFF",
    badge_text: "Benefício garantido desta campanha: 10% de desconto",
  },
  coupon_rules: {
    validity_days: 7,
    min_purchase_cents: 0,
    allowed_categories: ["all"],
    is_cumulative: false,
    regulations_summary:
      "Válido por 7 dias para armações de grau e óculos solares homologados na Óticas Ventara. Uso único por cliente.",
    regulations_full:
      "Regulamento oficial da promoção: Cupom intransferível e de utilização única por CPF/WhatsApp identificado. Válido para compras na loja física em Araçatuba-SP ou pedidos via WhatsApp. Não cumulativo com outras promoções ativas.",
  },
  appearance: {
    logo_url: "/images/brand/logo-ventara.svg",
    bg_color: "#06121C",
    surface_color: "#10283B",
    text_color: "#F5F5F2",
    accent_color: "#E8C765",
    button_bg: "#E8C765",
    button_text: "#06121C",
    pointer_color: "#E8C765",
    border_color: "rgba(232, 199, 101, 0.35)",
    font_family: "sans",
    title_text: "Seu próximo olhar merece um benefício",
    description_text: "Preencha seus dados e gire para revelar seu benefício",
    cta_button_text: "Girar e revelar meu benefício",
    footer_note: "Identificação rápida pelo WhatsApp. Sem sorteio falso: benefício real de 10% garantido.",
    result_title: "Parabéns! Seu benefício foi revelado",
    result_cta_action: "catalog",
    result_cta_text: "Ver armações no catálogo",
    animation_intensity: "normal",
  },
  segments: [
    {
      id: "seg-1",
      label: "10% OFF",
      sublabel: "Garantido",
      is_winner_eligible: true,
      type: "percentage",
      value: 10,
      color: "#10283B",
      text_color: "#E8C765",
      weight: 10,
    },
    {
      id: "seg-2",
      label: "Seu novo olhar",
      sublabel: "Ventara",
      is_winner_eligible: false,
      type: "decorative",
      value: 0,
      color: "#0B1D2C",
      text_color: "#F5F5F2",
      weight: 0,
    },
    {
      id: "seg-3",
      label: "10% OFF",
      sublabel: "Especial",
      is_winner_eligible: true,
      type: "percentage",
      value: 10,
      color: "#14334C",
      text_color: "#E8C765",
      weight: 10,
    },
    {
      id: "seg-4",
      label: "Presente Ventara",
      sublabel: "Exclusivo",
      is_winner_eligible: false,
      type: "decorative",
      value: 0,
      color: "#0B1D2C",
      text_color: "#F5F5F2",
      weight: 0,
    },
    {
      id: "seg-5",
      label: "10% OFF",
      sublabel: "Para Você",
      is_winner_eligible: true,
      type: "percentage",
      value: 10,
      color: "#10283B",
      text_color: "#E8C765",
      weight: 10,
    },
    {
      id: "seg-6",
      label: "Curadoria Nobre",
      sublabel: "Ventara",
      is_winner_eligible: false,
      type: "decorative",
      value: 0,
      color: "#0B1D2C",
      text_color: "#F5F5F2",
      weight: 0,
    },
  ],
  form: {
    name_label: "Seu nome completo",
    name_placeholder: "Ex: Mariana Silva",
    phone_label: "WhatsApp para receber seu cupom",
    phone_placeholder: "(18) 99999-9999",
    phone_help: "O telefone será utilizado para identificar sua participação e disponibilizar o benefício.",
    marketing_opt_in_label: "Quero receber novidades e lançamentos exclusivos da Óticas Ventara",
    privacy_policy_url: "#politica-privacidade",
    whatsapp_number: "5518996155748",
    whatsapp_default_message:
      "Olá! Acabei de garantir meu cupom {COUPON} de 10% OFF na roleta da Ótica Ventara e quero escolher minha armação!",
  },
  triggers: {
    is_enabled: true,
    min_seconds_on_page: 30,
    inactivity_seconds: 45,
    exit_intent_desktop: true,
    cooldown_days_on_close: 7,
    single_entry_per_campaign: true,
    target_devices: "all",
    excluded_paths: ["/admin", "/carrinho", "/checkout", "/pagamento", "/confirmacao"],
    require_no_cart_items: false,
  },
  updated_at: new Date().toISOString(),
  published_at: new Date().toISOString(),
};

/**
 * Validação de Telefone Brasileiro com Zod:
 * Aceita DDD + 8 dígitos (fixo/móvel antigo) ou DDD + 9 dígitos (móvel atual).
 * Remove caracteres não numéricos e valida tamanho entre 10 e 11 dígitos.
 */
export const brazilianPhoneRegex = /^[1-9]{2}(?:[2-8]|9[1-9])[0-9]{7}$/;

export function normalizeBrazilianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Se começar com 55 e tiver 12 ou 13 dígitos, retira o 55 para padronizar
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits.slice(2);
  }
  return digits;
}

export function formatBrazilianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function maskPhoneForDisplay(phone: string): string {
  const digits = normalizeBrazilianPhone(phone);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)}****-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ****-${digits.slice(6)}`;
  }
  return phone;
}

/**
 * Schema Zod para o formulário público do visitante
 */
export const wheelLeadFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Por favor, digite seu nome completo (pelo menos 2 caracteres)." })
    .max(80, { message: "O nome não pode exceder 80 caracteres." })
    .transform((val) => val.replace(/\s+/g, " ")),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => {
        const digits = normalizeBrazilianPhone(val);
        return digits.length === 10 || digits.length === 11;
      },
      { message: "Digite um telefone ou WhatsApp válido com DDD (10 ou 11 dígitos)." }
    ),
  marketingOptIn: z.boolean().default(false),
  // Honeypot invisível para bots
  hp_field: z.string().max(0, { message: "Acesso inválido detectado." }).default(""),
});

export type WheelLeadFormData = z.input<typeof wheelLeadFormSchema>;
export type WheelLeadFormOutput = z.output<typeof wheelLeadFormSchema>;

/**
 * Contrato de envio de participação para o servidor
 */
export interface WheelParticipatePayload {
  name: string;
  phone: string;
  marketingOptIn: boolean;
  campaignId: string;
  campaignVersion: number;
  idempotencyKey: string;
  clientElapsedMs: number;
  hp_field?: string;
}

/**
 * Resposta confirmada pelo servidor
 */
export interface WheelParticipateResponse {
  success: boolean;
  already_participated?: boolean;
  winning_segment_id: string;
  winning_segment_index: number;
  benefit: {
    type: BenefitType;
    value: number;
    label: string;
    description: string;
  };
  coupon: {
    code: string;
    expires_at: string;
    regulations: string;
    min_purchase_cents: number;
    is_cumulative: boolean;
  };
  message?: string;
}

/**
 * Registro de Lead no sistema
 */
export interface PromotionLead {
  id: string;
  name: string;
  phone_normalized: string;
  phone_masked: string;
  marketing_opt_in: boolean;
  created_at: string;
}

/**
 * Registro de Participação confirmada
 */
export interface PromotionParticipation {
  id: string;
  campaign_id: string;
  campaign_version: number;
  lead_id: string;
  lead_name: string;
  lead_phone_normalized?: string;
  lead_phone_masked: string;
  benefit_label: string;
  winning_segment_id: string;
  coupon_code: string;
  coupon_status: CouponStatus;
  coupon_expires_at: string;
  created_at: string;
  used_at?: string | null;
  used_by_operator?: string | null;
}

/**
 * Resumo de Métricas para o Painel Admin
 */
export interface PromotionMetricsSummary {
  total_impressions: number;
  unique_opens: number;
  valid_submissions: number;
  coupons_issued: number;
  coupons_used: number;
  conversion_rate: number;
  redemption_rate: number;
}
