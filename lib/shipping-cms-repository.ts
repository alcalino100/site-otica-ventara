import { createAdminClient } from "@/lib/supabase/admin";
import { createStaticSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { DEFAULT_SHIPPING_CMS_DOCUMENT } from "@/lib/shipping-cms-defaults";
import { ShippingCmsDocument, ShippingCmsHistoryRecord } from "@/types/shipping-cms";
import { ShippingCmsDocumentSchema } from "@/lib/validations/shipping-cms";
import { calculateContrast } from "@/lib/color-contrast";

/**
 * Recupera o documento do CMS para a página /entregas.
 * Se mode for "published", busca a versão ativa do ar.
 * Se mode for "draft", busca o rascunho de trabalho no admin.
 * Em caso de falha de conexão, ausência de registro ou erro de validação,
 * retorna com segurança os defaults tipados (resiliência total contra quebras).
 */
export async function getShippingCmsDocument(
  mode: "published" | "draft" = "published"
): Promise<ShippingCmsDocument> {
  const defaultDoc: ShippingCmsDocument = {
    ...DEFAULT_SHIPPING_CMS_DOCUMENT,
    status: mode,
  };

  if (!isSupabaseConfigured()) {
    return defaultDoc;
  }

  try {
    // Usamos admin client para garantir acesso uniforme a 'draft' e 'published'
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("shipping_cms_settings")
      .select("id, status, schema_version, sections, theme, seo, audit, updated_at")
      .eq("status", mode)
      .maybeSingle();

    if (error) {
      console.warn(`[ShippingCMS] Aviso ao buscar documento (${mode}):`, error.message);
      return defaultDoc;
    }

    if (!data) {
      // Se solicitou draft e ainda não existe draft salvo, tenta carregar o published como ponto de partida
      if (mode === "draft") {
        const publishedDoc = await getShippingCmsDocument("published");
        return {
          ...publishedDoc,
          status: "draft",
        };
      }
      return defaultDoc;
    }

    // Valida com schema Zod
    const parsed = ShippingCmsDocumentSchema.safeParse(data);
    if (!parsed.success) {
      console.error(
        `[ShippingCMS] Erro de validação no documento (${mode}):`,
        parsed.error.format()
      );
      // Retorna defaults mesclando o que for seguro
      return defaultDoc;
    }

    // Assegura que as seções venham ordenadas por sort_order
    const sortedSections = [...parsed.data.sections].sort(
      (a, b) => a.sort_order - b.sort_order
    );

    return {
      ...(parsed.data as ShippingCmsDocument),
      id: data.id,
      sections: sortedSections,
    };
  } catch (err: any) {
    console.error(`[ShippingCMS] Exceção crítica em getShippingCmsDocument (${mode}):`, err);
    return defaultDoc;
  }
}

/**
 * Salva o rascunho de trabalho do CMS.
 */
export async function saveDraftShippingCms(
  document: ShippingCmsDocument,
  userId: string = "admin"
): Promise<{ success: boolean; data?: ShippingCmsDocument; error?: string }> {
  try {
    const docToValidate: ShippingCmsDocument = {
      ...document,
      status: "draft",
      audit: {
        updated_at: new Date().toISOString(),
        updated_by: userId,
        version_label: document.audit?.version_label || "Rascunho não publicado",
      },
    };

    const parsed = ShippingCmsDocumentSchema.safeParse(docToValidate);
    if (!parsed.success) {
      return {
        success: false,
        error: `Dados inválidos: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      };
    }

    const supabase = createAdminClient();

    // Upsert baseado no status = 'draft' (coluna com constraint UNIQUE)
    const { data, error } = await supabase
      .from("shipping_cms_settings")
      .upsert(
        {
          status: "draft",
          schema_version: parsed.data.schema_version,
          theme: parsed.data.theme,
          seo: parsed.data.seo,
          sections: parsed.data.sections,
          audit: parsed.data.audit,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "status" }
      )
      .select()
      .single();

    if (error) {
      console.error("[ShippingCMS] Erro ao salvar rascunho:", error);
      return { success: false, error: `Erro no banco de dados: ${error.message}` };
    }

    return { success: true, data: data as ShippingCmsDocument };
  } catch (err: any) {
    console.error("[ShippingCMS] Exceção em saveDraftShippingCms:", err);
    return { success: false, error: err.message || "Erro desconhecido ao salvar rascunho." };
  }
}

/**
 * Publica as alterações do CMS:
 * 1. Valida contraste WCAG AA (bloqueia publicação se < 4.5:1)
 * 2. Atualiza a linha com status = 'published'
 * 3. Cria um snapshot no histórico (shipping_cms_history) para auditoria e restauração
 */
export async function publishShippingCms(
  document: ShippingCmsDocument,
  userId: string = "admin",
  versionLabel: string = "Versão publicada",
  changeSummary: string = "Atualização de conteúdo e estilo via painel administrativo"
): Promise<{ success: boolean; data?: ShippingCmsDocument; error?: string }> {
  try {
    // 1. Validação de Contraste WCAG AA
    const contrast = calculateContrast(
      document.theme.primary_text_color,
      document.theme.page_background
    );

    if (!contrast.passesAA) {
      return {
        success: false,
        error: `Publicação BLOQUEADA por acessibilidade: a taxa de contraste do texto principal (${document.theme.primary_text_color}) sobre o fundo da página (${document.theme.page_background}) é de apenas ${contrast.formattedRatio}. O mínimo exigido pelo WCAG AA é 4.5:1.`,
      };
    }

    // 2. Validação de Schema
    const docToValidate: ShippingCmsDocument = {
      ...document,
      status: "published",
      audit: {
        updated_at: new Date().toISOString(),
        updated_by: userId,
        version_label: versionLabel,
      },
    };

    const parsed = ShippingCmsDocumentSchema.safeParse(docToValidate);
    if (!parsed.success) {
      return {
        success: false,
        error: `Dados inválidos para publicação: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
      };
    }

    const supabase = createAdminClient();

    // 3. Atualiza registro 'published'
    const { data: publishedData, error: publishError } = await supabase
      .from("shipping_cms_settings")
      .upsert(
        {
          status: "published",
          schema_version: parsed.data.schema_version,
          theme: parsed.data.theme,
          seo: parsed.data.seo,
          sections: parsed.data.sections,
          audit: parsed.data.audit,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "status" }
      )
      .select()
      .single();

    if (publishError) {
      console.error("[ShippingCMS] Erro ao publicar configurações:", publishError);
      return { success: false, error: `Erro ao publicar: ${publishError.message}` };
    }

    // 4. Também atualiza o registro 'draft' para mantê-los alinhados
    await supabase.from("shipping_cms_settings").upsert(
      {
        status: "draft",
        schema_version: parsed.data.schema_version,
        theme: parsed.data.theme,
        seo: parsed.data.seo,
        sections: parsed.data.sections,
        audit: parsed.data.audit,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "status" }
    );

    // 5. Cria snapshot na tabela de histórico
    const { error: historyError } = await supabase.from("shipping_cms_history").insert({
      published_by: userId,
      version_label: versionLabel,
      schema_version: parsed.data.schema_version,
      sections: parsed.data.sections,
      theme: parsed.data.theme,
      seo: parsed.data.seo,
      change_summary: changeSummary,
    });

    if (historyError) {
      console.warn("[ShippingCMS] Aviso: snapshot de histórico não pôde ser gravado:", historyError.message);
    }

    return { success: true, data: publishedData as ShippingCmsDocument };
  } catch (err: any) {
    console.error("[ShippingCMS] Exceção em publishShippingCms:", err);
    return { success: false, error: err.message || "Erro desconhecido ao publicar alterações." };
  }
}

/**
 * Lista as últimas versões publicadas para histórico e restauração.
 */
export async function getShippingCmsHistory(
  limit: number = 10
): Promise<ShippingCmsHistoryRecord[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("shipping_cms_history")
      .select("id, published_at, published_by, version_label, schema_version, sections, theme, seo, change_summary")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("[ShippingCMS] Erro ao carregar histórico:", error.message);
      return [];
    }

    return (data || []) as ShippingCmsHistoryRecord[];
  } catch (err: any) {
    console.error("[ShippingCMS] Exceção em getShippingCmsHistory:", err);
    return [];
  }
}

/**
 * Restaura uma versão do histórico, carregando-a no 'draft' para que o admin possa
 * revisar no painel e pré-visualizar antes de publicar novamente.
 */
export async function restoreShippingCmsVersion(
  historyId: string,
  userId: string = "admin"
): Promise<{ success: boolean; data?: ShippingCmsDocument; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { data: historyRecord, error: fetchError } = await supabase
      .from("shipping_cms_history")
      .select("*")
      .eq("id", historyId)
      .single();

    if (fetchError || !historyRecord) {
      return { success: false, error: "Versão de histórico não encontrada." };
    }

    const restoredDoc: ShippingCmsDocument = {
      status: "draft",
      schema_version: historyRecord.schema_version,
      theme: historyRecord.theme,
      seo: historyRecord.seo,
      sections: historyRecord.sections,
      audit: {
        updated_at: new Date().toISOString(),
        updated_by: userId,
        version_label: `Restaurado de: ${historyRecord.version_label || "Versão anterior"} (${new Date(historyRecord.published_at).toLocaleString("pt-BR")})`,
      },
    };

    return await saveDraftShippingCms(restoredDoc, userId);
  } catch (err: any) {
    console.error("[ShippingCMS] Exceção em restoreShippingCmsVersion:", err);
    return { success: false, error: err.message || "Erro ao restaurar versão." };
  }
}
