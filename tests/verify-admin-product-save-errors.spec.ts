import { test, expect, Page } from "@playwright/test";

async function openNewProduct(page: Page, context: any) {
  await context.addCookies([
    { name: "pw_bypass_token", value: "ventara-playwright-local-bypass-token", url: "http://localhost:3000" },
  ]);
  await page.goto("/admin/produtos/novo");
  await page.addStyleTag({ content: '[aria-label*="Consentimento"]{display:none !important}' });
  await page.getByRole("button", { name: /Identificação/ }).first().click();
  await page.getByPlaceholder("Ex: Ventara Safari Acetato").fill("Ventara Teste Erro");
}

const saveDraft = (page: Page) => page.getByRole("button", { name: /Salvar Rascunho|Publicar no Site/ }).first().click();

test.describe("Admin: erros ao salvar produto sempre em português", () => {
  test("servidor devolve página HTML (timeout/erro 500) → mensagem clara, sem texto técnico", async ({ page, context }) => {
    await page.route("**/api/admin/products", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({ status: 504, contentType: "text/html", body: "<html>Gateway Timeout</html>" })
        : route.continue()
    );
    await openNewProduct(page, context);
    await saveDraft(page);
    await expect(page.getByText(/servidor demorou ou falhou/i)).toBeVisible();
    await expect(page.getByText(/confira a lista antes de tentar de novo/i)).toBeVisible();
    await expect(page.getByText(/Unexpected token|not valid JSON|did not match/i)).toHaveCount(0);
    // O formulário continua preenchido
    await expect(page.getByPlaceholder("Ex: Ventara Safari Acetato")).toHaveValue("Ventara Teste Erro");
  });

  test("sessão expirada (401) → pede para entrar de novo e mantém os dados", async ({ page, context }) => {
    await page.route("**/api/admin/products", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "Acesso não autorizado: sessão administrativa necessária." }) })
        : route.continue()
    );
    await openNewProduct(page, context);
    await saveDraft(page);
    await expect(page.getByText(/sessão do painel expirou/i)).toBeVisible();
    await expect(page.getByPlaceholder("Ex: Ventara Safari Acetato")).toHaveValue("Ventara Teste Erro");
  });

  test("conexão caiu → mensagem em português", async ({ page, context }) => {
    await page.route("**/api/admin/products", (route) =>
      route.request().method() === "POST" ? route.abort("failed") : route.continue()
    );
    await openNewProduct(page, context);
    await saveDraft(page);
    await expect(page.getByText(/Sem conexão com o servidor agora/i)).toBeVisible();
  });

  test("nome repetido: servidor avisa o novo endereço e o cadastro conclui", async ({ page, context }) => {
    await page.route("**/api/admin/products", (route) =>
      route.request().method() === "POST"
        ? route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true, product: { id: "x" }, warning: 'Já existia um produto com esse nome, então este foi salvo com o endereço "ventara-teste-erro-2".' }),
          })
        : route.continue()
    );
    await openNewProduct(page, context);
    await saveDraft(page);
    await expect(page.getByText(/cadastrado com sucesso/i)).toBeVisible();
    await expect(page.getByText(/ventara-teste-erro-2/)).toBeVisible();
  });
});
