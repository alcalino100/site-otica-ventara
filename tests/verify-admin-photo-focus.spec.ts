import { test, expect } from "@playwright/test";

const PRODUCT_ID = "11111111-1111-1111-1111-111111111111";
const PHOTO_URL = "http://localhost:3000/__foto-retrato-teste.svg";

// Foto de teste retrato (3:4): sobra altura dentro do card, então dá para arrastar na vertical
const PHOTO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1600" viewBox="0 0 1200 1600">
  <rect width="1200" height="1600" fill="#d8cdb0"/>
  <rect x="250" y="330" width="270" height="170" rx="60" fill="none" stroke="#0a5a46" stroke-width="26"/>
  <rect x="600" y="330" width="270" height="170" rx="60" fill="none" stroke="#0a5a46" stroke-width="26"/>
</svg>`;

const PRODUCT = {
  id: PRODUCT_ID,
  name: "Ventara Esmeralda",
  slug: "ventara-esmeralda",
  description: "Armação de teste",
  price_in_cents: 38990,
  is_published: true,
  frame_type: "Grau",
  frame_shape: "Quadrado",
  frame_material: "Acetato Premium",
  gender: "Unissex",
  images: [
    { id: "img-1", url: PHOTO_URL, is_primary: true, alt_text: "Foto 1", sort_order: 0, focus_x: null, focus_y: null },
  ],
  variants: [{ color_name: "Verde", stock_quantity: 5 }],
};

test.describe("Admin: ajuste da posição da foto da armação", () => {
  test("arrasta a foto, aplica e envia focus_x/focus_y ao salvar", async ({ page, context }) => {
    await context.addCookies([
      { name: "pw_bypass_token", value: "ventara-playwright-local-bypass-token", url: "http://localhost:3000" },
    ]);

    let savedBody: any = null;
    await page.route("**/__foto-retrato-teste.svg", (route) =>
      route.fulfill({ status: 200, contentType: "image/svg+xml", body: PHOTO_SVG })
    );
    await page.route(`**/api/admin/products?id=${PRODUCT_ID}`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, product: PRODUCT }) })
    );
    await page.route("**/api/admin/products", async (route) => {
      if (route.request().method() === "PATCH") {
        savedBody = JSON.parse(route.request().postData() || "{}");
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, product: PRODUCT }) });
      }
      return route.continue();
    });

    await page.goto(`/admin/produtos/${PRODUCT_ID}`);
    await page.addStyleTag({ content: '[aria-label*="Consentimento"]{display:none !important}' });

    await page.getByRole("button", { name: /Ajustar posição/ }).click();
    const dialog = page.getByRole("dialog", { name: /Ajustar posição da foto/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("No celular", { exact: true })).toBeVisible();
    await expect(dialog.getByText("No computador", { exact: true })).toBeVisible();

    // Arrasta a foto para baixo dentro da moldura do celular: revela a parte de cima (posição vertical diminui)
    const frame = dialog.getByRole("group").first();
    const box = await frame.boundingBox();
    expect(box).not.toBeNull();
    const cx = box!.x + box!.width / 2;
    const cy = box!.y + box!.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx, cy + 40, { steps: 6 });
    await page.mouse.up();

    const readout = dialog.locator("p[aria-live='polite']");
    await expect(readout).toContainText("50% horizontal");
    await expect(readout).not.toContainText("50% vertical");

    await dialog.getByRole("button", { name: "Aplicar posição" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: /Posição ajustada/ })).toBeVisible();

    await page.getByRole("button", { name: /Salvar/ }).first().click();
    await expect.poll(() => savedBody?.images?.[0]?.focus_y).toBeLessThan(50);
    expect(savedBody.images[0].focus_x).toBe(50);
  });

  test("teclado: setas movem a foto e 'Voltar ao automático' limpa o ajuste", async ({ page, context }) => {
    await context.addCookies([
      { name: "pw_bypass_token", value: "ventara-playwright-local-bypass-token", url: "http://localhost:3000" },
    ]);
    await page.route("**/__foto-retrato-teste.svg", (route) =>
      route.fulfill({ status: 200, contentType: "image/svg+xml", body: PHOTO_SVG })
    );
    await page.route(`**/api/admin/products?id=${PRODUCT_ID}`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, product: PRODUCT }) })
    );

    await page.goto(`/admin/produtos/${PRODUCT_ID}`);
    await page.addStyleTag({ content: '[aria-label*="Consentimento"]{display:none !important}' });
    await page.getByRole("button", { name: /Ajustar posição/ }).click();

    const dialog = page.getByRole("dialog", { name: /Ajustar posição da foto/ });
    const frame = dialog.getByRole("group").first();
    await frame.focus();
    await page.keyboard.press("ArrowDown"); // a foto anda para baixo => posição vertical diminui
    await expect(dialog.locator("p[aria-live='polite']")).toContainText("48% vertical");

    await dialog.getByRole("button", { name: /Voltar ao automático/ }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: /Ajustar posição/ })).toBeVisible();
  });
});
