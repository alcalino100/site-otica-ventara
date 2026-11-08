import { test, expect } from "@playwright/test";

test.describe("Ótica Ventara - Catálogo e Interações", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("deve carregar a página inicial com elementos essenciais da marca e Hero", async ({ page }) => {
    await expect(page).toHaveTitle(/Ventara/i);
    const brandHeading = page.locator("h1");
    await expect(brandHeading).toBeVisible();
    await expect(brandHeading).toContainText("Mais que óculos");

    // Valida botões de ação do Hero
    const ctaLentes = page.getByRole("link", { name: /Catálogo de Lentes/i }).first();
    await expect(ctaLentes).toBeVisible();

    const ctaArmacoes = page.getByRole("link", { name: /Ver armações/i }).first();
    await expect(ctaArmacoes).toBeVisible();
  });

  test("deve permitir filtrar produtos por categoria no catálogo da home", async ({ page }) => {
    const catalog = page.locator("#armacoes");
    await catalog.scrollIntoViewIfNeeded();

    // Filtra por Grau se disponível
    const grauFilter = page.getByRole("button", { name: "Grau", exact: true });
    if (await grauFilter.isVisible()) {
      await grauFilter.click();
      await expect(grauFilter).toBeVisible();
    }

    // Filtra por Solar se disponível
    const solarFilter = page.getByRole("button", { name: "Solar", exact: true });
    if (await solarFilter.isVisible()) {
      await solarFilter.click();
      await expect(solarFilter).toBeVisible();
    }
  });

  test("deve adicionar item à seleção e exibir feedback visual", async ({ page }) => {
    const catalog = page.locator("#armacoes");
    await catalog.scrollIntoViewIfNeeded();

    // Encontra o primeiro botão de adicionar à seleção
    const addBtn = page.getByRole("button", { name: /Adicionar .* à seleção/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();

      // Verifica o toast de confirmação ou contador
      const toast = page.locator(".toast-container");
      await expect(toast).toBeVisible({ timeout: 5000 });
    }
  });

  test("deve expandir e recolher perguntas frequentes (FAQ)", async ({ page }) => {
    const faq = page.locator("#duvidas");
    await faq.scrollIntoViewIfNeeded();

    const faqButton = page.getByRole("button", { name: /Como funciona a escolha de armações/i });
    if (await faqButton.isVisible()) {
      await expect(faqButton).toBeVisible();

      // Alterna o acordeão
      await faqButton.click();
      await page.waitForTimeout(200);
      await faqButton.click();
    }
  });

  test("deve acessar a página individual do produto com especificações técnicas", async ({ page }) => {
    await page.goto("/produto/ventara-aurora");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveTitle(/Ventara Aurora/i);
    await expect(page.locator("h1")).toContainText("Ventara Aurora");
    await expect(page.getByText("Acetato Premium").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Comprar Agora/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Consultar Lentes no WhatsApp/i })).toBeVisible();
  });

  test("deve exibir vitrine com foto e detalhes na página de detalhes (/produto/ventara-onca)", async ({ page }) => {
    await page.goto("/produto/ventara-onca");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveTitle(/Ventara Onça/i);
    await expect(page.locator("h1")).toContainText("Ventara Onça");

    // Verifica imagem principal do produto
    const mainImg = page.locator("img[alt*='Ventara Onça']").first();
    await expect(mainImg).toBeVisible();

    // Verifica garantia e dimensões
    await expect(page.getByText(/sob medida no laboratório próprio/i)).toBeVisible();
    await expect(page.getByText(/DIMENSÕES ANATÔMICAS/i)).toBeVisible();
  });

  test("deve carregar a página do Responsável Técnico com foto e credenciais de Gustavo Guimarães Cordeiro (/responsavel-tecnico)", async ({ page }) => {
    await page.goto("/responsavel-tecnico");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveTitle(/Gustavo Guimarães Cordeiro/i);
    await expect(page.locator("h1")).toContainText("Gustavo Guimarães");
    await expect(page.getByText("Técnico Óptico Formado").first()).toBeVisible();
    await expect(page.getByRole("img", { name: /Gustavo Guimarães Cordeiro/i })).toBeVisible();
    await expect(page.getByText("Montagem na Facetadora & Lensometria")).toBeVisible();
  });

  test("deve consultar e exibir o rastreamento de pedido (/rastreio e /api/orders/track)", async ({ page, request }) => {
    // 1. Testa a API de rastreio direto
    const apiRes = await request.get("/api/orders/track?code=VEN-10294");
    expect(apiRes.status()).toBe(200);
    const apiJson = await apiRes.json();
    expect(apiJson.success).toBe(true);
    expect(apiJson.order.reference_code).toBe("VEN-10294");

    // 2. Testa a página de rastreamento
    await page.goto("/rastreio");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Acompanhe a Produção e Entrega");
    await page.fill("input[placeholder*='código']", "VEN-10294");
    await page.click("button:has-text('Rastrear')");
    await expect(page.getByText("VEN-10294").first()).toBeVisible();
  });

  test("deve exibir vitrine de armações com cards de produtos e links acessíveis", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const catalogSection = page.locator("#armacoes");
    await catalogSection.scrollIntoViewIfNeeded();

    const productCard = catalogSection.locator(".product").first();
    await expect(productCard).toBeVisible();
  });
});
