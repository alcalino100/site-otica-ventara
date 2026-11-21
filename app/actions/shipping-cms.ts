"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  getShippingCmsDocument,
  saveDraftShippingCms,
  publishShippingCms,
  getShippingCmsHistory,
  restoreShippingCmsVersion,
} from "@/lib/shipping-cms-repository";
import { ShippingCmsDocument, ShippingCmsHistoryRecord } from "@/types/shipping-cms";

/**
 * Validação segura de sessão do administrador para Server Actions:
 * login no Supabase + perfil em admin_profiles (mesma regra das rotas /api/admin).
 */
async function verifyAdminSession(): Promise<{ authorized: boolean; userId: string; error?: string }> {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    return {
      authorized: false,
      userId: "",
      error: "Sessão expirada ou sem permissão administrativa. Faça login novamente.",
    };
  }
  return { authorized: true, userId: auth.user.email || auth.user.id };
}

/**
 * Carrega o documento do CMS (rascunho ou publicado).
 */
export async function getShippingCmsAction(
  mode: "published" | "draft" = "draft"
): Promise<{ success: boolean; data?: ShippingCmsDocument; error?: string }> {
  try {
    if (mode === "draft") {
      const auth = await verifyAdminSession();
      if (!auth.authorized) {
        return { success: false, error: auth.error };
      }
    }

    const doc = await getShippingCmsDocument(mode);
    return { success: true, data: doc };
  } catch (err: any) {
    return { success: false, error: err.message || "Erro ao carregar dados do CMS." };
  }
}

/**
 * Salva o rascunho de trabalho sem impactar a página ao vivo.
 */
export async function saveShippingDraftAction(
  doc: ShippingCmsDocument
): Promise<{ success: boolean; data?: ShippingCmsDocument; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const result = await saveDraftShippingCms(doc, auth.userId);
  return result;
}

/**
 * Publica as alterações do CMS:
 * - Valida regras de negócio e contraste WCAG AA
 * - Salva na tabela ativa e cria snapshot no histórico
 * - Revalida o cache sob demanda da página /entregas
 */
export async function publishShippingCmsAction(
  doc: ShippingCmsDocument,
  versionLabel: string,
  changeSummary: string
): Promise<{ success: boolean; data?: ShippingCmsDocument; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const result = await publishShippingCms(
    doc,
    auth.userId,
    versionLabel || `Publicação em ${new Date().toLocaleString("pt-BR")}`,
    changeSummary || "Atualização direta de conteúdo e estilo via CMS"
  );

  if (result.success) {
    try {
      revalidatePath("/entregas");
      revalidateTag("shipping-page");
    } catch (revalErr) {
      console.warn("[ShippingCMS Actions] Aviso ao revalidar cache:", revalErr);
    }
  }

  return result;
}

/**
 * Recupera o histórico de versões publicadas.
 */
export async function getShippingHistoryAction(): Promise<{
  success: boolean;
  data?: ShippingCmsHistoryRecord[];
  error?: string;
}> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const history = await getShippingCmsHistory(10);
  return { success: true, data: history };
}

/**
 * Restaura uma versão publicada anterior como o novo rascunho.
 */
export async function restoreShippingVersionAction(
  historyId: string
): Promise<{ success: boolean; data?: ShippingCmsDocument; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const result = await restoreShippingCmsVersion(historyId, auth.userId);
  return result;
}

/**
 * Limpa manualmente o cache da página /entregas.
 */
export async function purgeShippingCacheAction(): Promise<{ success: boolean; message: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, message: auth.error || "Não autorizado." };
  }

  try {
    revalidatePath("/entregas");
    revalidateTag("shipping-page");
    return { success: true, message: "Cache da página /entregas purgado com sucesso!" };
  } catch (err: any) {
    return { success: false, message: `Erro ao limpar cache: ${err.message}` };
  }
}
