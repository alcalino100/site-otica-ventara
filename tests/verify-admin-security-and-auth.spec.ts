import { test, expect } from "@playwright/test";

test.describe("FASE 0: Segurança e Autenticação Administrativa", () => {
  const BYPASS_TOKEN =
    process.env.PLAYWRIGHT_BYPASS_TOKEN || "ventara-playwright-local-bypass-token";

  test("1. Requisições sem sessão administrativa para rotas /api/admin/** recebem 401", async ({
    request,
  }) => {
    const unauthenticatedRoutes = [
      { url: "/api/admin/settings", method: "GET" },
      { url: "/api/admin/users", method: "GET" },
      { url: "/api/admin/orders", method: "GET" },
      { url: "/api/admin/auditoria", method: "GET" },
      { url: "/api/admin/payments/config", method: "GET" },
      { url: "/api/admin/hero/settings", method: "GET" },
      { url: "/api/admin/promotions/wheel", method: "GET" },
      { url: "/api/admin/shipping", method: "GET" },
    ];

    for (const r of unauthenticatedRoutes) {
      // Envia requisição sem headers de autenticação ou bypass
      const res = await request.fetch(r.url, {
        method: r.method,
        headers: {
          // Remove explicitamente qualquer header de teste herdado
          "x-playwright-test": "",
          "x-playwright-bypass-token": "",
        },
      });

      expect(res.status(), `Rota ${r.url} deve responder 401 para anônimos`).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/autorizado|sessão|autentica/i);
    }
  });

  test("2. Tentativa de bypass legado ('x-playwright-test: true' ou cookie 'pw_test_session=1') sem token secreto é rejeitada com 401", async ({
    request,
  }) => {
    // Tentativa com header antigo
    const resHeader = await request.get("/api/admin/settings", {
      headers: {
        "x-playwright-test": "true",
        "x-playwright-bypass-token": "", // Sem token
      },
    });
    expect(resHeader.status()).toBe(401);

    // Tentativa com cookie antigo
    const resCookie = await request.get("/api/admin/users", {
      headers: {
        Cookie: "pw_test_session=1",
        "x-playwright-bypass-token": "",
      },
    });
    expect(resCookie.status()).toBe(401);
  });

  test("3. Navegação para páginas /admin/** sem autenticação redireciona para /admin/login", async ({
    browser,
  }) => {
    // Cria contexto isolado sem cookies nem headers especiais de bypass
    const context = await browser.newContext({
      extraHTTPHeaders: {},
    });
    const page = await context.newPage();

    await page.goto("http://localhost:3000/admin/banners");
    await page.waitForURL(/admin\/login/);
    expect(page.url()).toContain("/admin/login");

    await context.close();
  });

  test("4. Requisição com PLAYWRIGHT_BYPASS_TOKEN válido em ambiente de teste é autorizada com 200", async ({
    request,
  }) => {
    const resSettings = await request.get("/api/admin/settings", {
      headers: {
        "x-playwright-bypass-token": BYPASS_TOKEN,
      },
    });
    expect(resSettings.status()).toBe(200);
    const jsonSettings = await resSettings.json();
    expect(jsonSettings).toHaveProperty("identity");

    const resUsers = await request.get("/api/admin/users", {
      headers: {
        "x-playwright-bypass-token": BYPASS_TOKEN,
      },
    });
    expect(resUsers.status()).toBe(200);
    const jsonUsers = await resUsers.json();
    expect(jsonUsers).toHaveProperty("users");
  });

  test("5. Upload sem autenticação é bloqueado com 401", async ({ request }) => {
    const fakeFormData = {
      name: "test.png",
      mimeType: "image/png",
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]),
    };

    const endpoints = [
      "/api/admin/upload",
      "/api/admin/hero/upload",
      "/api/admin/shipping/upload",
    ];

    for (const ep of endpoints) {
      const res = await request.post(ep, {
        multipart: {
          file: fakeFormData,
        },
        headers: {
          "x-playwright-bypass-token": "",
        },
      });
      expect(res.status(), `Upload ${ep} sem auth deve responder 401`).toBe(401);
    }
  });

  test("6. Upload com tipo MIME ou extensão proibida é rejeitado com 400", async ({
    request,
  }) => {
    // Arquivo HTML malicioso disfarçado
    const maliciousFile = {
      name: "exploit.html",
      mimeType: "text/html",
      buffer: Buffer.from("<html><script>alert(1)</script></html>"),
    };

    const res = await request.post("/api/admin/upload", {
      multipart: {
        file: maliciousFile,
      },
      headers: {
        "x-playwright-bypass-token": BYPASS_TOKEN,
      },
    });

    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/inválid|extensão|mime/i);
  });

  test("7. Upload com spoofing de extensão (.jpg com conteúdo texto falso) é rejeitado com 400 via magic numbers", async ({
    request,
  }) => {
    const spoofedFile = {
      name: "fake.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("NOT_A_REAL_JPEG_IMAGE_CONTENT"),
    };

    const res = await request.post("/api/admin/upload", {
      multipart: {
        file: spoofedFile,
      },
      headers: {
        "x-playwright-bypass-token": BYPASS_TOKEN,
      },
    });

    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/conteúdo real|não corresponde|corrompido/i);
  });

  test("8. Upload maior que 5 MB é rejeitado com 400", async ({ request }) => {
    // Cria buffer de 5.5 MB com cabeçalho PNG válido
    const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024);
    // Assinatura PNG
    largeBuffer[0] = 0x89;
    largeBuffer[1] = 0x50;
    largeBuffer[2] = 0x4e;
    largeBuffer[3] = 0x47;
    largeBuffer[4] = 0x0d;
    largeBuffer[5] = 0x0a;
    largeBuffer[6] = 0x1a;
    largeBuffer[7] = 0x0a;

    const largeFile = {
      name: "large.png",
      mimeType: "image/png",
      buffer: largeBuffer,
    };

    const res = await request.post("/api/admin/upload", {
      multipart: {
        file: largeFile,
      },
      headers: {
        "x-playwright-bypass-token": BYPASS_TOKEN,
      },
    });

    expect(res.status()).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/muito grande|5 MB/i);
  });

  test("9. Upload de imagem válida (PNG com magic number) é aceito e retorna URL com nome seguro", async ({
    request,
  }) => {
    // PNG mínimo válido de 1x1 pixel
    const validPngBytes = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    const validFile = {
      name: "pixel.png",
      mimeType: "image/png",
      buffer: validPngBytes,
    };

    const res = await request.post("/api/admin/upload", {
      multipart: {
        file: validFile,
      },
      headers: {
        "x-playwright-bypass-token": BYPASS_TOKEN,
      },
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.url).toBeTruthy();
    // O nome gerado deve ser diferente de 'pixel.png' (seguro no servidor)
    expect(json.path).toMatch(/products\/product-\d+-[a-f0-9]+\.png/);
  });
});
