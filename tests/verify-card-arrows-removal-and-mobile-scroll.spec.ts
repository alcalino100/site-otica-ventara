import { test, expect } from "@playwright/test";

test.describe("Remoção de setas e restauração do scroll horizontal mobile", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("ventara_wheel_disabled", "1");
      sessionStorage.setItem("ventara_wheel_session_dismissed", "1");
      localStorage.setItem(
        "ventara_cookie_consent",
        JSON.stringify({ essential: true, analytics: true, marketing: false })
      );
    });
  });

  test("1. Catálogo /armacoes: Card branco com Comprar e WhatsApp, sem setas sobre a armação, apenas 1/X", async ({ page }) => {
    await page.goto("http://localhost:3000/armacoes");
    await page.waitForLoadState("domcontentloaded");

    const cards = page.locator(".product.group");
    await expect(cards.first()).toBeVisible();

    const firstCard = cards.first();

    // 1. Container de fundo branco com borda suave
    await expect(firstCard).toHaveClass(/bg-white/);

    // 2. Foto com aspect-ratio 4/3
    const imgContainer = firstCard.locator("div.aspect-\\[4\\/3\\]");
    await expect(imgContainer).toBeVisible();

    // 3. ZERO setas sobre a armação
    const prevArrow = firstCard.locator("[data-testid='card-gallery-prev']");
    const nextArrow = firstCard.locator("[data-testid='card-gallery-next']");
    await expect(prevArrow).toHaveCount(0);
    await expect(nextArrow).toHaveCount(0);

    // 4. Indicador numérico 1/X presente quando há múltiplas fotos
    const counter = firstCard.locator("[data-testid='card-gallery-counter']");
    if (await counter.count() > 0) {
      await expect(counter).toBeVisible();
      const text = await counter.textContent();
      expect(text).toMatch(/1\/\d+/);
    }

    // 5. Botões Comprar e Dúvidas no WhatsApp
    const buyBtn = firstCard.locator("a:has-text('Comprar')");
    await expect(buyBtn).toBeVisible();

    const zapBtn = firstCard.locator("a:has-text('Dúvidas no WhatsApp')");
    await expect(zapBtn).toBeVisible();

    // Screenshot dos cards de /armacoes
    await firstCard.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const grid = page.locator(".product.group").first().locator("xpath=..");
    await grid.screenshot({
      path: "/Users/user/.gemini/antigravity/brain/3307d6a6-ee9f-47b4-bbf9-e090e670f231/fixed-armacoes-no-arrows.png",
    });
  });

  test("2. Home mobile (390px): Carrossel 'Modelos em Destaque' sem setas e com scroll horizontal funcional", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("domcontentloaded");

    const carousel1 = page.locator("div[aria-label='Carrossel linha 1 de armações']");
    await expect(carousel1).toBeVisible();

    // 1. ZERO setas invasivas nos cards do carrossel
    const prevArrows = carousel1.locator("[data-testid='card-gallery-prev']");
    const nextArrows = carousel1.locator("[data-testid='card-gallery-next']");
    await expect(prevArrows).toHaveCount(0);
    await expect(nextArrows).toHaveCount(0);

    // 2. Scroll horizontal permitido e responsivo
    const initialScroll = await carousel1.evaluate((el) => el.scrollLeft);
    expect(initialScroll).toBe(0);

    // Executa scroll horizontal no carrossel
    await carousel1.evaluate((el) => {
      el.scrollBy({ left: 200, behavior: "instant" });
    });

    const newScroll = await carousel1.evaluate((el) => el.scrollLeft);
    expect(newScroll).toBeGreaterThan(0);

    // 3. Screenshot do carrossel no mobile
    await carousel1.screenshot({
      path: "/Users/user/.gemini/antigravity/brain/3307d6a6-ee9f-47b4-bbf9-e090e670f231/fixed-home-carousel-mobile.png",
    });
  });
});
