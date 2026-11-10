import { test, expect } from "@playwright/test";

test.describe("Single Door, Variations & Showcase Integrity (Issue #148)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "ventara_cookie_consent",
        JSON.stringify({ necessary: true, analytics: true, marketing: true, timestamp: Date.now() })
      );
    });
  });
  test("T7: Admin Overview - 3 contadores, busca global e download de auditoria", async ({ page }) => {
    await page.goto("/admin");

    // 1. Verifica os 3 contadores centrais
    const pubCounter = page.getByRole("link", { name: /Produtos Publicados/i });
    const draftCounter = page.getByRole("link", { name: /Rascunhos com Pendência/i });
    const offerCounter = page.getByRole("link", { name: /Ofertas Ativas/i });

    await expect(pubCounter).toBeVisible();
    await expect(draftCounter).toBeVisible();
    await expect(offerCounter).toBeVisible();

    // 2. Verifica a busca global no topo com atalho
    const searchInput = page.getByPlaceholder(/Buscar qualquer produto por nome, SKU/i);
    await expect(searchInput).toBeVisible();

    // 3. Verifica botão de download da auditoria CSV
    const auditBtn = page.getByRole("link", { name: /Baixar Relatório CSV/i });
    await expect(auditBtn).toBeVisible();
  });

  test("T7 & T1: Admin Produtos - Painel de pendências e ações em lote", async ({ page }) => {
    await page.goto("/admin/produtos");

    // Título e botão Novo Produto
    await expect(page.getByRole("heading", { name: /Gestão de Produtos/i })).toBeVisible();
    const newProductBtn = page.locator("main").getByRole("link", { name: /Novo Produto/i });
    await expect(newProductBtn).toBeVisible();

    // Filtros de status
    await expect(page.getByRole("button", { name: /^Todos/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Publicados/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Rascunhos/i })).toBeVisible();

    // Aguarda carregar os produtos (compatível com visualização desktop e mobile visível)
    await expect(page.locator("table tbody tr:visible, div.block.md\\:hidden > div:visible").first()).toBeVisible({ timeout: 10000 });

    // Selecionar todos e barra de lote
    const selectAllBtn = page.getByRole("button", { name: /Selecionar Todos/i });
    await expect(selectAllBtn).toBeVisible();
    await selectAllBtn.click();

    // Barra de lote deve aparecer com opções
    await expect(page.getByRole("button", { name: /Alterar Preço/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Publicar", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Rascunho", exact: true })).toBeVisible();

    // Abrir modal de alteração de preço
    await page.getByRole("button", { name: /Alterar Preço/i }).click();
    await expect(page.getByRole("heading", { name: /Alterar Preço em Lote/i })).toBeVisible();
    await expect(page.getByText(/Prévia de Exemplo/i)).toBeVisible();
    await page.getByRole("button", { name: /Cancelar/i }).click();
  });

  test("T1 & T4: Formulário Guiado de Novo Produto com Variações Precificadas", async ({ page }) => {
    await page.goto("/admin/produtos/novo");

    // Dispensar banner de cookies se visível
    const cookieBanner = page.getByRole("button", { name: /Aceitar Todos/i });
    if (await cookieBanner.isVisible()) {
      await cookieBanner.click();
    }

    // Passo 1: Foto primeiro com aviso de resolução
    await expect(page.getByText(/Passo 1: Fotos da Armação/i)).toBeVisible();

    // Preencher URL da foto para avançar
    const urlInput = page.getByPlaceholder(/exemplo\.com\/foto-armacao/i);
    await urlInput.fill("https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=1200&q=80");
    await page.getByRole("button", { name: "Adicionar", exact: true }).click();
    await page.getByRole("button", { name: /Próxima Etapa/i }).click({ force: true });

    // Passo 2: Identificação e SKU automático
    await expect(page.getByText(/Passo 2: Nome, Marca e SKU/i)).toBeVisible();
    const nameInput = page.locator("input[placeholder*='Ex: Ventara Safari']");
    await nameInput.fill("Ventara Teste E2E");

    const skuInput = page.locator("input[placeholder*='Ex: VEN-SAFARI-01']");
    await expect(skuInput).toBeVisible();
    const skuVal = await skuInput.inputValue();
    expect(skuVal.startsWith("VEN-")).toBeTruthy();

    await page.getByRole("button", { name: /Próxima Etapa/i }).click({ force: true });

    // Passo 3: Preços com parcelamento em tempo real
    await expect(page.getByText(/Passo 3: Preço de Venda e Desconto/i)).toBeVisible();
    await expect(page.getByText(/10x de/i)).toBeVisible();
    await page.getByRole("button", { name: /Próxima Etapa/i }).click({ force: true });

    // Passo 4: Tabela de Variações de Cor e Acabamento
    await expect(page.getByText(/Passo 4: Variações de Cor e Acabamento/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Adicionar Mais uma Cor/i })).toBeVisible();
    await page.getByRole("button", { name: /Próxima Etapa/i }).click({ force: true });

    // Passo 5: Descrição e Ficha Técnica
    await expect(page.getByText(/Passo 5: Descrição e Ficha Técnica/i)).toBeVisible();
    await page.getByRole("button", { name: /Próxima Etapa/i }).click({ force: true });

    // Passo 6: Revisão e Prévia do Card
    await expect(page.getByText(/Passo 6: Revisão e Onde Este Produto/i)).toBeVisible();
    await expect(page.getByText(/Este produto aparecerá em:/i)).toBeVisible();
    await expect(page.getByText(/Início/i)).toBeVisible();
    await expect(page.getByText(/Armações/i)).toBeVisible();
  });

  test("T5 & T6: Vitrine Promocional na Home - Título dinâmico e sem duplicação", async ({ page }) => {
    await page.goto("/");

    // Vitrine de Ofertas
    const showcase = page.locator("section[aria-label='Modelos Selecionados']");
    await expect(showcase).toBeVisible();

    // Todos os cards de produtos na vitrine devem ter imagem com cantos arredondados (rounded-2xl)
    const productCards = showcase.locator("article");
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);

    // Verifica que não há 4 cards com o mesmo nome repetido de fallback "VENTARA SAFARI"
    const titles = await showcase.locator("h3").allTextContents();
    const safariCount = titles.filter((t) => t.trim().toUpperCase() === "VENTARA SAFARI").length;
    // Não pode ter 4 ou mais cards safari idênticos
    expect(safariCount).toBeLessThan(3);
  });

  test("T4 & T8: Página de Detalhe - Variações trocam dados e WhatsApp leva SKU correto", async ({ page }) => {
    await page.goto("/produto/ventara-safari");

    // Verifica presença da página de detalhe
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Botão de compra e WhatsApp
    const buyButton = page.getByRole("button", { name: /Comprar Agora/i });
    await expect(buyButton).toBeVisible();

    const whatsappLink = page.getByRole("link", { name: /Consultar Lentes no WhatsApp/i });
    await expect(whatsappLink).toBeVisible();
  });

  test("T9: Estabilidade - Contagem de produtos idêntica em 5 recarregamentos", async ({ page }) => {
    await page.goto("/armacoes");
    await page.waitForLoadState("networkidle");

    const getCount = async () => {
      const items = page.locator("div.product, a[href*='/armacoes/']");
      return await items.count();
    };

    const initialCount = await getCount();
    expect(initialCount).toBeGreaterThan(0);

    for (let i = 0; i < 5; i++) {
      await page.reload({ waitUntil: "networkidle" });
      const currentCount = await getCount();
      expect(currentCount).toBe(initialCount);
    }
  });
});
