import { NextRequest, NextResponse } from "next/server";
import { getPageContent } from "@/lib/content/repository";
import { getPageDefinition } from "@/lib/content/registry";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ page: string }> }
) {
  const { page } = await context.params;
  const definition = getPageDefinition(page);

  if (!definition) {
    return NextResponse.json(
      { error: `Página '${page}' não encontrada no catálogo de conteúdo` },
      { status: 404 }
    );
  }

  const isDraft = req.nextUrl.searchParams.get("preview") === "draft";
  const values = await getPageContent(page, isDraft ? "draft" : "published");

  return NextResponse.json({
    page,
    status: isDraft ? "draft" : "published",
    title: definition.title,
    values,
  });
}
