import { test, expect } from "@playwright/test";

async function abrir(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    try { localStorage.setItem("ventara_cookie_consent_v1", JSON.stringify({ essential: true, analytics: false, marketing: false })); } catch {}
  });
  await page.goto("/produto/ventara-safari");
  await expect(page.getByTestId("pdp-main-image")).toBeVisible({ timeout: 20000 });
}

test.describe("PDP: galeria focada no óculos", () => {
  test("etiquetas ficam FORA do bloco da foto", async ({ page }) => {
    await abrir(page);
    const box = page.getByTestId("pdp-gallery-box");
    await expect(page.getByTestId("pdp-gallery-labels")).toBeVisible();
    await expect(page.getByTestId("pdp-gallery-labels")).toContainText(/Armação de Grau|Óculos Solar/);
    await expect(box.getByText(/Armação de Grau|Óculos Solar UV400|Feminino|Masculino|Unissex/)).toHaveCount(0);
    await expect(box.getByText("ÓTICA VENTARA")).toHaveCount(0);
    await expect(box.getByText("Peça Original")).toHaveCount(0);
  });

  test("botões aproximam, a foto pode ser arrastada e o enquadramento original volta", async ({ page }) => {
    await abrir(page);
    const img = page.getByTestId("pdp-main-image");
    const box = page.getByTestId("pdp-gallery-box");
    await expect(img).toHaveAttribute("data-zoom-scale", "1.00");
    await page.getByTestId("pdp-zoom-in").click();
    await expect(img).toHaveAttribute("data-zoom-scale", "2.00");
    await page.getByTestId("pdp-zoom-in").click();
    await expect(img).toHaveAttribute("data-zoom-scale", "2.75");

    const antes = await img.evaluate((e) => (e as HTMLElement).style.transform);
    const b = await box.boundingBox();
    expect(b).not.toBeNull();
    const cx = b!.x + b!.width / 2;
    const cy = b!.y + b!.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 80, cy - 40, { steps: 6 });
    await page.mouse.up();
    const depois = await img.evaluate((e) => (e as HTMLElement).style.transform);
    expect(depois).not.toBe(antes);
    expect(depois).toMatch(/translate\(-?\d/);

    await page.getByTestId("pdp-zoom-reset").click();
    await expect(img).toHaveAttribute("data-zoom-scale", "1.00");
    await expect(page.getByTestId("pdp-zoom-reset")).toHaveCount(0);
  });

  test("não passa de 4x e trocar de foto volta ao enquadramento original", async ({ page }) => {
    await abrir(page);
    const img = page.getByTestId("pdp-main-image");
    for (let i = 0; i < 8; i++) {
      const bt = page.getByTestId("pdp-zoom-in");
      if (await bt.isDisabled()) break;
      await bt.click();
    }
    await expect(img).toHaveAttribute("data-zoom-scale", "4.00");
    const next = page.getByTestId("pdp-gallery-next");
    if (await next.isVisible().catch(() => false)) {
      await next.click();
      await expect(img).toHaveAttribute("data-zoom-scale", "1.00");
    }
  });
});

test.describe("PDP: guia 'Não sabe como usar?'", () => {
  test("oculto no mobile e visível no desktop", async ({ page, isMobile }) => {
    await abrir(page);
    const guia = page.getByTestId("sizing-help-guide-wrapper");
    await expect(guia).toHaveCount(1);
    if (isMobile) {
      await expect(guia).toBeHidden();
      await expect(page.getByText("Não sabe como usar? É simples!")).toBeHidden();
    } else {
      await expect(guia).toBeVisible();
      await expect(page.getByText("Não sabe como usar? É simples!")).toBeVisible();
    }
  });
});
