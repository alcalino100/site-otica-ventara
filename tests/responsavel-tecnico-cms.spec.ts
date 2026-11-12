import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { getPageDefaultValues, getPageDefinition } from "../lib/content/registry";

test.describe("Responsável Técnico: todo o texto da página é editável no admin", () => {
  const pageSource = fs.readFileSync(
    path.join(process.cwd(), "app/responsavel-tecnico/page.tsx"),
    "utf8"
  );

  test("1. Toda chave lida pela página (t / img) existe no registro com texto padrão", () => {
    const defaults = getPageDefaultValues("responsavelTecnico");
    const keys = new Set<string>();
    for (const match of pageSource.matchAll(/\b(?:t|img)\("([A-Za-z0-9]+)"\)/g)) keys.add(match[1]);

    expect(keys.size).toBeGreaterThan(40);
    for (const key of keys) {
      expect(defaults[key], `chave "${key}" sem padrão no registro`).toBeTruthy();
    }
  });

  test("2. Nome padrão é o do técnico real, não um texto genérico", () => {
    const defaults = getPageDefaultValues("responsavelTecnico");
    expect(defaults.techName).toBe("Gustavo Guimarães Cordeiro");
  });

  test("3. O admin mostra 5 seções e as fotos são campos de imagem", () => {
    const definition = getPageDefinition("responsavelTecnico");
    expect(definition?.sections.map((s) => s.id)).toEqual([
      "technicalData",
      "presentation",
      "pillars",
      "lab",
      "finalCta",
    ]);
    const fields = definition!.sections.flatMap((s) => s.fields);
    expect(fields.find((f) => f.key === "techPhoto")?.type).toBe("image");
    expect(fields.find((f) => f.key === "labPhoto")?.type).toBe("image");
    // Ids únicos (o admin usa o id como chave de renderização)
    expect(new Set(fields.map((f) => f.id)).size).toBe(fields.length);
  });
});
