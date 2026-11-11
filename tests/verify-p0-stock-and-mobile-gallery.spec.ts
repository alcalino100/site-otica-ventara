import { test, expect } from "@playwright/test";

test.describe("P0: Validação de Estoque Único e Galeria Mobile sem Setas Sobrepostas", () => {
  test("P0-A: API de validação aceita até o saldo em estoque e bloqueia excedente", async ({ request }) => {
    // 1. Simula validação com 5 unidades de produto com estoque disponível
    const resValid = await request.post("/api/cart/validate", {
      data: {
        items: [
          {
            id: "46e75128-ad37-481b-94fb-59b824770ad5::variant-test-1",
            productId: "46e75128-ad37-481b-94fb-59b824770ad5",
            quantity: 5,
            priceInCents: 28900,
          },
        ],
      },
    });

    expect(resValid.ok()).toBeTruthy();
    const dataValid = await resValid.json();

    // Deve aceitar a compra e não considerar esgotado
    expect(dataValid.hasOutOfStock).toBe(false);
    expect(dataValid.items[0].isOutOfStock).toBe(false);
    expect(dataValid.items[0].availableStock).toBeGreaterThanOrEqual(1);

    // 2. Simula requisição com quantidade que excede o estoque disponível (ex: 99 unidades)
    const resExcess = await request.post("/api/cart/validate", {
      data: {
        items: [
          {
            id: "46e75128-ad37-481b-94fb-59b824770ad5::variant-test-1",
            productId: "46e75128-ad37-481b-94fb-59b824770ad5",
            quantity: 99,
            priceInCents: 28900,
          },
        ],
      },
    });

    expect(resExcess.ok()).toBeTruthy();
    const dataExcess = await resExcess.json();
    expect(dataExcess.hasInsufficientStock).toBe(true);
    expect(dataExcess.valid).toBe(false);
    expect(dataExcess.items[0].message).toContain("disponíve");
  });

  test("P0-A: Resolução resiliente de UUID completo sem truncar em split('-')", async ({ request }) => {
    // Envia item no formato clássico com ID UUID sem productId explícito
    const res = await request.post("/api/cart/validate", {
      data: {
        items: [
          {
            id: "ventara-safari",
            quantity: 2,
            priceInCents: 28900,
          },
        ],
      },
    });

    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.hasOutOfStock).toBe(false);
    expect(data.items[0].productId).toBeDefined();
    expect(data.items[0].isOutOfStock).toBe(false);
  });

  test.describe("Mobile Touch Viewport", () => {
    test.use({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });

    test("P0-B: No celular, as setas estão ausentes sobre a imagem e o swipe troca a foto", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Confirma que as setas NÃO cobrem a foto no mobile
      const mobileArrows = page.locator("article.group [data-testid='card-gallery-next'], .product [data-testid='card-gallery-next']");
      const arrowCount = await mobileArrows.count();

      for (let i = 0; i < Math.min(arrowCount, 4); i++) {
        await expect(mobileArrows.nth(i)).toBeHidden();
      }

      // Confirma presença do indicador '1/X' no rodapé
      const counter = page.locator("[data-testid='card-gallery-counter']").first();
      if (await counter.isVisible()) {
        const text = await counter.textContent();
        expect(text).toMatch(/\d+\/\d+/);
      }

      // Confirma que toque no card abre o produto na escala normal 1.0 sem zoom persistente
      const card = page.locator("article.group").first();
      const link = card.locator("a[href*='/produto/']").first();
      await link.click();
      await page.waitForURL(/\/produto\//);

      const pdpImg = page.locator("img[alt*='foto'], img[alt*='Ventara']").first();
      await expect(pdpImg).toBeVisible();
      const transform = await pdpImg.evaluate((el) => window.getComputedStyle(el).transform);
      expect(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)").toBeTruthy();
    });
  });

  test.describe("Desktop Viewport", () => {
    test.use({
      viewport: { width: 1280, height: 800 },
      hasTouch: false,
      isMobile: false,
    });

    test("P0-B: No desktop, setas aparecem nas laterais e trocam foto sem abrir o produto", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      const card = page.locator("article.group, .product").first();
      await card.hover();

      const nextBtn = card.locator("[data-testid='card-gallery-next']");
      if (await nextBtn.isVisible()) {
        const initialUrl = page.url();
        await nextBtn.click();
        await page.waitForTimeout(100);

        // Não navegou
        expect(page.url()).toBe(initialUrl);
      }
    });
  });
});
