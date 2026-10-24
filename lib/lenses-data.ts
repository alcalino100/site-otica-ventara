export interface AdminLensItem {
  id: string;
  name: string;
  category: "visao-simples" | "multifocal" | "tratamentos";
  brandName: string;
  brandLogo: string;
  treatment: string;
  badge?: string;
  startingPrice: string;
  installment: string;
  leadTime: string;
  description: string;
  features: string[];
  isActive?: boolean;
}

export const DEFAULT_LENSES: AdminLensItem[] = [
  // ---------------- VISÃO SIMPLES ----------------
  {
    id: "optisync-hd-ar",
    name: "OPTiSYNC HD Antirreflexo",
    category: "visao-simples",
    brandName: "OPTiSYNC HD",
    brandLogo: "/logos/optisync.svg",
    treatment: "Antirreflexo Super AR + Proteção UV400",
    badge: "Ventara Exclusivo",
    startingPrice: "R$ 129,90",
    installment: "10x de R$ 12,99 sem juros",
    leadTime: "Pronto em até 1 hora",
    description:
      "Visão cristalina com antirreflexo de alta transparência. Cortada e montada na hora em nosso laboratório próprio de Araçatuba.",
    features: [
      "Antirreflexo multicamadas de alta clareza",
      "Proteção total contra radiação UVA/UVB 400nm",
      "Sem intermediários: preço direto da ótica",
      "Montagem expressa em até 1h na biseladora digital",
    ],
    isActive: true,
  },
  {
    id: "optisync-hd-blue",
    name: "OPTiSYNC HD Blue Protect",
    category: "visao-simples",
    brandName: "OPTiSYNC HD",
    brandLogo: "/logos/optisync.svg",
    treatment: "Filtro Luz Azul Digital + Antirreflexo AR Super",
    badge: "Ventara Exclusivo · Telas",
    startingPrice: "R$ 149,90",
    installment: "10x de R$ 14,99 sem juros",
    leadTime: "Pronto em até 1 hora",
    description:
      "Desenvolvida especialmente para quem usa computador e celular. Bloqueia a radiação azul-violeta nociva, aliviando o cansaço dos olhos e dores de cabeça.",
    features: [
      "Bloqueio da luz azul nociva de monitores e celulares",
      "Antirreflexo especial sem reflexo roxo exagerado",
      "Conforto para longas jornadas de trabalho e estudo",
      "Montagem expressa em até 1h na facetadora própria",
    ],
    isActive: true,
  },
  {
    id: "correct-monofocal",
    name: "Correct Vision Antirreflexo",
    category: "visao-simples",
    brandName: "Lentes Correct",
    brandLogo: "/logos/correct.svg",
    treatment: "Antirreflexo Multicamadas + Proteção UV400",
    badge: "Melhor Custo-Benefício",
    startingPrice: "R$ 99,90",
    installment: "10x de R$ 9,99 sem juros",
    leadTime: "Pronto em até 1 hora",
    description:
      "Visão nítida para miopia, hipermetropia ou astigmatismo. Resina orgânica resistente e leve com tratamento antirreflexo essencial para o dia a dia.",
    features: [
      "Antirreflexo multicamadas antirrisco",
      "Proteção total contra radiação UVA/UVB",
      "Resina ultraleve e resistente a quedas",
      "Montagem ágil no laboratório próprio",
    ],
    isActive: true,
  },
  {
    id: "orgalens-simples",
    name: "Orgalens Mais",
    category: "visao-simples",
    brandName: "Orgalens Mais",
    brandLogo: "/logos/orgaline.svg",
    treatment: "Antirreflexo Multicamadas + Super Hidrorrepelente",
    badge: "Alta Nitidez",
    startingPrice: "R$ 159,90",
    installment: "10x de R$ 15,99 sem juros",
    leadTime: "Montagem ágil em laboratório",
    description:
      "Polímero óptico de alta densidade e pureza. Camada hidrofóbica e oleofóbica que repele poeira, água e marcas de dedos com facilidade superior de limpeza.",
    features: [
      "Matéria-prima de alta pureza óptica",
      "Facilidade superior de limpeza e antiaderente",
      "Durabilidade estendida contra riscos do dia a dia",
      "Excelente transparência luminosa",
    ],
    isActive: true,
  },
  {
    id: "maxxee-hoya-simples",
    name: "Maxxee by HOYA",
    category: "visao-simples",
    brandName: "HOYA / Maxxee",
    brandLogo: "/logos/hoya.svg",
    treatment: "Antirreflexo Hoya Hard Multi Coat (HMC)",
    badge: "Qualidade Global Hoya",
    startingPrice: "R$ 189,00",
    installment: "10x de R$ 18,90 sem juros",
    leadTime: "Montagem de alta precisão",
    description:
      "A consagrada tecnologia da Hoya em uma linha acessível e confiável, com controle de reflexos de alta performance e certificado de autenticidade.",
    features: [
      "Camadas antirreflexo de patente Hoya",
      "Excelente resistência a riscos e desgaste",
      "Camada de contraste para visão noturna",
      "Certificado oficial de garantia Hoya",
    ],
    isActive: true,
  },
  {
    id: "kodak-simples",
    name: "Kodak Visão Simples",
    category: "visao-simples",
    brandName: "Kodak Lens",
    brandLogo: "/logos/kodak.svg",
    treatment: "Antirreflexo Kodak Clean&CleAR + UV400",
    badge: "Tradição em Cores Vivas",
    startingPrice: "R$ 219,00",
    installment: "10x de R$ 21,90 sem juros",
    leadTime: "Montagem de alta precisão",
    description:
      "Mais de um século de liderança em imagem. Lentes que proporcionam cores vibrantes, contrastes nítidos e fidelidade visual impecável.",
    features: [
      "Tratamento Clean&CleAR fácil de limpar",
      "Nitidez aprimorada para leitura e telas",
      "Proteção ultravioleta integrada",
      "Garantia oficial Kodak Lens",
    ],
    isActive: true,
  },

  // ---------------- MULTIFOCAIS ----------------
  {
    id: "orgalens-multi",
    name: "Orgalens Mais Progressive",
    category: "multifocal",
    brandName: "Orgalens Mais",
    brandLogo: "/logos/orgaline.svg",
    treatment: "Tecnologia Digital Free-Form + Hidrorrepelente",
    badge: "Campo Amplo & Suave",
    startingPrice: "R$ 389,00",
    installment: "10x de R$ 38,90 sem juros",
    leadTime: "Calibração personalizada",
    description:
      "Usinagem digital ponto a ponto com design suave nas laterais, reduzindo a sensação de flutuação e acelerando o tempo de adaptação.",
    features: [
      "Surfaçagem digital de alta resolução",
      "Redução de aberrações laterais",
      "Tratamento antirreflexo hidrorrepelente",
      "Conforto para troca de foco entre tela e leitura",
    ],
    isActive: true,
  },
  {
    id: "hoya-multifocal",
    name: "HOYA Daynamic / Amplitude",
    category: "multifocal",
    brandName: "HOYA",
    brandLogo: "/logos/hoya.svg",
    treatment: "Design TrueForm Dupla Face + Hi-Vision",
    badge: "Precisão Óptica Hoya",
    startingPrice: "R$ 499,00",
    installment: "10x de R$ 49,90 sem juros",
    leadTime: "Calibração e montagem rigorosa",
    description:
      "A tecnologia FreeForm da Hoya calculada para a anatomia do seu olhar, proporcionando clareza cristalina e conforto prolongado.",
    features: [
      "Cálculo individual da graduação ponto a ponto",
      "Amplo campo para leitura e uso de computador",
      "Tratamento antirreflexo de altíssima durabilidade",
      "Resistência superior a variações de temperatura",
    ],
    isActive: true,
  },
  {
    id: "varilux-comfort",
    name: "Varilux Comfort Max",
    category: "multifocal",
    brandName: "Varilux (Essilor)",
    brandLogo: "/logos/varilux.svg",
    treatment: "Tecnologia Flex Optim + Antirreflexo Crizal",
    badge: "Líder Mundial em Multifocais",
    startingPrice: "R$ 589,00",
    installment: "10x de R$ 58,90 sem juros",
    leadTime: "Confecção e calibração de alta precisão",
    description:
      "A referência mundial absoluta em lentes multifocais. Permite flexibilidade postural sem ter que mover a cabeça para encontrar o foco.",
    features: [
      "Tecnologia Flex Optim que amplia a zona de foco útil",
      "Máxima estabilidade visual mesmo em movimento",
      "Garantia global de adaptação Varilux Essilor",
      "Compatível com tratamentos Crizal e Transitions",
    ],
    isActive: true,
  },

  // ---------------- TRATAMENTOS ----------------
  {
    id: "tratamento-blue",
    name: "Filtro Luz Azul (BlueProtect)",
    category: "tratamentos",
    brandName: "OPTiSYNC HD & Parceiros",
    brandLogo: "/logos/optisync.svg",
    treatment: "Bloqueio de 400nm a 455nm (HEV) + Antirreflexo",
    badge: "Conforto para Telas",
    startingPrice: "R$ 149,90",
    installment: "10x de R$ 14,99 sem juros",
    leadTime: "Pronto em até 1 hora",
    description:
      "Proteção essencial contra o comprimento de onda azul-violeta emitido por smartphones, computadores e luz LED. Previne insônia e cansaço visual.",
    features: [
      "Alívio contra a Síndrome da Fadiga Visual",
      "Ideal para quem passa mais de 4 horas por dia em telas",
      "Disponível com grau ou sem grau (lentes neutras)",
      "Disponível em OPTiSYNC HD, Hoya, Kodak e Orgalens",
    ],
    isActive: true,
  },
  {
    id: "tratamento-foto",
    name: "Fotossensíveis (Escurece no Sol)",
    category: "tratamentos",
    brandName: "Transitions / Photochromic",
    brandLogo: "/logos/transitions.svg",
    treatment: "Ativação Inteligente por Raios UV",
    badge: "Óculos 2 em 1",
    startingPrice: "Adicional a partir de R$ 149,00",
    installment: "Incluso no parcelamento em 10x",
    leadTime: "Montagem ágil em laboratório",
    description:
      "100% transparentes em ambientes fechados e escurecimento rápido em contato com a luz solar ao ar livre. Praticidade total sem precisar trocar de óculos.",
    features: [
      "Economia de ter óculos de grau e óculos de sol em 1 só",
      "Proteção UV400 contínua contra radiação prejudicial",
      "Clareamento rápido ao entrar em ambientes internos",
      "Disponível nas cores Cinza, Marrom e Âmbar",
    ],
    isActive: true,
  },
];
