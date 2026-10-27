import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getMercadoPagoCredentials,
  getMercadoPagoPayment,
  verifyMercadoPagoWebhookSignature,
} from "@/lib/mercadopago";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * Webhook Idempotente para Processamento de Pagamentos
 * Suporta webhooks oficiais do Mercado Pago (IPN & Webhooks v2) e payloads assinados.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-signature") ||
      req.headers.get("x-webhook-signature");
    const searchParams = req.nextUrl.searchParams;

    let payload: any = {};
    if (rawBody.trim()) {
      try {
        payload = JSON.parse(rawBody);
      } catch {
        payload = {};
      }
    }

    // 1. Identificação do formato Mercado Pago (data.id ou query param topic=payment)
    const queryId = searchParams.get("id") || searchParams.get("data.id");
    const queryTopic = searchParams.get("topic") || searchParams.get("type");
    const mpPaymentId = payload?.data?.id || payload?.id || queryId;
    const isMpEvent = Boolean(
      mpPaymentId &&
        (payload?.type === "payment" ||
          payload?.action?.startsWith("payment") ||
          queryTopic === "payment")
    );

    let orderReference = payload?.order_reference;
    let orderId = payload?.order_id;
    let paymentId = payload?.payment_id || (mpPaymentId ? String(mpPaymentId) : null);
    let resolvedStatus: "paid" | "failed" | "cancelled" | "pending" =
      payload?.status === "paid" ? "paid" : payload?.status ? "cancelled" : "paid";

    const creds = await getMercadoPagoCredentials();

    // 2. Validação Criptográfica de Assinatura se configurada
    if (creds.webhookSecret && signature) {
      if (signature.includes("ts=") && signature.includes("v1=")) {
        const isValid = verifyMercadoPagoWebhookSignature(
          signature,
          paymentId,
          creds.webhookSecret
        );
        if (!isValid) {
          return NextResponse.json(
            { error: "Assinatura do webhook Mercado Pago inválida." },
            { status: 401 }
          );
        }
      } else {
        // Formato legado HMAC-SHA256 simples
        const computedSignature = crypto
          .createHmac("sha256", creds.webhookSecret)
          .update(rawBody)
          .digest("hex");

        const sigBuf = Buffer.from(signature, "hex");
        const compBuf = Buffer.from(computedSignature, "hex");

        if (sigBuf.length !== compBuf.length || !crypto.timingSafeEqual(sigBuf, compBuf)) {
          return NextResponse.json(
            { error: "Assinatura do webhook inválida." },
            { status: 401 }
          );
        }
      }
    }

    // 3. Consulta à API do Mercado Pago caso seja notificação de pagamento
    if (isMpEvent && paymentId) {
      const mpPayment = await getMercadoPagoPayment(paymentId);
      if (mpPayment) {
        orderReference = mpPayment.external_reference || orderReference;
        if (mpPayment.status === "approved") {
          resolvedStatus = "paid";
        } else if (
          mpPayment.status === "cancelled" ||
          mpPayment.status === "rejected" ||
          mpPayment.status === "refunded"
        ) {
          resolvedStatus = "cancelled";
        } else {
          resolvedStatus = "pending";
        }
      }
    }

    if (!orderReference && !orderId && !paymentId) {
      return NextResponse.json(
        { error: "Identificador de pedido ou pagamento obrigatório." },
        { status: 422 }
      );
    }

    const adminSupabase = createAdminClient();
    const hasLiveDb = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    if (hasLiveDb) {
      // 4. Consulta do pedido no banco de dados
      let query = adminSupabase.from("orders").select("id, reference_code, status, payment_gateway_id");
      if (orderId) {
        query = query.eq("id", orderId);
      } else if (orderReference) {
        query = query.eq("reference_code", orderReference);
      } else if (paymentId) {
        query = query.eq("payment_gateway_id", paymentId);
      }

      const { data: order, error: findError } = await query.maybeSingle();

      if (findError) {
        console.warn("Aviso ao buscar pedido no webhook:", findError.message);
      }

      if (order) {
        // Idempotência: Se já estiver pago e a notificação for "paid", não faz nada
        if (order.status === "paid" && resolvedStatus === "paid") {
          return NextResponse.json(
            { received: true, message: "Webhook já processado anteriormente (idempotente)." },
            { status: 200 }
          );
        }

        const newStatus = resolvedStatus === "paid" ? "paid" : "cancelled";
        const { error: updateError } = await adminSupabase
          .from("orders")
          .update({
            status: newStatus,
            payment_gateway_id: paymentId || order.payment_gateway_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (updateError) {
          console.error("Erro ao atualizar status do pedido no webhook:", updateError);
          return NextResponse.json(
            { error: "Falha ao atualizar pedido no banco." },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({
      received: true,
      processed: true,
      order_reference: orderReference || orderId || paymentId,
      status: resolvedStatus,
      payment_id: paymentId,
    });
  } catch (error) {
    console.error("Erro interno no webhook:", error);
    return NextResponse.json(
      { error: "Erro interno no processamento do webhook." },
      { status: 500 }
    );
  }
}
