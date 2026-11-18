import { test, expect } from "@playwright/test";
import {
  FRAME_MATERIALS,
  FRAME_MATERIAL_OPTIONS,
  FRAME_SHAPES,
  FRAME_TYPES,
  normalizeFrameMaterial,
  normalizeFrameShape,
  normalizeFrameType,
} from "../lib/frame-material";

// Valores aceitos pelo CHECK do banco (supabase/migrations/20261020000001_ecommerce_foundation.sql)
const DB_MATERIAL = ["Acetato Premium", "Metal Titânio", "Injetado", "Madeira / Misto", "Outro"];
const DB_SHAPE = ["Quadrado", "Redondo", "Retangular", "Gatinho", "Aviador", "Hexagonal", "Oval", "Outro"];
const DB_TYPE = ["Grau", "Solar", "Clip-on"];

test("material/formato/tipo: opções do admin e normalização nunca violam o banco", () => {
  expect(FRAME_MATERIALS).toEqual(DB_MATERIAL);
  expect(FRAME_SHAPES).toEqual(DB_SHAPE);
  expect(FRAME_TYPES).toEqual(DB_TYPE);
  for (const o of FRAME_MATERIAL_OPTIONS) expect(DB_MATERIAL).toContain(o.value);

  // valores que causavam o erro "products_frame_material_check" e similares
  const entradas = ["Metal Nobre", "Titânio", "Injetado Leve", "Misto", "Aço Cirúrgico", "metal", "TR-90", "", null, undefined, "qualquer coisa"];
  for (const e of entradas) expect(DB_MATERIAL).toContain(normalizeFrameMaterial(e));

  expect(normalizeFrameMaterial("Metal Nobre")).toBe("Metal Titânio");
  expect(normalizeFrameMaterial("Titânio")).toBe("Metal Titânio");
  expect(normalizeFrameMaterial("Injetado Leve")).toBe("Injetado");
  expect(normalizeFrameMaterial("Misto")).toBe("Madeira / Misto");
  expect(normalizeFrameMaterial("Acetato Premium")).toBe("Acetato Premium");

  for (const e of ["Geométrico", "gatinho", "Oval", null]) {
    const r = normalizeFrameShape(e);
    if (r !== null) expect(DB_SHAPE).toContain(r);
  }
  expect(normalizeFrameShape("Geométrico")).toBe("Outro");
  for (const e of ["Infantil", "solar", "Clip-on", "x"]) expect(DB_TYPE).toContain(normalizeFrameType(e));
  expect(normalizeFrameType("Infantil")).toBe("Grau");
});
