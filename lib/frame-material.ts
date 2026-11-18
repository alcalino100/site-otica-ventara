import type { FrameMaterial, FrameShape, FrameType } from "@/types/ecommerce";

/** Valores aceitos pelo banco (CHECK products_frame_material_check). */
export const FRAME_MATERIALS: FrameMaterial[] = [
  "Acetato Premium",
  "Metal Titânio",
  "Injetado",
  "Madeira / Misto",
  "Outro",
];

/** Opções mostradas nos formulários do admin (valor aceito pelo banco + rótulo amigável). */
export const FRAME_MATERIAL_OPTIONS: Array<{ value: FrameMaterial; label: string }> = [
  { value: "Acetato Premium", label: "Acetato Premium" },
  { value: "Metal Titânio", label: "Metal / Aço / Titânio" },
  { value: "Injetado", label: "Injetado TR-90 (leve)" },
  { value: "Madeira / Misto", label: "Madeira / Misto (acetato + metal)" },
  { value: "Outro", label: "Outro" },
];

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Converte qualquer texto de material (valores antigos, planilha CSV, digitação livre)
 * em um valor aceito pelo banco. Nunca devolve algo que viole a constraint.
 */
export function normalizeFrameMaterial(raw: unknown): FrameMaterial {
  if (typeof raw !== "string" || !raw.trim()) return "Acetato Premium";
  const exact = FRAME_MATERIALS.find((m) => m === raw.trim());
  if (exact) return exact;
  const v = fold(raw);
  if (v.includes("acetato") && !v.includes("metal") && !v.includes("misto")) return "Acetato Premium";
  if (v.includes("misto") || v.includes("madeira") || (v.includes("acetato") && v.includes("metal"))) return "Madeira / Misto";
  if (v.includes("titan") || v.includes("metal") || v.includes("aco") || v.includes("inox")) return "Metal Titânio";
  if (v.includes("injet") || v.includes("tr-90") || v.includes("tr90") || v.includes("plastic") || v.includes("nylon")) return "Injetado";
  return "Outro";
}

/** Tipos aceitos pelo banco (CHECK products_frame_type_check). "Infantil" é gênero, não tipo. */
export const FRAME_TYPES: FrameType[] = ["Grau", "Solar", "Clip-on"];

export function normalizeFrameType(raw: unknown): FrameType {
  if (typeof raw !== "string") return "Grau";
  const v = fold(raw);
  if (v.includes("solar") || v.includes("sol")) return "Solar";
  if (v.includes("clip")) return "Clip-on";
  return "Grau";
}

/** Formatos aceitos pelo banco (CHECK products_frame_shape_check). */
export const FRAME_SHAPES: FrameShape[] = ["Quadrado", "Redondo", "Retangular", "Gatinho", "Aviador", "Hexagonal", "Oval", "Outro"];

export function normalizeFrameShape(raw: unknown): FrameShape | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const exact = FRAME_SHAPES.find((x) => fold(x) === fold(raw));
  return exact ?? "Outro";
}
