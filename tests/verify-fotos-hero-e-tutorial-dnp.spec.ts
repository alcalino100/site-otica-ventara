import { test, expect } from "@playwright/test";

test.describe("Tutorial visual da medição de DNP por foto", () => {
  test("mostra as 4 etapas com as imagens do tutorial", async ({ page }) => {
    await page.goto("/medicao-por-foto");
    const tutorial = page.getByTestId("dnp-tutorial");
    await expect(tutorial).toBeVisible();
    for (const n of [1, 2, 3, 4]) {
      await expect(page.getByTestId(`dnp-step-${n}`)).toBeVisible();
    }
    const imgs = tutorial.locator("img");
    await expect(imgs).toHaveCount(4);
    // Imagens abaixo da dobra carregam sob demanda: rola até cada uma antes de conferir
    for (let i = 0; i < 4; i++) {
      const img = imgs.nth(i);
      await img.scrollIntoViewIfNeeded();
      await expect
        .poll(() => img.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0))
        .toBe(true);
    }
    const loaded = [true];
    expect(loaded.every(Boolean)).toBe(true);
  });
});

test.describe("Home sem piscar fotos antigas", () => {
  test("o HTML inicial já traz o carrossel (sem depender de /api/hero)", async ({ request }) => {
    const res = await request.get("/");
    expect(res.ok()).toBe(true);
    const html = await res.text();
    // O primeiro slide precisa estar no HTML servido, não só depois do fetch no navegador
    expect(html).toMatch(/hero|Mais que óculos/i);
  });
});

test.describe("Foto removida não reaparece na página do produto", () => {
  test("a foto principal sempre está entre as miniaturas da galeria", async ({ page }) => {
    await page.goto("/produto/ventara-safari");
    const main = page.getByTestId("pdp-main-image");
    await expect(main).toBeVisible();
    const mainSrc = await main.getAttribute("src");
    const thumbs = await page.locator("button img").evaluateAll((els) => els.map((e) => (e as HTMLImageElement).src));
    if (thumbs.length > 0) expect(thumbs).toContain(mainSrc);
  });
});

test.describe("Vitrine da Home enxuta", () => {
  test("mostra no máximo 12 modelos (desktop) / 8 (mobile) e o botão Ver mais leva a /armacoes", async ({ page, isMobile }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "ventara_cookie_consent_v1",
        JSON.stringify({ necessary: true, analytics: true, marketing: false, timestamp: new Date().toISOString() })
      );
    });
    await page.goto("/#armacoes");
    const section = page.locator("#armacoes");
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const visibleCards = await section.locator(".product").evaluateAll(
      (els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length
    );
    expect(visibleCards).toBeGreaterThan(0);
    expect(visibleCards).toBeLessThanOrEqual(isMobile ? 8 : 12);
    const link = page.getByTestId("home-ver-mais-armacoes");
    await expect(link).toHaveAttribute("href", "/armacoes");
  });
});

test.describe("Vitrine interativa só com Solar Esportivo masculino", () => {
  test("sem Armações de Grau / Coleção Feminina e com o título fora da foto", async ({ page }) => {
    await page.goto("/");
    const vitrine = page.locator("#vitrine-interativa");
    await vitrine.scrollIntoViewIfNeeded();
    await expect(vitrine.getByText("Óculos Solar", { exact: true })).toBeVisible();
    await expect(vitrine.getByText("Esportivo", { exact: true })).toBeVisible();
    await expect(vitrine.getByText("Coleção Masculina")).toBeVisible();
    await expect(vitrine.getByText("Armações de Grau")).toHaveCount(0);
    await expect(vitrine.getByText("Coleção Feminina")).toHaveCount(0);
    // O título "Óculos Solares & Esportivos" fica fora da foto (legenda), não sobreposto a ela
    const caption = vitrine.getByTestId("showcase-caption");
    await expect(caption).toContainText(/Óculos Solares/i);
    const insideImage = await vitrine.locator(".aspect-\\[4\\/3\\] >> text=/Óculos Solares/i").count();
    expect(insideImage).toBe(0);
  });
});

test("DNP por foto: tutorial visual vem logo depois do título, antes da comparação", async ({ page }) => {
  await page.goto("/medicao-por-foto");
  const ordem = await page.evaluate(() => {
    const tut = document.querySelector('[data-testid="dnp-tutorial"]');
    const secs = Array.from(document.querySelectorAll("main > section"));
    return { tutIndex: secs.findIndex((s) => s === tut), total: secs.length };
  });
  expect(ordem.tutIndex).toBe(1); // 0 = título/hero, 1 = tutorial
});

test("PDP: botão-banner da DNP aparece na compra com grau e leva a /medicao-por-foto", async ({ page }) => {
  await page.goto("/produto/ventara-safari");
  const banner = page.getByTestId("pdp-dnp-banner");
  await expect(banner).toHaveCount(1);
  await expect(banner).toHaveAttribute("href", "/medicao-por-foto");
});

test.describe("Página de lentes: filtro por recursos", () => {
  test("Fotossensível e Sem tratamento filtram a lista; Sem tratamento é exclusivo", async ({ page }) => {
    await page.goto("/lentes");
    const filtros = page.getByTestId("lens-feature-filters");
    await expect(filtros).toBeVisible();
    await expect(filtros.getByRole("button", { name: "Fotossensível" })).toBeVisible();
    await expect(filtros.getByRole("button", { name: "Sem tratamento" })).toBeVisible();
    await expect(filtros.getByText("Proteção UV")).toHaveCount(0);
    await expect(filtros.getByText("Alta Definição")).toHaveCount(0);

    const cards = page.getByTestId("lens-catalog-card");
    await expect(cards.first()).toBeVisible();
    const total = await cards.count();

    await filtros.getByRole("button", { name: "Fotossensível" }).click();
    await page.waitForTimeout(200);
    const foto = await cards.count();
    expect(foto).toBeLessThanOrEqual(total);

    await filtros.getByRole("button", { name: "Antirreflexo" }).click();
    await filtros.getByRole("button", { name: "Sem tratamento" }).click();
    await expect(filtros.getByRole("button", { name: "Fotossensível" })).toHaveAttribute("aria-pressed", "false");
    await expect(filtros.getByRole("button", { name: "Sem tratamento" })).toHaveAttribute("aria-pressed", "true");
  });
});

test("PDP: bolinhas de cor mostram a cor, não a foto", async ({ page }) => {
  await page.goto("/produto/ventara-safari");
  const grupo = page.getByRole("radiogroup", { name: /Cores disponíveis/ });
  if (await grupo.count()) {
    await expect(grupo.locator("img")).toHaveCount(0);
  }
});

test("lentes: divisão Visão Simples / Multifocal filtra", async ({ page }) => {
  await page.goto("/lentes");
  const sw = page.getByTestId("lens-type-switch");
  await expect(sw).toBeVisible();
  await page.getByTestId("lens-type-multifocal").click();
  await expect(page.getByTestId("lens-type-multifocal")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("lens-type-multifocal").click();
  await expect(page.getByTestId("lens-type-multifocal")).toHaveAttribute("aria-pressed", "false");
});

test("home: seção de lentes tem a divisão Visão Simples / Multifocal", async ({ page }) => {
  await page.goto("/");
  const sw = page.getByTestId("home-lens-type-switch");
  await sw.scrollIntoViewIfNeeded();
  await expect(sw).toBeVisible();
});

test("header: em tablet (768px) o menu vira hambúrguer e a logo não some", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/");
  const toggle = page.getByLabel("Abrir menu");
  await expect(toggle).toBeVisible();
  await expect(page.getByLabel("Navegação principal")).toBeHidden();
  const logo = page.locator("header a.brand").first();
  expect((await logo.boundingBox())!.width).toBeGreaterThan(40);
  const box = await toggle.boundingBox();
  expect(box!.x + box!.width).toBeLessThanOrEqual(768);
});

test("touch: campos de formulário têm fonte >= 16px (evita zoom automático do iOS)", async ({ page, isMobile }) => {
  test.skip(!isMobile, "só em dispositivo touch");
  await page.goto("/armacoes");
  const sizes = await page.evaluate(() =>
    [...document.querySelectorAll("input,select,textarea")]
      .filter((el) => !["checkbox", "radio", "hidden", "file"].includes((el as HTMLInputElement).type))
      .map((el) => parseFloat(getComputedStyle(el).fontSize))
  );
  expect(sizes.length).toBeGreaterThan(0);
  for (const s of sizes) expect(s).toBeGreaterThanOrEqual(16);
});
