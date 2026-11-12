import { test, expect } from "@playwright/test";

test.describe("Vitrine Interativa de Solares - Ampliação das Miniaturas", () => {
  test("Mobile: as miniaturas das variações têm altura ampliada e proporção 4:3", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

    // Aceita cookies se o banner estiver visível para desobstruir a visualização
    const acceptCookiesBtn = page.getByRole("button", { name: /Aceitar Todos/i });
    if (await acceptCookiesBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acceptCookiesBtn.click();
      await page.waitForTimeout(300);
    }

    const showcase = page.locator("#vitrine-interativa");
    await expect(showcase).toBeVisible({ timeout: 10000 });
    await showcase.evaluate((el) => el.scrollIntoView({ behavior: "instant", block: "center" }));
    await page.waitForTimeout(600);

    // Localiza a seção das variações
    const variationsHeading = showcase.getByText(/Variações disponíveis da linha/i);
    await expect(variationsHeading).toBeVisible();

    // Localiza os botões de variação na grade
    const variationButtons = showcase.locator("div.grid.grid-cols-2.sm\\:grid-cols-4 > button");
    await expect(variationButtons).toHaveCount(4);

    // Verifica a primeira miniatura
    const firstThumbBox = variationButtons.first().locator("div.aspect-\\[4\\/3\\]");
    await expect(firstThumbBox).toBeVisible();

    const box = await firstThumbBox.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // A altura anterior era h-16 (64px). Agora deve ser >= 96px
      expect(box.height).toBeGreaterThanOrEqual(96);
      // Verifica proporção aproximada de 4:3 (largura / altura entre 1.0 e 1.6)
      const ratio = box.width / box.height;
      expect(ratio).toBeGreaterThan(1.0);
      expect(ratio).toBeLessThan(1.6);
    }

    // Tira screenshot focado na vitrine interativa no mobile
    await showcase.screenshot({
      path: "/Users/user/.gemini/antigravity/brain/3307d6a6-ee9f-47b4-bbf9-e090e670f231/showcase-thumbnails-mobile-ampliadas.png",
    });
  });

  test("Desktop: as miniaturas das variações têm altura ampliada e proporção 4:3", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

    // Aceita cookies se o banner estiver visível para desobstruir a visualização
    const acceptCookiesBtn = page.getByRole("button", { name: /Aceitar Todos/i });
    if (await acceptCookiesBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acceptCookiesBtn.click();
      await page.waitForTimeout(300);
    }

    const showcase = page.locator("#vitrine-interativa");
    await expect(showcase).toBeVisible({ timeout: 10000 });
    await showcase.evaluate((el) => el.scrollIntoView({ behavior: "instant", block: "center" }));
    await page.waitForTimeout(600);

    // Localiza os botões de variação na grade de variações
    const variationButtons = showcase.locator("div.grid.grid-cols-2.sm\\:grid-cols-4 > button");
    await expect(variationButtons).toHaveCount(4);

    // Verifica a primeira miniatura
    const firstThumbBox = variationButtons.first().locator("div.aspect-\\[4\\/3\\]");
    await expect(firstThumbBox).toBeVisible();

    const box = await firstThumbBox.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // A altura anterior era sm:h-20 (80px). Agora deve ser >= 100px
      expect(box.height).toBeGreaterThanOrEqual(100);
      const ratio = box.width / box.height;
      expect(ratio).toBeGreaterThan(1.0);
      expect(ratio).toBeLessThan(1.6);
    }

    // Tira screenshot focado na vitrine interativa no desktop
    await showcase.screenshot({
      path: "/Users/user/.gemini/antigravity/brain/3307d6a6-ee9f-47b4-bbf9-e090e670f231/showcase-thumbnails-desktop-ampliadas.png",
    });
  });
});
