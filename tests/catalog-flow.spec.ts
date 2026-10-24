import { test, expect } from "@playwright/test";

test.describe("Ótica Ventara - Catálogo e Interações", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("deve carregar a página inicial com elementos essenciais da marca e HighlightedText no Hero", async ({ page }) => {
    await expect(page).toHaveTitle(/Ventara/i);
    const brandHeading = page.locator("h1");
    await expect(brandHeading).toContainText("Mais que óculos");
    await expect(brandHeading).toContainText("você.");
    const highlighted = page.locator(".hero-copy").getByText("você.");
    await expect(highlighted).toBeVisible();
    await page.waitForTimeout(700);
    await page.locator(".hero-copy").screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/hero-highlighted-text.png",
    });
  });

  test("deve permitir navegar pelo carrossel do pedestal no Hero (01 / 04)", async ({ page }) => {
    const heroPagination = page.locator(".hero-stage-pagination");
    await expect(heroPagination).toBeVisible();
    await expect(heroPagination).toContainText("01");

    // Clica no botão de próximo
    const nextBtn = page.getByRole("button", { name: /Próximo modelo/i });
    await nextBtn.click();
    await expect(heroPagination).toContainText("02");

    // Clica no botão de anterior
    const prevBtn = page.getByRole("button", { name: /Modelo anterior/i });
    await prevBtn.click();
    await expect(heroPagination).toContainText("01");
  });

  test("deve permitir filtrar produtos por categoria", async ({ page }) => {
    // Rola até o catálogo
    const catalog = page.locator("#armacoes");
    await catalog.scrollIntoViewIfNeeded();

    // Filtra por Grau
    const grauFilter = page.getByRole("button", { name: "Grau", exact: true });
    await grauFilter.click();
    await expect(grauFilter).toHaveClass(/active/);

    // Filtra por Solar
    const solarFilter = page.getByRole("button", { name: "Solar", exact: true });
    await solarFilter.click();
    await expect(solarFilter).toHaveClass(/active/);

    // Filtra por Infantil
    const infantilFilter = page.getByRole("button", { name: "Infantil", exact: true });
    await infantilFilter.click();
    await expect(infantilFilter).toHaveClass(/active/);
    await expect(page.getByText("Ventara Kids Flex")).toBeVisible();
  });

  test("deve adicionar item à seleção e exibir feedback visual", async ({ page }) => {
    const catalog = page.locator("#armacoes");
    await catalog.scrollIntoViewIfNeeded();

    // Encontra o primeiro botão de adicionar à seleção
    const addBtn = page.getByRole("button", { name: /Adicionar .* à seleção/i }).first();
    await addBtn.click();

    // Verifica que o toast de confirmação foi exibido
    const toast = page.locator(".toast-container");
    await expect(toast).toBeVisible();

    // Verifica o badge de contagem no cabeçalho
    const cartCount = page.locator(".count");
    await expect(cartCount).toHaveText("1");
  });

  test("deve expandir e recolher perguntas frequentes (FAQ)", async ({ page }) => {
    const faq = page.locator("#duvidas");
    await faq.scrollIntoViewIfNeeded();

    const faqButton = page.getByRole("button", { name: /Como funciona a escolha de armações/i });
    await expect(faqButton).toBeVisible();
    await expect(faqButton).toHaveAttribute("aria-expanded", "true");

    // Fecha a pergunta
    await faqButton.click();
    await expect(faqButton).toHaveAttribute("aria-expanded", "false");
  });

  test("deve acessar a página individual do produto com especificações técnicas", async ({ page }) => {
    await page.goto("/produto/ventara-aurora");
    await expect(page).toHaveTitle(/Ventara Aurora/i);
    await expect(page.locator("h1")).toContainText("Ventara Aurora");
    await expect(page.getByText("Acetato Premium").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Adicionar à seleção/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Consultar.*WhatsApp/i })).toBeVisible();
  });

  test("deve exibir vitrine com foto em bloco e degradê discreto na página de detalhes (/produto/ventara-onca)", async ({ page }) => {
    await page.goto("/produto/ventara-onca");
    await expect(page).toHaveTitle(/Ventara Onça/i);
    await expect(page.locator("h1")).toContainText("Ventara Onça");

    // Verifica a foto completando o bloco
    const mainImg = page.locator(".space-y-4 img[src*='product-images']").first();
    await expect(mainImg).toBeVisible();
    await expect(mainImg).toHaveClass(/object-cover/);

    // Verifica watermark e badges
    await expect(page.getByText(/ÓTICA VENTARA · ARAÇATUBA-SP/i).first()).toBeVisible();
    await expect(page.getByText(/Armação de Grau/i).first()).toBeVisible();

    // Captura screenshot
    const isMobile = page.viewportSize() ? page.viewportSize()!.width < 640 : false;
    await page.screenshot({
      path: isMobile
        ? "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/product-page-onca-mobile.png"
        : "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/product-page-onca.png",
      fullPage: false,
    });
  });

  test("deve interagir com a vitrine editorial (troca de categoria, gênero e miniaturas)", async ({ page }) => {
    const showcase = page.locator("#vitrine-interativa");
    await showcase.scrollIntoViewIfNeeded();
    await expect(showcase).toBeVisible();

    // Verifica headline inicial
    await expect(showcase.getByRole("heading", { level: 2 })).toContainText("Mais que óculos");

    // Alterna para Armações de Grau
    const grauBtn = showcase.getByRole("button", { name: /Armações de Grau/i });
    await grauBtn.click();
    await expect(showcase.getByText(/ARMAÇÕES DE GRAU/i).first()).toBeVisible();

    // Alterna para Coleção Feminina
    const femBtn = showcase.getByRole("button", { name: /Coleção Feminina/i });
    await femBtn.click();
    await expect(showcase.getByText(/COLEÇÃO ACETATO NOBRE/i)).toBeVisible();

    // Clica em uma miniatura de variação
    const thumbnail = showcase.getByRole("button", { name: /Tartaruga/i }).first();
    await thumbnail.click();

    // Adiciona à sacola a partir da vitrine
    const addShowcaseBtn = showcase.getByRole("button", { name: /Salvar na Sacola/i });
    await addShowcaseBtn.click();
    await expect(showcase.getByText(/Adicionado!/i)).toBeVisible();
  });

  test("deve navegar e alternar abas de valores na seção compacta de lentes", async ({ page }) => {
    const lensesSection = page.locator("#lentes");
    await lensesSection.scrollIntoViewIfNeeded();
    await expect(lensesSection).toBeVisible();

    // Verifica aba inicial Visão Simples com preço inicial
    await expect(lensesSection.getByText(/Visão Simples/i).first()).toBeVisible();
    await expect(lensesSection.getByText(/R\$ 99,90/i)).toBeVisible();

    // Alterna para Multifocais
    const multifocalBtn = lensesSection.getByRole("button", { name: /Multifocais/i });
    await multifocalBtn.click();
    await expect(lensesSection.getByText(/R\$ 389,00/i)).toBeVisible();

    // Alterna para Filtro Luz Azul
    const blueBtn = lensesSection.getByRole("button", { name: /Filtro Luz Azul/i });
    await blueBtn.click();
    await expect(lensesSection.getByText(/R\$ 149,90/i)).toBeVisible();
  });

  test("deve exibir destaque da marca de lentes OPTiSYNC HD e foto real do laboratório", async ({ page }) => {
    const lensesSection = page.locator("#lentes");
    await lensesSection.scrollIntoViewIfNeeded();
    await expect(lensesSection.getByText(/OPTiSYNC HD/i).first()).toBeVisible();
    await expect(lensesSection.getByText(/Filtro Azul & Antirreflexo/i).first()).toBeVisible();

    const aboutSection = page.locator("#sobre-nos");
    await aboutSection.scrollIntoViewIfNeeded();
    await expect(aboutSection.getByText(/Nosso Laboratório Próprio em Araçatuba-SP/i)).toBeVisible();
    await expect(aboutSection.getByText(/FOTO REAL DA LOJA FÍSICA/i)).toBeVisible();
  });

  test("deve manter o header fixo no topo com efeito glassmorphism ao rolar a página", async ({ page }) => {
    const header = page.locator("header.site-header");
    await expect(header).toBeVisible();

    // Rola para baixo 400px
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);

    // Header deve ter a classe scrolled e permanecer visível no topo
    await expect(header).toHaveClass(/scrolled/);
    await expect(header).toBeVisible();

    // Verifica que o estilo computado tem position sticky e fundo translúcido escuro
    const headerStyles = await header.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        position: cs.position,
        backgroundColor: cs.backgroundColor,
        hasBlurClass: el.classList.contains("scrolled"),
      };
    });
    expect(["fixed", "sticky"]).toContain(headerStyles.position);
    expect(headerStyles.backgroundColor).toContain("rgba(6, 17, 31");
    expect(headerStyles.hasBlurClass).toBe(true);

    const boundingBox = await header.boundingBox();
    expect(boundingBox?.y).toBe(0);
  });

  test("deve sincronizar o indicador de seção ativa do menu conforme a rolagem sem travar em Laboratório", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const nav = page.locator("nav[aria-label='Navegação principal']");

    // 1. No topo da página: Início deve estar ativo
    await page.evaluate(() => window.scrollTo(0, 50));
    await page.waitForTimeout(200);
    const inicioLink = nav.locator("a[href='#inicio']");
    await expect(inicioLink).toHaveClass(/text-white/);
    const labLink = nav.locator("a[href='#laboratorio']");
    await expect(labLink).toHaveClass(/text-slate-300/);

    // 1.5. Rolando pela Vitrine Interativa / Números (scrollY ~800px): Início deve continuar ativo e nunca Laboratório!
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(200);
    await expect(inicioLink).toHaveClass(/text-white/);
    await expect(labLink).toHaveClass(/text-slate-300/);

    // 2. Rolando até a seção de Armações: Armações deve ficar ativa e não Laboratório
    const armacoesSec = page.locator("#armacoes");
    await armacoesSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const armacoesLink = nav.locator("a[href='#armacoes']");
    await expect(armacoesLink).toHaveClass(/text-white/);
    await expect(labLink).toHaveClass(/text-slate-300/);

    // 3. Rolando até a seção de Lentes: Lentes deve ficar ativa
    const lentesSec = page.locator("#lentes");
    await lentesSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const lentesLink = nav.locator("a[href='#lentes']");
    await expect(lentesLink).toHaveClass(/text-white/);
    await expect(labLink).toHaveClass(/text-slate-300/);

    // 4. Rolando até o Laboratório: agora sim Laboratório deve ficar ativo
    const labSec = page.locator("#laboratorio");
    await labSec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await expect(labLink).toHaveClass(/text-white/);
  });

  test("deve carregar a página do Responsável Técnico com foto e credenciais de Gustavo Guimarães Cordeiro (/responsavel-tecnico)", async ({ page }) => {
    await page.goto("/responsavel-tecnico");
    await page.waitForLoadState("domcontentloaded");
    await expect(page).toHaveTitle(/Gustavo Guimarães Cordeiro/i);
    await expect(page.locator("h1")).toContainText("Gustavo Guimarães");
    await expect(page.getByText("Técnico Óptico Formado").first()).toBeVisible();
    await expect(page.getByRole("img", { name: /Gustavo Guimarães Cordeiro/i })).toBeVisible();
    await expect(page.getByText("Montagem na Facetadora & Lensometria")).toBeVisible();
  });

  test("deve consultar e exibir o rastreamento de pedido com etapas de laboratório e facetadora (/rastreio e /api/orders/track)", async ({ page, request }) => {
    // 1. Testa a API de rastreio direto
    const apiRes = await request.get("/api/orders/track?code=VEN-10294");
    expect(apiRes.status()).toBe(200);
    const apiJson = await apiRes.json();
    expect(apiJson.success).toBe(true);
    expect(apiJson.order.reference_code).toBe("VEN-10294");
    expect(apiJson.order.status_label).toContain("Montagem no Laboratório");

    // 2. Testa a página interativa de rastreamento
    await page.goto("/rastreio");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toContainText("Acompanhe a Produção e Entrega");
    await page.fill("input[placeholder*='código']", "VEN-10294");
    await page.click("button:has-text('Rastrear')");
    await expect(page.getByText("VEN-10294").first()).toBeVisible();
    await expect(page.getByText("Corte na Facetadora Computadorizada")).toBeVisible();
    await expect(page.getByText("Gustavo Guimarães Cordeiro")).toBeVisible();
  });

  test("deve exibir vitrine com cards de foto em bloco, degradê inferior e carrossel de logos parceiras", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    // 1. Verifica os cards de produto em bloco
    const catalogSection = page.locator("#armacoes");
    await catalogSection.scrollIntoViewIfNeeded();
    await expect(catalogSection.getByText("Ventara Essencial")).toBeVisible();

    const productCard = catalogSection.locator("article.product").first();
    await expect(productCard).toBeVisible();

    // 2. Verifica a seção de lentes com o LogosCarousel de marcas homologadas
    const lensesSection = page.locator("#lentes");
    await lensesSection.scrollIntoViewIfNeeded();
    await expect(lensesSection.getByText(/PARCEIROS TECNOLÓGICOS/i)).toBeVisible();
    await expect(lensesSection.locator("img[alt*='OPTiSYNC']").first()).toBeVisible();
  });
});
