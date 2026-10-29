import { test, expect } from "@playwright/test";

test.describe("Melhorias UI/UX - Respiro, Recolhimento e Encaixe de Blocos", () => {
  test("Verifica recolhimento com degradê em Até 25% OFF e encaixe de Encontre Sua Cor", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 1. SEÇÃO ATÉ 25% OFF
    const promoSection = page.locator("section[aria-label='Modelos Selecionados com Desconto']");
    await expect(promoSection).toBeVisible();
    await promoSection.scrollIntoViewIfNeeded();

    // Verifica que inicialmente exibe exatamente 8 artigos
    const visiblePromoCards = promoSection.locator("article");
    await expect(visiblePromoCards).toHaveCount(8);

    // Verifica o botão "Ver mais"
    const expandPromoBtn = promoSection.locator("button:has-text('Ver mais')");
    await expect(expandPromoBtn).toBeVisible();

    // Captura screenshot da seção Até 25% OFF recolhida com degradê
    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/promo-section-collapsed-gradient.png",
      fullPage: false,
    });

    // Clica para expandir
    await expandPromoBtn.click();
    await page.waitForTimeout(300);

    // Agora deve exibir todos os 16 modelos
    const allPromoCards = promoSection.locator("article");
    const countAfterExpand = await allPromoCards.count();
    expect(countAfterExpand).toBeGreaterThan(8);

    // O botão agora deve dizer "Recolher modelos"
    const collapsePromoBtn = promoSection.locator("button:has-text('Recolher modelos')");
    await expect(collapsePromoBtn).toBeVisible();

    // Clica para recolher novamente
    await collapsePromoBtn.click();
    await page.waitForTimeout(300);
    await expect(promoSection.locator("article")).toHaveCount(8);

    // 2. SEÇÃO ENCONTRE SUA COR NAS LENTES SOLARES
    const coloredLensesSection = page.locator("#lentes-coloridas");
    await expect(coloredLensesSection).toBeVisible();
    await coloredLensesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Verifica que o container principal agora tem max-w-[1400px] (alinhado com o site)
    const container = coloredLensesSection.locator("div.max-w-\\[1400px\\]");
    await expect(container).toBeVisible();

    // Verifica presença do título e do seletor de cores
    await expect(coloredLensesSection.locator("h2:has-text('SUA COR')")).toBeVisible();
    await expect(coloredLensesSection.locator("text=ESCOLHA SUA COR")).toBeVisible();

    // Captura screenshot do bloco Encontre Sua Cor encaixado perfeitamente no site
    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/encontre-sua-cor-encaixado-1400px.png",
      fullPage: false,
    });
  });

  test("Verifica visual mobile responsivo das seções", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Até 25% OFF no mobile
    const promoSection = page.locator("section[aria-label='Modelos Selecionados com Desconto']");
    await promoSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await expect(promoSection.locator("article")).toHaveCount(8);
    const expandPromoBtn = promoSection.locator("button:has-text('Ver mais')");
    await expect(expandPromoBtn).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/promo-section-mobile-collapsed.png",
      fullPage: false,
    });

    // Encontre Sua Cor no mobile
    const coloredLensesSection = page.locator("#lentes-coloridas");
    await coloredLensesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/encontre-sua-cor-mobile-fitted.png",
      fullPage: false,
    });
  });
});
