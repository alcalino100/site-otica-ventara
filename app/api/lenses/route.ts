import { NextResponse } from "next/server";
import { loadLensesCatalog } from "@/lib/lenses-catalog-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/lenses — catálogo PÚBLICO de lentes (somente itens ativos).
 * O site usa esta rota: /api/admin/lenses exige login e visitantes recebiam 401,
 * caindo sempre no catálogo padrão (fotos/preços alterados no admin não apareciam).
 */
export async function GET() {
  const lenses = (await loadLensesCatalog()).filter((l) => l.isActive !== false);
  return NextResponse.json(
    { success: true, lenses },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
  );
}
