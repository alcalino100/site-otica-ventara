import { test, expect } from "@playwright/test";

test.describe("Mercado Pago Integration - Óticas Ventara", () => {
  test("deve gerar cobrança Pix via Mercado Pago com dados de transação e QR Code", async ({
    request,
  }) => {
    const response = await request.post("/api/checkout", {
      data: {
        customer_name: "Gabriel Medeiros",
        customer_email: "gabriel.medeiros@gmail.com",
        customer_phone: "18997123456",
        customer_document: "12345678909",
        delivery_type: "store_pickup",
        payment_method: "pix",
        items: [
          {
            product_id: "prod-1",
            quantity: 1,
          },
        ],
      },
    });

    expect(response.status()).toBe(201);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.order.reference_code).toMatch(/^VEN-/);
    expect(data.order.payment_method).toBe("pix");
    expect(data.payment.type).toBe("pix");
    expect(data.payment.gateway).toBe("mercadopago");
    expect(data.payment.payment_id).toBeDefined();
    expect(data.payment.pix_copia_e_cola).toMatch(/^000201/);
    expect(data.payment.expires_in_minutes).toBe(30);
  });

  test("deve gerar preferência de pagamento com Cartão via Mercado Pago", async ({
    request,
  }) => {
    const response = await request.post("/api/checkout", {
      data: {
        customer_name: "Mariana Vasconcelos",
        customer_email: "mariana.vasconcelos@gmail.com",
        customer_phone: "18991234567",
        customer_document: "98765432100",
        delivery_type: "delivery",
        shipping_address: {
          street: "Rua Princesa Isabel",
          number: "221",
          neighborhood: "Centro",
          city: "Araçatuba",
          state: "SP",
          postal_code: "16010250",
        },
        payment_method: "credit_card",
        items: [
          {
            product_id: "prod-2",
            quantity: 1,
          },
        ],
      },
    });

    expect(response.status()).toBe(201);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.order.payment_method).toBe("credit_card");
    expect(data.payment.type).toBe("credit_card");
    expect(data.payment.gateway).toBe("mercadopago");
    expect(data.payment.preference_id).toBeDefined();
    expect(data.payment.checkout_url).toBeDefined();
  });

  test("deve consultar status do pedido em tempo real via /api/orders/check-status", async ({
    request,
  }) => {
    const createRes = await request.post("/api/checkout", {
      data: {
        customer_name: "Lucas Teste",
        customer_email: "lucas@teste.com",
        customer_phone: "18996155748",
        customer_document: "11122233344",
        delivery_type: "store_pickup",
        payment_method: "pix",
        items: [{ product_id: "prod-1", quantity: 1 }],
      },
    });

    const createData = await createRes.json();
    const refCode = createData.order.reference_code;

    const statusRes = await request.get(
      `/api/orders/check-status?reference_code=${encodeURIComponent(refCode)}`
    );
    expect(statusRes.status()).toBe(200);

    const statusData = await statusRes.json();
    expect(statusData.reference_code).toBe(refCode);
    expect(statusData.status).toBe("awaiting_payment");
    expect(statusData.is_paid).toBe(false);
  });

  test("deve processar notificação de webhook do Mercado Pago com idempotência", async ({
    request,
  }) => {
    const createRes = await request.post("/api/checkout", {
      data: {
        customer_name: "Cliente Webhook MP",
        customer_email: "webhook.mp@oticasventara.com.br",
        customer_phone: "18996155748",
        customer_document: "33344455566",
        delivery_type: "store_pickup",
        payment_method: "pix",
        items: [{ product_id: "prod-1", quantity: 1 }],
      },
    });
    const order = (await createRes.json()).order;

    const webhookRes = await request.post("/api/webhooks/payment", {
      data: {
        order_reference: order.reference_code,
        payment_id: "MP-TEST-12345",
        status: "paid",
      },
    });

    expect(webhookRes.status()).toBe(200);
    const webhookData = await webhookRes.json();
    expect(webhookData.received).toBe(true);
    expect(webhookData.status).toBe("paid");

    const secondWebhookRes = await request.post("/api/webhooks/payment", {
      data: {
        order_reference: order.reference_code,
        payment_id: "MP-TEST-12345",
        status: "paid",
      },
    });
    expect(secondWebhookRes.status()).toBe(200);
  });

  test("deve retornar configurações de pagamento em /api/admin/payments", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/payments");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.gateway).toBe("mercadopago");
    expect(["production", "sandbox"]).toContain(data.environment);
    expect(data.webhook_url).toContain("/api/webhooks/payment");
    expect(data.pix_enabled).toBe(true);
    expect(data.credit_card_enabled).toBe(true);
  });

  test("deve exibir painel administrativo do Mercado Pago com webhook e teste de conexão", async ({
    page,
  }) => {
    await page.goto("/admin/pagamentos");
    await expect(page.locator("h1")).toContainText("Mercado Pago");
    await expect(page.locator("span:has-text('MERCADO PAGO')").first()).toBeVisible();
    await expect(page.locator("text=Gateway Ativo no E-commerce")).toBeVisible();

    // Verifica campos de formulário
    await expect(
      page.locator("text=Access Token (Chave Privada do Servidor)")
    ).toBeVisible();
    await expect(
      page.locator("text=Chave Pública (Public Key)")
    ).toBeVisible();
    await expect(
      page.locator("text=URL do Webhook para Confirmação Automática")
    ).toBeVisible();

    // Botão de testar conexão
    const testBtn = page.getByRole("button", { name: /Testar Conexão/i });
    await expect(testBtn).toBeVisible();
  });

  test("deve permitir fluxo completo de checkout Pix pelo carrinho na interface", async ({
    page,
  }) => {
    // 1. Acessa a página inicial
    await page.goto("/");

    // 2. Localiza e clica no botão de adicionar à seleção da primeira armação
    const addBtn = page.locator("button[aria-label*='Adicionar'][aria-label*='à seleção']").first();
    await addBtn.scrollIntoViewIfNeeded();
    await expect(addBtn).toBeVisible({ timeout: 10000 });
    await addBtn.click();

    // 3. Abre a sacola pelo botão do header
    const openCartBtn = page.locator("button[aria-label*='Abrir seleção']");
    await expect(openCartBtn).toBeVisible();
    await openCartBtn.click();

    // 4. Verifica gaveta de checkout aberta e clica no botão Mercado Pago
    const checkoutCta = page.getByRole("button", {
      name: /FINALIZAR COMPRA COM MERCADO PAGO/i,
    });
    await expect(checkoutCta).toBeVisible({ timeout: 10000 });
    await checkoutCta.click();

    // 5. Formulário de checkout
    await expect(page.locator("text=Finalizar Pedido")).toBeVisible();
    await expect(page.locator("text=1. Seus Dados de Contato")).toBeVisible();
    await expect(page.locator("text=3. Pagamento Mercado Pago")).toBeVisible();

    // 6. Preenche dados do cliente
    await page.locator("input[placeholder*='Gustavo Silva']").fill("Cliente Playwright");
    await page.locator("input[placeholder*='seu@email.com']").fill("playwright@teste.com");
    await page.locator("input[placeholder*='(18) 99999-9999']").fill("18996155748");
    await page.locator("input[placeholder*='000.000.000-00']").fill("12345678909");

    // 7. Seleciona Pix e Retirada na loja
    await page.getByRole("button", { name: /Retirada na Loja/i }).click();
    await page.getByRole("button", { name: /Pix Instantâneo/i }).click();

    // 8. Submete pedido
    const submitBtn = page.getByRole("button", {
      name: /GERAR PIX NO MERCADO PAGO/i,
    });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 9. Tela de Pix dinâmico
    await expect(page.locator("text=Pagamento via Pix")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("text=PEDIDO REGISTRADO: VEN-")).toBeVisible();
    await expect(page.locator("text=Código Pix (Copia e Cola):")).toBeVisible();
    await expect(page.locator("button:has-text('Copiar')")).toBeVisible();
  });
});
