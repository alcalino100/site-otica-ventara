import { test, expect } from "@playwright/test";

test.describe("Catálogo de Lentes de Grau - Redesign Light Theme", () => {
  test("Verifica layout desktop do Catálogo de Lentes de Grau", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/lentes");
    await page.waitForLoadState("networkidle");

    // 1. Título e subtítulo
    const heading = page.locator("h1");
    await expect(heading).toContainText("CATÁLOGO DE");
    await expect(heading).toContainText("LENTES DE GRAU");

    // 2. Botões de Ação do Header
    const ctaWhatsapp = page.locator("a:has-text('Enviar Receita no WhatsApp')");
    await expect(ctaWhatsapp).toBeVisible();

    const ctaDnp = page.locator("a:has-text('Medição DNP por Foto')");
    await expect(ctaDnp).toBeVisible();

    // 3. Banner Card
    const bannerTitle = page.locator("h2:has-text('LENTES DE GRAU')");
    await expect(bannerTitle).toBeVisible();

    // 4. Primeiro card: ByVISION com AUDAX
    const byvisionCard = page.locator("article:has-text('ByVISION')").first();
    await expect(byvisionCard).toBeVisible();
    await expect(byvisionCard).toContainText("AUDAX");
    await expect(byvisionCard).toContainText("R$ 179,90");
    await expect(byvisionCard).toContainText("Pronto em até 1 hora");
    await expect(byvisionCard.locator("a:has-text('Garantir no WhatsApp')")).toBeVisible();

    // 5. Segundo card: LENTE TRANSITIONS
    const transitionsCard = page.locator("article:has-text('LENTE TRANSITIONS')").first();
    await expect(transitionsCard).toBeVisible();
    await expect(transitionsCard).toContainText("TRANSITIONS");
    await expect(transitionsCard).toContainText("R$ 679,60");
    await expect(transitionsCard).toContainText("Pronto em até 4 dias");

    // Captura screenshot Desktop
    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/lentes-de-grau-desktop-mockup-match.png",
      fullPage: false,
    });
    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/lentes-de-grau-desktop-full.png",
      fullPage: true,
    });
  });

  test("Verifica layout mobile 2-colunas do Catálogo de Lentes de Grau", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/lentes");
    await page.waitForLoadState("networkidle");

    // 1. Título
    const heading = page.locator("h1");
    await expect(heading).toContainText("LENTES DE GRAU");

    // 2. Layout em 2 colunas no catálogo
    const cardsGrid = page.locator("section div.grid.grid-cols-2").first();
    await expect(cardsGrid).toBeVisible();

    // 3. Primeiro card
    const firstCard = cardsGrid.locator("article").first();
    await expect(firstCard).toContainText("ByVISION");
    await expect(firstCard).toContainText("AUDAX");
    await expect(firstCard).toContainText("R$ 179,90");

    // 4. Segundo card
    const secondCard = cardsGrid.locator("article").nth(1);
    await expect(secondCard).toContainText("LENTE TRANSITIONS");
    await expect(secondCard).toContainText("TRANSITIONS");

    // Rola para a seção dos cards e captura a visão exata do mockup
    await cardsGrid.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/lentes-de-grau-mobile-cards.png",
      fullPage: false,
    });

    // Captura screenshot Mobile full page
    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/lentes-de-grau-mobile-mockup-match.png",
      fullPage: true,
    });
  });
});
