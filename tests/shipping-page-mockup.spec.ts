import { test, expect } from "@playwright/test";

test.describe("Refatoração da Página de Entregas (/entregas) conforme Mockup Mobile", () => {
  test.beforeEach(async ({ page }) => {
    // Permite bypass de middleware para rotas administrativas em testes
    await page.context().addCookies([
      {
        name: "pw_test_session",
        value: "1",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Evita interferência de banners de consentimento de cookies
    await page.addInitScript(() => {
      localStorage.setItem(
        "ventara_cookie_consent",
        JSON.stringify({ essential: true, analytics: true, marketing: true })
      );
    });
  });

  test("1. Página /entregas renderiza com novo Hero claro, destaque Ventara e curva amarela", async ({
    page,
  }) => {
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    // 1.1 Título da aba
    await expect(page).toHaveTitle(/Rede de Entregas Ventara/i);

    // 1.2 Hero com estilo claro
    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();
    await expect(heroSection).toContainText("ESTRUTURA LOGÍSTICA & RASTREAMENTO");
    await expect(heroSection).toContainText("Rede de Entregas");
    await expect(heroSection).toContainText("Ventara");
    await expect(heroSection).toContainText("Da nossa ótica em Araçatuba para todo o Brasil");

    // 1.3 Botões CTA do Hero
    const trackingCta = page.getByRole("link", { name: /Rastrear seu pedido/i }).first();
    await expect(trackingCta).toBeVisible();
    await expect(trackingCta).toHaveAttribute("href", "/rastreio");

    const citiesCta = page.getByRole("link", { name: /Ver cidades atendidas/i }).first();
    await expect(citiesCta).toBeVisible();
    await expect(citiesCta).toHaveAttribute("href", "#bloco-regional");

    // 1.4 Foto dos óculos na bancada
    const glassesImg = page.locator("img[alt*='Armação Ventara Eyewear sobre bancada']");
    await expect(glassesImg).toBeVisible();
  });

  test("2. Renderização dos 3 Cards de Destaque translúcidos abaixo do Hero", async ({
    page,
  }) => {
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("Araçatuba e Região").first()).toBeVisible();
    await expect(page.getByText("Entrega rápida com van própria").first()).toBeVisible();

    await expect(page.getByText("Envio para todo o Brasil").first()).toBeVisible();
    await expect(page.getByText("Correios e transporte aéreo").first()).toBeVisible();

    await expect(page.getByText("Rastreio Ponto a Ponto").first()).toBeVisible();
    await expect(page.getByText("Atualizações em tempo real").first()).toBeVisible();
  });

  test("3. Bloco 'Entrega Expressa em Araçatuba e Região' exibe chips dinâmicos com bolinha amarela", async ({
    page,
  }) => {
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    const regionalBlock = page.locator("#bloco-regional");
    await expect(regionalBlock).toBeVisible();

    // Selo azul
    await expect(regionalBlock).toContainText("LOGÍSTICA PRÓPRIA REGIONAL");

    // Título em duas partes (branco + amarelo)
    await expect(regionalBlock).toContainText("Entrega Expressa em");
    await expect(regionalBlock).toContainText("Araçatuba e Região");

    // Subtítulo das cidades
    await expect(regionalBlock).toContainText("CIDADES ATENDIDAS COM ROTA LOCAL");

    // Chips de cidades com correspondência exata
    await expect(regionalBlock.getByText("Araçatuba", { exact: true })).toBeVisible();
    await expect(regionalBlock.getByText("Birigui", { exact: true })).toBeVisible();
    await expect(regionalBlock.getByText("Bilac", { exact: true })).toBeVisible();
    await expect(regionalBlock.getByText("Gabriel Monteiro", { exact: true })).toBeVisible();
    await expect(regionalBlock.getByText("Coroados e Guararapes", { exact: true })).toBeVisible();
  });

  test("4. Card 'Prazo Estimado' é exibido com chevron e consulta de prazo", async ({
    page,
  }) => {
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    const timeframeCard = page.getByRole("link", { name: /Prazo Estimado/i });
    await expect(timeframeCard).toBeVisible();
    await expect(timeframeCard).toContainText("Consulte o prazo no checkout");
  });

  test("5. Seção 'Enviamos para todo o Brasil' possui os 3 cartões e aviso de rastreamento", async ({
    page,
  }) => {
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /Enviamos para todo o Brasil/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Correios (Sedex e PAC)" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Transportadoras Rodoviárias" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Envio Aéreo para Destinos Distantes" })).toBeVisible();
    await expect(page.getByText(/Rastreamento Seguro Ponto a Ponto/i)).toBeVisible();
  });

  test("6. Responsividade sem quebra ou scroll horizontal em 320px, 360px, 390px, 430px, 768px e 1440px", async ({
    page,
  }) => {
    const viewports = [
      { width: 320, height: 568, name: "320px (iPhone SE small)" },
      { width: 360, height: 640, name: "360px (Android)" },
      { width: 390, height: 844, name: "390px (iPhone 14)" },
      { width: 430, height: 932, name: "430px (iPhone Pro Max)" },
      { width: 768, height: 1024, name: "768px (iPad)" },
      { width: 1440, height: 900, name: "1440px (Desktop)" },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/entregas", { waitUntil: "domcontentloaded" });

      // Garante que não há scroll horizontal no documento
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth, `Viewport ${vp.name} não deve ter overflow horizontal`).toBeLessThanOrEqual(
        clientWidth + 2
      );

      // Elementos essenciais visíveis
      await expect(page.getByText("Rede de Entregas").first()).toBeVisible();
      await expect(page.locator("#bloco-regional")).toBeVisible();

      // Salva captura de tela com a nova estética Off-White
      await page.screenshot({
        path: `/Users/user/.gemini/antigravity/brain/3307d6a6-ee9f-47b4-bbf9-e090e670f231/screenshots/entregas-offwhite-${vp.width}px.png`,
        fullPage: false,
      });
    }
  });

  test("7. Painel Admin /admin/entrega possui aba Regional como prioridade com Live Preview e CRUD de cidades", async ({
    page,
  }) => {
    await page.goto("/admin/entrega", { waitUntil: "domcontentloaded" });

    // Verifica aba regional ativa
    await expect(page.getByRole("button", { name: /Entrega Regional \(Araçatuba\)/i })).toBeVisible();
    await expect(page.getByText(/Configuração da Entrega Expressa Regional/i)).toBeVisible();

    // Verifica pré-visualização ao vivo
    await expect(page.getByText(/Pré-visualização ao vivo do Bloco Regional/i)).toBeVisible();

    // Verifica campo de adicionar cidade
    const cityInput = page.getByPlaceholder(/Nome da cidade/i);
    await expect(cityInput).toBeVisible();
    const addCityBtn = page.getByRole("button", { name: /Adicionar/i });
    await expect(addCityBtn).toBeVisible();

    // Testa adicionar uma cidade temporária
    await cityInput.fill("Cidade Teste E2E");
    await addCityBtn.click();
    await expect(page.locator("input[value='Cidade Teste E2E']")).toBeVisible();
  });
});
