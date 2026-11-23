import { test, expect } from "@playwright/test";
import {
  applyAdminCoupon,
  confirmAdminCouponForOrder,
  couponStatus,
  generateCouponCode,
  normalizeCustomer,
  releaseAdminCouponForOrder,
  validateCouponInput,
  type CouponInput,
} from "../lib/coupons";

const base: CouponInput = { code: "VENTARA-ABCDE", discount_type: "percentage", discount_value: 10, expires_at: "2099-01-01", max_uses_per_customer: 1 };

test.describe("Cupons", () => {
  test("cadastro exige validade OU limite total de usos", () => {
    expect(validateCouponInput({ ...base, expires_at: null }, { requireLimit: true })).toMatch(/limite/i);
    expect(validateCouponInput({ ...base, expires_at: null, max_uses_total: 50 }, { requireLimit: true })).toBeNull();
    expect(validateCouponInput(base, { requireLimit: true })).toBeNull();
    // cupom pausado pode ficar sem limite (ex.: cupons antigos)
    expect(validateCouponInput({ ...base, expires_at: null }, { requireLimit: false })).toBeNull();
  });

  test("validações de código, valor e datas", () => {
    expect(validateCouponInput({ ...base, code: "ab" }, { requireLimit: true })).toMatch(/código/i);
    expect(validateCouponInput({ ...base, code: "DESC 10" }, { requireLimit: true })).toMatch(/código/i);
    expect(validateCouponInput({ ...base, discount_value: 0 }, { requireLimit: true })).toMatch(/maior que zero/);
    expect(validateCouponInput({ ...base, discount_value: 150 }, { requireLimit: true })).toMatch(/100%/);
    expect(validateCouponInput({ ...base, max_uses_per_customer: 0 }, { requireLimit: true })).toMatch(/por cliente/i);
    expect(validateCouponInput({ ...base, starts_at: "2099-02-01", expires_at: "2099-01-01" }, { requireLimit: true })).toMatch(/depois/);
    expect(validateCouponInput({ ...base, discount_type: "fixed", discount_value: 50 }, { requireLimit: true })).toBeNull();
  });

  test("status do cupom", () => {
    const c = { active: true, starts_at: null, expires_at: null, max_uses_total: 5 };
    expect(couponStatus(c, 0)).toBe("active");
    expect(couponStatus(c, 5)).toBe("exhausted");
    expect(couponStatus({ ...c, active: false }, 0)).toBe("paused");
    expect(couponStatus({ ...c, expires_at: "2000-01-01T00:00:00Z" }, 0)).toBe("expired");
    expect(couponStatus({ ...c, starts_at: "2099-01-01T00:00:00Z" }, 0)).toBe("scheduled");
  });

  test("identifica o cliente pelo mesmo critério (caixa, DDI, máscara)", () => {
    expect(normalizeCustomer({ email: " A@B.com ", phone: "+55 (18) 99999-0000", document: "123.456.789-09" })).toEqual({ email: "a@b.com", phone: "18999990000", document: "12345678909" });
    expect(normalizeCustomer({ phone: "123", document: "12" })).toEqual({ email: "", phone: "", document: "" });
  });

  test("código gerado é legível e válido", () => {
    for (let i = 0; i < 20; i++) expect(generateCouponCode()).toMatch(/^VENTARA-[A-HJ-NP-Z2-9]{5}$/);
  });

  test("applyAdminCoupon repassa o cliente normalizado e traduz a resposta", async () => {
    const calls: any[] = [];
    const db = {
      rpc: async (_n: string, args: any) => {
        calls.push(args);
        return { data: { found: true, ok: true, coupon_id: "c1", code: "X", discount_type: "percentage", discount_value: 10, discount_in_cents: 2000, max_discount_cents: null, min_order_cents: 0 }, error: null };
      },
    };
    const r = await applyAdminCoupon(db, { code: "x", subtotalCents: 20000, email: "A@B.com", phone: "+5518999990000", orderId: "o1", reference: "VEN-1" });
    expect(r).toMatchObject({ found: true, ok: true, discountInCents: 2000 });
    expect(calls[0]).toMatchObject({ p_email: "a@b.com", p_phone: "18999990000", p_order_id: "o1", p_dry_run: false });

    const rej = await applyAdminCoupon({ rpc: async () => ({ data: { found: true, ok: false, reason: "exhausted", message: "Este cupom esgotou." }, error: null }) }, { code: "x", subtotalCents: 1 });
    expect(rej).toEqual({ found: true, ok: false, reason: "exhausted", message: "Este cupom esgotou." });

    // função ainda não criada no banco: não quebra, cai nos outros tipos de cupom
    const missing = await applyAdminCoupon({ rpc: async () => ({ data: null, error: { message: "function not found" } }) }, { code: "x", subtotalCents: 1 });
    expect(missing).toEqual({ found: false });
  });

  test("devolver e confirmar uso atualizam só o pedido certo", async () => {
    const updates: any[] = [];
    const db = {
      from: () => {
        const q: any = { _f: {} };
        q.update = (v: any) => ((q._v = v), q);
        q.eq = (k: string, v: any) => ((q._f[k] = v), q);
        q.in = (k: string, v: any) => ((q._f[k + "_in"] = v), q);
        q.then = (res: any) => (updates.push({ v: q._v, f: q._f }), res({ error: null }));
        return q;
      },
    };
    await releaseAdminCouponForOrder(db, "order-1");
    await confirmAdminCouponForOrder(db, "order-1");
    expect(updates[0]).toMatchObject({ v: { status: "released" }, f: { order_id: "order-1", status_in: ["reserved", "confirmed"] } });
    expect(updates[1]).toMatchObject({ v: { status: "confirmed" }, f: { order_id: "order-1" } });
  });
});
