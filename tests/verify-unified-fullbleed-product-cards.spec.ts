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
});
