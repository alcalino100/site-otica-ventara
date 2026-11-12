import { ContentPageDefinition, ContentFieldDefinition } from "./types";

/**
 * Catálogo Central e Tipado de Conteúdo da Ótica Ventara.
 * Define todas as páginas públicas, elementos globais e templates com seus
 * campos editáveis, tipos, restrições e valores padrão (defaults fieis ao código atual).
 */
export const SITE_PAGES_REGISTRY: Record<string, ContentPageDefinition> = {
  // ==========================================================================
  // PÁGINA: OptiSYNC HD (/optisync)
  // ==========================================================================
  optisync: {
    id: "optisync",
    path: "/optisync",
    title: "Lentes Digitais OPTiSYNC HD",
    category: "page",
    description: "Tecnologia digital proprietária, simulador fotossensível, linhas HD/Fotossensível/Kids e benefícios.",
    previewPath: "/optisync?preview=draft",
    sections: [
      {
        id: "hero",
        label: "1. Cabeçalho / Hero",
        description: "Título de impacto, badge tecnológico e botões principais de ação.",
        fields: [
          {
            id: "optisync.hero.badge",
            key: "heroBadge",
            label: "Badge Superior",
            type: "text",
            default: "ENGENHARIA ÓPTICA DIGITAL",
            maxLength: 50,
            location: "Pílula no topo do Hero",
          },
          {
            id: "optisync.hero.title",
            key: "heroTitle",
            label: "Título Principal (Prefixo)",
            type: "text",
            default: "Lentes Digitais",
            maxLength: 60,
            location: "Primeira linha do título principal",
          },
          {
            id: "optisync.hero.titleHighlight",
            key: "heroTitleHighlight",
            label: "Título em Destaque (Amarelo)",
            type: "text",
            default: "OPTiSYNC HD",
            maxLength: 40,
            location: "Texto destacado em amarelo no título",
          },
          {
            id: "optisync.hero.subtitle",
            key: "heroSubtitle",
            label: "Subtítulo / Descrição",
            type: "textarea",
            default:
              "Engenharia óptica computadorizada com tratamento antirreflexo multicamadas, proteção total contra luz azul violeta nociva e clareza visual de alta definição.",
            maxLength: 300,
            location: "Parágrafo logo abaixo do título",
          },
          {
            id: "optisync.hero.btnPrimaryText",
            key: "btnPrimaryText",
            label: "Texto do Botão Primário",
            type: "text",
            default: "Falar com Técnico Óptico",
            maxLength: 40,
            location: "Botão principal amarelo",
          },
          {
            id: "optisync.hero.btnSecondaryText",
            key: "btnSecondaryText",
            label: "Texto do Botão Secundário",
            type: "text",
            default: "Conhecer Linhas & Preços",
            maxLength: 40,
            location: "Botão secundário outline",
          },
        ],
      },
      {
        id: "simulator",
        label: "2. Simulador Fotossensível",
        description: "Textos de introdução e rótulos do simulador de transição de luminosidade.",
        fields: [
          {
            id: "optisync.simulator.eyebrow",
            key: "simulatorEyebrow",
            label: "Etiqueta / Eyebrow",
            type: "text",
            default: "SIMULADOR DINÂMICO",
            maxLength: 40,
            location: "Texto em caixa-alta acima do simulador",
          },
          {
            id: "optisync.simulator.title",
            key: "simulatorTitle",
            label: "Título do Simulador",
            type: "text",
            default: "Transição Óptica Inteligente",
            maxLength: 60,
            location: "Título da seção de transição",
          },
          {
            id: "optisync.simulator.description",
            key: "simulatorDesc",
            label: "Texto Explicativo",
            type: "textarea",
            default:
              "Lentes inteligentes que clareiam com rapidez em ambientes internos e escurecem sob o sol, bloqueando 100% dos raios UVA/UVB com conforto total.",
            maxLength: 250,
            location: "Descrição abaixo do título",
          },
          {
            id: "optisync.simulator.indoorLabel",
            key: "indoorLabel",
            label: "Rótulo Ambiente Interno",
            type: "text",
            default: "Ambiente Interno (Lente Clara)",
            maxLength: 40,
            location: "Legenda do lado esquerdo do slider",
          },
          {
            id: "optisync.simulator.outdoorLabel",
            key: "outdoorLabel",
            label: "Rótulo Sol Pleno",
            type: "text",
            default: "Sol Pleno (Lente Escura)",
            maxLength: 40,
            location: "Legenda do lado direito do slider",
          },
        ],
      },
      {
        id: "benefits",
        label: "3. Benefícios e Laboratório Próprio",
        description: "Diferenciais técnicos de corte computadorizado e precisão de montagem em Araçatuba/SP.",
        fields: [
          {
            id: "optisync.benefits.title",
            key: "benefitsTitle",
            label: "Título da Seção",
            type: "text",
            default: "Por que a tecnologia OPTiSYNC é superior?",
            maxLength: 80,
            location: "Título da grade de benefícios",
          },
          {
            id: "optisync.benefits.labBadge",
            key: "labBadge",
            label: "Selo do Laboratório",
            type: "text",
            default: "LABORATÓRIO PRÓPRIO VENTARA",
            maxLength: 50,
            location: "Selo de autenticidade do laboratório",
          },
          {
            id: "optisync.benefits.labText",
            key: "labText",
            label: "Descrição do Laboratório",
            type: "textarea",
            default:
              "Montagem digital computadorizada e aferição milimétrica com bisel facetado em equipamentos de ponta em nosso laboratório próprio em Araçatuba/SP.",
            maxLength: 300,
            location: "Texto do card de laboratório próprio",
          },
        ],
      },
      {
        id: "faq",
        label: "4. Perguntas Frequentes (FAQ)",
        description: "Dúvidas recorrentes sobre receitas, compatibilidade e garantia das lentes.",
        fields: [
          {
            id: "optisync.faq.title",
            key: "faqTitle",
            label: "Título do FAQ",
            type: "text",
            default: "Dúvidas Frequentes sobre Lentes OPTiSYNC",
            maxLength: 80,
            location: "Título da seção de perguntas",
          },
          {
            id: "optisync.faq.subtitle",
            key: "faqSubtitle",
            label: "Subtítulo do FAQ",
            type: "textarea",
            default: "Tudo o que você precisa saber antes de fazer suas lentes digitais com nossa equipe.",
            maxLength: 150,
            location: "Subtítulo da seção de perguntas",
          },
        ],
      },
      {
        id: "cta",
        label: "5. Chamada Final para Ação (WhatsApp)",
        description: "Card inferior de contato com técnico óptico de plantão.",
        fields: [
          {
            id: "optisync.cta.title",
            key: "ctaTitle",
            label: "Título de Fechamento",
            type: "text",
            default: "Pronto para enxergar com máxima nitidez?",
            maxLength: 80,
            location: "Título do card final",
          },
          {
            id: "optisync.cta.subtitle",
            key: "ctaSubtitle",
            label: "Descrição do Fechamento",
            type: "textarea",
            default:
              "Envie uma foto da sua receita no WhatsApp. Nosso técnico óptico analisa seu grau e indica o bloco digital perfeito para sua necessidade.",
            maxLength: 250,
            location: "Texto abaixo do título de fechamento",
          },
          {
            id: "optisync.cta.btnText",
            key: "ctaBtnText",
            label: "Texto do Botão",
            type: "text",
            default: "Enviar Receita via WhatsApp",
            maxLength: 40,
            location: "Botão verde do WhatsApp no CTA final",
          },
          {
            id: "optisync.cta.whatsappMsg",
            key: "ctaWhatsappMsg",
            label: "Mensagem Pré-configurada",
            type: "textarea",
            default:
              "Olá! Gostaria de consultar um técnico óptico sobre as lentes digitais OPTiSYNC HD da Ventara e enviar minha receita médica.",
            maxLength: 200,
            location: "Texto inicial enviado ao abrir o WhatsApp",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // PÁGINA: Home (/)
  // ==========================================================================
  home: {
    id: "home",
    path: "/",
    title: "Página Inicial (Home)",
    category: "page",
    description: "Vitrines de ofertas, modelos em destaque, diferenciais e seções institucionais.",
    previewPath: "/?preview=draft",
    sections: [
      {
        id: "offers",
        label: "1. Vitrine de Ofertas ('Até 57% OFF')",
        description: "Carrossel de modelos selecionados em promoção com selo de desconto real.",
        fields: [
          {
            id: "home.offers.badge",
            key: "offersBadge",
            label: "Badge / Eyebrow",
            type: "text",
            default: "CURADORIA VENTARA",
            maxLength: 40,
            location: "Pílula de introdução da seção de ofertas",
          },
          {
            id: "home.offers.title",
            key: "offersTitle",
            label: "Título da Vitrine",
            type: "text",
            default: "Até 57% OFF em modelos selecionados",
            maxLength: 70,
            location: "Título principal da vitrine de ofertas",
          },
          {
            id: "home.offers.subtitle",
            key: "offersSubtitle",
            label: "Subtítulo / Descrição",
            type: "textarea",
            default: "Armações selecionadas em acetato premium e design contemporâneo com condições exclusivas.",
            maxLength: 200,
            location: "Texto de apoio abaixo do título",
          },
          {
            id: "home.offers.allLinkText",
            key: "offersAllLinkText",
            label: "Texto do Link 'Ver Todas'",
            type: "text",
            default: "Ver todas as ofertas",
            maxLength: 40,
            location: "Link superior à direita do carrossel",
          },
        ],
      },
      {
        id: "showcase",
        label: "2. Vitrine 'Modelos em Destaque'",
        description: "Grade de armações em alta recomendadas pela equipe.",
        fields: [
          {
            id: "home.showcase.title",
            key: "showcaseTitle",
            label: "Título da Vitrine",
            type: "text",
            default: "Modelos em Destaque",
            maxLength: 60,
            location: "Título da vitrine de armações",
          },
          {
            id: "home.showcase.subtitle",
            key: "showcaseSubtitle",
            label: "Subtítulo",
            type: "textarea",
            default: "Design autoral, materiais nobres e ajuste ergonômico para o seu estilo de vida.",
            maxLength: 180,
            location: "Subtítulo da vitrine",
          },
        ],
      },
      {
        id: "whyVentara",
        label: "3. Por que escolher a Ventara",
        description: "Bloco institucional com os 4 pilares fundamentais da marca.",
        fields: [
          {
            id: "home.why.title",
            key: "whyTitle",
            label: "Título Principal",
            type: "text",
            default: "Por que escolher a Ótica Ventara?",
            maxLength: 60,
            location: "Título da seção institucional",
          },
          {
            id: "home.why.subtitle",
            key: "whySubtitle",
            label: "Subtítulo",
            type: "textarea",
            default: "Unimos tecnologia óptica milimétrica, curadoria premium e entrega segura para todo o Brasil.",
            maxLength: 200,
            location: "Subtítulo descritivo",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // PÁGINA: Catálogo de Armações (/armacoes)
  // ==========================================================================
  armacoes: {
    id: "armacoes",
    path: "/armacoes",
    title: "Catálogo de Armações (/armacoes)",
    category: "page",
    description: "Cabeçalho da listagem, textos de filtros e orientações para escolha do aro ideal.",
    previewPath: "/armacoes?preview=draft",
    sections: [
      {
        id: "catalogHeader",
        label: "1. Cabeçalho do Catálogo",
        description: "Título e descrição no topo da página de armações.",
        fields: [
          {
            id: "armacoes.header.title",
            key: "catalogTitle",
            label: "Título da Página",
            type: "text",
            default: "Armações de Grau & Solares",
            maxLength: 60,
            location: "Título no topo do catálogo",
          },
          {
            id: "armacoes.header.subtitle",
            key: "catalogSubtitle",
            label: "Subtítulo",
            type: "textarea",
            default:
              "Curadoria completa em acetato italiano, titânio e liga metálica ultraleve. Adicione suas lentes de grau no mesmo pedido.",
            maxLength: 250,
            location: "Texto descritivo abaixo do título",
          },
          {
            id: "armacoes.header.helpBadge",
            key: "helpBadge",
            label: "Badge de Dúvida / Suporte",
            type: "text",
            default: "Dúvidas no aro? Meça com nossa equipe no WhatsApp",
            maxLength: 70,
            location: "Badge interativa no topo do catálogo",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // TEMPLATE: Detalhes do Produto (/produto/[slug] ou /armacoes/[id])
  // ==========================================================================
  produtoTemplate: {
    id: "produtoTemplate",
    path: "/armacoes/exemplo",
    title: "Template de Detalhes do Produto (PDP)",
    category: "template",
    description: "Abas informativas, selos de garantia, avisos de graduação e políticas de envio.",
    previewPath: "/armacoes",
    sections: [
      {
        id: "badges",
        label: "1. Selos de Confiança e Benefícios",
        description: "Selos exibidos abaixo dos botões de compra.",
        fields: [
          {
            id: "pdp.badge.shipping",
            key: "badgeShipping",
            label: "Texto de Frete",
            type: "text",
            default: "Frete Grátis nas compras a partir de R$ 299",
            maxLength: 60,
            location: "Primeiro selo de benefício",
          },
          {
            id: "pdp.badge.warranty",
            key: "badgeWarranty",
            label: "Texto de Garantia",
            type: "text",
            default: "Garantia de 1 ano contra defeitos de fabricação",
            maxLength: 60,
            location: "Segundo selo de benefício",
          },
          {
            id: "pdp.badge.exchange",
            key: "badgeExchange",
            label: "Texto de Troca",
            type: "text",
            default: "Primeira troca grátis em até 7 dias corridos",
            maxLength: 60,
            location: "Terceiro selo de benefício",
          },
        ],
      },
      {
        id: "tabs",
        label: "2. Abas Informativas",
        description: "Textos padrão das abas de especificação e montagem com lentes de grau.",
        fields: [
          {
            id: "pdp.tab.prescriptionNotice",
            key: "prescriptionNotice",
            label: "Aviso de Montagem de Grau",
            type: "textarea",
            default:
              "Todas as nossas armações são compatíveis com lentes de visão simples, multifocais e fotossensíveis. Você pode enviar sua receita logo após finalizar a compra.",
            maxLength: 300,
            location: "Texto explicativo na aba de lentes de grau",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // PÁGINA: Catálogo de Lentes (/lentes)
  // ==========================================================================
  lentes: {
    id: "lentes",
    path: "/lentes",
    title: "Catálogo de Lentes (/lentes)",
    category: "page",
    description: "Apresentação das tecnologias de lentes, tratamentos antirreflexo e simulações.",
    previewPath: "/lentes?preview=draft",
    sections: [
      {
        id: "header",
        label: "1. Cabeçalho de Lentes",
        description: "Título principal e apresentação da curadoria de blocos ópticos.",
        fields: [
          {
            id: "lentes.header.title",
            key: "lensesTitle",
            label: "Título da Página",
            type: "text",
            default: "Lentes de Grau & Tratamentos Digitais",
            maxLength: 60,
            location: "Título no topo da página de lentes",
          },
          {
            id: "lentes.header.subtitle",
            key: "lensesSubtitle",
            label: "Subtítulo",
            type: "textarea",
            default:
              "Lentes monofocais e multifocais com tecnologia digital para miopia, hipermetropia, astigmatismo e presbiopia.",
            maxLength: 250,
            location: "Subtítulo abaixo do título",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // PÁGINA: Lentes Coloridas (/lentes-coloridas)
  // ==========================================================================
  lentesColoridas: {
    id: "lentesColoridas",
    path: "/lentes-coloridas",
    title: "Lentes de Contato Coloridas (/lentes-coloridas)",
    category: "page",
    description: "Catálogo de cores, recomendações de saúde ocular e rotina de higienização.",
    previewPath: "/lentes-coloridas?preview=draft",
    sections: [
      {
        id: "header",
        label: "1. Cabeçalho de Cores",
        description: "Apresentação da coleção de lentes de contato.",
        fields: [
          {
            id: "lentesColoridas.header.title",
            key: "title",
            label: "Título da Coleção",
            type: "text",
            default: "Lentes de Contato Coloridas",
            maxLength: 60,
            location: "Título principal da página",
          },
          {
            id: "lentesColoridas.header.subtitle",
            key: "subtitle",
            label: "Subtítulo",
            type: "textarea",
            default: "Pigmentação natural com alto conforto de hidratação. Disponíveis com e sem graduação.",
            maxLength: 200,
            location: "Subtítulo descritivo",
          },
        ],
      },
      {
        id: "safety",
        label: "2. Recomendações de Saúde Ocular",
        description: "Avisos de assepsia, descarte e uso seguro.",
        fields: [
          {
            id: "lentesColoridas.safety.title",
            key: "safetyTitle",
            label: "Título das Orientações",
            type: "text",
            default: "Uso Responsável & Cuidados Essenciais",
            maxLength: 60,
            location: "Título do bloco de segurança",
          },
          {
            id: "lentesColoridas.safety.text",
            key: "safetyText",
            label: "Orientações de Assepsia",
            type: "textarea",
            default:
              "Lave bem as mãos antes de manusear suas lentes. Utilize sempre solução multiuso estéril para limpeza e respeite o período de descarte recomendado pelo fabricante.",
            maxLength: 350,
            location: "Parágrafo do bloco de segurança",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // PÁGINA: Medição por Foto (/medicao-por-foto)
  // ==========================================================================
  medicaoPorFoto: {
    id: "medicaoPorFoto",
    path: "/medicao-por-foto",
    title: "Medição de DNP por Foto (/medicao-por-foto)",
    category: "page",
    description: "Passo a passo interativo para captura de distância naso-pupilar via câmera.",
    previewPath: "/medicao-por-foto?preview=draft",
    sections: [
      {
        id: "header",
        label: "1. Instruções Iniciais",
        description: "Orientações para tirar a foto de referência milimétrica.",
        fields: [
          {
            id: "medicao.header.title",
            key: "title",
            label: "Título do Guia",
            type: "text",
            default: "Como medir sua DNP pelo celular",
            maxLength: 60,
            location: "Título do topo da página",
          },
          {
            id: "medicao.header.subtitle",
            key: "subtitle",
            label: "Subtítulo",
            type: "textarea",
            default:
              "Um método simples e preciso com um cartão magnético padrão como referência dimensional para centragem perfeita das suas lentes.",
            maxLength: 250,
            location: "Subtítulo instrutivo",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // PÁGINA: Rastrear Pedido (/rastrear-pedido)
  // ==========================================================================
  rastrearPedido: {
    id: "rastrearPedido",
    path: "/rastrear-pedido",
    title: "Rastreamento de Pedido (/rastrear-pedido)",
    category: "page",
    description: "Instruções de busca por código, prazos de postagem e canais de atendimento.",
    previewPath: "/rastrear-pedido?preview=draft",
    sections: [
      {
        id: "header",
        label: "1. Consulta de Rastreio",
        description: "Orientações ao cliente para localizar seu pacote.",
        fields: [
          {
            id: "rastreio.header.title",
            key: "title",
            label: "Título da Página",
            type: "text",
            default: "Rastreie seu Pedido Ventara",
            maxLength: 60,
            location: "Título da página de rastreio",
          },
          {
            id: "rastreio.header.subtitle",
            key: "subtitle",
            label: "Subtítulo",
            type: "textarea",
            default: "Acompanhe em tempo real a montagem e a entrega das suas armações e lentes até o seu endereço.",
            maxLength: 200,
            location: "Subtítulo explicativo",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // PÁGINA: Responsável Técnico & Técnico Óptico
  // ==========================================================================
  responsavelTecnico: {
    id: "responsavelTecnico",
    path: "/responsavel-tecnico",
    title: "Responsável Técnico Óptico (/responsavel-tecnico)",
    category: "page",
    description: "Dados regulatórios, registro profissional no conselho de óptica e responsabilidade técnica.",
    previewPath: "/responsavel-tecnico?preview=draft",
    sections: [
      {
        id: "technicalData",
        label: "1. Dados Regulatórios e Responsabilidade Técnica",
        description: "Informações públicas obrigatórias perante a vigilância sanitária e conselhos de classe.",
        fields: [
          {
            id: "respTec.name",
            key: "techName",
            label: "Nome do Responsável Técnico",
            type: "text",
            default: "Técnico Óptico Responsável — Ótica Ventara",
            maxLength: 80,
            location: "Nome em destaque",
          },
          {
            id: "respTec.councilRegistry",
            key: "councilRegistry",
            label: "Registro Profissional (CROO / CBO)",
            type: "text",
            default: "Registro CROO/SP sob conformidade técnica",
            maxLength: 60,
            location: "Número de registro oficial",
          },
          {
            id: "respTec.labLocation",
            key: "labLocation",
            label: "Laboratório Próprio de Montagem",
            type: "text",
            default: "Laboratório Digital Ótica Ventara — Araçatuba/SP",
            maxLength: 80,
            location: "Endereço da sede e laboratório",
          },
          {
            id: "respTec.legalNotice",
            key: "legalNotice",
            label: "Aviso Legal & Regulatório",
            type: "textarea",
            default:
              "A Ótica Ventara atua em estrita conformidade com a legislação sanitária brasileira, realizando a montagem de lentes graduadas exclusivamente mediante prescrição emitida por médico oftalmologista ou profissional legalmente habilitado.",
            maxLength: 400,
            location: "Texto de conformidade legal",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // PÁGINAS LEGAIS: Termos e Políticas (/termos, /privacidade, /trocas)
  // ==========================================================================
  politicas: {
    id: "politicas",
    path: "/termos",
    title: "Políticas, Termos e Privacidade",
    category: "page",
    description: "Textos institucionais longos de termos de serviço, política de privacidade (LGPD) e trocas.",
    previewPath: "/termos?preview=draft",
    sections: [
      {
        id: "terms",
        label: "1. Termos de Uso do Site",
        description: "Condições gerais de navegação e compra no e-commerce.",
        fields: [
          {
            id: "politicas.terms.title",
            key: "termsTitle",
            label: "Título dos Termos",
            type: "text",
            default: "Termos e Condições de Uso",
            maxLength: 60,
            location: "Título dos termos",
          },
          {
            id: "politicas.terms.content",
            key: "termsContent",
            label: "Texto dos Termos de Uso",
            type: "rich",
            default:
              "Bem-vindo à Ótica Ventara. Ao navegar e realizar compras em nosso site, você concorda com nossos termos e diretrizes de comercialização de produtos ópticos.",
            help: "Suporta formatação com quebras de linha e links seguros.",
            location: "Corpo do texto dos termos",
          },
        ],
      },
      {
        id: "privacy",
        label: "2. Política de Privacidade & LGPD",
        description: "Tratamento de dados pessoais em conformidade com a Lei Geral de Proteção de Dados.",
        fields: [
          {
            id: "politicas.privacy.title",
            key: "privacyTitle",
            label: "Título da Política",
            type: "text",
            default: "Política de Privacidade e Proteção de Dados (LGPD)",
            maxLength: 60,
            location: "Título da privacidade",
          },
          {
            id: "politicas.privacy.content",
            key: "privacyContent",
            label: "Texto da Política de Privacidade",
            type: "rich",
            default:
              "A Ótica Ventara valoriza a sua privacidade. Seus dados pessoais e receitas médicas são armazenados com criptografia de ponta a ponta e utilizados exclusivamente para o processamento do seu pedido.",
            help: "Suporta formatação com quebras de linha e links seguros.",
            location: "Corpo da política de privacidade",
          },
        ],
      },
      {
        id: "exchanges",
        label: "3. Política de Trocas & Devoluções",
        description: "Prazos do Código de Defesa do Consumidor e orientações para devolução.",
        fields: [
          {
            id: "politicas.exchanges.title",
            key: "exchangesTitle",
            label: "Título da Política de Trocas",
            type: "text",
            default: "Política de Trocas, Devoluções e Garantia",
            maxLength: 60,
            location: "Título da política de trocas",
          },
          {
            id: "politicas.exchanges.content",
            key: "exchangesContent",
            label: "Texto de Trocas e Garantia",
            type: "rich",
            default:
              "Você pode solicitar a troca de armações sem graduação em até 7 (sete) dias corridos após o recebimento. Para produtos com garantia de fabricação, oferecemos cobertura completa de 1 ano.",
            help: "Suporta formatação com quebras de linha e links seguros.",
            location: "Corpo da política de trocas",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ELEMENTO GLOBAL: Cabeçalho do Site (Header)
  // ==========================================================================
  globalHeader: {
    id: "globalHeader",
    path: "/",
    title: "Cabeçalho Global (Header)",
    category: "global",
    description: "Barra superior de navegação presente em todas as páginas públicas.",
    previewPath: "/?preview=draft",
    sections: [
      {
        id: "navigation",
        label: "1. Textos e Ações do Cabeçalho",
        description: "Controles rápidos do menu e contato.",
        fields: [
          {
            id: "header.contactBtnText",
            key: "contactBtnText",
            label: "Texto do Botão de Contato",
            type: "text",
            default: "Falar no WhatsApp",
            maxLength: 30,
            location: "Botão de atendimento no header",
          },
          {
            id: "header.bagTooltip",
            key: "bagTooltip",
            label: "Legenda da Sacola / Carrinho",
            type: "text",
            default: "Minha Sacola",
            maxLength: 30,
            location: "Tooltip do ícone da sacola",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ELEMENTO GLOBAL: Barra de Anúncio Superior (Announcement Bar)
  // ==========================================================================
  globalAnnouncement: {
    id: "globalAnnouncement",
    path: "/",
    title: "Barra de Anúncio Superior",
    category: "global",
    description: "Faixa no topo absoluto da tela com avisos de frete ou cupons.",
    previewPath: "/?preview=draft",
    sections: [
      {
        id: "announcement",
        label: "1. Configuração do Anúncio",
        description: "Mensagem exibida no topo do site.",
        fields: [
          {
            id: "announcement.enabled",
            key: "enabled",
            label: "Exibir Barra de Anúncio",
            type: "toggle",
            default: true,
            location: "Chave liga/desliga",
          },
          {
            id: "announcement.text",
            key: "text",
            label: "Texto do Anúncio",
            type: "text",
            default: "📦 Frete Grátis para todo o Brasil em compras a partir de R$ 299 · Parcele em até 10x sem juros",
            maxLength: 120,
            location: "Texto central da barra superior",
          },
          {
            id: "announcement.linkUrl",
            key: "linkUrl",
            label: "Link Opcional de Destino",
            type: "text",
            default: "/armacoes",
            placeholder: "/armacoes",
            maxLength: 100,
            location: "Redirecionamento ao clicar no anúncio",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ELEMENTO GLOBAL: Rodapé do Site (Footer)
  // ==========================================================================
  globalFooter: {
    id: "globalFooter",
    path: "/",
    title: "Rodapé Global (Footer)",
    category: "global",
    description: "Informações corporativas, CNPJ, horários e links institucionais.",
    previewPath: "/?preview=draft",
    sections: [
      {
        id: "corporate",
        label: "1. Dados Institucionais",
        description: "Identificação da empresa e endereço da matriz.",
        fields: [
          {
            id: "footer.cnpj",
            key: "cnpj",
            label: "CNPJ da Empresa",
            type: "text",
            default: "CNPJ 00.000.000/0001-00 (Ótica Ventara Ltda)",
            maxLength: 50,
            location: "Texto de identificação fiscal no rodapé",
          },
          {
            id: "footer.address",
            key: "address",
            label: "Endereço da Sede & Laboratório",
            type: "text",
            default: "Araçatuba — SP · Atendimento para todo o Brasil",
            maxLength: 80,
            location: "Endereço físico no rodapé",
          },
          {
            id: "footer.hours",
            key: "hours",
            label: "Horário de Atendimento",
            type: "text",
            default: "Segunda a Sexta: 08h30 às 18h00 | Sábado: 09h00 às 13h00",
            maxLength: 70,
            location: "Horários de suporte",
          },
          {
            id: "footer.copyright",
            key: "copyright",
            label: "Texto de Copyright",
            type: "text",
            default: "© 2026 Ótica Ventara Eyewear. Todos os direitos reservados.",
            maxLength: 80,
            location: "Linha final de direitos autorais",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ELEMENTO GLOBAL: WhatsApp Flutuante
  // ==========================================================================
  globalWhatsapp: {
    id: "globalWhatsapp",
    path: "/",
    title: "Botão Flutuante do WhatsApp",
    category: "global",
    description: "Botão de atendimento rápido fixado no canto inferior de todas as páginas.",
    previewPath: "/?preview=draft",
    sections: [
      {
        id: "whatsappConfig",
        label: "1. Configuração do Atendimento",
        description: "Telefone e mensagens automáticas de recepção.",
        fields: [
          {
            id: "whatsapp.tooltip",
            key: "tooltip",
            label: "Texto do Balão / Tooltip",
            type: "text",
            default: "Dúvidas sobre armações ou lentes? Fale conosco!",
            maxLength: 60,
            location: "Balão ao passar o mouse sobre o botão",
          },
          {
            id: "whatsapp.defaultMsg",
            key: "defaultMsg",
            label: "Mensagem Padrão Pré-preenchida",
            type: "textarea",
            default: "Olá! Gostaria de tirar dúvidas sobre armações e lentes da Ótica Ventara.",
            maxLength: 180,
            location: "Texto enviado pelo cliente ao clicar",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ELEMENTO GLOBAL: Banner de Cookies & Consentimento LGPD
  // ==========================================================================
  globalCookies: {
    id: "globalCookies",
    path: "/",
    title: "Banner de Cookies & LGPD",
    category: "global",
    description: "Aviso de consentimento de privacidade e termos da LGPD.",
    previewPath: "/?preview=draft",
    sections: [
      {
        id: "cookieBanner",
        label: "1. Texto de Consentimento",
        description: "Mensagem de autorização de cookies.",
        fields: [
          {
            id: "cookies.text",
            key: "text",
            label: "Texto de Notificação",
            type: "textarea",
            default:
              "Utilizamos cookies essenciais para oferecer a melhor experiência óptica, personalizar anúncios e garantir transações seguras.",
            maxLength: 250,
            location: "Corpo do banner de cookies",
          },
          {
            id: "cookies.btnAcceptText",
            key: "btnAcceptText",
            label: "Texto do Botão de Aceite",
            type: "text",
            default: "Entendido e Aceitar",
            maxLength: 30,
            location: "Botão de confirmação do banner",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // ELEMENTO GLOBAL: SEO Global do Site
  // ==========================================================================
  globalSeo: {
    id: "globalSeo",
    path: "/",
    title: "Configurações Globais de SEO",
    category: "global",
    description: "Meta tags padrão, sufixo de título e tags Open Graph para redes sociais.",
    previewPath: "/?preview=draft",
    sections: [
      {
        id: "seoMeta",
        label: "1. Meta Tags Globais",
        description: "Padrões utilizados caso a página não defina dados próprios.",
        fields: [
          {
            id: "seo.defaultTitle",
            key: "defaultTitle",
            label: "Título Padrão do Site",
            type: "text",
            default: "Ótica Ventara | Armações de Grau, Solares e Lentes Digitais",
            maxLength: 70,
            location: "Tag <title> principal",
          },
          {
            id: "seo.titleSuffix",
            key: "titleSuffix",
            label: "Sufixo de Título",
            type: "text",
            default: " | Ótica Ventara",
            maxLength: 30,
            location: "Texto anexado ao final do título de cada página",
          },
          {
            id: "seo.defaultDescription",
            key: "defaultDescription",
            label: "Meta Descrição Padrão",
            type: "textarea",
            default:
              "Encontre armações exclusivas de grau e solares com lentes digitais de alta precisão. Laboratório próprio, envio para todo o Brasil e atendimento especializado em Araçatuba/SP.",
            maxLength: 160,
            location: "Tag <meta name='description'>",
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // PÁGINA COM EDITOR ESPECIALIZADO: Rede de Entregas (/entregas)
  // ==========================================================================
  entregas: {
    id: "entregas",
    path: "/entregas",
    title: "Rede de Entregas & Frete (/entregas)",
    category: "page",
    description: "Página gerenciada através do CMS especializado com controle de identidade visual e transportadoras.",
    previewPath: "/entregas?preview=draft",
    existingEditorUrl: "/admin/entrega",
    sections: [],
  },

  // ==========================================================================
  // PÁGINA COM EDITOR ESPECIALIZADO: Roleta Promocional (/roleta)
  // ==========================================================================
  roleta: {
    id: "roleta",
    path: "/roleta",
    title: "Roleta Promocional (/roleta)",
    category: "page",
    description: "Campanha interativa de cupons e descontos com editor dedicado de prêmios e probabilidades.",
    previewPath: "/roleta",
    existingEditorUrl: "/admin/promocoes/roleta",
    sections: [],
  },
};

/**
 * Lista ordenada de todas as páginas registradas para o Mapa do Site.
 */
export const SITE_PAGES_LIST: ContentPageDefinition[] = Object.values(SITE_PAGES_REGISTRY);

/**
 * Retorna a definição de uma página específica pelo identificador.
 */
export function getPageDefinition(pageId: string): ContentPageDefinition | undefined {
  return SITE_PAGES_REGISTRY[pageId];
}

/**
 * Extrai todos os campos de uma página para um dicionário de valores padrão.
 */
export function getPageDefaultValues(pageId: string): Record<string, any> {
  const page = SITE_PAGES_REGISTRY[pageId];
  if (!page) return {};

  const defaults: Record<string, any> = {};
  for (const section of page.sections) {
    for (const field of section.fields) {
      defaults[field.key] = field.default;
    }
  }
  return defaults;
}

/**
 * Retorna a lista plana de todos os campos definidos em todo o site (para busca global).
 */
export function getAllContentFields(): Array<{
  pageId: string;
  pageTitle: string;
  pagePath: string;
  sectionId: string;
  sectionLabel: string;
  field: ContentFieldDefinition;
}> {
  const result: Array<{
    pageId: string;
    pageTitle: string;
    pagePath: string;
    sectionId: string;
    sectionLabel: string;
    field: ContentFieldDefinition;
  }> = [];

  for (const page of SITE_PAGES_LIST) {
    for (const section of page.sections) {
      for (const field of section.fields) {
        result.push({
          pageId: page.id,
          pageTitle: page.title,
          pagePath: page.path,
          sectionId: section.id,
          sectionLabel: section.label,
          field,
        });
      }
    }
  }

  return result;
}
