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
