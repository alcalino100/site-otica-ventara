import { test, expect } from "@playwright/test";
import {
  BACKGROUND_PRESETS,
  resolveBackgroundConfig,
  checkPageToneCompatibility,
  calculateBackgroundContrast,
  DEFAULT_BACKGROUND_CONFIGS,
} from "../lib/content/background-presets";

test.describe("Presets de Fundo de Página & Switcher Visual (CMS Fase 3)", () => {
  const BYPASS_TOKEN =
    process.env.PLAYWRIGHT_BYPASS_TOKEN || "ventara-playwright-local-bypass-token";

  test.beforeEach(async ({ context, page }) => {
    await page.setExtraHTTPHeaders({
      "x-playwright-bypass-token": BYPASS_TOKEN,
    });
    await context.addCookies([
      {
        name: "pw_bypass_token",
        value: BYPASS_TOKEN,
        domain: "localhost",
        path: "/",
      },
      {
        name: "ventara_admin_user",
        value: "admin@oticasventara.com.br",
        domain: "localhost",
        path: "/",
      },
      {
        name: "ventara_cookie_consent",
        value: "accepted",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  // ========================================================================
  // 1. TESTES UNITÁRIOS DE RESOLUÇÃO, TONS E CONTRASTE
  // ========================================================================
  test("1. Resolução correta e simétrica de presets de fundo com fallbacks", () => {
    // Caso 1: Sem valores, herda optisync de legacySettings
    const legacy = { bgMode: "code", gradientBaseFrom: "#000933", beamsIntensity: 85 };
    const resolvedFromLegacy = resolveBackgroundConfig({}, legacy);
    expect(resolvedFromLegacy.preset).toBe("optisync");
    expect(resolvedFromLegacy.beamsIntensity).toBe(85);
    expect(resolvedFromLegacy.tone).toBe("dark");

    // Caso 2: contentValues explícito de 'dark' sobrepõe legacy
    const resolvedDark = resolveBackgroundConfig(
      { backgroundPreset: "dark", gradientBaseFrom: "#06111F" },
      legacy
    );
    expect(resolvedDark.preset).toBe("dark");
    expect(resolvedDark.tone).toBe("dark");
    expect(resolvedDark.gradientBaseFrom).toBe("#06111F");

    // Caso 3: Preset 'offwhite'
    const resolvedOffwhite = resolveBackgroundConfig({ backgroundPreset: "offwhite" });
    expect(resolvedOffwhite.preset).toBe("offwhite");
    expect(resolvedOffwhite.tone).toBe("light");
    expect(resolvedOffwhite.gradientBaseFrom).toBe("#FAF8F4");

    // Caso 4: Preset 'custom_image'
    const resolvedImage = resolveBackgroundConfig({
      backgroundPreset: "custom_image",
      customBgDesktopUrl: "https://example.com/bg.webp",
      bgOverlayOpacity: 75,
      bgFocalPoint: "top",
    });
    expect(resolvedImage.preset).toBe("custom_image");
    expect(resolvedImage.customBgDesktopUrl).toBe("https://example.com/bg.webp");
    expect(resolvedImage.bgOverlayOpacity).toBe(75);
    expect(resolvedImage.bgFocalPoint).toBe("top");

    // Caso 5: Preset 'default'
    const resolvedDefault = resolveBackgroundConfig({ backgroundPreset: "default" });
    expect(resolvedDefault.preset).toBe("default");
    expect(resolvedDefault.tone).toBe("neutral");
  });

  test("2. Regra estrita de legibilidade e compatibilidade de tons", () => {
    // /optisync é nativamente escura
    const optisyncDark = checkPageToneCompatibility("optisync", "dark");
    expect(optisyncDark.isCompatible).toBe(true);

    const optisyncOpti = checkPageToneCompatibility("optisync", "optisync");
    expect(optisyncOpti.isCompatible).toBe(true);

    const optisyncDefault = checkPageToneCompatibility("optisync", "default");
    expect(optisyncDefault.isCompatible).toBe(true);

    // /optisync com preset offwhite deve alertar incompatibilidade
    const optisyncLight = checkPageToneCompatibility("optisync", "offwhite");
    expect(optisyncLight.isCompatible).toBe(false);
    expect(optisyncLight.warning).toBeDefined();
    expect(optisyncLight.warning).toContain("OptiSYNC");

    // Página clara com preset escuro deve alertar incompatibilidade
    const armacoesDark = checkPageToneCompatibility("armacoes", "dark");
    expect(armacoesDark.isCompatible).toBe(false);
    expect(armacoesDark.warning).toContain("textos pretos nativos");
  });

  test("3. Cálculo do contraste WCAG AA/AAA para os presets principais", () => {
    // OptiSYNC com texto claro (#F4F6FF) sobre #000933
    const optisyncConfig = DEFAULT_BACKGROUND_CONFIGS.optisync;
    const optisyncContrast = calculateBackgroundContrast(optisyncConfig);
    expect(optisyncContrast.passesAA).toBe(true);
    expect(optisyncContrast.passesAAA).toBe(true);
    expect(optisyncContrast.ratio).toBeGreaterThanOrEqual(7.0);

    // Escuro Ventara com texto claro (#F4F6FF) sobre #02070D
    const darkConfig = DEFAULT_BACKGROUND_CONFIGS.dark;
    const darkContrast = calculateBackgroundContrast(darkConfig);
    expect(darkContrast.passesAA).toBe(true);
    expect(darkContrast.passesAAA).toBe(true);

    // Off-white com texto escuro (#06111F) sobre #FAF8F4
    const offwhiteConfig = DEFAULT_BACKGROUND_CONFIGS.offwhite;
    const offwhiteContrast = calculateBackgroundContrast(offwhiteConfig);
    expect(offwhiteContrast.passesAA).toBe(true);
    expect(offwhiteContrast.passesAAA).toBe(true);
    expect(offwhiteContrast.ratio).toBeGreaterThanOrEqual(7.0);
  });

  // ========================================================================
  // 2. TESTES E2E: RENDERIZAÇÃO PÚBLICA EM /optisync
  // ========================================================================
  test("4. Fundo tecnológico reutilizável renderizado na página pública /optisync", async ({
    page,
  }) => {
    await page.goto("/optisync");

    // Camada fixa acessível com pointer-events-none e aria-hidden
    const bgContainer = page.locator('div[aria-hidden="true"].pointer-events-none').first();
    await expect(bgContainer).toBeVisible();

    // Grade HUD presente
    const hudGrid = page.locator(".lens-hud-grid");
    await expect(hudGrid.first()).toBeVisible();

    // Linhas horizontais de luz HUD
    const lightLine = page.locator(".bg-gradient-to-r.from-transparent.via-\\[\\#0044C9\\]\\/40");
    await expect(lightLine).toBeAttached();
  });

  // ========================================================================
  // 3. TESTES E2E: SWITCHER NO ADMIN /admin/conteudo/optisync
  // ========================================================================
  test("5. Switcher de presets de fundo presente no editor do Admin", async ({ page }) => {
    await page.goto("/admin/conteudo/optisync");

    // Card do Fundo da Página presente
    const bgSwitcherTitle = page.getByRole("heading", { name: "Fundo da Página & Estilo Visual" });
    await expect(bgSwitcherTitle).toBeVisible();

    // Presets exibidos
    await expect(page.getByText("Tecnológico OptiSYNC").first()).toBeVisible();
    await expect(page.getByText("Escuro Ventara").first()).toBeVisible();
    await expect(page.getByText("Off-white Ventara").first()).toBeVisible();
    await expect(page.getByText("Imagem Personalizada").first()).toBeVisible();
    await expect(page.getByText("Padrão do Site").first()).toBeVisible();

    // Medidor de Contraste visível e aprovado
    await expect(page.getByText(/Contraste com a Tipografia Principal/)).toBeVisible();
    await expect(page.getByText("Aprovado WCAG AA")).toBeVisible();
  });

  test("6. Troca de preset e abertura de Ajustes Finos no Admin", async ({ page }) => {
    await page.goto("/admin/conteudo/optisync");

    // Clica no preset "Escuro Ventara"
    const darkPresetCard = page.locator('[role="button"]').filter({ hasText: "Escuro Ventara" }).first();
    await darkPresetCard.dispatchEvent("click");

    // Botão de Salvar Rascunho deve ficar ativo (dirty state)
    const saveDraftBtn = page.getByRole("button", { name: "Salvar Rascunho" });
    await expect(saveDraftBtn).toBeEnabled();

    // Abre painel de Ajustes Finos
    const fineTuningBtn = page.getByRole("button", { name: "Ajustes Finos" });
    await fineTuningBtn.dispatchEvent("click");

    // Ajustes finos visíveis
    await expect(page.getByText(/Ajustes Finos de Parâmetros/)).toBeVisible();
  });

  test("7. Modal de aplicação em outras páginas disponível", async ({ page }) => {
    await page.goto("/admin/conteudo/optisync");

    // Botão de aplicar em outras páginas
    const applyToOtherBtn = page.getByRole("button", { name: "Aplicar em outras páginas" });
    await expect(applyToOtherBtn).toBeVisible();
    await applyToOtherBtn.dispatchEvent("click");

    // Modal visível
    const modalHeading = page.getByRole("heading", { name: "Aplicar Fundo em Outras Páginas" });
    await expect(modalHeading).toBeVisible();

    // Lista outras páginas disponíveis
    await expect(page.getByText("Catálogo de Armações")).toBeVisible();
    await expect(page.getByText("Catálogo de Lentes")).toBeVisible();
  });
});
