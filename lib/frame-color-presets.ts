/**
 * Cores prontas para armações: o admin escolhe com um clique e nome + amostra já vêm preenchidos.
 * Para ajustar a lista (nomes/tons), edite só este arquivo.
 */
export interface FrameColorPreset {
  name: string;
  hex: string;
  group: "Onça / Animal print" | "Tartaruga e marrons" | "Neutras" | "Transparentes" | "Coloridas" | "Metálicas";
}

export const FRAME_COLOR_PRESETS: FrameColorPreset[] = [
  // Onça / Animal print: varia do mais claro ao mais escuro
  { name: "Onça Claro", hex: "#d9b97a", group: "Onça / Animal print" },
  { name: "Onça", hex: "#b07a2e", group: "Onça / Animal print" },
  { name: "Onça Escuro", hex: "#6b3f17", group: "Onça / Animal print" },
  { name: "Animal Print", hex: "#8a5a22", group: "Onça / Animal print" },
  // Tartaruga e marrons
  { name: "Tartaruga", hex: "#7a4b25", group: "Tartaruga e marrons" },
  { name: "Tartaruga Claro", hex: "#b9865a", group: "Tartaruga e marrons" },
  { name: "Havana", hex: "#5a3418", group: "Tartaruga e marrons" },
  { name: "Marrom", hex: "#4a2c17", group: "Tartaruga e marrons" },
  { name: "Caramelo", hex: "#b8742f", group: "Tartaruga e marrons" },
  // Neutras
  { name: "Preto", hex: "#0f0f10", group: "Neutras" },
  { name: "Preto Fosco", hex: "#26282b", group: "Neutras" },
  { name: "Grafite", hex: "#4b5058", group: "Neutras" },
  { name: "Cinza", hex: "#9aa0a8", group: "Neutras" },
  { name: "Branco", hex: "#f5f5f2", group: "Neutras" },
  { name: "Nude", hex: "#e3c4ab", group: "Neutras" },
  // Transparentes
  { name: "Transparente", hex: "#e8edf0", group: "Transparentes" },
  { name: "Cristal", hex: "#d7e3ea", group: "Transparentes" },
  { name: "Fumê Transparente", hex: "#9b9a9c", group: "Transparentes" },
  { name: "Rosa Transparente", hex: "#f0cdd2", group: "Transparentes" },
  // Coloridas
  { name: "Azul Marinho", hex: "#1c2d52", group: "Coloridas" },
  { name: "Azul", hex: "#2f6fb5", group: "Coloridas" },
  { name: "Verde", hex: "#1f5a43", group: "Coloridas" },
  { name: "Vinho", hex: "#5e1a2a", group: "Coloridas" },
  { name: "Vermelho", hex: "#b3202c", group: "Coloridas" },
  { name: "Rosa", hex: "#e09aae", group: "Coloridas" },
  { name: "Roxo", hex: "#5a3a82", group: "Coloridas" },
  // Metálicas
  { name: "Dourado", hex: "#c9a24a", group: "Metálicas" },
  { name: "Prata", hex: "#c3c7cc", group: "Metálicas" },
  { name: "Rose Gold", hex: "#d6a590", group: "Metálicas" },
  { name: "Grafite Metálico", hex: "#5c6168", group: "Metálicas" },
];

const SPOTTED = /on[cç]a|animal\s*print/i;

/**
 * Fundo da bolinha de amostra: cor sólida, e com manchas escuras quando for onça/animal print,
 * para parecer a estampa de verdade.
 */
export function swatchBackground(name?: string | null, hex?: string | null): string {
  // Cor padrão/placeholder (admin não escolheu): usa a cor da lista pronta com o mesmo nome, se houver
  const PLACEHOLDERS = ["#0f172a", "#1e293b", "#475569"];
  const preset = name
    ? FRAME_COLOR_PRESETS.find((p) => p.name.toLowerCase() === name.trim().toLowerCase())
    : undefined;
  const base = preset && (!hex || PLACEHOLDERS.includes(hex.toLowerCase())) ? preset.hex : hex || "#1e293b";
  if (name && SPOTTED.test(name)) {
    return [
      "radial-gradient(circle at 28% 30%, transparent 0 4%, rgba(25,14,5,.85) 5% 11%, transparent 12%)",
      "radial-gradient(circle at 70% 22%, transparent 0 4%, rgba(25,14,5,.85) 5% 11%, transparent 12%)",
      "radial-gradient(circle at 50% 56%, transparent 0 4%, rgba(25,14,5,.85) 5% 11%, transparent 12%)",
      "radial-gradient(circle at 20% 74%, transparent 0 4%, rgba(25,14,5,.85) 5% 11%, transparent 12%)",
      "radial-gradient(circle at 80% 68%, transparent 0 4%, rgba(25,14,5,.85) 5% 11%, transparent 12%)",
      "radial-gradient(circle at 52% 18%, transparent 0 4%, rgba(25,14,5,.85) 5% 11%, transparent 12%)",
      "radial-gradient(circle at 84% 40%, transparent 0 4%, rgba(25,14,5,.85) 5% 11%, transparent 12%)",
      base,
    ].join(", ");
  }
  return base;
}

export const FRAME_COLOR_GROUPS = Array.from(new Set(FRAME_COLOR_PRESETS.map((p) => p.group)));
