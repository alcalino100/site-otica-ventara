import {
  ShippingCarrier,
  ShippingFaqItem,
  ShippingTimelineStep,
  ShippingPageSettings,
  FooterPaymentSettings,
  CityChip,
  NationalShipmentCard,
} from "@/types/shipping";

export const DEFAULT_CITY_CHIPS: CityChip[] = [
  { id: "city-1", name: "Araçatuba", sort_order: 1 },
  { id: "city-2", name: "Birigui", sort_order: 2 },
  { id: "city-3", name: "Bilac", sort_order: 3 },
  { id: "city-4", name: "Gabriel Monteiro", sort_order: 4 },
  { id: "city-5", name: "Coroados e Guararapes", sort_order: 5 },
];

export const DEFAULT_NATIONAL_CARDS: NationalShipmentCard[] = [
  {
    id: "nat-card-correios",
    title: "Correios (Sedex e PAC)",
    description: "Alcance completo em 100% dos municípios do Brasil com código de rastreamento oficial.",
    delivery_time: "Sedex: 1 a 4 dias úteis · PAC: 5 a 12 dias úteis",
    badge: "Todo o Brasil",
    icon_name: "mail",
    is_active: true,
  },
  {
    id: "nat-card-transportadoras",
    title: "Transportadoras Rodoviárias",
    description: "Operadores logísticos parceiros selecionados para rotas expressas interestaduais com alta segurança.",
    delivery_time: "Em média 2 a 6 dias úteis conforme destino",
    badge: "Rotas Expressas",
    icon_name: "truck",
    is_active: true,
  },
  {
    id: "nat-card-aereo",
    title: "Envio Aéreo para Destinos Distantes",
    description: "Para outros estados, quando necessário, utilizamos transporte aéreo por meio das transportadoras e dos Correios para acelerar a entrega.",
    delivery_time: "Em média 2 a 5 dias úteis",
    badge: "Alta Velocidade",
    icon_name: "plane",
    is_active: true,
  },
];

export const DEFAULT_SHIPPING_PAGE_SETTINGS: ShippingPageSettings = {
  is_enabled: true,
  slug: "entregas",

  // 1. Hero (Light Theme)
  hero_badge_text: "ESTRUTURA LOGÍSTICA & RASTREAMENTO",
  hero_title_line1: "Rede de Entregas",
  hero_title_line2: "Ventara",
  hero_subtitle: "Da nossa ótica em Araçatuba para todo o Brasil",
  hero_cta_text: "Rastrear seu pedido",
  hero_cta_url: "/rastreio",
  hero_secondary_cta_text: "Ver cidades atendidas",
  hero_secondary_cta_url: "#bloco-regional",
  hero_image_url: "/images/shipping/hero-glasses-ventara.jpg",

  // 2. Highlight Cards
  show_highlight_cards: true,
  show_cargo_insurance: false, // Desligado por padrão, só exibido se ativado no admin
  highlight_card_1_title: "Araçatuba e Região",
  highlight_card_1_subtitle: "Entrega rápida com van própria",
  highlight_card_2_title: "Envio para todo o Brasil",
  highlight_card_2_subtitle: "Correios e transporte aéreo",
  highlight_card_insurance_title: "Seguro de Carga Total",
  highlight_card_insurance_subtitle: "Proteção garantida em 100% dos envios",
  highlight_card_3_title: "Rastreio Ponto a Ponto",
  highlight_card_3_subtitle: "Atualizações em tempo real",

  // 3. Bloco Regional (100% editável)
  regional_is_enabled: true,
  regional_badge_text: "LOGÍSTICA PRÓPRIA REGIONAL",
  regional_title_part1: "Entrega Expressa em",
  regional_title_part2: "Araçatuba e Região",
  regional_description:
    "Com frota própria e equipe dedicada, garantimos transporte rápido e seguro diretamente do nosso laboratório até o seu endereço em Araçatuba e municípios vizinhos.",
  regional_cities_heading: "CIDADES ATENDIDAS COM ROTA LOCAL",
  regional_cities: DEFAULT_CITY_CHIPS,
  regional_image_url: "/images/shipping/van-ventara-aracatuba.jpg",
  regional_image_alt: "Van de entregas expressas da Ótica Ventara Eyewear em Araçatuba e região",
  regional_focal_point: "center right",
  regional_gradient_intensity: "strong",
  regional_show_timeframe: false,
  regional_timeframe: "Consulte o prazo no checkout (média de 24h a 48h úteis após montagem técnica)",
  regional_show_conditions: false,
  regional_conditions: "Opção de retirada gratuita no balcão da loja física ou entrega direta",

  // 4. Prazo Estimado
  estimated_timeframe_is_enabled: true,
  estimated_timeframe_title: "Prazo Estimado",
  estimated_timeframe_text: "Consulte o prazo no checkout (média de 24h a 48h úteis após montagem técnica)",

  // 5. Envio Nacional
  national_is_enabled: true,
  national_title: "Enviamos para todo o Brasil",
  national_subtitle: "Se você mora em outro estado, escolhemos a melhor rota para o seu pedido chegar mais rápido.",
  national_tracking_note: "Todo envio nacional segue com código de rastreamento ponta a ponta e seguro de transporte.",
  national_cards: DEFAULT_NATIONAL_CARDS,

  // 6. Linha do Tempo, FAQ e CTA
  timeline_section_title: "Como funciona nosso fluxo de entrega",
  timeline_section_subtitle:
    "Do pedido confirmado no laboratório próprio até a chegada às suas mãos.",
  faq_section_title: "Perguntas Frequentes sobre Entregas",
  faq_section_subtitle:
    "Tire suas dúvidas sobre prazos, embalagens especiais, rastreio e políticas de devolução.",
  whatsapp_cta_title: "Ficou com alguma dúvida sobre a entrega?",
  whatsapp_cta_subtitle:
    "Nossa equipe de consultoria e suporte em Araçatuba está à disposição no WhatsApp.",

  // Aliases legados para compatibilidade
  hero_title: "Rede de Entregas Ventara",
  local_title: "Entrega Expressa em Araçatuba e Região",
  local_description:
    "Com frota própria e equipe dedicada, garantimos transporte rápido e seguro diretamente do nosso laboratório até o seu endereço em Araçatuba e municípios vizinhos.",
  local_cities: "Araçatuba, Birigui, Bilac, Gabriel Monteiro, Coroados e Guararapes",
  local_timeframe: "Consulte o prazo no checkout (média de 24h a 48h úteis após montagem técnica)",
  local_conditions: "Opção de retirada gratuita no balcão da loja física ou entrega direta",
  local_image_url: "/images/shipping/van-ventara-aracatuba.jpg",
  national_description:
    "Para cidades distantes e outros estados, seus óculos são despachados pelas principais transportadoras e Correios com seguro de transporte integral e código de rastreamento ponto a ponto.",
  national_timeframe: "Prazo calculado automaticamente conforme o seu CEP",
  national_conditions: "Embalagem rígida reforçada contra impactos em todos os pedidos",
  national_image_url: "/images/shipping/envio-brasil-azul-cargo.png",
  carriers_section_title: "Transportadoras que utilizamos",
  carriers_section_subtitle:
    "Enviamos com os maiores operadores logísticos do país para garantir agilidade e pontualidade.",
};

export const DEFAULT_SHIPPING_CARRIERS: ShippingCarrier[] = [
  {
    id: "carrier-ventara-local",
    name: "Entrega Própria Ventara",
    slug: "entrega-propria-ventara",
    description: "Frota local dedicada para entregas rápidas e personalizadas em Araçatuba e região.",
    delivery_time: "Até 24h a 48h úteis após montagem no laboratório",
    logo_url: "/images/shipping/van-ventara-aracatuba.jpg",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "carrier-azul-cargo",
    name: "Azul Cargo Express",
    slug: "azul-cargo",
    description: "Logística aérea e rodoviária expressa com alta frequência de voos entre as principais cidades.",
    delivery_time: "Em média 2 a 5 dias úteis (conforme destino)",
    logo_url: "/images/shipping/envio-brasil-azul-cargo.png",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "carrier-gollog",
    name: "Gollog",
    slug: "gollog",
    description: "Transporte aéreo ágil conectando aeroportos nacionais com monitoramento contínuo.",
    delivery_time: "Em média 2 a 6 dias úteis",
    logo_url: "/images/shipping/transportadora-gollog.jpg",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "carrier-sedex",
    name: "Sedex e PAC (Correios)",
    slug: "correios-sedex",
    description: "Alcance completo em 100% dos municípios do Brasil com código de rastreamento oficial.",
    delivery_time: "Sedex de 1 a 4 dias úteis · PAC de 5 a 12 dias úteis",
    logo_url: "/images/shipping/transportadora-sedex.png",
    is_active: true,
    sort_order: 4,
  },
];

export const DEFAULT_SHIPPING_TIMELINE: ShippingTimelineStep[] = [
  {
    step_number: 1,
    title: "Pedido Confirmado",
    short_description: "Confirmação e Triagem",
    detail: "Pagamento aprovado e encaminhamento para conferência técnica da prescrição oftálmica e DNP.",
    icon_name: "CheckCircle2",
  },
  {
    step_number: 2,
    title: "Montagem no Laboratório Próprio",
    short_description: "Facetadora Computadorizada",
    detail: "Corte digital e biselamento das lentes com precisão milimétrica em nossa unidade de Araçatuba-SP.",
    icon_name: "Cpu",
  },
  {
    step_number: 3,
    title: "Controle de Qualidade Óptica",
    short_description: "Inspeção em Lensômetro",
    detail: "Conferência rigorosa de dioptria, eixo cilíndrico, espessura e tratamentos antirreflexo/fotossensíveis.",
    icon_name: "ShieldCheck",
  },
  {
    step_number: 4,
    title: "Embalagem Protetora",
    short_description: "Estojo Rígido e Lacre",
    detail: "Óculos acomodados em estojo rígido forrado, flanela de microfibra e caixa de papelão reforçada.",
    icon_name: "PackageCheck",
  },
  {
    step_number: 5,
    title: "Postagem & Código de Rastreio",
    short_description: "Despacho Imediato",
    detail: "Envio emitido com seguro e código rastreável enviado automaticamente para seu WhatsApp e e-mail.",
    icon_name: "Send",
  },
  {
    step_number: 6,
    title: "Entrega no seu Endereço",
    short_description: "Chegada Segura",
    detail: "Entrega realizada por nossa van própria em Araçatuba e região, ou transportadora expressa/Correios.",
    icon_name: "Home",
  },
];

export const DEFAULT_SHIPPING_FAQS: ShippingFaqItem[] = [
  {
    id: "faq-1",
    question: "Como acompanho o rastreamento do meu pedido?",
    answer: "Assim que seu pedido é despachado, enviamos o código de rastreamento por WhatsApp e e-mail. Você também pode consultar o status em tempo real a qualquer momento em nossa página de rastreio digitando seu código ou CPF.",
    category: "rastreio",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "faq-2",
    question: "Qual é o prazo médio de entrega para minha cidade?",
    answer: "O prazo exato é calculado automaticamente no checkout ao informar o seu CEP. Para Araçatuba e cidades vizinhas atendidas pela nossa rota local, a entrega costuma ocorrer em até 24h a 48h úteis após a montagem. Para outras cidades do Brasil, os prazos variam entre 2 e 8 dias úteis conforme a modalidade escolhida.",
    category: "prazos",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "faq-3",
    question: "Os óculos viajam protegidos contra quebra e impacto?",
    answer: "Sim! Todos os óculos são protegidos em estojo rígido de alta durabilidade, envolvidos em camadas de amortecimento e lacrados em caixas protetoras reforçadas. Além disso, todos os despachos contam com seguro total de transporte.",
    category: "embalagem",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "faq-4",
    question: "O que acontece se o endereço informado estiver incorreto?",
    answer: "Caso perceba qualquer inconsistência no endereço cadastrado, entre em contato imediatamente com nosso WhatsApp de atendimento. Enquanto o pedido estiver no laboratório ou em triagem, realizamos a alteração antes do despacho.",
    category: "endereco",
    is_active: true,
    sort_order: 4,
  },
  {
    id: "faq-5",
    question: "Como funciona a garantia e a política de trocas?",
    answer: "Respeitamos integralmente o Código de Defesa do Consumidor. Caso seus óculos apresentem qualquer inconformidade ou você deseje trocar a armação, você tem até 7 (sete) dias corridos após o recebimento para acionar nossa central de suporte.",
    category: "trocas",
    is_active: true,
    sort_order: 5,
  },
];

export const DEFAULT_FOOTER_PAYMENT_SETTINGS: FooterPaymentSettings = {
  show_footer_block: true,
  show_secure_badge: true,
  secure_badge_text: "Pagamento seguro com Mercado Pago",
  block_title: "Formas de Pagamento",
  methods: [
    {
      id: "visa",
      name: "Visa",
      icon_path: "/logos/payments/visa.svg",
      is_active: true,
      sort_order: 1,
      alt_text: "Cartão de Crédito Visa",
    },
    {
      id: "mastercard",
      name: "Mastercard",
      icon_path: "/logos/payments/mastercard.svg",
      is_active: true,
      sort_order: 2,
      alt_text: "Cartão de Crédito Mastercard",
    },
    {
      id: "elo",
      name: "Elo",
      icon_path: "/logos/payments/elo.svg",
      is_active: true,
      sort_order: 3,
      alt_text: "Cartão Elo",
    },
    {
      id: "amex",
      name: "American Express",
      icon_path: "/logos/payments/amex.svg",
      is_active: true,
      sort_order: 4,
      alt_text: "Cartão American Express",
    },
    {
      id: "hipercard",
      name: "Hipercard",
      icon_path: "/logos/payments/hipercard.svg",
      is_active: true,
      sort_order: 5,
      alt_text: "Cartão Hipercard",
    },
    {
      id: "pix",
      name: "Pix",
      icon_path: "/logos/payments/pix.svg",
      is_active: true,
      sort_order: 6,
      alt_text: "Pagamento instantâneo via Pix",
    },
  ],
};
