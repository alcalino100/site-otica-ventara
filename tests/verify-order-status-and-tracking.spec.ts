import { test, expect } from "@playwright/test";

test.describe("Fluxo de Status de Pedidos e Rastreamento Público", () => {
  test.beforeEach(async ({ page, request }) => {
    // Reseta estado dos pedidos demo para isolamento entre testes
    await request.get("/api/admin/orders?reset=1");

    // Evita interferência de banners de consentimento de cookies
    await page.addInitScript(() => {
      localStorage.setItem(
        "ventara_cookie_consent",
        JSON.stringify({ essential: true, analytics: true, marketing: true })
      );
    });
  });

  test("1. Pedido em 'Retirada na Loja': Página pública exibe etapa de retirada no balcão sem menção a Correios", async ({
    page,
  }) => {
    await page.goto("/rastreio?code=VEN-10380", { waitUntil: "domcontentloaded" });

    // Verifica que o pedido foi carregado
    await expect(page.getByText("VEN-10380")).toBeVisible({ timeout: 10000 });

    // 1.1 Status Label e Badge: deve indicar Retirada
    await expect(page.getByText(/Pronto para Retirada/i).first()).toBeVisible();

    // 1.2 Descrição do Laboratório: orienta retirada na loja física de Araçatuba
    await expect(
      page.getByText(/balcão da (loja|Óticas Ventara)|Araçatuba/i).first()
    ).toBeVisible();

    // 1.3 Linha do tempo: a etapa final deve ser 'Pronto para Retirada na Loja'
    const timeline = page.locator(".grid.sm\\:grid-cols-5, .space-y-6");
    await expect(timeline.getByText(/Pronto para Retirada na Loja/i)).toBeVisible();

    // 1.4 Não deve conter texto de envio postal nem link dos Correios
    await expect(page.getByText(/Acompanhar nos Correios/i)).toHaveCount(0);
    await expect(timeline.getByText(/Enviado e Despachado/i)).toHaveCount(0);

    // 1.5 Local de entrega/retirada deve apontar o endereço da loja física
    await expect(page.getByText(/Rua Princesa Isabel, 221/i).first()).toBeVisible();
  });

  test("2. Pedido em 'Enviado / Despachado': Página pública exibe envio postal e código de rastreamento", async ({
    page,
  }) => {
    await page.goto("/rastreio?code=VEN-10415", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("VEN-10415")).toBeVisible({ timeout: 10000 });

    // Status deve ser de envio
    await expect(page.getByText(/Enviado|Despachado/i).first()).toBeVisible();

    // Código de rastreamento postal visível
    await expect(page.getByText("BR839210492VENT").first()).toBeVisible();
    await expect(page.getByText(/Acompanhar nos Correios/i)).toBeVisible();

    // Linha do tempo deve conter etapa de despacho/envio
    await expect(page.getByText(/Enviado e Despachado|Pacote Despachado/i).first()).toBeVisible();
  });

  test("3. Pedido 'Em Montagem no Laboratório' (preparing): Linha do tempo reflete etapa de produção", async ({
    page,
  }) => {
    await page.goto("/rastreio?code=VEN-10294", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("VEN-10294")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Em Montagem no Laboratório/i).first()).toBeVisible();
    await expect(page.getByText(/facetadora digital|biselamento/i).first()).toBeVisible();
  });

  test("4. Admin: Alteração de status para 'Retirada na Loja' reflete instantaneamente na página pública", async ({
    page,
  }) => {
    // Configura autenticação mock de administrador
    await page.context().addCookies([
      {
        name: "ventara_admin_session",
        value: "active_test_session",
        domain: "localhost",
        path: "/",
      },
    ]);

    // 4.1 Acessa o painel de pedidos no admin
    await page.goto("/admin/pedidos", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Gestão de Pedidos")).toBeVisible({ timeout: 10000 });

    // Localiza a linha do pedido VEN-10415
    const orderRow = page.locator("tr").filter({ hasText: "VEN-10415" });
    await expect(orderRow).toBeVisible();

    // 4.2 Altera o status no select para 'Retirada na Loja'
    const statusSelect = orderRow.locator("select");
    await statusSelect.selectOption("ready_for_pickup");

    // Verifica que o badge na linha do admin atualizou para 'Retirada na Loja'
    await expect(
      orderRow.locator("span").filter({ hasText: /Retirada na Loja/i })
    ).toBeVisible({ timeout: 5000 });

    // 4.3 Acessa agora a página pública de rastreamento para o mesmo pedido VEN-10415
    await page.goto("/rastreio?code=VEN-10415", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("VEN-10415")).toBeVisible({ timeout: 10000 });

    // 4.4 Deve refletir imediatamente 'Pronto para Retirada na Loja' sem código dos Correios
    await expect(page.getByText(/Pronto para Retirada/i).first()).toBeVisible();
    await expect(page.getByText(/Pronto para Retirada na Loja/i).first()).toBeVisible();
    await expect(page.getByText(/Acompanhar nos Correios/i)).toHaveCount(0);
  });
});
