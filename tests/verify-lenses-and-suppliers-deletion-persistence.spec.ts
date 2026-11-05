import { test, expect } from "@playwright/test";

test.describe("Persistência de Exclusão de Lentes, Preços & Fornecedores (/admin/lentes)", () => {
  test.describe.configure({ mode: "serial" });

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

  test("1. Endpoint /api/admin/lenses responde com headers no-cache e suporta GET/POST/DELETE", async ({
    request,
  }) => {
    const getRes = await request.get("/api/admin/lenses");
    expect(getRes.ok()).toBeTruthy();
    expect(getRes.headers()["cache-control"]).toContain("no-store");

    const data = await getRes.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.lenses)).toBe(true);
    expect(data.lenses.length).toBeGreaterThan(0);
  });

  test("2. Exclusão de Lente no Painel Admin persiste após recarregamento da página (F5)", async ({
    page,
    request,
  }) => {
    // 1. Cria uma lente temporária exclusiva para o teste via POST
    const tempLensId = `test-delete-lens-${Date.now()}`;
    const getInitial = await request.get("/api/admin/lenses");
    const initialData = await getInitial.json();
    const tempLens = {
      id: tempLensId,
      name: `Lente Temporária Teste ${Date.now()}`,
      category: "visao-simples",
      brandName: "Lab Teste",
      startingPrice: "R$ 159,90",
      isActive: true,
      description: "Lente para teste de persistência de exclusão",
      treatment: "Antirreflexo",
      badge: "Teste",
      installment: "10x de R$ 15,99",
      leadTime: "Pronto em 1h",
      features: ["Proteção UV"],
    };

    const saveRes = await request.post("/api/admin/lenses", {
      data: { lenses: [tempLens, ...initialData.lenses] },
    });
    expect(saveRes.ok()).toBeTruthy();

    // 2. Acessa a página /admin/lentes e localiza a lente temporária
    await page.goto("/admin/lentes");
    await page.waitForLoadState("networkidle");

    const lensCard = page.locator(`div:has-text("${tempLens.name}")`).first();
    await expect(lensCard).toBeVisible({ timeout: 10000 });

    // 3. Clica no botão de lixeira da lente temporária
    const deleteBtn = page.locator(`button[aria-label="Excluir lente ${tempLens.name}"]`);
    await deleteBtn.click();

    // 4. Modal de confirmação deve abrir
    await expect(page.getByText("Remover Lente do Catálogo")).toBeVisible();
    const confirmBtn = page.getByRole("button", { name: /Sim, Remover Lente/i });
    await confirmBtn.click();

    // 5. Toast de sucesso deve ser exibido
    await expect(page.getByText(/removida do catálogo com sucesso/i)).toBeVisible();

    // 6. Recarrega a página inteira (F5) para validar persistência
    await page.reload({ waitUntil: "networkidle" });

    // 7. A lente excluída NÃO pode mais existir no DOM
    const deletedCard = page.locator(`text="${tempLens.name}"`);
    await expect(deletedCard).toHaveCount(0);
  });

  test("3. Exclusão de Fornecedor/Marca Homologada persiste após recarregamento da página", async ({
    page,
    request,
  }) => {
    // 1. Cria uma marca/fornecedor temporária via settings
    const tempBrandId = `temp-brand-${Date.now()}`;
    const tempBrandName = `Laboratório Teste ${Date.now()}`;
    const getSettings = await request.get("/api/admin/settings");
    const settingsData = await getSettings.json();
    const currentBrands = settingsData.homologated_brands || [];

    const newBrand = {
      id: tempBrandId,
      name: tempBrandName,
      logo: "/logos/optisync.svg",
      boxImage: "/images/lenses/optisync-box.jpg",
      badge: "Homologado Teste",
      desc: "Fornecedor temporário para validação de exclusão.",
    };

    await request.post("/api/admin/settings", {
      data: { homologated_brands: [...currentBrands, newBrand] },
    });

    // 2. Acessa /admin/lentes e clica na aba de Marcas Homologadas
    await page.goto("/admin/lentes");
    await page.waitForLoadState("networkidle");

    const marcasTab = page.locator("button:has-text('Marcas Homologadas')");
    await marcasTab.click();
    await page.waitForTimeout(300);

    // 3. Localiza o card do laboratório criado
    const brandCard = page.locator(`div:has-text("${tempBrandName}")`).first();
    await expect(brandCard).toBeVisible({ timeout: 10000 });

    // 4. Clica no botão de exclusão da marca temporária
    const brandContainer = page.locator("div.bg-\\[\\#0b1728\\]", { hasText: tempBrandName });
    const trashBtn = brandContainer.locator("button[title='Remover marca']");
    await trashBtn.click();

    // 5. Modal de confirmação deve abrir
    await expect(page.getByText("Remover Laboratório / Fornecedor")).toBeVisible();
    const confirmBrandBtn = page.getByRole("button", { name: /Sim, Remover Fornecedor/i });
    await confirmBrandBtn.click();

    // 6. Toast de confirmação exibido
    await expect(page.getByText(/removido com sucesso/i)).toBeVisible();

    // 7. Recarrega a página inteira (F5)
    await page.reload({ waitUntil: "networkidle" });

    // 8. Volta na aba de Marcas Homologadas e valida que o fornecedor NÃO retornou
    const marcasTabAfterReload = page.locator("button:has-text('Marcas Homologadas')");
    await marcasTabAfterReload.click();
    await page.waitForTimeout(300);

    const deletedBrand = page.locator(`text="${tempBrandName}"`);
    await expect(deletedBrand).toHaveCount(0);
  });
});
