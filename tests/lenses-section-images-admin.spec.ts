import { test, expect } from "@playwright/test";

test.describe("Admin - Gestão de Imagens e Visuais da Seção de Lentes", () => {
  test("1. Valida a aba 'Imagens da Seção & Símbolo Óptico' no Admin Lentes", async ({
    page,
  }) => {
    await page.goto("/admin/lentes");
    await page.waitForLoadState("networkidle");

    // Localiza e clica no botão da aba de Imagens da Seção
    const tabButton = page.locator("button:has-text('Imagens da Seção & Símbolo Óptico')");
    await expect(tabButton).toBeVisible();
    await tabButton.click();

    // Valida o título do cabeçalho da aba
    const heading = page.locator("h2:has-text('Imagens da Seção de Lentes & Padrão Óptico')");
    await expect(heading).toBeVisible();

    // Valida a prévia em tempo real do card
    const previewLabel = page.locator("text=Prévia em Tempo Real");
    await expect(previewLabel).toBeVisible();

    // Valida a presença do botão de upload de imagem personalizada
    const uploadBtn = page.locator("label:has-text('Escolher Imagem')");
    await expect(uploadBtn).toBeVisible();

    // Valida os campos de texto do selo
    const badgeTagInput = page.locator("input[placeholder='PADRÃO ÓPTICO VENTARA']");
    await expect(badgeTagInput).toBeVisible();

    // Valida o bloco de parceiros tecnológicos
    const partnersTitle = page.locator("text=Carrossel de Parceiros Tecnológicos");
    await expect(partnersTitle).toBeVisible();

    // Valida o botão de salvar
    const saveButton = page.locator("button:has-text('Salvar Imagens da Seção')");
    await expect(saveButton).toBeVisible();

    // Captura screenshot do painel admin completo
    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/admin-imagens-secao-lentes.png",
      fullPage: false,
    });
  });

  test("2. Valida a renderização dinâmica da Seção de Lentes na Home", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const lensesSection = page.locator("#lentes");
    await expect(lensesSection).toBeVisible();
    await lensesSection.scrollIntoViewIfNeeded();

    // Valida o selo óptico
    const badgeTag = lensesSection.locator("text=Padrão Óptico Ventara, Antirreflexo Multicamadas");
    // O texto Padrão Óptico Ventara deve estar visível no card
    const cardText = lensesSection.locator("text=PADRÃO ÓPTICO VENTARA").or(lensesSection.locator("text=Padrão Óptico Ventara"));
    await expect(cardText.first()).toBeVisible();

    // Valida a presença da fita de parceiros
    const ribbon = lensesSection.locator("text=PARCEIROS TECNOLÓGICOS & LENTES HOMOLOGADAS");
    await expect(ribbon).toBeVisible();

    // Captura screenshot da seção no site
    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/home-secao-lentes-preview.png",
      fullPage: false,
    });
  });
});
