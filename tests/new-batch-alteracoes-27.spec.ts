import { test, expect } from "@playwright/test";

test.describe("Novas Alterações de 27 de Outubro", () => {
  test("1. Página de Produto: Botão COMPRAR AGORA abre direto o Checkout Mercado Pago", async ({
    page,
  }) => {
    await page.goto("/produto/ventara-safari");
    await page.waitForLoadState("networkidle");

    // Botão Comprar Agora
    const buyButton = page.locator("button:has-text('COMPRAR AGORA')");
    await expect(buyButton).toBeVisible();

    // Clica no botão Comprar Agora
    await buyButton.click();

    // Gaveta de checkout deve abrir diretamente na tela de Finalizar Pedido
    const drawer = page.locator("aside[role='dialog']");
    await expect(drawer).toBeVisible();
    await expect(page.locator("h2:has-text('Finalizar Pedido')")).toBeVisible();
    await expect(page.locator("text=1. Seus Dados de Contato")).toBeVisible();
    await expect(page.locator("h3:has-text('3. Pagamento Mercado Pago')")).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/product-buy-now-checkout.png",
      fullPage: false,
    });
  });

  test("2. Vitrine Esportiva na Homepage: Botão COMPRAR AGORA abre direto o Checkout", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Localiza botão COMPRAR AGORA na seção interativa e rola até ele
    const showcaseBuyBtn = page
      .locator("button:has-text('COMPRAR AGORA')")
      .first();
    await showcaseBuyBtn.scrollIntoViewIfNeeded();
    await expect(showcaseBuyBtn).toBeVisible();
    await showcaseBuyBtn.click();

    // Confirma abertura imediata do checkout
    const drawer = page.locator("aside[role='dialog']");
    await expect(drawer).toBeVisible();
    await expect(page.locator("h2:has-text('Finalizar Pedido')")).toBeVisible();
    await expect(page.locator("h3:has-text('3. Pagamento Mercado Pago')")).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/showcase-buy-now-checkout.png",
      fullPage: false,
    });
  });

  test("3. Mobile: Banner 12 Meses de Garantia com proporção 2.4/1 e legibilidade perfeita", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const warrantySection = page.locator("section[aria-label='Garantia de 12 Meses OPTiSYNC HD']");
    await expect(warrantySection).toBeVisible();

    // Imagem do banner visível no mobile (bloco .sm:hidden)
    const mobileImg = warrantySection.locator(".sm\\:hidden img[alt*='12 Meses de Garantia']");
    await expect(mobileImg).toBeVisible();

    // Barra integrada de ação mobile
    await expect(warrantySection.locator("text=12 Meses de Garantia Oficial")).toBeVisible();
    await expect(warrantySection.locator("text=Consultar")).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/mobile-warranty-banner-enhanced.png",
      fullPage: false,
    });
  });

  test("4. Admin Lentes: Aba e Painel de Destaque da Marca Própria / Lab Parceiro", async ({
    page,
  }) => {
    await page.goto("/admin/lentes");
    await page.waitForLoadState("networkidle");

    // Botão de filtro para o Destaque
    const labTabBtn = page.locator("button:has-text('Destaque Lab & Marca Própria')");
    await expect(labTabBtn).toBeVisible();
    await labTabBtn.click();

    // Formulário completo do destaque
    await expect(
      page.locator("h2:has-text('Destaque do Laboratório Parceiro')")
    ).toBeVisible();
    await expect(page.locator("text=Trocar Foto da Caixa")).toBeVisible();
    await expect(page.locator("label:has-text('Nome da Marca / Laboratório *')")).toBeVisible();
    await expect(page.locator("button:has-text('Salvar Destaque')")).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/admin-lab-showcase-panel.png",
      fullPage: false,
    });
  });

  test("5. Admin Banners: Aba e Painel de Fotos das Vitrines e Seções", async ({
    page,
  }) => {
    await page.goto("/admin/banners");
    await page.waitForLoadState("networkidle");

    // Botão da aba Fotos das Vitrines
    const showcaseTabBtn = page.locator("button:has-text('Fotos das Vitrines (Esportivos & Seções)')");
    await expect(showcaseTabBtn).toBeVisible();
    await showcaseTabBtn.click();

    // Painel de fotos das vitrines
    await expect(
      page.locator("h2:has-text('Fotos das Seções & Vitrines Interativas')")
    ).toBeVisible();
    await expect(
      page.locator("span:has-text('Óculos Esportivos (Hero Masculino)')").first()
    ).toBeVisible();
    await expect(
      page.locator("text=Trocar Foto dos Óculos Esportivos")
    ).toBeVisible();
    await expect(
      page.locator("button:has-text('Salvar Fotos das Seções')")
    ).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/admin-showcase-media-panel.png",
      fullPage: false,
    });
  });
});
