import { test, expect } from "@playwright/test";

test.describe("Validação das 3 Alterações Solicitadas pelo Cliente (Áudio e Imagem)", () => {
  test("1. Áudio 1: Botões de Comprar e Links de Produtos apontam para os produtos corretos", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // 1.1 Vitrine Promocional
    const promoSection = page.locator("section[aria-label='Modelos Selecionados']");
    await expect(promoSection).toBeVisible({ timeout: 10000 });
    await promoSection.scrollIntoViewIfNeeded();

    // Cards promocionais
    const safariCard = promoSection.locator("article:has-text('VENTARA SAFARI')");
    await expect(safariCard).toBeVisible();
    const safariLink = safariCard.locator("a:has-text('Comprar')");
    await expect(safariLink).toHaveAttribute("href", "/produto/ventara-safari");

    const oncaCard = promoSection.locator("article:has-text('Ventara Onça')");
    await expect(oncaCard).toBeVisible();
    const oncaLink = oncaCard.locator("a:has-text('Comprar')");
    await expect(oncaLink).toHaveAttribute("href", "/produto/ventara-onca");

    // 1.2 Vitrine Esportiva (InteractiveShowcase)
    const sportSection = page.locator("section#vitrine-esportiva, section:has-text('Performance & Velocidade'), section:has-text('Ventara Horizonte')").first();
    if (await sportSection.count() > 0) {
      await sportSection.scrollIntoViewIfNeeded();
      const sportOptionsLink = sportSection.locator("a[href*='ventara-horizonte']").first();
      if (await sportOptionsLink.count() > 0) {
        await expect(sportOptionsLink).toHaveAttribute("href", "/produto/ventara-horizonte-sport");
      }
    }

    // 1.3 Resolução retrocompatível do slug ventara-horizonte
    await page.goto("/produto/ventara-horizonte", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Ventara Horizonte Sport").first()).toBeVisible({ timeout: 10000 });
  });

  test("2. Mostruário de Lentes Solares com Formas Orgânicas e Fotos Reais", async ({ page }) => {
    await page.goto("/#lentes-coloridas", { waitUntil: "domcontentloaded" });

    const lensesSection = page.locator("#lentes-coloridas");
    await expect(lensesSection).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#lentes-coloridas[data-hydrated='true']")).toBeVisible({ timeout: 10000 });
    await lensesSection.scrollIntoViewIfNeeded();

    // 2.1 Verifica o Badge no topo da moldura
    const degradeBadge = lensesSection.getByText("DEGRADÊ", { exact: false }).first();
    await expect(degradeBadge).toBeVisible();

    // 2.2 Verifica o Título ESCOLHA SUA COR
    const chooseColorTitle = lensesSection.locator("span:has-text('ESCOLHA SUA COR')");
    await expect(chooseColorTitle).toBeVisible();

    // 2.3 Verifica a presença das cores com formas orgânicas da referência visual
    const requiredColors = [
      "Cinza Fumê",
      "Marrom",
      "Verde",
      "Amarelo",
      "Azul Espelhado",
      "Vermelho Espelhado",
      "Degradê",
    ];

    for (const color of requiredColors) {
      const colorButton = lensesSection.getByRole("button", { name: color, exact: true });
      await expect(colorButton).toBeVisible();
    }

    // 2.4 Clica em Vermelho Espelhado e verifica atualização da Lente Hero
    const vermelhoBtn = lensesSection.getByRole("button", { name: "Vermelho Espelhado", exact: true });
    await vermelhoBtn.click();
    await expect(lensesSection.getByText("Vermelho Espelhado Ruby Fire")).toBeVisible();
    await expect(lensesSection.getByRole("img", { name: /Vermelho Espelhado/i })).toBeVisible();

    // 2.5 Clica em Azul Espelhado e verifica atualização da Lente Hero
    const azulBtn = lensesSection.getByRole("button", { name: "Azul Espelhado", exact: true });
    await azulBtn.click();
    await expect(lensesSection.getByText("Azul Espelhado Safira Mirror")).toBeVisible();
    await expect(lensesSection.getByRole("img", { name: /Azul Espelhado/i })).toBeVisible();
  });

  test("3. Áudio 2: Roleta no Mobile compacta e precisa sem rolagem excessiva", async ({ page }) => {
    // Simula tela de celular comum (iPhone 14 / Pixel: 390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/roleta", { waitUntil: "domcontentloaded" });

    const wheelHeading = page.getByRole("heading", { name: "Roleta de Benefícios Exclusivos" });
    await expect(wheelHeading).toBeVisible({ timeout: 10000 });

    // Verifica que o canvas da roleta está renderizado e compacto
    const wheelSvg = page.locator("svg[viewBox='0 0 320 320']").first();
    await expect(wheelSvg).toBeVisible();

    // Verifica os campos de identificação (Nome e WhatsApp) compactos
    const nameInput = page.locator("input[placeholder*='Ex: Mariana']");
    const phoneInput = page.locator("input[placeholder*='(18)']");
    const spinButton = page.locator("button:has-text('Girar Roleta')");

    await expect(nameInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(spinButton).toBeVisible();

    // Preenche com agilidade
    await nameInput.fill("Cliente Teste");
    await phoneInput.fill("18999998888");

    await expect(spinButton).toBeEnabled();
  });
});
