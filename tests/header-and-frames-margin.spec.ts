import { test, expect } from "@playwright/test";

test.describe("Validação de Header sem Tarja, Respiro no Hero e Margem das Armações", () => {
  test("1. Header sem tarja superior em todos os responsivos e altura ampliada", async ({ page }) => {
    // 1.1 Mobile Viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForTimeout(500);

    // Não deve existir a tarja de texto do anúncio no topo
    await expect(page.locator(".preview")).toHaveCount(0);
    const bodyText = await page.locator("header.site-header").innerText();
    expect(bodyText).not.toContain("CATÁLOGO ONLINE & ATENDIMENTO PERSONALIZADO");

    // Header fixo visível
    const header = page.locator("header.site-header");
    await expect(header).toBeVisible();
    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();
    // Altura ampliada (engrossado para padrão luxury)
    console.log(`Mobile Header Height: ${headerBox!.height}px`);
    expect(headerBox!.height).toBeGreaterThanOrEqual(68);

    // 1.2 Desktop Viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForTimeout(500);

    await expect(page.locator(".preview")).toHaveCount(0);
    const desktopHeaderBox = await header.boundingBox();
    expect(desktopHeaderBox).not.toBeNull();
    console.log(`Desktop Header Height: ${desktopHeaderBox!.height}px`);
    expect(desktopHeaderBox!.height).toBeGreaterThanOrEqual(70);
  });

  test("2. Respiro generoso entre o Header e 'QUALIDADE QUE VOCÊ VÊ' no mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    // Fecha cookies se presentes
    try {
      const cookieBtn = page.getByRole("button", { name: /Aceitar Todos/i });
      if (await cookieBtn.isVisible({ timeout: 1500 })) {
        await cookieBtn.click();
      }
    } catch {}

    await page.waitForTimeout(600);

    const header = page.locator("header.site-header");
    const eyebrow = page.getByText(/QUALIDADE QUE VOCÊ VÊ/i).first();

    await expect(header).toBeVisible();
    await expect(eyebrow).toBeVisible();

    const headerBox = await header.boundingBox();
    const eyebrowBox = await eyebrow.boundingBox();

    expect(headerBox).not.toBeNull();
    expect(eyebrowBox).not.toBeNull();

    const headerBottomY = headerBox!.y + headerBox!.height;
    const eyebrowTopY = eyebrowBox!.y;
    const breathingRoom = eyebrowTopY - headerBottomY;

    console.log(`Header Bottom: ${headerBottomY}px, Eyebrow Top: ${eyebrowTopY}px, Breathing Room: ${breathingRoom}px`);

    // Deve haver um respiro considerável (sem sobreposição)
    expect(breathingRoom).toBeGreaterThanOrEqual(25);

    // Salva screenshot do topo mobile comprovando o respiro
    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/mobile-header-hero-breathing-room.png",
    });
  });

  test("3. Margem lateral considerável entre os modelos de armação no mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/#armacoes");

    // Fecha cookies se presentes
    try {
      const cookieBtn = page.getByRole("button", { name: /Aceitar Todos/i });
      if (await cookieBtn.isVisible({ timeout: 1500 })) {
        await cookieBtn.click();
      }
    } catch {}

    await page.waitForTimeout(600);

    const carousel = page.locator("div[role='region'][aria-label='Carrossel de armações']");
    await expect(carousel).toBeVisible();
    await carousel.scrollIntoViewIfNeeded();

    const cards = carousel.locator("> div");
    const count = await cards.count();
    expect(count).toBeGreaterThan(1);

    const firstCardBox = await cards.nth(0).boundingBox();
    const secondCardBox = await cards.nth(1).boundingBox();

    expect(firstCardBox).not.toBeNull();
    expect(secondCardBox).not.toBeNull();

    const firstCardRight = firstCardBox!.x + firstCardBox!.width;
    const secondCardLeft = secondCardBox!.x;
    const cardGap = secondCardLeft - firstCardRight;

    console.log(`First Card Width: ${firstCardBox!.width}px, Gap between cards: ${cardGap}px`);

    // A distância entre os dois cards deve ser generosa (mínimo 20px, ideal 24px)
    expect(cardGap).toBeGreaterThanOrEqual(20);

    // Salva screenshot focado no carrossel de armações
    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/mobile-frames-carousel-generous-margin.png",
    });
  });
});
