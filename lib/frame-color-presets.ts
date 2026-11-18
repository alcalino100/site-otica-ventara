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
const TORTOISE = /tartaruga|havana|demi|casco/i;

function shade(hex: string, amount: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v + (amount >= 0 ? (255 - v) * amount : v * amount))));
  const r = ch((n >> 16) & 255);
  const g = ch((n >> 8) & 255);
  const b = ch(n & 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Mancha irregular e suave (elipse com borda esfumada), para parecer acetato de verdade
function blotch(x: number, y: number, w: number, h: number, color: string): string {
  return `radial-gradient(ellipse ${w}% ${h}% at ${x}% ${y}%, ${color} 0%, ${color} 35%, transparent 100%)`;
}

/**
 * Fundo da bolinha de amostra. Onça/animal print e tartaruga imitam o acetato (manchas macias
 * em marrom, laranja e preto sobre um fundo caramelo); as demais cores ganham brilho suave.
 */
export function swatchBackground(name?: string | null, hex?: string | null): string {
  // Cor padrão/placeholder (admin não escolheu): usa a cor da lista pronta com o mesmo nome, se houver
  const PLACEHOLDERS = ["#0f172a", "#1e293b", "#475569"];
  const preset = name
    ? FRAME_COLOR_PRESETS.find((p) => p.name.toLowerCase() === name.trim().toLowerCase())
    : undefined;
  const base = preset && (!hex || PLACEHOLDERS.includes(hex.toLowerCase())) ? preset.hex : hex || "#1e293b";

  if (name && (SPOTTED.test(name) || TORTOISE.test(name))) {
    const spotted = SPOTTED.test(name);
    const dark = spotted ? "rgba(28,12,4,.92)" : "rgba(40,18,6,.8)";
    const warm = shade(base, 0.35);
    const deep = shade(base, -0.45);
    return [
      blotch(24, 28, 26, 22, dark),
      blotch(72, 20, 22, 18, dark),
      blotch(54, 54, 24, 20, dark),
      blotch(18, 76, 22, 20, dark),
      blotch(82, 70, 24, 22, dark),
      blotch(40, 10, 16, 12, deep),
      blotch(88, 42, 14, 14, deep),
      blotch(36, 40, 30, 24, warm),
      blotch(66, 82, 30, 20, warm),
      `linear-gradient(135deg, ${warm}, ${base} 55%, ${deep})`,
    ].join(", ");
  }
  // Cor lisa com brilho (claro em cima, escuro embaixo)
  return `linear-gradient(145deg, ${shade(base, 0.18)} 0%, ${base} 50%, ${shade(base, -0.22)} 100%)`;
}

export const FRAME_COLOR_GROUPS = Array.from(new Set(FRAME_COLOR_PRESETS.map((p) => p.group)));
