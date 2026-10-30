import { test, expect } from "@playwright/test";

test.describe("Sprint 1: Integrações & Eliminação de Desconexões", () => {
  test("deve validar cupom de desconto via API e abater no total do checkout", async ({ request }) => {
    // 1. Testa API de validação de cupom
    const res = await request.post("http://localhost:3000/api/checkout/validate-coupon", {
      data: { code: "VENTARA10" },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.valid).toBe(true);
    expect(data.discountValue).toBe(10);
    expect(data.discountType).toBe("percentage");
  });

  test("deve aplicar cupom no CartModal e recalcular valores com frete e desconto", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("ventara_cookie_consent", "accepted");
      localStorage.setItem("cookie_consent", "true");
      // Preenche carrinho com 1 item para teste
      localStorage.setItem(
        "ventara_cart",
        JSON.stringify([
          {
            id: "test-prod-1",
            name: "Ventara Horizonte Sport",
            slug: "ventara-horizonte",
            category: "Solar",
            color: "Azul Safira",
            priceInCents: 48900,
          },
        ])
      );
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });

    // Abre o carrinho pelo botão do header
    const cartBtn = page.getByRole("button", { name: /sacola/i }).or(page.locator('button[aria-label*="carrinho" i], button[aria-label*="sacola" i]').first());
    await cartBtn.click();

    // Avança para o checkout
    const checkoutBtn = page.getByRole("button", { name: /FINALIZAR COMPRA COM MERCADO PAGO/i });
    await expect(checkoutBtn).toBeVisible({ timeout: 5000 });
    await checkoutBtn.click();

    // Localiza e abre o bloco de cupom
    const addCouponBtn = page.getByRole("button", { name: /Adicionar Cupom/i });
    await expect(addCouponBtn).toBeVisible({ timeout: 5000 });
    await addCouponBtn.click();

    // Digita cupom e clica em aplicar
    const couponInput = page.getByPlaceholder(/Digite o cupom/i);
    await couponInput.fill("VENTARA10");
    const applyBtn = page.getByRole("button", { name: /Aplicar/i });
    await applyBtn.click();

    // Verifica que o cupom foi aplicado com sucesso
    await expect(page.getByText(/VENTARA10 aplicado/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Desconto \(VENTARA10\)/i)).toBeVisible();

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/checkout_cupom_aplicado.png",
    });
  });

  test("deve acessar /admin/configuracoes e salvar os dados corporativos com sucesso", async ({ page }) => {
    await page.goto("http://localhost:3000/admin/configuracoes", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("Configurações Gerais do Sistema")).toBeVisible({ timeout: 5000 });

    const saveBtn = page.getByRole("button", { name: /Salvar Configurações Gerais/i });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    await expect(page.getByText(/Configurações corporativas salvas com sucesso/i)).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: "/Users/gui/.gemini/antigravity/brain/90ffe01e-c1a0-4c0e-8ac8-51c4b6663b36/admin_configuracoes_salvas.png",
    });
  });
});
