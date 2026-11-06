import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DEFAULT_LENSES, AdminLensItem } from "@/lib/lenses-data";

export const dynamic = "force-dynamic";

let inMemoryLensesCatalog: AdminLensItem[] = [...DEFAULT_LENSES];

/**
 * Salva com segurança o catálogo de lentes na tabela site_settings,
 * verificando existência do registro por ID para evitar falhas silenciosas de upsert.
 */
async function saveLensesCatalog(adminSupabase: ReturnType<typeof createAdminClient>, lenses: AdminLensItem[]) {
  inMemoryLensesCatalog = lenses;

  if (!isSupabaseConfigured()) {
    return;
  }

  const now = new Date().toISOString();
  const { error } = await adminSupabase
    .from("site_settings")
    .upsert(
      {
        key: "lenses_catalog",
        description: "Catálogo completo de lentes, preços e especificações",
        value: lenses,
        updated_at: now,
      },
      { onConflict: "key" }
    );

  if (error) {
    console.warn("Aviso no upsert de lenses_catalog, aplicando fallback update/insert:", error.message);
    const { data: existing } = await adminSupabase
      .from("site_settings")
      .select("id")
      .eq("key", "lenses_catalog")
      .maybeSingle();

    if (existing?.id) {
      const { error: updateError } = await adminSupabase
        .from("site_settings")
        .update({
          value: lenses,
          description: "Catálogo completo de lentes, preços e especificações",
          updated_at: now,
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Erro ao atualizar lenses_catalog no Supabase:", updateError);
        throw updateError;
      }
    } else {
      const { error: insertError } = await adminSupabase
        .from("site_settings")
        .insert({
          key: "lenses_catalog",
          description: "Catálogo completo de lentes, preços e especificações",
          value: lenses,
          updated_at: now,
        });

      if (insertError) {
        console.error("Erro ao inserir lenses_catalog no Supabase:", insertError);
        throw insertError;
      }
    }
  }
}

/**
 * GET /api/admin/lenses
 * Retorna o catálogo de lentes oficial gravado no Supabase (site_settings.lenses_catalog)
 * sem reinjetar itens que foram intencionalmente excluídos pelo administrador.
 */
export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const adminSupabase = createAdminClient();
      const { data, error } = await adminSupabase
        .from("site_settings")
        .select("value")
        .eq("key", "lenses_catalog")
        .maybeSingle();

      if (!error && data?.value) {
        let list = data.value;
        if (typeof list === "string") {
          try {
            list = JSON.parse(list);
          } catch {}
        }
        if (Array.isArray(list)) {
          inMemoryLensesCatalog = list as AdminLensItem[];
          return NextResponse.json(
            { success: true, lenses: inMemoryLensesCatalog },
            {
              headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
              },
            }
          );
        }
      }
    }

    return NextResponse.json(
      { success: true, lenses: inMemoryLensesCatalog },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.warn("Fallback local de lentes:", err.message);
    return NextResponse.json(
      { success: true, lenses: inMemoryLensesCatalog },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
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

    const adminSupabase = createAdminClient();
    await saveLensesCatalog(adminSupabase, body.lenses);

    try {
      revalidatePath("/");
      revalidatePath("/lentes");
      revalidatePath("/lentes-coloridas");
      revalidatePath("/admin/lentes");
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: "Catálogo de lentes e valores atualizado com sucesso!",
        lenses: inMemoryLensesCatalog,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
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

    let currentList = inMemoryLensesCatalog;

    if (isSupabaseConfigured()) {
      const adminSupabase = createAdminClient();
      const { data } = await adminSupabase
        .from("site_settings")
        .select("value")
        .eq("key", "lenses_catalog")
        .maybeSingle();

      if (data?.value) {
        let list = data.value;
        if (typeof list === "string") {
          try {
            list = JSON.parse(list);
          } catch {}
        }
        if (Array.isArray(list)) {
          currentList = list as AdminLensItem[];
        }
      }
    }

    const updated = currentList.filter((item) => item.id !== lensId);
    const adminSupabase = createAdminClient();
    await saveLensesCatalog(adminSupabase, updated);

    try {
      revalidatePath("/");
      revalidatePath("/lentes");
      revalidatePath("/lentes-coloridas");
      revalidatePath("/admin/lentes");
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: "Lente removida do catálogo com sucesso!",
        lenses: updated,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("Erro ao excluir lente:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao excluir lente." },
      { status: 500 }
    );
  }
}
