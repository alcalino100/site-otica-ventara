import { calculateContrast, ContrastResult } from "@/lib/color-contrast";

/**
 * Identificadores dos Presets de Fundo Disponíveis no Sistema de CMS da Ventara.
 */
export type BackgroundPresetId =
  | "optisync"
  | "dark"
  | "offwhite"
  | "custom_image"
  | "default";

/**
 * Tom do preset para controle estrito de legibilidade e acessibilidade (WCAG AA).
 */
export type BackgroundTone = "dark" | "light" | "neutral";

/**
 * Metadados de um Preset de Fundo para exibição no Switcher do Admin.
 */
export interface BackgroundPresetMeta {
  id: BackgroundPresetId;
  name: string;
  description: string;
  tone: BackgroundTone;
  badge: string;
  previewGradient: string;
  recommendedFor: string[];
}

/**
 * Configuração Completa de Fundo Resolvida para Renderização em Páginas.
 */
export interface PageBackgroundConfig {
  preset: BackgroundPresetId | string;
  tone: BackgroundTone;
  beamsIntensity: number; // 0 to 100
  glowIntensity: number; // 0 to 100
  enableAnimation: boolean;
  enableHudGrid: boolean;
  gradientBaseFrom: string;
  gradientBaseTo: string;
  colorVioletLeft: string;
  colorVioletGlow: string;
  colorBlueRight: string;
  colorMagentaSpot: string;
  customBgDesktopUrl?: string;
  customBgMobileUrl?: string;
  bgOverlayOpacity?: number; // 0 to 100
  bgFocalPoint?: "center" | "top" | "bottom" | "left" | "right";
}

/**
 * Lista Canônica dos Presets de Fundo da Ventara.
 */
export const BACKGROUND_PRESETS: BackgroundPresetMeta[] = [
  {
    id: "optisync",
    name: "Tecnológico OptiSYNC",
    description: "Feixes gradientes violeta/azul elétrico, brilho central magenta e grade HUD óptica.",
    tone: "dark",
    badge: "Sucesso OptiSYNC",
    previewGradient: "radial-gradient(circle at 50% 30%, #000933, #00051E)",
    recommendedFor: ["/optisync", "/lentes", "/lentes-coloridas"],
  },
  {
    id: "dark",
    name: "Escuro Ventara",
    description: "Midnight blue profundo (#02070D), acabamento elegante e minimalista de alto contraste.",
    tone: "dark",
    badge: "Minimalista",
    previewGradient: "radial-gradient(ellipse at 50% 20%, #06111F 0%, #02070D 75%, #01040A 100%)",
    recommendedFor: ["/entregas", "/optisync", "/produtos"],
  },
  {
    id: "offwhite",
    name: "Off-white Ventara",
    description: "Fundo nobre em off-white (#FAF8F4) de máxima legibilidade, sofisticação e claridade.",
    tone: "light",
    badge: "Institucional",
    previewGradient: "linear-gradient(180deg, #FAF8F4 0%, #F5F1EB 60%, #EFE9DF 100%)",
    recommendedFor: ["/", "/armacoes", "/entregas", "/politicas"],
  },
  {
    id: "custom_image",
    name: "Imagem Personalizada",
    description: "Fotografia própria para desktop e mobile com sobreposição escura e enquadramento focal.",
    tone: "dark",
    badge: "Personalizado",
    previewGradient: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    recommendedFor: ["Campanhas", "Banners especiais"],
  },
  {
    id: "default",
    name: "Padrão do Site",
    description: "Fundo nativo do layout (transparente ou definido pelo componente da página).",
    tone: "neutral",
    badge: "Nativo",
    previewGradient: "linear-gradient(135deg, #334155 0%, #1e293b 100%)",
    recommendedFor: ["Todas as páginas"],
  },
];

/**
 * Defaults por Preset.
 */
export const DEFAULT_BACKGROUND_CONFIGS: Record<BackgroundPresetId, PageBackgroundConfig> = {
  optisync: {
    preset: "optisync",
    tone: "dark",
    beamsIntensity: 85,
    glowIntensity: 80,
    enableAnimation: true,
    enableHudGrid: true,
    gradientBaseFrom: "#000933",
    gradientBaseTo: "#020716",
    colorVioletLeft: "#4C01AE",
    colorVioletGlow: "#7A2CFF",
    colorBlueRight: "#0044C9",
    colorMagentaSpot: "#B93DAA",
  },
  dark: {
    preset: "dark",
    tone: "dark",
    beamsIntensity: 0,
    glowIntensity: 0,
    enableAnimation: false,
    enableHudGrid: false,
    gradientBaseFrom: "#06111F",
    gradientBaseTo: "#02070D",
    colorVioletLeft: "#06111F",
    colorVioletGlow: "#02070D",
    colorBlueRight: "#06111F",
    colorMagentaSpot: "#02070D",
  },
  offwhite: {
    preset: "offwhite",
    tone: "light",
    beamsIntensity: 0,
    glowIntensity: 0,
    enableAnimation: false,
    enableHudGrid: false,
    gradientBaseFrom: "#FAF8F4",
    gradientBaseTo: "#F5F1EB",
    colorVioletLeft: "#FAF8F4",
    colorVioletGlow: "#F5F1EB",
    colorBlueRight: "#FAF8F4",
    colorMagentaSpot: "#F5F1EB",
  },
  custom_image: {
    preset: "custom_image",
    tone: "dark",
    beamsIntensity: 0,
    glowIntensity: 0,
    enableAnimation: false,
    enableHudGrid: false,
    gradientBaseFrom: "#000933",
    gradientBaseTo: "#020716",
    colorVioletLeft: "#4C01AE",
    colorVioletGlow: "#7A2CFF",
    colorBlueRight: "#0044C9",
    colorMagentaSpot: "#B93DAA",
    customBgDesktopUrl: "",
    customBgMobileUrl: "",
    bgOverlayOpacity: 70,
    bgFocalPoint: "center",
  },
  default: {
    preset: "default",
    tone: "neutral",
    beamsIntensity: 0,
    glowIntensity: 0,
    enableAnimation: false,
    enableHudGrid: false,
    gradientBaseFrom: "transparent",
    gradientBaseTo: "transparent",
    colorVioletLeft: "transparent",
    colorVioletGlow: "transparent",
    colorBlueRight: "transparent",
    colorMagentaSpot: "transparent",
  },
};

/**
 * Obtém os metadados de um preset pelo ID.
 */
export function getBackgroundPreset(id?: string): BackgroundPresetMeta {
  const found = BACKGROUND_PRESETS.find((p) => p.id === id);
  return found || BACKGROUND_PRESETS[0]; // fallback to optisync
}

/**
 * Resolução Robusta e Símétrica de Configuração de Fundo:
 * Combina valores vindos do motor de conteúdo (`site_content`) com fallbacks
 * de configurações legadas (`optisync_page_settings`) ou padrões do preset.
 */
export function resolveBackgroundConfig(
  presetOrContent: string | Record<string, any> = {},
  fallbackSettings?: any
): PageBackgroundConfig {
  // Determina o ID do preset e os valores de conteúdo
  let presetId: BackgroundPresetId = "default";
  let contentValues: Record<string, any> = {};

  if (typeof presetOrContent === "string") {
    presetId = (presetOrContent as BackgroundPresetId) || "default";
    contentValues =
      fallbackSettings && typeof fallbackSettings === "object" ? fallbackSettings : {};
  } else if (presetOrContent && typeof presetOrContent === "object") {
    contentValues = presetOrContent;
    if (contentValues.backgroundPreset) {
      presetId = contentValues.backgroundPreset as BackgroundPresetId;
    } else if (fallbackSettings?.bgMode === "custom_image") {
      presetId = "custom_image";
    } else if (fallbackSettings?.bgMode === "code" || fallbackSettings?.gradientBaseFrom) {
      presetId = "optisync";
    }
  }

  // Base com os defaults do preset escolhido
  const defaults = DEFAULT_BACKGROUND_CONFIGS[presetId] || DEFAULT_BACKGROUND_CONFIGS.default;

  // Extrai valores com hierarquia: contentValues > fallbackSettings > defaults
  const gradientBaseFrom =
    contentValues.gradientBaseFrom ||
    fallbackSettings?.gradientBaseFrom ||
    defaults.gradientBaseFrom;

  const gradientBaseTo =
    contentValues.gradientBaseTo ||
    fallbackSettings?.gradientBaseTo ||
    defaults.gradientBaseTo;

  const colorVioletLeft =
    contentValues.colorVioletLeft ||
    fallbackSettings?.colorVioletLeft ||
    defaults.colorVioletLeft;

  const colorVioletGlow =
    contentValues.colorVioletGlow ||
    fallbackSettings?.colorVioletGlow ||
    defaults.colorVioletGlow;

  const colorBlueRight =
    contentValues.colorBlueRight ||
    fallbackSettings?.colorBlueRight ||
    defaults.colorBlueRight;

  const colorMagentaSpot =
    contentValues.colorMagentaSpot ||
    fallbackSettings?.colorMagentaSpot ||
    defaults.colorMagentaSpot;

  const beamsIntensity =
    contentValues.beamsIntensity !== undefined
      ? Number(contentValues.beamsIntensity)
      : fallbackSettings?.beamsIntensity !== undefined
      ? Number(fallbackSettings.beamsIntensity)
      : defaults.beamsIntensity;

  const glowIntensity =
    contentValues.glowIntensity !== undefined
      ? Number(contentValues.glowIntensity)
      : fallbackSettings?.glowIntensity !== undefined
      ? Number(fallbackSettings.glowIntensity)
      : defaults.glowIntensity;

  const enableAnimation =
    contentValues.enableAnimation !== undefined
      ? Boolean(contentValues.enableAnimation)
      : fallbackSettings?.enableAnimation !== undefined
      ? Boolean(fallbackSettings.enableAnimation)
      : defaults.enableAnimation;

  const enableHudGrid =
    contentValues.enableHudGrid !== undefined
      ? Boolean(contentValues.enableHudGrid)
      : defaults.enableHudGrid;

  const customBgDesktopUrl =
    contentValues.customBgDesktopUrl ||
    fallbackSettings?.customBgDesktopUrl ||
    defaults.customBgDesktopUrl;

  const customBgMobileUrl =
    contentValues.customBgMobileUrl ||
    fallbackSettings?.customBgMobileUrl ||
    defaults.customBgMobileUrl;

  const bgOverlayOpacity =
    contentValues.bgOverlayOpacity !== undefined
      ? Number(contentValues.bgOverlayOpacity)
      : fallbackSettings?.bgOverlayOpacity !== undefined
      ? Number(fallbackSettings.bgOverlayOpacity)
      : defaults.bgOverlayOpacity;

  const bgFocalPoint =
    contentValues.bgFocalPoint ||
    fallbackSettings?.bgFocalPoint ||
    defaults.bgFocalPoint ||
    "center";

  const meta = getBackgroundPreset(presetId);

  return {
    preset: presetId,
    tone: meta.tone,
    beamsIntensity,
    glowIntensity,
    enableAnimation,
    enableHudGrid,
    gradientBaseFrom,
    gradientBaseTo,
    colorVioletLeft,
    colorVioletGlow,
    colorBlueRight,
    colorMagentaSpot,
    customBgDesktopUrl,
    customBgMobileUrl,
    bgOverlayOpacity,
    bgFocalPoint,
  };
}

/**
 * Mapeamento do Tom Nativo das Páginas do Site para Auditoria de Legibilidade.
 */
const PAGE_NATIVE_TONES: Record<string, BackgroundTone> = {
  optisync: "dark",
  entregas: "light",
  home: "light",
  armacoes: "light",
  lentes: "light",
  lentesColoridas: "light",
  medicaoPorFoto: "light",
  rastrearPedido: "light",
  responsavelTecnico: "light",
  politicas: "light",
  produtoTemplate: "light",
};

/**
 * Validação de Compatibilidade de Tom entre a Página e o Preset Escolhido.
 * Impede que uma página com texto fixo claro receba um fundo claro,
 * ou uma página com texto escuro receba fundo escuro sem antes ser adaptada.
 */
export function checkPageToneCompatibility(
  pageId: string,
  targetPresetId: BackgroundPresetId | string
): {
  isCompatible: boolean;
  pageNativeTone: BackgroundTone;
  targetTone: BackgroundTone;
  warning?: string;
} {
  const nativeTone = PAGE_NATIVE_TONES[pageId] || "neutral";
  const targetMeta = getBackgroundPreset(targetPresetId);
  const targetTone = targetMeta.tone;

  // Preset neutro (padrão) sempre compatível
  if (targetTone === "neutral" || targetPresetId === "default") {
    return {
      isCompatible: true,
      pageNativeTone: nativeTone,
      targetTone,
    };
  }

  // Se os tons são compatíveis
  if (nativeTone === targetTone) {
    return {
      isCompatible: true,
      pageNativeTone: nativeTone,
      targetTone,
    };
  }

  // Página optisync é nativamente escura (dark)
  if (pageId === "optisync" && targetTone === "light") {
    return {
      isCompatible: false,
      pageNativeTone: nativeTone,
      targetTone,
      warning:
        "A página OptiSYNC possui textos e tipografias claras (#F4F6FF). Aplicar o preset Off-white causaria contraste insuficiente até que os tokens semânticos sejam totalmente adaptados.",
    };
  }

  // Páginas nativamente claras com preset escuro
  if (nativeTone === "light" && targetTone === "dark") {
    return {
      isCompatible: false,
      pageNativeTone: nativeTone,
      targetTone,
      warning:
        "Esta página possui textos pretos nativos. Aplicar um fundo escuro comprometerá a legibilidade enquanto a página não for migrada para os tokens dinâmicos.",
    };
  }

  return {
    isCompatible: true,
    pageNativeTone: nativeTone,
    targetTone,
  };
}

/**
 * Cálculo do Contraste WCAG AA para o Fundo com a Tipografia Primária.
 */
export function calculateBackgroundContrast(
  config: PageBackgroundConfig,
  textColor?: string
): ContrastResult {
  const effectiveBgColor =
    config.preset === "offwhite"
      ? config.gradientBaseFrom || "#FAF8F4"
      : config.preset === "dark"
      ? config.gradientBaseTo || "#02070D"
      : config.preset === "optisync"
      ? config.gradientBaseFrom || "#000933"
      : "#000933";

  const effectiveTextColor =
    textColor || (config.tone === "light" ? "#06111F" : "#F4F6FF");

  return calculateContrast(effectiveTextColor, effectiveBgColor);
}
