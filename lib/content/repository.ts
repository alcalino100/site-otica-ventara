import { revalidateTag, revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getPageDefinition, getPageDefaultValues, getAllContentFields } from "./registry";
import { SiteContentHistoryRecord, PageContentDocument } from "./types";

/**
 * Tag de cache para Next.js App Router (revalidação atômica ao publicar).
 */
export function getContentCacheTag(page: string): string {
  return `site-content-${page}`;
}

/**
 * Recupera o conteúdo de uma página no servidor com fallback garantido para defaults.
 * @param page Identificador da página (ex: "optisync", "home")
 * @param mode "published" para o site no ar; "draft" para rascunho de trabalho no admin
 */
export async function getPageContent(
  page: string,
  mode: "published" | "draft" = "published"
): Promise<Record<string, any>> {
  const defaults = getPageDefaultValues(page);

  if (!isSupabaseConfigured()) {
    return defaults;
  }

  try {
    const supabase = createAdminClient();

    // Compatibilidade transparente: se for optisync, mescla valores de optisync_page_settings nos defaults
    if (page === "optisync") {
      try {
        const { data: optSettingsData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "optisync_page_settings")
          .maybeSingle();

        if (optSettingsData?.value) {
          const s = optSettingsData.value as Record<string, any>;
          if (s.heroBadge) defaults.heroBadge = s.heroBadge;
          if (s.heroTitle) defaults.heroTitle = s.heroTitle;
          if (s.heroTitleHighlight) defaults.heroTitleHighlight = s.heroTitleHighlight;
          if (s.heroDescription) defaults.heroDescription = s.heroDescription;
          if (s.heroPortraitUrl) defaults.heroPortraitUrl = s.heroPortraitUrl;
          if (s.productAltText) defaults.productAltText = s.productAltText;
          if (s.hdLine?.badge) defaults.hdBadge = s.hdLine.badge;
          if (s.hdLine?.title) defaults.hdTitle = s.hdLine.title;
          if (s.hdLine?.titleHighlight) defaults.hdTitleHighlight = s.hdLine.titleHighlight;
          if (s.hdLine?.description) defaults.hdDescription = s.hdLine.description;
          if (s.hdLine?.ctaText) defaults.hdCtaText = s.hdLine.ctaText;
          if (s.hdLine?.ctaLink) defaults.hdCtaLink = s.hdLine.ctaLink;
          if (s.photochromicLine?.badge) defaults.photochromicBadge = s.photochromicLine.badge;
          if (s.photochromicLine?.title) defaults.photochromicTitle = s.photochromicLine.title;
          if (s.photochromicLine?.titleHighlight) defaults.photochromicTitleHighlight = s.photochromicLine.titleHighlight;
          if (s.photochromicLine?.description) defaults.photochromicDescription = s.photochromicLine.description;
          if (s.photochromicLine?.ctaText) defaults.photochromicCtaText = s.photochromicLine.ctaText;
          if (s.photochromicLine?.ctaLink) defaults.photochromicCtaLink = s.photochromicLine.ctaLink;
          if (s.photochromicLine?.transitionSpeedText) defaults.transitionSpeedText = s.photochromicLine.transitionSpeedText;
          if (s.kidsLine?.badge) defaults.kidsBadge = s.kidsLine.badge;
          if (s.kidsLine?.title) defaults.kidsTitle = s.kidsLine.title;
          if (s.kidsLine?.titleHighlight) defaults.kidsTitleHighlight = s.kidsLine.titleHighlight;
          if (s.kidsLine?.description) defaults.kidsDescription = s.kidsLine.description;
          if (s.kidsLine?.ctaText) defaults.kidsCtaText = s.kidsLine.ctaText;
          if (s.kidsLine?.ctaLink) defaults.kidsCtaLink = s.kidsLine.ctaLink;
          if (s.kidsLine?.posterBoyUrl) defaults.kidsPosterUrl = s.kidsLine.posterBoyUrl;
          if (s.benefitsTitle) defaults.benefitsTitle = s.benefitsTitle;
          if (s.benefitsSubtitle) defaults.benefitsSubtitle = s.benefitsSubtitle;
          if (s.comparisonTitle) defaults.comparisonTitle = s.comparisonTitle;
          if (s.comparisonSubtitle) defaults.comparisonSubtitle = s.comparisonSubtitle;
          if (s.labBadge) defaults.labBadge = s.labBadge;
          if (s.labTitle) defaults.labTitle = s.labTitle;
          if (s.labTitleHighlight) defaults.labTitleHighlight = s.labTitleHighlight;
          if (s.labDescription) defaults.labDescription = s.labDescription;
          if (s.labOrigin) defaults.labOrigin = s.labOrigin;
          if (s.colorsBannerTitle) defaults.colorsTitle = s.colorsBannerTitle;
          if (s.colorsBannerSubtitle) defaults.colorsSubtitle = s.colorsBannerSubtitle;
          if (s.ctaBadge) defaults.ctaBadge = s.ctaBadge;
          if (s.ctaTitle) defaults.ctaTitle = s.ctaTitle;
          if (s.ctaTitleHighlight) defaults.ctaTitleHighlight = s.ctaTitleHighlight;
          if (s.ctaSubtitle) defaults.ctaSubtitle = s.ctaSubtitle;
          if (s.ctaButtonText) defaults.ctaButtonText = s.ctaButtonText;
          if (s.ctaWhatsappMessage) defaults.ctaWhatsappMessage = s.ctaWhatsappMessage;
          if (s.ctaBusinessHours) defaults.ctaBusinessHours = s.ctaBusinessHours;
        }
      } catch (optErr) {
        console.warn("[ContentEngine] Aviso ao sincronizar optisync_page_settings:", optErr);
      }
    }

    // Compatibilidade transparente: se for home, sincroniza valores existentes de site_settings
    if (page === "home") {
      try {
        const { data: homeSettingsData } = await supabase
          .from("site_settings")
          .select("key, value")
          .in("key", ["promotional_showcase", "interactive_showcase", "showcase_media", "identity"]);

        if (homeSettingsData && homeSettingsData.length > 0) {
          for (const row of homeSettingsData) {
            if (row.key === "promotional_showcase" && row.value) {
              const p = row.value as Record<string, any>;
              if (p.pillText) defaults.offersBadge = p.pillText;
              if (p.title) defaults.offersTitle = p.title;
              if (p.subtitle) defaults.offersSubtitle = p.subtitle;
              if (p.ctaText) defaults.offersAllLinkText = p.ctaText;
            }
            if (row.key === "interactive_showcase" && row.value) {
              const it = row.value as Record<string, any>;
              if (it.heroTitle) defaults.showcaseTitle = it.heroTitle;
              if (it.heroDescription) defaults.showcaseSubtitle = it.heroDescription;
            }
            if (row.key === "showcase_media" && row.value) {
              const m = row.value as Record<string, any>;
              if (m.warrantyBannerDesktop) defaults.warrantyBannerDesktop = m.warrantyBannerDesktop;
              if (m.warrantyBannerMobile) defaults.warrantyBannerMobile = m.warrantyBannerMobile;
            }
            if (row.key === "identity" && row.value) {
              const idn = row.value as Record<string, any>;
              if (idn.address_street) defaults.storeAddress = `${idn.address_street}, ${idn.address_number || ""} - ${idn.address_neighborhood || ""}, Araçatuba - SP`;
              if (idn.contact_phone) defaults.storePhone = idn.contact_phone;
              if (idn.business_hours) defaults.storeHours = idn.business_hours;
            }
          }
        }
      } catch (homeErr) {
        console.warn("[ContentEngine] Aviso ao sincronizar configurações da Home:", homeErr);
      }
    }

    const { data, error } = await supabase
      .from("site_content")
      .select("key, value")
      .eq("page", page)
      .eq("status", mode);

    if (error) {
      console.warn(`[ContentEngine] Aviso ao buscar conteúdo (${page}/${mode}):`, error.message);
      return defaults;
    }

    if (!data || data.length === 0) {
      // Se solicitou rascunho e ainda não há rascunho salvo, herda o publicado como base
      if (mode === "draft") {
        const publishedData = await getPageContent(page, "published");
        return publishedData;
      }
      return defaults;
    }

    const mergedValues: Record<string, any> = { ...defaults };
    for (const item of data) {
      if (item.value !== undefined && item.value !== null) {
        // Se for objeto serializado em jsonb, desempacota
        if (typeof item.value === "object" && "raw" in item.value) {
          mergedValues[item.key] = item.value.raw;
        } else {
          mergedValues[item.key] = item.value;
        }
      }
    }

    return mergedValues;
  } catch (err) {
    console.warn(`[ContentEngine] Exceção ao carregar conteúdo (${page}/${mode}):`, err);
    return defaults;
  }
}

/**
 * Salva o estado de rascunho (draft) no banco de dados.
 */
export async function saveContentDraft(
  page: string,
  values: Record<string, any>,
  sectionsOrder?: string[],
  hiddenSections?: string[],
  user?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase não configurado neste ambiente" };
  }

  try {
    const supabase = createAdminClient();
    const rowsToUpsert: Array<{
      page: string;
      key: string;
      status: string;
      value: any;
      updated_by?: string;
      updated_at: string;
    }> = [];

    const now = new Date().toISOString();

    // Empacota campos de valores
    for (const [key, val] of Object.entries(values)) {
      rowsToUpsert.push({
        page,
        key,
        status: "draft",
        value: typeof val === "object" ? val : { raw: val },
        updated_by: user || "admin",
        updated_at: now,
      });
    }

    // Metadados de ordenação e visibilidade
    if (sectionsOrder) {
      rowsToUpsert.push({
        page,
        key: "_sectionsOrder",
        status: "draft",
        value: sectionsOrder,
        updated_by: user || "admin",
        updated_at: now,
      });
    }

    if (hiddenSections) {
      rowsToUpsert.push({
        page,
        key: "_hiddenSections",
        status: "draft",
        value: hiddenSections,
        updated_by: user || "admin",
        updated_at: now,
      });
    }

    const { error } = await supabase.from("site_content").upsert(rowsToUpsert, {
      onConflict: "page,key,status",
    });

    if (error) {
      console.error("[ContentEngine] Erro ao salvar rascunho:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[ContentEngine] Exceção ao salvar rascunho:", err);
    return { success: false, error: err.message || "Erro desconhecido" };
  }
}

/**
 * Publica o rascunho para o ar, criando snapshot no histórico e invalidando caches do Next.js.
 */
export async function publishContent(
  page: string,
  label: string,
  summary: string,
  valuesToPublish?: Record<string, any>,
  sectionsOrder?: string[],
  hiddenSections?: string[],
  user?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase não configurado neste ambiente" };
  }

  try {
    const supabase = createAdminClient();

    // Se os valores não foram fornecidos diretamente, busca o rascunho atual
    const values = valuesToPublish || (await getPageContent(page, "draft"));

    const now = new Date().toISOString();
    const rowsToUpsert: Array<{
      page: string;
      key: string;
      status: string;
      value: any;
      updated_by?: string;
      updated_at: string;
    }> = [];

    for (const [key, val] of Object.entries(values)) {
      rowsToUpsert.push({
        page,
        key,
        status: "published",
        value: typeof val === "object" ? val : { raw: val },
        updated_by: user || "admin",
        updated_at: now,
      });
    }

    if (sectionsOrder) {
      rowsToUpsert.push({
        page,
        key: "_sectionsOrder",
        status: "published",
        value: sectionsOrder,
        updated_by: user || "admin",
        updated_at: now,
      });
    }

    if (hiddenSections) {
      rowsToUpsert.push({
        page,
        key: "_hiddenSections",
        status: "published",
        value: hiddenSections,
        updated_by: user || "admin",
        updated_at: now,
      });
    }

    // 1. Atualiza registros publicados
    const { error: upsertError } = await supabase.from("site_content").upsert(rowsToUpsert, {
      onConflict: "page,key,status",
    });

    if (upsertError) {
      console.error("[ContentEngine] Erro ao publicar conteúdo:", upsertError);
      return { success: false, error: upsertError.message };
    }

    // 2. Grava snapshot completo no histórico
    const snapshotPayload = {
      values,
      sectionsOrder: sectionsOrder || [],
      hiddenSections: hiddenSections || [],
    };

    const { error: historyError } = await supabase.from("site_content_history").insert({
      page,
      snapshot: snapshotPayload,
      label,
      summary,
      created_by: user || "admin",
      created_at: now,
    });

    if (historyError) {
      console.warn("[ContentEngine] Aviso ao registrar histórico:", historyError.message);
    }

    // 3. Invalidação atômica de cache do Next.js
    const pageDef = getPageDefinition(page);
    try {
      revalidateTag(getContentCacheTag(page));
      if (pageDef?.path) {
        revalidatePath(pageDef.path);
      }
    } catch (cacheErr) {
      // Ignora erro de revalidação fora do contexto de request
    }

    return { success: true };
  } catch (err: any) {
    console.error("[ContentEngine] Exceção ao publicar conteúdo:", err);
    return { success: false, error: err.message || "Erro desconhecido ao publicar" };
  }
}

/**
 * Consulta os últimos snapshots de histórico da página.
 */
export async function getContentHistory(page: string): Promise<SiteContentHistoryRecord[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_content_history")
      .select("id, page, snapshot, label, summary, created_by, created_at")
      .eq("page", page)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.warn(`[ContentEngine] Aviso ao buscar histórico (${page}):`, error.message);
      return [];
    }

    return (data || []) as SiteContentHistoryRecord[];
  } catch (err) {
    console.warn(`[ContentEngine] Erro ao buscar histórico (${page}):`, err);
    return [];
  }
}

/**
 * Restaura uma versão histórica diretamente no rascunho (draft).
 */
export async function restoreContentHistory(
  page: string,
  historyId: string,
  user?: string
): Promise<{ success: boolean; error?: string; restoredValues?: Record<string, any> }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase não configurado neste ambiente" };
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("site_content_history")
      .select("snapshot, label")
      .eq("id", historyId)
      .eq("page", page)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: "Versão do histórico não encontrada" };
    }

    const snapshot = data.snapshot as {
      values?: Record<string, any>;
      sectionsOrder?: string[];
      hiddenSections?: string[];
    };

    const values = snapshot.values || snapshot;
    const sectionsOrder = snapshot.sectionsOrder;
    const hiddenSections = snapshot.hiddenSections;

    // Salva a versão restaurada como rascunho para permitir conferência
    const saveRes = await saveContentDraft(
      page,
      values,
      sectionsOrder,
      hiddenSections,
      user ? `${user} (Restaurado de ${data.label || historyId})` : "Restaurado"
    );

    if (!saveRes.success) {
      return saveRes;
    }

    return { success: true, restoredValues: values };
  } catch (err: any) {
    console.error("[ContentEngine] Erro ao restaurar versão:", err);
    return { success: false, error: err.message || "Erro ao restaurar versão" };
  }
}

/**
 * Busca de texto em todos os campos do site para a ferramenta "Procurar texto no site".
 */
export async function searchContentInSite(query: string): Promise<
  Array<{
    pageId: string;
    pageTitle: string;
    pagePath: string;
    sectionId: string;
    sectionLabel: string;
    fieldId: string;
    fieldLabel: string;
    value: string;
    location?: string;
  }>
> {
  if (!query || query.trim().length === 0) return [];
  const cleanQuery = query.toLowerCase().trim();

  const fields = getAllContentFields();
  const results: Array<{
    pageId: string;
    pageTitle: string;
    pagePath: string;
    sectionId: string;
    sectionLabel: string;
    fieldId: string;
    fieldLabel: string;
    value: string;
    location?: string;
  }> = [];

  for (const item of fields) {
    const defaultValStr =
      typeof item.field.default === "string"
        ? item.field.default
        : JSON.stringify(item.field.default || "");

    const labelMatches = item.field.label.toLowerCase().includes(cleanQuery);
    const valueMatches = defaultValStr.toLowerCase().includes(cleanQuery);
    const sectionMatches = item.sectionLabel.toLowerCase().includes(cleanQuery);

    if (labelMatches || valueMatches || sectionMatches) {
      results.push({
        pageId: item.pageId,
        pageTitle: item.pageTitle,
        pagePath: item.pagePath,
        sectionId: item.sectionId,
        sectionLabel: item.sectionLabel,
        fieldId: item.field.id,
        fieldLabel: item.field.label,
        value: defaultValStr,
        location: item.field.location,
      });
    }
  }

  return results;
}
