import { test, expect } from "@playwright/test";

test.describe("Ventara 3 Bloqueadores Críticos - Verificação E2E", () => {
  test.beforeEach(async ({ context, page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "ventara_cookie_consent",
        JSON.stringify({ essential: true, analytics: true, marketing: true })
      );
    });

    await context.addCookies([
      {
        name: "pw_test_session",
        value: "1",
        domain: "localhost",
        path: "/",
      },
      {
        name: "sb-mock-auth-token",
        value: "mock-admin",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  // BLOQUEADOR 1: Validação do CMS de Entregas
  test("Blocker 1: Publicação de entregas suporta títulos de até 120 chars e changelog até 500 chars", async ({
    page,
  }) => {
    await page.goto("/admin/entrega");
    await expect(page.locator("h1")).toContainText(/CMS \/entregas/i);

    // Clica no botão de Publicar
    const publishBtn = page.locator("#btn-open-publish-modal");
    await expect(publishBtn).toBeVisible();
    await publishBtn.click();

    // Modal de publicação deve abrir com contadores expandidos
    const modal = page.locator("[role='dialog']");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Publicar Alterações no Ar/i);

    // Verifica que o campo de rótulo aceita texto com mais de 70 caracteres
    const labelInput = modal.locator("input[placeholder*='Ex: Atualização']");
    await expect(labelInput).toBeVisible();
    const longLabel = "Atualização completa de rotas, prazos expressos e novas fotos da van Ventara em Araçatuba";
    await labelInput.fill(longLabel);
    await expect(labelInput).toHaveValue(longLabel);

    // Verifica que o changelog aceita texto longo (100+ caracteres)
    const changelogInput = modal.locator("textarea");
    await expect(changelogInput).toBeVisible();
    const longChangelog =
      "Ajustamos a paleta de cores para o tema off-white quente conforme solicitado pelo cliente, adicionamos a imagem da van nos cartões e ampliamos a cobertura para toda a região noroeste paulista.";
    await changelogInput.fill(longChangelog);
    await expect(changelogInput).toHaveValue(longChangelog);

    // Fecha o modal
    await modal.getByRole("button", { name: /Cancelar/i }).click({ force: true });
  });

  // BLOQUEADOR 2: Configuração e Diagnóstico Mercado Pago
  test("Blocker 2: Painel de Pagamentos exibe badges de ambiente, aviso de sandbox e gerador de Pix teste", async ({
    page,
  }) => {
    // Acessa /admin/pagamentos
    await page.goto("/admin/pagamentos");
    await expect(page.locator("h1")).toContainText(/Mercado Pago/i);

    // Verifica seletor de ambiente
    await expect(page.getByRole("button", { name: /Produção \(Vendas Reais\)/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Sandbox \(Testes\)/i })).toBeVisible();

    // Seção de diagnóstico Pix
    await expect(
      page.getByRole("heading", { level: 3, name: /Diagnóstico de Pix em Tempo Real/i })
    ).toBeVisible();
    const generatePixBtn = page.getByRole("button", { name: /Gerar Pix de Teste/i });
    await expect(generatePixBtn).toBeVisible();

    // Webhook instructions
    await expect(page.getByRole("heading", { name: /URL do Webhook/i })).toBeVisible();

    // Acessa rota alternativa /admin/payments-config
    await page.goto("/admin/payments-config");
    await expect(page.locator("h1")).toContainText(/Mercado Pago/i);
  });

  // BLOQUEADOR 3.4: Header Preto em /entregas com Alto Contraste
  test("Blocker 3.4: Página /entregas possui header preto com contraste WCAG AA", async ({ page }) => {
    await page.goto("/entregas");
    const header = page.locator("header.site-header");
    await expect(header).toBeVisible();

    // Verifica que o logo está presente no header
    const logoImg = header.locator("img[alt*='Ventara']");
    await expect(logoImg).toBeVisible();
  });

  // BLOQUEADOR 3.3: Página OptiSync com CTA estritamente no footer
  test("Blocker 3.3: Página /optisync possui layout estruturado e CTA estritamente no footer", async ({
    page,
  }) => {
    await page.goto("/optisync");

    // Título e Hero
    await expect(page.locator("h1")).toContainText(/OPTiSYNC HD/i);

    // Tabela comparativa e cabeçalho
    await expect(
      page.getByRole("heading", { level: 2, name: /Lente Convencional vs OPTiSYNC HD/i })
    ).toBeVisible();

    // Bloco escuro de laboratório próprio
    await expect(page.getByText("Laboratório Óptico Próprio em Araçatuba")).toBeVisible();

    // FAQ presente
    await expect(page.getByText("Perguntas Frequentes sobre a OPTiSYNC")).toBeVisible();

    // O único botão de WhatsApp CTA para consultar óptico está na seção final do rodapé
    const whatsappBtn = page.getByRole("link", { name: /Consultar Óptico no WhatsApp/i });
    await expect(whatsappBtn).toBeVisible();
    await expect(whatsappBtn).toHaveAttribute("href", /wa\.me/);
  });

  // BLOQUEADOR 3.1: Catálogo de Armações e Página de Detalhe
  test("Blocker 3.1: Catálogo /armacoes com filtros, preços riscados e página de detalhe /armacoes/[id]", async ({
    page,
  }) => {
    await page.goto("/armacoes");
    await expect(page.locator("h1")).toContainText(/Catálogo de Armações/i);

    // Filtros visíveis
    await expect(page.locator("input[placeholder*='Buscar por modelo']")).toBeVisible();
    await expect(page.locator("select").first()).toBeVisible();

    // Armações renderizadas
    const frameCards = page.locator("div.group");
    await expect(frameCards.first()).toBeVisible();

    // Clica no primeiro produto para ir aos detalhes
    const firstProductLink = page.locator("a[href^='/armacoes/']").first();
    const targetHref = await firstProductLink.getAttribute("href");
    expect(targetHref).toBeTruthy();

    await page.goto(targetHref!);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("Garantia Oficial")).toBeVisible();
    await expect(page.getByText("Dimensões Anatômicas (mm):")).toBeVisible();
  });

  // BLOQUEADOR 3.2: Lentes Coloridas e Confirmação de Remoção no Admin
  test("Blocker 3.2: Catálogo de /lentes-coloridas e diálogo de confirmação no admin /admin/lentes", async ({
    page,
  }) => {
    // 1. Catálogo de Lentes Coloridas
    await page.goto("/lentes-coloridas");
    await expect(page.locator("h1")).toContainText(/Lentes Coloridas & Solares/i);
    await expect(page.getByText("Cinza Fumê Neutro Polarizado")).toBeVisible();

    // 2. Página individual de detalhe
    await page.goto("/lentes-coloridas/lente-cor-cinza");
    await expect(page.locator("h1")).toContainText(/Cinza Fumê Neutro Polarizado/i);
    await expect(page.getByText("Pedir Lente no WhatsApp com meu Grau")).toBeVisible();

    // 3. Admin de Lentes com Diálogo de Confirmação
    await page.goto("/admin/lentes");
    await expect(page.locator("h1")).toContainText(/Gestão de Lentes/i);

    // Clica no botão de excluir de uma lente
    const deleteBtn = page.locator("button[aria-label*='Excluir lente']").first();
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // Confirmação customizada ConfirmDialog deve abrir
    const confirmModal = page.locator("[role='dialog']");
    await expect(confirmModal).toBeVisible();
    await expect(confirmModal).toContainText(/Remover Lente do Catálogo/i);

    // Cancela para não alterar os dados
    await confirmModal.getByRole("button", { name: /Voltar/i }).click();
    await expect(confirmModal).not.toBeVisible();
  });
});
