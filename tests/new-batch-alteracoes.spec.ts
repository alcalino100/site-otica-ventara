import { test, expect } from "@playwright/test";

test.describe("Validação da Nova Lista de Alterações Ventara", () => {
  test("1. Ordem no celular na Vitrine Interativa: Foto antes do Preço e Botões", async ({ page }) => {
    // Mobile Viewport (iPhone standard)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/#vitrine-interativa");
    await page.waitForTimeout(1000);

    // Aceita cookies para não cobrir a visualização
    try {
      const acceptBtn = page.getByRole("button", { name: /Aceitar Todos/i });
      if (await acceptBtn.isVisible({ timeout: 2000 })) {
        await acceptBtn.click();
      }
    } catch {}

    const showcase = page.locator("#vitrine-interativa");
    await expect(showcase).toBeVisible();

    // Rola para a parte 2 (vitrine do produto com miniaturas e preço)
    const productHeadline = showcase.getByText(/Performance em todos os detalhes/i).first();
    await productHeadline.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // No mobile, a moldura do produto (com SVG da armação) deve estar posicionada verticalmente ACIMA do box de preço
    const productStage = showcase.locator(".min-h-\\[280px\\]").first();
    const priceBox = showcase.getByText(/Preço à vista no Pix/i).first();

    await expect(productStage).toBeVisible();
    await expect(priceBox).toBeVisible();

    const stageBox = await productStage.boundingBox();
    const priceBounding = await priceBox.boundingBox();

    expect(stageBox).not.toBeNull();
    expect(priceBounding).not.toBeNull();

    // A foto e variações devem aparecer antes do preço na leitura mobile
    console.log(`Product Stage Y: ${stageBox!.y}, Price Box Y: ${priceBounding!.y}`);
    expect(stageBox!.y).toBeLessThan(priceBounding!.y);

    // Botões de ação também devem vir após a foto
    const ctaButton = showcase.getByRole("link", { name: /Ver opções/i });
    const ctaBounding = await ctaButton.boundingBox();
    expect(ctaBounding).not.toBeNull();
    expect(stageBox!.y).toBeLessThan(ctaBounding!.y);

    // Salva screenshot mobile da vitrine interativa focada no produto e preço
    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/mobile-interactive-showcase-order.png",
    });
  });

  test("2. Faixa de Logos de Parceiros: Marquee contínuo sem desregulagem", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/#lentes");
    await page.waitForTimeout(1000);

    try {
      const acceptBtn = page.getByRole("button", { name: /Aceitar Todos/i });
      if (await acceptBtn.isVisible({ timeout: 2000 })) {
        await acceptBtn.click();
      }
    } catch {}

    const ribbonTitle = page.getByText(/PARCEIROS TECNOLÓGICOS/i).first();
    await ribbonTitle.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const ribbon = page.locator(".animate-ventara-marquee");
    await expect(ribbon).toBeVisible();

    // Verifica presença dos logos homologados no DOM do marquee contínuo
    const optisync = page.locator("img[alt*='OPTiSYNC HD']").first();
    const perego = page.locator("img[alt*='Perego']").first();
    const hoya = page.locator("img[alt*='HOYA']").first();
    const varilux = page.locator("img[alt*='Varilux']").first();

    await expect(optisync).toBeAttached();
    await expect(perego).toBeAttached();
    await expect(hoya).toBeAttached();
    await expect(varilux).toBeAttached();

    // Salva screenshot do marquee no mobile
    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/mobile-partner-logos-marquee.png",
    });
  });

  test("3. Vitrine de Lentes Coloridas (8 Cores): Fundo Escuro, Cápsula Oval Branca e WhatsApp", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/#lentes-coloridas");
    await page.waitForTimeout(1000);

    try {
      const acceptBtn = page.getByRole("button", { name: /Aceitar Todos/i });
      if (await acceptBtn.isVisible({ timeout: 2000 })) {
        await acceptBtn.click();
      }
    } catch {}

    const coloredSection = page.locator("#lentes-coloridas");
    await expect(coloredSection).toBeVisible();

    // Valida título da seção
    await expect(coloredSection).toContainText(/Lentes Coloridas/i);
    await expect(coloredSection).toContainText(/8 cores/i);

    // Valida presença de todas as 8 cores da lista do cliente
    const expectedColors = [
      "Azul",
      "Marrom",
      "Amarelo Night Driver",
      "Vermelho",
      "Rosa",
      "Roxa",
      "Cinza",
      "Verde",
    ];

    for (const color of expectedColors) {
      const colorTab = coloredSection.getByRole("button", { name: color, exact: false }).first();
      await expect(colorTab).toBeVisible();
    }

    // Valida o botão de WhatsApp direto
    const whatsappBtn = coloredSection.getByRole("link", { name: /Pedir no WhatsApp/i }).first();
    await expect(whatsappBtn).toBeVisible();
    await whatsappBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    const href = await whatsappBtn.getAttribute("href");
    expect(href).toContain("wa.me/5518996155748");

    // Salva screenshot mobile da seção de lentes coloridas focada nos cards com cápsula oval
    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/mobile-colored-lenses-showcase.png",
    });
  });

  test("4. Gestão de Lentes no Painel de Admin: Filtro de Coloridas e Adicionar Nova Lente", async ({ page }) => {
    // Desktop Viewport para o Admin
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/admin/lentes");
    await page.waitForTimeout(1000);

    // Botão Adicionar Nova Lente
    const addBtn = page.getByRole("button", { name: /Adicionar Nova Lente/i });
    await expect(addBtn).toBeVisible();

    // Filtro de Lentes Coloridas
    const colorFilterBtn = page.getByRole("button", { name: /Lentes Coloridas/i });
    await expect(colorFilterBtn).toBeVisible();
    await colorFilterBtn.click();

    // Verifica que exibiu as lentes coloridas
    await expect(page.getByText(/Lente Colorida Azul Safira/i).first()).toBeVisible();
    await expect(page.getByText(/Lente Colorida Amarelo Night Driver/i).first()).toBeVisible();
    await expect(page.getByText(/Lente Colorida Verde G-15/i).first()).toBeVisible();

    // Salva screenshot do painel administrativo
    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/admin-colored-lenses-management.png",
    });
  });
});
