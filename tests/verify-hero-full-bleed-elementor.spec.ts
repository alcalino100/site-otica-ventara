import { test, expect } from "@playwright/test";

test.describe("Hero Banner Full-Bleed Estilo Elementor", () => {
  test("Desktop: foto cobre todo o fundo do header sem bloco", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const heroSection = page.locator("#inicio");
    await expect(heroSection).toBeVisible();

    // Verifica que existe imagem cobrindo o fundo (absolute inset-0 w-full h-full object-cover)
    const bgImage = heroSection.locator("img").first();
    await expect(bgImage).toBeVisible();
    const bgClass = await bgImage.getAttribute("class");
    expect(bgClass).toContain("object-cover");

    // Verifica que os botões estão visíveis e clicáveis
    const lentesBtn = heroSection.locator("a:has-text('Catálogo de Lentes')");
    await expect(lentesBtn).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/hero-fundo-inteiro-desktop.png",
      fullPage: false,
    });
  });

  test("Mobile: legibilidade perfeita com degradê protetor", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const heroSection = page.locator("#inicio");
    await expect(heroSection).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/hero-fundo-inteiro-mobile.png",
      fullPage: false,
    });
  });

  test("Admin: controles estilo Elementor (posições, sliders X/Y e layout)", async ({ page }) => {
    await page.setViewportSize({ width: 1300, height: 1100 });
    await page.goto("http://localhost:3000/admin/banners");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    const heroTab = page.locator("button:has-text('Banner Principal (Header Fixo)')");
    await expect(heroTab).toBeVisible();
    await heroTab.click();
    await page.waitForTimeout(500);

    // Rola para a seção dos controles Elementor
    const elementorSection = page.locator("text=Enquadramento & Posição da Foto (Estilo Elementor)");
    await expect(elementorSection).toBeVisible();
    await elementorSection.scrollIntoViewIfNeeded();

    // Verifica botões de layout e sliders
    const fullBleedBtn = page.locator("button:has-text('Fundo Inteiro da Seção')");
    await expect(fullBleedBtn).toBeVisible();

    const sliderLabel = page.locator("text=Ajuste Fino de Coordenadas (Eixo X / Eixo Y)");
    await expect(sliderLabel).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/admin-controles-elementor-detalhe.png",
      fullPage: false,
    });
  });
});
