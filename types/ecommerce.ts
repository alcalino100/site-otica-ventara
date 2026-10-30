export type FrameType = "Grau" | "Solar" | "Clip-on";

export type FrameShape =
  | "Quadrado"
  | "Redondo"
  | "Retangular"
  | "Gatinho"
  | "Aviador"
  | "Hexagonal"
  | "Oval"
  | "Outro";

export type FrameMaterial =
  | "Acetato Premium"
  | "Metal Titânio"
  | "Injetado"
  | "Madeira / Misto"
  | "Outro";

export type FrameGender = "Unissex" | "Feminino" | "Masculino" | "Infantil";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  color_name: string;
  color_hex: string | null;
  size: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  brand_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price_in_cents: number;
  compare_at_price_in_cents: number | null;
  is_published: boolean;
  is_featured: boolean;
  frame_type: FrameType;
  frame_shape: FrameShape | null;
  frame_material: FrameMaterial | null;
  gender: FrameGender;
  dimensions_lens_mm: number | null;
  dimensions_bridge_mm: number | null;
  dimensions_temple_mm: number | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  category?: Category | null;
  brand?: Brand | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export type OrderStatus =
  | "pending"
  | "awaiting_payment"
  | "paid"
  | "preparing"
  | "ready_for_pickup"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface Order {
  id: string;
  reference_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_document: string | null;
  shipping_address: ShippingAddress | null;
  subtotal_in_cents: number;
  shipping_fee_in_cents: number;
  discount_in_cents: number;
  total_in_cents: number;
  status: OrderStatus;
  payment_method: string | null;
  payment_gateway_id: string | null;
  tracking_number?: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  sku: string;
  color_name: string | null;
  unit_price_in_cents: number;
  quantity: number;
  total_price_in_cents: number;
  created_at: string;
}

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: "super_admin" | "admin" | "editor";
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  key: string;
  value: Record<string, unknown>;
  description?: string | null;
  updated_at: string;
}

export interface SiteIdentitySettings {
  store_name: string;
  tagline: string;
  address_street: string;
  address_neighborhood: string;
  address_city: string;
  address_state: string;
  address_postal_code: string;
  phone_whatsapp: string;
  instagram_handle: string;
  facebook_url?: string;
  business_hours: string;
  cnpj?: string;
  logo_url?: string;
  favicon_url?: string;
}

export interface SiteAppearanceSettings {
  color_navy: string;
  color_electric: string;
  color_yellow: string;
  color_ice_white: string;
}

export interface SiteShippingSettings {
  store_pickup_enabled: boolean;
  free_shipping_threshold_cents: number;
  default_shipping_fee_cents: number;
  pickup_address: string;
}

export interface LabShowcaseSettings {
  brandName: string;
  headline: string;
  badge: string;
  subtitle: string;
  description: string;
  boxImage: string;
  feature1: string;
  feature2: string;
  feature3: string;
  ctaText: string;
  whatsappMessage: string;
}

export interface ShowcaseMediaSettings {
  heroMaleSolar: string;
  heroFemaleSolar: string;
  heroMaleGrau: string;
  heroFemaleGrau: string;
  warrantyBannerDesktop: string;
  warrantyBannerMobile: string;
}

export interface HomepageBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  image_url_desktop: string;
  image_url_mobile?: string | null;
  alt_text: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type InventoryMovementType = "in" | "out" | "adjustment" | "order_fulfillment";

export interface InventoryMovement {
  id: string;
  product_id: string;
  variant_id: string;
  movement_type: InventoryMovementType;
  quantity: number;
  balance_after: number;
  reason?: string | null;
  created_by?: string | null;
  created_at: string;
  product?: Product | null;
  variant?: ProductVariant | null;
}

export interface HomologatedBrand {
  id: string;
  name: string;
  logo: string;
  boxImage: string;
  badge: string;
  desc: string;
  isActive?: boolean;
}

export interface PromoProductItem {
  id: string;
  name: string;
  category: string;
  tag: string;
  discountBadge: string;
  originalPrice: string;
  promotionalPrice: string;
  installment: string;
  image: string;
  imageFit?: "cover" | "contain";
  colorName: string;
  colorHex: string;
  slug: string;
  description?: string;
  extraColorsCount?: number;
}

export interface PromotionalShowcaseSettings {
  isEnabled: boolean;
  pillText: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  items: PromoProductItem[];
}

export interface PartnerLogoItem {
  id: string;
  name: string;
  src: string;
  alt: string;
}

export interface LensesSectionSettings {
  sectionTitle: string;
  sectionSubtitle: string;
  badgeTag: string;
  badgeSubtitle: string;
  graphicImageUrl?: string | null;
  useCustomGraphic: boolean;
  ribbonTag: string;
  ribbonSubtitle: string;
  partnerLogos: PartnerLogoItem[];
  ribbonSpeedSeconds?: number;
}

export interface HeroBannerSettings {
  mode: "fixed_banner" | "carousel_3d";
  bannerImageUrl: string;
  layoutStyle?: "full_bleed" | "card_box";
  desktopWidth?: "natural_55" | "wide_65" | "full_100";
  desktopZoom?: number; // 60 to 150
  mobileLayout?: "below_text" | "background";
  backgroundPosition?: string;
  customPositionX?: number; // 0 to 100
  customPositionY?: number; // 0 to 100
  bannerOpacity?: number; // 0 to 100
  gradientDirection: "to-left" | "to-right" | "radial" | "to-bottom";
  gradientColor: string;
  gradientIntensity: number; // 0 to 100
  badgeTag: string;
  badgeSubtitle?: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

export interface ShowcaseVariationItem {
  id: string;
  name: string;
  finish: string;
  colorHex: string;
  lensColor?: string;
  frameColor?: string;
  priceInCents: number;
  sku: string;
  slug: string;
  imageUrl?: string;
  isAmber?: boolean;
  isRound?: boolean;
}

export interface ShowcaseModeSettings {
  category: "solar" | "grau";
  gender: "masculino" | "feminino";
  categoryBadge: string;
  categorySubtitle: string;
  heroCategoryTags: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  sectionTag: string;
  productHeadline: string;
  productDescription: string;
  lifestyleImage: string;
  lifestyleAlt: string;
  featuredProductName: string;
  featuredProductSlug: string;
  variations: ShowcaseVariationItem[];
}

export type InteractiveShowcaseSettings = Record<string, ShowcaseModeSettings>;

export interface LiveBroadcastSettings {
  enabled: boolean;
  title: string;
  platform: "instagram" | "tiktok" | "youtube" | "facebook" | "custom";
  live_url: string;
  label?: string;
  call_to_action?: string;
}
