import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, ids, priceType, priceValue, is_published, is_available } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Nenhum produto selecionado para a ação em lote." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    if (action === "update_status") {
      if (typeof is_published !== "boolean") {
        return NextResponse.json(
          { error: "Status de publicação inválido." },
          { status: 400 }
        );
      }

      const { error } = await adminSupabase
        .from("products")
        .update({
          is_published,
          updated_at: new Date().toISOString(),
        })
        .in("id", ids);

      if (error) {
        return NextResponse.json(
          { error: `Erro ao atualizar status: ${error.message}` },
          { status: 500 }
        );
      }
    } else if (action === "update_availability") {
      const isAvail = Boolean(is_available);
      const { error } = await adminSupabase
        .from("products")
        .update({
          is_available: isAvail,
          updated_at: new Date().toISOString(),
        })
        .in("id", ids);

      if (error) {
        return NextResponse.json(
          { error: `Erro ao atualizar disponibilidade: ${error.message}` },
          { status: 500 }
        );
      }
    } else if (action === "update_price") {
      if (typeof priceValue !== "number" || isNaN(priceValue)) {
        return NextResponse.json(
          { error: "Valor de preço inválido." },
          { status: 400 }
        );
      }

      // Se for percentual, precisamos consultar os preços atuais dos produtos
      if (priceType === "percentage") {
        const { data: currentProducts, error: fetchErr } = await adminSupabase
          .from("products")
          .select("id, price_in_cents")
          .in("id", ids);

        if (fetchErr) {
          return NextResponse.json(
            { error: `Erro ao consultar produtos: ${fetchErr.message}` },
            { status: 500 }
          );
        }

        const updates = (currentProducts || []).map((p) => {
          const factor = 1 + priceValue / 100;
          const newPrice = Math.max(0, Math.round((p.price_in_cents || 0) * factor));
          return adminSupabase
            .from("products")
            .update({
              price_in_cents: newPrice,
              updated_at: new Date().toISOString(),
            })
            .eq("id", p.id);
        });

        await Promise.all(updates);
      } else {
        // Preço fixo em centavos
        const targetPriceInCents = Math.max(0, Math.round(priceValue));
        const { error } = await adminSupabase
          .from("products")
          .update({
            price_in_cents: targetPriceInCents,
            updated_at: new Date().toISOString(),
          })
          .in("id", ids);

        if (error) {
          return NextResponse.json(
            { error: `Erro ao atualizar preços: ${error.message}` },
            { status: 500 }
          );
        }
      }
    } else {
      return NextResponse.json(
        { error: `Ação desconhecida: ${action}` },
        { status: 400 }
      );
    }

    try {
      revalidatePath("/");
      revalidatePath("/armacoes");
      revalidatePath("/admin/produtos");
    } catch {
      // Ignora erro de revalidação
    }

    return NextResponse.json({
      success: true,
      affectedCount: ids.length,
      action,
    });
  } catch (err: any) {
    console.error("Erro interno em lote de produtos:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao processar lote." },
      { status: 500 }
    );
  }
}
