import { test, expect } from "@playwright/test";

const consent = (marketing: boolean) => ({ necessary: true, analytics: true, marketing, timestamp: Date.now() });

test("cron recusa chamadas sem o segredo", async ({ request }) => {
  const r = await request.get("/api/cron/abandoned-carts");
  expect(r.status()).toBe(401);
  const r2 = await request.get("/api/cron/abandoned-carts", { headers: { authorization: "Bearer errado" } });
  expect(r2.status()).toBe(401);
});

test("descadastro e retomada com token inválido não quebram", async ({ request }) => {
  expect((await request.get("/api/cart-recovery/restore?token=abc")).status()).toBe(400);
  const u = await request.get("/api/cart-recovery/unsubscribe?token=abc");
  expect(await u.text()).toContain("Link inválido");
  expect((await request.post("/api/cart-recovery/capture", { data: { session_id: "x" } })).status()).toBe(400);
});

async function openCheckoutForm(page: import("@playwright/test").Page) {
  await page.goto("/produto/ventara-safari");
  await page.locator("button:has-text('Adicionar ao Carrinho')").first().click();
  const drawer = page.locator("aside[aria-label='Sua seleção de armações e pagamento']");
  await expect(drawer).toBeVisible();
  await drawer.locator("button:has-text('FINALIZAR COMPRA')").click();
  return drawer;
}

test("carrinho: com consentimento guarda o carrinho ao informar contato; 'Não quero lembretes' apaga e bloqueia", async ({ page }) => {
  await page.addInitScript((c) => { localStorage.setItem("ventara_cookie_consent", JSON.stringify(c)); localStorage.removeItem("ventara_cart_items_v2"); localStorage.removeItem("ventara_cart_optout"); }, consent(true));
  const captured: any[] = [];
  const optouts: any[] = [];
  await page.route("**/api/cart-recovery/capture", (r) => { captured.push(r.request().postDataJSON()); return r.fulfill({ json: { ok: true } }); });
  await page.route("**/api/cart-recovery/optout", (r) => { optouts.push(r.request().postDataJSON()); return r.fulfill({ json: { ok: true } }); });

  const drawer = await openCheckoutForm(page);
  await drawer.getByPlaceholder("seu@email.com").fill("ana@example.com");
  await expect.poll(() => captured.length, { timeout: 8000 }).toBeGreaterThan(0);
  expect(captured[0]).toMatchObject({ email: "ana@example.com" });
  expect(captured[0].session_id).toMatch(/^[A-Za-z0-9_-]{16,64}$/);
  expect(captured[0].items[0].name).toContain("VENTARA SAFARI");

  await expect(drawer.getByTestId("reminder-note")).toContainText("lembrar");
  await drawer.getByRole("button", { name: "Não quero lembretes" }).click();
  await expect.poll(() => optouts.length).toBe(1);
  await expect(drawer.getByTestId("reminder-note")).toContainText("não vamos enviar lembretes");

  // depois de sair, mudar o e-mail não guarda mais nada
  const before = captured.length;
  await drawer.getByPlaceholder("seu@email.com").fill("outro@example.com");
  await page.waitForTimeout(3500);
  expect(captured.length).toBe(before);
});

test("carrinho: sem consentimento de marketing nada é guardado", async ({ page }) => {
  await page.addInitScript((c) => { localStorage.setItem("ventara_cookie_consent", JSON.stringify(c)); localStorage.removeItem("ventara_cart_items_v2"); localStorage.removeItem("ventara_cart_optout"); }, consent(false));
  let calls = 0;
  await page.route("**/api/cart-recovery/capture", (r) => { calls++; return r.fulfill({ json: { ok: true } }); });
  const drawer = await openCheckoutForm(page);
  await drawer.getByPlaceholder("seu@email.com").fill("ana@example.com");
  await page.waitForTimeout(3500);
  expect(calls).toBe(0);
});

test("e-mail de recuperação: link ?retomar= devolve o carrinho e abre a sacola", async ({ page }) => {
  await page.addInitScript((c) => { localStorage.setItem("ventara_cookie_consent", JSON.stringify(c)); localStorage.removeItem("ventara_cart_items_v2"); }, consent(false));
  const token = "e".repeat(64);
  await page.route("**/api/cart-recovery/restore**", (r) => r.fulfill({ json: { items: [{ id: "p1", productId: "p1", name: "VENTARA RETOMADO", slug: "ventara-safari", category: "Solar", color: "Preto", priceInCents: 45000, quantity: 1 }] } }));
  await page.goto(`/?retomar=${token}`);
  const drawer = page.locator("aside[aria-label='Sua seleção de armações e pagamento']");
  await expect(drawer).toBeVisible({ timeout: 8000 });
  await expect(drawer).toContainText("VENTARA RETOMADO");
  expect(page.url()).not.toContain("retomar");
});

test("admin: lista abandonados com WhatsApp pronto, avisa se e-mail não está conectado e salva configurações", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ventara_cookie_consent", JSON.stringify({ necessary: true, analytics: false, marketing: false })));
  let put: any = null;
  const settings = { owner_emails: "", notify_paid: true, notify_new_order: false, recovery_enabled: false, recovery_delay_hours: 2, recovery_coupon_code: "" };
  await page.route("**/api/admin/recovery**", async (route) => {
    const req = route.request();
    if (req.method() === "PUT") { put = req.postDataJSON(); return route.fulfill({ json: { ok: true } }); }
    return route.fulfill({ json: {
      stats: { abandoned: 1, abandoned_value_cents: 45000, recovered: 2, recovered_value_cents: 90000, reachable: 1 },
      carts: [{ id: "c1", token: "t".repeat(64), name: "Maria Souza", email: "maria@x.com", phone: "18999990000", items: [{ name: "Ventara Safari", quantity: 1, priceInCents: 45000 }], item_count: 1, subtotal_cents: 45000, status: "open", contacted_at: null, recovery_email_sent_at: null, recovered_at: null, recovered_value_cents: null, last_activity_at: new Date(Date.now() - 3 * 3600000).toISOString(), state: "abandoned" }],
      settings, email_configured: false, cron_configured: false, email_log: [],
    } });
  });
  await page.goto("/admin/recuperacao");
  await expect(page.getByTestId("stat-abandoned")).toHaveText("1");
  await expect(page.getByTestId("email-warning")).toContainText("RESEND_API_KEY");
  const cart = page.getByTestId("cart-c1");
  await expect(cart).toContainText("Maria Souza");
  await expect(cart).toContainText("há 3 h");
  const wa = await cart.getByRole("link", { name: /WhatsApp para Maria/ }).getAttribute("href");
  expect(wa).toContain("https://wa.me/5518999990000");
  expect(decodeURIComponent(wa!)).toContain("Ventara Safari");
  expect(decodeURIComponent(wa!)).toContain("?retomar=" + "t".repeat(64));
  await expect(cart.getByRole("button", { name: /Enviar e-mail/ })).toBeDisabled();

  await page.getByTestId("owner-emails").fill("dono@oticasventara.com.br");
  await page.getByTestId("toggle-new").click();
  await page.getByTestId("save-settings").click();
  await expect.poll(() => put).not.toBeNull();
  expect(put).toMatchObject({ owner_emails: "dono@oticasventara.com.br", notify_paid: true, notify_new_order: true });
});
