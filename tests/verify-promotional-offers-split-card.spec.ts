import { test, expect } from "@playwright/test";
import { calculateDiscountPercent, calculateInstallment, formatProductPricing } from "../lib/pricing";

test.describe("Regras de Dados e Cálculos Financeiros (Compliance)", () => {
  test("Calcula percentual de desconto com arredondamento correto", () => {
    // Exemplo: de R$ 888,90 para R$ 389,00 -> round((88890 - 38900) / 88890 * 100) = 56%
    const disc = calculateDiscountPercent(38900, 88890);
    expect(disc).toBe(56);

    // Exemplo: de R$ 619,90 para R$ 389,00 -> round((61990 - 38900) / 61990 * 100) = 37%
    const disc2 = calculateDiscountPercent(38900, 61990);
    expect(disc2).toBe(37);

    // Exemplo: de R$ 789,90 para R$ 419,90 -> round((78990 - 41990) / 78990 * 100) = 47%
    const disc3 = calculateDiscountPercent(41990, 78990);
    expect(disc3).toBe(47);
  });

  test("Sem preço antigo ou preço antigo <= atual não gera desconto", () => {
    expect(calculateDiscountPercent(38900, null)).toBe(0);
    expect(calculateDiscountPercent(38900, undefined)).toBe(0);
    expect(calculateDiscountPercent(38900, 38900)).toBe(0);
    expect(calculateDiscountPercent(40000, 38900)).toBe(0);
  });

  test("Parcelamento em 10x sem juros é calculado com precisão", () => {
    const inst = calculateInstallment(38900, 10);
    expect(inst.count).toBe(10);
    expect(inst.valueInReais).toBe(38.9);
    expect(inst.formatted).toContain("38,90");
  });
});

test.describe("Seção de Ofertas Promocionais (Vitrine Split Card)", () => {
  test.beforeEach(async ({ page }) => {
    // Desativa roleta promocional e aceita cookies durante os testes
    await page.addInitScript(() => {
      localStorage.setItem("ventara_wheel_disabled", "1");
      sessionStorage.setItem("ventara_wheel_session_dismissed", "1");
      localStorage.setItem(
        "ventara_cookie_consent",
        JSON.stringify({ essential: true, analytics: true, marketing: false })
      );
    });
  });

  test("Renderiza os cards com layout split, imagem no topo e texto embaixo", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState("domcontentloaded");

    const promoSection = page.locator("section[aria-label='Modelos Selecionados']");
    await expect(promoSection).toBeVisible();

    // Título dinâmico reflete o maior desconto real
    const title = promoSection.locator("h2");
    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText).toMatch(/Até \d+% OFF/i);

    // Cards split renderizados
    const cards = promoSection.locator("[data-testid='promo-split-card']");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    const firstCard = cards.first();

    // 1. Bloco de imagem no topo
    const imgBlock = firstCard.locator("div.aspect-\\[4\\/3\\]");
    await expect(imgBlock).toBeVisible();

    const img = imgBlock.locator("img");
    await expect(img).toBeVisible();

    // 2. Selo verde de desconto exclusivo em produtos com desconto (no header do card)
    const discountBadge = firstCard.locator("[data-testid='discount-badge']");
    if (await discountBadge.isVisible()) {
      const badgeText = await discountBadge.textContent();
      expect(badgeText).toMatch(/-\d+%\s*OFF/i);
    }

    // 3. Bloco inferior de texto
    const categorySpan = firstCard.locator("span", { hasText: /VENTARA ·/i });
    await expect(categorySpan).toBeVisible();

    const nameHeading = firstCard.locator("h3");
    await expect(nameHeading).toBeVisible();

    const currentPrice = firstCard.locator("[data-testid='promo-current-price']");
    await expect(currentPrice).toBeVisible();

    const installmentSpan = firstCard.locator("p", { hasText: /10x de/i });
    await expect(installmentSpan).toBeVisible();

    // 4. Botões de ação idênticos à referência aprovada com alvos adequados >= 44px
    const buyBtn = firstCard.locator("a", { hasText: "Comprar" });
    await expect(buyBtn).toBeVisible();
    const buyBox = await buyBtn.boundingBox();
    expect(buyBox?.height).toBeGreaterThanOrEqual(44);

    const waBtn = firstCard.locator("a", { hasText: "WhatsApp" });
    await expect(waBtn).toBeVisible();
    const waBox = await waBtn.boundingBox();
    expect(waBox?.height).toBeGreaterThanOrEqual(44);
  });

  const viewports = [
    { width: 320, height: 600, name: "320-small-mobile" },
    { width: 360, height: 640, name: "360-standard-mobile" },
    { width: 390, height: 844, name: "390-iphone-14" },
    { width: 430, height: 932, name: "430-iphone-pro-max" },
    { width: 768, height: 1024, name: "768-ipad" },
    { width: 1024, height: 768, name: "1024-laptop" },
    { width: 1440, height: 900, name: "1440-desktop" },
  ];

  for (const vp of viewports) {
    test(`Sem overflow horizontal da página na largura ${vp.width}px (${vp.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("http://localhost:3000/");
      await page.waitForLoadState("domcontentloaded");

      const promoSection = page.locator("section[aria-label='Modelos Selecionados']");
      await expect(promoSection).toBeVisible();

      // Checa se a página não tem scroll horizontal indesejado
      const isHorizontalScrollable = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(isHorizontalScrollable).toBe(false);

      // Salva screenshots para evidência em 390, 768 e 1440px
      if ([390, 768, 1440].includes(vp.width)) {
        await promoSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        await promoSection.screenshot({
          path: `/Users/user/.gemini/antigravity/brain/3307d6a6-ee9f-47b4-bbf9-e090e670f231/offers-split-card-${vp.width}.png`,
        });
      }
    });
  }

  test("Painel Admin possui opções de selo verde OFF e estilo do card (split vs fullbleed)", async ({ page }) => {
    await page.goto("http://localhost:3000/admin/banners");
    await page.waitForLoadState("domcontentloaded");

    const promoTabBtn = page.getByRole("button", { name: /Vitrine de Modelos/i });
    await expect(promoTabBtn).toBeVisible({ timeout: 10000 });
    await promoTabBtn.click();

    // Verifica o toggle de selo verde
    const toggleBadge = page.locator("[data-testid='toggle-discount-badge']");
    await expect(toggleBadge).toBeVisible();

    // Verifica o seletor de estilo do card
    const selectLayout = page.locator("[data-testid='select-card-layout']");
    await expect(selectLayout).toBeVisible();
    await expect(selectLayout).toHaveValue("split");

    // Valida opções disponíveis
    const options = await selectLayout.locator("option").allTextContents();
    expect(options).toContain("Imagem em cima (novo — padrão)");
    expect(options).toContain("Imagem de fundo (anterior)");

    // Salva screenshot do painel admin
    await page.screenshot({
      path: "/Users/user/.gemini/antigravity/brain/3307d6a6-ee9f-47b4-bbf9-e090e670f231/offers-admin-settings.png",
      fullPage: false,
    });
  });

  test("Página /armacoes permanece estável com catálogo intacto", async ({ page }) => {
    await page.goto("http://localhost:3000/armacoes");
    await page.waitForLoadState("domcontentloaded");

    const armacoesMain = page.locator("main");
    await expect(armacoesMain).toBeVisible();

    const productCards = page.locator(".product");
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });
});
