import { test, expect } from "@playwright/test";

test.describe("Validação dos Ajustes Urgentes do Cliente (Prints)", () => {
  test("1. Catálogo /armacoes: Cards no padrão da vitrine com Comprar e Dúvidas no WhatsApp (Sem sobreposição)", async ({
    page,
  }) => {
    await page.goto("/armacoes");
    await page.waitForLoadState("domcontentloaded");

    const productCards = page.locator(".product.group");
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);

    const firstCard = productCards.first();

    // 1. Container de card branco com borda suave
    await expect(firstCard).toHaveClass(/bg-white/);

    // 2. Foto em container com aspect-[4/3] e object-cover
    const img = firstCard.locator("img").first();
    await expect(img).toBeVisible();

    // 3. Badges do topo (Desconto ou Exclusivo + Destaque)
    const topBadges = firstCard.locator("span:has-text('OFF'), span:has-text('EXCLUSIVO')").first();
    await expect(topBadges).toBeVisible();

    // 4. Marca e Nome do modelo
    const brand = firstCard.locator("text=/VENTARA/").first();
    await expect(brand).toBeVisible();

    // 5. Preço e parcelamento sem juros
    const price = firstCard.locator("text=/R\\$\\s*\\d+/").first();
    await expect(price).toBeVisible();
    const installment = firstCard.locator("text=/10x de R\\$/").first();
    await expect(installment).toBeVisible();

    // 6. Botão Comprar (escuro)
    const buyBtn = firstCard.locator("a:has-text('Comprar')").first();
    await expect(buyBtn).toBeVisible();
    await expect(buyBtn).toHaveAttribute("href", /\/armacoes\//);

    // 7. Botão Dúvidas no WhatsApp (amarelo)
    const zapBtn = firstCard.locator("a:has-text('Dúvidas no WhatsApp')").first();
    await expect(zapBtn).toBeVisible();
    await expect(zapBtn).toHaveAttribute("href", /wa\.me/);
  });

  test("2. Detalhes de armação /armacoes/[id]: Fundo branco e layout limpo", async ({
    page,
  }) => {
    await page.goto("/armacoes/ventara-safari");
    await page.waitForLoadState("domcontentloaded");

    // Valida container de fundo branco
    const mainWrapper = page.locator("div.min-h-screen").first();
    await expect(mainWrapper).toHaveClass(/bg-white/);

    // Breadcrumb com texto claro e legível
    const breadcrumb = page.locator("nav[aria-label='Breadcrumb']");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.locator("text=Armações")).toBeVisible();

    // Preço e botão de compra
    const buyButton = page.locator("button:has-text('COMPRAR AGORA')");
    await expect(buyButton).toBeVisible();
  });

  test("3. Hero da Home: Botão 'Ver armações' direciona para /armacoes", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const armacoesBtn = page.locator("a:has-text('Ver armações')").first();
    await expect(armacoesBtn).toBeVisible();
    await expect(armacoesBtn).toHaveAttribute("href", "/armacoes");
  });

  test("4. Rodapé: Selo da Visa exibido corretamente", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const visaBadge = page.locator("div[data-testid='payment-badge-visa'] img");
    await expect(visaBadge).toBeVisible();
    await expect(visaBadge).toHaveAttribute("src", /\/visa\.svg/);
  });
});
