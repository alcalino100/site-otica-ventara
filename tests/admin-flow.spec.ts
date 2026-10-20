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
});
