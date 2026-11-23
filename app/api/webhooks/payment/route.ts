import { notifyOwnerOrder } from "@/lib/notifications";
import { markCartsRecovered } from "@/lib/abandoned-carts";
import { confirmAdminCouponForOrder } from "@/lib/coupons";
import { dispatchPurchaseForOrder } from "@/lib/tracking/server";
import { after, NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getMercadoPagoCredentials,
  getMercadoPagoPayment,
  isPaymentMockAllowed,
  verifyMercadoPagoWebhookSignature,
} from "@/lib/mercadopago";
import { updatePaymentTransactionStatus } from "@/lib/payment-audit";
import { releaseStockForOrder, reserveStockForOrder, releaseCouponsForOrder } from "@/lib/stock-reservation";
import crypto from "crypto";

export const dynamic = "force-dynamic";

type Resolved = "paid" | "refunded" | "cancelled" | "pending";

/** Status em que o pedido ainda pode virar "pago" (nunca volta atrás de produção/envio). */
const CAN_BECOME_PAID = new Set(["pending", "awaiting_payment", "cancelled"]);
const NOT_PAID_YET = new Set(["pending", "awaiting_payment"]);

function mapMercadoPagoStatus(status: string | undefined): Resolved {
  switch (status) {
    case "approved":
      return "paid";
    case "refunded":
    case "charged_back":
      return "refunded";
    case "cancelled":
    case "rejected":
    case "expired":
      return "cancelled";
    default: // pending, in_process, in_mediation, authorized...
      return "pending";
  }
}

/**
 * Webhook de pagamentos (Mercado Pago).
 * Regra de ouro: o status do pagamento vem SEMPRE da API do Mercado Pago (nunca do corpo da requisição),
 * o valor pago precisa bater com o total do pedido e um pedido pago/em produção nunca é rebaixado.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || req.headers.get("x-webhook-signature");
    const requestId = req.headers.get("x-request-id");
    const searchParams = req.nextUrl.searchParams;

    let payload: any = {};
    if (rawBody.trim()) {
      try {
        payload = JSON.parse(rawBody);
      } catch {
        payload = {};
      }
    }

    const queryId = searchParams.get("data.id") || searchParams.get("id");
    const queryTopic = searchParams.get("topic") || searchParams.get("type");
    const mpPaymentId = payload?.data?.id || queryId || payload?.id;
    const isMpEvent = Boolean(
      mpPaymentId &&
        (payload?.type === "payment" ||
          payload?.action?.startsWith("payment") ||
          queryTopic === "payment")
    );

    // Eventos do MP que não são de pagamento (merchant_order, etc.): confirma recebimento e ignora
    if (!isMpEvent && (payload?.type || queryTopic) && !payload?.order_reference && !payload?.order_id) {
      return NextResponse.json({ received: true, ignored: true }, { status: 200 });
    }

    const creds = await getMercadoPagoCredentials();
    const hasSecret = Boolean(creds.webhookSecret);

    // ── Autenticação ────────────────────────────────────────────────────────────
    if (isMpEvent) {
      // Com secret configurado a assinatura é obrigatória (sem header = rejeitado)
      if (hasSecret) {
        const isValid =
          Boolean(signature) &&
          signature!.includes("ts=") &&
          signature!.includes("v1=") &&
          verifyMercadoPagoWebhookSignature(signature, String(mpPaymentId), creds.webhookSecret, requestId);
        if (!isValid) {
          return NextResponse.json({ error: "Assinatura do webhook Mercado Pago inválida." }, { status: 401 });
        }
      }
    } else {
      // Payload manual (fora do formato MP): só com HMAC válido do corpo, ou em ambiente de teste
      let authorized = isPaymentMockAllowed();
      if (!authorized && hasSecret && signature && !signature.includes("ts=")) {
        try {
          const computed = crypto.createHmac("sha256", creds.webhookSecret!).update(rawBody).digest("hex");
          const sigBuf = Buffer.from(signature, "hex");
          const compBuf = Buffer.from(computed, "hex");
          authorized = sigBuf.length === compBuf.length && crypto.timingSafeEqual(sigBuf, compBuf);
        } catch {
          authorized = false;
        }
      }
      if (!authorized) {
        return NextResponse.json({ error: "Notificação não autorizada." }, { status: 401 });
      }
    }

    let orderReference: string | undefined = payload?.order_reference;
    const orderId: string | undefined = payload?.order_id;
    const paymentId: string | null = payload?.payment_id || (mpPaymentId ? String(mpPaymentId) : null);
    let resolved: Resolved = payload?.status === "paid" ? "paid" : "pending";
    let paidAmountInCents: number | null = null;

    // ── Fonte da verdade: API do Mercado Pago ───────────────────────────────────
    if (isMpEvent && paymentId) {
      const mpPayment = await getMercadoPagoPayment(paymentId);
      if (!mpPayment) {
        // Não conseguimos confirmar: responde erro para o MP tentar de novo (nada é alterado)
        return NextResponse.json({ error: "Não foi possível confirmar o pagamento no Mercado Pago." }, { status: 502 });
      }
      orderReference = mpPayment.external_reference || orderReference;
      resolved = mapMercadoPagoStatus(mpPayment.status);
      if (typeof mpPayment.transaction_amount === "number") {
        paidAmountInCents = Math.round(mpPayment.transaction_amount * 100);
      }

      await updatePaymentTransactionStatus({
        gatewayPaymentId: paymentId,
        referenceCode: orderReference,
        status:
          resolved === "paid" ? "approved" : resolved === "cancelled" || resolved === "refunded" ? "rejected" : "pending",
        statusDetail: mpPayment.status_detail,
        responsePayload: mpPayment,
      });
    }

    if (!orderReference && !orderId) {
      return NextResponse.json({ error: "Identificador do pedido obrigatório." }, { status: 422 });
    }

    const hasLiveDb = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (hasLiveDb) {
      const adminSupabase = createAdminClient();
      let query = adminSupabase
        .from("orders")
        .select("id, reference_code, status, payment_gateway_id, total_in_cents, notes, customer_email, customer_phone");
      query = orderId ? query.eq("id", orderId) : query.eq("reference_code", orderReference as string);

      const { data: order, error: findError } = await query.maybeSingle();
      if (findError) console.warn("Aviso ao buscar pedido no webhook:", findError.message);

      if (order) {
        let newStatus: string | null = null;

        if (resolved === "paid") {
          if (paidAmountInCents !== null && paidAmountInCents !== order.total_in_cents) {
            console.error(
              `[webhook] Valor divergente no pedido ${order.reference_code}: pago ${paidAmountInCents} x pedido ${order.total_in_cents}`
            );
            return NextResponse.json({ received: true, processed: false, reason: "amount_mismatch" }, { status: 200 });
          }
          if (CAN_BECOME_PAID.has(order.status)) newStatus = "paid";
        } else if (resolved === "refunded") {
          if (order.status !== "refunded") newStatus = "refunded";
        } else if (resolved === "cancelled") {
          // Recusa de uma tentativa só cancela pedido que ainda não foi pago
          if (NOT_PAID_YET.has(order.status)) newStatus = "cancelled";
        }
        // "pending"/"in_process": não altera o pedido

        if (newStatus && newStatus !== order.status) {
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
            return NextResponse.json({ error: "Falha ao atualizar pedido no banco." }, { status: 500 });
          }

          // Compra aprovada → evento Purchase pelo servidor (API de Conversões), sem nunca derrubar o webhook
          if (newStatus === "paid") {
            await confirmAdminCouponForOrder(adminSupabase, order.id);
            await markCartsRecovered(adminSupabase, order);
            await dispatchPurchaseForOrder(adminSupabase, order);
            // Aviso de venda ao proprietário (depois de responder ao Mercado Pago; idempotente)
            after(() => notifyOwnerOrder(adminSupabase, order.id, "paid"));
          }

          // Estoque/cupom acompanham o resultado do pagamento
          if (newStatus === "paid" && order.status === "cancelled") {
            // Pago depois de expirar (cartão): a reserva tinha sido devolvida, reserva de novo
            const res = await reserveStockForOrder(adminSupabase, { id: order.id, reference_code: order.reference_code });
            if (!res.ok) {
              console.error(`[webhook] Pedido ${order.reference_code} pago, mas sem estoque para ${res.missing}`);
              await adminSupabase
                .from("orders")
                .update({ notes: [order.notes, "ATENÇÃO: pago após expirar e sem estoque — verificar com o cliente"].filter(Boolean).join(" | ") })
                .eq("id", order.id);
            }
          } else if (newStatus === "cancelled") {
            await releaseStockForOrder(adminSupabase, order.reference_code);
            await releaseCouponsForOrder(adminSupabase, order);
          }
        } else {
          return NextResponse.json(
            { received: true, message: "Sem alteração (idempotente).", status: resolved },
            { status: 200 }
          );
        }
      }
    }

    return NextResponse.json({
      received: true,
      processed: true,
      order_reference: orderReference || orderId,
      status: resolved,
      payment_id: paymentId,
    });
  } catch (error) {
    console.error("Erro interno no webhook:", error);
    return NextResponse.json({ error: "Erro interno no processamento do webhook." }, { status: 500 });
  }
}
