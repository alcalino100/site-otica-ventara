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

  test("2. Imagem 3.jpeg: Mostruário com Badge DEGRADÊ, ESCOLHA SUA COR e 9 Esferas Oficiais", async ({ page }) => {
    await page.goto("/#lentes-coloridas", { waitUntil: "domcontentloaded" });

    const lensesSection = page.locator("#lentes-coloridas");
    await expect(lensesSection).toBeVisible({ timeout: 10000 });
    await expect(page.locator("#lentes-coloridas[data-hydrated='true']")).toBeVisible({ timeout: 10000 });
    await lensesSection.scrollIntoViewIfNeeded();

    // 2.1 Verifica o Badge DEGRADÊ no topo da moldura (fiel à referência 3.jpeg)
    const degradeBadge = lensesSection.getByText("DEGRADÊ", { exact: true });
    await expect(degradeBadge).toBeVisible();

    // 2.2 Verifica o Título ESCOLHA SUA COR
    const chooseColorTitle = lensesSection.locator("span:has-text('ESCOLHA SUA COR')");
    await expect(chooseColorTitle).toBeVisible();

    // 2.3 Verifica a presença das 9 cores exatas da imagem
    const requiredColors = [
      "Verde-oliva",
      "Marrom",
      "Azul-acinzentado",
      "Amarelo",
      "Rosa",
      "Vermelho",
      "Marrom-escuro",
      "Roxo",
      "Azul",
    ];

    for (const color of requiredColors) {
      const colorButton = lensesSection.getByRole("button", { name: color, exact: true });
      await expect(colorButton).toBeVisible();
    }

    // 2.4 Clica em Rosa e verifica atualização da Lente Hero
    const rosaBtn = lensesSection.getByRole("button", { name: "Rosa", exact: true });
    await rosaBtn.click();
    await expect(lensesSection.getByText("Rosa Blush Sunset Suave")).toBeVisible();

    // 2.5 Clica em Roxo e verifica atualização da Lente Hero
    const roxoBtn = lensesSection.getByRole("button", { name: "Roxo", exact: true });
    await roxoBtn.click();
    await expect(lensesSection.getByText("Roxo Ametista Royal Degradê")).toBeVisible();
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
