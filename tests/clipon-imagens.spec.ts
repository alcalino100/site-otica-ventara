import { test, expect } from "@playwright/test";
import { isGrauOuClipon } from "../lib/frame-material";
import { IMAGE_QUALITY, optimizedSrc } from "../lib/image-url";

test("clip-on conta como armação de grau (aparece em Grau Masculino/Feminino)", () => {
  expect(isGrauOuClipon("Clip-on")).toBe(true);
  expect(isGrauOuClipon("Grau")).toBe(true);
  expect(isGrauOuClipon("Solar")).toBe(false);
  expect(isGrauOuClipon(null)).toBe(false);
});

test("imagens otimizadas saem com qualidade alta", () => {
  expect(IMAGE_QUALITY).toBeGreaterThanOrEqual(85);
  expect(optimizedSrc("/images/a.jpg", 640)).toContain(`q=${IMAGE_QUALITY}`);
});
