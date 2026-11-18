import { test, expect } from "@playwright/test";

const SITE = "https://www.oticasventara.com.br";

test.describe("SEO base", () => {
  test("robots.txt bloqueia áreas privadas e aponta o sitemap", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toContain("Disallow: /admin/");
    expect(body).toContain("Disallow: /api/");
    expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });

  test("sitemap.xml lista páginas fixas e produtos, sem rotas privadas", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const path of ["/armacoes", "/lentes", "/medicao-por-foto", "/entregas"]) {
      expect(xml).toContain(`<loc>${SITE}${path}</loc>`);
    }
    expect(xml).toMatch(/<loc>https:\/\/www\.oticasventara\.com\.br\/produto\/[^<]+<\/loc>/);
    expect(xml).not.toContain("/admin");
    expect(xml).not.toContain("/rastreio");
  });

  test("home: título local, canonical e dados estruturados (loja, site, FAQ)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Ótica em Araçatuba/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", SITE);
    const types = await page.$$eval('script[type="application/ld+json"]', (els) =>
      els.map((e) => JSON.stringify(JSON.parse(e.textContent || "{}")))
    );
    const all = types.join(" ");
    expect(all).toContain("Optician");
    expect(all).toContain('"WebSite"');
    expect(all).toContain("FAQPage");
  });

  test("produto: Product + BreadcrumbList e /armacoes/[id] aponta o canonical para /produto", async ({ page, request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const slug = /\/produto\/([^<]+)<\/loc>/.exec(xml)![1];
    await page.goto(`/produto/${slug}`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${SITE}/produto/${slug}`);
    const ld = (await page.$$eval('script[type="application/ld+json"]', (els) => els.map((e) => e.textContent))).join(" ");
    expect(ld).toContain('"Product"');
    expect(ld).toContain('"priceCurrency":"BRL"');
    expect(ld).toContain("BreadcrumbList");
    await page.goto(`/armacoes/${slug}`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${SITE}/produto/${slug}`);
  });

  test("rastreio não é indexado", async ({ page }) => {
    await page.goto("/rastreio");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});
