import { test, expect } from "@playwright/test";

test.describe("CMS Dinâmico da Página /entregas", () => {
  test.beforeEach(async ({ page }) => {
    // Cookie de sessão para Playwright test runner
    await page.context().addCookies([
      {
        name: "pw_test_session",
        value: "1",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.addInitScript(() => {
      localStorage.setItem(
        "ventara_cookie_consent",
        JSON.stringify({ essential: true, analytics: true, marketing: true })
      );
    });
  });

  test("1. Painel Admin (/admin/entrega) carrega acordeões na mesma ordem visual e barra fixa de ações", async ({
    page,
  }) => {
    await page.goto("/admin/entrega", { waitUntil: "domcontentloaded" });

    // Barra de Ações Superior
    await expect(page.getByRole("heading", { name: "CMS /entregas" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Salvar Rascunho" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Publicar" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pré-visualizar" })).toBeVisible();

    // Editor de Tema & Tokens
    await expect(page.getByText("1. Identidade Visual & Design Tokens")).toBeVisible();
    await expect(page.getByRole("button", { name: /Off-white Ventara/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Escuro Ventara/i })).toBeVisible();
    await expect(page.getByText(/Auditoria WCAG 2.1/i)).toBeVisible();

    // Seções de Conteúdo (Acordeões com testid por tipo de seção)
    await expect(page.getByText("2. Seções de Conteúdo")).toBeVisible();
    await expect(page.getByTestId("cms-accordion-hero")).toBeVisible();
    await expect(page.getByTestId("cms-accordion-highlight_cards")).toBeVisible();
    await expect(page.getByTestId("cms-accordion-regional_delivery")).toBeVisible();
    await expect(page.getByTestId("cms-accordion-estimated_timeframe")).toBeVisible();
    await expect(page.getByTestId("cms-accordion-national_delivery")).toBeVisible();
    await expect(page.getByTestId("cms-accordion-carriers_grid")).toBeVisible();
    await expect(page.getByTestId("cms-accordion-how_it_works")).toBeVisible();
    await expect(page.getByTestId("cms-accordion-faq")).toBeVisible();
    await expect(page.getByTestId("cms-accordion-whatsapp_cta")).toBeVisible();
  });

  test("2. Auditoria WCAG 2.1 exibe status de contraste do texto principal em tempo real", async ({
    page,
  }) => {
    await page.goto("/admin/entrega", { waitUntil: "domcontentloaded" });

    // O medidor de contraste deve estar visível e aprovado no tema padrão off-white
    const meter = page.getByText(/Auditoria WCAG 2.1 em Tempo Real/i);
    await expect(meter).toBeVisible();

    // Contraste do texto principal (#06111F sobre #FAF8F4) é > 17:1 (AAA)
    await expect(page.getByText(/AAA \(/i)).toBeVisible();
    await expect(page.getByText(/Contraste acessível/i)).toBeVisible();
  });

  test("3. Cada cartão de envio nacional possui suporte completo a fotos no admin", async ({
    page,
  }) => {
    await page.goto("/admin/entrega", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Expande o acordeão de Envio Seguro para Todo o Brasil
    const nationalSection = page.getByTestId("cms-accordion-national_delivery");
    await nationalSection.scrollIntoViewIfNeeded();
    await nationalSection.getByRole("button", { name: /Expandir seção/i }).click();

    // Verifica abas dos cartões nacionais
    await expect(page.getByRole("button", { name: /Correios/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /Transportadoras Rodoviárias/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Envio Aéreo/i })).toBeVisible();

    // Seleciona o cartão aéreo
    await page.getByRole("button", { name: /Envio Aéreo/i }).click();

    // Verifica campos de mídia no cartão
    await expect(page.getByText(/Foto do Cartão \(Envio Aéreo/i)).toBeVisible();
  });

  test("4. Página pública (/entregas) renderiza dinamicamente com tokens e sem erros visuais", async ({
    page,
  }) => {
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    // Root possui data-theme
    const root = page.locator("[data-theme='light']");
    await expect(root).toBeVisible();

    // Seção Hero
    await expect(page.getByRole("heading", { name: /Rede de Entregas/i })).toBeVisible();

    // Seção Regional
    await expect(page.getByText("LOGÍSTICA PRÓPRIA REGIONAL")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Araçatuba e Região", exact: true })
    ).toBeVisible();

    // Seção Nacional com os 3 cartões
    await expect(page.getByTestId("national-card-nat-card-correios")).toBeVisible();
    await expect(page.getByTestId("national-card-nat-card-transportadoras")).toBeVisible();
    await expect(page.getByTestId("national-card-nat-card-aereo")).toBeVisible();
  });

  test("5. Rota de pré-visualização (?preview=draft) exibe tarja flutuante para administradores", async ({
    page,
  }) => {
    await page.goto("/entregas?preview=draft", { waitUntil: "domcontentloaded" });

    const previewBanner = page.locator("[role='status'][aria-label*='Pré-visualização']");
    await expect(previewBanner).toBeVisible();
    await expect(previewBanner).toContainText("MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO");
    await expect(previewBanner.getByRole("link", { name: "Voltar ao CMS" })).toBeVisible();
  });

  test("6. Responsividade mobile (390px) sem overflow horizontal no admin e na página pública", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    // Testa página pública
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });
    let scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    let clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    // Testa página admin
    await page.goto("/admin/entrega", { waitUntil: "domcontentloaded" });
    scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});
