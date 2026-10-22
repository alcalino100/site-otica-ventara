import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { variant_id, product_id, movement_type, quantity, balance_after, reason } = body;

    if (!variant_id || typeof balance_after !== "number") {
      return NextResponse.json(
        { error: "Dados de movimentação de estoque incompletos." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // 1. Atualiza quantidade na tabela 'product_variants'
    const { error: variantError } = await adminSupabase
      .from("product_variants")
      .update({
        stock_quantity: balance_after,
        updated_at: new Date().toISOString(),
      })
      .eq("id", variant_id);

    if (variantError) {
      console.error("Erro ao atualizar variante de estoque:", variantError);
      return NextResponse.json(
        { error: `Erro ao atualizar estoque: ${variantError.message}` },
        { status: 400 }
      );
    }

    // 2. Registra histórico em 'inventory_movements' (ou 'stock_movements')
    try {
      await adminSupabase.from("inventory_movements").insert({
        product_id,
        variant_id,
        movement_type,
        quantity,
        balance_after,
        reason: reason || `Ajuste manual (${movement_type})`,
      });
    } catch (movErr) {
      console.warn("Aviso ao registrar histórico em inventory_movements:", movErr);
    }

    return NextResponse.json({
      success: true,
      balance_after,
    });
  } catch (err: any) {
    console.error("Erro interno ao movimentar estoque:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao movimentar estoque." },
      { status: 500 }
    );
  }
}
