import { test, expect } from "@playwright/test";

test.describe("Vitrine Esportiva & Solares - Admin & Frontend", () => {
  test("deve acessar a aba Vitrine Esportiva & Solares no admin e exibir os 4 modos e variações com fotos", async ({ page }) => {
    // 1. Acessa o admin de banners
    await page.goto("http://localhost:3000/admin/banners", { waitUntil: "domcontentloaded" });

    // Localiza e clica na nova aba
    const vitrineTab = page.getByRole("button", { name: /Vitrine Esportiva & Solares/i });
    await expect(vitrineTab).toBeVisible({ timeout: 10000 });
    await vitrineTab.click();

    // 2. Verifica se o bloco principal da vitrine interativa está visível
    const sectionTitle = page.getByText("Produtos & Fotos da Linha Esportiva e Solares");
    await expect(sectionTitle).toBeVisible({ timeout: 5000 });

    // 3. Verifica se as 4 sub-abas de modos estão visíveis
    await expect(page.getByText("🕶️ Esportivo Masculino")).toBeVisible();
    await expect(page.getByText("✨ Solar Feminino")).toBeVisible();
    await expect(page.getByText("👓 Grau em Titânio")).toBeVisible();
    await expect(page.getByText("💎 Grau Autoral Feminino")).toBeVisible();

    // 4. Verifica os botões de upload e as variações do modo atual (Ventara Horizonte Sport)
    await expect(page.getByText(/Ventara Horizonte Sport/i).first()).toBeVisible();
    const uploadButtons = page.getByText("📷 Trocar Foto do Óculos");
    await expect(uploadButtons).toHaveCount(4);

    // 5. Verifica os inputs com os valores das variações
    await expect(page.locator('input[value="Azul Safira Polarizado"]')).toBeVisible();
    await expect(page.locator('input[value="Fumê Polarizado Clássico"]')).toBeVisible();
    await expect(page.locator('input[value="Lava Fire Espelhado"]')).toBeVisible();
    await expect(page.locator('input[value="Branco Gelo com Safira"]')).toBeVisible();

    // 6. Tira screenshot do painel admin
    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/admin_vitrine_solares.png",
      fullPage: false,
    });

    // 7. Acessa a home do site para verificar a vitrine interativa
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    const showcaseSection = page.locator("#vitrine-interativa");
    await showcaseSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Verifica que o modelo e as variações estão renderizadas na home
    await expect(showcaseSection).toBeVisible();
    await expect(page.getByText(/Ventara Horizonte Sport/i).first()).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/home_vitrine_interativa.png",
    });
  });
});
