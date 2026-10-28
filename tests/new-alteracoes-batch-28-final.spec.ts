import { test, expect } from "@playwright/test";

test.describe("Novas Alterações Ventara - Lote 28 Outubro (Final)", () => {
  test("1. Hero: Botão 'Catálogo de Lentes' amarelo e 'Ver armações'", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const lentesBtn = page.locator("#inicio a:has-text('Catálogo de Lentes')");
    await expect(lentesBtn).toBeVisible();

    const armacoesBtn = page.locator("#inicio a:has-text('Ver armações')");
    await expect(armacoesBtn).toBeVisible();

    // Clicar no botão 'Catálogo de Lentes' leva para a página /lentes
    await lentesBtn.click();
    await page.waitForURL("**/lentes");
    expect(page.url()).toContain("/lentes");

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/hero-botoes-lentes.png",
      fullPage: false,
    });
  });

  test("2. Vitrine Promocional: 2 botões por card (Comprar e Dúvidas no WhatsApp amarelo)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const promoSection = page.locator("section[aria-label='Modelos Selecionados com Desconto']");
    await expect(promoSection).toBeVisible();
    await promoSection.scrollIntoViewIfNeeded();

    const comprarBtn = promoSection.locator("a:has-text('Comprar')").first();
    await expect(comprarBtn).toBeVisible();
    const href = await comprarBtn.getAttribute("href");
    expect(href).toContain("/produto/");

    const zapBtn = promoSection.locator("a:has-text('Dúvidas no WhatsApp')").first();
    await expect(zapBtn).toBeVisible();
    const zapHref = await zapBtn.getAttribute("href");
    expect(zapHref).toContain("wa.me");

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/vitrine-dois-botoes.png",
      fullPage: false,
    });
  });

  test("3. Admin Banners: Aba 'Banner Principal (Header Fixo)' com degradê e opções", async ({
    page,
  }) => {
    await page.goto("/admin/banners");
    await page.waitForLoadState("networkidle");

    const heroTab = page.locator("button:has-text('Banner Principal (Header Fixo)')");
    await expect(heroTab).toBeVisible();
    await heroTab.click();

    await expect(page.locator("h2:has-text('Banner Fixo & Degradê do Header')")).toBeVisible();
    await expect(page.locator("text=Prévia em Tempo Real (Visual do Header)")).toBeVisible();
    await expect(page.locator("button:has-text('Banner Fixo com Degradê')")).toBeVisible();
    await expect(page.locator("text=Opções de Degradê (Filtro e Transição)")).toBeVisible();
    await expect(page.locator("button:has-text('Salvar Banner do Header')")).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/admin-hero-banner-tab.png",
      fullPage: false,
    });
  });

  test("4. Nova Página /lentes: Banner Catálogo de Lentes Oftálmicas e 2 colunas mobile", async ({
    page,
  }) => {
    // Teste no viewport mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/lentes");
    await page.waitForLoadState("networkidle");

    // Valida o título do banner principal
    await expect(page.locator("h1:has-text('LENTES OFTÁLMICAS')")).toBeVisible();

    // Valida a presença da fita de parceiros
    await expect(page.locator("text=PARCEIROS TECNOLÓGICOS")).toBeVisible();

    // Valida que os cards estão na grade de 2 colunas
    const cardsGrid = page.locator("div.grid.grid-cols-2");
    await expect(cardsGrid.first()).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/pagina-lentes-mobile-2col.png",
      fullPage: false,
    });
  });
});
