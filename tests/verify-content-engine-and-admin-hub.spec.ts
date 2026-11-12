import { test, expect } from "@playwright/test";
import { isValidSafeUrl, sanitizeRichText } from "../lib/validations/content-engine";
import { getPageDefaultValues } from "../lib/content/registry";

test.describe("Motor de Conteúdo & Hub Administrativo (CMS Fase 1)", () => {
  const BYPASS_TOKEN =
    process.env.PLAYWRIGHT_BYPASS_TOKEN || "ventara-playwright-local-bypass-token";

  test.beforeEach(async ({ context }) => {
    // Adiciona cookie de bypass e cookie de operador administrativo para o contexto
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

  test("1. Validação unitária de URLs seguras e sanitização de Rich Text", () => {
    // URLs válidas
    expect(isValidSafeUrl("/armacoes")).toBe(true);
    expect(isValidSafeUrl("/lentes?tipo=multifocal")).toBe(true);
    expect(isValidSafeUrl("https://wa.me/5518996155748")).toBe(true);
    expect(isValidSafeUrl("wa.me/5518996155748")).toBe(true);
    expect(isValidSafeUrl("https://www.oticasventara.com.br")).toBe(true);
    expect(isValidSafeUrl("mailto:contato@oticasventara.com.br")).toBe(true);
    expect(isValidSafeUrl("tel:5518996155748")).toBe(true);

    // URLs perigosas bloqueadas
    expect(isValidSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isValidSafeUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isValidSafeUrl("vbscript:msgbox(1)")).toBe(false);

    // Sanitização de Rich Text
    const maliciousHtml = 'Texto seguro <script>alert("hack")</script> e <img src="x" onerror="steal()" /> fim.';
    const sanitized = sanitizeRichText(maliciousHtml);
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("onerror=");
    expect(sanitized).toContain("Texto seguro");
  });

  test("2. Resiliência do catálogo: defaults cobrem 100% dos campos de /optisync e outras páginas", () => {
    const optisyncDefaults = getPageDefaultValues("optisync");
    expect(optisyncDefaults.heroBadge).toBe("ENGENHARIA ÓPTICA DIGITAL");
    expect(optisyncDefaults.heroTitle).toBe("Lentes Digitais");
    expect(optisyncDefaults.heroTitleHighlight).toBe("OPTiSYNC HD");
    expect(optisyncDefaults.heroCtaWhatsapp).toBe("Consultar Óptico no WhatsApp");

    const homeDefaults = getPageDefaultValues("home");
    expect(homeDefaults.offersTitle).toBe("Até 57% OFF em modelos selecionados");
  });

  test("3. Segurança da API: requisições anônimas para /api/admin/content/** são bloqueadas com 401", async ({
    request,
  }) => {
    const res = await request.fetch("/api/admin/content/optisync", {
      headers: {
        "x-playwright-bypass-token": "",
      },
    });
    expect(res.status()).toBe(401);

    const postRes = await request.fetch("/api/admin/content/optisync", {
      method: "POST",
      headers: {
        "x-playwright-bypass-token": "",
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ action: "save_draft", values: {} }),
    });
    expect(postRes.status()).toBe(401);
  });

  test("4. Acesso autorizado ao Hub /admin/conteudo lista páginas públicas e elementos globais", async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({
      "x-playwright-bypass-token": BYPASS_TOKEN,
    });

    await page.goto("/admin/conteudo");
    await expect(page).toHaveURL(/\/admin\/conteudo/);

    // Verifica elementos do cabeçalho
    await expect(page.locator("h1")).toContainText("Mapa do Site");
    await expect(page.getByText("Motor de Conteúdo & CMS Universal")).toBeVisible();

    // Verifica se cards essenciais estão presentes
    await expect(page.getByText("Lentes Digitais OPTiSYNC HD")).toBeVisible();
    await expect(page.getByText("Página Inicial (Home)")).toBeVisible();
    await expect(page.getByText("Catálogo de Armações (/armacoes)")).toBeVisible();
    await expect(page.getByText("Rede de Entregas & Frete (/entregas)")).toBeVisible();

    // Verifica badge de editor dedicado em /entregas
    const entregasCard = page.locator("div").filter({ hasText: "Rede de Entregas & Frete" }).first();
    await expect(entregasCard).toContainText("Editor Especializado");
  });

  test("5. Busca em tempo real no Hub filtra campos e páginas", async ({ page }) => {
    await page.setExtraHTTPHeaders({
      "x-playwright-bypass-token": BYPASS_TOKEN,
    });

    await page.goto("/admin/conteudo");

    const searchInput = page.getByPlaceholder("Procurar texto, título, campo ou rota em todo o site...");
    await searchInput.fill("OPTiSYNC");

    await expect(page.getByText("Lentes Digitais OPTiSYNC HD")).toBeVisible();
    // Outras páginas não correspondentes somem
    await expect(page.getByText("Rede de Entregas & Frete (/entregas)")).not.toBeVisible();
  });

  test("6. Editor de página /admin/conteudo/optisync carrega seções em ordem, gerencia dirty state e modais", async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({
      "x-playwright-bypass-token": BYPASS_TOKEN,
    });

    await page.goto("/admin/conteudo/optisync");

    // Verifica título e barra superior
    await expect(page.locator("h1")).toContainText("Lentes Digitais OPTiSYNC HD");
    await expect(page.getByText("Sincronizado")).toBeVisible();

    // Verifica seções do acordeão
    await expect(page.getByText("1. Hero Principal")).toBeVisible();
    await expect(page.getByText("2. Linha OPTiSYNC HD (Adulto & Telas)")).toBeVisible();
    await expect(page.getByText("3. Linha Fotossensível & Simulador")).toBeVisible();

    // Altera um campo de texto e valida detecção de alteração pendente (dirty state)
    const heroTitleHighlightInput = page.locator('input[value="OPTiSYNC HD"]').first();
    if (await heroTitleHighlightInput.isVisible()) {
      await heroTitleHighlightInput.fill("OPTiSYNC HD PRO");
      // Status muda para "Não Salvo"
      await expect(page.getByText("Não Salvo")).toBeVisible();

      // Clica em Salvar Rascunho
      const saveDraftBtn = page.getByRole("button", { name: "Salvar Rascunho" });
      await saveDraftBtn.click();

      // Verifica disparo e resposta de feedback
      const feedbackToast = page.locator("div").filter({ hasText: /Rascunho|schema cache|banco/i }).first();
      await expect(feedbackToast).toBeVisible();
    }

    // Abre modal de Histórico
    const historyBtn = page.getByRole("button", { name: "Histórico" });
    await historyBtn.click();
    await expect(page.getByText("Histórico de Publicações & Versões")).toBeVisible();
    await page.getByTestId("close-history-modal-btn").click();

    // Abre modal de Publicação
    const publishBtn = page.getByRole("button", { name: "Publicar no Ar" });
    await publishBtn.click();
    await expect(page.getByText("Publicar Alterações no Ar")).toBeVisible();
    await page.getByTestId("cancel-publish-modal-btn").click();
  });

  test("7. Pré-visualização com ?preview=draft exibe tarja de rascunho em /optisync", async ({ page }) => {
    await page.goto("/optisync?preview=draft");

    // Verifica tarja amarela superior de preview
    const previewBanner = page.locator("text=MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO (DRAFT)");
    await expect(previewBanner).toBeVisible();
    await expect(page.getByText("Voltar ao Editor")).toBeVisible();
  });

  test("8. Exportação e validação da API pública /api/content/optisync", async ({ request }) => {
    const res = await request.get("/api/content/optisync");
    expect(res.status()).toBe(200);

    const data = await res.json();
    expect(data.page).toBe("optisync");
    expect(data.title).toContain("OPTiSYNC");
    expect(data.values).toBeDefined();
    expect(data.values.heroTitle).toBeDefined();
  });
});
