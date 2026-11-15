import { test, expect } from "@playwright/test";
import { request as pwRequest } from "@playwright/test";

const PRODUCT_ID = "22222222-2222-2222-2222-222222222222";

test.describe("Lentes: catálogo público acessível a visitantes", () => {
  test("visitante (sem login) recebe 401 no admin, mas 200 no catálogo público com lentes ativas", async ({ baseURL }) => {
    // Contexto SEM o token de bypass do admin: é o que o navegador de um visitante faz
    const visitor = await pwRequest.newContext({ baseURL, extraHTTPHeaders: {} });
    const admin = await visitor.get("/api/admin/lenses");
    expect(admin.status()).toBe(401);

    const pub = await visitor.get("/api/lenses");
    expect(pub.status()).toBe(200);
    const body = await pub.json();
    expect(Array.isArray(body.lenses)).toBe(true);
    expect(body.lenses.length).toBeGreaterThan(0);
    expect(body.lenses.every((l: { isActive?: boolean }) => l.isActive !== false)).toBe(true);
    expect(pub.headers()["cache-control"]).toContain("no-store");
    await visitor.dispose();
  });

  test("foto alterada no admin aparece na rota pública", async ({ request, baseURL }) => {
    const current = await (await request.get("/api/admin/lenses")).json();
    const lenses = current.lenses.map((l: any, i: number) =>
      i === 0 ? { ...l, boxImage: "/images/teste-foto-trocada.png", isActive: true } : l
    );
    const save = await request.post("/api/admin/lenses", { data: { lenses } });
    expect(save.ok()).toBeTruthy();

    const visitor = await pwRequest.newContext({ baseURL, extraHTTPHeaders: {} });
    const pub = await (await visitor.get("/api/lenses")).json();
    expect(pub.lenses[0].boxImage).toBe("/images/teste-foto-trocada.png");
    await visitor.dispose();

    // restaura o catálogo original
    await request.post("/api/admin/lenses", { data: { lenses: current.lenses } });
  });
});

test.describe("Cores do produto", () => {
  test("admin: adicionar uma cor envia a lista completa de variações ao salvar", async ({ page, context }) => {
    await context.addCookies([
      { name: "pw_bypass_token", value: "ventara-playwright-local-bypass-token", url: "http://localhost:3000" },
    ]);
    const product = {
      id: PRODUCT_ID, name: "Ventara Cores", slug: "ventara-cores", description: "x", price_in_cents: 38990,
      is_published: true, frame_type: "Grau", frame_shape: "Quadrado", frame_material: "Acetato Premium", gender: "Unissex",
      images: [{ id: "i1", url: "/images/lenses/optisync-box.jpg", is_primary: true, alt_text: "f", sort_order: 0 }],
      variants: [{ id: "var-1", color_name: "Preto", color_hex: "#111111", stock_quantity: 4, is_available: true, sort_order: 0 }],
    };
    let patchBody: any = null;
    await page.route("**/api/admin/products**", (route) => {
      const req = route.request();
      if (req.method() === "GET") return route.fulfill({ json: { success: true, product } });
      if (req.method() === "PATCH") {
        patchBody = req.postDataJSON();
        return route.fulfill({ json: { success: true, product } });
      }
      return route.continue();
    });

    await page.goto(`/admin/produtos/${PRODUCT_ID}`);
    await page.addStyleTag({ content: '[aria-label*="Consentimento"]{display:none !important}' });
    const rows = page.getByTestId("variant-row");
    await expect(rows).toHaveCount(1);

    await page.getByRole("button", { name: /Adicionar cor/ }).click();
    await expect(rows).toHaveCount(2);
    await rows.nth(1).getByPlaceholder("Ex: Preto Fosco").fill("Tartaruga");
    await rows.nth(1).locator('input[type="number"]').fill("7");

    await page.getByRole("button", { name: /Salvar/ }).first().click();
    await expect.poll(() => patchBody).not.toBeNull();
    expect(patchBody.variants).toHaveLength(2);
    expect(patchBody.variants[0]).toMatchObject({ id: "var-1", color_name: "Preto", stock_quantity: 4 });
    expect(patchBody.variants[1]).toMatchObject({ color_name: "Tartaruga", stock_quantity: 7, is_available: true });
    expect(patchBody.variants[1].id).toBeUndefined();
  });

  test("admin: cor sem nome ou repetida é barrada com aviso em português", async ({ page, context }) => {
    await context.addCookies([
      { name: "pw_bypass_token", value: "ventara-playwright-local-bypass-token", url: "http://localhost:3000" },
    ]);
    const product = {
      id: PRODUCT_ID, name: "Ventara Cores", slug: "ventara-cores", description: "x", price_in_cents: 38990,
      is_published: true, frame_type: "Grau", frame_shape: "Quadrado", frame_material: "Acetato Premium", gender: "Unissex",
      images: [{ id: "i1", url: "/images/lenses/optisync-box.jpg", is_primary: true, alt_text: "f", sort_order: 0 }],
      variants: [{ id: "var-1", color_name: "Preto", color_hex: "#111111", stock_quantity: 4, is_available: true, sort_order: 0 }],
    };
    await page.route("**/api/admin/products**", (route) =>
      route.request().method() === "GET" ? route.fulfill({ json: { success: true, product } }) : route.continue()
    );
    await page.goto(`/admin/produtos/${PRODUCT_ID}`);
    await page.addStyleTag({ content: '[aria-label*="Consentimento"]{display:none !important}' });
    await page.getByRole("button", { name: /Adicionar cor/ }).click();
    await page.getByRole("button", { name: /Salvar/ }).first().click();
    await expect(page.getByText(/Dê um nome para cada cor/).first()).toBeVisible();
    await page.getByTestId("variant-row").nth(1).getByPlaceholder("Ex: Preto Fosco").fill("preto");
    await page.getByRole("button", { name: /Salvar/ }).first().click();
    await expect(page.getByText(/duas cores com o mesmo nome/).first()).toBeVisible();
  });

  for (const [label, size] of [["mobile", { width: 390, height: 844 }], ["desktop", { width: 1280, height: 900 }]] as const) {
    test(`${label}: cores em bolinhas com nome ao lado do título`, async ({ page }) => {
      await page.setViewportSize(size);
      await page.goto("/produto/ventara-safari");
      await page.addStyleTag({ content: '[aria-label*="Consentimento"]{display:none !important}' });
      const sel = page.getByTestId("color-selector");
      await expect(sel).toBeVisible();
      await expect(sel.getByText(/Selecione a cor/i)).toBeVisible();
      const swatch = sel.getByRole("radio").first();
      await expect(swatch).toBeVisible();
      const box = await swatch.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(Math.abs(box!.width - box!.height)).toBeLessThan(1);
      // Só um seletor de cor na página (sem versão duplicada escondida)
      await expect(page.getByRole("radiogroup", { name: /Cores disponíveis/ })).toHaveCount(1);
    });
  }

  test("admin: cores prontas (Onça etc.) entram com um clique e seguem no envio", async ({ page, context }) => {
    await context.addCookies([
      { name: "pw_bypass_token", value: "ventara-playwright-local-bypass-token", url: "http://localhost:3000" },
    ]);
    const product = {
      id: PRODUCT_ID, name: "Ventara Cores", slug: "ventara-cores", description: "x", price_in_cents: 38990,
      is_published: true, frame_type: "Grau", frame_shape: "Quadrado", frame_material: "Acetato Premium", gender: "Unissex",
      images: [{ id: "i1", url: "/images/lenses/optisync-box.jpg", is_primary: true, alt_text: "f", sort_order: 0 }],
      variants: [{ id: "var-1", color_name: "Preto", color_hex: "#111111", stock_quantity: 4, is_available: true, sort_order: 0 }],
    };
    let patchBody: any = null;
    await page.route("**/api/admin/products**", (route) => {
      const req = route.request();
      if (req.method() === "GET") return route.fulfill({ json: { success: true, product } });
      if (req.method() === "PATCH") {
        patchBody = req.postDataJSON();
        return route.fulfill({ json: { success: true, product } });
      }
      return route.continue();
    });
    await page.goto(`/admin/produtos/${PRODUCT_ID}`);
    await page.addStyleTag({ content: '[aria-label*="Consentimento"]{display:none !important}' });

    const picker = page.getByTestId("color-preset-picker");
    await expect(picker.getByRole("button", { name: "Onça Claro" })).toBeVisible();
    await expect(picker.getByRole("button", { name: "Onça Escuro" })).toBeVisible();
    await picker.getByRole("button", { name: "Onça Escuro" }).click();
    await picker.getByRole("button", { name: "Onça Claro" }).click();

    const rows = page.getByTestId("variant-row");
    await expect(rows).toHaveCount(3);
    // Já adicionada: botão fica desabilitado (sem duplicar)
    await expect(picker.getByRole("button", { name: "Onça Escuro" })).toBeDisabled();

    await page.getByRole("button", { name: /Salvar/ }).first().click();
    await expect.poll(() => patchBody).not.toBeNull();
    expect(patchBody.variants.map((v: any) => v.color_name)).toEqual(["Preto", "Onça Escuro", "Onça Claro"]);
    expect(patchBody.variants[1].color_hex).toBe("#6b3f17");
  });
});
