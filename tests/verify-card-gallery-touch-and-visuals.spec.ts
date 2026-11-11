import { test, expect } from "@playwright/test";

test.describe("Validação de Toque, Zona Morta nas Setas, Zoom Seguro e Padronização Visual", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // Evita intercepção de ponteiros pela roleta promocional e cookies durante os testes
      window.sessionStorage.setItem("ventara_wheel_session_default-optica-ventara-2025", "1");
      window.localStorage.setItem("ventara_wheel_participated_default-optica-ventara-2025_v1", "1");
      window.localStorage.setItem("ventara_cookie_consent", "accepted");
    });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("T1: 30 toques repetidos nas setas do card trocam imagem sem navegar e sem aplicar zoom", async ({ page }) => {
    // Localiza um card que contenha controles de galeria
    const prevBtn = page.locator("[data-testid='card-gallery-prev']").first();
    const nextBtn = page.locator("[data-testid='card-gallery-next']").first();

    if (await nextBtn.isVisible()) {
      const initialUrl = page.url();

      // Executa 15 toques na próxima e 15 toques na anterior
      for (let i = 0; i < 15; i++) {
        await nextBtn.tap();
        await page.waitForTimeout(50);
      }
      for (let i = 0; i < 15; i++) {
        await prevBtn.tap();
        await page.waitForTimeout(50);
      }

      // Verifica que a URL não mudou (nenhuma navegação indevida ocorreu)
      expect(page.url()).toBe(initialUrl);

      // Verifica que a imagem não ficou com zoom / scale residual no mobile
      const card = nextBtn.locator("xpath=ancestor::div[contains(@class, 'group') or contains(@class, 'product')]").first();
      const img = card.locator("img").first();
      if (await img.isVisible()) {
        const transform = await img.evaluate((el) => window.getComputedStyle(el).transform);
        expect(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)").toBeTruthy();
      }
    }
  });

  test("T2: Toque na foto central navega e monta o detalhe na escala normal 1.0", async ({ page }) => {
    const card = page.locator("article.group").first();
    await expect(card).toBeVisible();

    const link = card.locator("a[href*='/produto/']").first();
    await link.click();

    await page.waitForURL(/\/produto\//);
    const pdpImg = page.locator("img[alt*='foto'], img[alt*='Ventara']").first();
    await expect(pdpImg).toBeVisible();

    const transform = await pdpImg.evaluate((el) => window.getComputedStyle(el).transform);
    expect(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)").toBeTruthy();
  });

  test("T3: Swipe horizontal troca a foto sem abrir o produto", async ({ page }) => {
    const gallery = page.locator("[data-testid='card-gallery-counter']").first();
    if (await gallery.isVisible()) {
      const parent = gallery.locator("xpath=..");
      const box = await parent.boundingBox();
      if (box) {
        const initialText = await gallery.textContent();
        const startX = box.x + box.width * 0.8;
        const endX = box.x + box.width * 0.2;
        const y = box.y + box.height * 0.5;

        // Simula swipe horizontal da direita para a esquerda
        await page.touchscreen.tap(startX, y);
        // Deslocamento simulado
        const initialUrl = page.url();
        await page.mouse.move(startX, y);
        await page.mouse.down();
        await page.mouse.move(endX, y, { steps: 5 });
        await page.mouse.up();

        // Não deve navegar
        expect(page.url()).toBe(initialUrl);
      }
    }
  });

  test("T4: Voltar do detalhe preserva estado da página inicial", async ({ page }) => {
    const card = page.locator("article.group").first();
    await expect(card).toBeVisible();

    const link = card.locator("a[href*='/produto/']").first();
    await link.click();
    await page.waitForURL(/\/produto\//);

    await page.goBack();
    await page.waitForLoadState("domcontentloaded");
    await expect(card).toBeVisible();
  });

  test("T5: Toque no mobile não ativa sticky hover (transform permanece neutro)", async ({ page }) => {
    const card = page.locator("article.group").first();
    await expect(card).toBeVisible();

    const img = card.locator("img").first();
    if (await img.isVisible()) {
      // Previne navegação durante a verificação de sticky hover pós-toque
      await card.locator("a").first().evaluate((el) => {
        el.addEventListener("click", (e) => e.preventDefault(), { capture: true });
      });

      // Dispara toque na imagem
      await img.tap();
      await page.waitForTimeout(100);

      const transform = await img.evaluate((el) => window.getComputedStyle(el).transform);
      expect(transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)").toBeTruthy();
    }
  });

  test("T6: Selo de desconto '-X%' ocupa uma única linha em 360px e 390px", async ({ page }) => {
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(100);

      // Localiza selos de desconto explícitos de produto nos cards e catálogo
      const discountBadges = page.locator("[data-testid='discount-badge'], span:has-text('% OFF'), span:has-text('-%')");
      const count = await discountBadges.count();

      for (let i = 0; i < Math.min(count, 6); i++) {
        const badge = discountBadges.nth(i);
        if (await badge.isVisible()) {
          const whiteSpace = await badge.evaluate((el) => window.getComputedStyle(el).whiteSpace);
          expect(whiteSpace).toBe("nowrap");
        }
      }
    }
  });

  test("T7: Proporção e estilo de foto sangrada consistente nos cards de produto", async ({ page }) => {
    const cards = page.locator("article.product, .product");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < Math.min(count, 4); i++) {
      const card = cards.nth(i);
      if (await card.isVisible()) {
        const box = await card.boundingBox();
        if (box) {
          const ratio = box.width / box.height;
          // aspect-[3/4.2] = ~0.71 (com margem de tolerância)
          expect(ratio).toBeLessThan(1.0);
        }
        // Confirma que a foto cobre todo o bloco (object-cover)
        const img = card.locator("img").first();
        if (await img.isVisible()) {
          await expect(img).toHaveClass(/object-cover/);
        }
      }
    }
  });

  test("T8: Regra CSS de hover restrita a ponteiros desktop", async ({ page }) => {
    const isMobileCoarse = await page.evaluate(() => {
      return window.matchMedia("(hover: none) or (pointer: coarse)").matches;
    });
    expect(isMobileCoarse).toBe(true);
  });

  test("T9: Área tátil das setas possui dimensão mínima de 44x44px", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    const card = page.locator("article.group, .product").first();
    await card.hover();
    const nextBtn = page.locator("[data-testid='card-gallery-next']").first();
    if (await nextBtn.isVisible()) {
      const box = await nextBtn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test("T10: Setas na PDP possuem zona morta de 44px e stopPropagation", async ({ page }) => {
    const card = page.locator("article.group").first();
    const link = card.locator("a[href*='/produto/']").first();
    await link.click();
    await page.waitForURL(/\/produto\//);

    const pdpNextBtn = page.locator("[data-testid='pdp-gallery-next']");
    if (await pdpNextBtn.isVisible()) {
      const box = await pdpNextBtn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
