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
 * Detecta se o erro do Supabase decorre da ausência da tabela no schema (ex: migration pendente).
 */
export function isTableMissingError(err: any): boolean {
  if (!err) return false;
  const msg = typeof err === "string" ? err : err.message || "";
  const code = err.code || "";
  return (
    code === "PGRST205" ||
    code === "42P01" ||
    msg.includes("Could not find the table") ||
    msg.includes("schema cache") ||
    (msg.includes("relation") && msg.includes("does not exist"))
  );
}

/**
 * Chave de armazenamento no site_settings quando a tabela site_content estiver indisponível.
 */
export function getSiteSettingsContentKey(page: string, mode: "published" | "draft"): string {
  return `site_content_${page}_${mode}`;
}

/**
 * Chave de histórico no site_settings quando site_content_history estiver indisponível.
 */
export function getSiteSettingsHistoryKey(page: string): string {
  return `site_content_history_${page}`;
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

    // Fallback resiliente para site_settings caso a tabela site_content ainda não exista no banco
    if (error && isTableMissingError(error)) {
      const fallbackKey = getSiteSettingsContentKey(page, mode);
      const { data: fallbackRow } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", fallbackKey)
        .maybeSingle();

      if (fallbackRow?.value) {
        const payload = fallbackRow.value as Record<string, any>;
        const rawValues = payload.values || payload;
        const merged: Record<string, any> = { ...defaults };
        for (const [k, v] of Object.entries(rawValues)) {
          if (v !== undefined && v !== null) {
            merged[k] = typeof v === "object" && "raw" in v ? (v as any).raw : v;
          }
        }
        if (payload.sectionsOrder) merged._sectionsOrder = payload.sectionsOrder;
        if (payload.hiddenSections) merged._hiddenSections = payload.hiddenSections;
        return merged;
      } else if (mode === "draft") {
        // Se ainda não há rascunho em site_settings, herda o publicado
        const pubKey = getSiteSettingsContentKey(page, "published");
        const { data: pubRow } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", pubKey)
          .maybeSingle();

        if (pubRow?.value) {
          const payload = pubRow.value as Record<string, any>;
          const rawValues = payload.values || payload;
          const merged: Record<string, any> = { ...defaults };
          for (const [k, v] of Object.entries(rawValues)) {
            if (v !== undefined && v !== null) {
              merged[k] = typeof v === "object" && "raw" in v ? (v as any).raw : v;
            }
          }
          if (payload.sectionsOrder) merged._sectionsOrder = payload.sectionsOrder;
          if (payload.hiddenSections) merged._hiddenSections = payload.hiddenSections;
          return merged;
        }
      }
      return defaults;
    }

    if (error) {
      console.warn(`[ContentEngine] Aviso ao buscar conteúdo (${page}/${mode}):`, error.message);
      return defaults;
    }

    if (!data || data.length === 0) {
      // Verifica se há conteúdo salvo no fallback de site_settings antes de recorrer a defaults
      const fallbackKey = getSiteSettingsContentKey(page, mode);
      const { data: fallbackRow } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", fallbackKey)
        .maybeSingle();

      if (fallbackRow?.value) {
        const payload = fallbackRow.value as Record<string, any>;
        const rawValues = payload.values || payload;
        const merged: Record<string, any> = { ...defaults };
        for (const [k, v] of Object.entries(rawValues)) {
          if (v !== undefined && v !== null) {
            merged[k] = typeof v === "object" && "raw" in v ? (v as any).raw : v;
          }
        }
        if (payload.sectionsOrder) merged._sectionsOrder = payload.sectionsOrder;
        if (payload.hiddenSections) merged._hiddenSections = payload.hiddenSections;
        return merged;
      }

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
 * Constrói a lista deduplicada de registros para inserção/atualização atômica em site_content.
 * Elimina rigorosamente o erro PostgreSQL "ON CONFLICT DO UPDATE command cannot affect row a second time"
 * garantindo que a tupla de chave primária (page, key, status) ocorra no máximo uma única vez no lote de upsert.
 */
function buildRowsToUpsert(
  page: string,
  status: "draft" | "published",
  values: Record<string, any>,
  sectionsOrder?: string[],
  hiddenSections?: string[],
  user?: string,
  now: string = new Date().toISOString()
) {
  const rowsMap = new Map<
    string,
    {
      page: string;
      key: string;
      status: "draft" | "published";
      value: any;
      updated_by?: string;
      updated_at: string;
    }
  >();

  // 1. Empacota campos de valores, ignorando metadados internos de controle para evitar chaves duplicadas no lote
  for (const [key, val] of Object.entries(values)) {
    if (key === "_sectionsOrder" || key === "_hiddenSections") continue;
    rowsMap.set(key, {
      page,
      key,
      status,
      value: typeof val === "object" && val !== null ? val : { raw: val },
      updated_by: user || "admin",
      updated_at: now,
    });
  }

  // 2. Metadados de ordenação das seções (argumento explícito > valor interno em values)
  const effectiveSectionsOrder = sectionsOrder ?? values._sectionsOrder;
  if (effectiveSectionsOrder) {
    rowsMap.set("_sectionsOrder", {
      page,
      key: "_sectionsOrder",
      status,
      value: effectiveSectionsOrder,
      updated_by: user || "admin",
      updated_at: now,
    });
  }

  // 3. Metadados de visibilidade das seções (argumento explícito > valor interno em values)
  const effectiveHiddenSections = hiddenSections ?? values._hiddenSections;
  if (effectiveHiddenSections) {
    rowsMap.set("_hiddenSections", {
      page,
      key: "_hiddenSections",
      status,
      value: effectiveHiddenSections,
      updated_by: user || "admin",
      updated_at: now,
    });
  }

  return Array.from(rowsMap.values());
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
    const now = new Date().toISOString();
    const rowsToUpsert = buildRowsToUpsert(
      page,
      "draft",
      values,
      sectionsOrder,
      hiddenSections,
      user,
      now
    );

    const { error } = await supabase.from("site_content").upsert(rowsToUpsert, {
      onConflict: "page,key,status",
    });

    if (error) {
      if (isTableMissingError(error)) {
        console.warn(
          `[ContentEngine] Tabela site_content ausente. Salvando rascunho de '${page}' em site_settings (fallback resiliente).`
        );
        const fallbackKey = getSiteSettingsContentKey(page, "draft");
        const payload = {
          page,
          status: "draft",
          values,
          sectionsOrder: sectionsOrder ?? values._sectionsOrder ?? [],
          hiddenSections: hiddenSections ?? values._hiddenSections ?? [],
          updated_by: user || "admin",
          updated_at: now,
        };
        const { error: fallbackErr } = await supabase.from("site_settings").upsert(
          {
            key: fallbackKey,
            value: payload,
            description: `CMS Rascunho: ${page}`,
            updated_at: now,
          },
          { onConflict: "key" }
        );
        if (fallbackErr) {
          console.error("[ContentEngine] Erro ao salvar rascunho em site_settings:", fallbackErr);
          return { success: false, error: fallbackErr.message };
        }
        return { success: true };
      }

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

    const effectiveSectionsOrder = sectionsOrder ?? values._sectionsOrder ?? [];
    const effectiveHiddenSections = hiddenSections ?? values._hiddenSections ?? [];

    // Cria os registros publicados e sincroniza simultaneamente o rascunho (draft)
    const publishedRows = buildRowsToUpsert(
      page,
      "published",
      values,
      effectiveSectionsOrder,
      effectiveHiddenSections,
      user,
      now
    );

    const draftRows = buildRowsToUpsert(
      page,
      "draft",
      values,
      effectiveSectionsOrder,
      effectiveHiddenSections,
      user,
      now
    );

    const rowsToUpsert = [...publishedRows, ...draftRows];

    // 1. Atualiza registros publicados e rascunho de forma atômica
    const { error: upsertError } = await supabase.from("site_content").upsert(rowsToUpsert, {
      onConflict: "page,key,status",
    });

    if (upsertError) {
      if (isTableMissingError(upsertError)) {
        console.warn(
          `[ContentEngine] Tabela site_content ausente. Publicando '${page}' em site_settings (fallback resiliente).`
        );
        const fallbackKey = getSiteSettingsContentKey(page, "published");
        const payload = {
          page,
          status: "published",
          values,
          sectionsOrder: effectiveSectionsOrder,
          hiddenSections: effectiveHiddenSections,
          updated_by: user || "admin",
          updated_at: now,
        };
        const { error: fallbackErr } = await supabase.from("site_settings").upsert(
          {
            key: fallbackKey,
            value: payload,
            description: `CMS Publicado: ${page}`,
            updated_at: now,
          },
          { onConflict: "key" }
        );
        if (fallbackErr) {
          console.error("[ContentEngine] Erro ao publicar em site_settings:", fallbackErr);
          return { success: false, error: fallbackErr.message };
        }

        // Também atualiza o rascunho no fallback para consistência do editor
        try {
          const draftFallbackKey = getSiteSettingsContentKey(page, "draft");
          await supabase.from("site_settings").upsert(
            {
              key: draftFallbackKey,
              value: { ...payload, status: "draft" },
              description: `CMS Rascunho: ${page}`,
              updated_at: now,
            },
            { onConflict: "key" }
          );
        } catch (dErr) {
          console.warn("[ContentEngine] Aviso ao sincronizar rascunho no fallback:", dErr);
        }

        // Grava histórico no fallback
        try {
          const histKey = getSiteSettingsHistoryKey(page);
          const { data: histData } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", histKey)
            .maybeSingle();

          const existingHistory: any[] = Array.isArray(histData?.value) ? histData.value : [];
          const newRecord: SiteContentHistoryRecord = {
            id: crypto.randomUUID(),
            page,
            snapshot: {
              values,
              sectionsOrder: effectiveSectionsOrder,
              hiddenSections: effectiveHiddenSections,
            },
            label,
            summary,
            created_by: user || "admin",
            created_at: now,
          };
          const updatedHistory = [newRecord, ...existingHistory].slice(0, 30);
          await supabase.from("site_settings").upsert(
            {
              key: histKey,
              value: updatedHistory,
              description: `CMS Histórico: ${page}`,
              updated_at: now,
            },
            { onConflict: "key" }
          );
        } catch (hErr) {
          console.warn("[ContentEngine] Aviso ao salvar histórico no fallback:", hErr);
        }

        // Sincroniza optisync_page_settings se aplicável
        if (page === "optisync") {
          await syncOptisyncPageSettingsFromContent(supabase, values);
        }

        // Invalidação atômica de cache do Next.js
        const pageDef = getPageDefinition(page);
        try {
          revalidateTag(getContentCacheTag(page));
          if (pageDef?.path) {
            revalidatePath(pageDef.path);
            revalidatePath(pageDef.path, "page");
          }
        } catch {
          // Ignora fora de request
        }

        return { success: true };
      }

      console.error("[ContentEngine] Erro ao publicar conteúdo:", upsertError);
      return { success: false, error: upsertError.message };
    }

    // 2. Grava snapshot completo no histórico
    const snapshotPayload = {
      values,
      sectionsOrder: effectiveSectionsOrder,
      hiddenSections: effectiveHiddenSections,
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
      if (isTableMissingError(historyError)) {
        try {
          const histKey = getSiteSettingsHistoryKey(page);
          const { data: histData } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", histKey)
            .maybeSingle();

          const existingHistory: any[] = Array.isArray(histData?.value) ? histData.value : [];
          const newRecord: SiteContentHistoryRecord = {
            id: crypto.randomUUID(),
            page,
            snapshot: snapshotPayload,
            label,
            summary,
            created_by: user || "admin",
            created_at: now,
          };
          const updatedHistory = [newRecord, ...existingHistory].slice(0, 30);
          await supabase.from("site_settings").upsert(
            {
              key: histKey,
              value: updatedHistory,
              description: `CMS Histórico: ${page}`,
              updated_at: now,
            },
            { onConflict: "key" }
          );
        } catch (hErr) {
          console.warn("[ContentEngine] Aviso ao salvar histórico no fallback:", hErr);
        }
      } else {
        console.warn("[ContentEngine] Aviso ao registrar histórico:", historyError.message);
      }
    }

    // Sincroniza optisync_page_settings se for optisync
    if (page === "optisync") {
      await syncOptisyncPageSettingsFromContent(supabase, values);
    }

    // 3. Invalidação atômica de cache do Next.js
    const pageDef = getPageDefinition(page);
    try {
      revalidateTag(getContentCacheTag(page));
      if (pageDef?.path) {
        revalidatePath(pageDef.path);
        revalidatePath(pageDef.path, "page");
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
      if (isTableMissingError(error)) {
        const histKey = getSiteSettingsHistoryKey(page);
        const { data: fallbackData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", histKey)
          .maybeSingle();

        if (Array.isArray(fallbackData?.value)) {
          return fallbackData.value as SiteContentHistoryRecord[];
        }
        return [];
      }
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
      if (isTableMissingError(error) || !data) {
        const histKey = getSiteSettingsHistoryKey(page);
        const { data: fallbackData } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", histKey)
          .maybeSingle();

        const historyList: any[] = Array.isArray(fallbackData?.value) ? fallbackData.value : [];
        const record = historyList.find((r: any) => r.id === historyId);
        if (record) {
          const snapshot = record.snapshot as {
            values?: Record<string, any>;
            sectionsOrder?: string[];
            hiddenSections?: string[];
          };
          const values = snapshot.values || snapshot;
          const sectionsOrder = snapshot.sectionsOrder;
          const hiddenSections = snapshot.hiddenSections;

          const saveRes = await saveContentDraft(
            page,
            values,
            sectionsOrder,
            hiddenSections,
            user ? `${user} (Restaurado de ${record.label || historyId})` : "Restaurado"
          );
          if (!saveRes.success) return saveRes;
          return { success: true, restoredValues: values };
        }
      }
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

/**
 * Mantém optisync_page_settings em site_settings perfeitamente sincronizado com os dados publicados.
 */
async function syncOptisyncPageSettingsFromContent(supabase: any, values: Record<string, any>) {
  try {
    const { data: existingData } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "optisync_page_settings")
      .maybeSingle();

    const prev = (existingData?.value as Record<string, any>) || {};
    const updated: Record<string, any> = { ...prev };

    if (values.heroBadge) updated.heroBadge = values.heroBadge;
    if (values.heroTitle) updated.heroTitle = values.heroTitle;
    if (values.heroTitleHighlight) updated.heroTitleHighlight = values.heroTitleHighlight;
    if (values.heroDescription) updated.heroDescription = values.heroDescription;
    if (values.heroPortraitUrl) updated.heroPortraitUrl = values.heroPortraitUrl;
    if (values.productAltText) updated.productAltText = values.productAltText;

    if (!updated.hdLine) updated.hdLine = {};
    if (values.hdBadge) updated.hdLine.badge = values.hdBadge;
    if (values.hdTitle) updated.hdLine.title = values.hdTitle;
    if (values.hdTitleHighlight) updated.hdLine.titleHighlight = values.hdTitleHighlight;
    if (values.hdDescription) updated.hdLine.description = values.hdDescription;
    if (values.hdCtaText) updated.hdLine.ctaText = values.hdCtaText;
    if (values.hdCtaLink) updated.hdLine.ctaLink = values.hdCtaLink;

    if (!updated.photochromicLine) updated.photochromicLine = {};
    if (values.photochromicBadge) updated.photochromicLine.badge = values.photochromicBadge;
    if (values.photochromicTitle) updated.photochromicLine.title = values.photochromicTitle;
    if (values.photochromicTitleHighlight) updated.photochromicLine.titleHighlight = values.photochromicTitleHighlight;
    if (values.photochromicDescription) updated.photochromicLine.description = values.photochromicDescription;
    if (values.photochromicCtaText) updated.photochromicLine.ctaText = values.photochromicCtaText;
    if (values.photochromicCtaLink) updated.photochromicLine.ctaLink = values.photochromicCtaLink;

    if (!updated.kidsLine) updated.kidsLine = {};
    if (values.kidsBadge) updated.kidsLine.badge = values.kidsBadge;
    if (values.kidsTitle) updated.kidsLine.title = values.kidsTitle;
    if (values.kidsTitleHighlight) updated.kidsLine.titleHighlight = values.kidsTitleHighlight;
    if (values.kidsDescription) updated.kidsLine.description = values.kidsDescription;
    if (values.kidsCtaText) updated.kidsLine.ctaText = values.kidsCtaText;
    if (values.kidsCtaLink) updated.kidsLine.ctaLink = values.kidsCtaLink;
    if (values.kidsPosterUrl) updated.kidsLine.posterBoyUrl = values.kidsPosterUrl;

    if (values.backgroundPreset) updated.backgroundPreset = values.backgroundPreset;
    if (values.gradientBaseFrom) updated.gradientBaseFrom = values.gradientBaseFrom;
    if (values.gradientBaseTo) updated.gradientBaseTo = values.gradientBaseTo;
    if (values.colorVioletLeft) updated.colorVioletLeft = values.colorVioletLeft;
    if (values.colorBlueRight) updated.colorBlueRight = values.colorBlueRight;
    if (values.colorMagentaSpot) updated.colorMagentaSpot = values.colorMagentaSpot;
    if (values.beamsIntensity !== undefined) updated.beamsIntensity = values.beamsIntensity;
    if (values.glowIntensity !== undefined) updated.glowIntensity = values.glowIntensity;
    if (values.enableAnimation !== undefined) updated.enableAnimation = values.enableAnimation;

    await supabase.from("site_settings").upsert(
      {
        key: "optisync_page_settings",
        value: updated,
        description: "Configurações da Página OptiSYNC (Sincronizado via CMS)",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
  } catch (err) {
    console.warn("[ContentEngine] Aviso ao sincronizar optisync_page_settings:", err);
  }
}
