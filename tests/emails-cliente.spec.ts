import { test, expect } from "@playwright/test";
import { attachItemImages, buildCustomerEmail, notifyCustomerOrder, sampleCustomerOrder } from "../lib/customer-emails";
import { normalizeSettings } from "../lib/notifications";

type Row = Record<string, any>;

/** Banco falso em memória com os filtros usados (eq, is, in, neq, lte, gte, not, limit). */
function fakeDb(seed: Record<string, Row[]> = {}) {
  const tables: Record<string, Row[]> = { notification_settings: [], email_log: [], abandoned_carts: [], cart_suppressions: [], orders: [], product_images: [], ...seed };
  return {
    tables,
    from(name: string) {
      const filters: Array<(r: Row) => boolean> = [];
      let op: "select" | "update" | "delete" | "upsert" = "select";
      let patch: any = null;
      let conflict = "";
      const api: any = {
        select: () => api,
        update: (p: Row) => ((op = "update"), (patch = p), api),
        delete: () => ((op = "delete"), api),
        upsert: (p: Row | Row[], o?: { onConflict?: string }) => ((op = "upsert"), (patch = p), (conflict = o?.onConflict || ""), api),
        insert: async (p: Row | Row[]) => (tables[name].push(...(Array.isArray(p) ? p : [p])), { error: null }),
        eq: (k: string, v: any) => (filters.push((r) => r[k] === v), api),
        neq: (k: string, v: any) => (filters.push((r) => r[k] !== v), api),
        is: (k: string, v: any) => (filters.push((r) => (r[k] ?? null) === v), api),
        in: (k: string, v: any[]) => (filters.push((r) => v.includes(r[k])), api),
        limit: () => api,
        maybeSingle: async () => ({ data: tables[name].filter((r) => filters.every((f) => f(r)))[0] ?? null }),
        then: (res: any) => {
          const hit = tables[name].filter((r) => filters.every((f) => f(r)));
          if (op === "update") hit.forEach((r) => Object.assign(r, patch));
          if (op === "delete") tables[name] = tables[name].filter((r) => !hit.includes(r));
          if (op === "upsert") {
            for (const p of Array.isArray(patch) ? patch : [patch]) {
              const keys = conflict.split(",");
              const ex = tables[name].find((r) => keys.every((k) => r[k] === p[k]));
              if (ex) Object.assign(ex, p);
              else tables[name].push({ ...p });
            }
          }
          return res({ data: hit, error: null });
        },
      };
      return api;
    },
  };
}


const okFetch = (calls: any[]) =>
  (async (url: any, init: any) => {
    calls.push({ url: String(url), body: JSON.parse(init.body) });
    return new Response("{}", { status: 200 });
  }) as unknown as typeof fetch;

const order = { id: "o-1", reference_code: "VEN-2611-ABCD", customer_name: "Maria <b>Souza</b>", customer_email: "cli@x.com", total_in_cents: 45000, payment_method: "pix", delivery_type: "delivery", items: [{ product_name: "Ventara Safari", quantity: 1, unit_price_in_cents: 45000 }] };
const on = (k: string) => [{ id: "main", [k]: true }];

test.describe("E-mails ao cliente", () => {
  test.beforeEach(() => { process.env.RESEND_API_KEY = "re_test_key_123456"; });

  test("visual: logo, cores do site e foto do item", async () => {
  const html = buildCustomerEmail("paid", { ...order, items: [{ product_name: "Safari", quantity: 1, unit_price_in_cents: 45000, image_url: "/images/products/x.jpg" }, { product_name: "Sem foto", quantity: 1, unit_price_in_cents: 100, image_url: "javascript:alert(1)" }] }).html;
  expect(html).toContain("/images/logo-ventara.png");
  expect(html).toContain("#06111f");
  expect(html).toContain("#ffd62e");
  expect(html).toContain("/images/products/x.jpg");
  expect(html).not.toContain("javascript:");
});

test("busca a foto principal do produto", async () => {
  const db = fakeDb({ product_images: [{ product_id: "p1", url: "https://cdn/b.jpg", is_primary: false, sort_order: 0 }, { product_id: "p1", url: "https://cdn/a.jpg", is_primary: true, sort_order: 5 }] });
  const out = await attachItemImages(db, [{ product_id: "p1", product_name: "A" }, { product_id: null, product_name: "B" }]);
  expect(out[0].image_url).toBe("https://cdn/a.jpg");
  expect(out[1].image_url).toBeFalsy();
});

test("padrão é tudo desligado", () => {
    const s = normalizeSettings({});
    expect([s.customer_paid, s.customer_unpaid, s.customer_shipped]).toEqual([false, false, false]);
  });

  test("conteúdo dos 3 modelos, escapando HTML", () => {
    const paid = buildCustomerEmail("paid", order);
    expect(paid.subject).toContain("VEN-2611-ABCD");
    expect(paid.html).toContain("Olá, Maria");
    expect(paid.html).not.toContain("<b>Souza");
    expect(paid.html).toContain("R$");
    expect(buildCustomerEmail("unpaid", order).html).toContain("não foi concluído");
    expect(buildCustomerEmail("shipped", order).subject).toContain("despachado");
    expect(buildCustomerEmail("shipped", { ...order, delivery_type: "store_pickup" }).subject).toContain("retirada");
    expect(sampleCustomerOrder().items?.length).toBeGreaterThan(0);
  });

  test("desligado não envia; ligado envia uma vez só", async () => {
    const calls: any[] = [];
    const off = fakeDb({ orders: [order] });
    await notifyCustomerOrder(off, "o-1", "paid", okFetch(calls));
    expect(calls.length).toBe(0);

    const db = fakeDb({ orders: [order], notification_settings: on("customer_paid") });
    await notifyCustomerOrder(db, "o-1", "paid", okFetch(calls));
    await notifyCustomerOrder(db, "o-1", "paid", okFetch(calls)); // webhook repetido
    expect(calls.length).toBe(1);
    expect(calls[0].body.to).toEqual(["cli@x.com"]);
    expect(db.tables.email_log.filter((l) => l.kind === "customer_paid" && l.status === "sent").length).toBe(1);
  });

  test("sem e-mail do cliente ou e-mail inválido não envia", async () => {
    const calls: any[] = [];
    const db = fakeDb({ orders: [{ ...order, customer_email: "" }, { ...order, id: "o-2", customer_email: "xx" }], notification_settings: on("customer_shipped") });
    await notifyCustomerOrder(db, "o-1", "shipped", okFetch(calls));
    await notifyCustomerOrder(db, "o-2", "shipped", okFetch(calls));
    expect(calls.length).toBe(0);
  });

  test("falha do provedor não lança erro e fica registrada", async () => {
    const db = fakeDb({ orders: [order], notification_settings: on("customer_unpaid") });
    const bad = (async () => new Response(JSON.stringify({ message: "boom" }), { status: 500 })) as unknown as typeof fetch;
    await notifyCustomerOrder(db, "o-1", "unpaid", bad);
    expect(db.tables.email_log[0].status).toBe("failed");
  });
});

test("admin: prévia dos e-mails ao cliente e chave começa desligada", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ventara_cookie_consent", JSON.stringify({ necessary: true, analytics: false, marketing: false })));
  const settings = { owner_emails: "dono@x.com", notify_paid: true, notify_new_order: false, recovery_enabled: false, recovery_delay_hours: 2, recovery_coupon_code: "", customer_paid: false, customer_unpaid: false, customer_shipped: false };
  await page.route("**/api/admin/recovery**", async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("preview")) return route.fulfill({ json: { subject: "Pagamento confirmado — pedido VEN-EXEMPLO", html: "<p>Olá, Maria!</p>" } });
    return route.fulfill({ json: { stats: { abandoned: 0, abandoned_value_cents: 0, recovered: 0, recovered_value_cents: 0, reachable: 0 }, carts: [], settings, email_configured: true, cron_configured: true, email_log: [] } });
  });
  await page.goto("/admin/recuperacao");
  await expect(page.getByTestId("customer-emails")).toBeVisible();
  await expect(page.getByTestId("toggle-customer-paid")).toBeVisible();
  await page.getByTestId("preview-paid").click();
  await expect(page.getByText("Pagamento confirmado — pedido VEN-EXEMPLO")).toBeVisible();
  await expect(page.frameLocator('[data-testid="preview-frame"]').getByText("Olá, Maria!")).toBeVisible();
});
