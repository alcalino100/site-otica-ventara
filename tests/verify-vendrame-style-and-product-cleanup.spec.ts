import { test, expect } from "@playwright/test";

test.describe("Validação: Remoção de cards, Lentes mais convidativas e Modal de Leads estilo Vendrame (#138)", () => {
  test("1. Foto 1: Os 3 cards de benefícios abaixo da foto foram removidos", async ({
    page,
  }) => {
    await page.goto("/produto/ventara-safari");
    await page.waitForLoadState("domcontentloaded");

    // Valida que os 3 cards antigos abaixo da galeria não estão presentes
    await expect(page.locator("p:has-text('Garantia Oficial')")).toHaveCount(0);
    await expect(page.locator("p:has-text('Ajuste Gratuito')")).toHaveCount(0);
    await expect(page.locator("p:has-text('Montagem Ágil')")).toHaveCount(0);
  });

  test("2. Foto 2: Seção de lentes com visual refinado, badges elegantes e títulos", async ({
    page,
  }) => {
    await page.goto("/produto/ventara-safari");
    await page.waitForLoadState("domcontentloaded");

    // Header da seção com selo de consultoria técnica
    await expect(
      page.getByText("Precisa de lentes para esta armação?")
    ).toBeVisible();
    await expect(page.getByText("Consultoria Técnica")).toBeVisible();

    // 4 opções de lentes presentes com textos intactos
    const monofocalBtn = page.locator(
      "button:has-text('Lentes Monofocais (Visão Simples)')"
    );
    const multifocalBtn = page.locator("button:has-text('Lentes Multifocais')");
    const filtroAzulBtn = page.locator(
      "button:has-text('Filtro Luz Azul / Antirreflexo')"
    );
    const semLenteBtn = page.locator("button:has-text('Somente a armação')");

    await expect(monofocalBtn).toBeVisible();
    await expect(multifocalBtn).toBeVisible();
    await expect(filtroAzulBtn).toBeVisible();
    await expect(semLenteBtn).toBeVisible();

    // Badges verdes de WhatsApp com novo design
    const whatsappBadges = page.locator("span:has-text('WhatsApp')");
    const badgeCount = await whatsappBadges.count();
    expect(badgeCount).toBeGreaterThanOrEqual(3);
  });

  test("3. Áudio 1 & Vendrame: Modal de captação de dados (Nome, WhatsApp, Facebook) ao consultar lentes", async ({
    page,
  }) => {
    // Intercepta window.open para verificar a URL do WhatsApp
    await page.addInitScript(() => {
      (window as any).__lastOpenedUrl = null;
      window.open = (url: string | URL | undefined) => {
        (window as any).__lastOpenedUrl = String(url);
        return null;
      };
    });

    await page.goto("/produto/ventara-safari");
    await page.waitForLoadState("domcontentloaded");

    // Clica na opção de Lentes Monofocais para abrir a consultoria
    const monofocalBtn = page
      .locator("button:has-text('Lentes Monofocais (Visão Simples)')")
      .first();
    await monofocalBtn.click();

    // O modal estilo Vendrame deve abrir
    const modalTitle = page.locator("h3:has-text('Consultar Lentes & Receita')");
    await expect(modalTitle).toBeVisible();

    // Verifica os 3 passos estilo Vendrame
    await expect(page.getByText("PASSO 1")).toBeVisible();
    await expect(page.getByText("PASSO 2")).toBeVisible();
    await expect(page.getByText("PASSO 3")).toBeVisible();

    // Verifica campos de Nome, WhatsApp e Facebook/Instagram (conforme pedido no áudio)
    const nameInput = page.locator("input[placeholder='Ex: Gustavo Silva']");
    const phoneInput = page.locator("input[placeholder='(18) 99999-9999']");
    const socialInput = page.locator(
      "input[placeholder='Ex: @usuario ou perfil']"
    );

    await expect(nameInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(socialInput).toBeVisible();

    // Preenche dados do lead
    await nameInput.fill("Cliente Teste Ventara");
    await phoneInput.fill("(18) 99999-8888");
    await socialInput.fill("@cliente.ventara");

    // Intercepta a requisição da API de leads
    const leadPromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/leads/consultation") && res.status() === 200
    );

    // Clica no botão de avanço para o WhatsApp
    const submitBtn = page.locator(
      "button:has-text('AVANÇAR PARA O WHATSAPP E ENVIAR RECEITA')"
    );
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    await leadPromise;

    // Verifica que o WhatsApp foi acionado com os dados do lead, armação e perfil social
    const openedUrl = await page.evaluate(
      () => (window as any).__lastOpenedUrl
    );
    expect(openedUrl).toContain("wa.me/5518996155748");
    expect(openedUrl).toContain(encodeURIComponent("Cliente Teste Ventara"));
    expect(openedUrl).toContain(encodeURIComponent("@cliente.ventara"));
    expect(openedUrl?.toUpperCase()).toContain("VENTARA%20SAFARI");
  });
});
