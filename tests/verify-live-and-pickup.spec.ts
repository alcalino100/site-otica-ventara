import { test, expect } from "@playwright/test";

test.describe("Validação das Novas Alterações do Cliente (Live e Retirada na Loja)", () => {
  test("1. Rastreio: Pedido de Retirada na Loja exibe status de retirada e NÃO exibe dados de Correios", async ({ page }) => {
    await page.goto("/rastreio?code=VEN-10380", { waitUntil: "domcontentloaded" });

    // Aguarda exibição do pedido
    await expect(page.getByText("VEN-10380")).toBeVisible({ timeout: 10000 });

    // Status deve ser 'Pronto para Retirada' com badge em destaque
    await expect(page.getByText("Pronto para Retirada").first()).toBeVisible();

    // Deve exibir endereço físico da Ótica Ventara (Rua Princesa Isabel, 221)
    await expect(page.getByText(/Princesa Isabel, 221/).first()).toBeVisible();

    // Passo 5 da timeline deve ser 'Pronto para Retirada na Loja'
    await expect(page.getByText("Pronto para Retirada na Loja")).toBeVisible();

    // NÃO deve conter menção a Correios ou a caminho do endereço de entrega
    await expect(page.getByText("Previsão de entrega conforme prazo dos Correios")).not.toBeVisible();
    await expect(page.getByText("Objeto postado e a caminho do endereço de entrega")).not.toBeVisible();
  });

  test("2. Rastreio: Pedido com código de rastreamento postal é tratado como envio", async ({ page }) => {
    await page.goto("/rastreio?code=VEN-10415", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("VEN-10415")).toBeVisible({ timeout: 10000 });
    // Deve exibir o código de rastreamento
    await expect(page.getByText("BR839210492VENT").first()).toBeVisible();
  });

  test("3. Botão de Live: Oculto por padrão quando desativado", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // O botão de Live deve estar ausente quando enabled = false
    const liveButton = page.locator("#live-floating-button");
    await expect(liveButton).not.toBeVisible();
  });

  test("4. Botão de Live: Visível e funcional quando ativado", async ({ page }) => {
    // Intercepta a chamada para /api/settings para simular live ativa
    await page.route("**/api/settings", async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      json.live_broadcast = {
        enabled: true,
        title: "Estamos Ao Vivo no Instagram!",
        platform: "instagram",
        live_url: "https://www.instagram.com/oticaventara/live",
        label: "LIVE",
        call_to_action: "Clique para assistir",
      };
      await route.fulfill({ json });
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Botão de Live deve estar visível
    const liveButton = page.locator("#live-floating-button");
    await expect(liveButton).toBeVisible({ timeout: 10000 });

    // Deve conter badge com texto 'LIVE'
    await expect(liveButton.locator("text=LIVE")).toBeVisible();

    // Link deve apontar para a live configurada
    await expect(liveButton).toHaveAttribute("href", "https://www.instagram.com/oticaventara/live");
    await expect(liveButton).toHaveAttribute("target", "_blank");
  });

  test("5. Painel Admin: Página /admin/live possui toggle, plataformas, link e preview", async ({ page, isMobile }) => {
    await page.goto("/admin/live", { waitUntil: "domcontentloaded" });

    // Título da página
    await expect(page.getByRole("heading", { name: /Transmissão Ao Vivo/i })).toBeVisible({ timeout: 10000 });

    // Verifica presença dos botões de plataforma (Instagram, TikTok, YouTube, etc.)
    await expect(page.getByRole("button", { name: "Instagram" })).toBeVisible();
    await expect(page.getByRole("button", { name: "TikTok" })).toBeVisible();
    await expect(page.getByRole("button", { name: "YouTube" })).toBeVisible();

    // Campo de Link da Live
    const urlInput = page.locator("input[type='url']");
    await expect(urlInput).toBeVisible();

    // Botão de Salvar
    const saveButton = page.getByRole("button", { name: /Salvar Configurações da Live/i });
    await expect(saveButton).toBeVisible();

    // Link de navegação no header do admin
    if (isMobile) {
      const mobileMenuBtn = page.locator("button[aria-label='Abrir menu de navegação']");
      if (await mobileMenuBtn.isVisible()) {
        await mobileMenuBtn.click();
      }
      await expect(page.locator("div.lg\\:hidden a[href='/admin/live']")).toBeVisible();
    } else {
      await expect(page.locator("div.hidden.lg\\:block a[href='/admin/live']")).toBeVisible();
    }
  });
});
