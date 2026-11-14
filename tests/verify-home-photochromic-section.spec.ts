import { test, expect } from "@playwright/test";

test.describe("Home: seção OPTiSYNC HD Fotossensível", () => {
  test("aparece na página inicial com simulador e 3 fases", async ({ page }) => {
    await page.goto("/");
    await page.addStyleTag({ content: '[aria-label*="Consentimento"]{display:none !important}' });

    const section = page.locator("#fotossensivel");
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByRole("heading", { level: 2 })).toContainText("Fotossensível");
    await expect(section.getByText("Transição Óptica Inteligente")).toBeVisible();
    await expect(section.getByText("3 Fases de Luminosidade")).toBeVisible();
    await expect(section.getByAltText(/Três estados da lente fotossensível/i)).toBeVisible();
  });

  test("a página /optisync continua com a mesma seção", async ({ page }) => {
    await page.goto("/optisync");
    const section = page.locator("#linha-fotossensivel");
    await expect(section.getByRole("heading", { level: 2 })).toContainText("Fotossensível");
    await expect(section.getByText("Transição Óptica Inteligente")).toBeVisible();
  });
});
