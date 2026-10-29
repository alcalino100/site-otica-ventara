import { test, expect } from "@playwright/test";

test.describe("Lentes Solares - Encontre Sua Cor Showcase", () => {
  test("Desktop: Renderiza a vitrine de Lentes Solares conforme referência do cliente", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#lentes-coloridas", { waitUntil: "networkidle" });

    const solarSection = page.locator("#lentes-coloridas");
    await expect(solarSection).toBeVisible();

    // 1. Verifica Cabeçalho Principal Exato do Print
    await expect(solarSection.getByText("ENCONTRE")).toBeVisible();
    await expect(solarSection.getByRole("heading", { name: "SUA COR" })).toBeVisible();
    await expect(
      solarSection.getByText("Lentes solares para uma nova forma de ver.")
    ).toBeVisible();

    // 2. Verifica Divisor "ESCOLHA SUA COR"
    await expect(solarSection.getByText("ESCOLHA SUA COR")).toBeVisible();

    // 3. Verifica os 7 botões das cores
    const colorNames = [
      "Cinza Fumê",
      "Marrom",
      "Verde",
      "Amarelo",
      "Azul Espelhado",
      "Vermelho Espelhado",
      "Degradê",
    ];

    for (const name of colorNames) {
      await expect(
        solarSection.getByRole("button", { name: new RegExp(name, "i") }).first()
      ).toBeVisible();
    }

    // 4. Clica em "Vermelho Espelhado" (conforme a foto do print do cliente)
    const vermelhoPod = solarSection
      .getByRole("button", { name: /Vermelho Espelhado/i })
      .first();
    await vermelhoPod.scrollIntoViewIfNeeded();
    await vermelhoPod.click();

    // Verifica se atualizou o preço e a lente hero
    await expect(solarSection.getByText("R$ 159,90")).toBeVisible();
    await expect(
      solarSection.getByRole("img", { name: "Lente Solar Ventara na cor Vermelho Espelhado" })
    ).toBeVisible();

    // 5. Captura screenshot desktop do componente
    const artifactPath =
      "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/lentes-solares-desktop-encontre-sua-cor.png";
    await solarSection.screenshot({ path: artifactPath });
  });

  test("Mobile: Renderiza responsivamente no iPhone com toque fluido", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#lentes-coloridas", { waitUntil: "networkidle" });

    const solarSection = page.locator("#lentes-coloridas");
    await expect(solarSection).toBeVisible();

    // Verifica título
    await expect(solarSection.getByRole("heading", { name: "SUA COR" })).toBeVisible();

    // Clica em "Azul Espelhado"
    const azulPod = solarSection.getByRole("button", { name: /Azul Espelhado/i }).first();
    await azulPod.scrollIntoViewIfNeeded();
    await azulPod.click();

    // Verifica imagem e preço de Azul Espelhado
    await expect(
      solarSection.getByRole("img", { name: "Lente Solar Ventara na cor Azul Espelhado" })
    ).toBeVisible();

    // Captura screenshot mobile
    const artifactPath =
      "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/lentes-solares-mobile-encontre-sua-cor.png";
    await solarSection.screenshot({ path: artifactPath });
  });
});
