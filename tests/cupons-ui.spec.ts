import { test, expect } from "@playwright/test";

const coupon = (o: any) => ({ id: o.code, description: null, discount_type: "percentage", discount_value: 10, max_discount_cents: null, min_order_cents: 0, starts_at: null, expires_at: null, max_uses_total: null, max_uses_per_customer: 1, active: true, used: 0, confirmed: 0, discount_total_cents: 0, status: "active", ...o });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ventara_cookie_consent", JSON.stringify({ essential: true, analytics: false, marketing: false })));
});

test("admin: lista status, bloqueia cupom sem limite e cria com limite", async ({ page }) => {
  let posted: any = null;
  await page.route("**/api/admin/coupons**", async (route) => {
    const req = route.request();
    if (req.method() === "POST") {
      posted = req.postDataJSON();
      if (!posted.expires_at && !posted.max_uses_total) return route.fulfill({ status: 400, json: { error: "Defina uma validade ou um limite total de usos. Cupom sem nenhum limite não é permitido." } });
      return route.fulfill({ json: { ok: true } });
    }
    if (req.url().includes("history=1")) return route.fulfill({ json: { rows: [{ id: "1", created_at: new Date().toISOString(), reference_code: "VEN-2611-ABC123", customer_email: "j***@gmail.com", customer_phone: "***0000", discount_in_cents: 3000, status: "confirmed" }] } });
    return route.fulfill({ json: { coupons: [
      coupon({ code: "BLACK20", discount_value: 20, max_uses_total: 50, used: 50, confirmed: 40, discount_total_cents: 120000, status: "exhausted", expires_at: "2099-01-01T00:00:00Z" }),
      coupon({ code: "PAUSADO10", active: false, status: "paused", used: 2, confirmed: 1 }),
      coupon({ code: "NOVO10", expires_at: "2099-01-01T00:00:00Z" }),
    ] } });
  });

  await page.goto("/admin/cupons");
  await expect(page.getByTestId("coupon-row-BLACK20")).toContainText("Esgotado");
  await expect(page.getByTestId("coupon-row-BLACK20")).toContainText("50 / 50");
  await expect(page.getByTestId("coupon-row-PAUSADO10")).toContainText("Pausado");
  // só cupom nunca usado pode ser excluído
  await expect(page.getByRole("button", { name: "Excluir NOVO10" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Excluir BLACK20" })).toHaveCount(0);

  // histórico mascarado
  await page.getByRole("button", { name: "Histórico de BLACK20" }).click();
  await expect(page.getByTestId("history-table")).toContainText("j***@gmail.com");
  await page.getByRole("button", { name: "Fechar" }).click();

  // novo cupom sem nenhum limite -> servidor recusa e a mensagem aparece
  await page.getByTestId("new-coupon").click();
  await page.getByTestId("f-expires").fill("");
  await page.getByTestId("save-coupon").click();
  await expect(page.getByTestId("form-error")).toContainText("limite");

  // com limite total -> cria
  await page.getByTestId("f-total").fill("30");
  await page.getByTestId("save-coupon").click();
  await expect(page.getByTestId("form-error")).toHaveCount(0);
  expect(posted.max_uses_total).toBe(30);
  expect(posted.max_uses_per_customer).toBe(1);
});
