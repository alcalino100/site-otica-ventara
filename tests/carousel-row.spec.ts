import { test, expect } from "@playwright/test";

test("deve validar que armacoes no mobile estao em carrossel de 1 nivel de altura", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => {
    localStorage.setItem(
      "ventara_cookie_consent_v1",
      JSON.stringify({ necessary: true, analytics: true, marketing: false, timestamp: new Date().toISOString() })
    );
  });
  await page.goto("/#armacoes");
  await page.waitForLoadState("domcontentloaded");

  const armacoes = page.locator("#armacoes");
  await armacoes.scrollIntoViewIfNeeded();

  // Mede as coordenadas verticais (top) de todos os cards visíveis no carrossel
  const cardTops = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll("#armacoes article.product"));
    return cards.map((c) => Math.round(c.getBoundingClientRect().top));
  });

  console.log("Card Y positions on mobile:", cardTops);
  expect(cardTops.length).toBeGreaterThan(0);

  // Todos os cards devem compartilhar o mesmo Y (mesmo nível de altura), confirmando que é 1 linha horizontal
  const firstTop = cardTops[0];
  const allInSameRow = cardTops.every((top) => Math.abs(top - firstTop) <= 2);
  expect(allInSameRow).toBe(true);

  // Tira screenshot do carrossel mobile de 1 nível de altura
  await armacoes.screenshot({
    path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/mobile-frames-single-row-carousel.png",
  });
});

test("deve validar que lentes de alta precisao no mobile estao em carrossel de 1 nivel de altura", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addInitScript(() => {
    localStorage.setItem(
      "ventara_cookie_consent_v1",
      JSON.stringify({ necessary: true, analytics: true, marketing: false, timestamp: new Date().toISOString() })
    );
  });
  await page.goto("/#lentes");
  await page.waitForLoadState("domcontentloaded");

  const lentes = page.locator("#lentes");
  await lentes.scrollIntoViewIfNeeded();

  // Verifica que o carrossel de lentes existe e mede as posições verticais (top) dos cards de lentes (ex: OPTiSYNC)
  const lensCardTops = await page.evaluate(() => {
    const carousel = document.querySelector("#lentes [role='region'][aria-label*='Carrossel de lentes']");
    if (!carousel) return [];
    const cards = Array.from(carousel.children) as HTMLElement[];
    return cards.map((c) => Math.round(c.getBoundingClientRect().top));
  });

  console.log("Lens card Y positions on mobile:", lensCardTops);
  expect(lensCardTops.length).toBeGreaterThan(0);

  // Todos os cards de lentes devem compartilhar o mesmo Y (mesmo nível de altura)
  const firstLensTop = lensCardTops[0];
  const allLensesInSameRow = lensCardTops.every((top) => Math.abs(top - firstLensTop) <= 2);
  expect(allLensesInSameRow).toBe(true);

  // Tira screenshot do carrossel mobile de lentes
  await lentes.screenshot({
    path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/mobile-lenses-single-row-carousel.png",
  });
});
