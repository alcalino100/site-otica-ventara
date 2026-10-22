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

    // Filtra por Infantil
    const infantilFilter = page.getByRole("button", { name: "Infantil", exact: true });
    await infantilFilter.click();
    await expect(infantilFilter).toHaveClass(/active/);
    await expect(page.getByText("Ventara Kids Flex")).toBeVisible();
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

  test("deve acessar a página individual do produto com especificações técnicas", async ({ page }) => {
    await page.goto("/produto/ventara-aurora");
    await expect(page).toHaveTitle(/Ventara Aurora/i);
    await expect(page.locator("h1")).toContainText("Ventara Aurora");
    await expect(page.getByText("Acetato Premium").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Adicionar à seleção/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Consultar.*WhatsApp/i })).toBeVisible();
  });

  test("deve interagir com a vitrine editorial (troca de categoria, gênero e miniaturas)", async ({ page }) => {
    const showcase = page.locator("#vitrine-interativa");
    await showcase.scrollIntoViewIfNeeded();
    await expect(showcase).toBeVisible();

    // Verifica headline inicial
    await expect(showcase.getByRole("heading", { level: 2 })).toContainText("Mais que óculos");

    // Alterna para Armações de Grau
    const grauBtn = showcase.getByRole("button", { name: /Armações de Grau/i });
    await grauBtn.click();
    await expect(showcase.getByText(/ARMAÇÕES DE GRAU/i).first()).toBeVisible();

    // Alterna para Coleção Feminina
    const femBtn = showcase.getByRole("button", { name: /Coleção Feminina/i });
    await femBtn.click();
    await expect(showcase.getByText(/COLEÇÃO ACETATO NOBRE/i)).toBeVisible();

    // Clica em uma miniatura de variação
    const thumbnail = showcase.getByRole("button", { name: /Tartaruga/i }).first();
    await thumbnail.click();

    // Adiciona à sacola a partir da vitrine
    const addShowcaseBtn = showcase.getByRole("button", { name: /Salvar na Sacola/i });
    await addShowcaseBtn.click();
    await expect(showcase.getByText(/Adicionado!/i)).toBeVisible();
  });

  test("deve navegar e alternar abas de valores na seção compacta de lentes", async ({ page }) => {
    const lensesSection = page.locator("#lentes");
    await lensesSection.scrollIntoViewIfNeeded();
    await expect(lensesSection).toBeVisible();

    // Verifica aba inicial Visão Simples com preço inicial
    await expect(lensesSection.getByText(/Visão Simples/i).first()).toBeVisible();
    await expect(lensesSection.getByText(/R\$ 99,90/i)).toBeVisible();

    // Alterna para Multifocais
    const multifocalBtn = lensesSection.getByRole("button", { name: /Multifocais/i });
    await multifocalBtn.click();
    await expect(lensesSection.getByText(/R\$ 289,00/i)).toBeVisible();

    // Alterna para Filtro Luz Azul
    const blueBtn = lensesSection.getByRole("button", { name: /Filtro Luz Azul/i });
    await blueBtn.click();
    await expect(lensesSection.getByText(/R\$ 149,90/i)).toBeVisible();
  });

  test("deve exibir destaque da marca de lentes OPTiSYNC HD e foto real do laboratório", async ({ page }) => {
    const lensesSection = page.locator("#lentes");
    await lensesSection.scrollIntoViewIfNeeded();
    await expect(lensesSection.getByText(/OPTiSYNC HD/i).first()).toBeVisible();
    await expect(lensesSection.getByText(/Filtro Azul & Antirreflexo/i).first()).toBeVisible();

    const aboutSection = page.locator("#sobre-nos");
    await aboutSection.scrollIntoViewIfNeeded();
    await expect(aboutSection.getByText(/Nosso Laboratório Próprio em Araçatuba-SP/i)).toBeVisible();
    await expect(aboutSection.getByText(/FOTO REAL DA LOJA FÍSICA/i)).toBeVisible();
  });
});
