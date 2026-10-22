import { test, expect } from "@playwright/test";

test.describe("Óticas Ventara - Novas Alterações e Responsividade Mobile", () => {
  test("deve validar a ordem física das seções na página inicial", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // 1. Vitrine Interativa "Mais que óculos, é sobre você"
    const showcase = page.locator("#vitrine-interativa");
    await expect(showcase).toBeVisible();

    // 2. Catálogo "Escolhas que combinam com você"
    const catalog = page.locator("#armacoes");
    await expect(catalog).toBeVisible();
    await expect(catalog.getByText(/Escolhas que combinam com você/i)).toBeVisible();

    // 3. Laboratório e Sobre Nós
    const about = page.locator("#sobre-nos");
    await expect(about).toBeVisible();
    const lab = page.locator("#laboratorio");
    await expect(lab).toBeVisible();

    // 4. Loja Física com Foto Real da Fachada
    const store = page.locator("#loja-fisica");
    await expect(store).toBeVisible();
    const facadeImg = store.locator("img[src*='fachada-otica-ventara.jpg']");
    await expect(facadeImg).toBeVisible();

    // 5. Seção de Lentes
    const lenses = page.locator("#lentes");
    await expect(lenses).toBeVisible();

    // Verifica que a ordem das posições verticais (top) é rigorosamente a solicitada
    const showcaseBox = await showcase.boundingBox();
    const catalogBox = await catalog.boundingBox();
    const aboutBox = await about.boundingBox();
    const storeBox = await store.boundingBox();
    const lensesBox = await lenses.boundingBox();

    expect(showcaseBox!.y).toBeLessThan(catalogBox!.y);
    expect(catalogBox!.y).toBeLessThan(aboutBox!.y);
    expect(aboutBox!.y).toBeLessThan(storeBox!.y);
    expect(storeBox!.y).toBeLessThan(lensesBox!.y);
  });

  test("deve exibir dados oficiais da loja (Telefone fixo 18 3304-2808 e Google Meu Negócio)", async ({ page }) => {
    await page.goto("/");

    // Loja física
    const store = page.locator("#loja-fisica");
    await store.scrollIntoViewIfNeeded();

    // Telefone fixo (18) 3304-2808
    await expect(store.getByText("(18) 3304-2808")).toBeVisible();
    await expect(store.locator("a[href='tel:+551833042808']")).toBeVisible();

    // Link do Google Meu Negócio
    const mapsLink = store.locator("a[href='https://maps.app.goo.gl/sXFBJrNTxQcBhwTh9?g_st=iw']");
    await expect(mapsLink).toBeVisible();

    // Rodapé
    const footer = page.locator("footer");
    await expect(footer.getByText("(18) 3304-2808")).toBeVisible();
    await expect(footer.locator("a[href='https://maps.app.goo.gl/sXFBJrNTxQcBhwTh9?g_st=iw']")).toBeVisible();
  });

  test("deve exibir botão flutuante do WhatsApp acessível na tela", async ({ page }) => {
    await page.goto("/");

    const waFloating = page.locator("aside[aria-label='Atendimento pelo WhatsApp']");
    await expect(waFloating).toBeVisible();

    const waLink = waFloating.locator("a[href*='wa.me/5518996155748']");
    await expect(waLink).toBeVisible();

    // Deve permanecer visível após scroll
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(200);
    await expect(waFloating).toBeVisible();
  });

  test("deve exibir página separada de Medição de DNP por Foto com transparência", async ({ page }) => {
    await page.goto("/medicao-por-foto");
    await expect(page).toHaveTitle(/Medição de DNP por Foto/i);

    // Headline e Badges
    await expect(page.locator("h1")).toContainText("DNP por Foto");
    await expect(page.getByText(/Em Estruturação com Parceiro Internacional/i)).toBeVisible();

    // Distinção Clara: Medição de DNP vs NÃO medição de Grau
    await expect(page.getByText(/O que é medido: DNP e Altura/i)).toBeVisible();
    await expect(page.getByText(/O que NÃO é medido: Grau \(Dioptria\)/i)).toBeVisible();
    await expect(page.getByText(/A prescrição médica de grau é privativa do médico oftalmologista/i)).toBeVisible();

    // Botão de retorno e catálogo
    await expect(page.getByRole("link", { name: /Voltar ao Início/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Enviar Receita no WhatsApp/i })).toBeVisible();
  });

  test("deve exibir apresentação aprimorada de lentes com logos das marcas e símbolo", async ({ page }) => {
    await page.goto("/");
    const lensesSection = page.locator("#lentes");
    await lensesSection.scrollIntoViewIfNeeded();

    // Símbolo de lentes ópticas (SVG exclusivo sem fundo rosa)
    const lensGraphic = lensesSection.locator("svg[viewBox='0 0 320 240']");
    await expect(lensGraphic).toBeVisible();

    // Abas de categorias
    await expect(lensesSection.getByRole("button", { name: /Visão Simples/i })).toBeVisible();
    await expect(lensesSection.getByRole("button", { name: /Multifocais/i })).toBeVisible();
    await expect(lensesSection.getByRole("button", { name: /Filtro Luz Azul & Especiais/i })).toBeVisible();
    await expect(lensesSection.getByRole("button", { name: /Todas as Marcas Homologadas/i })).toBeVisible();

    // Aba de todas as marcas com logos oficiais enviados pelo cliente
    const marcasBtn = lensesSection.getByRole("button", { name: /Todas as Marcas Homologadas/i });
    await marcasBtn.click();

    await expect(lensesSection.getByRole("heading", { name: "Lentes Correct" })).toBeVisible();
    await expect(lensesSection.getByRole("heading", { name: "Orgaline+" })).toBeVisible();
    await expect(lensesSection.getByRole("heading", { name: "HOYA / Maxxee" })).toBeVisible();
    await expect(lensesSection.getByRole("heading", { name: "Kodak Lens" })).toBeVisible();
    await expect(lensesSection.getByRole("heading", { name: "Varilux (Essilor)" })).toBeVisible();
    await expect(lensesSection.getByRole("heading", { name: "OPTiSYNC HD", exact: true })).toBeVisible();

    // Imagens dos logos renderizadas
    await expect(lensesSection.locator("img[src*='correct.jpg']")).toBeVisible();
    await expect(lensesSection.locator("img[src*='orgaline.jpg']")).toBeVisible();
    await expect(lensesSection.locator("img[src*='hoya.jpg']")).toBeVisible();
    await expect(lensesSection.locator("img[src*='kodak.jpg']")).toBeVisible();
    await expect(lensesSection.locator("img[src*='varilux.jpg']")).toBeVisible();
  });

  test("deve ser responsivo no mobile (viewport 375x667) sem transbordamento horizontal", async ({ page }) => {
    // Configura viewport de smartphone (iPhone SE / padrão 375px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // Verifica que não há overflow horizontal no body
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowInnerWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(windowInnerWidth + 1);

    // Menu hambúrguer mobile visível
    const menuToggle = page.locator("button.menu-toggle");
    await expect(menuToggle).toBeVisible();

    const rect = await menuToggle.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
    });
    console.log("menuToggle rect:", rect);

    // Abre o menu mobile (com force: true ou tap para touch mobile)
    await menuToggle.click({ force: true });
    const mobileNav = page.locator("nav.mobile-nav-panel");
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: /Armações/i })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: /Medição de DNP por Foto/i })).toBeVisible();

    // Fecha o menu
    await menuToggle.click({ force: true });
    await expect(mobileNav).not.toBeVisible();

    // Botão flutuante do WhatsApp deve estar visível e clicável no mobile
    const waFloating = page.locator("aside[aria-label='Atendimento pelo WhatsApp']");
    await expect(waFloating).toBeVisible();
  });
});
