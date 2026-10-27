export interface AdminLensItem {
  id: string;
  name: string;
  category: "visao-simples" | "multifocal" | "tratamentos" | "coloridas";
  brandName: string;
  brandLogo: string;
  boxImage?: string;
  treatment: string;
  badge?: string;
  startingPrice: string;
  installment: string;
  leadTime: string;
  description: string;
  features: string[];
  isActive?: boolean;
  colorHex?: string;
  lensColorId?: string;
}

export interface ColoredLensPreset {
  id: string;
  name: string;
  colorName: string;
  colorHex: string;
  badge: string;
  categoryTag: string;
  description: string;
  benefits: string[];
  bestFor: string;
  priceFormatted: string;
  installmentFormatted: string;
  leadTime: string;
}

export const COLORED_LENSES_LIST: ColoredLensPreset[] = [
  {
    id: "lente-cor-azul",
    name: "Azul Safira Polarizado",
    colorName: "Azul",
    colorHex: "#1e40af",
    badge: "Alta Nitidez & Estilo",
    categoryTag: "REDUÇÃO DE BRILHO • CONTRASTE URBANO",
    description:
      "Tonalidade azul safira com tratamento antirreflexo traseiro. Reduz a fadiga provocada pelo brilho solar em superfícies reflexivas e água.",
    benefits: [
      "Filtro UV400 total contra radiação nociva",
      "Realce de contornos sob luz solar aberta",
      "Acabamento espelhado ou translúcido profundo",
      "Montagem com ou sem graduação médica",
    ],
    bestFor: "Esportes aquáticos, praia e visual contemporâneo",
    priceFormatted: "R$ 149,90",
    installmentFormatted: "10x de R$ 14,99 sem juros",
    leadTime: "Pronto em até 1 hora",
  },
  {
    id: "lente-cor-marrom",
    name: "Marrom Âmbar Polarizado",
    colorName: "Marrom",
    colorHex: "#78350f",
    badge: "Conforto para Direção",
    categoryTag: "PROFUNDIDADE • ALTO CONTRASTE DIURNO",
    description:
      "Aumenta sensivelmente a percepção de profundidade e o contraste entre verde e vermelho. Ideal para quem dirige sob luz solar contínua.",
    benefits: [
      "Melhor percepção de distância e profundidade de pista",
      "Bloqueio da luz azul dispersa na atmosfera",
      "Conforto para olhos sensíveis a claridade intensa",
      "Excelente fidelidade para paisagens naturais",
    ],
    bestFor: "Direção diurna, viagens e golfe",
    priceFormatted: "R$ 149,90",
    installmentFormatted: "10x de R$ 14,99 sem juros",
    leadTime: "Pronto em até 1 hora",
  },
  {
    id: "lente-cor-amarelo",
    name: "Amarelo Night Driver",
    colorName: "Amarelo Night Driver",
    colorHex: "#eab308",
    badge: "Visão Noturna & Chuva",
    categoryTag: "SEGURANÇA NOTURNA • ANTI-OFUSCAMENTO LED",
    description:
      "Lente amarela fototécnica que neutraliza o ofuscamento dos faróis de LED brancos e postes modernos, ampliando a nitidez na chuva e neblina.",
    benefits: [
      "Reduz ofuscamento de faróis altos e LEDs",
      "Amplia o contraste em noites escuras e pistas molhadas",
      "Alívio imediato contra cansaço visual em longas viagens",
      "Aprovada para direção noturna e neblina pesada",
    ],
    bestFor: "Motoristas de estrada, chuva e neblina",
    priceFormatted: "R$ 139,90",
    installmentFormatted: "10x de R$ 13,99 sem juros",
    leadTime: "Pronto em até 1 hora",
  },
  {
    id: "lente-cor-vermelho",
    name: "Vermelho Ruby Performance",
    colorName: "Vermelho",
    colorHex: "#dc2626",
    badge: "Esportes & Ação",
    categoryTag: "CONTRASTE AGUDO • VELOCIDADE & TRILHA",
    description:
      "Filtra o espectro luminoso para oferecer um contraste agudo de terrenos, copas de árvores e pistas de asfalto em velocidade.",
    benefits: [
      "Aumento agudo de contraste em terrenos irregulares",
      "Adaptação rápida em alternâncias de sol e sombra",
      "Proteção UV400 e tratamento antirrisco de alta densidade",
      "Design aerodinâmico para óculos esportivos",
    ],
    bestFor: "Ciclismo, corrida, kart e trilha",
    priceFormatted: "R$ 159,90",
    installmentFormatted: "10x de R$ 15,99 sem juros",
    leadTime: "Pronto em até 1 hora",
  },
  {
    id: "lente-cor-rosa",
    name: "Rosa Suave / Rose Glow",
    colorName: "Rosa",
    colorHex: "#ec4899",
    badge: "Relaxamento Visual",
    categoryTag: "BEM-ESTAR OCULAR • DIAS NUBLADOS",
    description:
      "Tonalidade rosada cosmética que acalma a musculatura ciliar e equilibra a iluminação artificial fluorescente e telas digitais.",
    benefits: [
      "Relaxamento para olhos cansados e enxaqueca com aura",
      "Excelente clareza em dias nublados e fim de tarde",
      "Estética sofisticada para armações metálicas e acetato",
      "Transição fluida entre ambientes fechados e abertos",
    ],
    bestFor: "Telas, ambientes mistos e estética refinada",
    priceFormatted: "R$ 149,90",
    installmentFormatted: "10x de R$ 14,99 sem juros",
    leadTime: "Pronto em até 1 hora",
  },
  {
    id: "lente-cor-roxa",
    name: "Roxa Violeta Polar",
    colorName: "Roxa",
    colorHex: "#7c3aed",
    badge: "Design Autoral",
    categoryTag: "PROFUNDIDADE CROMÁTICA • ESTILO VENTARA",
    description:
      "Equilíbrio óptico entre comprimentos de onda azuis e vermelhos. Destaca elementos naturais e confere presença única à armação.",
    benefits: [
      "Neutraliza reflexos excessivos em água e asfalto",
      "Realça a saturação natural das cores vivas",
      "Filtro ultravioleta integral com selo UV400",
      "Compatível com lentes solares graduadas",
    ],
    bestFor: "Pesca esportiva, eventos ao ar livre e estilo",
    priceFormatted: "R$ 149,90",
    installmentFormatted: "10x de R$ 14,99 sem juros",
    leadTime: "Pronto em até 1 hora",
  },
  {
    id: "lente-cor-cinza",
    name: "Cinza Fumê Neutro Polarizado",
    colorName: "Cinza",
    colorHex: "#475569",
    badge: "Fidelidade Cromática",
    categoryTag: "NEUTRALIDADE ABSOLUTA • SOL INTENSO",
    description:
      "A cor mais neutra e recomendada mundialmente por oftalmologistas. Reduz a intensidade luminosa mantendo as cores 100% fiéis à realidade.",
    benefits: [
      "Zero distorção de cores: você enxerga tudo como é",
      "Conforto para sol escaldante de meio-dia",
      "Tratamento polarizado que elimina reflexos cegantes",
      "A escolha clássica mais versátil da óptica",
    ],
    bestFor: "Uso diário ao ar livre, praia e sol intenso",
    priceFormatted: "R$ 139,90",
    installmentFormatted: "10x de R$ 13,99 sem juros",
    leadTime: "Pronto em até 1 hora",
  },
  {
    id: "lente-cor-verde",
    name: "Verde G-15 Clássico Militar",
    colorName: "Verde",
    colorHex: "#15803d",
    badge: "Clássico da Óptica",
    categoryTag: "FÓRMULA G-15 • CONFORTO LENDÁRIO",
    description:
      "A consagrada tonalidade militar G-15 que transmite 15% da luz visível, bloqueando o brilho prejudicial e acalmando a retina instantaneamente.",
    benefits: [
      "Transmissão luminosa balanceada na faixa verde-amarela",
      "Sensação imediata de repouso ocular sob luz forte",
      "Harmoniza perfeitamente com armações douradas e pretas",
      "Montagem expressa no laboratório digital próprio",
    ],
    bestFor: "Pilotos, passeios, praia e elegância atemporal",
    priceFormatted: "R$ 139,90",
    installmentFormatted: "10x de R$ 13,99 sem juros",
    leadTime: "Pronto em até 1 hora",
  },
];

export const DEFAULT_LENSES: AdminLensItem[] = [
  // ---------------- VISÃO SIMPLES ----------------
  {
    id: "optisync-hd-ar",
    name: "OPTiSYNC HD Antirreflexo",
    category: "visao-simples",
    brandName: "OPTiSYNC HD",
    brandLogo: "/logos/optisync.svg",
    boxImage: "/images/lenses/optisync-box.jpg",
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
    boxImage: "/images/lenses/optisync-box.jpg",
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
    boxImage: "/images/lenses/correct-box.jpg",
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
    boxImage: "/images/lenses/orgaline-box.jpg",
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
    boxImage: "/images/lenses/hoya-box.jpg",
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
    boxImage: "/images/lenses/kodak-box.jpg",
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
    boxImage: "/images/lenses/orgaline-box.jpg",
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
    boxImage: "/images/lenses/hoya-box.jpg",
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
    boxImage: "/images/lenses/optisync-box.jpg",
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
    boxImage: "/images/lenses/optisync-box.jpg",
    treatment: "Bloqueio de 400nm a 455nm (HEV) + Antirreflexo",
    badge: "Conforto para Telas",
    startingPrice: "R$ 149,90",
    installment: "10x de R$ 14,99 sem juros",
    leadTime: "Pronto em até 1 hora",
    description:
      "Proteção essencial contra o comprimento de onda azul-violeta emitido por smartphones, computadores e luz LED. Previne insônia e cansaço visual.",
    features: [
      "Alívio contra a廊Síndrome da Fadiga Visual",
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
    boxImage: "/images/lenses/optisync-fotossensivel-box.jpg",
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

  // ---------------- LENTES COLORIDAS & SOLARES (8 CORES EXCLUSIVAS VENTARA) ----------------
  {
    id: "lente-cor-azul",
    name: "Lente Colorida Azul Safira",
    category: "coloridas",
    brandName: "Ventara Sun Color",
    brandLogo: "/logos/optisync.svg",
    treatment: "Polarizado Solar + Antirreflexo Traseiro + UV400",
    badge: "Alta Nitidez & Estilo",
    startingPrice: "R$ 149,90",
    installment: "10x de R$ 14,99 sem juros",
    leadTime: "Pronto em até 1 hora",
    colorHex: "#1e40af",
    lensColorId: "azul",
    description:
      "Tonalidade azul safira com corte de luz branca e reflexos em superfícies molhadas. Estilo vibrante e conforto para o dia a dia.",
    features: [
      "Filtro UV400 completo UVA/UVB",
      "Realce de contornos e contraste urbano",
      "Disponível com grau ou neutra solar",
      "Montagem expressa no laboratório próprio",
    ],
    isActive: true,
  },
  {
    id: "lente-cor-marrom",
    name: "Lente Colorida Marrom Âmbar",
    category: "coloridas",
    brandName: "Ventara Sun Color",
    brandLogo: "/logos/optisync.svg",
    treatment: "Polarizado Solar + Contraste de Profundidade + UV400",
    badge: "Conforto para Direção",
    startingPrice: "R$ 149,90",
    installment: "10x de R$ 14,99 sem juros",
    leadTime: "Pronto em até 1 hora",
    colorHex: "#78350f",
    lensColorId: "marrom",
    description:
      "Aumenta a percepção de profundidade e o contraste entre as cores verde e vermelha. Recomendada para motoristas em dias ensolarados.",
    features: [
      "Percepção superior de distância na estrada",
      "Filtro de luz azul atmosférica de alta energia",
      "Descanso retiniano em dias de sol brilhante",
      "Montagem personalizada em qualquer armação",
    ],
    isActive: true,
  },
  {
    id: "lente-cor-amarelo",
    name: "Lente Colorida Amarelo Night Driver",
    category: "coloridas",
    brandName: "Ventara Sun Color",
    brandLogo: "/logos/optisync.svg",
    treatment: "Filtro Anti-Ofuscamento Noturno + Contraste em Chuva",
    badge: "Visão Noturna & Chuva",
    startingPrice: "R$ 139,90",
    installment: "10x de R$ 13,99 sem juros",
    leadTime: "Pronto em até 1 hora",
    colorHex: "#eab308",
    lensColorId: "amarelo",
    description:
      "Lente amarela fototécnica que neutraliza o brilho cegante dos faróis de LED brancos e postes modernos, ampliando a nitidez na chuva e neblina.",
    features: [
      "Bloqueio de reflexos de faróis altos e postes LED",
      "Melhora da visibilidade em asfalto molhado",
      "Conforto para viagens noturnas longas",
      "Montagem com ou sem graduação médica",
    ],
    isActive: true,
  },
  {
    id: "lente-cor-vermelho",
    name: "Lente Colorida Vermelho Ruby",
    category: "coloridas",
    brandName: "Ventara Sun Color",
    brandLogo: "/logos/optisync.svg",
    treatment: "Realce de Terreno e Velocidade + Proteção UV400",
    badge: "Esportes & Ação",
    startingPrice: "R$ 159,90",
    installment: "10x de R$ 15,99 sem juros",
    leadTime: "Pronto em até 1 hora",
    colorHex: "#dc2626",
    lensColorId: "vermelho",
    description:
      "Filtra o espectro luminoso para oferecer um contraste agudo de terrenos, copas de árvores e pistas de asfalto em velocidade.",
    features: [
      "Contraste agudo em esportes dinâmicos",
      "Adaptação rápida em alternâncias de sombra e luz",
      "Tratamento de alta resistência contra arranhões",
      "Compatível com armações solares esportivas",
    ],
    isActive: true,
  },
  {
    id: "lente-cor-rosa",
    name: "Lente Colorida Rosa Suave",
    category: "coloridas",
    brandName: "Ventara Sun Color",
    brandLogo: "/logos/optisync.svg",
    treatment: "Filtro Anti-Fadiga Relax + Tonalidade Cosmética Rose",
    badge: "Relaxamento Visual",
    startingPrice: "R$ 149,90",
    installment: "10x de R$ 14,99 sem juros",
    leadTime: "Pronto em até 1 hora",
    colorHex: "#ec4899",
    lensColorId: "rosa",
    description:
      "Tonalidade rosada cosmética que acalma a musculatura ciliar e equilibra a iluminação artificial fluorescente e telas digitais.",
    features: [
      "Relaxamento para olhos sensíveis a enxaqueca",
      "Clareza perfeita para dias nublados e fim de tarde",
      "Estética sofisticada e autoral",
      "Montagem expressa no laboratório Ventara",
    ],
    isActive: true,
  },
  {
    id: "lente-cor-roxa",
    name: "Lente Colorida Roxa Violeta",
    category: "coloridas",
    brandName: "Ventara Sun Color",
    brandLogo: "/logos/optisync.svg",
    treatment: "Polarizado Solar Violet + Selo UV400",
    badge: "Design Autoral",
    startingPrice: "R$ 149,90",
    installment: "10x de R$ 14,99 sem juros",
    leadTime: "Pronto em até 1 hora",
    colorHex: "#7c3aed",
    lensColorId: "roxa",
    description:
      "Equilíbrio óptico entre comprimentos de onda azuis e vermelhos. Destaca elementos naturais e confere presença única à armação.",
    features: [
      "Neutraliza reflexos em água e superfícies brilhantes",
      "Cores vivas e saturadas na paisagem",
      "Proteção total contra raios UV nocivos",
      "Compatível com lentes solares graduadas",
    ],
    isActive: true,
  },
  {
    id: "lente-cor-cinza",
    name: "Lente Colorida Cinza Fumê Neutro",
    category: "coloridas",
    brandName: "Ventara Sun Color",
    brandLogo: "/logos/optisync.svg",
    treatment: "Polarizado Fumê Neutro + Fidelidade Cromática 100%",
    badge: "Fidelidade Cromática",
    startingPrice: "R$ 139,90",
    installment: "10x de R$ 13,99 sem juros",
    leadTime: "Pronto em até 1 hora",
    colorHex: "#475569",
    lensColorId: "cinza",
    description:
      "A cor mais neutra e recomendada mundialmente por oftalmologistas. Reduz a intensidade luminosa mantendo as cores 100% fiéis à realidade.",
    features: [
      "Zero distorção de cores em ambientes claros",
      "Alívio prolongado sob sol intenso de meio-dia",
      "Película polarizada eliminadora de reflexos",
      "A escolha clássica para qualquer armação",
    ],
    isActive: true,
  },
  {
    id: "lente-cor-verde",
    name: "Lente Colorida Verde G-15",
    category: "coloridas",
    brandName: "Ventara Sun Color",
    brandLogo: "/logos/optisync.svg",
    treatment: "Fórmula Militar G-15 + Antirreflexo Traseiro + UV400",
    badge: "Clássico da Óptica",
    startingPrice: "R$ 139,90",
    installment: "10x de R$ 13,99 sem juros",
    leadTime: "Pronto em até 1 hora",
    colorHex: "#15803d",
    lensColorId: "verde",
    description:
      "A consagrada tonalidade militar G-15 que transmite 15% da luz visível, bloqueando o brilho prejudicial e acalmando a retina instantaneamente.",
    features: [
      "Transmissão luminosa balanceada na faixa verde-amarela",
      "Sensação imediata de repouso ocular sob luz solar",
      "Elegância atemporal consagrada na aviação",
      "Montagem expressa no laboratório digital próprio",
    ],
    isActive: true,
  },
];
