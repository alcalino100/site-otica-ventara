import { test, expect } from "@playwright/test";

test.describe("Página de Entregas (/entregas) e Formas de Pagamento no Rodapé", () => {
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

  test("1. Página /entregas carrega com sucesso, SEO e estrutura completa de 7 seções", async ({
    page,
  }) => {
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    // 1.1 Título da página no documento
    await expect(page).toHaveTitle(/Rede de Entregas Ventara/i);

    // 1.2 Hero com título e subtítulo
    const heroTitle = page.getByRole("heading", { level: 1 });
    await expect(heroTitle).toContainText("Rede de Entregas");
    await expect(
      page.getByText(/Da nossa ótica em Araçatuba para todo o Brasil/i).first()
    ).toBeVisible();

    // 1.3 Botão CTA do Hero aponta para /rastreio
    const trackingCta = page.getByRole("link", { name: /Rastrear seu pedido/i }).first();
    await expect(trackingCta).toBeVisible();
    await expect(trackingCta).toHaveAttribute("href", "/rastreio");

    // 1.4 Seção Araçatuba e Região
    await expect(
      page.getByRole("heading", { name: /Entrega Expressa em/i })
    ).toBeVisible();
    await expect(page.getByText("Birigui").first()).toBeVisible();
    await expect(page.getByText("Bilac").first()).toBeVisible();
    // Imagem da van azul no bloco regional
    const vanImg = page.locator("#bloco-regional img[alt*='Van']").first();
    await expect(vanImg).toBeVisible();

    // 1.5 Seção Envio para Todo o Brasil
    await expect(
      page.getByRole("heading", { name: /Enviamos para todo o Brasil|Envio Seguro para Todo o Brasil/i })
    ).toBeVisible();
    await expect(
      page.getByText(/Código de Rastreamento Ponto a Ponto|Rastreamento Seguro Ponto a Ponto/i).first()
    ).toBeVisible();

    // 1.6 Seção Transportadoras que Utilizamos
    await expect(
      page.getByRole("heading", { name: /Transportadoras que utilizamos/i })
    ).toBeVisible();
    await expect(page.getByText("Azul Cargo Express")).toBeVisible();
    await expect(page.getByText("Gollog")).toBeVisible();
    await expect(page.getByText("Sedex e PAC (Correios)")).toBeVisible();

    // 1.7 Linha do Tempo Técnica (6 etapas)
    await expect(
      page.getByRole("heading", { name: /Como funciona nosso fluxo de entrega/i })
    ).toBeVisible();
    await expect(page.getByText("Pedido Confirmado").first()).toBeVisible();
    await expect(page.getByText("Montagem no Laboratório Próprio").first()).toBeVisible();
    await expect(page.getByText("Controle de Qualidade").first()).toBeVisible();
    await expect(page.getByText(/Embalagem (Segura|Protetora)/i).first()).toBeVisible();
    await expect(page.getByText(/Postagem/i).first()).toBeVisible();
    await expect(page.getByText(/Entrega no seu Endereço|Chegada Segura/i).first()).toBeVisible();

    // 1.8 Acordeão de FAQ Acessível
    await expect(
      page.getByRole("heading", { name: /Perguntas Frequentes sobre Entregas/i })
    ).toBeVisible();
    const firstFaqBtn = page.getByRole("button", {
      name: /Como acompanho o rastreamento do meu pedido\?/i,
    });
    await expect(firstFaqBtn).toBeVisible();
    // Primeiro item abre por padrão ou no clique
    await firstFaqBtn.click();
    await expect(
      page.getByText(/código de rastreamento por WhatsApp e e-mail/i).first()
    ).toBeVisible();

    // 1.9 CTA Final do WhatsApp
    await expect(
      page.getByText(/Ficou com alguma dúvida sobre a entrega\?/i)
    ).toBeVisible();
    const whatsappBtn = page.getByRole("button", { name: /Falar com Atendente/i });
    await expect(whatsappBtn).toBeVisible();
  });

  test("2. Menu do Header e Rodapé contêm links funcionais para /entregas", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // 2.1 Link Entregas no menu do Header (Desktop vs Mobile)
    const viewport = page.viewportSize();
    const isMobile = Boolean(viewport && viewport.width < 768);

    if (!isMobile) {
      const headerNavLink = page.locator("header nav.hidden.md\\:flex a[href='/entregas']");
      await expect(headerNavLink).toBeVisible();
      await expect(headerNavLink).toHaveText("Entregas");
    } else {
      const mobileToggle = page.getByRole("button", { name: /Abrir menu de navegação/i });
      if (await mobileToggle.isVisible()) {
        await mobileToggle.click();
        const mobileNavLink = page.locator(".mobile-nav-panel a[href='/entregas']");
        await expect(mobileNavLink).toBeVisible();
        await expect(mobileNavLink).toHaveText("Entregas");
      }
    }

    // 2.2 Link Rede de Entregas no Rodapé
    const footerLink = page.locator("footer a[href='/entregas']");
    await expect(footerLink).toBeVisible();
    await expect(footerLink).toHaveText(/Rede de Entregas/i);

    // 2.3 Clique no link do rodapé navega para /entregas
    await footerLink.scrollIntoViewIfNeeded();
    await Promise.all([
      page.waitForURL(/\/entregas/, { timeout: 10000 }),
      footerLink.click(),
    ]);
    await expect(page).toHaveURL(/\/entregas/);
  });

  test("3. Formas de Pagamento e Selo Mercado Pago são exibidos no rodapé", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // 3.1 Bloco Formas de Pagamento
    const paymentBlock = page.locator("[data-testid='footer-payment-methods']");
    await expect(paymentBlock).toBeVisible();

    // 3.2 Título do bloco
    await expect(paymentBlock.getByText(/Formas de Pagamento/i)).toBeVisible();

    // 3.3 Bandeiras ativas (Visa, Mastercard, Elo, Amex, Hipercard, Pix)
    await expect(page.locator("[data-testid='payment-badge-visa']")).toBeVisible();
    await expect(page.locator("[data-testid='payment-badge-mastercard']")).toBeVisible();
    await expect(page.locator("[data-testid='payment-badge-elo']")).toBeVisible();
    await expect(page.locator("[data-testid='payment-badge-amex']")).toBeVisible();
    await expect(page.locator("[data-testid='payment-badge-hipercard']")).toBeVisible();
    await expect(page.locator("[data-testid='payment-badge-pix']")).toBeVisible();

    // 3.4 Selo Compra Segura com Mercado Pago
    const secureBadge = page.locator("[data-testid='footer-secure-badge']");
    await expect(secureBadge).toBeVisible();
    await expect(secureBadge).toContainText(/Mercado Pago/i);
  });

  test("4. Responsividade Mobile: /entregas renderiza sem quebras em 390px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    // Verifica que o hero e o título estão legíveis
    const heroTitle = page.getByRole("heading", { level: 1 });
    await expect(heroTitle).toBeVisible();

    // Verifica que não há scroll horizontal no documento
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // tolerância máxima de 2px para subpixels

    // Menu mobile contém o link de entregas
    const mobileMenuBtn = page.getByRole("button", { name: /Abrir menu de navegação/i });
    if (await mobileMenuBtn.isVisible()) {
      await mobileMenuBtn.click();
      const mobileEntregasLink = page.locator(".mobile-nav-panel a[href='/entregas']");
      await expect(mobileEntregasLink).toBeVisible();
    }
  });

  test("5. Painel Admin /admin/entrega permite gerenciar abas de logística", async ({
    page,
  }) => {
    await page.goto("/admin/entrega", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Abas visíveis
    await expect(page.locator("[data-testid='tab-regional']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-hero']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-carriers']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-faqs']")).toBeVisible();
    await expect(page.locator("[data-testid='tab-checkout']")).toBeVisible();

    // Alterna para aba de transportadoras
    await page.locator("[data-testid='tab-carriers']").click();
    await expect(page.getByRole("heading", { name: /Transportadoras que Utilizamos/i })).toBeVisible();

    // Alterna para aba de FAQ
    await page.locator("[data-testid='tab-faqs']").click();
    await expect(page.getByRole("heading", { name: /Perguntas Frequentes sobre Entregas/i })).toBeVisible();

    // Alterna para aba de Retirada & Frete
    await page.locator("[data-testid='tab-checkout']").click();
    await expect(page.getByRole("heading", { name: /Retirada Física no Balcão/i })).toBeVisible();
  });
});
