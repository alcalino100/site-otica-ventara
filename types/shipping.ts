export interface CityChip {
  id: string;
  name: string;
  sort_order: number;
}

export interface HighlightCard {
  id: string;
  title: string;
  subtitle: string;
  icon_type: "pin" | "shield" | "clock" | "truck";
  image_url?: string;
  is_active: boolean;
}

export interface NationalShipmentCard {
  id: string;
  title: string;
  description: string;
  delivery_time: string;
  badge?: string;
  icon_name: "mail" | "truck" | "plane";
  is_active: boolean;
}

export interface ShippingCarrier {
  id: string;
  name: string;
  slug: string;
  description: string;
  delivery_time: string;
  logo_url: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ShippingFaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ShippingTimelineStep {
  step_number: number;
  title: string;
  short_description: string;
  detail: string;
  icon_name?: string;
}

export interface ShippingPageSettings {
  id?: string;
  is_enabled: boolean;
  slug: string;

  // 1. Hero (Light Theme)
  hero_badge_text: string;
  hero_title_line1: string;
  hero_title_line2: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_url: string;
  hero_secondary_cta_text: string;
  hero_secondary_cta_url: string;
  hero_image_url: string;

  // 2. Highlight Cards (3 cards empilhados)
  show_highlight_cards: boolean;
  show_cargo_insurance: boolean;
  highlight_card_1_title: string;
  highlight_card_1_subtitle: string;
  highlight_card_2_title: string;
  highlight_card_2_subtitle: string;
  highlight_card_insurance_title: string;
  highlight_card_insurance_subtitle: string;
  highlight_card_3_title: string;
  highlight_card_3_subtitle: string;

  // 3. Bloco Regional (100% editável)
  regional_is_enabled: boolean;
  regional_badge_text: string;
  regional_title_part1: string;
  regional_title_part2: string;
  regional_description: string;
  regional_cities_heading: string;
  regional_cities: CityChip[];
  regional_image_url: string;
  regional_image_alt: string;
  regional_focal_point: string;
  regional_gradient_intensity: "strong" | "medium" | "subtle";
  regional_show_timeframe: boolean;
  regional_timeframe?: string;
  regional_show_conditions: boolean;
  regional_conditions?: string;

  // 4. Card de Prazo Estimado
  estimated_timeframe_is_enabled: boolean;
  estimated_timeframe_title: string;
  estimated_timeframe_text: string;

  // 5. Envio para todo o Brasil
  national_is_enabled: boolean;
  national_title: string;
  national_subtitle: string;
  national_tracking_note: string;
  national_cards: NationalShipmentCard[];

  // 6. Linha do Tempo, FAQ e CTA
  timeline_section_title: string;
  timeline_section_subtitle: string;
  faq_section_title: string;
  faq_section_subtitle: string;
  whatsapp_cta_title: string;
  whatsapp_cta_subtitle: string;

  // Aliases retrocompatíveis
  hero_title?: string;
  local_title?: string;
  local_description?: string;
  local_cities?: string;
  local_timeframe?: string;
  local_conditions?: string;
  local_image_url?: string;
  national_description?: string;
  national_timeframe?: string;
  national_conditions?: string;
  national_image_url?: string;
  carriers_section_title?: string;
  carriers_section_subtitle?: string;

  updated_at?: string;
}

export interface PaymentMethodItem {
  id: string;
  name: string;
  icon_path: string;
  is_active: boolean;
  sort_order: number;
  alt_text: string;
}

export interface FooterPaymentSettings {
  show_footer_block: boolean;
  show_secure_badge: boolean;
  secure_badge_text: string;
  block_title: string;
  methods: PaymentMethodItem[];
  updated_at?: string;
}

export interface FullShippingData {
  pageSettings: ShippingPageSettings;
  carriers: ShippingCarrier[];
  faqs: ShippingFaqItem[];
  timelineSteps: ShippingTimelineStep[];
}
