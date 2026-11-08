import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import {
  SiteIdentitySettings,
  SiteAppearanceSettings,
  LabShowcaseSettings,
  ShowcaseMediaSettings,
  HomologatedBrand,
  PromotionalShowcaseSettings,
  LensesSectionSettings,
  HeroBannerSettings,
  LiveBroadcastSettings,
  ArmacoesPageSettings,
  OptiSyncPageSettings,
} from "@/types/ecommerce";
import {
  DEFAULT_IDENTITY,
  DEFAULT_APPEARANCE,
  DEFAULT_LAB_SHOWCASE,
  DEFAULT_SHOWCASE_MEDIA,
  DEFAULT_HOMOLOGATED_BRANDS,
  DEFAULT_PROMOTIONAL_SHOWCASE,
  DEFAULT_LENSES_SECTION_SETTINGS,
  DEFAULT_HERO_BANNER,
  DEFAULT_LIVE_BROADCAST,
  DEFAULT_FOOTER_PAYMENT_SETTINGS,
  DEFAULT_ARMACOES_PAGE_SETTINGS,
  DEFAULT_OPTISYNC_SETTINGS,
  IN_MEMORY_SITE_SETTINGS,
} from "@/lib/site-settings-constants";

export async function GET() {
  try {
    let data: any[] | null = null;
    if (isSupabaseConfigured()) {
      const adminSupabase = createAdminClient();
      const res = await adminSupabase
        .from("site_settings")
        .select("key, value")
        .in("key", [
          "identity",
          "appearance",
          "shipping",
          "lab_showcase",
          "showcase_media",
          "homologated_brands",
          "promotional_showcase",
          "lenses_section",
          "hero_banner",
          "interactive_showcase",
          "company_settings",
          "live_broadcast",
          "payment_methods",
          "armacoes_page_settings",
          "optisync_page_settings",
        ]);
      data = res.data;
    }

    const getVal = (key: string) => {
      const row = data?.find((s) => s.key === key);
      let val = row ? row.value : IN_MEMORY_SITE_SETTINGS[key];
      if (typeof val === "string") {
        try {
          val = JSON.parse(val);
        } catch {}
      }
      return val;
    };

    const identityVal = getVal("identity");
    const appearanceVal = getVal("appearance");
    const shippingVal = getVal("shipping");
    const labVal = getVal("lab_showcase");
    const showcaseVal = getVal("showcase_media");
    const brandsVal = getVal("homologated_brands");
    const promoVal = getVal("promotional_showcase");
    const lensesSectionVal = getVal("lenses_section");
    const heroBannerVal = getVal("hero_banner");
    const interactiveShowcaseVal = getVal("interactive_showcase");
    const companySettingsVal = getVal("company_settings");
    const liveBroadcastVal = getVal("live_broadcast");
    const paymentMethodsVal = getVal("payment_methods");
    const armacoesSettingsVal = getVal("armacoes_page_settings");
    const optisyncSettingsVal = getVal("optisync_page_settings");

    return NextResponse.json(
      {
        identity: identityVal ? { ...DEFAULT_IDENTITY, ...(identityVal as SiteIdentitySettings) } : DEFAULT_IDENTITY,
        appearance: appearanceVal ? { ...DEFAULT_APPEARANCE, ...(appearanceVal as SiteAppearanceSettings) } : DEFAULT_APPEARANCE,
        shipping: shippingVal || null,
        lab_showcase: labVal ? { ...DEFAULT_LAB_SHOWCASE, ...(labVal as LabShowcaseSettings) } : DEFAULT_LAB_SHOWCASE,
        showcase_media: showcaseVal ? { ...DEFAULT_SHOWCASE_MEDIA, ...(showcaseVal as ShowcaseMediaSettings) } : DEFAULT_SHOWCASE_MEDIA,
        homologated_brands: brandsVal ? (brandsVal as HomologatedBrand[]) : DEFAULT_HOMOLOGATED_BRANDS,
        promotional_showcase: promoVal ? { ...DEFAULT_PROMOTIONAL_SHOWCASE, ...(promoVal as PromotionalShowcaseSettings) } : DEFAULT_PROMOTIONAL_SHOWCASE,
        lenses_section: lensesSectionVal ? { ...DEFAULT_LENSES_SECTION_SETTINGS, ...(lensesSectionVal as LensesSectionSettings) } : DEFAULT_LENSES_SECTION_SETTINGS,
        hero_banner: heroBannerVal ? { ...DEFAULT_HERO_BANNER, ...(heroBannerVal as HeroBannerSettings) } : DEFAULT_HERO_BANNER,
        interactive_showcase: interactiveShowcaseVal || null,
        company_settings: companySettingsVal || null,
        live_broadcast: liveBroadcastVal ? { ...DEFAULT_LIVE_BROADCAST, ...(liveBroadcastVal as LiveBroadcastSettings) } : DEFAULT_LIVE_BROADCAST,
        payment_methods: paymentMethodsVal ? { ...DEFAULT_FOOTER_PAYMENT_SETTINGS, ...paymentMethodsVal } : DEFAULT_FOOTER_PAYMENT_SETTINGS,
        armacoes_page_settings: armacoesSettingsVal
          ? { ...DEFAULT_ARMACOES_PAGE_SETTINGS, ...(armacoesSettingsVal as ArmacoesPageSettings) }
          : DEFAULT_ARMACOES_PAGE_SETTINGS,
        optisync_page_settings: optisyncSettingsVal
          ? {
              ...DEFAULT_OPTISYNC_SETTINGS,
              ...(optisyncSettingsVal as OptiSyncPageSettings),
              hdLine: {
                ...DEFAULT_OPTISYNC_SETTINGS.hdLine,
                ...((optisyncSettingsVal as any).hdLine || {}),
              },
              photochromicLine: {
                ...DEFAULT_OPTISYNC_SETTINGS.photochromicLine,
                ...((optisyncSettingsVal as any).photochromicLine || {}),
              },
              kidsLine: {
                ...DEFAULT_OPTISYNC_SETTINGS.kidsLine,
                ...((optisyncSettingsVal as any).kidsLine || {}),
              },
              galleryItems:
                (optisyncSettingsVal as any).galleryItems && (optisyncSettingsVal as any).galleryItems.length > 0
                  ? (optisyncSettingsVal as any).galleryItems
                  : DEFAULT_OPTISYNC_SETTINGS.galleryItems,
            }
          : DEFAULT_OPTISYNC_SETTINGS,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("Erro interno ao buscar configurações:", err);
    return NextResponse.json({
      identity: DEFAULT_IDENTITY,
      appearance: DEFAULT_APPEARANCE,
      lab_showcase: DEFAULT_LAB_SHOWCASE,
      showcase_media: DEFAULT_SHOWCASE_MEDIA,
      homologated_brands: IN_MEMORY_SITE_SETTINGS["homologated_brands"] || DEFAULT_HOMOLOGATED_BRANDS,
      promotional_showcase: DEFAULT_PROMOTIONAL_SHOWCASE,
      lenses_section: IN_MEMORY_SITE_SETTINGS["lenses_section"] || DEFAULT_LENSES_SECTION_SETTINGS,
      hero_banner: DEFAULT_HERO_BANNER,
      live_broadcast: DEFAULT_LIVE_BROADCAST,
      payment_methods: DEFAULT_FOOTER_PAYMENT_SETTINGS,
      armacoes_page_settings: IN_MEMORY_SITE_SETTINGS["armacoes_page_settings"] || DEFAULT_ARMACOES_PAGE_SETTINGS,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const adminSupabase = createAdminClient();
    const now = new Date().toISOString();

    async function saveSetting(key: string, description: string, value: any) {
      IN_MEMORY_SITE_SETTINGS[key] = value;

      if (!isSupabaseConfigured()) {
        return;
      }

      const { error: upsertError } = await adminSupabase
        .from("site_settings")
        .upsert(
          {
            key,
            description,
            value,
            updated_at: now,
          },
          { onConflict: "key" }
        );

      if (upsertError) {
        console.warn(`Aviso no upsert de ${key}, tentando update/insert fallback:`, upsertError.message);
        const { data: existing } = await adminSupabase
          .from("site_settings")
          .select("id")
          .eq("key", key)
          .maybeSingle();

        if (existing?.id) {
          const { error: updateError } = await adminSupabase
            .from("site_settings")
            .update({
              value,
              description,
              updated_at: now,
            })
            .eq("id", existing.id);
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await adminSupabase
            .from("site_settings")
            .insert({
              key,
              description,
              value,
              updated_at: now,
            });
          if (insertError) throw insertError;
        }
      }
    }

    if (body.identity) {
      await saveSetting("identity", "Identidade da Marca, Contatos e Redes Sociais", body.identity);
    }

    if (body.appearance) {
      await saveSetting("appearance", "Paleta de Cores e Tokens Visuais", body.appearance);
    }

    if (body.shipping) {
      await saveSetting("shipping", "Regras de Frete e Retirada Presencial", body.shipping);
    }

    if (body.lab_showcase) {
      await saveSetting("lab_showcase", "Destaque do Laboratório Parceiro e Marca Exclusiva", body.lab_showcase);
    }

    if (body.showcase_media) {
      await saveSetting("showcase_media", "Fotos das Vitrines, Esportivos e Banners", body.showcase_media);
    }

    if (body.homologated_brands) {
      await saveSetting("homologated_brands", "Marcas Homologadas e Fotos das Caixas dos Laboratórios", body.homologated_brands);
    }

    if (body.promotional_showcase) {
      await saveSetting("promotional_showcase", "Vitrine Promocional 25% OFF Fundo Branco", body.promotional_showcase);
    }

    if (body.lenses_section) {
      await saveSetting("lenses_section", "Imagens e Textos da Seção de Lentes e Padrão Óptico", body.lenses_section);
    }

    if (body.hero_banner) {
      await saveSetting("hero_banner", "Banner Principal Fixo com Degradê e Botões do Header", body.hero_banner);
    }

    if (body.interactive_showcase) {
      await saveSetting("interactive_showcase", "Vitrine Interativa de Solares e Armações (Fotos e Variações)", body.interactive_showcase);
    }

    if (body.company_settings) {
      await saveSetting("company_settings", "Dados Cadastrais da Empresa e Suporte", body.company_settings);
    }

    if (body.live_broadcast) {
      await saveSetting("live_broadcast", "Configurações de Transmissão Ao Vivo e Botão Live", body.live_broadcast);
    }

    if (body.payment_methods) {
      await saveSetting("payment_methods", "Configurações das formas de pagamento e selos exibidos no rodapé", body.payment_methods);
    }

    if (body.armacoes_page_settings) {
      await saveSetting("armacoes_page_settings", "Hero Fotográfico e Textos da Página de Armações (/armacoes)", body.armacoes_page_settings);
    }

    if (body.optisync_page_settings) {
      await saveSetting("optisync_page_settings", "Configurações de Fundo, Efeitos e Conteúdo da Página OPTiSYNC HD (/optisync)", body.optisync_page_settings);
    }

    try {
      revalidatePath("/");
      revalidatePath("/lentes");
      revalidatePath("/lentes-coloridas");
      revalidatePath("/armacoes");
      revalidatePath("/optisync");
      revalidatePath("/admin/lentes");
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: "Configurações salvas e aplicadas com sucesso no site.",
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("Erro ao salvar configurações:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao salvar configurações." },
      { status: 500 }
    );
  }
}
