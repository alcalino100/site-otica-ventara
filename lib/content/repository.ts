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
