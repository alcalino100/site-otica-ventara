/**
 * Opções de compra das lentes Zentara (página /zentara).
 * Para definir o preço, preencha `price` (ex.: "R$ 299,90"). Enquanto estiver
 * vazio, o cartão mostra "Consulte o valor" e o botão leva ao WhatsApp.
 */
export interface ZentaraOption {
  id: string;
  name: string;
  index: string;
  tagline: string;
  highlights: string[];
  price: string;
  featured?: boolean;
}

export const ZENTARA_OPTIONS: ZentaraOption[] = [
  {
    id: "zentara-156",
    name: "Zentara 1.56",
    index: "1.56",
    tagline: "Equilíbrio entre leveza e custo-benefício",
    highlights: ["Antirreflexo premium", "Tratamento hidrofóbico", "12 meses de garantia"],
    price: "",
  },
  {
    id: "zentara-167",
    name: "Zentara 1.67",
    index: "1.67",
    tagline: "Mais fina e leve para graus médios e altos",
    highlights: ["Antirreflexo premium", "Tratamento hidrofóbico", "12 meses de garantia"],
    price: "",
  },
  {
    id: "zentara-174",
    name: "Zentara 1.74",
    index: "1.74",
    tagline: "Ultrafina: a lente mais fina para graus elevados",
    highlights: ["Antirreflexo premium", "Tratamento hidrofóbico", "12 meses de garantia"],
    price: "",
    featured: true,
  },
];
