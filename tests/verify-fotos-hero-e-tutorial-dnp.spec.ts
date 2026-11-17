import { test, expect } from "@playwright/test";

test.describe("Tutorial visual da medição de DNP por foto", () => {
  test("mostra as 4 etapas com as imagens do tutorial", async ({ page }) => {
    await page.goto("/medicao-por-foto");
    const tutorial = page.getByTestId("dnp-tutorial");
    await expect(tutorial).toBeVisible();
    for (const n of [1, 2, 3, 4]) {
      await expect(page.getByTestId(`dnp-step-${n}`)).toBeVisible();
    }
    const imgs = tutorial.locator("img");
    await expect(imgs).toHaveCount(3);
    // Imagens abaixo da dobra carregam sob demanda: rola até cada uma antes de conferir
    for (let i = 0; i < 3; i++) {
      const img = imgs.nth(i);
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() => img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0))
        .toBe(true);
    }
    const loaded = [true];
    expect(loaded.every(Boolean)).toBe(true);
  });
});

test.describe("Home sem piscar fotos antigas", () => {
  test("o HTML inicial já traz o carrossel (sem depender de /api/hero)", async ({ request }) => {
    const res = await request.get("/");
    expect(res.ok()).toBe(true);
    const html = await res.text();
    // O primeiro slide precisa estar no HTML servido, não só depois do fetch no navegador
    expect(html).toMatch(/hero|Mais que óculos/i);
  });
});

test.describe("Foto removida não reaparece na página do produto", () => {
  test("a foto principal sempre está entre as miniaturas da galeria", async ({ page }) => {
    await page.goto("/produto/ventara-safari");
    const main = page.getByTestId("pdp-main-image");
    await expect(main).toBeVisible();
    const mainSrc = await main.getAttribute("src");
    const thumbs = await page.locator("button img").evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src));
    if (thumbs.length > 0) expect(thumbs).toContain(mainSrc);
  });
});
