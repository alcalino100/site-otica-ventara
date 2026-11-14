/**
 * Indicação de armação por formato de rosto (visagismo).
 *
 * O cliente avalia, para cada armação, o quanto ela combina com cada formato de rosto.
 * O site usa essa avaliação para mostrar "meu rosto é ..." + compatibilidade em %.
 */

export const FACE_SHAPES = [
  { id: "oval", label: "Oval" },
  { id: "quadrado", label: "Quadrado" },
  { id: "redondo", label: "Redondo" },
  { id: "retangular", label: "Retangular" },
  { id: "alongado", label: "Alongado" },
  { id: "angular", label: "Angular" },
] as const;

export type FaceShapeId = (typeof FACE_SHAPES)[number]["id"];

export type FitLevel = "ideal" | "boa" | "regular" | "baixa";

/**
 * Percentual mostrado ao cliente para cada nível.
 * Ponto único de ajuste: o cliente está refinando esses valores — basta mudar aqui.
 */
export const FIT_LEVELS: ReadonlyArray<{
  id: FitLevel;
  label: string;
  percent: number;
  /** Frase mostrada quando a pessoa escolhe o próprio formato de rosto. */
  message: string;
}> = [
  { id: "ideal", label: "Ideal", percent: 100, message: "Indicada para o seu formato de rosto." },
  { id: "boa", label: "Boa", percent: 80, message: "Mesmo assim, combina bem com o seu rosto." },
  { id: "regular", label: "Regular", percent: 60, message: "Pode ficar razoável, mas existem opções mais indicadas." },
  { id: "baixa", label: "Baixa", percent: 40, message: "Existem opções mais indicadas para o seu formato de rosto." },
];

export type FaceShapeFit = Partial<Record<FaceShapeId, FitLevel>>;

const FACE_IDS = new Set<string>(FACE_SHAPES.map((f) => f.id));
const LEVEL_IDS = new Set<string>(FIT_LEVELS.map((l) => l.id));

export function faceShapeLabel(id: FaceShapeId): string {
  return FACE_SHAPES.find((f) => f.id === id)?.label ?? id;
}

export function fitLevelInfo(level: FitLevel) {
  return FIT_LEVELS.find((l) => l.id === level) ?? FIT_LEVELS[FIT_LEVELS.length - 1];
}

/** Aceita qualquer valor vindo do banco/admin e devolve só pares válidos (rosto → nível). */
export function normalizeFaceFit(raw: unknown): FaceShapeFit {
  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const out: FaceShapeFit = {};
  for (const [face, level] of Object.entries(value as Record<string, unknown>)) {
    if (FACE_IDS.has(face) && typeof level === "string" && LEVEL_IDS.has(level)) {
      out[face as FaceShapeId] = level as FitLevel;
    }
  }
  return out;
}

export function hasFaceFit(fit?: FaceShapeFit | null): boolean {
  return Boolean(fit && Object.keys(fit).length > 0);
}

/** Rostos em que a armação é "Ideal" (mantém a coluna antiga face_shape_recommendations coerente). */
export function idealFaceLabels(fit?: FaceShapeFit | null): string[] {
  if (!fit) return [];
  return FACE_SHAPES.filter((f) => fit[f.id] === "ideal").map((f) => f.label);
}

/**
 * Ponto de partida para o admin: regra clássica de visagismo (formas contrastantes se equilibram).
 * É só uma sugestão — o cliente revisa e ajusta antes de salvar.
 */
const SUGGESTIONS: Record<string, FaceShapeFit> = {
  Quadrado: { oval: "ideal", quadrado: "baixa", redondo: "ideal", retangular: "regular", alongado: "ideal", angular: "regular" },
  Redondo: { oval: "ideal", quadrado: "ideal", redondo: "baixa", retangular: "boa", alongado: "regular", angular: "boa" },
  Retangular: { oval: "ideal", quadrado: "regular", redondo: "ideal", retangular: "baixa", alongado: "baixa", angular: "regular" },
  Gatinho: { oval: "ideal", quadrado: "boa", redondo: "boa", retangular: "boa", alongado: "regular", angular: "ideal" },
  Aviador: { oval: "ideal", quadrado: "ideal", redondo: "regular", retangular: "boa", alongado: "boa", angular: "boa" },
  Hexagonal: { oval: "ideal", quadrado: "regular", redondo: "ideal", retangular: "regular", alongado: "boa", angular: "regular" },
  Oval: { oval: "ideal", quadrado: "ideal", redondo: "regular", retangular: "ideal", alongado: "boa", angular: "ideal" },
};

export function suggestFaceFit(frameShape?: string | null): FaceShapeFit {
  return { ...(frameShape ? SUGGESTIONS[frameShape] : undefined) };
}
