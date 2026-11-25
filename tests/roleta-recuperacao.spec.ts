import { test, expect } from "@playwright/test";
import { PromotionService, __setWheelDbForTests } from "../lib/promotions/promotion-service";

type Row = Record<string, any>;

/** Banco falso mínimo (leads, cupons, consentimentos, pedidos) com o join `lead:promotion_leads(...)`. */
function fakeDb() {
  const t: Record<string, Row[]> = { promotion_leads: [], promotion_coupons: [], promotion_consent_records: [], orders: [] };
  let n = 0;
  return {
    t,
    from(name: string) {
      const filters: Array<(r: Row) => boolean> = [];
      let op: "select" | "update" | "insert" = "select";
      let patch: Row = {};
      let created: Row[] = [];
      let joinLead = false;
      const rows = () => t[name].filter((r) => filters.every((f) => f(r)));
      const shape = (r: Row) => (joinLead ? { ...r, lead: t.promotion_leads.find((l) => l.id === r.lead_id) || null } : r);
      const api: any = {
        select: (cols?: string) => ((joinLead = /lead:/.test(cols || "")), api),
        insert: (p: Row) => {
          op = "insert";
          const row = { id: `id-${++n}`, created_at: new Date().toISOString(), ...(name === "promotion_coupons" ? { status: "issued" } : {}), ...p };
          t[name].push(row);
          created = [row];
          return api;
        },
        update: (p: Row) => ((op = "update"), (patch = p), api),
        eq: (k: string, v: any) => (filters.push((r) => r[k] === v), api),
        in: (k: string, v: any[]) => (filters.push((r) => v.includes(r[k])), api),
        order: () => api,
        limit: () => api,
        single: async () => ({ data: op === "insert" ? created[0] : rows().map(shape)[0] ?? null, error: null }),
        maybeSingle: async () => ({ data: rows().map(shape)[0] ?? null, error: null }),
        then: (res: any) => {
          if (op === "update") { const hit = rows(); hit.forEach((r) => Object.assign(r, patch)); return res({ data: hit.map((r) => ({ id: r.id })), error: null }); }
          if (op === "insert") return res({ data: created, error: null });
          return res({ data: rows().map(shape), error: null });
        },
      };
      return api;
    },
  };
}

const lead = (phone: string, name = "Maria Souza", opt = true) => ({ name, phone, marketingOptIn: opt, clientElapsedMs: 5000 });

test.describe("Roleta: leads gravados no banco e recuperação", () => {
  test.afterEach(() => __setWheelDbForTests(null));

  test("participação vira lead + cupom + consentimento no banco", async () => {
    const db = fakeDb();
    __setWheelDbForTests(db);
    const r = await PromotionService.processParticipation(lead("(18) 99812-3456") as any);
    expect(r.success).toBe(true);
    expect(db.t.promotion_leads).toHaveLength(1);
    expect(db.t.promotion_leads[0].phone_normalized).toBe("18998123456");
    expect(db.t.promotion_leads[0].marketing_opt_in).toBe(true);
    expect(db.t.promotion_coupons).toHaveLength(1);
    expect(db.t.promotion_coupons[0].code).toBe(r.coupon!.code);
    expect(db.t.promotion_consent_records[0].decision).toBe("granted");
    // o checkout enxerga o cupom (status issued, benefício em %)
    expect(db.t.promotion_coupons[0].benefit_type).toBe("percentage");
    expect(Number(db.t.promotion_coupons[0].benefit_value)).toBeGreaterThan(0);
  });

  test("mesmo telefone não gera segundo cupom", async () => {
    const db = fakeDb();
    __setWheelDbForTests(db);
    const a = await PromotionService.processParticipation(lead("18998123456") as any);
    const b = await PromotionService.processParticipation(lead("(18) 99812-3456", "Outro Nome") as any);
    expect(b.already_participated).toBe(true);
    expect(b.coupon!.code).toBe(a.coupon!.code);
    expect(db.t.promotion_coupons).toHaveLength(1);
  });

  test("admin vê telefone completo, aceite, e quem já comprou", async () => {
    const db = fakeDb();
    __setWheelDbForTests(db);
    await PromotionService.processParticipation(lead("18998123456", "Ana Lima") as any);
    await PromotionService.processParticipation(lead("18911112222", "Bruno Dias", false) as any);
    db.t.orders.push({ customer_phone: "(18) 99812-3456", status: "paid" });
    const { items } = await PromotionService.getParticipations({ pageSize: 50 });
    const ana = items.find((i) => i.lead_name === "Ana Lima")!;
    const bruno = items.find((i) => i.lead_name === "Bruno Dias")!;
    expect(ana.lead_phone_normalized).toBe("18998123456");
    expect(ana.marketing_opt_in).toBe(true);
    expect(ana.purchased).toBe(true);
    expect(bruno.marketing_opt_in).toBe(false);
    expect(bruno.purchased).toBe(false);
    expect(bruno.coupon_status).toBe("issued");
  });

  test("marcar contatado, resgatar no balcão e exportar CSV com telefone completo", async () => {
    const db = fakeDb();
    __setWheelDbForTests(db);
    const r = await PromotionService.processParticipation(lead("18998123456") as any);
    const leadId = db.t.promotion_leads[0].id;
    await PromotionService.setLeadContacted(leadId, true);
    expect(db.t.promotion_leads[0].contacted_at).toBeTruthy();
    await PromotionService.setLeadContacted(leadId, false);
    expect(db.t.promotion_leads[0].contacted_at).toBeNull();

    await PromotionService.redeemCoupon(r.coupon!.code, "Loja");
    expect(db.t.promotion_coupons[0].status).toBe("used");
    await expect(PromotionService.redeemCoupon(r.coupon!.code, "Loja")).rejects.toThrow(/já foi utilizado/);

    const csv = await PromotionService.exportParticipationsCsv();
    expect(csv).toContain("Telefone completo");
    expect(csv).toContain("18998123456");
    const m = await PromotionService.getMetricsSummary();
    expect(m.coupons_used).toBe(1);
  });

  test("falha ao gravar no banco não deixa o cliente sem cupom", async () => {
    const db = fakeDb();
    (db as any).from = () => { throw new Error("banco fora do ar"); };
    __setWheelDbForTests(db);
    const r = await PromotionService.processParticipation(lead("18977776666") as any);
    expect(r.success).toBe(true);
    expect(r.coupon!.code).toBeTruthy();
  });
});

test("admin: lista de recuperação com WhatsApp completo e controle de contato", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("ventara_cookie_consent", JSON.stringify({ necessary: true, analytics: false, marketing: false })));
  const base = { campaign_id: "c", campaign_version: 1, benefit_label: "10% OFF", winning_segment_id: "s", coupon_status: "issued", coupon_expires_at: new Date(Date.now() + 5 * 86400000).toISOString(), created_at: new Date().toISOString() };
  const items = [
    { ...base, id: "1", lead_id: "l1", lead_name: "Ana Lima", lead_phone_normalized: "18998123456", lead_phone_masked: "(18) 9****-3456", coupon_code: "VENTARA-10-AAA", marketing_opt_in: true, purchased: false, contacted_at: null },
    { ...base, id: "2", lead_id: "l2", lead_name: "Bruno Dias", lead_phone_normalized: "18911112222", lead_phone_masked: "(18) 9****-2222", coupon_code: "VENTARA-10-BBB", marketing_opt_in: false, purchased: true, contacted_at: null },
  ];
  let contacted: any = null;
  await page.route("**/api/admin/promotions/wheel/contacted", async (r) => { contacted = r.request().postDataJSON(); return r.fulfill({ json: { ok: true } }); });
  await page.route("**/api/admin/promotions/wheel/participations**", (r) => r.fulfill({ json: { items, total: 2, page: 1, totalPages: 1, metrics: { total_impressions: 0, unique_opens: 0, valid_submissions: 2, coupons_issued: 2, coupons_used: 0, conversion_rate: 0, redemption_rate: 0 } } }));
  await page.route("**/api/admin/promotions/wheel", (r) => r.request().method() === "GET" ? r.fulfill({ status: 500, json: {} }) : r.continue());
  await page.goto("/admin/promocoes/roleta");
  await page.getByRole("button", { name: /Participações & Cupons/ }).click();
  await expect(page.getByTestId("lead-VENTARA-10-AAA")).toContainText("18998123456");
  await expect(page.getByTestId("lead-VENTARA-10-BBB")).toHaveCount(0); // já comprou: fora de "Para recuperar"
  const href = await page.getByTestId("wa-VENTARA-10-AAA").getAttribute("href");
  expect(href).toContain("wa.me/5518998123456");
  expect(decodeURIComponent(href!)).toContain("VENTARA-10-AAA");
  await page.getByTestId("contacted-VENTARA-10-AAA").click();
  expect(contacted).toEqual({ lead_id: "l1", contacted: true });
  await page.getByTestId("rec-compraram").click();
  await expect(page.getByTestId("lead-VENTARA-10-BBB")).toBeVisible();
});
