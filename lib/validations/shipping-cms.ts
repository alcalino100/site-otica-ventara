import { z } from "zod";

// Validador de cor em formato Hex (#RGB, #RRGGBB, #RRGGBBAA)
const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const safeColorSchema = z.string().regex(hexColorRegex, {
  message: "Cor deve ser um valor hexadecimal válido (ex: #06111F ou #FFD62E).",
});

// Validador de link seguro (apenas https, relativo ou wa.me)
const safeUrlSchema = z.string().refine(
  (url) => {
    if (!url) return true;
    if (url.startsWith("/")) return true;
    if (url.startsWith("#")) return true;
    if (url.startsWith("https://wa.me/")) return true;
    if (url.startsWith("https://")) return true;
    return false;
  },
  { message: "Links devem ser seguros (https://), relativos (/rota) ou wa.me." }
);

// Validador de texto puro sem tags HTML maliciosas
const cleanTextSchema = (maxLen: number) =>
  z
    .string()
    .max(maxLen, { message: `Máximo de ${maxLen} caracteres permitidos.` })
    .refine((val) => !/<script|javascript:|onload=|onerror=/i.test(val), {
      message: "Tags HTML ou scripts não são permitidos.",
    });

export const ShippingCmsThemeSchema = z.object({
  preset_name: z.enum(["offwhite_ventara", "dark_ventara", "custom"]),
  page_background: safeColorSchema,
  section_alt_background: safeColorSchema,
  surface_color: safeColorSchema,
  border_color: z.string(), // pode ser hex ou rgba simples
  primary_text_color: safeColorSchema,
  secondary_text_color: safeColorSchema,
  accent_yellow: safeColorSchema,
  accent_amber_text: safeColorSchema,
  chip_background: z.string(),
  regional_block_background: safeColorSchema,
  corner_radius: z.enum(["none", "subtle", "medium", "rounded"]),
  shadow_intensity: z.enum(["none", "subtle", "medium"]),
});

export const ShippingCmsSeoSchema = z.object({
  title: cleanTextSchema(70).min(5, "Título de SEO deve ter pelo menos 5 caracteres."),
  description: cleanTextSchema(160).min(10, "Descrição deve ter pelo menos 10 caracteres."),
  og_image_url: z.string().min(1, "Imagem Open Graph é obrigatória."),
  og_image_alt: cleanTextSchema(100).min(3, "Texto alternativo da imagem é obrigatório."),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens.")
    .default("entregas"),
  is_page_active: z.boolean().default(true),
});

export const SectionHeroSchema = z.object({
  badge_text: cleanTextSchema(60),
  title_line1: cleanTextSchema(60),
  title_line2: cleanTextSchema(60),
  subtitle: cleanTextSchema(200),
  cta_text: cleanTextSchema(40),
  cta_url: safeUrlSchema,
  secondary_cta_text: cleanTextSchema(40),
  secondary_cta_url: safeUrlSchema,
  image_url: z.string().min(1, "Foto do Hero é obrigatória."),
  image_alt: cleanTextSchema(120).min(3, "Texto alternativo da foto do Hero é obrigatório."),
  image_mobile_url: z.string().optional(),
  focal_point: z.string().optional(),
});

export const SectionHighlightCardsSchema = z.object({
  card1_title: cleanTextSchema(50),
  card1_subtitle: cleanTextSchema(100),
  card1_badge: cleanTextSchema(10),
  card2_title: cleanTextSchema(50),
  card2_subtitle: cleanTextSchema(100),
  card2_badge: cleanTextSchema(10),
  card3_title: cleanTextSchema(50),
  card3_subtitle: cleanTextSchema(100),
  card3_badge: cleanTextSchema(10),
  show_cargo_insurance: z.boolean().default(false),
  insurance_title: cleanTextSchema(50),
  insurance_subtitle: cleanTextSchema(100),
});

export const SectionRegionalDeliverySchema = z.object({
  badge_text: cleanTextSchema(60),
  title_part1: cleanTextSchema(50),
  title_part2: cleanTextSchema(50),
  description: cleanTextSchema(400),
  cities_heading: cleanTextSchema(60),
  cities: z.array(
    z.object({
      id: z.string(),
      name: cleanTextSchema(50),
      sort_order: z.number().int(),
    })
  ),
  image_url: z.string().min(1, "Foto da Van de Entrega é obrigatória."),
  image_alt: cleanTextSchema(120).min(3, "Texto alternativo é obrigatório."),
  image_mobile_url: z.string().optional(),
  focal_point: z.string().default("center right"),
  gradient_intensity: z.enum(["strong", "medium", "subtle"]).default("strong"),
  show_timeframe: z.boolean().default(false),
  timeframe: cleanTextSchema(150).optional(),
  show_conditions: z.boolean().default(false),
  conditions: cleanTextSchema(150).optional(),
});

export const SectionEstimatedTimeframeSchema = z.object({
  title: cleanTextSchema(50),
  text: cleanTextSchema(200),
  href: safeUrlSchema.default("/catalogo"),
});

export const SectionNationalDeliverySchema = z.object({
  badge_text: cleanTextSchema(60),
  title: cleanTextSchema(60),
  subtitle: cleanTextSchema(200),
  tracking_note: cleanTextSchema(200),
  cards: z.array(
    z.object({
      id: z.string(),
      title: cleanTextSchema(60),
      description: cleanTextSchema(250),
      delivery_time: cleanTextSchema(80),
      badge: cleanTextSchema(30).optional(),
      icon_name: z.enum(["mail", "truck", "plane"]),
      image_url: z.string().optional(),
      image_alt: cleanTextSchema(120).optional(),
      image_position: z.enum(["center", "top", "bottom", "left", "right"]).optional(),
      image_overlay: z.enum(["subtle", "medium", "strong"]).optional(),
      image_caption: cleanTextSchema(50).optional(),
      show_image: z.boolean().optional(),
      is_active: z.boolean().default(true),
    })
  ),
});

export const SectionCarriersGridSchema = z.object({
  badge_text: cleanTextSchema(60),
  title: cleanTextSchema(60),
  subtitle: cleanTextSchema(200),
  disclaimer: cleanTextSchema(400),
  carriers: z.array(
    z.object({
      id: z.string(),
      name: cleanTextSchema(60),
      slug: z.string(),
      description: cleanTextSchema(200),
      delivery_time: cleanTextSchema(80),
      logo_url: z.string(),
      is_active: z.boolean(),
      sort_order: z.number().int(),
    })
  ),
});

export const SectionHowItWorksSchema = z.object({
  badge_text: cleanTextSchema(60),
  title: cleanTextSchema(60),
  subtitle: cleanTextSchema(200),
  steps: z.array(
    z.object({
      step_number: z.number().int(),
      title: cleanTextSchema(60),
      short_description: cleanTextSchema(100),
      detail: cleanTextSchema(300),
      icon_name: z.string().optional(),
    })
  ),
});

export const SectionFaqSchema = z.object({
  badge_text: cleanTextSchema(60),
  title: cleanTextSchema(60),
  subtitle: cleanTextSchema(200),
  faqs: z.array(
    z.object({
      id: z.string(),
      question: cleanTextSchema(150),
      answer: cleanTextSchema(600),
      category: z.string().optional(),
      is_active: z.boolean(),
      sort_order: z.number().int(),
    })
  ),
});

export const SectionWhatsAppCtaSchema = z.object({
  badge_text: cleanTextSchema(60),
  title: cleanTextSchema(80),
  subtitle: cleanTextSchema(200),
  button_text: cleanTextSchema(40),
  response_time_text: cleanTextSchema(60),
  working_hours_text: cleanTextSchema(60),
});

export const ShippingCmsSectionSchema = z.object({
  id: z.string(),
  section_type: z.enum([
    "hero",
    "highlight_cards",
    "regional_delivery",
    "estimated_timeframe",
    "national_delivery",
    "carriers_grid",
    "how_it_works",
    "faq",
    "whatsapp_cta",
  ]),
  title_admin: z.string(),
  is_active: z.boolean(),
  sort_order: z.number().int(),
  custom_background: z.string().optional(),
  data: z.record(z.string(), z.any()),
});

export const ShippingCmsDocumentSchema = z.object({
  id: z.string().optional(),
  status: z.enum(["draft", "published"]),
  schema_version: z.number().int().default(1),
  theme: ShippingCmsThemeSchema,
  seo: ShippingCmsSeoSchema,
  sections: z.array(ShippingCmsSectionSchema),
  audit: z
    .object({
      updated_at: z.string(),
      updated_by: z.string(),
      version_label: z.string().optional(),
    })
    .optional(),
});
