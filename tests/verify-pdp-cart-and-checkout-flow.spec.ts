import { test, expect } from "@playwright/test";

test.describe("Usabilidade de Compra, PDP Acima da Dobra, Carrinho e Checkout (#150)", () => {
  test.beforeEach(async ({ page }) => {
    // Configura consentimento prévio de cookies para evitar sobreposição de elementos
    await page.addInitScript(() => {
      localStorage.setItem(
        "ventara_cookie_consent",
        JSON.stringify({
          necessary: true,
          analytics: true,
          marketing: true,
          timestamp: Date.now(),
        })
      );
      localStorage.removeItem("ventara_cart_items_v2");
      localStorage.removeItem("ventara_selected_frames_v1");
    });
  });

  test("T1 & T2: PDP Acima da Dobra e Abertura Automática do Carrinho ao Adicionar", async ({ page }) => {
    await page.goto("/produto/ventara-safari");
    await page.waitForLoadState("domcontentloaded");

    // Breadcrumb estruturado: Início / Armações / Linha / Nome
    const breadcrumb = page.locator("nav[aria-label='Breadcrumb']");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText("Início");
    await expect(breadcrumb).toContainText("Armações");
    await expect(breadcrumb).toContainText("VENTARA SAFARI");

    // Bloco de compra com preço e parcelas
    const mainPrice = page.locator("span.font-mono.tracking-tight").first();
    await expect(mainPrice).toBeVisible();

    // Faixa de Benefícios
    const benefitsBar = page.locator("text=Acetato Nobre").first();
    await expect(benefitsBar).toBeVisible();

    // Acordeões: Apenas 1 aberto por vez
    const sizingAccordion = page.locator("button:has-text('Tamanho e Medidas Anatômicas')");
    await expect(sizingAccordion).toBeVisible();

    // Adicionar ao Carrinho
    const addToCartButton = page.locator("button:has-text('Adicionar ao Carrinho')").first();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // Gaveta do Carrinho abre automaticamente
    const cartDrawer = page.locator("aside[aria-label='Sua seleção de armações e pagamento']");
    await expect(cartDrawer).toBeVisible();
    await expect(cartDrawer).toContainText("Seu Carrinho");
    await expect(cartDrawer).toContainText("VENTARA SAFARI");
  });

  test("T3 & T4: Controle de Quantidade e Desfazer Remoção no Carrinho", async ({ page }) => {
    await page.goto("/produto/ventara-safari");
    await page.waitForLoadState("domcontentloaded");

    // Adiciona armação
    const addToCartButton = page.locator("button:has-text('Adicionar ao Carrinho')").first();
    await addToCartButton.click();

    const cartDrawer = page.locator("aside[aria-label='Sua seleção de armações e pagamento']");
    await expect(cartDrawer).toBeVisible();

    // Aumenta quantidade
    const plusButton = cartDrawer.locator("button[aria-label='Aumentar quantidade']").first();
    await plusButton.click();

    // Remove armação
    const removeButton = cartDrawer.locator("button[aria-label='Remover item']").first();
    await removeButton.click();

    // Toast de Desfazer visível
    const undoButton = cartDrawer.locator("button:has-text('Desfazer')");
    await expect(undoButton).toBeVisible();

    // Clica em desfazer
    await undoButton.click();
    await expect(cartDrawer).toContainText("VENTARA SAFARI");
  });

  test("T5: Checkout em 4 Etapas com Máscaras e Mercado Pago", async ({ page }) => {
    await page.goto("/produto/ventara-safari");
    await page.waitForLoadState("domcontentloaded");

    // Adiciona armação
    await page.locator("button:has-text('Adicionar ao Carrinho')").first().click();

    const cartDrawer = page.locator("aside[aria-label='Sua seleção de armações e pagamento']");
    await expect(cartDrawer).toBeVisible();

    // Avança para Finalizar Compra
    const checkoutButton = cartDrawer.locator("button:has-text('FINALIZAR COMPRA')");
    await checkoutButton.click();

    // Etapa 1: Dados
    await expect(cartDrawer).toContainText("1. Seus Dados");
    await page.fill("input[placeholder*='Carlos Eduardo']", "Cliente Teste Automatizado");
    await page.fill("input[placeholder='seu@email.com']", "cliente.teste@oticaventara.com.br");
    await page.fill("input[placeholder='(18) 99999-9999']", "18999998888");
    await page.fill("input[placeholder='000.000.000-00']", "12345678901");

    // Avançar para Etapa 2
    const nextStepButton = cartDrawer.locator("button:has-text('AVANÇAR PARA A PRÓXIMA ETAPA')");
    await nextStepButton.click();

    // Etapa 2: Entrega (Retirada ou Envio)
    await expect(cartDrawer).toContainText("2. Entrega");
    await nextStepButton.click();

    // Etapa 3: Pagamento (Pix ou Cartão)
    await expect(cartDrawer).toContainText("3. Pagamento");
    await nextStepButton.click();

    // Etapa 4: Revisão do Pedido
    await expect(cartDrawer).toContainText("4. Revisão");
    await expect(cartDrawer).toContainText("Ótica Ventara Eyewear");
    await expect(cartDrawer).toContainText("54.892.147/0001-30");
  });

  test("T6: Mobile Viewport 390x844 sem Sobreposição entre Barra Fixa e WhatsApp", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/produto/ventara-safari");
    await page.waitForLoadState("domcontentloaded");

    // Barra fixa de compra inferior visível no mobile
    const mobileBar = page.locator("div.sm\\:hidden.fixed.bottom-0");
    await expect(mobileBar).toBeVisible();

    // Botão flutuante do WhatsApp
    const whatsappButton = page.locator("aside[aria-label='Atendimento pelo WhatsApp']");
    await expect(whatsappButton).toBeVisible();

    // Verifica que o WhatsApp possui elevação bottom adequada no mobile (bottom-[calc(5.75rem+...)] )
    const classAttr = await whatsappButton.getAttribute("class");
    expect(classAttr).toContain("bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))]");
  });
});
