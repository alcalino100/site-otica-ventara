import { test, expect } from "@playwright/test";

test.describe("Preço Original Riscado e Desconto em Lentes e Produtos", () => {
  test.beforeEach(async ({ page }) => {
    // Previne abertura de banner de cookies para não interceptar cliques
    await page.addInitScript(() => {
      localStorage.setItem(
        "ventara_cookie_consent",
        JSON.stringify({ essential: true, analytics: true, marketing: true })
      );
    });
  });

  test("1. Card de Lente com Promoção: Exibe valor antigo riscado, desconto % e acessibilidade", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#lentes", { waitUntil: "domcontentloaded" });

    // Localiza a seção de lentes
    const lensesSection = page.locator("#lentes");
    await expect(lensesSection).toBeVisible({ timeout: 10000 });

    // Localiza o card ByVISION Audax (com promoção configurada)
    const promoCard = lensesSection.locator("article").filter({ hasText: /ByVISION|AUDAX/i }).first();
    await expect(promoCard).toBeVisible();

    // 1.1 Preço original riscado visível
    const originalPrice = promoCard.locator('[data-testid="original-price"]').first();
    await expect(originalPrice).toBeVisible();
    await expect(originalPrice).toHaveText(/249,90/);

    // 1.2 Preço atual em destaque âmbar
    const currentPrice = promoCard.locator('[data-testid="current-price"]').first();
    await expect(currentPrice).toBeVisible();
    await expect(currentPrice).toHaveText(/179,90/);

    // 1.3 Badge de desconto calculado (-28%)
    const discountBadge = promoCard.locator('[data-testid="discount-badge"]').first();
    await expect(discountBadge).toBeVisible();
    await expect(discountBadge).toHaveText(/-28%/);

    // 1.4 Acessibilidade para leitores de tela
    const srOnly = promoCard.locator(".sr-only").first();
    const srText = (await srOnly.textContent()) || "";
    expect(srText.replace(/\u00a0/g, " ")).toMatch(/De R\$ 249,90 por R\$ 179,90/i);

    // 1.5 Parcelamento calculado sobre o preço atual
    await expect(promoCard.getByText(/10x de R\$ 17,99 sem juros/i)).toBeVisible();

    // 1.6 "À partir de", botão WhatsApp e Prazo de montagem
    await expect(promoCard.getByText(/À partir de/i)).toBeVisible();
    await expect(promoCard.getByRole("link", { name: /Garantir no WhatsApp/i })).toBeVisible();
    await expect(promoCard.getByText(/Pronto em até 1 hora/i)).toBeVisible();
  });

  test("2. Card de Lente sem Promoção: Exibe apenas preço atual sem quebrar layout", async ({
    page,
  }) => {
    await page.goto("/#lentes", { waitUntil: "domcontentloaded" });

    const lensesSection = page.locator("#lentes");
    await expect(lensesSection).toBeVisible({ timeout: 10000 });

    // Localiza lente sem promoção (ex: TRANSITIONS)
    const regularCard = lensesSection.locator("article").filter({ hasText: /TRANSITIONS/i }).first();
    await expect(regularCard).toBeVisible();

    // Preço atual presente
    const currentPrice = regularCard.locator('[data-testid="current-price"]').first();
    await expect(currentPrice).toBeVisible();
    await expect(currentPrice).toHaveText(/679,60/);

    // NÃO deve ter preço riscado nem badge de desconto
    await expect(regularCard.locator('[data-testid="original-price"]')).toHaveCount(0);
    await expect(regularCard.locator('[data-testid="discount-badge"]')).toHaveCount(0);
  });

  test("3. Página dedicada /lentes: Renderiza preço riscado e badge de desconto", async ({
    page,
  }) => {
    await page.goto("/lentes", { waitUntil: "domcontentloaded" });

    const promoCard = page.locator("article").filter({ hasText: /ByVISION|AUDAX/i }).first();
    await expect(promoCard).toBeVisible({ timeout: 10000 });

    const originalPrice = promoCard.locator('[data-testid="original-price"]').first();
    await expect(originalPrice).toBeVisible();
    await expect(originalPrice).toHaveText(/249,90/);

    const currentPrice = promoCard.locator('[data-testid="current-price"]').first();
    await expect(currentPrice).toBeVisible();
    await expect(currentPrice).toHaveText(/179,90/);
  });

  test("4. Admin de Lentes: Formulário de preço antigo e validação de valor menor que o atual", async ({
    page,
  }) => {
    // Configura autenticação mock de admin para o teste
    await page.context().addCookies([
      {
        name: "ventara_admin_session",
        value: "active_test_session",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/admin/lentes", { waitUntil: "domcontentloaded" });

    // Abre o modal de nova lente
    const newLensBtn = page.getByRole("button", { name: /Adicionar Nova Lente/i });
    await expect(newLensBtn).toBeVisible({ timeout: 10000 });
    await newLensBtn.click();

    await expect(page.getByText(/Adicionar Nova Lente \/ Laboratório/i)).toBeVisible();

    // Localiza campos de preço
    const currentPriceInput = page.getByPlaceholder("Ex: R$ 149,90");
    const originalPriceInput = page.getByPlaceholder("Ex: R$ 199,90");

    await currentPriceInput.fill("R$ 200,00");
    // Preenche preço antigo INVÁLIDO (menor que o atual)
    await originalPriceInput.fill("R$ 150,00");

    // Validação imediata: exibe mensagem de erro clara
    await expect(
      page.getByText(/O preço antigo \(R\$ 150,00\) deve ser estritamente maior que o preço atual \(R\$ 200,00\)/i)
    ).toBeVisible();

    // Corrige para preço antigo VÁLIDO (maior que o atual)
    await originalPriceInput.fill("R$ 250,00");

    // O erro deve sumir e exibir o cálculo do desconto (-20%)
    await expect(
      page.getByText(/O preço antigo \(R\$ 150,00\) deve ser estritamente maior/i)
    ).not.toBeVisible();
    await expect(page.getByText(/Desconto calculado: -20%/i)).toBeVisible();

    // Fecha o modal
    await page.getByRole("button", { name: "Cancelar" }).click();
  });
});
