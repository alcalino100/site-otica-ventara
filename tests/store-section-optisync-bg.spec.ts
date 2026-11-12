import { test, expect } from "@playwright/test";
import { getPageDefaultValues, getPageDefinition } from "../lib/content/registry";

test.describe("Seção 'Venha conhecer a Óticas Ventara': fundo OptiSYNC controlado pelo admin", () => {
  test("1. Campo de toggle existe no registro, desativado por padrão e com rótulos próprios", () => {
    const defaults = getPageDefaultValues("home");
    expect(defaults.storeUseOptisyncBg).toBe(false);

    const home = getPageDefinition("home");
    const store = home?.sections.find((section) => section.id === "store");
    const field = store?.fields.find((f) => f.key === "storeUseOptisyncBg");

    expect(field?.type).toBe("toggle");
    expect(field?.toggleLabels?.on).toBe("Fundo OptiSYNC Ativado");
    expect(field?.toggleLabels?.off).toBe("Fundo OptiSYNC Desativado");
  });

  test("2. A descrição da seção usa a mesma chave do admin (storeDescription)", () => {
    const defaults = getPageDefaultValues("home");
    expect(typeof defaults.storeDescription).toBe("string");
    expect(defaults).not.toHaveProperty("storeDesc");
  });
});
