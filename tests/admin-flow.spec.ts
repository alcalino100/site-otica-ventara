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
});
