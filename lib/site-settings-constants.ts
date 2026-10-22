import { SiteIdentitySettings, SiteAppearanceSettings } from "@/types/ecommerce";

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
  business_hours: "Segunda a Sexta: 09h às 18h · Sábados: 09h às 13h",
  logo_url: "",
  favicon_url: "",
};

export const DEFAULT_APPEARANCE: SiteAppearanceSettings = {
  color_navy: "#06111F",
  color_electric: "#0756B8",
  color_yellow: "#FFD62E",
  color_ice_white: "#F4F6FA",
};
