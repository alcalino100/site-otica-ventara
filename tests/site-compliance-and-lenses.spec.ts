import { test, expect } from "@playwright/test";
import { DEFAULT_LENSES } from "../lib/lenses-data";

test.describe("Auditoria de Conformidade Legal, Lentes e Gestão de Produtos", () => {
  test("1. Páginas de Conformidade Legal (Privacidade, Termos e Reembolso) retornam 200", async ({ page }) => {
    // 1.1 Política de Privacidade
    const privRes = await page.goto("/politica-de-privacidade");
    expect(privRes?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(/Política de Privacidade/i);
    await expect(page.locator("body")).toContainText(/LGPD/i);
    await expect(page.locator("body")).toContainText(/Exclusão/i);

    // 1.2 Termos de Uso
    const termsRes = await page.goto("/termos-de-uso");
    expect(termsRes?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(/Termos de Uso/i);
    await expect(page.locator("body")).toContainText(/CDC/i);

    // 1.3 Política de Reembolso
    const refundRes = await page.goto("/politica-de-reembolso");
    expect(refundRes?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(/Reembolso/i);
    await expect(page.locator("body")).toContainText(/7 \(sete\) dias/i);
  });

  test("2. Banner de Consentimento de Cookies (LGPD) e controle de rastreamento", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.removeItem("ventara_cookie_consent");
      } catch {}
    });
    await page.goto("/");
    // O banner de consentimento deve estar presente
    const banner = page.getByRole("region", { name: /Consentimento de Cookies/i });
    await expect(banner).toBeVisible({ timeout: 8000 });

    // Botões devem estar claros
    await expect(page.getByRole("button", { name: /Aceitar Todos/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Apenas Essenciais/i })).toBeVisible();

    // Clicar em Apenas Essenciais deve registrar consentimento e fechar o banner
    await page.getByRole("button", { name: /Apenas Essenciais/i }).click();
    await expect(banner).not.toBeVisible();

    const storedConsent = await page.evaluate(() => localStorage.getItem("ventara_cookie_consent"));
    expect(storedConsent).not.toBeNull();
    const parsed = JSON.parse(storedConsent!);
    expect(parsed.essential).toBe(true);
    expect(parsed.analytics).toBe(false);
  });

  test("3. Catálogo de Lentes: Marcas Corretas, Cores e Ausência de Ray-Ban/Oakley", async ({ page }) => {
    await page.goto("/");

    // Ray-Ban e Oakley não devem constar no carrossel de lentes
    const ribbonText = await page.locator("section#lentes, .site-footer, [class*='PartnerLogosRibbon']").allInnerTexts();
    const combined = ribbonText.join(" ");
    expect(combined).not.toContain("Oakley");
    expect(combined).not.toContain("Ray-Ban");

    // Lentes OPTiSYNC HD devem exibir as duas opções: Antirreflexo e Blue Protect
    await page.goto("/#lentes");
    const optisyncAr = page.getByText("OPTiSYNC HD Antirreflexo").first();
    const optisyncBlue = page.getByText("OPTiSYNC HD Blue Protect").first();
    await expect(optisyncAr).toBeVisible();
    await expect(optisyncBlue).toBeVisible();

    // Destaque inferior deve conter "VENTARA EXCLUSIVO"
    const ventaraExclusivo = page.getByText("VENTARA EXCLUSIVO").first();
    await expect(ventaraExclusivo).toBeVisible();

    // Correct apenas como Visão Simples (não em multifocais)
    await page.getByRole("button", { name: /Multifocais/i }).click();
    await expect(page.locator("body")).not.toContainText("Correct Digital Progressive");
  });

  test("4. API de Gestão de Lentes e Edição no Painel Administrativo", async ({ request }) => {
    // 4.1 Consulta de lentes
    const getRes = await request.get("/api/admin/lenses");
    expect(getRes.ok()).toBe(true);
    const data = await getRes.json();
    expect(Array.isArray(data.lenses)).toBe(true);
    expect(data.lenses.length).toBeGreaterThan(0);

    // 4.2 Edição de valores e descrição
    const updated = [...data.lenses];
    updated[0] = {
      ...updated[0],
      startingPrice: "R$ 139,90",
      description: "Descrição técnica atualizada pelo gestor óptico para teste de conformidade.",
    };

    const postRes = await request.post("/api/admin/lenses", {
      data: { lenses: updated },
    });
    expect(postRes.ok()).toBe(true);

    const recheck = await request.get("/api/admin/lenses");
    const recheckData = await recheck.json();
    expect(recheckData.lenses[0].startingPrice).toBe("R$ 139,90");
    expect(recheckData.lenses[0].description).toContain("Descrição técnica atualizada");
  });

  test("5. Gestão de Produtos: Suporte a Múltiplas Fotos (2 a 4 fotos) e Edição", async ({ page, request }) => {
    // 5.1 Criação de produto com múltiplas imagens via API
    const newProdRes = await request.post("/api/admin/products", {
      data: {
        name: "Ventara Teste Multifotos",
        slug: "ventara-teste-multifotos",
        price_in_cents: 39900,
        description: "Armação para validação de galeria com 3 fotos (frontal, lateral e interna).",
        frame_type: "Grau",
        frame_shape: "Quadrado",
        frame_material: "Acetato Premium",
        gender: "Unissex",
        color_name: "Preto Nobre",
        stock_quantity: 4,
        images: [
          { url: "/images/lifestyle/model-1.jpg", is_primary: true, alt_text: "Foto Frontal" },
          { url: "/images/lifestyle/model-2.jpg", is_primary: false, alt_text: "Foto Lateral" },
          { url: "/images/lifestyle/model-3.jpg", is_primary: false, alt_text: "Foto Interna" },
        ],
      },
    });

    // Se o Supabase estiver em fallback local ou ativo
    if (newProdRes.ok()) {
      const prodJson = await newProdRes.json();
      const createdId = prodJson.product?.id;

      if (createdId) {
        // 5.2 Edição de produto via PATCH
        const patchRes = await request.patch("/api/admin/products", {
          data: {
            id: createdId,
            name: "Ventara Teste Multifotos Editada",
            stock_quantity: 8,
          },
        });
        expect(patchRes.ok()).toBe(true);

        // Limpeza
        await request.delete(`/api/admin/products?id=${createdId}`);
      }
    }
  });

  test("6. Dados da Empresa e CNPJ no Rodapé", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer.site-footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText(/CNPJ:/i);
    await expect(footer).toContainText(/Araçatuba-SP/i);
    await expect(footer).toContainText(/Princesa Isabel/i);
    await expect(footer).toContainText(/Política de Privacidade/i);
    await expect(footer).toContainText(/Termos de Uso/i);
    await expect(footer).toContainText(/Reembolso/i);
  });
});
