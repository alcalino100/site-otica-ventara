import { test, expect } from "@playwright/test";
import { buildTrackingPayload } from "../lib/orders-tracker";


test("rastreio: pago mostra 'processo de fabricação' e não promete retirada imediata", async () => {
  const mk = (status: string, delivery = "pickup") => buildTrackingPayload({ id: "o1", reference_code: "VEN-1", status, created_at: new Date().toISOString(), customer_name: "Eliane Costa", notes: delivery === "pickup" ? "[RETIRADA NA LOJA]" : "", shipping_address: delivery === "pickup" ? { delivery_type: "pickup" } : null, items: [] });
  const paid = JSON.stringify(mk("paid"));
  expect(paid).toContain("Em processo de fabricação");
  expect(paid).toContain("Suas lentes estão sendo produzidas em laboratório");
  expect(paid).not.toContain("retirada imediata");
  expect(paid).not.toContain("Triagem");
  expect(JSON.stringify(mk("ready_for_pickup"))).toContain("Pronto para retirada");
});
