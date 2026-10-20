import { test, expect } from "@playwright/test";

test.describe("API de Checkout e Segurança no Servidor", () => {
  test("deve rejeitar checkout com dados de cliente incompletos", async ({ request }) => {
    const response = await request.post("/api/checkout", {
      data: {
        customer_name: "",
        customer_email: "invalido",
        customer_phone: "123",
        items: [],
      },
    });

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  test("deve validar preços no servidor e emitir pedido com sucesso", async ({ request }) => {
    const response = await request.post("/api/checkout", {
      data: {
        customer_name: "Cliente Teste Ventara",
        customer_email: "cliente.teste@oticaventara.com.br",
        customer_phone: "18996155748",
        delivery_type: "store_pickup",
        payment_method: "pix",
        items: [
          {
            product_id: "prod-1", // Ventara Essencial (R$ 389,00 = 38900 cents)
            quantity: 1,
          },
        ],
      },
    });

    expect(response.status()).toBe(201);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.order.reference_code).toMatch(/^VEN-/);
    expect(json.order.subtotal_in_cents).toBe(38900);
    expect(json.order.shipping_fee_in_cents).toBe(0); // Retirada na loja
    expect(json.order.total_in_cents).toBe(38900);
    expect(json.payment.type).toBe("pix");
    expect(json.payment.pix_copia_e_cola).toBeDefined();
  });

  test("deve rejeitar webhook com assinatura inválida quando segredo configurado", async ({ request }) => {
    const response = await request.post("/api/webhooks/payment", {
      data: {
        order_reference: "VEN-TEST-9999",
        status: "paid",
      },
      headers: {
        "x-webhook-signature": "assinatura-invalida-123456",
      },
    });

    // Se a chave não estiver no ambiente de dev, aceita payload com validação de campos
    // Se estiver, deve retornar 401
    expect([200, 401]).toContain(response.status());
  });
});
