import { test, expect } from "@playwright/test";

test.describe("Admin Lentes - Botões de Upload e Preview em Todos os Slots", () => {
  test("Exibe botões de upload em todas as linhas e slots da aba OPTiSYNC", async ({ page }) => {
    await page.goto("/admin/lentes");
    await page.waitForLoadState("domcontentloaded");

    // Alterna para a aba do CMS OPTiSYNC
    const optisyncTab = page.locator("button:has-text('Página OPTiSYNC')");
    await expect(optisyncTab).toBeVisible();
    await optisyncTab.click();

    // 1. Hero Principal
    await expect(page.locator('label:has-text("Upload Retrato Hero")')).toBeVisible();
    await expect(page.locator('label:has-text("Upload Caixa Oficial")')).toBeVisible();

    // 2. Linha 1 HD (4 botões: Arte 8, Arte 5, Arte 10, Arte 6)
    await expect(page.locator('span:has-text("Linha 1: OPTiSYNC HD")')).toBeVisible();
    const hdUploadButtons = page.locator('label:has-text("Trocar Foto"):not(:has-text("Banner"))');
    await expect(hdUploadButtons).toHaveCount(4);

    // 3. Linha 2 Fotossensível
    await expect(page.locator('label:has-text("Trocar Banner")')).toBeVisible();
    await expect(page.locator('label:has-text("Trocar Grade")')).toBeVisible();

    // 4. Linha 3 Kids Adventure
    await expect(page.locator('label:has-text("Trocar Pôster")')).toBeVisible();
    await expect(page.locator('label:has-text("Trocar Logo 3D")')).toBeVisible();

    // 5. Galeria Tecnológica
    const galleryUploads = page.locator('div:has-text("Galeria Tecnológica") label:has-text("Upload")');
    const galleryCount = await galleryUploads.count();
    expect(galleryCount).toBeGreaterThanOrEqual(1);

    // 6. Seção de Cores
    await expect(page.locator('label:has-text("Trocar Foto do Banner")')).toBeVisible();
  });
});
