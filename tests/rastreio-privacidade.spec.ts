import { test, expect } from "@playwright/test";

test.describe("Rastreio: sem busca parcial (LGPD)", () => {
  for (const q of ["MARIA", "A", "VEN", "1", "x,customer_name.ilike.%25"]) {
    test(`busca parcial "${q}" não retorna pedido`, async ({ request }) => {
      const res = await request.get(`/api/orders/track?code=${encodeURIComponent(q)}`);
      expect([404, 400]).toContain(res.status());
      const body = await res.json();
      expect(body.order).toBeUndefined();
    });
  }
});
