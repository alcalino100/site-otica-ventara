import { test, expect } from "@playwright/test";

const og = async (page: any, path: string) => {
  await page.goto(path);
  return page.locator('meta[property="og:image"]').first().getAttribute("content");
};

test("link da home mostra só a logo", async ({ page }) => {
  expect(await og(page, "/")).toContain("/images/og/ventara-logo.jpg");
});
test("link das armações mostra o cartão de armações", async ({ page }) => {
  expect(await og(page, "/armacoes")).toContain("/images/og/ventara-armacoes.jpg");
});
test("link do rastreio mostra o banner de rastreamento", async ({ page }) => {
  expect(await og(page, "/rastreio")).toContain("/images/og/rastreio.jpg");
});
test("link da Zentara mostra a logo da lente", async ({ page }) => {
  expect(await og(page, "/zentara")).toContain("/images/og/zentara.jpg");
});
test("imagens de compartilhamento existem e são servidas", async ({ request }) => {
  for (const f of ["ventara-logo", "ventara-armacoes", "rastreio", "zentara"]) {
    const r = await request.get(`/images/og/${f}.jpg`);
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("image/jpeg");
  }
});
