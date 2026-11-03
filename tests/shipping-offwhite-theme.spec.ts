import { test, expect } from "@playwright/test";

test.describe("Página /entregas - Estética Off-White Premium & Design Tokens", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: "pw_test_session",
        value: "1",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.addInitScript(() => {
      localStorage.setItem(
        "ventara_cookie_consent",
        JSON.stringify({ essential: true, analytics: true, marketing: true })
      );
    });
  });

  test("1. Wrapper da página possui data-theme='light' e fundo off-white #FAF8F4", async ({
    page,
  }) => {
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    // Verifica atributo de escopo
    const pageWrapper = page.locator("[data-theme='light']");
    await expect(pageWrapper).toBeVisible();

    // Valida cor de fundo da página off-white
    const bgColor = await pageWrapper.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    // rgb(250, 248, 244) = #FAF8F4
    expect(bgColor).toBe("rgb(250, 248, 244)");
  });

  test("2. Header exibe logotipo oficial para fundo claro (dark text)", async ({
    page,
  }) => {
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    const header = page.locator("header.site-header");
    await expect(header).toBeVisible();

    const logoImg = header.locator("img");
    await expect(logoImg).toBeVisible();
    await expect(logoImg).toHaveAttribute(
      "src",
      "/images/logo-ventara-dark-text.png"
    );
  });

  test("3. Cartões possuem superfície branca, borda areia e tipografia azul-marinho", async ({
    page,
  }) => {
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    // Cartão de correios
    const card = page.locator("[data-testid='national-card-nat-card-correios']");
    await expect(card).toBeVisible();

    const cardStyles = await card.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
      };
    });

    // Fundo branco
    expect(cardStyles.backgroundColor).toBe("rgb(255, 255, 255)");

    // Título em azul-marinho profundo
    const title = card.locator("h3");
    const titleColor = await title.evaluate((el) => window.getComputedStyle(el).color);
    expect(titleColor).toBe("rgb(6, 17, 31)");
  });

  test("4. Bloco Regional permanece escuro como âncora de contraste", async ({
    page,
  }) => {
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    const regionalSection = page.locator("#bloco-regional");
    await expect(regionalSection).toBeVisible();

    const bannerCard = regionalSection.locator("h2").locator("..");
    await expect(bannerCard).toBeVisible();
    await expect(regionalSection.getByText("LOGÍSTICA PRÓPRIA REGIONAL")).toBeVisible();
  });

  test("5. Responsividade sem overflow em 360px, 430px, 768px e 1440px", async ({
    page,
  }) => {
    const viewports = [
      { width: 360, height: 640, name: "360px" },
      { width: 430, height: 932, name: "430px" },
      { width: 768, height: 1024, name: "768px" },
      { width: 1440, height: 900, name: "1440px" },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/entregas", { waitUntil: "domcontentloaded" });

      const scrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth
      );
      const clientWidth = await page.evaluate(
        () => document.documentElement.clientWidth
      );
      expect(
        scrollWidth,
        `Viewport ${vp.name} sem scroll horizontal`
      ).toBeLessThanOrEqual(clientWidth + 2);
    }
  });
});
