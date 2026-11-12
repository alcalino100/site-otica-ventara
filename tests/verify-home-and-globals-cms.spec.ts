import { test, expect } from "@playwright/test";
import { getPageDefaultValues, SITE_PAGES_REGISTRY } from "../lib/content/registry";

test.describe("Integração de Conteúdo Dinâmico da Home e Elementos Globais (CMS Fase 4 - Grupo 1)", () => {
  const BYPASS_TOKEN =
    process.env.PLAYWRIGHT_BYPASS_TOKEN || "ventara-playwright-local-bypass-token";

  test.beforeEach(async ({ context, page }) => {
    await page.setExtraHTTPHeaders({
      "x-playwright-bypass-token": BYPASS_TOKEN,
    });
    await context.addCookies([
      {
        name: "pw_bypass_token",
        value: BYPASS_TOKEN,
        domain: "localhost",
        path: "/",
      },
      {
        name: "ventara_admin_user",
        value: "admin@oticasventara.com.br",
        domain: "localhost",
        path: "/",
      },
      {
        name: "ventara_cookie_consent",
        value: "accepted",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  // ========================================================================
  // 1. TESTES UNITÁRIOS DE REGISTRO E DEFAULTS (RESILIÊNCIA TOTAL)
  // ========================================================================
  test("1. Registro de conteúdo cobre as 11 seções da Home e todos os elementos globais", () => {
    // 1.1 Home Registry
    const homeDef = SITE_PAGES_REGISTRY["home"];
    expect(homeDef).toBeDefined();
    expect(homeDef.sections.length).toBe(11);

    const homeDefaults = getPageDefaultValues("home");
    expect(homeDefaults.heroBadge).toBe("CURADORIA EXCLUSIVA · ÓTICAS VENTARA");
    expect(homeDefaults.heroTitle).toBe("Mais que óculos, é sobre você.");
    expect(homeDefaults.warrantyBannerDesktop).toContain("optisync");
    expect(homeDefaults.showcaseEyebrow).toBe("VITRINE EDITORIAL INTERATIVA");
    expect(homeDefaults.catalogEyebrow).toBe("SELEÇÃO EDITORIAL VENTARA");
    expect(homeDefaults.offersTitle).toBe("Até 57% OFF em modelos selecionados");
    expect(homeDefaults.whyTitle).toBe("Óticas Ventara?");
    expect(homeDefaults.storeTitle).toBe("Venha conhecer a Óticas Ventara Eyewear.");
    expect(homeDefaults.lensesTitle).toBe("CATÁLOGO DE LENTES DE GRAU");
    expect(homeDefaults.coloredTitle).toBe("SUA COR");
    expect(homeDefaults.whatsappTitle).toBe("Seu próximo olhar começa aqui.");
    expect(homeDefaults.faqTitle).toBe("Vamos olhar mais de perto?");

    // 1.2 Global Elements
    const globalHeaderDefaults = getPageDefaultValues("globalHeader");
    expect(globalHeaderDefaults.bagTooltip).toBe("Minha Sacola");
    expect(globalHeaderDefaults.contactBtnText).toBe("Falar no WhatsApp");

    const globalAnnouncementDefaults = getPageDefaultValues("globalAnnouncement");
    expect(globalAnnouncementDefaults.enabled).toBe(true);
    expect(globalAnnouncementDefaults.text).toContain("Frete Grátis");

    const globalFooterDefaults = getPageDefaultValues("globalFooter");
    expect(globalFooterDefaults.cnpj).toBe("CNPJ 00.000.000/0001-00 (Ótica Ventara Ltda)");
    expect(globalFooterDefaults.hours).toContain("08h30");
  });

  // ========================================================================
  // 2. ENDPOINT PÚBLICO COM SUPORTE A DRAFT
  // ========================================================================
  test("2. Endpoint /api/content/home responde com conteúdo publicado e draft", async ({
    request,
  }) => {
    const pubRes = await request.fetch("/api/content/home");
    expect(pubRes.status()).toBe(200);
    const pubData = await pubRes.json();
    expect(pubData.page).toBe("home");
    expect(pubData.status).toBe("published");
    expect(pubData.values).toBeDefined();
    expect(pubData.values.heroTitle).toBeDefined();

    const draftRes = await request.fetch("/api/content/home?preview=draft");
    expect(draftRes.status()).toBe(200);
    const draftData = await draftRes.json();
    expect(draftData.status).toBe("draft");
    expect(draftData.values).toBeDefined();
  });

  // ========================================================================
  // 3. PÁGINA PÚBLICA (HOME): BARRA DE ANÚNCIO, CABEÇALHO, SEÇÕES E RODAPÉ
  // ========================================================================
  test("3. Renderização completa da Home pública com barra de anúncio e seções", async ({
    page,
  }) => {
    await page.goto("/");

    // 3.1 Barra de anúncio superior
    const announcement = page.getByRole("region", { name: "Aviso Promocional" });
    await expect(announcement).toBeVisible();
    await expect(announcement).toContainText("Frete Grátis");

    // 3.2 Header com tooltip e botão WhatsApp
    const bagBtn = page.getByTitle("Minha Sacola");
    await expect(bagBtn).toBeVisible();

    // 3.3 Seções Principais
    await expect(page.locator("h1")).toBeVisible(); // Hero Title
    await expect(page.locator("#armacoes")).toBeVisible(); // Catálogo
    await expect(page.locator("#loja-fisica")).toBeVisible(); // Loja Física
    await expect(page.locator("#lentes")).toBeVisible(); // Lentes
    await expect(page.locator("#duvidas")).toBeVisible(); // FAQ

    // 3.4 Rodapé Corporativo
    await expect(page.locator("footer").getByText(/CNPJ/i)).toBeVisible();
  });

  // ========================================================================
  // 4. MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO (DRAFT PREVIEW)
  // ========================================================================
  test("4. Exibição do banner de alerta em /?preview=draft", async ({ page }) => {
    await page.goto("/?preview=draft");

    const draftBanner = page.getByText("MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO (DRAFT)");
    await expect(draftBanner).toBeVisible();

    const returnLink = page.getByRole("link", { name: /Voltar ao Editor/i });
    await expect(returnLink).toBeVisible();
    await expect(returnLink).toHaveAttribute("href", "/admin/conteudo/home");
  });

  // ========================================================================
  // 5. EDITOR ADMINISTRATIVO: /admin/conteudo/home
  // ========================================================================
  test("5. Acesso ao editor da Home no painel administrativo e navegação por seções", async ({
    page,
  }) => {
    await page.goto("/admin/conteudo/home");

    // TopBar do editor
    await expect(page.getByRole("heading", { name: /Página Inicial/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Pré-visualizar/i })).toBeVisible();

    // Seções Sanfonadas da Home
    await expect(page.getByRole("heading", { name: "1. Hero Principal Cinematográfico" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "4. Catálogo Editorial de Armações" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "7. Nosso Espaço Físico em Araçatuba" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "11. Dúvidas Frequentes (FAQ)" })).toBeVisible();
  });

  // ========================================================================
  // 6. EDITOR ADMINISTRATIVO: Elementos Globais
  // ========================================================================
  test("6. Acesso aos editores globais /admin/conteudo/globalHeader e globalAnnouncement", async ({
    page,
  }) => {
    await page.goto("/admin/conteudo/globalHeader");
    await expect(page.getByRole("heading", { name: /Cabeçalho Global/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "1. Textos e Ações do Cabeçalho" })).toBeVisible();

    await page.goto("/admin/conteudo/globalAnnouncement");
    await expect(page.getByRole("heading", { name: /Barra de Anúncio Superior/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "1. Configuração do Anúncio" })).toBeVisible();
  });
});
