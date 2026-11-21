import { test, expect } from "@playwright/test";

test("/catalogo redireciona para /armacoes (sem 404)", async ({ request }) => {
  const res = await request.get("/catalogo", { maxRedirects: 0 });
  expect([301, 308]).toContain(res.status());
  expect(res.headers()["location"]).toContain("/armacoes");
});
