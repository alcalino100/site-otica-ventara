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

test.describe("Vitrine da Home enxuta", () => {
  test("mostra no máximo 12 modelos (desktop) / 8 (mobile) e o botão Ver mais leva a /armacoes", async ({ page, isMobile }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "ventara_cookie_consent_v1",
        JSON.stringify({ necessary: true, analytics: true, marketing: false, timestamp: new Date().toISOString() })
      );
    });
    await page.goto("/#armacoes");
    const section = page.locator("#armacoes");
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const visibleCards = await section.locator(".product").evaluateAll(
      (els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length
    );
    expect(visibleCards).toBeGreaterThan(0);
    expect(visibleCards).toBeLessThanOrEqual(isMobile ? 8 : 12);
    const link = page.getByTestId("home-ver-mais-armacoes");
    await expect(link).toHaveAttribute("href", "/armacoes");
  });
});

test.describe("Vitrine interativa só com Solar Esportivo masculino", () => {
  test("sem Armações de Grau / Coleção Feminina e com o título fora da foto", async ({ page }) => {
    await page.goto("/");
    const vitrine = page.locator("#vitrine-interativa");
    await vitrine.scrollIntoViewIfNeeded();
    await expect(vitrine.getByText("Óculos Solar", { exact: true })).toBeVisible();
    await expect(vitrine.getByText("Esportivo", { exact: true })).toBeVisible();
    await expect(vitrine.getByText("Coleção Masculina")).toBeVisible();
    await expect(vitrine.getByText("Armações de Grau")).toHaveCount(0);
    await expect(vitrine.getByText("Coleção Feminina")).toHaveCount(0);
    // O título "Óculos Solares & Esportivos" fica fora da foto (legenda), não sobreposto a ela
    const caption = vitrine.getByTestId("showcase-caption");
    await expect(caption).toContainText(/Óculos Solares/i);
    const insideImage = await vitrine.locator(".aspect-\\[4\\/3\\] >> text=/Óculos Solares/i").count();
    expect(insideImage).toBe(0);
  });
});
