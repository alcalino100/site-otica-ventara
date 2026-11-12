import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  getPageContent,
  saveContentDraft,
  publishContent,
  getContentHistory,
  restoreContentHistory,
} from "@/lib/content/repository";
import { getPageDefinition, getPageDefaultValues } from "@/lib/content/registry";
import {
  SaveContentDraftSchema,
  PublishContentSchema,
  RestoreContentHistorySchema,
} from "@/lib/validations/content-engine";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ page: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }

  const { page } = await context.params;
  const definition = getPageDefinition(page);

  if (!definition) {
    return NextResponse.json(
      { error: `Página '${page}' não encontrada no catálogo de conteúdo` },
      { status: 404 }
    );
  }

  const defaults = getPageDefaultValues(page);
  const draft = await getPageContent(page, "draft");
  const published = await getPageContent(page, "published");
  const history = await getContentHistory(page);

  return NextResponse.json({
    page,
    definition,
    defaults,
    draft,
    published,
    history,
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ page: string }> }
) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }

  const { page } = await context.params;
  const definition = getPageDefinition(page);

  if (!definition) {
    return NextResponse.json(
      { error: `Página '${page}' não encontrada no catálogo de conteúdo` },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const action = body.action || "save_draft";
    const userEmail = auth.user?.email || "admin";

    // 1. AÇÃO: Salvar Rascunho (Draft)
    if (action === "save_draft") {
      const parsed = SaveContentDraftSchema.safeParse({
        page,
        values: body.values || {},
        sectionsOrder: body.sectionsOrder,
        hiddenSections: body.hiddenSections,
      });

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Dados de rascunho inválidos", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const result = await saveContentDraft(
        page,
        parsed.data.values,
        parsed.data.sectionsOrder,
        parsed.data.hiddenSections,
        userEmail
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Rascunho salvo com sucesso",
        page,
      });
    }

    // 2. AÇÃO: Publicar Conteúdo no Ar
    if (action === "publish") {
      const parsed = PublishContentSchema.safeParse({
        page,
        label: body.label,
        summary: body.summary,
        values: body.values,
        sectionsOrder: body.sectionsOrder,
        hiddenSections: body.hiddenSections,
      });

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Dados de publicação inválidos", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const result = await publishContent(
        page,
        parsed.data.label,
        parsed.data.summary,
        parsed.data.values,
        parsed.data.sectionsOrder,
        parsed.data.hiddenSections,
        userEmail
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Conteúdo publicado no ar com sucesso",
        page,
      });
    }

    // 3. AÇÃO: Restaurar Versão Histórica
    if (action === "restore") {
      const parsed = RestoreContentHistorySchema.safeParse({
        page,
        historyId: body.historyId,
      });

      if (!parsed.success) {
        return NextResponse.json(
          { error: "ID de histórico inválido", details: parsed.error.format() },
          { status: 400 }
        );
      }

      const result = await restoreContentHistory(page, parsed.data.historyId, userEmail);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Versão histórica restaurada como rascunho",
        restoredValues: result.restoredValues,
        page,
      });
    }

    // 4. AÇÃO: Importar Backup JSON
    if (action === "import_json") {
      if (!body.importedValues || typeof body.importedValues !== "object") {
        return NextResponse.json(
          { error: "Arquivo JSON importado inválido ou sem campos legíveis" },
          { status: 400 }
        );
      }

      const result = await saveContentDraft(
        page,
        body.importedValues,
        body.sectionsOrder,
        body.hiddenSections,
        `${userEmail} (Importado de JSON)`
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Conteúdo JSON importado como rascunho com sucesso",
        page,
      });
    }

    return NextResponse.json({ error: `Ação '${action}' não reconhecida` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
