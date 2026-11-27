import { test, expect } from "@playwright/test";
import { parseBRLToCents, sanitizeZentaraOptions } from "../lib/zentara-options";

const consent = () => localStorage.setItem("ventara_cookie_consent", JSON.stringify({ necessary: true, analytics: false, marketing: false }));

test("parseBRLToCents aceita formatos brasileiros e rejeita lixo", () => {
  expect(parseBRLToCents("299,90")).toBe(29990);
  expect(parseBRLToCents("R$ 1.299,90")).toBe(129990);
  expect(parseBRLToCents("")).toBeNull();
  expect(parseBRLToCents("999999999")).toBeUndefined();
});

test("sanitize ignora dados inválidos e mantém o padrão", () => {
  const o = sanitizeZentaraOptions([{ id: "zentara-156", imageUrl: "javascript:alert(1)", priceCents: -5, highlights: ["  ok  ", 3, ""] }, null, "x"]);
  expect(o).toHaveLength(3);
  expect(o[0].imageUrl).toBe("/images/zentara/caixa-zentara.jpg");
  expect(o[0].priceCents).toBeNull();
  expect(o[0].highlights).toEqual(["ok"]);
});

test("API admin exige login", async ({ request }) => {
  const r = await request.put("/api/admin/zentara", { headers: { "x-playwright-bypass-token": "" }, data: { options: [] } });
  expect([401, 403]).toContain(r.status());
});

test("cliente edita no admin e a /zentara reflete (preço, riscado, selo, specs, esconder)", async ({ request, page }) => {
  const h = { "x-playwright-bypass-token": process.env.PLAYWRIGHT_BYPASS_TOKEN || "ventara-playwright-local-bypass-token" };
  const get = await request.get("/api/admin/zentara", { headers: h });
  expect(get.status()).toBe(200);
  const original = (await get.json()).options;

  const edited = original.map((o: any) => o.index === "1.56"
    ? { ...o, priceCents: 24990, oldPriceCents: 39990, badge: "Top", highlights: ["Spec A", "Spec B"] }
    : o.index === "1.67" ? { ...o, active: false } : o);
  const bad = await request.put("/api/admin/zentara", { headers: h, data: { options: original.map((o: any) => ({ ...o, priceCents: 5000, oldPriceCents: 4000 })) } });
  expect(bad.status()).toBe(400);
  const put = await request.put("/api/admin/zentara", { headers: h, data: { options: edited } });
  expect(put.status()).toBe(200);

  try {
    await page.addInitScript(consent);
    await page.goto("/zentara");
    await expect(page.getByTestId("zentara-preco-1.56")).toHaveText(/249,90/);
    await expect(page.getByTestId("zentara-preco-antigo-1.56")).toContainText("399,90");
    const old = await page.getByTestId("zentara-preco-antigo-1.56").locator("s").evaluate((e) => getComputedStyle(e).textDecorationLine);
    expect(old).toBe("line-through");
    await expect(page.getByTestId("zentara-opcao-1.56")).toContainText("Top");
    await expect(page.getByTestId("zentara-opcao-1.56")).toContainText("Spec B");
    await expect(page.getByTestId("zentara-opcao-1.67")).toHaveCount(0);
    const href = await page.getByTestId("zentara-comprar-1.56").getAttribute("href");
    expect(decodeURIComponent(href!)).toContain("R$");
  } finally {
    await request.put("/api/admin/zentara", { headers: h, data: { options: original } });
  }
});

test("tela /admin/zentara carrega os 3 cartões e salva", async ({ page }) => {
  await page.addInitScript(consent);
  await page.goto("/admin/zentara", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("admin-zentara")).toBeVisible();
  for (const n of ["1.56", "1.67", "1.74"]) await expect(page.getByTestId(`adm-zentara-${n}`)).toBeVisible();
  await page.getByTestId("adm-preco-1.56").fill("abc");
  await page.getByTestId("zentara-salvar").click();
  await expect(page.getByTestId("zentara-msg")).toContainText("inválido");
});
