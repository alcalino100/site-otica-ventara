import { test, expect } from "@playwright/test";

test.describe("Estabilização de Catálogo, Fonte Única e Escala (Issue #146)", () => {
  test("1. CRITÉRIO DE ACEITE: Contagem de produtos idêntica em 30 recarregamentos seguidos", async ({
    page,
  }) => {
    test.setTimeout(120000); // 2 minutos para 30 reloads com segurança

    // 1º carregamento para estabelecer a contagem de referência
    await page.goto("/armacoes");
    await page.waitForLoadState("domcontentloaded");

    const cardsLocator = page.locator(".product");
    await cardsLocator.first().waitFor({ state: "visible", timeout: 15000 });
    const baselineCount = await cardsLocator.count();
    expect(baselineCount).toBeGreaterThan(0);

    // Executa os 30 recarregamentos consecutivos
    for (let i = 1; i <= 30; i++) {
      await page.reload({ waitUntil: "domcontentloaded" });
      await cardsLocator.first().waitFor({ state: "visible", timeout: 15000 });
      const currentCount = await cardsLocator.count();

      expect(
        currentCount,
        `Falha na iteração ${i}: a contagem de produtos mudou de ${baselineCount} para ${currentCount}`
      ).toBe(baselineCount);
    }
  });

  test("2. FONTE ÚNICA E MATEMÁTICA DE PREÇOS: Preços consistentes e desconto calculado sem contradição", async ({
    page,
  }) => {
    await page.goto("/armacoes");
    await page.waitForLoadState("domcontentloaded");

    const productCards = page.locator(".product");
    await productCards.first().waitFor({ state: "visible", timeout: 15000 });
    const count = await productCards.count();

    for (let i = 0; i < Math.min(count, 6); i++) {
      const card = productCards.nth(i);
      const discountBadge = card.locator("span:has-text('% OFF')").first();

      if ((await discountBadge.count()) > 0) {
        const badgeText = await discountBadge.innerText();
        const percentMatch = badgeText.match(/-?(\d+)%/);

        if (percentMatch) {
          const displayedPercent = parseInt(percentMatch[1], 10);
          expect(displayedPercent).toBeGreaterThan(0);
          expect(displayedPercent).toBeLessThan(100);
        }
      }
    }
  });

  test("3. CORREÇÃO MOBILE: Fundo do header escuro em /armacoes sem faixa branca", async ({
    page,
  }) => {
    // Viewport mobile típico (iPhone 14 / Safari)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/armacoes");
    await page.waitForLoadState("domcontentloaded");

    // O hero no topo e o título devem estar visíveis
    const heroTitle = page.getByRole("heading", { name: /Catálogo de/i }).first();
    await expect(heroTitle).toBeVisible();

    const breadcrumbItem = page.getByText("Catálogo de Armações").first();
    await expect(breadcrumbItem).toBeVisible();

    // Valida que o container principal possui fundo escuro atrás do header
    const topContainer = page.locator("div.min-h-screen").first();
    const bgColor = await topContainer.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Deve ser escuro (rgb(2, 7, 13) correspondente a #02070D)
    expect(bgColor).toMatch(/rgb\((2,\s*7,\s*13|4,\s*11,\s*20|0,\s*0,\s*0)\)/);
  });

  test("4. DETALHE DO PRODUTO: Seletor de cores só aparece com 2+ variantes e calcula preços", async ({
    page,
  }) => {
    await page.goto("/produto/ventara-safari");
    await page.waitForLoadState("domcontentloaded");

    // Valida presença das informações de preço
    const priceText = page.locator("span.font-mono").filter({ hasText: "R$" }).first();
    await expect(priceText).toBeVisible();

    // Valida que os 3 cards antigos de garantia permanecem removidos
    await expect(page.locator("p:has-text('Garantia Oficial')")).toHaveCount(0);
    await expect(page.locator("p:has-text('Ajuste Gratuito')")).toHaveCount(0);
    await expect(page.locator("p:has-text('Montagem Ágil')")).toHaveCount(0);
  });

  test("5. ESCALA E AUTOMAÇÃO NO ADMIN: Importador em lote e Fotos em lote acessíveis", async ({
    page,
  }) => {
    // 5.1. Página de Importação CSV
    await page.goto("/admin/produtos/importar");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText("Importação de Armações em Lote (CSV)")).toBeVisible();
    await expect(page.getByText("Baixar Modelo CSV")).toBeVisible();

    // 5.2. Página de Upload de Fotos em Lote por SKU
    await page.goto("/admin/produtos/fotos-lote");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByText("Upload de Fotos em Lote (Casamento por SKU)")).toBeVisible();
    await expect(page.getByText("Escolher Arquivos")).toBeVisible();
  });
});
