import {
  SiteIdentitySettings,
  SiteAppearanceSettings,
  LabShowcaseSettings,
  ShowcaseMediaSettings,
} from "@/types/ecommerce";

export const DEFAULT_IDENTITY: SiteIdentitySettings = {
  store_name: "Ótica Ventara",
  tagline: "Mais que óculos. Seu jeito de ver o mundo.",
  address_street: "Rua Princesa Isabel, 221",
  address_neighborhood: "Centro",
  address_city: "Araçatuba",
  address_state: "SP",
  address_postal_code: "16010-250",
  phone_whatsapp: "(18) 99615-5748",
  instagram_handle: "@oticaventara",
  facebook_url: "https://www.facebook.com/share/19mUxSqUnf/?mibextid=wwXIfr",
  business_hours: "Segunda a Sexta: 09h às 18h · Sábados: 09h às 13h",
  cnpj: "54.892.147/0001-30",
  logo_url: "",
  favicon_url: "",
};

export const DEFAULT_APPEARANCE: SiteAppearanceSettings = {
  color_navy: "#06111F",
  color_electric: "#0756B8",
  color_yellow: "#FFD62E",
  color_ice_white: "#F4F6FA",
};

export const DEFAULT_LAB_SHOWCASE: LabShowcaseSettings = {
  brandName: "OPTiSYNC HD",
  headline: "OPTiSYNC HD · Filtro Azul & Antirreflexo",
  badge: "VENTARA EXCLUSIVO",
  subtitle: "Montagem Expressa em até 1 Hora",
  description:
    "Cortadas e facetadas com precisão nanométrica em nossa biseladora computadorizada na Rua Princesa Isabel, 221. Proteção contra luz azul, antirreflexo de altíssima claridade e o melhor custo de fábrica, sem comissões ou repasses a intermediários.",
  boxImage: "/images/lenses/optisync-box.jpg",
  feature1: "Filtro Azul Incluso",
  feature2: "Antirreflexo Multicamadas",
  feature3: "Garantia de Fábrica",
  ctaText: "Pedir Orçamento OPTiSYNC",
  whatsappMessage:
    "Olá! Gostaria de um orçamento para as lentes exclusivas OPTiSYNC HD da Óticas Ventara.",
};

export const DEFAULT_SHOWCASE_MEDIA: ShowcaseMediaSettings = {
  heroMaleSolar: "/images/lifestyle/male-solar.jpg",
  heroFemaleSolar: "/images/lifestyle/female-solar.jpg",
  heroMaleGrau: "/images/lifestyle/male-grau.jpg",
  heroFemaleGrau: "/images/lifestyle/female-grau.jpg",
  warrantyBannerDesktop: "/images/banners/optisync-12-meses-garantia-desktop.jpg",
  warrantyBannerMobile: "/images/banners/optisync-12-meses-garantia-desktop.jpg",
};
