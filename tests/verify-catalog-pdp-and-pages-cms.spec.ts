import { test, expect } from "@playwright/test";
import { getPageDefaultValues, SITE_PAGES_REGISTRY } from "../lib/content/registry";

test.describe("Integração de Conteúdo Dinâmico do Catálogo, PDP e Páginas Institucionais (CMS Fase 4 - Grupo 2)", () => {
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
  test("1. Registro de conteúdo cobre as páginas do catálogo, PDP e páginas institucionais com defaults resilientes", () => {
    // 1.1 Armações
    const armacoesDef = SITE_PAGES_REGISTRY["armacoes"];
    expect(armacoesDef).toBeDefined();
    const armacoesDefaults = getPageDefaultValues("armacoes");
    expect(armacoesDefaults.catalogTitle).toBe("Armações de Grau & Solares");
    expect(armacoesDefaults.helpBadge).toBe("Dúvidas no aro? Meça com nossa equipe no WhatsApp");

    // 1.2 PDP Template
    const pdpDef = SITE_PAGES_REGISTRY["produtoTemplate"];
    expect(pdpDef).toBeDefined();
    const pdpDefaults = getPageDefaultValues("produtoTemplate");
    expect(pdpDefaults.badgeShipping).toContain("Frete Grátis");
    expect(pdpDefaults.badgeWarranty).toContain("Garantia de 1 ano");
    expect(pdpDefaults.badgeExchange).toContain("Primeira troca grátis");

    // 1.3 Lentes (/lentes)
    const lentesDef = SITE_PAGES_REGISTRY["lentes"];
    expect(lentesDef).toBeDefined();
    const lentesDefaults = getPageDefaultValues("lentes");
    expect(lentesDefaults.lensesTitle).toBe("Lentes de Grau & Tratamentos Digitais");

    // 1.4 Lentes Coloridas (/lentes-coloridas)
    const coloredDef = SITE_PAGES_REGISTRY["lentesColoridas"];
    expect(coloredDef).toBeDefined();
    const coloredDefaults = getPageDefaultValues("lentesColoridas");
    expect(coloredDefaults.title).toContain("Lentes");

    // 1.5 Medição por Foto (/medicao-por-foto)
    const medicaoDef = SITE_PAGES_REGISTRY["medicaoPorFoto"];
    expect(medicaoDef).toBeDefined();
    const medicaoDefaults = getPageDefaultValues("medicaoPorFoto");
    expect(medicaoDefaults.title).toContain("DNP");

    // 1.6 Rastreio (/rastreio / rastrear-pedido)
    const rastreioDef = SITE_PAGES_REGISTRY["rastrearPedido"];
    expect(rastreioDef).toBeDefined();
    const rastreioDefaults = getPageDefaultValues("rastrearPedido");
    expect(rastreioDefaults.title).toContain("Rastreie");

    // 1.7 Responsável Técnico (/responsavel-tecnico)
    const respTecDef = SITE_PAGES_REGISTRY["responsavelTecnico"];
    expect(respTecDef).toBeDefined();
    const respTecDefaults = getPageDefaultValues("responsavelTecnico");
    expect(respTecDefaults.techName).toContain("Gustavo Guimarães Cordeiro");

    // 1.8 Políticas e Termos (/termos-de-uso)
    const politicasDef = SITE_PAGES_REGISTRY["politicas"];
    expect(politicasDef).toBeDefined();
    const politicasDefaults = getPageDefaultValues("politicas");
    expect(politicasDefaults.termsTitle).toContain("Termos e Condições");
  });

  // ========================================================================
  // 2. TESTES DE NAVEGAÇÃO E PREVIEW DE RASCUNHO NAS PÁGINAS DO GRUPO 2
  // ========================================================================
  test("2. /armacoes renderiza banner de rascunho em ?preview=draft e botão flutuante", async ({ page }) => {
    await page.goto("/armacoes?preview=draft");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO (DRAFT)")).toBeVisible();
    await expect(page.locator('[data-testid="floating-cms-button"]')).toBeVisible();
  });

  test("3. /produto/[slug] renderiza banner de rascunho em ?preview=draft e benefícios dinâmicos", async ({ page }) => {
    await page.goto("/produto/ventara-lisa?preview=draft");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO (DRAFT)")).toBeVisible();
    await expect(page.locator('[data-testid="floating-cms-button"]')).toBeVisible();
  });

  test("4. /lentes renderiza banner de rascunho em ?preview=draft e catálogo de lentes", async ({ page }) => {
    await page.goto("/lentes?preview=draft");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO (DRAFT)")).toBeVisible();
    await expect(page.locator('[data-testid="floating-cms-button"]')).toBeVisible();
  });

  test("5. /lentes-coloridas renderiza banner de rascunho em ?preview=draft", async ({ page }) => {
    await page.goto("/lentes-coloridas?preview=draft");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO (DRAFT)")).toBeVisible();
    await expect(page.locator('[data-testid="floating-cms-button"]')).toBeVisible();
  });

  test("6. /medicao-por-foto renderiza banner de rascunho em ?preview=draft", async ({ page }) => {
    await page.goto("/medicao-por-foto?preview=draft");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO (DRAFT)")).toBeVisible();
    await expect(page.locator('[data-testid="floating-cms-button"]')).toBeVisible();
  });

  test("7. /rastreio renderiza banner de rascunho em ?preview=draft", async ({ page }) => {
    await page.goto("/rastreio?preview=draft");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO (DRAFT)")).toBeVisible();
    await expect(page.locator('[data-testid="floating-cms-button"]')).toBeVisible();
  });

  test("8. /responsavel-tecnico renderiza banner de rascunho em ?preview=draft", async ({ page }) => {
    await page.goto("/responsavel-tecnico?preview=draft");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO (DRAFT)")).toBeVisible();
    await expect(page.locator('[data-testid="floating-cms-button"]')).toBeVisible();
  });

  test("9. /termos-de-uso renderiza banner de rascunho em ?preview=draft", async ({ page }) => {
    await page.goto("/termos-de-uso?preview=draft");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("text=MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO (DRAFT)")).toBeVisible();
    await expect(page.locator('[data-testid="floating-cms-button"]')).toBeVisible();
  });

  // ========================================================================
  // 3. TESTE DE EDIÇÃO NO ADMIN PARA UMA PÁGINA DO GRUPO 2
  // ========================================================================
  test("10. Admin carrega o editor CMS para página do catálogo (/admin/conteudo/armacoes)", async ({ page }) => {
    await page.goto("/admin/conteudo/armacoes");
    await expect(page.locator("h1")).toContainText("Catálogo de Armações");
    await expect(page.locator("input#catalogTitle")).toBeVisible();
  });
});
