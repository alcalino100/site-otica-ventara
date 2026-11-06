import { test, expect } from "@playwright/test";

test.describe("Página /armacoes - Cards no Padrão da Home (Sem Fotos Cortadas)", () => {
  test("Renderiza os cards no padrão imersivo da Home com foto completa, WhatsApp e Ver Detalhes", async ({
    page,
  }) => {
    await page.goto("/armacoes");
    await page.waitForLoadState("domcontentloaded");

    // Seleciona os cards de produtos
    const productCards = page.locator(".product.group");
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);

    // Valida o primeiro card
    const firstCard = productCards.first();

    // 1. Foto em sangria com object-cover
    const img = firstCard.locator("img").first();
    await expect(img).toBeVisible();
    await expect(img).toHaveClass(/object-cover/);

    // 2. Badge de categoria (ex: ARMAÇÃO DE GRAU / ÓCULOS DE SOL)
    const categoryBadge = firstCard.locator("span:has-text('ARMAÇÃO DE GRAU'), span:has-text('ÓCULOS DE SOL')").first();
    await expect(categoryBadge).toBeVisible();

    // 3. Swatches com contador em amarelo
    const colorText = firstCard.locator("span:has-text('cor'), span:has-text('cores'), span:has-text('Cores autorais')").first();
    await expect(colorText).toBeVisible();

    // 4. Preço e parcelamento
    const priceText = firstCard.locator("text=/R\\$\\s*\\d+/").first();
    await expect(priceText).toBeVisible();
    const installmentText = firstCard.locator("text=/ou até 10x de/").first();
    await expect(installmentText).toBeVisible();

    // 5. Botão de Sacola/Carrinho
    const cartButton = firstCard.locator("button[aria-label*='Adicionar']").first();
    await expect(cartButton).toBeVisible();

    // 6. Botão 'Ver detalhes'
    const detailsLink = firstCard.locator("a:has-text('Ver detalhes')").first();
    await expect(detailsLink).toBeVisible();
    await expect(detailsLink).toHaveAttribute("href", /\/armacoes\//);

    // 7. Botão 'WhatsApp'
    const whatsappLink = firstCard.locator("a:has-text('WhatsApp')").first();
    await expect(whatsappLink).toBeVisible();
    await expect(whatsappLink).toHaveAttribute("href", /wa\.me/);
  });
});
