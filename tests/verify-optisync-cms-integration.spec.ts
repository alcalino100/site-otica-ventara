import { test, expect } from "@playwright/test";
import { getPageDefaultValues, SITE_PAGES_REGISTRY } from "../lib/content/registry";

test.describe("Fase 2: Integração Completa da Página /optisync ao Motor de Conteúdo Dinâmico", () => {
  const BYPASS_TOKEN =
    process.env.PLAYWRIGHT_BYPASS_TOKEN || "ventara-playwright-local-bypass-token";

  test.beforeEach(async ({ context }) => {
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

  test("1. Mapeamento de Conteúdo: defaults cobrem todas as 10 seções da /optisync com precisão", () => {
    const pageDef = SITE_PAGES_REGISTRY.optisync;
    expect(pageDef).toBeDefined();
    expect(pageDef.sections.length).toBe(10);

    const sectionIds = pageDef.sections.map((s) => s.id);
    expect(sectionIds).toEqual([
      "hero",
      "hdLine",
      "photochromicLine",
      "kidsLine",
      "benefits",
      "comparison",
      "labHighlight",
      "colors",
      "faq",
      "cta",
    ]);

    const defaults = getPageDefaultValues("optisync");
    // 1. Hero
    expect(defaults.heroBadge).toBe("ENGENHARIA ÓPTICA DIGITAL");
    expect(defaults.heroTitle).toBe("Lentes Digitais");
    expect(defaults.heroTitleHighlight).toBe("OPTiSYNC HD");
    expect(defaults.heroStatusSurfacagem).toBe("Surfaçagem Digital 3D");
    expect(defaults.heroStatusGarantia).toBe("Garantia 12 Meses");

    // 2. Linha HD
    expect(defaults.hdBadge).toBe("LINHA ADULTO & USO DIGITAL");
    expect(defaults.hdTitle).toBe("Lentes Digitais");
    expect(defaults.hdCard1Tag).toBe("Produto Oficial");
    expect(defaults.hdCard2Tag).toBe("Gamer & Telas");

    // 3. Linha Fotossensível
    expect(defaults.photochromicBadge).toBe("TECNOLOGIA FOTOSSENSÍVEL ADULTO");
    expect(defaults.simulatorEyebrow).toBe("Simulador Dinâmico");
    expect(defaults.simulatorTitle).toBe("Transição Óptica Inteligente");
    expect(defaults.indoorLabel).toBe("Ambiente Interno");
    expect(defaults.outdoorLabel).toBe("Sol Pleno");

    // 4. Linha Kids
    expect(defaults.kidsBadge).toBe("LINHA INFANTIL & JUVENIL");
    expect(defaults.kidsTitleHighlight).toBe("Kids Adventure");
    expect(defaults.kidsLogoTag).toBe("Linha Oficial");

    // 5. Benefícios
    expect(defaults.benefitsEyebrow).toBe("DIFERENCIAIS CONSTRUTIVOS");

    // 6. Comparação
    expect(defaults.comparisonEyebrow).toBe("COMPARAÇÃO TÉCNICA");
    expect(defaults.comparisonTitle).toBe("Comparação Direta de Tecnologia");
    expect(defaults.comparisonMobileSwipe).toBe("← Deslize para comparar →");

    // 7. Laboratório
    expect(defaults.labBadge).toBe("LABORATÓRIO ÓPTICO PRÓPRIO EM ARAÇATUBA");
    expect(defaults.labOrigemValue).toBe("Araçatuba · SP");

    // 8. Cores
    expect(defaults.colorsEyebrow).toBe("MOSTRUÁRIO EXCLUSIVO");

    // 9. FAQ
    expect(defaults.faqEyebrow).toBe("TIRA-DÚVIDAS");

    // 10. CTA Final
    expect(defaults.ctaBadge).toBe("SUPORTE ESPECIALIZADO");
  });

  test("2. Renderização pública da /optisync exibe todas as 10 seções e botão flutuante de edição", async ({
    page,
  }) => {
    await page.goto("/optisync");
    await expect(page).toHaveURL(/\/optisync/);

    // 1. Hero
    await expect(page.getByText("ENGENHARIA ÓPTICA DIGITAL").first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Lentes Digitais");
    await expect(page.getByText("Surfaçagem Digital 3D").first()).toBeVisible();
    await expect(page.getByText("Garantia 12 Meses").first()).toBeVisible();

    // 2. Linha HD
    await expect(page.getByText("LINHA ADULTO & USO DIGITAL")).toBeVisible();
    await expect(page.getByText("Precisão Ponto a Ponto")).toBeVisible();
    await expect(page.getByText("Blue Shield Integrado")).toBeVisible();

    // 3. Linha Fotossensível & Simulador
    await expect(page.getByText("TECNOLOGIA FOTOSSENSÍVEL ADULTO")).toBeVisible();
    await expect(page.getByText("Transição Óptica Inteligente")).toBeVisible();
    await expect(page.getByText("3 Fases de Luminosidade")).toBeVisible();

    // 4. Linha Kids
    await expect(page.getByText("LINHA INFANTIL & JUVENIL")).toBeVisible();
    await expect(page.getByText("Kids Adventure 3D").first()).toBeVisible();

    // 5. Benefícios
    await expect(page.getByText("DIFERENCIAIS CONSTRUTIVOS", { exact: true })).toBeVisible();

    // 6. Comparação
    await expect(page.getByText("COMPARAÇÃO TÉCNICA")).toBeVisible();
    await expect(page.getByText("Comparação Direta de Tecnologia")).toBeVisible();

    // 7. Laboratório
    await expect(page.getByText("LABORATÓRIO ÓPTICO PRÓPRIO EM ARAÇATUBA")).toBeVisible();
    await expect(page.getByText("Corte Computadorizado").first()).toBeVisible();

    // 8. Cores
    await expect(page.getByText("MOSTRUÁRIO EXCLUSIVO", { exact: true })).toBeVisible();
    await expect(page.getByText("Paleta de Tonalidades Solares").first()).toBeVisible();

    // 9. FAQ
    await expect(page.getByText("TIRA-DÚVIDAS")).toBeVisible();
    await expect(page.getByText("Perguntas Frequentes sobre a OPTiSYNC HD")).toBeVisible();

    // 10. CTA Final
    await expect(page.getByText("SUPORTE ESPECIALIZADO")).toBeVisible();

    // Botão flutuante de edição rápida para administradores
    await expect(page.locator('a[href="/admin/conteudo/optisync"]')).toBeVisible();
  });

  test("3. Modo de visualização de rascunho (?preview=draft) exibe banner informativo", async ({
    page,
  }) => {
    await page.goto("/optisync?preview=draft");
    await expect(page).toHaveURL(/\/optisync\?preview=draft/);

    // Banner de pré-visualização de rascunho visível no topo
    const previewBanner = page.locator("text=MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO (DRAFT)");
    await expect(previewBanner).toBeVisible();
    await expect(page.getByText("Voltar ao Editor")).toBeVisible();
  });

  test("4. Acesso ao editor unificado /admin/conteudo/optisync exibe os 10 acordeões", async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({
      "x-playwright-bypass-token": BYPASS_TOKEN,
    });

    await page.goto("/admin/conteudo/optisync");
    await expect(page).toHaveURL(/\/admin\/conteudo\/optisync/);

    // Cabeçalho da página
    await expect(page.locator("h1")).toContainText("Lentes Digitais OPTiSYNC HD");
    await expect(page.getByRole("button", { name: "Salvar Rascunho" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Publicar no Ar" })).toBeVisible();

    // Verifica que os acordeões das 10 seções estão presentes
    await expect(page.getByText("1. Hero Principal")).toBeVisible();
    await expect(page.getByText("2. Linha OPTiSYNC HD (Adulto & Telas)")).toBeVisible();
    await expect(page.getByText("3. Linha Fotossensível & Simulador")).toBeVisible();
    await expect(page.getByText("4. Linha OPTiSYNC Kids Adventure (Infantil)")).toBeVisible();
    await expect(page.getByText("5. Benefícios & Diferenciais Construtivos")).toBeVisible();
    await expect(page.getByText("6. Tabela Comparativa de Tecnologia")).toBeVisible();
    await expect(page.getByText("7. Laboratório Próprio em Araçatuba")).toBeVisible();
    await expect(page.getByText("8. Mostruário de Cores & Tonalidades Solares")).toBeVisible();
    await expect(page.getByText("9. Perguntas Frequentes (FAQ)")).toBeVisible();
    await expect(page.getByText("10. Chamada Final & Atendimento WhatsApp")).toBeVisible();
  });

  test("5. API pública /api/content/optisync entrega dados resilientes de todas as 10 seções", async ({
    request,
  }) => {
    const res = await request.get("/api/content/optisync");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.page).toBe("optisync");
    expect(data.title).toBe("Lentes Digitais OPTiSYNC HD");
    expect(data.values).toBeDefined();

    // Valida que campos chave de cada uma das seções estão preenchidos na resposta da API
    expect(data.values.heroBadge).toBe("ENGENHARIA ÓPTICA DIGITAL");
    expect(data.values.hdBadge).toBe("LINHA ADULTO & USO DIGITAL");
    expect(data.values.photochromicBadge).toBe("TECNOLOGIA FOTOSSENSÍVEL ADULTO");
    expect(data.values.kidsBadge).toBe("LINHA INFANTIL & JUVENIL");
    expect(data.values.benefitsEyebrow).toBe("DIFERENCIAIS CONSTRUTIVOS");
    expect(data.values.comparisonEyebrow).toBe("COMPARAÇÃO TÉCNICA");
    expect(data.values.labBadge).toBe("LABORATÓRIO ÓPTICO PRÓPRIO EM ARAÇATUBA");
    expect(data.values.colorsEyebrow).toBe("MOSTRUÁRIO EXCLUSIVO");
    expect(data.values.faqEyebrow).toBe("TIRA-DÚVIDAS");
    expect(data.values.ctaBadge).toBe("SUPORTE ESPECIALIZADO");
  });
});
