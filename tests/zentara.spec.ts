import { test, expect } from "@playwright/test";

const consent = () => localStorage.setItem("ventara_cookie_consent", JSON.stringify({ necessary: true, analytics: false, marketing: false }));

test.describe("Página Zentara", () => {
  test.beforeEach(async ({ page }) => { await page.addInitScript(consent); });

  test("seções, índice 1.74 em destaque, 12 meses e aviso sobre embaçamento", async ({ page }) => {
    await page.goto("/zentara");
    await expect(page.getByTestId("zentara-hero").getByRole("heading", { level: 1 })).toContainText("clareza");
    await expect(page.getByTestId("trat-hidrofobico")).toBeVisible();
    await expect(page.getByTestId("trat-antirreflexo")).toBeVisible();
    await expect(page.getByTestId("trat-transparencia")).toBeVisible();
    for (const n of ["1.49", "1.56", "1.67", "1.74"]) await expect(page.getByTestId(`indice-${n}`)).toBeVisible();
    await expect(page.getByTestId("indice-1.74")).toHaveClass(/border-violet-400/);
    await expect(page.getByTestId("zentara-qualidade")).toContainText("12 meses de garantia");
    await expect(page.getByTestId("zentara-dia-a-dia")).toContainText("não impede totalmente o embaçamento");
    await expect(page.getByTestId("zentara-dia-a-dia")).toContainText("entregas de moto");
  });

  test("comparadores têm o mesmo tamanho e o seletor muda a imagem", async ({ page }) => {
    await page.goto("/zentara");
    const a = await page.getByTestId("cmp-hidrofobico").boundingBox();
    const b = await page.getByTestId("cmp-antirreflexo").boundingBox();
    expect(Math.abs(a!.width - b!.width)).toBeLessThan(2);
    expect(Math.abs(a!.height - b!.height)).toBeLessThan(2);
    expect(Math.abs(a!.width / a!.height - 4 / 3)).toBeLessThan(0.02);
    const range = page.getByTestId("cmp-hidrofobico-range");
    await range.fill("20");
    await expect(range).toHaveValue("20");
  });

  test("celular: sem rolagem horizontal e imagens carregam", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/zentara");
    await page.getByTestId("zentara-indices").scrollIntoViewIfNeeded();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const broken = await page.evaluate(async () => {
      const imgs = Array.from(document.images).filter((i) => i.src.includes("/zentara") || i.src.includes("zentara"));
      await Promise.all(imgs.map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = () => r(0); }))));
      return imgs.filter((i) => i.naturalWidth === 0).length;
    });
    expect(broken).toBe(0);
  });

  test("lentes tem atalho para a Zentara e a página está no sitemap", async ({ page, request }) => {
    await page.goto("/");
    await expect(page.getByTestId("link-zentara").first()).toHaveAttribute("href", "/zentara");
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/zentara");
  });
});

test("fundo com raios de luz fixo atrás do conteúdo, sem cobrir nada", async ({ page }) => {
  await page.goto("/zentara");
  const bg = page.getByTestId("zentara-fundo");
  await expect(bg).toBeAttached();
  const info = await bg.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { pos: cs.position, pe: cs.pointerEvents, canvas: el.querySelectorAll("canvas").length };
  });
  expect(info.pos).toBe("fixed");
  expect(info.pe).toBe("none");
  expect(info.canvas).toBe(0);
  await page.getByTestId("link-whatsapp-hero").first().isVisible().catch(() => {});
  await expect(page.getByTestId("zentara-hero")).toBeVisible();
});

test("opções de compra Zentara levam ao WhatsApp e banner da home aponta para /zentara", async ({ page }) => {
  await page.addInitScript(consent);
  await page.goto("/zentara");
  for (const n of ["1.56", "1.67", "1.74"]) {
    const href = await page.getByTestId(`zentara-comprar-${n}`).getAttribute("href");
    expect(href).toContain("wa.me/");
    expect(decodeURIComponent(href!)).toContain(`Zentara ${n}`);
  }
  await page.goto("/");
  const cta = page.getByTestId("zentara-banner-cta");
  await cta.scrollIntoViewIfNeeded();
  await expect(cta).toHaveAttribute("href", "/zentara");
});
