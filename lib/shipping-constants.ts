import {
  ShippingCarrier,
  ShippingFaqItem,
  ShippingTimelineStep,
  ShippingPageSettings,
  FooterPaymentSettings,
} from "@/types/shipping";

export const DEFAULT_SHIPPING_PAGE_SETTINGS: ShippingPageSettings = {
  is_enabled: true,
  slug: "entregas",
  hero_title: "Rede de Entregas Ventara",
  hero_subtitle: "Da nossa ótica em Araçatuba para todo o Brasil",
  hero_cta_text: "Rastrear seu pedido",
  hero_cta_url: "/rastreio",
  local_title: "Entrega Expressa em Araçatuba e Região",
  local_description:
    "Com frota própria e equipe dedicada, garantimos transporte rápido e seguro diretamente do nosso laboratório até o seu endereço em Araçatuba e municípios vizinhos.",
  local_cities: "Araçatuba, Birigui, Bilac, Gabriel Monteiro, Coroados e Guararapes",
  local_timeframe: "Consulte o prazo no checkout (média de 24h a 48h úteis após montagem técnica)",
  local_conditions: "Opção de retirada gratuita no balcão da loja física ou entrega direta",
  local_image_url: "/images/shipping/van-ventara-aracatuba.jpg",
  national_title: "Envio Seguro para Todo o Brasil",
  national_description:
    "Para cidades distantes e outros estados, seus óculos são despachados pelas principais transportadoras e Correios com seguro de transporte integral e código de rastreamento ponto a ponto.",
  national_timeframe: "Prazo calculado automaticamente conforme o seu CEP",
  national_conditions: "Embalagem rígida reforçada contra impactos em todos os pedidos",
  national_image_url: "/images/shipping/envio-brasil-azul-cargo.png",
  carriers_section_title: "Transportadoras que utilizamos",
  carriers_section_subtitle:
    "Enviamos com os maiores operadores logísticos do país para garantir agilidade e pontualidade.",
  timeline_section_title: "Como funciona nosso fluxo de entrega",
  timeline_section_subtitle:
    "Do pedido confirmado no laboratório próprio até a chegada às suas mãos.",
  faq_section_title: "Perguntas Frequentes sobre Entregas",
  faq_section_subtitle:
    "Tire suas dúvidas sobre prazos, embalagens especiais, rastreio e políticas de devolução.",
  whatsapp_cta_title: "Ficou com alguma dúvida sobre a entrega?",
  whatsapp_cta_subtitle:
    "Nossa equipe de consultoria e suporte em Araçatuba está à disposição no WhatsApp.",
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
    title: "Controle de Qualidade",
    short_description: "Aferição Dióptrica",
    detail: "Checagem detalhada no lensômetro digital, alinhamento anatômico da armação e higienização profunda.",
    icon_name: "ShieldCheck",
  },
  {
    step_number: 4,
    title: "Embalagem Segura",
    short_description: "Estojo Rígido & Proteção",
    detail: "Acondicionamento em estojo rígido, flanela de microfibra e caixa externa protegida contra impactos.",
    icon_name: "Package",
  },
  {
    step_number: 5,
    title: "Postagem com Rastreio",
    short_description: "Envio Imediato",
    detail: "Despacho na transportadora ou van própria, com envio do código de rastreamento por e-mail e WhatsApp.",
    icon_name: "Truck",
  },
  {
    step_number: 6,
    title: "Entrega ou Retirada",
    short_description: "Recebimento Garantido",
    detail: "Chegada no seu endereço com segurança ou retirada presencial no balcão da loja em Araçatuba.",
    icon_name: "MapPin",
  },
];

export const DEFAULT_SHIPPING_FAQS: ShippingFaqItem[] = [
  {
    id: "faq-1",
    question: "Como acompanho o rastreamento do meu pedido?",
    answer:
      "Assim que seu pedido é despachado, enviamos o código de rastreamento por WhatsApp e e-mail. Você também pode consultar o status em tempo real a qualquer momento em nossa página de rastreio digitando seu código ou CPF.",
    category: "rastreio",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "faq-2",
    question: "Qual é o prazo médio de entrega para minha cidade?",
    answer:
      "O prazo exato é calculado automaticamente no checkout ao informar o seu CEP. Para Araçatuba e cidades vizinhas atendidas pela nossa van, a entrega costuma ocorrer em até 24h a 48h úteis após a montagem. Para outras cidades do Brasil, os prazos variam entre 2 e 8 dias úteis conforme a modalidade escolhida.",
    category: "prazos",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "faq-3",
    question: "Os óculos viajam protegidos contra quebra e impacto?",
    answer:
      "Sim! Todos os óculos são protegidos em estojo rígido de alta durabilidade, envolvidos em camadas de amortecimento e lacrados em caixas protetoras reforçadas. Além disso, todos os despachos contam com seguro total de transporte.",
    category: "embalagem",
    is_active: true,
    sort_order: 3,
  },
  {
    id: "faq-4",
    question: "O que acontece se o endereço informado estiver incorreto?",
    answer:
      "Caso perceba qualquer inconsistência no endereço cadastrado, entre em contato imediatamente com nosso WhatsApp de atendimento. Enquanto o pedido estiver no laboratório ou em triagem, realizamos a alteração antes do despacho.",
    category: "endereco",
    is_active: true,
    sort_order: 4,
  },
  {
    id: "faq-5",
    question: "Como funciona a garantia e a política de trocas?",
    answer:
      "Respeitamos integralmente o Código de Defesa do Consumidor. Caso seus óculos apresentem qualquer inconformidade ou você deseje trocar a armação, você tem até 7 (sete) dias corridos após o recebimento para acionar nossa central de suporte.",
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
      alt_text: "Cartão de Crédito e Débito Elo",
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
