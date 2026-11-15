import { test, expect } from "@playwright/test";

// Foto principal grande (a imagem mais larga da galeria)
const mainSrc = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const imgs = [...document.querySelectorAll("main img")].filter((i) => i.getBoundingClientRect().width > 300);
    return imgs.length ? imgs[0].getAttribute("src") : null;
  });

test.describe("Página do produto: galeria", () => {
  test("clicar numa miniatura troca a foto principal", async ({ page }) => {
    await page.goto("/produto/ventara-safari");
    await page.addStyleTag({ content: '[aria-label*="Consentimento"]{display:none !important}' });

    const before = await mainSrc(page);
    expect(before).toBeTruthy();

    // 2ª foto do produto (miniatura): a principal precisa passar a ser ela
    const second = page.locator('main img[src*="u708m6"]').first();
    await second.click({ force: true });
    await expect.poll(() => mainSrc(page)).toContain("u708m6");
    expect(await mainSrc(page)).not.toBe(before);
  });
});
