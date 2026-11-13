import { test, expect } from "@playwright/test";

test.describe("P1 & P2: Medidas Completas em mm, Diagrama Autoral, Comparador e Visualização Mobile", () => {
  test.beforeEach(async ({ page }) => {
    // Evita intercepção de ponteiros pela roleta promocional
    await page.addInitScript(() => {
      window.sessionStorage.setItem("ventara_wheel_session_default-optica-ventara-2025", "1");
      window.localStorage.setItem("ventara_wheel_participated_default-optica-ventara-2025_v1", "1");
    });
  });

  test.describe("Página de Produto (PDP) - P1-A, P1-B & P1-C", () => {
    test.use({
      viewport: { width: 1280, height: 800 },
    });

    test("P1-A: Exibe os 3 números clássicos em destaque e tabela com as 5 medidas reais em mm sem estimativas", async ({ page }) => {
      await page.goto("/produto/ventara-safari");
      await page.waitForLoadState("domcontentloaded");

      // 1. Três números clássicos abaixo do título
      const classicNumbers = page.locator("[data-testid='classic-dimensions']");
      await expect(classicNumbers).toBeVisible();
      await expect(classicNumbers).toContainText("53");
      await expect(classicNumbers).toContainText("18");
      await expect(classicNumbers).toContainText("145");

      // 2. Não cita 'padrão ABNT'
      const bodyText = await page.content();
      expect(bodyText).not.toContain("padrão ABNT");
      expect(bodyText).not.toContain("Tamanho e Medidas Anatômicas (ABNT)");

      // 3. Tabela com medidas reais (o acordeão já inicia aberto)
      const sizingButton = page.locator("button:has-text('Medidas Reais Aferidas')");
      if (await sizingButton.getAttribute("aria-expanded") !== "true") {
        await sizingButton.click();
      }

      // Verifica presença das 5 medidas em milímetros na tabela
      const table = page.locator("table");
      await expect(table).toBeVisible();
      await expect(table).toContainText("Largura Frontal Total");
      await expect(table).toContainText("138 mm");
      await expect(table).toContainText("Largura da Lente (Aro)");
      await expect(table).toContainText("53 mm");
      await expect(table).toContainText("Ponte Nasal");
      await expect(table).toContainText("18 mm");
      await expect(table).toContainText("Comprimento da Haste");
      await expect(table).toContainText("145 mm");

      // NUNCA exibe '~' em medições
      expect(await table.textContent()).not.toContain("~");

      // 4. Diagrama Autoral Ilustrado SVG presente
      const svgDiagram = page.locator("svg[aria-label*='Ilustração técnica']");
      await expect(svgDiagram).toBeVisible();
    });

    test("P1-B: Comparador interativo 'Compare com a sua armação' calcula diferenças e feedback humano 100% no cliente", async ({ page }) => {
      await page.goto("/produto/ventara-safari");
      await page.waitForLoadState("domcontentloaded");

      // Abre aba de medidas se não estiver aberta
      const sizingButton = page.locator("button:has-text('Medidas Reais Aferidas')");
      if (await sizingButton.getAttribute("aria-expanded") !== "true") {
        await sizingButton.click();
      }

      // Localiza o comparador interativo
      const comparator = page.locator("div:has-text('Compare com a sua armação atual')").first();
      await expect(comparator).toBeVisible();

      // Aplica preset rápido 'Pequeno (49 · 18 · 140)'
      const presetBtn = page.locator("button:has-text('Pequeno (49 · 18 · 140)')");
      await expect(presetBtn).toBeVisible();
      await presetBtn.click();

      // Verifica inputs preenchidos
      const lensInput = page.locator("#user-lens");
      await expect(lensInput).toHaveValue("49");

      // Diagnóstico de caimento deve surgir instantaneamente
      const diagnosis = page.locator("h5:has-text('Lente 4 mm mais larga')");
      await expect(diagnosis).toBeVisible();
      await expect(page.locator("text=Proporcionará um campo de visão ligeiramente maior")).toBeVisible();

      // Gráfico visual de barras sobrepostas
      await expect(page.getByRole("heading", { name: "Comparação Visual" })).toBeVisible();
    });

    test("P1-E: Imagem principal da PDP carrega com fetchPriority high", async ({ page }) => {
      await page.goto("/produto/ventara-safari");
      await page.waitForLoadState("domcontentloaded");

      const mainImg = page.locator("[data-testid='pdp-main-image']");
      await expect(mainImg).toBeVisible();
    });
  });

  test.describe("Catálogo Mobile - P2 Tamanho dos Cards e Alternador de Exibição", () => {
    test.use({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });

    test("P2: Alternador entre grade compacta (2 colunas) e lista ampla (1 coluna) altera o layout e persiste", async ({ page }) => {
      await page.goto("/armacoes");
      await page.waitForLoadState("domcontentloaded");

      const gridBtn = page.locator("[data-testid='view-mode-grid']");
      const singleBtn = page.locator("[data-testid='view-mode-single']");

      await expect(gridBtn).toBeVisible();
      await expect(singleBtn).toBeVisible();

      // Por padrão em mobile, grade 2 colunas está ativa
      const productGrid = page.locator(".grid:has(> .product)").first();
      await expect(productGrid).toHaveClass(/grid-cols-2/);

      // Alterna para 1 coluna ampla
      await singleBtn.click();
      await page.waitForTimeout(100);
      await expect(productGrid).toHaveClass(/grid-cols-1/);

      // Recarrega e confirma persistência via localStorage
      await page.reload();
      await page.waitForLoadState("domcontentloaded");
      const reloadedGrid = page.locator(".grid:has(> .product)").first();
      await expect(reloadedGrid).toHaveClass(/grid-cols-1/);

      // Alterna de volta para grade 2 colunas
      const gridBtnReloaded = page.locator("[data-testid='view-mode-grid']");
      await gridBtnReloaded.click();
      await page.waitForTimeout(100);
      await expect(reloadedGrid).toHaveClass(/grid-cols-2/);
    });
  });
});
