import { test, expect } from "@playwright/test";
import {
  dispatchServerEvent,
  dispatchPurchaseForOrder,
  sendMetaCapi,
  redactSecrets,
  hashPhone,
} from "../lib/tracking/server";
import { normalizeConfig, normalizeEvents, toPublicConfig, validateConfigInput } from "../lib/tracking/config";

type Row = Record<string, any>;

/** Banco falso mínimo: tabelas em memória com os filtros usados pelo código. */
function fakeDb(seed: { config?: Row; ctx?: Row } = {}) {
  const tables: Record<string, Row[]> = {
    tracking_config: seed.config ? [{ id: "main", ...seed.config }] : [],
    tracking_events: [],
    tracking_order_context: seed.ctx ? [seed.ctx] : [],
  };
  return {
    tables,
    from(name: string) {
      let rows = tables[name];
      const filters: Array<(r: Row) => boolean> = [];
      const api: any = {
        select: () => api,
        eq: (k: string, v: any) => (filters.push((r) => r[k] === v), api),
        limit: () => api,
        maybeSingle: async () => ({ data: rows.filter((r) => filters.every((f) => f(r)))[0] ?? null }),
        insert: async (x: Row | Row[]) => (rows.push(...(Array.isArray(x) ? x : [x])), { error: null }),
        then: (res: any) => res({ data: rows.filter((r) => filters.every((f) => f(r))) }),
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

const cfgRow = {
  meta_pixel_id: "123456789012345",
  meta_capi_token: "EAAB-secret-token-9999",
  meta_enabled: true,
  events: { purchase: { meta: true, google: true, google_label: "x" } },
};

test.describe("Rastreamento", () => {
  test("config pública nunca expõe o token", () => {
    const pub = toPublicConfig(normalizeConfig(cfgRow));
    expect(JSON.stringify(pub)).not.toContain("EAAB");
    expect(pub.capi_ready).toBe(true);
    expect(pub.meta_enabled).toBe(true);
  });

  test("matriz de eventos: padrão ligado e valores inválidos viram padrão", () => {
    const ev = normalizeEvents({ page_view: { meta: false }, purchase: { google_label: "  AbC  " } });
    expect(ev.page_view.meta).toBe(false);
    expect(ev.purchase.meta).toBe(true);
    expect(ev.purchase.google_label).toBe("AbC");
    expect(Object.keys(ev)).toContain("add_to_cart");
  });

  test("validação de IDs", () => {
    expect(validateConfigInput({ meta_pixel_id: "abc" })).toMatch(/Pixel/);
    expect(validateConfigInput({ google_ads_id: "123" })).toMatch(/Google Ads/);
    expect(validateConfigInput({ meta_pixel_id: "123456789012345", google_ads_id: "AW-1234567890", google_ga4_id: "G-ABCDEF1234" })).toBeNull();
  });

  test("CAPI envia evento com event_id, dados hasheados e sem vazar o token em erro", async () => {
    const calls: any[] = [];
    const r = await sendMetaCapi(normalizeConfig(cfgRow), { eventKey: "purchase", eventId: "purchase_1", value: 150.5, email: "A@b.com", phone: "(18) 99999-0000" }, { fetchImpl: okFetch(calls) });
    expect(r.ok).toBe(true);
    const ev = calls[0].body.data[0];
    expect(ev.event_name).toBe("Purchase");
    expect(ev.event_id).toBe("purchase_1");
    expect(ev.custom_data).toMatchObject({ value: 150.5, currency: "BRL" });
    expect(ev.user_data.em[0]).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(ev)).not.toContain("a@b.com");
    expect(calls[0].body.test_event_code).toBeUndefined();

    const failing = (async () => { throw new Error("boom access_token=EAAB-secret-token-9999 fail"); }) as unknown as typeof fetch;
    const bad = await sendMetaCapi(normalizeConfig(cfgRow), { eventKey: "purchase", eventId: "x1234567" }, { fetchImpl: failing });
    expect(bad.ok).toBe(false);
    expect(bad.error).not.toContain("EAAB-secret");
  });

  test("redactSecrets e hash de telefone com DDI", () => {
    expect(redactSecrets("erro EAAB-xyz-123456", ["EAAB-xyz-123456"])).toBe("erro ***");
    expect(hashPhone("18999990000")).toBe(hashPhone("5518999990000"));
  });

  test("evento de servidor: respeita matriz, audita e não duplica", async () => {
    const db = fakeDb({ config: cfgRow });
    const calls: any[] = [];
    const f = okFetch(calls);
    const a = await dispatchServerEvent(db, { eventKey: "purchase", eventId: "purchase_A", value: 10 }, { fetchImpl: f });
    const b = await dispatchServerEvent(db, { eventKey: "purchase", eventId: "purchase_A", value: 10 }, { fetchImpl: f });
    expect(a.meta).toBe("sent");
    expect(b.meta).toBe("skipped");
    expect(calls).toHaveLength(1);
    expect(db.tables.tracking_events).toHaveLength(1);
    expect(db.tables.tracking_events[0]).toMatchObject({ event_key: "purchase", destination: "meta", source: "server", status: "sent", value_in_cents: 1000 });
  });

  test("evento desligado na matriz ou Meta desativada não envia", async () => {
    const calls: any[] = [];
    const off = fakeDb({ config: { ...cfgRow, events: { purchase: { meta: false } } } });
    expect((await dispatchServerEvent(off, { eventKey: "purchase", eventId: "purchase_B" }, { fetchImpl: okFetch(calls) })).meta).toBe("skipped");
    const disabled = fakeDb({ config: { ...cfgRow, meta_enabled: false } });
    expect((await dispatchServerEvent(disabled, { eventKey: "purchase", eventId: "purchase_C" }, { fetchImpl: okFetch(calls) })).meta).toBe("skipped");
    expect(calls).toHaveLength(0);
  });

  test("falha da Meta fica registrada como failed", async () => {
    const db = fakeDb({ config: cfgRow });
    const f = (async () => new Response(JSON.stringify({ error: { message: "Invalid OAuth access token" } }), { status: 400 })) as unknown as typeof fetch;
    const r = await dispatchServerEvent(db, { eventKey: "purchase", eventId: "purchase_D" }, { fetchImpl: f });
    expect(r.meta).toBe("failed");
    expect(db.tables.tracking_events[0]).toMatchObject({ status: "failed", http_status: 400 });
  });

  test("compra do pedido só vai à Meta com consentimento de marketing", async () => {
    const calls: any[] = [];
    const order = { id: "o-1", total_in_cents: 25000, customer_email: "x@y.com", customer_phone: "18999990000" };
    const sem = fakeDb({ config: cfgRow, ctx: { order_id: "o-1", marketing_consent: false } });
    expect((await dispatchPurchaseForOrder(sem, order, { fetchImpl: okFetch(calls) })).meta).toBe("skipped");
    const com = fakeDb({ config: cfgRow, ctx: { order_id: "o-1", marketing_consent: true, fbp: "fb.1.1.2" } });
    expect((await dispatchPurchaseForOrder(com, order, { fetchImpl: okFetch(calls) })).meta).toBe("sent");
    expect(calls).toHaveLength(1);
    expect(calls[0].body.data[0]).toMatchObject({ event_id: "purchase_o-1" });
    expect(calls[0].body.data[0].custom_data.value).toBe(250);
  });
});
