import { test, expect } from "@playwright/test";

test.describe("Validação Completa do Lote de Alterações - Óticas Ventara", () => {
  test("1. Link oficial do Facebook no rodapé", async ({ page }) => {
    await page.goto("/");
    const facebookLink = page.locator("a[href*='facebook.com/share/19mUxSqUnf']");
    await expect(facebookLink).toBeVisible();
    await expect(facebookLink).toHaveAttribute("target", "_blank");
  });

  test("2. Responsável Técnico no Celular sem sobreposição na foto do Gustavo", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/responsavel-tecnico");
    await page.waitForTimeout(500);

    const badgePanel = page.locator("text=TÉCNICO ÓPTICO FORMADO").first();
    await expect(badgePanel).toBeVisible();

    const portrait = page.locator("img[alt*='Gustavo']").first();
    await expect(portrait).toBeVisible();

    const badgeBox = await badgePanel.boundingBox();
    const portraitBox = await portrait.boundingBox();

    expect(badgeBox).not.toBeNull();
    expect(portraitBox).not.toBeNull();

    // No mobile, o painel de badges fica acima da foto (não cobre os olhos do técnico)
    console.log(`Badge Y: ${badgeBox!.y}, Portrait Y: ${portraitBox!.y}`);
    expect(badgeBox!.y).toBeLessThan(portraitBox!.y);

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/mobile-tecnico-optico-badges.png",
    });
  });

  test("3. Banner de Garantia de 12 Meses OPTiSYNC HD no lugar de Nossos Números", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500);

    // Confirma que 'Nossos Números' não existe mais
    const oldNumbers = page.locator("text=Nossos Números");
    await expect(oldNumbers).toHaveCount(0);

    // Confirma que o Banner de Garantia está presente
    const warrantyBanner = page.locator("section[aria-label*='Garantia']");
    await expect(warrantyBanner).toBeVisible();

    const bannerImg = warrantyBanner.locator("img[alt*='OPTiSYNC HD']:visible").first();
    await expect(bannerImg).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/warranty-banner-homepage.png",
    });
  });

  test("4. Seção de Lentes em Estilo Panda Elite com caixas reais e fundo escuro", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const lensesSection = page.locator("#lentes");
    await lensesSection.scrollIntoViewIfNeeded();
    await expect(lensesSection).toBeVisible();

    const optisyncCard = lensesSection.locator("text=OPTiSYNC HD Antirreflexo").first();
    await expect(optisyncCard).toBeVisible();

    const boxImg = lensesSection.locator("img[src*='optisync-box.jpg']").first();
    await expect(boxImg).toBeVisible();

    const quoteBtn = lensesSection.getByRole("link", { name: /Pedir Orçamento/i }).first();
    await expect(quoteBtn).toBeVisible();
    await expect(quoteBtn).toHaveAttribute("href", /wa\.me/);

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/lenses-pricing-panda-elite.png",
    });
  });

  test("5. Lentes Coloridas com transparência e brilho óptico", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const colorSection = page.locator("#lentes-coloridas");
    await colorSection.scrollIntoViewIfNeeded();
    await expect(colorSection).toBeVisible();
    await expect(colorSection).toContainText(/Lentes Coloridas/i);

    const blueTab = colorSection.getByRole("button", { name: /Azul/i }).first();
    await expect(blueTab).toBeVisible();

    const whatsappBtn = colorSection.getByRole("link", { name: /Pedir no WhatsApp/i }).first();
    await expect(whatsappBtn).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/colored-lenses-translucent.png",
    });
  });

  test("6. Painel Admin Pedidos: separação de Retirada na Loja e Enviados + Modal de Pedido Manual", async ({ page }) => {
    await page.goto("/admin/pedidos");
    await page.waitForTimeout(500);

    // Verifica abas separadas
    const pickupTab = page.getByRole("button", { name: /Retirada na Loja/i });
    const shippedTab = page.getByRole("button", { name: /Enviados/i });

    await expect(pickupTab).toBeVisible();
    await expect(shippedTab).toBeVisible();

    // Verifica botão de Novo Pedido Manual
    const newOrderBtn = page.getByRole("button", { name: /Novo Pedido Manual/i });
    await expect(newOrderBtn).toBeVisible();

    // Clica para abrir modal
    await newOrderBtn.click();
    await page.waitForTimeout(300);

    const modalTitle = page.getByText(/Registrar Novo Pedido/i);
    await expect(modalTitle).toBeVisible();

    const cpfInput = page.locator("input[placeholder='000.000.000-00']");
    await expect(cpfInput).toBeVisible();

    const pickupDeliveryBtn = page.getByRole("button", { name: /Retirada na Loja Física/i });
    const shippingDeliveryBtn = page.getByRole("button", { name: /Envio Correios/i });

    await expect(pickupDeliveryBtn).toBeVisible();
    await expect(shippingDeliveryBtn).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/admin-orders-manual-modal.png",
    });
  });

  test("7. Botão do Google Maps apenas com 'Abrir no Google Maps'", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const mapsBtn = page.getByRole("link", { name: /Abrir no Google Maps/i }).first();
    await expect(mapsBtn).toBeVisible();

    const text = await mapsBtn.textContent();
    expect(text).toContain("Abrir no Google Maps");
    expect(text).not.toContain("Meu Negócio");
  });

  test("8. Conformidade Legal: Sem menção a 'Empresa Optométrica' no rodapé", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const optometricaMention = page.locator("text=Empresa Optométrica Regularizada");
    await expect(optometricaMention).toHaveCount(0);
  });

  test("9. Rastreamento: Retirada exibe strictly 'Pronto para Retirada' sem 'Em Trânsito'", async ({ page }) => {
    await page.goto("/rastreio");
    await page.waitForLoadState("domcontentloaded");

    // Pesquisa fixture de retirada
    const input = page.locator("input[placeholder*='código']");
    await input.fill("VEN-10380");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);

    const badge = page.getByText("Pronto para Retirada").first();
    await expect(badge).toBeVisible();

    const inTransit = page.locator("text=Em Trânsito / Enviado");
    await expect(inTransit).toHaveCount(0);
  });

  test("10. Painel Admin Lentes possui botão de Enviar Foto", async ({ page }) => {
    await page.goto("/admin/lentes");
    await page.waitForLoadState("domcontentloaded");

    const editBtn = page.getByRole("button", { name: /Editar/i }).first();
    await editBtn.click();
    await page.waitForTimeout(300);

    const uploadBtn = page.getByText(/Enviar Foto/i);
    await expect(uploadBtn).toBeVisible();
  });
});
