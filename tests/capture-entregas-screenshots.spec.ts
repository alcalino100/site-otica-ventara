import { test } from "@playwright/test";
import path from "path";

test.describe("Captura de Screenshots Visuais da Página de Entregas", () => {
  test.setTimeout(120000);

  const screenshotsDir = path.resolve(
    "/Users/user/.gemini/antigravity/brain/3307d6a6-ee9f-47b4-bbf9-e090e670f231/screenshots"
  );

  test("Captura múltiplos viewports e admin", async ({ page }) => {
    // 1. 320px (iPhone SE small)
    await page.setViewportSize({ width: 320, height: 600 });
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(screenshotsDir, "entregas-refactor-320x600.png"),
      fullPage: false,
    });

    // 2. 360px (Android)
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(screenshotsDir, "entregas-refactor-360x640.png"),
      fullPage: false,
    });

    // 3. 390px (iPhone 14)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(screenshotsDir, "entregas-refactor-390x844.png"),
      fullPage: false,
    });

    // 4. 430px (iPhone 14 Pro Max)
    await page.setViewportSize({ width: 430, height: 932 });
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(screenshotsDir, "entregas-refactor-430x932.png"),
      fullPage: false,
    });

    // 5. 768px (iPad Retrato)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(screenshotsDir, "entregas-refactor-768x1024.png"),
      fullPage: false,
    });

    // 6. 1024x768 (Paisagem)
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(screenshotsDir, "entregas-refactor-landscape-1024x768.png"),
      fullPage: false,
    });

    // 7. Desktop 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(screenshotsDir, "entregas-refactor-desktop-1440x900.png"),
      fullPage: false,
    });

    // 8. 390px com Fonte Aumentada (125% zoom de acessibilidade)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "20px";
    });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(screenshotsDir, "entregas-refactor-390x844-large-font.png"),
      fullPage: false,
    });

    // 9. Painel Admin com Pré-Visualização ao Vivo
    await page.context().addCookies([
      {
        name: "pw_test_session",
        value: "1",
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/admin/entrega", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(screenshotsDir, "admin-entrega-regional-live-preview.png"),
      fullPage: false,
    });
  });
});
