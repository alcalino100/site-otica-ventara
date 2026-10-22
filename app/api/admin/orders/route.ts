import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID e status do pedido são obrigatórios." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar pedido:", error);
      return NextResponse.json(
        { error: `Erro ao atualizar pedido: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: data,
    });
  } catch (err: any) {
    console.error("Erro interno ao atualizar pedido:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao atualizar pedido." },
      { status: 500 }
    );
  }
}
