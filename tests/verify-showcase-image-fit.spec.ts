import { test, expect } from "@playwright/test";

test.describe("Vitrine Promocional - Enquadramento das Fotos Completo", () => {
  test("Desktop: fotos preenchem o espaço completo sem bordas brancas", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("networkidle");

    const promoSection = page.locator("section[aria-label='Modelos Selecionados com Desconto']");
    await expect(promoSection).toBeVisible();
    await promoSection.scrollIntoViewIfNeeded();

    // Aguarda o carregamento das imagens
    await page.waitForTimeout(1000);

    const firstImg = promoSection.locator("img").first();
    await expect(firstImg).toBeVisible();

    // Verifica que a classe possui object-cover
    const imgClass = await firstImg.getAttribute("class");
    expect(imgClass).toContain("object-cover");

    await promoSection.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/vitrine-fotos-preenchidas-desktop.png",
    });
  });

  test("Mobile: fotos preenchem perfeitamente na grade de 2 colunas", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("networkidle");

    const promoSection = page.locator("section[aria-label='Modelos Selecionados com Desconto']");
    await expect(promoSection).toBeVisible();
    await promoSection.scrollIntoViewIfNeeded();

    await page.waitForTimeout(1000);

    await promoSection.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/vitrine-fotos-preenchidas-mobile.png",
    });
  });

  test("Admin: opções de enquadramento (Preencher Completo vs Ajustar c/ Bordas)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("http://localhost:3000/admin/banners");
    await page.waitForLoadState("networkidle");

    const promoTab = page.locator("button:has-text('Vitrine 25% OFF')");
    await promoTab.click();
    await page.waitForTimeout(500);

    const fitButton = page.locator("button:has-text('Preencher Completo')").first();
    await expect(fitButton).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/admin-vitrine-enquadramento.png",
      fullPage: false,
    });
  });
});
