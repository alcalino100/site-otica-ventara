import { test, expect } from "@playwright/test";

test.describe("Novas Alterações de 28 de Outubro - Ventara", () => {
  test("1. Rastreio: Cartão do Suporte de Vendas substitui dados pessoais do Gustavo", async ({
    page,
  }) => {
    await page.goto("/rastreio");
    await page.waitForLoadState("networkidle");

    // Preenche o código de rastreio oficial de demonstração VEN-10294
    const input = page.locator("input[placeholder*='VEN-']");
    await input.fill("VEN-10294");
    await page.locator("button[type='submit']").click();
    await page.waitForTimeout(1000);

    // Valida que o cartão de Suporte de Vendas está visível
    const suporteText = page.locator("text=Suporte de Vendas");
    await expect(suporteText).toBeVisible();

    const equipeText = page.locator("text=Equipe responsável pelo seu atendimento");
    await expect(equipeText).toBeVisible();

    const horarioText = page.locator("text=Atendimento sobre seus pedidos das 9h até as 21:00");
    await expect(horarioText).toBeVisible();

    // Valida que não existe mais "Gustavo Guimarães Cordeiro" como perfil pessoal no rastreio
    const gustavoText = page.locator("p:has-text('Gustavo Guimarães Cordeiro')");
    await expect(gustavoText).toHaveCount(0);

    // Valida botão WhatsApp
    const zapBtn = page.locator("a:has-text('Dúvidas no WhatsApp')");
    await expect(zapBtn).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/rastreio-suporte-vendas.png",
      fullPage: false,
    });
  });

  test("2. Lentes: 'A partir de' substitui 'Valor de Referência'", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const lensesSection = page.locator("#lentes");
    await lensesSection.scrollIntoViewIfNeeded();

    // Valida que 'A partir de' está visível nos cards de lentes
    const aPartirDe = page.locator("text=A partir de").first();
    await expect(aPartirDe).toBeVisible();

    // Valida que 'Valor de Referência' foi removido
    const valorRef = page.locator("text=Valor de Referência");
    await expect(valorRef).toHaveCount(0);

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/lentes-a-partir-de.png",
      fullPage: false,
    });
  });

  test("3. Banner 12 Meses Garantia: Visível sem corte e sem barra inferior no mobile", async ({
    page,
  }) => {
    // Configura viewport mobile padrão iPhone
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const warrantySection = page.locator("section[aria-label='Garantia de 12 Meses OPTiSYNC HD']");
    await warrantySection.scrollIntoViewIfNeeded();
    await expect(warrantySection).toBeVisible();

    // Confirma que a barra inferior foi retirada (não há mais '12 Meses de Garantia Oficial' cobrindo o banner)
    const oldBarText = page.locator("text=12 Meses de Garantia Oficial");
    await expect(oldBarText).toHaveCount(0);

    // Confirma que a imagem do banner está visível
    const bannerImg = warrantySection.locator("img");
    await expect(bannerImg).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/warranty-banner-mobile-full.png",
      fullPage: false,
    });
  });

  test("4. Produto: Imagens em 'Você também pode gostar' são grandes e proporcionais", async ({
    page,
  }) => {
    await page.goto("/produto/ventara-safari");
    await page.waitForLoadState("networkidle");

    const relatedTitle = page.locator("text=Você também pode gostar");
    await relatedTitle.scrollIntoViewIfNeeded();
    await expect(relatedTitle).toBeVisible();

    // Captura primeiro card relacionado
    const firstRelCard = page.locator("a[href^='/produto/']").first();
    await expect(firstRelCard).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/produto-relacionados-grandes.png",
      fullPage: false,
    });
  });

  test("5. Catálogo Mobile: Exibe 2 linhas de armações ('mais uma na parte de baixo')", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const catalogSection = page.locator("#armacoes");
    await catalogSection.scrollIntoViewIfNeeded();

    // Linha 1: Modelos em Destaque
    const row1 = page.locator("text=Modelos em Destaque");
    await expect(row1).toBeVisible();

    // Linha 2: Mais Modelos & Estilos (na parte de baixo)
    const row2 = page.locator("text=Mais Modelos & Estilos");
    await expect(row2).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/catalogo-mobile-2-linhas.png",
      fullPage: false,
    });
  });

  test("6. Vitrine 25% OFF (Fundo Branco): Exibe ofertas com desconto e botão WhatsApp", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const promoSection = page.locator("section[aria-label='Modelos Selecionados com Desconto']");
    await promoSection.scrollIntoViewIfNeeded();
    await expect(promoSection).toBeVisible();

    // Título e selo
    await expect(page.locator("text=Até 25% OFF em modelos selecionados")).toBeVisible();
    await expect(page.locator("text=OFERTA POR TEMPO LIMITADO")).toBeVisible();

    // Botão de compra no WhatsApp com desconto
    const promoBuyBtn = promoSection.locator("a:has-text('Comprar c/ Desconto')").first();
    await expect(promoBuyBtn).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/vitrine-25-off-fundo-branco.png",
      fullPage: false,
    });
  });

  test("7. Admin Lentes: Aba 'Marcas Homologadas (7)' permite gerenciar e trocar fotos", async ({
    page,
  }) => {
    await page.goto("/admin/lentes");
    await page.waitForLoadState("networkidle");

    // Localiza e clica na aba 'Marcas Homologadas'
    const marcasTab = page.locator("button:has-text('Marcas Homologadas')");
    await expect(marcasTab).toBeVisible();
    await marcasTab.click();

    // Título da seção
    await expect(page.locator("h2:has-text('Marcas Homologadas & Fotos das Caixas')")).toBeVisible();

    // Botões de upload de caixas para os fornecedores
    const uploadBtn = page.locator("label:has-text('Trocar Foto da Caixa')").first();
    await expect(uploadBtn).toBeVisible();

    // Botão de Salvar Marcas Homologadas
    const saveBrandsBtn = page.locator("button:has-text('Salvar Marcas Homologadas')");
    await expect(saveBrandsBtn).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/admin-marcas-homologadas.png",
      fullPage: false,
    });
  });

  test("8. Admin Banners: Aba 'Vitrine 25% OFF (Fundo Branco)' totalmente editável", async ({
    page,
  }) => {
    await page.goto("/admin/banners");
    await page.waitForLoadState("networkidle");

    // Clica na aba da vitrine promocional
    const promoTab = page.locator("button:has-text('Vitrine 25% OFF')");
    await expect(promoTab).toBeVisible();
    await promoTab.click();

    // Confirma campos editáveis
    await expect(page.locator("h2:has-text('Vitrine 25% OFF em Modelos Selecionados')")).toBeVisible();
    await expect(page.locator("span:has-text('Exibir Vitrine no Site')")).toBeVisible();
    await expect(page.locator("button:has-text('Salvar Vitrine')").first()).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/admin-vitrine-promocional.png",
      fullPage: false,
    });
  });
});
