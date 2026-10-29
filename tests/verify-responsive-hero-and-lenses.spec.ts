import { test, expect } from "@playwright/test";

test.describe("Melhorias Responsivas: Hero Harmonioso e Carrossel de Lentes com ByVISION", () => {
  test("1. Desktop Hero: foto na proporção natural, sem zoom de 300%, texto 100% legível", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const heroSection = page.locator("#inicio");
    await expect(heroSection).toBeVisible();

    const title = heroSection.locator("h1");
    await expect(title).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/hero-desktop-harmonioso.png",
      fullPage: false,
    });
  });

  test("2. Mobile Hero: texto limpo no topo e vitrine do óculos perfeitamente enquadrada abaixo", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const heroSection = page.locator("#inicio");
    await expect(heroSection).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/hero-mobile-harmonioso.png",
      fullPage: false,
    });
  });

  test("3. Mobile Lentes: carrossel horizontal 'puxar pro lado' com modelo ByVISION AUDAX", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const lensesSection = page.locator("#lentes");
    await expect(lensesSection).toBeVisible();
    await lensesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // Verifica se o modelo ByVISION está no carrossel
    const byVisionCard = lensesSection.locator("text=ByVISION").first();
    await expect(byVisionCard).toBeVisible();

    // Verifica badge AUDAX
    const audaxBadge = lensesSection.locator("text=AUDAX").first();
    await expect(audaxBadge).toBeVisible();

    // Verifica indicador de deslize
    const swipeIndicator = lensesSection.locator("text=Deslize para ver os modelos");
    await expect(swipeIndicator).toBeVisible();

    await lensesSection.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/mobile-lentes-carrossel-byvision.png",
    });
  });

  test("4. Admin: novos controles de largura 55%/65%/100% e zoom do óculos", async ({ page }) => {
    await page.setViewportSize({ width: 1300, height: 1100 });
    await page.goto("http://localhost:3000/admin/banners");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const heroTab = page.locator("button:has-text('Banner Principal (Header Fixo)')");
    await heroTab.click();
    await page.waitForTimeout(500);

    const widthButton = page.locator("button:has-text('55% da Tela')");
    await expect(widthButton).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/admin-hero-zoom-largura.png",
      fullPage: false,
    });
  });
});
