import { test, expect } from "@playwright/test";

test.describe("Hero Full-Bleed e Gestão de Slides no Admin", () => {
  test("1. Desktop: Renderiza Hero com foto de fundo full-bleed, overlay e badges", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const hero = page.locator("#inicio");
    await expect(hero).toBeVisible({ timeout: 10000 });

    // 1.1 Verifica a imagem de fundo full-bleed otimizada (next/image)
    const bgImage = hero.locator("img").first();
    await expect(bgImage).toBeVisible();
    const classes = await bgImage.getAttribute("class");
    expect(classes).toContain("object-cover");

    // 1.2 Verifica selo superior "QUALIDADE QUE VOCÊ VÊ"
    await expect(hero.getByText("QUALIDADE QUE VOCÊ VÊ")).toBeVisible();

    // 1.3 Verifica título óptico "Mais que óculos, é sobre você."
    await expect(hero.getByText("Mais que óculos")).toBeVisible();
    await expect(hero.getByText("você.")).toBeVisible();

    // 1.4 Verifica os botões de CTA
    await expect(hero.getByRole("link", { name: /Catálogo de Lentes/i })).toBeVisible();
    await expect(hero.getByRole("link", { name: /Ver armações/i })).toBeVisible();

    // 1.5 Verifica os marcadores de confiança do rodapé do hero
    await expect(hero.getByText("Lab Próprio")).toBeVisible();
    await expect(hero.getByText("Pronto em 1h")).toBeVisible();
    await expect(hero.getByText("100% Autoral")).toBeVisible();

    // 1.6 Verifica os badges sobrepostos à foto
    await expect(hero.getByText(/ARMAÇÕES DE QUALIDADE E ESTILO/i)).toBeVisible();
    await expect(hero.getByText(/Em Estoque · Envio Imediato/i)).toBeVisible();
    await expect(hero.getByText(/Curadoria Autoral Ventara/i)).toBeVisible();
  });

  test("2. Mobile: Renderização responsiva no iPhone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const hero = page.locator("#inicio");
    await expect(hero).toBeVisible({ timeout: 10000 });

    // Verifica imagem de fundo no mobile
    const bgImage = hero.locator("img").first();
    await expect(bgImage).toBeVisible();

    // Verifica que o CTA principal está visível e clicável
    const cta = hero.getByRole("link", { name: /Catálogo de Lentes/i });
    await expect(cta).toBeVisible();
  });

  test("3. Admin: Acesso à seção 'Hero / Banner', configurações e editor de slides", async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Configura cookie de sessão para o bypass de autenticação do Playwright no middleware
    await context.addCookies([
      {
        name: "pw_test_session",
        value: "1",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/admin/banners", { waitUntil: "domcontentloaded" });

    // 3.1 Verifica a aba "Hero / Banner" ativa
    const heroTab = page.getByRole("button", { name: /Hero \/ Banner/i });
    await expect(heroTab).toBeVisible({ timeout: 10000 });

    // 3.2 Verifica o bloco de Configurações Globais do Hero
    await expect(page.getByText("Configurações Globais do Hero")).toBeVisible();
    await expect(page.getByText("Transição Automática (Autoplay)")).toBeVisible();
    await expect(page.getByText("Efeito de Transição")).toBeVisible();
    await expect(page.getByRole("button", { name: /Salvar Configurações/i })).toBeVisible();

    // 3.3 Verifica a lista de slides e o botão de adicionar
    await expect(page.getByText(/Fotos do Hero Full-Bleed/i)).toBeVisible();
    const addSlideBtn = page.getByRole("button", { name: /Adicionar Foto \/ Slide/i });
    await expect(addSlideBtn).toBeVisible();

    // 3.4 Abre o modal de edição de slide
    await addSlideBtn.click();
    await expect(page.getByText("Novo Slide do Hero")).toBeVisible();
    await expect(page.getByText("Pré-visualização do Hero")).toBeVisible();

    // 3.5 Verifica os campos de upload, ponto focal e toggle "Mostrar somente a foto"
    await expect(page.getByText(/Foto Desktop \(Full-Bleed\)/i)).toBeVisible();
    await expect(page.getByText(/Foto Mobile/i)).toBeVisible();
    await expect(page.getByText(/Ponto Focal \(Desktop\)/i)).toBeVisible();
    await expect(page.getByText(/Intensidade do Overlay/i)).toBeVisible();
    await expect(page.getByText(/Mostrar somente a foto \(Sem nenhum texto\)/i)).toBeVisible();

    // 3.6 Fecha o modal de edição
    await page.getByRole("button", { name: "Cancelar" }).first().click();
    await expect(page.getByText("Novo Slide do Hero")).not.toBeVisible();
  });
});
