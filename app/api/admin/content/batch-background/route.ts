import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getPageContent, saveContentDraft } from "@/lib/content/repository";
import { getPageDefinition } from "@/lib/content/registry";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const body = await req.json();
    const { targetPages, backgroundConfig } = body;

    if (!Array.isArray(targetPages) || targetPages.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma página de destino informada" },
        { status: 400 }
      );
    }

    if (!backgroundConfig || typeof backgroundConfig !== "object") {
      return NextResponse.json(
        { error: "Configuração de fundo inválida" },
        { status: 400 }
      );
    }

    const userEmail = auth.user?.email || "admin";
    const updatedPages: string[] = [];
    const errors: Array<{ page: string; error: string }> = [];

    for (const pageId of targetPages) {
      const definition = getPageDefinition(pageId);
      if (!definition) {
        errors.push({ page: pageId, error: "Página não encontrada no catálogo" });
        continue;
      }

      // Obtém o rascunho atual da página de destino para mesclar sem sobrescrever outros campos
      const existingDraft = await getPageContent(pageId, "draft");
      const mergedValues = {
        ...existingDraft,
        ...backgroundConfig,
      };

      const result = await saveContentDraft(
        pageId,
        mergedValues,
        existingDraft._sectionsOrder,
        existingDraft._hiddenSections,
        userEmail
      );

      if (result.success) {
        updatedPages.push(pageId);
      } else {
        errors.push({ page: pageId, error: result.error || "Erro ao salvar" });
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: updatedPages.length,
      updatedPages,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
