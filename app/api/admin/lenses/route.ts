import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_LENSES, AdminLensItem } from "@/lib/lenses-data";

export const dynamic = "force-dynamic";

let inMemoryLensesCatalog: AdminLensItem[] = [...DEFAULT_LENSES];

export async function GET() {
  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("site_settings")
      .select("value")
      .eq("key", "lenses_catalog")
      .maybeSingle();

    if (!error && data?.value && Array.isArray(data.value)) {
      // Mescla com DEFAULT_LENSES para assegurar que novas adições do catálogo (ex: lentes coloridas) estejam sempre presentes
      const savedMap = new Map<string, AdminLensItem>(data.value.map((item: AdminLensItem) => [item.id, item]));
      const merged = [...data.value];
      for (const def of DEFAULT_LENSES) {
        if (!savedMap.has(def.id)) {
          merged.push(def);
        }
      }
      inMemoryLensesCatalog = merged;
      return NextResponse.json({ success: true, lenses: merged });
    }

    return NextResponse.json({ success: true, lenses: inMemoryLensesCatalog });
  } catch (err: any) {
    console.warn("Fallback local de lentes:", err.message);
    return NextResponse.json({ success: true, lenses: inMemoryLensesCatalog });
  }
}

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
