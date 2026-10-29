import { test, expect } from "@playwright/test";

test.describe("Validação dos Ajustes do Cliente (Rastreio e Vitrine de Modelos)", () => {
  test("1. Rastreio: Pedido enviado e despachado NÃO exibe retirada na loja", async ({ page }) => {
    await page.goto("/rastreio", { waitUntil: "domcontentloaded" });

    // Preenche o campo de busca com o código do pedido
    const input = page.locator("input[placeholder*='código']");
    await expect(input).toBeVisible();
    await input.fill("VEN-2610-F334EC");

    // Clica no botão Rastrear
    await page.locator("button:has-text('Rastrear')").click();

    // Aguarda carregar os dados do pedido
    await expect(page.getByText("VEN-2610-F334EC")).toBeVisible({ timeout: 10000 });

    // Verifica que o status é Enviado e Despachado
    await expect(page.getByText("Enviado e Despachado").first()).toBeVisible();

    // Passo 5 da timeline deve ser Enviado e Despachado, NÃO 'Pronto para Retirada na Loja'
    await expect(page.getByText("Pronto para Retirada na Loja")).not.toBeVisible();
    await expect(page.getByText("Aguardando retirada no balcão")).not.toBeVisible();

    // Box de Entrega deve ser Envio para Endereço Residencial, NÃO balcão da loja
    await expect(page.getByText("Retirada no Balcão da Loja Física")).not.toBeVisible();
    await expect(page.getByText("Envio para Endereço Residencial")).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/scratch/rastreio_despachado_corrigido.png",
      fullPage: true,
    });
  });

  test("2. Vitrine de Modelos: Suporte a modelos sem promoção e link de Comprar correto", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Rola até a vitrine de modelos selecionados
    const section = page.locator("section[aria-label='Modelos Selecionados']");
    await expect(section).toBeVisible({ timeout: 10000 });
    await section.scrollIntoViewIfNeeded();

    // Verifica que o texto inferior não força mais '25% OFF'
    const footerCounter = section.getByText(/Mostrando \d+ de \d+ modelos selecionados/);
    await expect(footerCounter).toBeVisible();
    await expect(section.locator("text=modelos com até 25% OFF")).not.toBeVisible();

    // Verifica o card Ventara teste
    const testeCard = section.locator("article:has-text('Ventara teste')");
    if (await testeCard.count() > 0) {
      const buyLink = testeCard.locator("a:has-text('Comprar')");
      await expect(buyLink).toHaveAttribute("href", "/produto/teste");
    }

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/scratch/vitrine_modelos_corrigida.png",
    });
  });
});
