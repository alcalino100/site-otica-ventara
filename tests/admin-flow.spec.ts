import { test, expect } from "@playwright/test";

test.describe("Central Administrativa Modular (/admin)", () => {
  test("deve carregar o dashboard administrativo com métricas reais e módulos", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveTitle(/Painel Administrativo/i);
    await expect(page.locator("h1")).toContainText("Central Administrativa da Ótica Ventara");
    await expect(page.getByText("Produtos Cadastrados")).toBeVisible();
    await expect(page.getByText("Pedidos Pendentes")).toBeVisible();
    await expect(page.getByText("Alertas de Estoque Baixo")).toBeVisible();
    await expect(page.getByText("Módulos Operacionais da Loja")).toBeVisible();
  });

  test("deve acessar a página de gestão de identidade visual e cores", async ({ page }) => {
    await page.goto("/admin/identidade");
    await expect(page.locator("h1")).toContainText("Identidade Visual");
    await expect(page.getByText("Paleta de Cores da Marca")).toBeVisible();
    await expect(page.getByText("Rua Princesa Isabel, 221")).toBeVisible();
    await expect(page.getByText("Pré-Visualização em Tempo Real")).toBeVisible();
  });

  test("deve salvar e persistir identidade visual e dados da loja via API admin", async ({ request }) => {
    const postRes = await request.post("/api/admin/settings", {
      data: {
        appearance: {
          color_navy: "#02070D",
          color_electric: "#0756B8",
          color_yellow: "#FFD62E",
          color_ice_white: "#F4F6FA",
        },
        identity: {
          store_name: "Ótica Ventara",
          tagline: "Mais que óculos. Seu jeito de ver o mundo.",
          address_street: "Rua Princesa Isabel, 221",
          address_neighborhood: "Centro",
          address_city: "Araçatuba",
          address_state: "SP",
          address_postal_code: "16010-250",
          phone_whatsapp: "(18) 99615-5748",
          instagram_handle: "@oticaventara",
          business_hours: "Segunda a Sexta: 09h às 18h · Sábados: 09h às 13h",
        },
      },
    });

    expect(postRes.status()).toBe(200);
    const postJson = await postRes.json();
    expect(postJson.success).toBe(true);

    const getRes = await request.get("/api/settings");
    expect(getRes.status()).toBe(200);
    const getJson = await getRes.json();
    expect(getJson.appearance.color_navy).toBe("#02070D");
    expect(getJson.identity.address_street).toBe("Rua Princesa Isabel, 221");
  });

  test("deve carregar a tela de estoque e alertas de reposição", async ({ page }) => {
    await page.goto("/admin/estoque");
    await expect(page.locator("h1")).toContainText("Gestão de Estoque");
    await expect(page.getByText("Histórico e Auditoria de Movimentações")).toBeVisible();
  });

  test("deve carregar o importador CSV com modelo de planilha", async ({ page }) => {
    await page.goto("/admin/produtos/importar");
    await expect(page.locator("h1")).toContainText("Importador de Produtos");
    await expect(page.getByRole("button", { name: /Baixar Modelo CSV/i })).toBeVisible();
    await expect(page.getByText("Upload de Arquivo CSV")).toBeVisible();
  });

  test("deve carregar a tela de novo produto e suportar upload via API de admin", async ({ page, request }) => {
    await page.goto("/admin/produtos/novo");
    await expect(page.locator("h1")).toContainText("Cadastrar Nova Armação");
    await expect(page.getByText("Fotografia, Estoque e Publicação")).toBeVisible();
    await expect(page.getByRole("button", { name: /Salvar e Publicar/i })).toBeVisible();

    // Testa a rota de upload do servidor com buffer de imagem válido
    const dummyImageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    const uploadResponse = await request.post("/api/admin/upload", {
      multipart: {
        file: {
          name: "teste-unitario.png",
          mimeType: "image/png",
          buffer: dummyImageBuffer,
        },
      },
    });

    expect(uploadResponse.status()).toBe(200);
    const uploadJson = await uploadResponse.json();
    expect(uploadJson.success).toBe(true);
    expect(uploadJson.url).toContain("supabase.co/storage/v1/object/public/product-images/");
  });

  test("deve acessar a página de métricas UTM e gerar links para criativos", async ({ page, request }) => {
    // 1. Testa API de rastreamento com UTM
    const trackRes = await request.post("/api/analytics/track", {
      data: {
        path: "/#armacoes",
        utm_source: "meta",
        utm_medium: "stories",
        utm_campaign: "teste_criativo",
        utm_content: "video_1",
      },
    });
    expect(trackRes.status()).toBe(200);

    // 2. Acessa a tela de métricas no admin
    await page.goto("/admin/metricas");
    await expect(page.locator("h1")).toContainText("Métricas & Análise de UTMs");
    await expect(page.getByText("Gerador de Links UTM para Criativos")).toBeVisible();
    await expect(page.getByRole("button", { name: /Copiar Link/i })).toBeVisible();
    await expect(page.getByText("Desempenho por Campanha")).toBeVisible();
  });

  test("deve exibir catálogo homogêneo e sincronizado no painel administrativo", async ({ page }) => {
    await page.goto("/admin/produtos");
    await expect(page.locator("h1")).toContainText("Gestão de Produtos");
    const table = page.getByRole("table");
    await expect(table.getByText("Ventara Essencial")).toBeVisible();
    await expect(table.getByText("Ventara Aurora")).toBeVisible();
    await expect(table.getByText("Ventara Urbano")).toBeVisible();
    await expect(table.getByText("Ventara Horizonte")).toBeVisible();
    await expect(table.getByText("Ventara Kids Flex")).toBeVisible();
    await expect(table.getByText("Ventara Kids Solar UV400")).toBeVisible();
    await expect(table.getByText("Ventara Onça")).toBeVisible();
  });

  test("deve cadastrar, atualizar status e excluir produto permanentemente do banco via API admin", async ({ request }) => {
    // 1. Cadastra produto temporário
    const createRes = await request.post("/api/admin/products", {
      data: {
        name: "Produto Teste Automatizado",
        slug: `teste-auto-${Date.now()}`,
        description: "Produto criado para teste de ciclo de vida e exclusão permanente",
        price_in_cents: 29990,
        frame_type: "Grau",
        is_published: true,
      },
    });

    expect(createRes.status()).toBe(200);
    const createJson = await createRes.json();
    expect(createJson.success).toBe(true);
    const productId = createJson.product.id;
    expect(productId).toBeDefined();

    // 2. Atualiza status para rascunho (PATCH)
    const patchRes = await request.patch("/api/admin/products", {
      data: {
        id: productId,
        is_published: false,
      },
    });
    expect(patchRes.status()).toBe(200);
    const patchJson = await patchRes.json();
    expect(patchJson.success).toBe(true);
    expect(patchJson.product.is_published).toBe(false);

    // 3. Exclui o produto permanentemente (DELETE)
    const deleteRes = await request.delete("/api/admin/products", {
      data: { id: productId },
    });
    expect(deleteRes.status()).toBe(200);
    const deleteJson = await deleteRes.json();
    expect(deleteJson.success).toBe(true);
    expect(deleteJson.deleted.length).toBeGreaterThan(0);
    expect(deleteJson.deleted[0].id).toBe(productId);
  });

  test("deve carregar a tela de gestão de usuários e operadores (/admin/usuarios)", async ({ page }) => {
    await page.goto("/admin/usuarios");
    await expect(page.locator("h1")).toContainText("Usuários e Permissões de Acesso");
    await expect(page.getByRole("button", { name: "Adicionar Novo Usuário" })).toBeVisible();
    await expect(page.getByText("Operadores Autorizados")).toBeVisible();
    await expect(page.getByText("Total de Usuários")).toBeVisible();
  });

  test("deve cadastrar, atualizar nível e excluir usuário operador permanentemente via API admin (/api/admin/users)", async ({ request }) => {
    const testEmail = `teste.user.${Date.now()}@ventara.com.br`;

    // 1. Cadastra novo operador
    const createRes = await request.post("/api/admin/users", {
      data: {
        email: testEmail,
        full_name: "Operador Teste Automatizado",
        role: "editor",
        password: "Ventara@Test2026",
      },
    });

    expect(createRes.status()).toBe(201);
    const createJson = await createRes.json();
    expect(createJson.success).toBe(true);
    const userId = createJson.user.id;
    expect(userId).toBeDefined();
    expect(createJson.user.email).toBe(testEmail);
    expect(createJson.user.role).toBe("editor");

    // 2. Atualiza cargo / nível de permissão para admin
    const patchRes = await request.patch("/api/admin/users", {
      data: {
        id: userId,
        role: "admin",
      },
    });
    expect(patchRes.status()).toBe(200);
    const patchJson = await patchRes.json();
    expect(patchJson.success).toBe(true);
    expect(patchJson.user.role).toBe("admin");

    // 3. Remove o usuário permanentemente
    const deleteRes = await request.delete(`/api/admin/users?id=${userId}`);
    expect(deleteRes.status()).toBe(200);
    const deleteJson = await deleteRes.json();
    expect(deleteJson.success).toBe(true);
    expect(deleteJson.id).toBe(userId);
  });
});
