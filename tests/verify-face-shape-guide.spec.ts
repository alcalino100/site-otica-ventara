import { test, expect } from "@playwright/test";
import { normalizeFaceFit, suggestFaceFit, idealFaceLabels } from "../lib/face-shapes";

const PRODUCT_ID = "22222222-2222-2222-2222-222222222222";

const PRODUCT = {
  id: PRODUCT_ID,
  name: "Ventara Esmeralda",
  slug: "ventara-esmeralda",
  description: "Armação de teste",
  price_in_cents: 38990,
  is_published: true,
  frame_type: "Grau",
  frame_shape: "Redondo",
  frame_material: "Acetato Premium",
  gender: "Unissex",
  images: [],
  variants: [{ color_name: "Verde", stock_quantity: 5 }],
  face_shape_fit: { oval: "boa" },
};

test.describe("Indicação por formato de rosto", () => {
  test("regras puras: normaliza, sugere e lista rostos ideais", () => {
    expect(normalizeFaceFit({ oval: "ideal", foo: "ideal", quadrado: "xpto" })).toEqual({ oval: "ideal" });
    expect(normalizeFaceFit('{"redondo":"boa"}')).toEqual({ redondo: "boa" });
    expect(normalizeFaceFit(null)).toEqual({});
    expect(suggestFaceFit("Redondo").redondo).toBe("baixa");
    expect(suggestFaceFit("Outro")).toEqual({});
    expect(idealFaceLabels({ oval: "ideal", quadrado: "boa" })).toEqual(["Oval"]);
  });

  test("página do produto: imagem dos rostos e escolha do formato mostram uma resposta", async ({ page }) => {
    await page.goto("/produto/ventara-safari");
    await page.addStyleTag({ content: '[aria-label*="Consentimento"]{display:none !important}' });

    await page.getByRole("button", { name: /Indicação de Geometria Facial/i }).click();
    await expect(page.getByAltText(/seis formatos de rosto/i)).toBeVisible();

    const group = page.getByRole("radiogroup", { name: "Formato do meu rosto" });
    await expect(group.getByRole("radio")).toHaveCount(6);

    await group.getByRole("radio", { name: "Quadrado", exact: true }).click();
    await expect(group.getByRole("radio", { name: "Quadrado", exact: true })).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("[aria-live='polite']").last()).toContainText(/compatibilidade|Ainda não avaliamos|Ainda não temos|rosto/i);
  });

  test("admin: marca compatibilidade por rosto e envia face_shape_fit ao salvar", async ({ page, context }) => {
    await context.addCookies([
      { name: "pw_bypass_token", value: "ventara-playwright-local-bypass-token", url: "http://localhost:3000" },
    ]);

    let savedBody: any = null;
    await page.route(`**/api/admin/products?id=${PRODUCT_ID}`, (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, product: PRODUCT }) })
    );
    await page.route("**/api/admin/products", async (route) => {
      if (route.request().method() === "PATCH") {
        savedBody = JSON.parse(route.request().postData() || "{}");
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, product: PRODUCT }) });
      }
      return route.continue();
    });

    await page.goto(`/admin/produtos/${PRODUCT_ID}`);
    await page.addStyleTag({ content: '[aria-label*="Consentimento"]{display:none !important}' });

    // Carrega o que já estava salvo (Oval = Boa)
    const oval = page.getByRole("radiogroup", { name: "Compatibilidade com rosto Oval" });
    await expect(oval.getByRole("radio", { name: /Boa/ })).toHaveAttribute("aria-checked", "true");

    // Quadrado = Ideal
    await page
      .getByRole("radiogroup", { name: "Compatibilidade com rosto Quadrado" })
      .getByRole("radio", { name: /Ideal/ })
      .click();

    // Sugestão automática pelo formato (Redondo): redondo vira Baixa
    await page.getByRole("button", { name: /Sugerir pelo formato/ }).click();
    await expect(
      page.getByRole("radiogroup", { name: "Compatibilidade com rosto Redondo" }).getByRole("radio", { name: /Baixa/ })
    ).toHaveAttribute("aria-checked", "true");

    // Ajuste manual depois da sugestão
    await page
      .getByRole("radiogroup", { name: "Compatibilidade com rosto Angular" })
      .getByRole("radio", { name: /Regular/ })
      .click();

    await page.getByRole("button", { name: /Salvar/ }).first().click();
    await expect.poll(() => savedBody?.face_shape_fit?.angular).toBe("regular");
    expect(savedBody.face_shape_fit.redondo).toBe("baixa");
  });
});
