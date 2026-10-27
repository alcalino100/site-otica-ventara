import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const referenceCode = searchParams.get("reference_code") || searchParams.get("ref");
    const orderId = searchParams.get("order_id");

    if (!referenceCode && !orderId) {
      return NextResponse.json(
        { error: "Código do pedido (reference_code ou order_id) é obrigatório." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const hasLiveDb = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (!hasLiveDb) {
      return NextResponse.json({
        status: "pending",
        is_paid: false,
        reference_code: referenceCode,
      });
    }

    let query = adminSupabase
      .from("orders")
      .select("id, reference_code, status, total_in_cents, payment_method, updated_at");

    if (orderId) {
      query = query.eq("id", orderId);
    } else if (referenceCode) {
      query = query.eq("reference_code", referenceCode);
    }

    const { data: order, error } = await query.maybeSingle();

    if (error || !order) {
      return NextResponse.json(
        { error: "Pedido não localizado." },
        { status: 404 }
      );
    }

    const isPaid = order.status === "paid";

    return NextResponse.json({
      order_id: order.id,
      reference_code: order.reference_code,
      status: order.status,
      is_paid: isPaid,
      total_in_cents: order.total_in_cents,
      payment_method: order.payment_method,
      updated_at: order.updated_at,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro ao consultar status do pedido." },
      { status: 500 }
    );
  }
}
