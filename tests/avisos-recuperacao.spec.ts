import { test, expect } from "@playwright/test";
import { buildRecoveryEmail, buildSaleEmail, notifyOwnerOrder, normalizeSettings, sendRecoveryEmail } from "../lib/notifications";
import { esc, parseEmails, sendEmail } from "../lib/email";
import { cartState, csvCell, markCartsRecovered, parseCapture, sanitizeItems, suppressContact, upsertCart } from "../lib/abandoned-carts";

type Row = Record<string, any>;

/** Banco falso em memória com os filtros usados (eq, is, in, neq, lte, gte, not, limit). */
function fakeDb(seed: Record<string, Row[]> = {}) {
  const tables: Record<string, Row[]> = { notification_settings: [], email_log: [], abandoned_carts: [], cart_suppressions: [], orders: [], ...seed };
  return {
    tables,
    from(name: string) {
      const filters: Array<(r: Row) => boolean> = [];
      let op: "select" | "update" | "delete" | "upsert" = "select";
      let patch: any = null;
      let conflict = "";
      let broken = false;
      const api: any = {
        // Como o Postgres: pedir coluna que não existe em orders derruba a consulta (data = null)
        select: (cols?: string) => ((broken = name === "orders" && /delivery_type/.test(cols || "")), api),
        update: (p: Row) => ((op = "update"), (patch = p), api),
        delete: () => ((op = "delete"), api),
        upsert: (p: Row | Row[], o?: { onConflict?: string }) => ((op = "upsert"), (patch = p), (conflict = o?.onConflict || ""), api),
        insert: async (p: Row | Row[]) => (tables[name].push(...(Array.isArray(p) ? p : [p])), { error: null }),
        eq: (k: string, v: any) => (filters.push((r) => r[k] === v), api),
        neq: (k: string, v: any) => (filters.push((r) => r[k] !== v), api),
        is: (k: string, v: any) => (filters.push((r) => (r[k] ?? null) === v), api),
        in: (k: string, v: any[]) => (filters.push((r) => v.includes(r[k])), api),
        limit: () => api,
        maybeSingle: async () => ({ data: broken ? null : tables[name].filter((r) => filters.every((f) => f(r)))[0] ?? null }),
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
    calls.push({ url: String(url), headers: init.headers, body: JSON.parse(init.body) });
    return new Response("{}", { status: 200 });
  }) as unknown as typeof fetch;

const order = { id: "o-1", reference_code: "VEN-2611-ABCD", customer_name: "Maria <b>Souza</b>", customer_email: "m@x.com", customer_phone: "18999990000", total_in_cents: 45000, payment_method: "pix", delivery_type: "store_pickup", items: [{ product_name: "Ventara Safari", quantity: 1, unit_price_in_cents: 45000 }] };
const sid = "a".repeat(32);

test.describe("Avisos e recuperação de carrinho", () => {
  test.beforeEach(() => { process.env.RESEND_API_KEY = "re_test_key_123456"; });
  test.afterEach(() => { delete process.env.RESEND_API_KEY; });

  test("e-mail escapa HTML do cliente e filtra e-mails inválidos", () => {
    expect(esc("<script>alert(1)</script>")).not.toContain("<script>");
    const e = buildSaleEmail(order, order.items, "paid");
    expect(e.html).not.toContain("<b>Souza</b>");
    expect(e.html).toContain("Maria &lt;b&gt;Souza");
    expect(e.subject).toMatch(/Venda confirmada VEN-2611-ABCD/);
    expect(parseEmails("a@b.com, ruim, A@B.com; c@d.com")).toEqual(["a@b.com", "c@d.com"]);
  });

  test("venda paga: avisa o proprietário uma vez só, mesmo com webhook repetido", async () => {
    const db = fakeDb({ notification_settings: [{ id: "main", owner_emails: "dono@x.com", notify_paid: true }], orders: [order] });
    const calls: any[] = [];
    const f = okFetch(calls);
    await notifyOwnerOrder(db, "o-1", "paid", f);
    await notifyOwnerOrder(db, "o-1", "paid", f);
    expect(calls).toHaveLength(1);
    expect(calls[0].body.to).toEqual(["dono@x.com"]);
    expect(calls[0].headers.Authorization).toBe("Bearer re_test_key_123456");
    expect(db.tables.email_log.filter((l) => l.status === "sent")).toHaveLength(1);
  });

  test("não envia quando desligado, sem destinatário ou sem chave (e registra 'skipped')", async () => {
    const calls: any[] = [];
    const off = fakeDb({ notification_settings: [{ id: "main", owner_emails: "dono@x.com", notify_paid: false }], orders: [order] });
    await notifyOwnerOrder(off, "o-1", "paid", okFetch(calls));
    const none = fakeDb({ notification_settings: [{ id: "main", owner_emails: "", notify_paid: true }], orders: [order] });
    await notifyOwnerOrder(none, "o-1", "paid", okFetch(calls));
    // novo pedido vem desligado por padrão
    const dflt = fakeDb({ notification_settings: [{ id: "main", owner_emails: "dono@x.com" }], orders: [order] });
    await notifyOwnerOrder(dflt, "o-1", "new", okFetch(calls));
    expect(calls).toHaveLength(0);

    delete process.env.RESEND_API_KEY;
    const nokey = fakeDb({ notification_settings: [{ id: "main", owner_emails: "dono@x.com", notify_paid: true }], orders: [order] });
    await notifyOwnerOrder(nokey, "o-1", "paid", okFetch(calls));
    expect(calls).toHaveLength(0);
    expect(nokey.tables.email_log[0]).toMatchObject({ status: "skipped" });
  });

  test("falha do provedor fica registrada sem vazar a chave", async () => {
    const f = (async () => new Response(JSON.stringify({ message: "Invalid key re_test_key_123456" }), { status: 401 })) as unknown as typeof fetch;
    const r = await sendEmail({ to: "a@b.com", subject: "x", html: "<p>x</p>" }, { fetchImpl: f });
    expect(r.ok).toBe(false);
    expect(r.error).not.toContain("re_test_key_123456");
  });

  test("captura exige contato válido, carrinho e sessão; sanitiza itens", () => {
    const item = { id: "p1", name: "Safari", slug: "safari", priceInCents: 45000, quantity: 2, imageUrl: "javascript:alert(1)", extra: "x" };
    expect(parseCapture({ session_id: "curto", email: "a@b.com", items: [item] })).toBeNull();
    expect(parseCapture({ session_id: sid, email: "ruim", phone: "12", items: [item] })).toBeNull();
    expect(parseCapture({ session_id: sid, email: "a@b.com", items: [] })).toBeNull();
    const ok = parseCapture({ session_id: sid, name: "Ana", email: "A@B.com", phone: "(18) 99999-0000", items: [item] })!;
    expect(ok.email).toBe("a@b.com");
    expect(ok.phone).toBe("18999990000");
    expect(ok.items[0].imageUrl).toBeUndefined();
    expect((ok.items[0] as any).extra).toBeUndefined();
    expect(sanitizeItems(Array.from({ length: 50 }, () => item))).toHaveLength(20);
    expect(sanitizeItems([{ id: "x", name: "Preço negativo", priceInCents: -5, quantity: 1 }])).toHaveLength(0);
  });

  test("carrinho: guarda, atualiza pela mesma sessão e respeita quem pediu para sair", async () => {
    const db = fakeDb();
    const cap = parseCapture({ session_id: sid, name: "Ana", email: "ana@x.com", items: [{ id: "p1", name: "Safari", slug: "s", priceInCents: 10000, quantity: 2 }] })!;
    await upsertCart(db, cap);
    await upsertCart(db, { ...cap, name: "Ana Paula" });
    expect(db.tables.abandoned_carts).toHaveLength(1);
    expect(db.tables.abandoned_carts[0]).toMatchObject({ name: "Ana Paula", subtotal_cents: 20000, item_count: 2, consent_marketing: true });

    await suppressContact(db, { email: "ana@x.com", phone: "" });
    expect(db.tables.abandoned_carts[0]).toMatchObject({ status: "unsubscribed", email: null, items: [] });
    // volta a montar carrinho com o mesmo e-mail em outra sessão: não é guardado
    const again = await upsertCart(db, { ...cap, session_id: "b".repeat(32) });
    expect(again.ignored).toBe(true);
    expect(db.tables.abandoned_carts).toHaveLength(1);
  });

  test("compra paga marca o carrinho como recuperado (por pedido, e-mail ou telefone)", async () => {
    const db = fakeDb({ abandoned_carts: [
      { id: "c1", order_id: "o-1", email: null, phone: null, recovered_at: null },
      { id: "c2", order_id: null, email: "m@x.com", phone: null, recovered_at: null },
      { id: "c3", order_id: null, email: "outra@x.com", phone: "18999990000", recovered_at: null },
      { id: "c4", order_id: null, email: "nao@x.com", phone: "11911112222", recovered_at: null },
    ] });
    await markCartsRecovered(db, { id: "o-1", customer_email: "M@X.com", customer_phone: "(18) 99999-0000", total_in_cents: 45000 });
    const byId = (id: string) => db.tables.abandoned_carts.find((c) => c.id === id)!;
    expect(byId("c1").recovered_at).toBeTruthy();
    expect(byId("c2").recovered_at).toBeTruthy();
    expect(byId("c3").recovered_at).toBeTruthy();
    expect(byId("c4").recovered_at).toBeNull();
    expect(byId("c1").recovered_value_cents).toBe(45000);
  });

  test("estado do carrinho e e-mail de recuperação com cupom e link de descadastro", async () => {
    const now = Date.now();
    const iso = (min: number) => new Date(now - min * 60000).toISOString();
    expect(cartState({ status: "open", recovered_at: null, last_activity_at: iso(10) }, now)).toBe("active");
    expect(cartState({ status: "open", recovered_at: null, last_activity_at: iso(90) }, now)).toBe("abandoned");
    expect(cartState({ status: "open", recovered_at: iso(1), last_activity_at: iso(90) }, now)).toBe("recovered");
    expect(cartState({ status: "unsubscribed", recovered_at: null, last_activity_at: iso(90) }, now)).toBe("unsubscribed");

    const token = "f".repeat(64);
    const cart = { id: "c1", token, name: "Ana Paula", email: "ana@x.com", items: [{ name: "Safari", quantity: 1, priceInCents: 45000 }], subtotal_cents: 45000 };
    const e = buildRecoveryEmail(cart, "VOLTA10");
    expect(e.html).toContain("VOLTA10");
    expect(e.html).toContain(`retomar=${token}`);
    expect(e.html).toContain("unsubscribe");

    const db = fakeDb();
    const calls: any[] = [];
    expect(await sendRecoveryEmail(db, cart, "VOLTA10", okFetch(calls))).toBe("sent");
    expect(await sendRecoveryEmail(db, cart, "VOLTA10", okFetch(calls))).toBe("skipped"); // mesma tentativa não repete
    expect(calls).toHaveLength(1);
  });

  test("CSV neutraliza fórmulas e aspas; configurações com limites seguros", () => {
    expect(csvCell("=HYPERLINK(\"x\")")).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvCell("João, Silva")).toBe('"João, Silva"');
    expect(normalizeSettings({ recovery_delay_hours: 500 }).recovery_delay_hours).toBe(2);
    expect(normalizeSettings({}).notify_paid).toBe(true);
    expect(normalizeSettings({}).notify_new_order).toBe(false);
  });
});
