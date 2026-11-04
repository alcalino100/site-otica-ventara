import { NextRequest } from "next/server";
import { POST as handlePaymentWebhook } from "../payment/route";

export const dynamic = "force-dynamic";

/**
 * Endpoint oficial dedicado para Webhooks do Mercado Pago:
 * POST /api/webhooks/mercadopago
 */
export async function POST(req: NextRequest) {
  return handlePaymentWebhook(req);
}
