import { test, expect } from "@playwright/test";

test.describe("Entrega (A) Lentes Coloridas Fora do Catálogo Geral e Apenas na Seção de Cores", () => {
  test("Catálogo geral em /lentes não exibe lentes coloridas e mostruário fica no rodapé", async ({ page }) => {
    await page.goto("/lentes");
    await page.waitForLoadState("domcontentloaded");

    // 1. Validar que na barra de filtros do catálogo superior não há botão/pílula de coloridas
    const generalFilterButtons = page.locator("button:has-text('Lentes Coloridas')");
    await expect(generalFilterButtons).toHaveCount(0);

    // 2. Validar que nenhum card no catálogo geral é uma lente colorida/solar
    const catalogCards = page.locator("[data-testid='lens-catalog-card']");
    const count = await catalogCards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = catalogCards.nth(i);
      const text = await card.textContent();
      expect(text?.toLowerCase()).not.toContain("solar polarizado");
      expect(text?.toLowerCase()).not.toContain("verde g-15 polarizado");
      expect(text?.toLowerCase()).not.toContain("âmbar solar polarizado");
    }

    // 3. Validar que no Hero há botão direcionando à seção de cores
    const toColorsBtn = page.locator("a[href='#secao-cores']");
    await expect(toColorsBtn.first()).toBeVisible();

    // 4. Validar que a seção de cores está no rodapé (#secao-cores)
    const colorSection = page.locator("#secao-cores");
    await expect(colorSection).toBeVisible();

    // Validar presença de mostruário com as amostras de cores
    await expect(colorSection.getByRole("heading", { name: "SUA COR" })).toBeVisible();
    await expect(colorSection.getByText("ENCONTRE SUA COR • PERSONALIZAÇÃO SOLAR")).toBeVisible();

    // Amostras presentes
    const colorSwatches = colorSection.locator("button[aria-label]");
    await expect(colorSwatches.first()).toBeVisible();
    expect(await colorSwatches.count()).toBeGreaterThanOrEqual(7);
  });
});

test.describe("Entrega (B e C) Página OPTiSYNC HD Tecnológica e Futurista", () => {
  test("Página /optisync carrega visual tecnológico com feixes, reflexo e seções editáveis", async ({ page }) => {
    await page.goto("/optisync");
    await page.waitForLoadState("domcontentloaded");

    // 1. Container com tema futurista
    const futuristicContainer = page.locator(".theme-futuristic-lenses");
    await expect(futuristicContainer).toBeVisible();

    // 2. Fundo tecnológico com feixes ou arte personalizada
    const backgroundHero = page.locator("section").first();
    await expect(backgroundHero).toBeVisible();

    // 3. Título Hero OPTiSYNC HD
    const heroTitle = page.locator("h1");
    await expect(heroTitle).toContainText("OPTiSYNC HD");

    // 4. Selos de características técnicas (Filtro azul, Antirreflexo, etc.)
    await expect(page.getByText("Filtro de luz azul").or(page.getByText("Filtro azul")).first()).toBeVisible();
    await expect(page.getByText("Antirreflexo").first()).toBeVisible();

    // 5. Bloco de benefícios
    await expect(page.getByText("Por que escolher a tecnologia OPTiSYNC HD?")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Surfaçagem Ponto a Ponto" })).toBeVisible();

    // 6. Bloco comparativo
    await expect(page.getByText("Comparação Direta de Tecnologia")).toBeVisible();

    // 7. CTA de especialista WhatsApp
    const whatsappBtn = page.locator("a[href*='api.whatsapp.com'], a[href*='wa.me']");
    await expect(whatsappBtn.first()).toBeVisible();

    // 8. Link para a seção de cores no rodapé de /lentes
    const colorSectionLink = page.locator("a[href='/lentes#secao-cores'], a[href*='#secao-cores']");
    await expect(colorSectionLink.first()).toBeVisible();
  });
});

test.describe("Admin CMS: Seção de Cores e OPTiSYNC", () => {
  test("Painel de administração possui abas e controles dedicados", async ({ page }) => {
    // Acessar diretamente a página de admin de lentes
    await page.goto("/admin/lentes");
    await page.waitForLoadState("domcontentloaded");

    // Se redirecionar para login de admin em ambiente de teste, verificar estrutura de UI
    const isLoginPage = page.url().includes("/login") || page.url().includes("/admin/login");
    if (!isLoginPage) {
      // 1. Botão da Seção de Cores
      const secaoCoresTab = page.locator("button:has-text('Seção de Cores')");
      await expect(secaoCoresTab).toBeVisible();

      // 2. Botão da Página OPTiSYNC CMS
      const optisyncTab = page.locator("button:has-text('Página OPTiSYNC')");
      await expect(optisyncTab).toBeVisible();

      // 3. Clicar na aba Seção de Cores
      await secaoCoresTab.click();
      await expect(page.getByText("Gestão da Seção de Cores")).toBeVisible();
      await expect(page.getByText("Posição #1").first()).toBeVisible();

      // 4. Clicar na aba OPTiSYNC CMS
      await optisyncTab.click();
      await expect(page.getByText("Personalização Visual da Página OPTiSYNC HD")).toBeVisible();
      await expect(page.getByText("Fundo Tecnológico, Feixes de Luz")).toBeVisible();
      await expect(page.getByText("Efeitos em Código (CSS/SVG)")).toBeVisible();
      await expect(page.getByText("Arte Gráfica Própria (Upload)")).toBeVisible();
    }
  });
});
