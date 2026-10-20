import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

/**
 * Webhook Idempotente para Processamento de Pagamentos
 * Suporta webhooks assinados de gateways brasileiros (Asaas / Mercado Pago / Stripe).
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature") || req.headers.get("x-signature");
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;

    // 1. Validação de Assinatura Criptográfica quando chave configurada em produção
    if (webhookSecret && signature) {
      const computedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (signature !== computedSignature) {
        return NextResponse.json({ error: "Assinatura do webhook inválida." }, { status: 401 });
      }
    }

    let payload: {
      event?: string;
      order_reference?: string;
      order_id?: string;
      payment_id?: string;
      status?: "paid" | "failed" | "canceled";
    };

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Payload JSON malformado." }, { status: 400 });
    }

    const { order_reference, order_id, payment_id, status = "paid" } = payload;

    if (!order_reference && !order_id) {
      return NextResponse.json(
        { error: "Identificador de pedido (order_reference ou order_id) obrigatório." },
        { status: 422 }
      );
    }

    const adminSupabase = createAdminClient();
    const hasLiveDb = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (hasLiveDb) {
      // 2. Consulta de Idempotência
      const query = adminSupabase.from("orders").select("id, reference_code, status");
      if (order_id) {
        query.eq("id", order_id);
      } else if (order_reference) {
        query.eq("reference_code", order_reference);
      }

      const { data: order, error: findError } = await query.maybeSingle();

      if (findError || !order) {
        return NextResponse.json({ error: "Pedido não localizado para o webhook." }, { status: 404 });
      }

      // Se o pedido já estiver marcado como pago, responde com sucesso e encerra (idempotência)
      if (order.status === "paid") {
        return NextResponse.json(
          { received: true, message: "Webhook já processado anteriormente (idempotente)." },
          { status: 200 }
        );
      }

      // 3. Atualização de Status
      const newStatus = status === "paid" ? "paid" : "cancelled";
      const { error: updateError } = await adminSupabase
        .from("orders")
        .update({
          status: newStatus,
          payment_gateway_id: payment_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) {
        console.error("Erro ao atualizar status do pedido no webhook:", updateError);
        return NextResponse.json({ error: "Falha ao atualizar pedido." }, { status: 500 });
      }
    }

    return NextResponse.json({
      received: true,
      processed: true,
      order_reference: order_reference || order_id,
      status: status === "paid" ? "paid" : "cancelled",
    });
  } catch (error) {
    console.error("Erro interno no webhook:", error);
    return NextResponse.json({ error: "Erro interno no processamento do webhook." }, { status: 500 });
  }
}
