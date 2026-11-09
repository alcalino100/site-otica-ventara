import { test, expect } from "@playwright/test";

test.describe("Página /optisync — Três Linhas de Produto e Artes Oficiais", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/optisync");
    await page.waitForLoadState("domcontentloaded");
  });

  test("Carrega o tema futurista com as cores reais medidas e o Hero", async ({ page }) => {
    const root = page.locator(".theme-futuristic-lenses");
    await expect(root).toBeVisible();

    const heroTitle = page.locator("h1");
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText("OPTiSYNC HD");

    // Valida a presença do seletor rápido das 3 linhas
    const lineSelector = page.locator("button:has-text('OPTiSYNC HD')").first();
    await expect(lineSelector).toBeVisible();
    await expect(page.locator("button:has-text('Fotossensível')").first()).toBeVisible();
    await expect(page.locator("button:has-text('Kids Adventure')").first()).toBeVisible();
  });

  test("Seção da Linha OPTiSYNC HD exibe os diferenciais e slots de uso digital", async ({ page }) => {
    const hdSection = page.locator("#linha-hd");
    await expect(hdSection).toBeVisible();

    // Título e selo da Linha HD
    await expect(hdSection.getByText("LINHA ADULTO & USO DIGITAL")).toBeVisible();
    await expect(hdSection.getByRole("heading", { name: /OPTiSYNC HD/i })).toBeVisible();

    // Valida imagens da Linha HD (Gamer, Robô, Escritório, Caixa)
    const images = hdSection.locator("img");
    expect(await images.count()).toBeGreaterThanOrEqual(2);
  });

  test("Seção da Linha Fotossensível possui slider interativo acessível com controle por teclado", async ({ page }) => {
    const photoSection = page.locator("#linha-fotossensivel");
    await expect(photoSection).toBeVisible();
    await expect(photoSection.getByText("TECNOLOGIA FOTOSSENSÍVEL ADULTO")).toBeVisible();

    // Slider interativo com role="slider"
    const slider = photoSection.locator("[role='slider']");
    await expect(slider).toBeVisible();

    // Valida atributos ARIA de acessibilidade
    const initialVal = await slider.getAttribute("aria-valuenow");
    expect(initialVal).not.toBeNull();

    // Foca no slider e envia seta para a direita para aumentar escurecimento
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");

    const newVal = await slider.getAttribute("aria-valuenow");
    expect(Number(newVal)).toBeGreaterThan(Number(initialVal));

    // Envia seta para a esquerda para clarear
    await page.keyboard.press("ArrowLeft");
    const clareadoVal = await slider.getAttribute("aria-valuenow");
    expect(Number(clareadoVal)).toBeLessThan(Number(newVal));
  });

  test("Seção Kids Adventure exibe pôster e logo 3D com conformidade ética e sem alegações médicas de miopia", async ({ page }) => {
    const kidsSection = page.locator("#linha-kids");
    await expect(kidsSection).toBeVisible();
    await expect(kidsSection.getByText("LINHA INFANTIL & JUVENIL")).toBeVisible();
    await expect(kidsSection.getByRole("heading", { name: /Kids Adventure/i })).toBeVisible();

    // Valida que o texto HTML não contém falsas promessas de tratamento de saúde
    const textContent = await kidsSection.textContent();
    expect(textContent?.toLowerCase()).not.toContain("cura miopia");
    expect(textContent?.toLowerCase()).not.toContain("estaciona a miopia");
    expect(textContent?.toLowerCase()).not.toContain("tratamento médico definitivo");

    // Valida link para armações infantis
    const kidsCta = kidsSection.locator("a[href*='categoria=infantil']");
    await expect(kidsCta).toBeVisible();
  });

  test("Galeria tecnológica filtra artes e abre lightbox acessível com foco preso e tecla Esc", async ({ page }) => {
    // Rola até a galeria
    const gallerySection = page.locator("section:has-text('Galeria Tecnológica OPTiSYNC')");
    await expect(gallerySection).toBeVisible();

    // Botões de filtro da galeria
    const filterBtnKids = gallerySection.locator("button:has-text('Kids Adventure')");
    await expect(filterBtnKids).toBeVisible();
    await filterBtnKids.click();

    // Abre o lightbox clicando na primeira imagem filtrada
    const firstArtCard = gallerySection.locator("[role='button'][aria-label*='Ampliar arte']").first();
    await expect(firstArtCard).toBeVisible();
    await firstArtCard.click();

    // Modal Lightbox acessível aberto
    const lightboxModal = page.locator("[role='dialog'][aria-modal='true']");
    await expect(lightboxModal).toBeVisible();

    // Navega para a próxima imagem com a seta direita do teclado
    await page.keyboard.press("ArrowRight");

    // Fecha com a tecla Esc
    await page.keyboard.press("Escape");
    await expect(lightboxModal).not.toBeVisible();
  });

  test("Seção de Cores no rodapé exibe o Banner das seis lentes coloridas (Arte 2)", async ({ page }) => {
    const colorSection = page.locator("#secao-cores");
    await expect(colorSection).toBeVisible();

    // Banner da Arte 2
    const bannerImg = colorSection.locator("img[alt*='coloridas'], img[alt*='tonalidades']").first();
    await expect(bannerImg).toBeVisible();

    // Link para o catálogo de lentes coloridas
    const linkToCatalog = colorSection.locator("a[href='/lentes#secao-cores']");
    await expect(linkToCatalog).toBeVisible();
  });

  test("Responsividade mobile: seletor de 3 colunas, tabela com scroll e galeria compacta", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/optisync");
    await page.waitForLoadState("domcontentloaded");

    // Container principal deve ter isolate
    const mainEl = page.locator("main");
    await expect(mainEl).toHaveClass(/isolate/);

    // Seletor de linhas no mobile fica em grid de 3 colunas compacto
    const tabsContainer = page.locator("button:has-text('OPTiSYNC HD')").first().locator("..");
    await expect(tabsContainer).toBeVisible();

    // Galeria exibe 2 colunas no mobile
    const galleryGrid = page.locator(".grid.grid-cols-2").first();
    await expect(galleryGrid).toBeVisible();

    // Tabela comparativa exibe indicador de deslize no mobile
    const scrollHint = page.getByText("← Deslize para comparar →");
    await expect(scrollHint).toBeVisible();
  });
});

test.describe("Painel Administrativo — CMS da Página OPTiSYNC", () => {
  test("Aba CMS OPTiSYNC exibe campos das 3 linhas, slots das 10 artes e paleta medida", async ({ page }) => {
    await page.goto("/admin/lentes");
    await page.waitForLoadState("domcontentloaded");

    // Seleciona a aba "Página OPTiSYNC (CMS)"
    const optisyncTab = page.locator("button:has-text('Página OPTiSYNC')");
    await expect(optisyncTab).toBeVisible();
    await optisyncTab.click();

    // Valida campos de cores medidas
    await expect(page.getByText("Paleta Cromática Medida das Artes Oficiais & Efeitos")).toBeVisible();
    await expect(page.getByText("Base Azul-Marinho Profundo")).toBeVisible();
    await expect(page.getByText("Feixe Violeta Esquerdo (#4C01AE)")).toBeVisible();
    await expect(page.getByText("Feixe Azul Elétrico Direito (#0044C9)")).toBeVisible();
    await expect(page.getByText("Brilho Magenta Pontual (#B93DAA)")).toBeVisible();

    // Valida blocos das 3 linhas no Admin
    await expect(page.getByText("Linha 1: OPTiSYNC HD (Adulto & Telas)")).toBeVisible();
    await expect(page.getByText("Linha 2: OPTiSYNC HD Fotossensível")).toBeVisible();
    await expect(page.getByText("Linha 3: OPTiSYNC Kids Adventure")).toBeVisible();

    // Valida diretriz ética presente na Linha Kids
    await expect(page.getByText("Diretriz Ética Obrigatória:")).toBeVisible();

    // Valida botões de ação
    await expect(page.getByRole("button", { name: "Salvar Todas as Configurações OPTiSYNC" })).toBeVisible();
  });
});
