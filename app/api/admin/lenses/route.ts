import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { DEFAULT_LENSES, AdminLensItem } from "@/lib/lenses-data";

export const dynamic = "force-dynamic";

let inMemoryLensesCatalog: AdminLensItem[] = [...DEFAULT_LENSES];

/**
 * GET /api/admin/lenses
 * Retorna o catálogo de lentes oficial gravado no Supabase (site_settings.lenses_catalog)
 * sem reinjetar itens que foram intencionalmente excluídos pelo administrador.
 */
export async function GET() {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("site_settings")
      .select("value")
      .eq("key", "lenses_catalog")
      .maybeSingle();

    if (!error && data?.value && Array.isArray(data.value)) {
      inMemoryLensesCatalog = data.value as AdminLensItem[];
      return NextResponse.json({ success: true, lenses: inMemoryLensesCatalog });
    }

    // Se o banco ainda não possuir o registro lenses_catalog, inicializa com DEFAULT_LENSES
    return NextResponse.json({ success: true, lenses: inMemoryLensesCatalog });
  } catch (err: any) {
    console.warn("Fallback local de lentes:", err.message);
    return NextResponse.json({ success: true, lenses: inMemoryLensesCatalog });
  }
}

/**
 * POST /api/admin/lenses
 * Salva a lista completa de lentes atualizada pelo administrador no Supabase
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.lenses)) {
      return NextResponse.json(
        { error: "Conjunto de lentes inválido fornecido." },
        { status: 400 }
      );
    }

    inMemoryLensesCatalog = body.lenses;

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase.from("site_settings").upsert(
      {
        key: "lenses_catalog",
        value: body.lenses,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      console.warn("Aviso ao persistir no Supabase, mantendo em memória:", error.message);
    }

    try {
      revalidatePath("/");
      revalidatePath("/lentes");
      revalidatePath("/lentes-coloridas");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Catálogo de lentes e valores atualizado com sucesso!",
      lenses: inMemoryLensesCatalog,
    });
  } catch (err: any) {
    console.error("Erro ao salvar lentes:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao salvar catálogo de lentes." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/lenses?id=...
 * Remove pontualmente uma lente do catálogo e persiste no Supabase
 */
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    let lensId = searchParams.get("id");

    if (!lensId) {
      const body = await req.json().catch(() => ({}));
      lensId = body.id;
    }

    if (!lensId) {
      return NextResponse.json(
        { error: "ID da lente não informado para exclusão." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const { data } = await adminSupabase
      .from("site_settings")
      .select("value")
      .eq("key", "lenses_catalog")
      .maybeSingle();

    const currentList: AdminLensItem[] =
      data?.value && Array.isArray(data.value)
        ? (data.value as AdminLensItem[])
        : inMemoryLensesCatalog;

    const updated = currentList.filter((item) => item.id !== lensId);
    inMemoryLensesCatalog = updated;

    const { error } = await adminSupabase.from("site_settings").upsert(
      {
        key: "lenses_catalog",
        value: updated,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

    if (error) {
      console.warn("Aviso ao salvar exclusão no Supabase:", error.message);
    }

    try {
      revalidatePath("/");
      revalidatePath("/lentes");
      revalidatePath("/lentes-coloridas");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Lente removida do catálogo com sucesso!",
      lenses: updated,
    });
  } catch (err: any) {
    console.error("Erro ao excluir lente:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao excluir lente." },
      { status: 500 }
    );
  }
}
