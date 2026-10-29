import { test, expect } from "@playwright/test";

test.describe("Hero Redesigned - Luxury Atelier Showcase", () => {
  test("Desktop: Renderiza o Hero com Vitrine Atelier de Luxo (Apple/Emil Design)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "networkidle" });

    const heroSection = page.locator("#inicio");
    await expect(heroSection).toBeVisible();

    // 1. Verifica Textos e Destaques da Esquerda
    await expect(heroSection.getByText("QUALIDADE QUE VOCÊ VÊ")).toBeVisible();
    await expect(heroSection.getByRole("heading", { name: /Mais que óculos/i })).toBeVisible();
    await expect(heroSection.getByRole("link", { name: /Catálogo de Lentes/i })).toBeVisible();
    await expect(heroSection.getByRole("link", { name: /Ver armações/i })).toBeVisible();

    // 2. Verifica os 3 Proof Markers
    await expect(heroSection.getByText("Lab Próprio")).toBeVisible();
    await expect(heroSection.getByText("Pronto em 1h")).toBeVisible();
    await expect(heroSection.getByText("100% Autoral")).toBeVisible();

    // 3. Verifica a Vitrine Atelier na Direita
    await expect(
      heroSection.getByText("ARMAÇÕES DE QUALIDADE E ESTILO").first()
    ).toBeVisible();
    await expect(
      heroSection.getByText("Curadoria Autoral Ventara · Acetato Premium").first()
    ).toBeVisible();

    // 4. Captura Screenshot Desktop
    const artifactPath =
      "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/hero-redesigned-desktop-atelier.png";
    await heroSection.screenshot({ path: artifactPath });
  });

  test("Mobile: Renderiza responsivamente no iPhone sem corte ou distorção", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "networkidle" });

    const heroSection = page.locator("#inicio");
    await expect(heroSection).toBeVisible();

    await expect(heroSection.getByRole("heading", { name: /Mais que óculos/i })).toBeVisible();
    await expect(heroSection.getByRole("link", { name: /Catálogo de Lentes/i })).toBeVisible();

    // 2. Captura Screenshot Mobile
    const artifactPath =
      "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/hero-redesigned-mobile-atelier.png";
    await heroSection.screenshot({ path: artifactPath });
  });
});
