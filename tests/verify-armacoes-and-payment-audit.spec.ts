import { test, expect } from "@playwright/test";

test.describe("E-commerce de Armações e Auditoria de Pagamentos", () => {
  test("1. Botão Armações no Header deve apontar para /armacoes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const isMobileMenu = await page.locator('button[aria-label="Abrir menu"]').isVisible();
    if (isMobileMenu) {
      await page.locator('button[aria-label="Abrir menu"]').click();
      const mobileLink = page.locator('.mobile-nav-panel a:has-text("Armações")');
      await expect(mobileLink).toBeVisible();
      await expect(mobileLink).toHaveAttribute("href", "/armacoes");
      await mobileLink.click();
    } else {
      const desktopLink = page.locator('header nav a:has-text("Armações")').first();
      await expect(desktopLink).toBeVisible();
      await expect(desktopLink).toHaveAttribute("href", "/armacoes");
      await desktopLink.click();
    }

    await page.waitForURL("**/armacoes");
    expect(page.url()).toContain("/armacoes");
  });

  test("2. Catálogo /armacoes deve renderizar categorias de e-commerce e cards editoriais", async ({ page }) => {
    await page.goto("/armacoes");
    await page.waitForLoadState("domcontentloaded");

    // Título e Benefícios
    await expect(page.locator("h1")).toContainText("Armações & Óculos");
    await expect(page.getByText("10x Sem Juros")).toBeVisible();
    await expect(page.getByText("Laboratório Próprio")).toBeVisible();

    // Abas de Categorias (Pills)
    const todasTab = page.locator('button:has-text("Todas as Armações")');
    const grauFemTab = page.locator('button:has-text("Grau Feminino")');
    const solarTab = page.locator('button:has-text("Óculos de Sol")');
    const infantilTab = page.locator('button:has-text("Infantil / Kids")');
    const destaquesTab = page.locator('button:has-text("Destaques & Ofertas")');

    await expect(todasTab).toBeVisible();
    await expect(grauFemTab).toBeVisible();
    await expect(solarTab).toBeVisible();
    await expect(infantilTab).toBeVisible();
    await expect(destaquesTab).toBeVisible();

    // Filtro por Categoria: Óculos de Sol
    await solarTab.click();
    await page.waitForTimeout(300);

    // Barra de Busca
    const searchInput = page.locator('input[placeholder*="Buscar por modelo"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Safari");
    await page.waitForTimeout(300);

    // Botão de Filtros Avançados (específico)
    const filtersBtn = page.getByRole("button", { name: /Filtros/i }).first();
    await expect(filtersBtn).toBeVisible();
    await filtersBtn.click();

    // Verifica seletores de filtros
    await expect(page.getByText("Formato do Aro")).toBeVisible();
    await expect(page.getByText("Material")).toBeVisible();
    await expect(page.getByText("Cor Predominante")).toBeVisible();
    await expect(page.getByText("Faixa de Preço")).toBeVisible();
  });

  test("3. Endpoint de Auditoria de Pagamentos deve retornar métricas e lista de transações", async ({ request }) => {
    const res = await request.get("/api/admin/payments/audit");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("transactions");
    expect(data).toHaveProperty("metrics");
    expect(data.metrics).toHaveProperty("totalCount");
    expect(data.metrics).toHaveProperty("approvedCount");
    expect(data.metrics).toHaveProperty("rejectedCount");
    expect(data.metrics).toHaveProperty("successRate");
  });

  test("4. Gerador de Pix de Teste deve validar credenciais com mensagem amigável", async ({ request }) => {
    const res = await request.post("/api/admin/payments", {
      data: {
        action: "generate_test_pix",
        access_token: "short_key",
      },
    });

    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.pix.errorMessage).toContain("Access Token");
  });

  test("5. Painel Admin /admin/pagamentos deve exibir aba de Auditoria com métricas e tabela", async ({ page }) => {
    await page.goto("/admin/pagamentos");
    await page.waitForLoadState("domcontentloaded");

    // Abas de navegação
    const configTab = page.locator('button:has-text("Configuração & Chaves da API")');
    const auditTab = page.locator('button:has-text("Auditoria & Histórico de Transações")');

    await expect(configTab).toBeVisible();
    await expect(auditTab).toBeVisible();

    // Clica na aba de auditoria
    await auditTab.click();
    await page.waitForTimeout(300);

    // Cards de Métricas
    await expect(page.getByText("Tentativas Totais")).toBeVisible();
    await expect(page.getByText("Taxa de Conversão")).toBeVisible();
    await expect(page.getByText("Recusadas / Falhas")).toBeVisible();

    // Botão de Exportar CSV
    await expect(page.locator('button:has-text("Exportar")')).toBeVisible();
  });
});
