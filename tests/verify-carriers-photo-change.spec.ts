import { test, expect } from "@playwright/test";

test.describe("Troca e Upload de Fotos dos Operadores Logísticos (/admin/entrega)", () => {
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

  test("1. Seção de Operadores no CMS exibe botões 'Trocar Foto', 'Fotos rápidas' e campo de URL", async ({
    page,
  }) => {
    await page.goto("/admin/entrega", { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    // Expande a seção de Operadores Cadastrados
    const carriersSection = page.getByTestId("cms-accordion-carriers_grid");
    await carriersSection.scrollIntoViewIfNeeded();
    await carriersSection.getByRole("button", { name: /Expandir seção/i }).click();

    // Valida que o cabeçalho e botão de adicionar estão presentes
    await expect(page.getByText(/Operadores Cadastrados/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Adicionar Operador/i })).toBeVisible();

    // Valida que cada operador cadastrado tem preview, botão Trocar Foto e presets
    const changePhotoButtons = page.locator("label:has-text('Trocar Foto')");
    const count = await changePhotoButtons.count();
    expect(count).toBeGreaterThanOrEqual(4);

    // Valida presets rápidos
    const presets = page.getByRole("button", { name: "Van Ventara" });
    await expect(presets.first()).toBeVisible();

    const sedexPreset = page.getByRole("button", { name: "Sedex Correios" });
    await expect(sedexPreset.first()).toBeVisible();

    // Valida campo de URL direta
    const urlInputs = page.locator("input[placeholder*='URL da foto']");
    expect(await urlInputs.count()).toBeGreaterThanOrEqual(4);
  });

  test("2. Endpoint /api/admin/shipping/upload rejeita requisições sem arquivo com 400", async ({
    request,
  }) => {
    const res = await request.post("/api/admin/shipping/upload", {
      multipart: {},
    });
    expect(res.status()).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Nenhum arquivo enviado");
  });

  test("3. Página pública /entregas renderiza a grade de operadores com imagens e nomes", async ({
    page,
  }) => {
    await page.goto("/entregas", { waitUntil: "domcontentloaded" });

    // Valida que a seção de operadores é visível pelo badge ou título
    const badge = page.getByText("Rede Integrada de Despacho").first();
    await badge.scrollIntoViewIfNeeded();
    await expect(badge).toBeVisible();

    // Valida os nomes dos operadores cadastrados
    await expect(page.getByText("Entrega Própria Ventara").first()).toBeVisible();
    await expect(page.getByText("Azul Cargo Express").first()).toBeVisible();
    await expect(page.getByText("Gollog").first()).toBeVisible();
    await expect(page.getByText("Sedex e PAC (Correios)").first()).toBeVisible();

    // Valida que os cartões de operadores contêm as imagens
    const carrierImages = page.locator("img[alt*='Veículo ou serviço logístico']");
    expect(await carrierImages.count()).toBeGreaterThanOrEqual(4);
  });
});
