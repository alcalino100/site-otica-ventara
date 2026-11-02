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
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_url: string;
  local_title: string;
  local_description: string;
  local_cities: string;
  local_timeframe: string;
  local_conditions: string;
  local_image_url: string;
  national_title: string;
  national_description: string;
  national_timeframe?: string;
  national_conditions?: string;
  national_image_url: string;
  carriers_section_title: string;
  carriers_section_subtitle: string;
  timeline_section_title: string;
  timeline_section_subtitle: string;
  faq_section_title: string;
  faq_section_subtitle: string;
  whatsapp_cta_title: string;
  whatsapp_cta_subtitle: string;
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
