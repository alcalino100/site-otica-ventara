import { test, expect } from "@playwright/test";

const BYPASS_TOKEN = "ventara-playwright-local-bypass-token";

test.describe("CMS Resiliente - Publicação e Rascunho com Fallback para site_settings", () => {
  test("1. POST /api/admin/content/home salva rascunho com 200 OK mesmo sem tabela site_content", async ({
    request,
  }) => {
    const res = await request.post("http://localhost:3000/api/admin/content/home", {
      headers: {
        "x-playwright-bypass-token": BYPASS_TOKEN,
        "content-type": "application/json",
      },
      data: JSON.stringify({
        action: "save_draft",
        values: {
          backgroundPreset: "optisync",
          heroTitle: "Ventara Resiliente Home",
        },
      }),
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("Rascunho salvo com sucesso");
  });

  test("2. POST /api/admin/content/home publica conteúdo com 200 OK e grava histórico no fallback", async ({
    request,
  }) => {
    const res = await request.post("http://localhost:3000/api/admin/content/home", {
      headers: {
        "x-playwright-bypass-token": BYPASS_TOKEN,
        "content-type": "application/json",
      },
      data: JSON.stringify({
        action: "publish",
        label: "v1.0-teste-resiliencia",
        summary: "Publicação com fallback transparente",
        values: {
          backgroundPreset: "optisync",
          heroTitle: "Ventara Resiliente Publicado",
        },
      }),
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("Conteúdo publicado no ar com sucesso");
  });

  test("3. GET /api/content/home retorna o conteúdo publicado pelo fallback", async ({
    request,
  }) => {
    const res = await request.get("http://localhost:3000/api/content/home");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.values).toBeDefined();
    expect(body.values.backgroundPreset).toBe("optisync");
    expect(body.values.heroTitle).toBe("Ventara Resiliente Publicado");
  });

  test("4. POST /api/admin/content/optisync publica com 200 OK em uma segunda página", async ({
    request,
  }) => {
    const res = await request.post("http://localhost:3000/api/admin/content/optisync", {
      headers: {
        "x-playwright-bypass-token": BYPASS_TOKEN,
        "content-type": "application/json",
      },
      data: JSON.stringify({
        action: "publish",
        label: "v1.0-optisync-resiliencia",
        summary: "Ajuste de estilo e fundo OptiSYNC",
        values: {
          backgroundPreset: "optisync",
          heroBadge: "TECNOLOGIA RESILIENTE",
        },
      }),
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain("Conteúdo publicado no ar com sucesso");

    // Valida que o endpoint público retorna o valor publicado
    const pubRes = await request.get("http://localhost:3000/api/content/optisync");
    expect(pubRes.status()).toBe(200);
    const pubBody = await pubRes.json();
    expect(pubBody.values.heroBadge).toBe("TECNOLOGIA RESILIENTE");
  });

  test("5. Acesso ao frontend /optisync renderiza com os dados publicados", async ({ page }) => {
    await page.goto("http://localhost:3000/optisync", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByText("TECNOLOGIA RESILIENTE")).toBeVisible({ timeout: 10000 });
  });

  test("6. Histórico de versões em /api/admin/content/home retorna registros do fallback", async ({
    request,
  }) => {
    const res = await request.get("http://localhost:3000/api/admin/content/home", {
      headers: {
        "x-playwright-bypass-token": BYPASS_TOKEN,
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.history)).toBe(true);
    expect(body.history.length).toBeGreaterThan(0);
    expect(body.history[0].label).toBe("v1.0-teste-resiliencia");
  });

  test("7. Fluxo completo no UI do Admin: publica em /admin/conteudo/optisync sem erro", async ({
    page,
  }) => {
    await page.setExtraHTTPHeaders({
      "x-playwright-bypass-token": BYPASS_TOKEN,
    });

    await page.goto("http://localhost:3000/admin/conteudo/optisync", {
      waitUntil: "domcontentloaded",
    });

    const publishBtn = page.getByRole("button", { name: /Publicar no Ar/i });
    await expect(publishBtn).toBeVisible({ timeout: 10000 });
    await publishBtn.click();

    // Modal de publicação deve abrir
    const modalHeading = page.getByText(/Publicar Alterações no Ar/i);
    await expect(modalHeading).toBeVisible({ timeout: 5000 });

    // Preenche rótulo e resumo
    const labelInput = page.getByPlaceholder(/Ajuste nos textos do hero/i);
    await labelInput.fill("v1.5 — Teste Fallback UI");

    const summaryInput = page.getByPlaceholder(/Atualizado título do simulador/i);
    await summaryInput.fill("Publicação de teste com fallback resiliente para site_settings");

    // Confirma publicação
    const confirmBtn = page.getByRole("button", { name: /Confirmar e Publicar/i });
    await confirmBtn.click();

    // Verifica toast de sucesso
    const successToast = page.getByText(/Conteúdo publicado no ar com sucesso/i);
    await expect(successToast).toBeVisible({ timeout: 10000 });

    // Garante que nenhum erro de schema cache apareceu
    const errorToast = page.getByText(/Could not find the table/i);
    await expect(errorToast).not.toBeVisible();
  });

  test.afterAll(async ({ request }) => {
    // Restaura o heroBadge original de optisync para manter integridade dos testes de regressão
    await request.post("http://localhost:3000/api/admin/content/optisync", {
      headers: {
        "x-playwright-bypass-token": BYPASS_TOKEN,
        "content-type": "application/json",
      },
      data: JSON.stringify({
        action: "publish",
        label: "v1.0-reset-defaults",
        summary: "Restauração de defaults pós-teste",
        values: {
          heroBadge: "ENGENHARIA ÓPTICA DIGITAL",
        },
      }),
    });
  });
});
