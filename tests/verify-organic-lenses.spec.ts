import { test, expect } from "@playwright/test";

test.describe("Validação das Formas Orgânicas com Fotos Reais das Lentes Solares", () => {
  test("1. Desktop: Renderiza formas orgânicas, fotos reais das lentes e atualização da lente hero", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const section = page.locator("#lentes-coloridas");
    await expect(section).toBeVisible({ timeout: 10000 });
    await section.scrollIntoViewIfNeeded();

    // Aguarda montagem completa
    await page.waitForTimeout(500);

    // Verifica Título e Divisor
    await expect(section.getByText("ESCOLHA SUA COR")).toBeVisible();
    await expect(section.getByRole("heading", { name: "SUA COR" })).toBeVisible();

    // Verifica que as 7 cores oficiais da referência possuem seus botões e fotos orgânicas
    const colors = [
      "Cinza Fumê",
      "Marrom",
      "Verde",
      "Amarelo",
      "Azul Espelhado",
      "Vermelho Espelhado",
      "Degradê",
    ];

    for (const colorName of colors) {
      const btn = section.getByRole("button", { name: colorName, exact: true });
      await expect(btn).toBeVisible();
    }

    // Por padrão Cinza Fumê está ativo
    await expect(section.getByRole("heading", { name: /Cinza Fumê/i })).toBeVisible();

    // Clica em Vermelho Espelhado
    const vermelhoBtn = section.getByRole("button", { name: "Vermelho Espelhado", exact: true });
    await vermelhoBtn.click();
    await page.waitForTimeout(300);

    // Deve atualizar o texto e a lente hero para a foto real em alta definição
    await expect(section.getByRole("heading", { name: /Vermelho Espelhado/i })).toBeVisible();
    await expect(section.getByText("R$ 159,90")).toBeVisible();

    const heroImg = section.locator("img[src*='hero-lens-vermelho-espelhado']");
    await expect(heroImg).toBeVisible();

    // Clica em Verde
    const verdeBtn = section.getByRole("button", { name: "Verde", exact: true });
    await verdeBtn.click();
    await page.waitForTimeout(300);

    await expect(section.getByRole("heading", { name: /Verde G-15/i })).toBeVisible();
    const verdeHero = section.locator("img[src*='hero-lens-verde']");
    await expect(verdeHero).toBeVisible();
  });

  test("2. Mobile: Exibição responsiva e fluida com formas orgânicas", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const section = page.locator("#lentes-coloridas");
    await expect(section).toBeVisible({ timeout: 10000 });
    await section.scrollIntoViewIfNeeded();

    await page.waitForTimeout(500);

    // Clica em Azul Espelhado no mobile
    const azulBtn = section.getByRole("button", { name: "Azul Espelhado", exact: true });
    await azulBtn.click();
    await page.waitForTimeout(300);

    await expect(section.getByRole("heading", { name: /Azul Espelhado/i })).toBeVisible();
    const heroImg = section.locator("img[src*='hero-lens-azul-espelhado']");
    await expect(heroImg).toBeVisible();
  });
});
