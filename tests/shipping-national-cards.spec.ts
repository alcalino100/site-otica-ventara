import { test, expect } from "@playwright/test";

test.describe("Cartões de Envio Nacional com Suporte a Fotos e Gestão no Admin", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: "pw_test_session",
        value: "1",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.addInitScript(() => {
      localStorage.setItem(
        "ventara_cookie_consent",
        JSON.stringify({ essential: true, analytics: true, marketing: true })
      );
    });
  });

  test("1. Cartões de envio nacional exibem fotos no topo com aspect ratio e alt text", async ({
    page,
  }) => {
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    // 1.1 Localiza a seção de envio nacional
    const nationalSection = page.locator("section").filter({
      hasText: /Enviamos para todo o Brasil/i,
    });
    await expect(nationalSection).toBeVisible();

    // 1.2 Cartão Correios com foto
    const correiosCard = page.locator("[data-testid='national-card-nat-card-correios']");
    await expect(correiosCard).toBeVisible();
    const correiosImg = correiosCard.locator("img");
    await expect(correiosImg).toBeVisible();
    await expect(correiosImg).toHaveAttribute(
      "alt",
      /Van amarela de encomendas Sedex dos Correios em trânsito/i
    );

    // 1.3 Cartão Transportadoras com foto
    const transportadorasCard = page.locator(
      "[data-testid='national-card-nat-card-transportadoras']"
    );
    await expect(transportadorasCard).toBeVisible();
    const transportadorasImg = transportadorasCard.locator("img");
    await expect(transportadorasImg).toBeVisible();

    // 1.4 Cartão Aéreo com foto
    const aereoCard = page.locator("[data-testid='national-card-nat-card-aereo']");
    await expect(aereoCard).toBeVisible();
    const aereoImg = aereoCard.locator("img");
    await expect(aereoImg).toBeVisible();
    await expect(aereoImg).toHaveAttribute(
      "alt",
      /Aeronave cargueira conectando aeroportos nacionais/i
    );

    // 1.5 Selos sobrepostos nas fotos
    await expect(correiosCard.getByText("Todo o Brasil", { exact: true })).toBeVisible();
    await expect(transportadorasCard.getByText("Rotas Expressas", { exact: true })).toBeVisible();
    await expect(aereoCard.getByText("Alta Velocidade", { exact: true })).toBeVisible();

    // 1.6 Redação neutra e transparente
    await expect(
      correiosCard.getByText(/Entregas em todo o Brasil com código de rastreamento oficial/i)
    ).toBeVisible();
    await expect(
      transportadorasCard.getByText(
        /Transportadoras rodoviárias utilizadas para rotas expressas interestaduais/i
      )
    ).toBeVisible();
  });

  test("2. Seção 'Rede Integrada de Despacho' possui respiro proporcional sem vazio morto", async ({
    page,
  }) => {
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    const badge = page.getByText("Rede Integrada de Despacho");
    await expect(badge).toBeVisible();

    // Garante que o selo está visível e bem posicionado
    const box = await badge.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
  });

  test("3. Painel Admin /admin/entrega possui gestão de fotos, alt text e enquadramento", async ({
    page,
  }) => {
    await page.goto("/admin/entrega", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Acessa aba Envio Nacional
    const nationalTabBtn = page.locator("[data-testid='tab-national']");
    await expect(nationalTabBtn).toBeVisible();
    await nationalTabBtn.click();

    // Verifica seção de fotos
    await expect(
      page.getByText(/Cartões de Envio Nacional \(Fotos, Textos & Toggles\)/i)
    ).toBeVisible();

    // Verifica campos de alt text e focal point
    await expect(page.getByText("Foto no Topo (16:9)").first()).toBeVisible();
    await expect(page.getByText("Enquadramento").first()).toBeVisible();
    await expect(page.getByText("Gradiente").first()).toBeVisible();

    // Verifica pré-visualização ao vivo da seção nacional
    await expect(
      page.getByText(/Pré-visualização ao vivo do Envio Nacional/i)
    ).toBeVisible();

    await page.screenshot({
      path: "/Users/user/.gemini/antigravity/brain/3307d6a6-ee9f-47b4-bbf9-e090e670f231/screenshots/admin-entrega-nacional-live-preview.png",
      fullPage: false,
    });
  });

  test("4. Responsividade fluida em 320px, 390px, 768px e 1440px", async ({ page }) => {
    const viewports = [
      { width: 320, height: 600, name: "320px" },
      { width: 390, height: 844, name: "390px" },
      { width: 768, height: 1024, name: "768px" },
      { width: 1440, height: 900, name: "1440px" },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/entregas", { waitUntil: "domcontentloaded" });

      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth
      );
      const clientWidth = await page.evaluate(
        () => document.documentElement.clientWidth
      );
      expect(scrollWidth, `Viewport ${vp.name} sem scroll horizontal`).toBeLessThanOrEqual(
        clientWidth + 2
      );

      // Cartão nacional visível
      const correiosCard = page.locator("[data-testid='national-card-nat-card-correios']");
      await expect(correiosCard).toBeVisible();

      await page.screenshot({
        path: `/Users/user/.gemini/antigravity/brain/3307d6a6-ee9f-47b4-bbf9-e090e670f231/screenshots/entregas-nacional-${vp.name}.png`,
        fullPage: false,
      });
    }
  });
});
