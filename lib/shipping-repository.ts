import { createAdminClient } from "./supabase/admin";
import { createStaticSupabaseClient } from "./supabase/server";
import {
  ShippingCarrier,
  ShippingFaqItem,
  ShippingPageSettings,
  FooterPaymentSettings,
  FullShippingData,
  CityChip,
} from "@/types/shipping";
import {
  DEFAULT_SHIPPING_PAGE_SETTINGS,
  DEFAULT_SHIPPING_CARRIERS,
  DEFAULT_SHIPPING_FAQS,
  DEFAULT_SHIPPING_TIMELINE,
  DEFAULT_FOOTER_PAYMENT_SETTINGS,
  DEFAULT_CITY_CHIPS,
  DEFAULT_NATIONAL_CARDS,
} from "./shipping-constants";

// Cache em memória para resiliência e suporte a testes locais
let inMemoryShippingSettings: ShippingPageSettings = { ...DEFAULT_SHIPPING_PAGE_SETTINGS };
let inMemoryCarriers: ShippingCarrier[] = [...DEFAULT_SHIPPING_CARRIERS];
let inMemoryFaqs: ShippingFaqItem[] = [...DEFAULT_SHIPPING_FAQS];
let inMemoryPaymentSettings: FooterPaymentSettings = { ...DEFAULT_FOOTER_PAYMENT_SETTINGS };

function normalizeShippingPageSettings(raw: Partial<ShippingPageSettings> | null | undefined): ShippingPageSettings {
  if (!raw) return { ...DEFAULT_SHIPPING_PAGE_SETTINGS };

  // Garante que regional_cities seja sempre uma lista válida de chips
  let regionalCities: CityChip[] = DEFAULT_CITY_CHIPS;
  if (Array.isArray(raw.regional_cities) && raw.regional_cities.length > 0) {
    regionalCities = raw.regional_cities;
  } else if (typeof raw.local_cities === "string" && raw.local_cities.trim()) {
    regionalCities = raw.local_cities
      .split(",")
      .map((c, i) => ({ id: `city-migrated-${i}`, name: c.trim(), sort_order: i + 1 }))
      .filter((c) => Boolean(c.name));
  }

  return {
    ...DEFAULT_SHIPPING_PAGE_SETTINGS,
    ...raw,
    hero_badge_text: raw.hero_badge_text || DEFAULT_SHIPPING_PAGE_SETTINGS.hero_badge_text,
    hero_title_line1: raw.hero_title_line1 || DEFAULT_SHIPPING_PAGE_SETTINGS.hero_title_line1,
    hero_title_line2: raw.hero_title_line2 || DEFAULT_SHIPPING_PAGE_SETTINGS.hero_title_line2,
    hero_subtitle: raw.hero_subtitle || DEFAULT_SHIPPING_PAGE_SETTINGS.hero_subtitle,
    hero_cta_text: raw.hero_cta_text || DEFAULT_SHIPPING_PAGE_SETTINGS.hero_cta_text,
    hero_cta_url: raw.hero_cta_url || DEFAULT_SHIPPING_PAGE_SETTINGS.hero_cta_url,
    hero_secondary_cta_text: raw.hero_secondary_cta_text || DEFAULT_SHIPPING_PAGE_SETTINGS.hero_secondary_cta_text,
    hero_secondary_cta_url: raw.hero_secondary_cta_url || DEFAULT_SHIPPING_PAGE_SETTINGS.hero_secondary_cta_url,
    hero_image_url: raw.hero_image_url || DEFAULT_SHIPPING_PAGE_SETTINGS.hero_image_url,
    regional_cities: regionalCities,
    national_cards: Array.isArray(raw.national_cards) && raw.national_cards.length > 0
      ? raw.national_cards.map((card, idx) => ({
          ...(DEFAULT_NATIONAL_CARDS[idx] || {}),
          ...card,
        }))
      : DEFAULT_NATIONAL_CARDS,
  };
}

export async function getShippingData(): Promise<FullShippingData> {
  try {
    const supabase = createStaticSupabaseClient();

    // 1. Busca configurações da página
    let pageSettings: ShippingPageSettings = { ...inMemoryShippingSettings };
    try {
      const { data: pageRow, error: pageErr } = await supabase
        .from("shipping_page_settings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!pageErr && pageRow) {
        pageSettings = normalizeShippingPageSettings(pageRow);
        inMemoryShippingSettings = pageSettings;
      } else {
        // Tenta fallback em site_settings
        const { data: fallbackRow } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "shipping_page")
          .maybeSingle();

        if (fallbackRow?.value) {
          pageSettings = normalizeShippingPageSettings(fallbackRow.value);
          inMemoryShippingSettings = pageSettings;
        }
      }
    } catch {
      // Ignora erro e usa inMemory
    }

    // 2. Busca transportadoras
    let carriers: ShippingCarrier[] = [...inMemoryCarriers];
    try {
      const { data: carriersRows, error: carriersErr } = await supabase
        .from("shipping_carriers")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!carriersErr && carriersRows && carriersRows.length > 0) {
        carriers = carriersRows;
        inMemoryCarriers = carriers;
      } else {
        // Tenta fallback em site_settings
        const { data: fallbackCarriers } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "shipping_carriers")
          .maybeSingle();

        if (fallbackCarriers?.value && Array.isArray(fallbackCarriers.value)) {
          carriers = fallbackCarriers.value;
          inMemoryCarriers = carriers;
        }
      }
    } catch {
      // Ignora erro e usa inMemory
    }

    // 3. Busca FAQs
    let faqs: ShippingFaqItem[] = [...inMemoryFaqs];
    try {
      const { data: faqsRows, error: faqsErr } = await supabase
        .from("shipping_faqs")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!faqsErr && faqsRows && faqsRows.length > 0) {
        faqs = faqsRows;
        inMemoryFaqs = faqs;
      } else {
        // Tenta fallback em site_settings
        const { data: fallbackFaqs } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "shipping_faqs")
          .maybeSingle();

        if (fallbackFaqs?.value && Array.isArray(fallbackFaqs.value)) {
          faqs = fallbackFaqs.value;
          inMemoryFaqs = faqs;
        }
      }
    } catch {
      // Ignora erro e usa inMemory
    }

    return {
      pageSettings,
      carriers,
      faqs,
      timelineSteps: DEFAULT_SHIPPING_TIMELINE,
    };
  } catch (err) {
    console.warn("Erro ao buscar dados de envio, usando defaults:", err);
    return {
      pageSettings: inMemoryShippingSettings,
      carriers: inMemoryCarriers,
      faqs: inMemoryFaqs,
      timelineSteps: DEFAULT_SHIPPING_TIMELINE,
    };
  }
}

export async function saveShippingPageSettings(settings: Partial<ShippingPageSettings>) {
  inMemoryShippingSettings = normalizeShippingPageSettings({ ...inMemoryShippingSettings, ...settings });
  try {
    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();

    // 1. Tenta atualizar ou inserir em shipping_page_settings
    try {
      const { data: existing } = await adminSupabase
        .from("shipping_page_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        await adminSupabase
          .from("shipping_page_settings")
          .update({ ...settings, updated_at: now })
          .eq("id", existing.id);
      } else {
        await adminSupabase
          .from("shipping_page_settings")
          .insert({ ...DEFAULT_SHIPPING_PAGE_SETTINGS, ...settings, updated_at: now });
      }
    } catch (e) {
      console.warn("Tabela shipping_page_settings não disponível, persistindo em site_settings:", e);
    }

    // 2. Sempre persiste também em site_settings (chave shipping_page) para resiliência máxima
    try {
      const { data: siteRow } = await adminSupabase
        .from("site_settings")
        .select("id")
        .eq("key", "shipping_page")
        .maybeSingle();

      if (siteRow?.id) {
        await adminSupabase
          .from("site_settings")
          .update({ value: inMemoryShippingSettings, updated_at: now })
          .eq("id", siteRow.id);
      } else {
        await adminSupabase.from("site_settings").insert({
          key: "shipping_page",
          description: "Configurações da Página Pública de Entregas",
          value: inMemoryShippingSettings,
          updated_at: now,
        });
      }
    } catch (e) {
      console.warn("Falha ao gravar em site_settings (shipping_page):", e);
    }
  } catch (err) {
    console.error("Erro ao salvar configurações da página de envio:", err);
  }
  return inMemoryShippingSettings;
}

export async function saveShippingCarriers(carriers: ShippingCarrier[]) {
  inMemoryCarriers = carriers;
  try {
    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();

    // 1. Tenta atualizar na tabela shipping_carriers
    try {
      await adminSupabase.from("shipping_carriers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (carriers.length > 0) {
        const rowsToInsert = carriers.map((c, idx) => ({
          name: c.name,
          slug: c.slug || `carrier-${idx}`,
          description: c.description || "",
          delivery_time: c.delivery_time || "",
          logo_url: c.logo_url || "",
          is_active: c.is_active !== false,
          sort_order: c.sort_order ?? idx + 1,
          updated_at: now,
        }));
        await adminSupabase.from("shipping_carriers").insert(rowsToInsert);
      }
    } catch (e) {
      console.warn("Tabela shipping_carriers não disponível, persistindo em site_settings:", e);
    }

    // 2. Sincroniza em site_settings
    try {
      const { data: siteRow } = await adminSupabase
        .from("site_settings")
        .select("id")
        .eq("key", "shipping_carriers")
        .maybeSingle();

      if (siteRow?.id) {
        await adminSupabase
          .from("site_settings")
          .update({ value: carriers, updated_at: now })
          .eq("id", siteRow.id);
      } else {
        await adminSupabase.from("site_settings").insert({
          key: "shipping_carriers",
          description: "Transportadoras cadastradas na página de entregas",
          value: carriers,
          updated_at: now,
        });
      }
    } catch (e) {
      console.warn("Falha ao gravar carriers em site_settings:", e);
    }
  } catch (err) {
    console.error("Erro ao salvar transportadoras:", err);
  }
  return inMemoryCarriers;
}

export async function saveShippingFaqs(faqs: ShippingFaqItem[]) {
  inMemoryFaqs = faqs;
  try {
    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();

    try {
      await adminSupabase.from("shipping_faqs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (faqs.length > 0) {
        const rowsToInsert = faqs.map((f, idx) => ({
          question: f.question,
          answer: f.answer,
          category: f.category || "geral",
          is_active: f.is_active !== false,
          sort_order: f.sort_order ?? idx + 1,
          updated_at: now,
        }));
        await adminSupabase.from("shipping_faqs").insert(rowsToInsert);
      }
    } catch (e) {
      console.warn("Tabela shipping_faqs não disponível, persistindo em site_settings:", e);
    }

    try {
      const { data: siteRow } = await adminSupabase
        .from("site_settings")
        .select("id")
        .eq("key", "shipping_faqs")
        .maybeSingle();

      if (siteRow?.id) {
        await adminSupabase
          .from("site_settings")
          .update({ value: faqs, updated_at: now })
          .eq("id", siteRow.id);
      } else {
        await adminSupabase.from("site_settings").insert({
          key: "shipping_faqs",
          description: "Perguntas frequentes cadastradas na página de entregas",
          value: faqs,
          updated_at: now,
        });
      }
    } catch (e) {
      console.warn("Falha ao gravar faqs em site_settings:", e);
    }
  } catch (err) {
    console.error("Erro ao salvar FAQs:", err);
  }
  return inMemoryFaqs;
}

export async function getFooterPaymentSettings(): Promise<FooterPaymentSettings> {
  try {
    const supabase = createStaticSupabaseClient();
    const { data: row, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "payment_methods")
      .maybeSingle();

    if (!error && row?.value) {
      inMemoryPaymentSettings = { ...DEFAULT_FOOTER_PAYMENT_SETTINGS, ...row.value };
      return inMemoryPaymentSettings;
    }
  } catch {
    // Falha silenciosa, usa inMemory
  }
  return inMemoryPaymentSettings;
}

export async function saveFooterPaymentSettings(settings: Partial<FooterPaymentSettings>) {
  inMemoryPaymentSettings = { ...inMemoryPaymentSettings, ...settings };
  try {
    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();

    const { data: existing } = await adminSupabase
      .from("site_settings")
      .select("id")
      .eq("key", "payment_methods")
      .maybeSingle();

    if (existing?.id) {
      await adminSupabase
        .from("site_settings")
        .update({ value: inMemoryPaymentSettings, updated_at: now })
        .eq("id", existing.id);
    } else {
      await adminSupabase.from("site_settings").insert({
        key: "payment_methods",
        description: "Configurações das formas de pagamento e selos exibidos no rodapé",
        value: inMemoryPaymentSettings,
        updated_at: now,
      });
    }
  } catch (err) {
    console.error("Erro ao salvar formas de pagamento do rodapé:", err);
  }
  return inMemoryPaymentSettings;
}
