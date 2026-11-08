import { test, expect } from "@playwright/test";

test.describe("Validação: Tema Branco no Checkout e WhatsApp nas Lentes (#136)", () => {
  test("1. Página de Produto: Badges de WhatsApp nas lentes e clique redirecionando para WhatsApp", async ({
    page,
  }) => {
    // Intercepta window.open para verificar a URL gerada
    await page.addInitScript(() => {
      (window as any).__lastOpenedUrl = null;
      window.open = (url: string | URL | undefined) => {
        (window as any).__lastOpenedUrl = String(url);
        return null;
      };
    });

    await page.goto("/produto/ventara-safari");
    await page.waitForLoadState("domcontentloaded");

    // Verifica que as opções de lentes estão visíveis
    await expect(page.getByText("Somente a armação")).toBeVisible();
    await expect(
      page.getByText("Lentes Monofocais (Visão Simples)")
    ).toBeVisible();
    await expect(page.getByText("Lentes Multifocais")).toBeVisible();
    await expect(
      page.getByText("Filtro Luz Azul / Antirreflexo")
    ).toBeVisible();

    // Verifica os badges verdes de WhatsApp nas 3 opções de lentes com grau / tratamento
    const whatsappBadges = page.locator("span:has-text('WhatsApp')");
    const count = await whatsappBadges.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Clica em 'Lentes Monofocais (Visão Simples)'
    const monofocalBtn = page
      .locator("button:has-text('Lentes Monofocais (Visão Simples)')")
      .first();
    await monofocalBtn.click();

    // Verifica se window.open foi chamado com o link do WhatsApp formatado
    const openedUrl = await page.evaluate(
      () => (window as any).__lastOpenedUrl
    );
    expect(openedUrl).toContain("wa.me/5518996155748");
    expect(openedUrl?.toUpperCase()).toContain("VENTARA%20SAFARI");
    expect(openedUrl).toContain(
      encodeURIComponent("Lentes Monofocais (Visão Simples)")
    );
    expect(openedUrl).toContain(encodeURIComponent("dioptria"));

    // Verifica que o botão inferior de WhatsApp também continua presente e ativo
    const bottomZapBtn = page.locator(
      "a:has-text('Consultar Lentes no WhatsApp')"
    );
    await expect(bottomZapBtn).toBeVisible();
  });

  test("2. Modal de Carrinho e Checkout: Tema Branco e visual limpo (Foto 1)", async ({
    page,
  }) => {
    await page.goto("/produto/ventara-safari");
    await page.waitForLoadState("domcontentloaded");

    // Clica em COMPRAR AGORA para abrir diretamente o checkout
    const buyButton = page.locator("button:has-text('COMPRAR AGORA')");
    await buyButton.click();

    // Localiza o drawer lateral do modal
    const cartAside = page.locator("aside[aria-label='Sua seleção de armações e pagamento']");
    await expect(cartAside).toBeVisible();
    await expect(cartAside).toHaveClass(/bg-white/);
    await expect(cartAside).toHaveClass(/text-slate-900/);

    // Verifica título do checkout com texto escuro em fundo branco (Comprar Agora abre diretamente em 'checkout')
    const checkoutTitle = page.locator("h2:has-text('Finalizar Pedido')");
    await expect(checkoutTitle).toBeVisible();
    await expect(checkoutTitle).toHaveClass(/text-slate-900/);

    // 1. Seção de Dados de Contato
    const contatoSection = page
      .locator("h3:has-text('1. Seus Dados de Contato')")
      .locator("xpath=..");
    await expect(contatoSection).toBeVisible();
    await expect(contatoSection).toHaveClass(/bg-slate-50/);

    // Campos de input brancos com borda cinza
    const nameInput = page.locator("input[placeholder='Ex: Gustavo Silva']");
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveClass(/bg-white/);
    await expect(nameInput).toHaveClass(/text-slate-900/);

    // 2. Seção de Opção de Entrega
    const entregaSection = page
      .locator("h3:has-text('2. Opção de Entrega')")
      .locator("xpath=..");
    await expect(entregaSection).toBeVisible();
    await expect(entregaSection).toHaveClass(/bg-slate-50/);

    // Opção Retirada na Loja
    const pickupOption = page.locator("button:has-text('Retirada na Loja')");
    await expect(pickupOption).toBeVisible();

    // 3. Seção de Forma de Pagamento
    const pagamentoSection = page
      .locator("h3:has-text('3. Pagamento Mercado Pago')")
      .locator("xpath=..");
    await expect(pagamentoSection).toBeVisible();
    await expect(pagamentoSection).toHaveClass(/bg-slate-50/);

    // Botão final de Gerar Pix no rodapé sticky
    const submitPixBtn = page.locator(
      "button:has-text('GERAR PIX NO MERCADO PAGO')"
    );
    await expect(submitPixBtn).toBeVisible();
    await expect(submitPixBtn).toHaveClass(/bg-amber-400/);
  });
});
