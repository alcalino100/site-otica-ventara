import { test, expect } from "@playwright/test";

test.describe("Ótica Ventara - Catálogo e Interações", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("deve carregar a página inicial com elementos essenciais da marca", async ({ page }) => {
    await expect(page).toHaveTitle(/Ventara/i);
    const brandHeading = page.locator("h1");
    await expect(brandHeading).toContainText("Mais que óculos");
  });

  test("deve permitir filtrar produtos por categoria", async ({ page }) => {
    // Rola até o catálogo
    const catalog = page.locator("#armacoes");
    await catalog.scrollIntoViewIfNeeded();

    // Filtra por Grau
    const grauFilter = page.getByRole("button", { name: "Grau", exact: true });
    await grauFilter.click();
    await expect(grauFilter).toHaveClass(/active/);

    // Filtra por Solar
    const solarFilter = page.getByRole("button", { name: "Solar", exact: true });
    await solarFilter.click();
    await expect(solarFilter).toHaveClass(/active/);
  });

  test("deve adicionar item à seleção e exibir feedback visual", async ({ page }) => {
    const catalog = page.locator("#armacoes");
    await catalog.scrollIntoViewIfNeeded();

    // Encontra o primeiro botão de adicionar à seleção
    const addBtn = page.getByRole("button", { name: /Adicionar .* à seleção/i }).first();
    await addBtn.click();

    // Verifica que o toast de confirmação foi exibido
    const toast = page.locator(".toast-container");
    await expect(toast).toBeVisible();

    // Verifica o badge de contagem no cabeçalho
    const cartCount = page.locator(".count");
    await expect(cartCount).toHaveText("1");
  });

  test("deve expandir e recolher perguntas frequentes (FAQ)", async ({ page }) => {
    const faq = page.locator("#duvidas");
    await faq.scrollIntoViewIfNeeded();

    const faqButton = page.getByRole("button", { name: /Como funciona a escolha de armações/i });
    await expect(faqButton).toBeVisible();
    await expect(faqButton).toHaveAttribute("aria-expanded", "true");

    // Fecha a pergunta
    await faqButton.click();
    await expect(faqButton).toHaveAttribute("aria-expanded", "false");
  });
});
