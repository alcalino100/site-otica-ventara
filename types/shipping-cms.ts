import { CityChip, NationalShipmentCard, ShippingCarrier, ShippingFaqItem, ShippingTimelineStep } from "./shipping";

export type CornerRadiusPreset = "none" | "subtle" | "medium" | "rounded";
export type ShadowIntensityPreset = "none" | "subtle" | "medium";
export type ThemePresetName = "offwhite_ventara" | "dark_ventara" | "custom";

export interface ShippingCmsTheme {
  preset_name: ThemePresetName;
  page_background: string;
  section_alt_background: string;
  surface_color: string;
  border_color: string;
  primary_text_color: string;
  secondary_text_color: string;
  accent_yellow: string;
  accent_amber_text: string;
  chip_background: string;
  regional_block_background: string;
  corner_radius: CornerRadiusPreset;
  shadow_intensity: ShadowIntensityPreset;
}

export interface ShippingCmsSeo {
  title: string;
  description: string;
  og_image_url: string;
  og_image_alt: string;
  slug: string;
  is_page_active: boolean;
}

export interface SectionHeroData {
  badge_text: string;
  title_line1: string;
  title_line2: string;
  subtitle: string;
  cta_text: string;
  cta_url: string;
  secondary_cta_text: string;
  secondary_cta_url: string;
  image_url: string;
  image_alt: string;
  image_mobile_url?: string;
  focal_point?: string;
}

export interface SectionHighlightCardsData {
  card1_title: string;
  card1_subtitle: string;
  card1_badge: string;
  card2_title: string;
  card2_subtitle: string;
  card2_badge: string;
  card3_title: string;
  card3_subtitle: string;
  card3_badge: string;
  show_cargo_insurance: boolean;
  insurance_title: string;
  insurance_subtitle: string;
}

export interface SectionRegionalDeliveryData {
  badge_text: string;
  title_part1: string;
  title_part2: string;
  description: string;
  cities_heading: string;
  cities: CityChip[];
  image_url: string;
  image_alt: string;
  image_mobile_url?: string;
  focal_point: string;
  gradient_intensity: "strong" | "medium" | "subtle";
  show_timeframe: boolean;
  timeframe?: string;
  show_conditions: boolean;
  conditions?: string;
}

export interface SectionEstimatedTimeframeData {
  title: string;
  text: string;
  href: string;
}

export interface SectionNationalDeliveryData {
  badge_text: string;
  title: string;
  subtitle: string;
  tracking_note: string;
  cards: NationalShipmentCard[];
}

export interface SectionCarriersGridData {
  badge_text: string;
  title: string;
  subtitle: string;
  disclaimer: string;
  carriers: ShippingCarrier[];
}

export interface SectionHowItWorksData {
  badge_text: string;
  title: string;
  subtitle: string;
  steps: ShippingTimelineStep[];
}

export interface SectionFaqData {
  badge_text: string;
  title: string;
  subtitle: string;
  faqs: ShippingFaqItem[];
}

export interface SectionWhatsAppCtaData {
  badge_text: string;
  title: string;
  subtitle: string;
  button_text: string;
  response_time_text: string;
  working_hours_text: string;
}

export type SectionType =
  | "hero"
  | "highlight_cards"
  | "regional_delivery"
  | "estimated_timeframe"
  | "national_delivery"
  | "carriers_grid"
  | "how_it_works"
  | "faq"
  | "whatsapp_cta";

export interface ShippingCmsSection<T = any> {
  id: string;
  section_type: SectionType;
  title_admin: string;
  is_active: boolean;
  sort_order: number;
  custom_background?: string;
  data: T;
}

export interface ShippingCmsDocument {
  id?: string;
  status: "draft" | "published";
  schema_version: number;
  theme: ShippingCmsTheme;
  seo: ShippingCmsSeo;
  sections: ShippingCmsSection[];
  audit?: {
    updated_at: string;
    updated_by: string;
    version_label?: string;
  };
}

export interface ShippingCmsHistoryRecord {
  id: string;
  published_at: string;
  published_by: string | null;
  version_label: string | null;
  schema_version: number;
  sections: ShippingCmsSection[];
  theme: ShippingCmsTheme;
  seo: ShippingCmsSeo;
  change_summary: string | null;
}
