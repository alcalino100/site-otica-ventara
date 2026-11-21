import { test, expect } from "@playwright/test";
import crypto from "crypto";

test.describe("Webhook de pagamento (hardening)", () => {
  test("evento do formato MP sem poder confirmar na API não altera nada (502 para o MP tentar de novo)", async ({ request }) => {
    const res = await request.post("/api/webhooks/payment?data.id=123456789&type=payment", {
      data: { type: "payment", action: "payment.updated", data: { id: "123456789" } },
    });
    // Sem token do MP no ambiente de teste a consulta falha => nunca marca como pago
    expect([502, 401]).toContain(res.status());
  });

  test("eventos que não são de pagamento são apenas reconhecidos", async ({ request }) => {
    const res = await request.post("/api/webhooks/payment?topic=merchant_order&id=555", {
      data: { topic: "merchant_order", resource: "https://api.mercadopago.com/merchant_orders/555" },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).ignored).toBe(true);
  });

  test("checkout Pix em teste ainda devolve QR de simulação com prazo de 30 min", async ({ request }) => {
    const res = await request.post("/api/checkout", {
      data: {
        customer_name: "Cliente Teste Pix",
        customer_email: "pix.teste@oticasventara.com.br",
        customer_phone: "18996155748",
        customer_document: "52998224725",
        delivery_type: "store_pickup",
        payment_method: "pix",
        items: [{ product_id: "prod-1", quantity: 1 }],
      },
    });
    expect(res.status()).toBe(201);
    expect((await res.json()).payment.expires_in_minutes).toBe(30);
  });
});

test("assinatura x-signature do MP inclui request-id e data.id minúsculo", async () => {
  const { verifyMercadoPagoWebhookSignature } = await import("../lib/mercadopago-signature");
  const secret = "segredo-teste";
  const ts = "1700000000";
  const manifest = `id:abc123;request-id:req-1;ts:${ts};`;
  const v1 = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  expect(verifyMercadoPagoWebhookSignature(`ts=${ts},v1=${v1}`, "ABC123", secret, "req-1")).toBe(true);
  expect(verifyMercadoPagoWebhookSignature(`ts=${ts},v1=${v1}`, "abc123", secret, "outro")).toBe(false);
  expect(verifyMercadoPagoWebhookSignature(null, "abc123", secret, "req-1")).toBe(false);
});
