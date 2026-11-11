import { test, expect } from "@playwright/test";

test.describe("Padronização Visual dos Cards de Produto com Foto Sangrada em Todo o Site (#158)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("ventara_wheel_session_default-optica-ventara-2025", "1");
      window.localStorage.setItem("ventara_wheel_participated_default-optica-ventara-2025_v1", "1");
    });
  });

  test("1. Vitrine Promocional na Home renderiza cards com foto cobrindo todo o bloco (full-bleed)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const promoSection = page.locator("section[aria-label='Modelos Selecionados']");
    await expect(promoSection).toBeVisible();

    const promoCards = promoSection.locator("article.product");
    const count = await promoCards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < Math.min(count, 4); i++) {
      const card = promoCards.nth(i);
      await expect(card).toBeVisible();

      // Confirma que a imagem cobre 100% do bloco com object-cover
      const img = card.locator("img").first();
      if (await img.isVisible()) {
        await expect(img).toHaveClass(/object-cover/);
      }

      // Confirma presença dos botões de ação unificados
      await expect(card.getByRole("link", { name: "Ver detalhes", exact: true })).toBeVisible();
      await expect(card.getByTitle(/WhatsApp/i)).toBeVisible();
    }
  });

  test("2. Catálogo /armacoes renderiza cards no padrão de luxo escuro com foto sangrada", async ({ page }) => {
    await page.goto("/armacoes");
    await page.waitForLoadState("domcontentloaded");

    const cards = page.locator(".grid article.product, .grid .product");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toHaveClass(/bg-\[#040d1a\]/);

    const img = firstCard.locator("img").first();
    if (await img.isVisible()) {
      await expect(img).toHaveClass(/object-cover/);
    }
  });

  test("3. PDP /produto/[slug] renderiza armações recomendadas com foto sangrada unificada", async ({ page }) => {
    await page.goto("/produto/ventara-safari");
    await page.waitForLoadState("domcontentloaded");

    const recSection = page.locator("h2:has-text('Armações Recomendadas')");
    if (await recSection.isVisible()) {
      const recCards = page.locator(".grid article.product, .grid .product");
      const count = await recCards.count();
      expect(count).toBeGreaterThanOrEqual(1);

      const firstRec = recCards.first();
      await expect(firstRec).toBeVisible();
      await expect(firstRec).toHaveClass(/bg-\[#040d1a\]/);

      const img = firstRec.locator("img").first();
      if (await img.isVisible()) {
        await expect(img).toHaveClass(/object-cover/);
      }
    }
  });

  test("4. Vitrine Esportiva & Solar renderiza imagem de destaque cobrindo toda a área (full-bleed) e miniaturas preenchidas", async ({ page }) => {
    await page.goto("/#vitrine-interativa");
    await page.waitForLoadState("domcontentloaded");

    const showcase = page.locator("#vitrine-interativa");
    await expect(showcase).toBeVisible();

    // Moldura principal da armação solar
    const mainFrame = showcase.locator(".aspect-\\[4\\/3\\], .aspect-\\[16\\/10\\]").first();
    await expect(mainFrame).toBeVisible();

    const mainImg = mainFrame.locator("img").first();
    if (await mainImg.isVisible()) {
      await expect(mainImg).toHaveClass(/object-cover/);
    }

    // Miniaturas das variações
    const thumbImages = showcase.locator(".grid button img");
    const thumbCount = await thumbImages.count();
    if (thumbCount > 0) {
      await expect(thumbImages.first()).toHaveClass(/object-cover/);
    }
  });

  test("5. Grade de armações no mobile (2 colunas) não possui sobreposição entre cards", async ({ browser }) => {
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    await mobileCtx.addCookies([
      { name: "ventara_cookie_consent", value: "accepted", domain: "localhost", path: "/" },
      { name: "ventara_wheel_played", value: "true", domain: "localhost", path: "/" }
    ]);
    const mobilePage = await mobileCtx.newPage();
    await mobilePage.goto("/armacoes", { waitUntil: "domcontentloaded" });
    await mobilePage.evaluate(() => window.scrollTo(0, 600));
    await mobilePage.waitForTimeout(400);

    const cards = mobilePage.locator(".product.group");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();
    expect(box0).not.toBeNull();
    expect(box1).not.toBeNull();

    if (box0 && box1) {
      // Card 0 deve terminar antes ou exatamente no início de Card 1 (sem sobreposição)
      expect(box0.x + box0.width).toBeLessThanOrEqual(box1.x + 1);
      // Nenhum card deve transbordar o viewport de 390px
      expect(box1.x + box1.width).toBeLessThanOrEqual(390);
    }

    await mobileCtx.close();
  });

  test("6. Página OPTiSYNC consome fotos dinâmicas no simulador", async ({ page }) => {
    await page.goto("/optisync");
    await page.waitForLoadState("domcontentloaded");

    const photochromicSection = page.locator("#linha-fotossensivel");
    await expect(photochromicSection).toBeVisible();

    const simImage = photochromicSection.locator("img").first();
    await expect(simImage).toBeVisible();
    await expect(simImage).toHaveClass(/object-cover/);
  });
});
