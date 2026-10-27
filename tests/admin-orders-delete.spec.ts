import { test, expect } from "@playwright/test";

test.describe("Exclusão de Pedidos no Painel Administrativo", () => {
  test("deve excluir pedido via API DELETE /api/admin/orders", async ({ request }) => {
    // 1. Cria um pedido para ser excluído
    const createRes = await request.post("/api/admin/orders", {
      data: {
        customer_name: "Cliente Teste Exclusão API",
        customer_phone: "18991112222",
        customer_email: "excluir.api@teste.com",
        delivery_type: "pickup",
        items: [
          {
            product_name: "Armação Teste API",
            sku: "TEST-DEL-1",
            quantity: 1,
            unit_price_in_cents: 29900,
          },
        ],
        total_in_cents: 29900,
        payment_method: "in_store",
        status: "ready_for_pickup",
      },
    });

    expect(createRes.status()).toBe(200);
    const createdOrder = (await createRes.json()).order;
    expect(createdOrder.id).toBeDefined();

    // 2. Exclui o pedido via DELETE
    const deleteRes = await request.delete(`/api/admin/orders?id=${createdOrder.id}`);
    expect(deleteRes.status()).toBe(200);
    const deleteJson = await deleteRes.json();
    expect(deleteJson.success).toBe(true);
    expect(deleteJson.message).toContain("excluído com sucesso");

    // 3. Verifica se a busca pelo pedido retorna 404
    const checkRes = await request.get(`/api/orders/check-status?order_id=${createdOrder.id}`);
    expect(checkRes.status()).toBe(404);
  });

  test("deve exibir botão de lixeira, abrir modal de confirmação e excluir pedido na interface", async ({
    page,
    request,
  }) => {
    // 1. Cria pedido específico para teste visual
    const createRes = await request.post("/api/admin/orders", {
      data: {
        customer_name: "Cliente Excluir UI",
        customer_phone: "18998887777",
        customer_email: "excluir.ui@teste.com",
        customer_cpf: "99988877766",
        delivery_type: "pickup",
        items: [
          {
            product_name: "Armação Exclusão UI",
            sku: "TEST-DEL-UI",
            quantity: 1,
            unit_price_in_cents: 35000,
          },
        ],
        total_in_cents: 35000,
        payment_method: "in_store",
        status: "ready_for_pickup",
      },
    });

    const orderData = (await createRes.json()).order;
    const refCode = orderData.reference_code;

    // 2. Navega para a página de pedidos
    await page.goto("/admin/pedidos");
    await expect(page.locator("h1")).toContainText("Gestão de Pedidos");

    // 3. Localiza a linha do pedido criado
    const orderRow = page.locator("tr").filter({ hasText: refCode });
    await expect(orderRow).toBeVisible({ timeout: 10000 });

    // 4. Localiza o botão de exclusão (lixeira) dentro da linha
    const deleteBtn = orderRow.locator("button[aria-label*='Excluir pedido']");
    await expect(deleteBtn).toBeVisible();

    // 5. Clica no botão de exclusão para abrir o modal de confirmação
    await deleteBtn.click();

    // 6. Verifica o modal de confirmação
    const modal = page.locator("div.fixed").filter({ hasText: "Excluir Pedido Permanentemente" });
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(refCode);
    await expect(modal).toContainText("Cliente Excluir UI");

    // 7. Clica em Cancelar primeiro para validar que fecha sem deletar
    await modal.getByRole("button", { name: "Cancelar" }).click();
    await expect(modal).not.toBeVisible();
    await expect(orderRow).toBeVisible();

    // 8. Clica novamente em excluir e confirma
    await deleteBtn.click();
    await expect(modal).toBeVisible();
    const confirmDeleteBtn = modal.getByRole("button", { name: /Confirmar Exclusão/i });
    await expect(confirmDeleteBtn).toBeVisible();
    await confirmDeleteBtn.click();

    // 9. Verifica feedback de sucesso e que a linha sumiu da tabela
    await expect(page.locator("text=excluído com sucesso")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("tr").filter({ hasText: refCode })).not.toBeVisible();
  });
});
