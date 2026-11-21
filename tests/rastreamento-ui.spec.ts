import { test, expect } from "@playwright/test";

const cfg = {
  meta_pixel_id: "123456789012345",
  meta_test_event_code: "",
  google_ads_id: "",
  google_ga4_id: "",
  meta_enabled: true,
  google_enabled: false,
  has_capi_token: true,
  capi_token_masked: "••••••••9999",
  events: Object.fromEntries(
    ["page_view", "view_content", "add_to_cart", "initiate_checkout", "add_payment_info", "purchase", "lead", "contact"].map((k) => [
      k,
      { meta: k !== "page_view", google: true, google_label: "" },
    ])
  ),
};

test("admin: matriz mostra o que está sendo enviado e salva sem expor o token", async ({ page }) => {
  let putBody: any = null;
  await page.addInitScript(() => localStorage.setItem("ventara_cookie_consent", JSON.stringify({ essential: true, analytics: false, marketing: false })));
  await page.route("**/api/admin/tracking/config", async (route) => {
    if (route.request().method() === "PUT") {
      putBody = route.request().postDataJSON();
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({ json: cfg });
  });
  await page.route("**/api/admin/tracking/events**", (route) =>
    route.fulfill({
      json: {
        period: "1h",
        totals: { sent: 3, failed: 1, skipped: 0 },
        summary: { purchase: { meta: { sent: 2, failed: 1 }, google: { sent: 0, failed: 0 }, last_at: new Date().toISOString() } },
        total_rows: 1,
        rows: [{ id: "1", created_at: new Date().toISOString(), event_key: "purchase", destination: "meta", source: "server", status: "failed", event_id: "purchase_x", value_in_cents: 15000, path: "/", http_status: 400, error: "Invalid OAuth access token" }],
      },
    })
  );

  await page.goto("/admin/marketing");
  await expect(page.getByTestId("marketing-page")).toBeVisible();

  const pvRow = page.getByTestId("event-row-page_view");
  await expect(pvRow).toContainText("Desligado"); // Meta desligado para page_view
  await expect(page.getByTestId("event-row-purchase")).toContainText("Enviando");
  await expect(page.getByTestId("audit-table")).toContainText("Invalid OAuth access token");
  await expect(page.getByTestId("period-7d")).toBeVisible();

  // Google desativado: eventos ligados no Google mostram aviso, não "Enviando"
  await expect(page.getByTestId("event-row-purchase")).toContainText("Google desativado");

  await page.getByTestId("toggle-page_view-meta").click();
  await expect(pvRow).toContainText("Enviando");
  await page.getByTestId("save-tracking").click();
  await expect.poll(() => putBody).not.toBeNull();
  expect(putBody.events.page_view.meta).toBe(true);
  expect(putBody.meta_capi_token).toBe(""); // vazio = manter o token salvo
  expect(JSON.stringify(cfg)).not.toContain("EAAB");
});

test("site: com consentimento dispara page_view conforme a matriz; sem consentimento não envia nada", async ({ page, context }) => {
  const pub = { meta_pixel_id: "123456789012345", google_ads_id: "", google_ga4_id: "", meta_enabled: true, google_enabled: false, capi_ready: true, events: cfg.events };
  await page.route("**/connect.facebook.net/**", (r) => r.fulfill({ body: "", contentType: "text/javascript" }));
  await page.route("**/api/tracking/config", (r) => r.fulfill({ json: { ...pub, events: { ...cfg.events, page_view: { meta: true, google: false, google_label: "" } } } }));

  const events: any[] = [];
  await page.route("**/api/tracking/event", (r) => {
    events.push(r.request().postDataJSON());
    return r.fulfill({ json: { ok: true } });
  });

  // Sem consentimento
  await page.addInitScript(() => localStorage.setItem("ventara_cookie_consent", JSON.stringify({ essential: true, analytics: true, marketing: false })));
  await page.goto("/");
  await page.waitForTimeout(1500);
  expect(events).toHaveLength(0);

  // Com consentimento
  await context.addInitScript(() => localStorage.setItem("ventara_cookie_consent", JSON.stringify({ essential: true, analytics: true, marketing: true })));
  await page.goto("/");
  await expect.poll(() => events.length, { timeout: 8000 }).toBeGreaterThan(0);
  expect(events[0]).toMatchObject({ event_key: "page_view", fired: { meta: true, google: false } });
  expect(events[0].event_id).toMatch(/^page_view_/);
});
