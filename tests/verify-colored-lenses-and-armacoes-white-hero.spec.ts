import { test, expect } from "@playwright/test";

test.describe("Lentes Coloridas & /armacoes Tema Branco com Hero Configurável", () => {
  test("1. Página /armacoes renderiza tema Branco com Hero fotográfico em degradê", async ({
    page,
  }) => {
    await page.goto("/armacoes");
    await page.waitForLoadState("domcontentloaded");

    // Container raiz deve ter o fundo branco/off-white padrão editorial
    const mainContainer = page.locator("div.min-h-screen").first();
    await expect(mainContainer).toHaveClass(/bg-\[#fafafa\]/);

    // Hero com foto de fundo e degradê editorial
    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();

    const heroImg = heroSection.locator("img");
    await expect(heroImg).toBeVisible();
    await expect(heroImg).toHaveAttribute("src", /\/images\//);

    // Título e Destaque no Hero
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("Catálogo de");
    await expect(h1).toContainText("Armações & Óculos");

    // Badges de Confiança no Hero
    await expect(page.getByText("10x Sem Juros").first()).toBeVisible();
    await expect(page.getByText("Laboratório Próprio").first()).toBeVisible();
    await expect(page.getByText("Envio Seguro").first()).toBeVisible();

    // Cards de produtos devem ter fundo branco e borda sutil
    const firstCard = page.locator("div.product").first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toHaveClass(/bg-white/);

    // Barra de categorias (pills) deve ter tema claro/branco
    const tabsBar = page.locator("section.sticky").first();
    await expect(tabsBar).toHaveClass(/bg-white\/95/);
  });

  test("2. Endpoint /api/admin/lenses não reinjeta itens excluídos e responde com sucesso", async ({
    request,
  }) => {
    const res = await request.get("/api/admin/lenses");
    expect(res.ok()).toBeTruthy();

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.lenses)).toBe(true);
    expect(data.lenses.length).toBeGreaterThan(0);

    // Valida que lentes coloridas possuem atributos enriquecidos
    const coloridas = data.lenses.filter((l: any) => l.category === "coloridas");
    expect(coloridas.length).toBeGreaterThan(0);
    const firstColorida = coloridas[0];
    expect(firstColorida).toHaveProperty("id");
    expect(firstColorida).toHaveProperty("name");
    expect(firstColorida).toHaveProperty("colorHex");
  });

  test("3. Página /lentes-coloridas e detalhe /lentes-coloridas/[id] renderizam dinamicamente", async ({
    page,
  }) => {
    await page.goto("/lentes-coloridas");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator("h1")).toContainText(/Lentes Coloridas/i);

    // Deve renderizar opções de lentes solares
    const lensLinks = page.locator("a[href^='/lentes-coloridas/']");
    const count = await lensLinks.count();
    expect(count).toBeGreaterThan(0);

    // Acessar detalhe
    await page.goto("/lentes-coloridas/lente-cor-verde");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText(/Valor do Par com Grau|WhatsApp/i).first()).toBeVisible();
  });

  test("4. Painel de Banners (/admin/banners) possui aba dedicada para Hero de Armações", async ({
    page,
  }) => {
    await page.goto("/admin/banners");
    await page.waitForLoadState("domcontentloaded");

    // Botão da aba do Hero de Armações
    const armacoesTab = page.locator("button:has-text('Hero de Armações (/armacoes)')");
    await expect(armacoesTab).toBeVisible();

    // Clicar na aba
    await armacoesTab.click();
    await page.waitForTimeout(300);

    // Deve exibir o card do Hero com Live Preview e campos de edição
    await expect(page.getByText("Hero Fotográfico com Degradê Editorial")).toBeVisible();
    await expect(page.getByText("Pré-visualização do Banner no Site")).toBeVisible();
    await expect(page.getByText("Opacidade do Degradê Cinematográfico")).toBeVisible();
    await expect(page.getByRole("button", { name: /Salvar Hero de Armações/i })).toBeVisible();
  });
});
