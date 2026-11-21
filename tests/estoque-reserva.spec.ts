import { test, expect } from "@playwright/test";
import { releaseStockForOrder, reserveStockForOrder } from "../lib/stock-reservation";

/** Mini banco em memória que imita o encadeamento do supabase-js usado pela reserva. */
function fakeClient(tables: Record<string, any[]>) {
  const from = (name: string) => {
    const rows = tables[name];
    let filters: ((r: any) => boolean)[] = [];
    let mode: "select" | "update" | "delete" = "select";
    let patch: any = null;
    let single = false;
    const run = () => {
      const matched = rows.filter((r) => filters.every((f) => f(r)));
      if (mode === "update") matched.forEach((r) => Object.assign(r, patch));
      if (mode === "delete") matched.forEach((r) => rows.splice(rows.indexOf(r), 1));
      return { data: single ? matched[0] ?? null : matched.map((r) => ({ ...r })), error: null };
    };
    const q: any = {
      select: () => q,
      eq: (c: string, v: any) => (filters.push((r) => r[c] === v), q),
      limit: () => q,
      single: () => ((single = true), q),
      update: (p: any) => ((mode = "update"), (patch = p), q),
      delete: () => ((mode = "delete"), q),
      insert: (row: any) => (rows.push({ id: String(rows.length + 1), ...row }), Promise.resolve({ error: null })),
      then: (res: any, rej: any) => Promise.resolve(run()).then(res, rej),
    };
    return q;
  };
  return { from } as any;
}

const order = { id: "o1", reference_code: "VEN-2611-AAAAAA" };

function setup(stock: number, qty = 1) {
  return fakeClient({
    product_variants: [{ id: "v1", product_id: "p1", stock_quantity: stock }],
    order_items: [{ order_id: "o1", variant_id: "v1", product_id: "p1", quantity: qty, product_name: "Ventara Onça", color_name: "Preto" }],
    inventory_movements: [],
  });
}

test.describe("Reserva de estoque", () => {
  test("baixa ao reservar, é idempotente e devolve uma única vez ao cancelar", async () => {
    const db = setup(3, 2);
    expect((await reserveStockForOrder(db, order)).ok).toBe(true);
    expect((await reserveStockForOrder(db, order)).ok).toBe(true); // repetição não baixa de novo
    expect((await db.from("product_variants").select().eq("id", "v1").single()).data.stock_quantity).toBe(1);

    expect(await releaseStockForOrder(db, order.reference_code)).toBe(1);
    expect(await releaseStockForOrder(db, order.reference_code)).toBe(0); // 2º cancelamento não infla
    expect((await db.from("product_variants").select().eq("id", "v1").single()).data.stock_quantity).toBe(3);
  });

  test("sem saldo suficiente: recusa e não altera o estoque", async () => {
    const db = setup(1, 2);
    const res = await reserveStockForOrder(db, order);
    expect(res.ok).toBe(false);
    expect(res.missing).toContain("Ventara Onça");
    expect((await db.from("product_variants").select().eq("id", "v1").single()).data.stock_quantity).toBe(1);
  });

  test("cancelar pedido que nunca reservou não cria estoque", async () => {
    const db = setup(5);
    expect(await releaseStockForOrder(db, order.reference_code)).toBe(0);
    expect((await db.from("product_variants").select().eq("id", "v1").single()).data.stock_quantity).toBe(5);
  });
});
