import { test, expect, Page } from "@playwright/test";

const PRODUCT_ID = "33333333-3333-3333-3333-333333333333";
const PRODUCT = {
  id: PRODUCT_ID, name: "Ventara Foto", slug: "ventara-foto", description: "x", price_in_cents: 38990,
  is_published: true, frame_type: "Grau", frame_shape: "Quadrado", frame_material: "Acetato Premium", gender: "Unissex",
  images: [{ id: "i1", url: "/images/lenses/optisync-box.jpg", is_primary: true, alt_text: "f", sort_order: 0 }],
  variants: [{ id: "var-1", color_name: "Preto", color_hex: "#111111", stock_quantity: 4, is_available: true, sort_order: 0 }],
};

/** Foto grande de verdade (ruído, mais de 5 MB), gerada no navegador. */
async function makeBigJpeg(page: Page): Promise<Buffer> {
  const b64 = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 4200;
    c.height = 3000;
    const ctx = c.getContext("2d")!;
    const img = ctx.createImageData(c.width, c.height);
    for (let i = 0; i < img.data.length; i += 4) {
      img.data[i] = Math.random() * 255;
      img.data[i + 1] = Math.random() * 255;
      img.data[i + 2] = Math.random() * 255;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), "image/jpeg", 0.95));
    const buf = new Uint8Array(await blob.arrayBuffer());
    let s = "";
    for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return btoa(s);
  });
  return Buffer.from(b64, "base64");
}

async function openEdit(page: Page, context: any) {
  await context.addCookies([
    { name: "pw_bypass_token", value: "ventara-playwright-local-bypass-token", url: "http://localhost:3000" },
  ]);
}

test.describe("Admin: envio de foto no produto", () => {
  test("foto grande é reduzida antes de enviar (abaixo do limite da hospedagem) e vai no salvar", async ({ page, context }) => {
    await openEdit(page, context);
    let uploadBytes = 0;
    let patchBody: any = null;

    await page.route("**/api/admin/upload", async (route) => {
      uploadBytes = route.request().postDataBuffer()?.length ?? 0;
      await route.fulfill({ json: { success: true, url: "/images/lenses/optisync-box.jpg?nova=1" } });
    });
    await page.route("**/api/admin/products**", (route) => {
      const req = route.request();
      if (req.method() === "GET") return route.fulfill({ json: { success: true, product: PRODUCT } });
      if (req.method() === "PATCH") {
        patchBody = req.postDataJSON();
        return route.fulfill({ json: { success: true, product: PRODUCT, images_received: 2, images_in_db: 2 } });
      }
      return route.continue();
    });

    await page.goto(`/admin/produtos/${PRODUCT_ID}`);
    await page.addStyleTag({ content: '[aria-label*="Consentimento"]{display:none !important}' });
    const big = await makeBigJpeg(page);
    expect(big.length).toBeGreaterThan(5 * 1024 * 1024);

    await page.locator('input[type="file"]').first().setInputFiles({ name: "foto-celular.jpg", mimeType: "image/jpeg", buffer: big });
    await expect(page.getByText(/Falta clicar em "Salvar"/).first()).toBeVisible({ timeout: 30000 });
    expect(uploadBytes).toBeGreaterThan(0);
    expect(uploadBytes).toBeLessThan(4.2 * 1024 * 1024);

    await page.getByRole("button", { name: /Salvar/ }).first().click();
    await expect.poll(() => patchBody).not.toBeNull();
    expect(patchBody.images).toHaveLength(2);
    expect(patchBody.images[1].url).toContain("nova=1");
    await expect(page.getByText(/Fotos: 2 enviadas, 2 gravadas no banco/).first()).toBeVisible();
  });

  test("servidor recusa a foto (413 em HTML) → aviso claro e em português junto do envio", async ({ page, context }) => {
    await openEdit(page, context);
    await page.route("**/api/admin/upload", (route) =>
      route.fulfill({ status: 413, contentType: "text/plain", body: "Request Entity Too Large" })
    );
    await page.route("**/api/admin/products**", (route) =>
      route.request().method() === "GET" ? route.fulfill({ json: { success: true, product: PRODUCT } }) : route.continue()
    );
    await page.goto(`/admin/produtos/${PRODUCT_ID}`);
    await page.addStyleTag({ content: '[aria-label*="Consentimento"]{display:none !important}' });

    // PNG mínimo válido (pequeno: não passa pela redução)
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );
    await page.locator('input[type="file"]').first().setInputFiles({ name: "pequena.png", mimeType: "image/png", buffer: png });

    const alert = page.getByRole("alert").filter({ hasText: /NÃO foi enviada/ });
    await expect(alert).toBeVisible();
    await expect(alert).toContainText("grande demais");
    await expect(page.getByText(/Unexpected token|not valid JSON/i)).toHaveCount(0);
  });
});
