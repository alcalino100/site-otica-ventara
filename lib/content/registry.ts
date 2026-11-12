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
        label: "1. Hero Principal",
        description: "Dobra principal com título, selo de engenharia óptica, descrição, ações e imagem de destaque.",
        fields: [
          {
            id: "optisync.hero.badge",
            key: "heroBadge",
            label: "Selo de Tecnologia (Eyebrow)",
            type: "text",
            default: "ENGENHARIA ÓPTICA DIGITAL",
            maxLength: 50,
            location: "Pílula no topo do Hero",
          },
          {
            id: "optisync.hero.title",
            key: "heroTitle",
            label: "Título Principal (Linha 1)",
            type: "text",
            default: "Lentes Digitais",
            maxLength: 60,
            location: "Primeira linha do título principal",
          },
          {
            id: "optisync.hero.titleHighlight",
            key: "heroTitleHighlight",
            label: "Título em Destaque Amarelo (Linha 2)",
            type: "text",
            default: "OPTiSYNC HD",
            maxLength: 40,
            location: "Texto destacado em amarelo no título",
          },
          {
            id: "optisync.hero.description",
            key: "heroDescription",
            label: "Descrição do Hero",
            type: "textarea",
            default:
              "Surfaçagem digital computadorizada ponto a ponto com ampliação de campo visual útil, tratamento antirreflexo multicamadas hidrorrepelente e montagem computadorizada em laboratório próprio.",
            maxLength: 350,
            location: "Parágrafo descritivo logo abaixo do título",
          },
          {
            id: "optisync.hero.statusSurfacagem",
            key: "heroStatusSurfacagem",
            label: "Status Tecnológico (Card)",
            type: "text",
            default: "Surfaçagem Digital 3D",
            maxLength: 40,
            location: "Rodapé do card visual do produto",
          },
          {
            id: "optisync.hero.statusGarantia",
            key: "heroStatusGarantia",
            label: "Selo de Garantia (Card)",
            type: "text",
            default: "Garantia 12 Meses",
            maxLength: 40,
            location: "Rodapé do card visual do produto",
          },
          {
            id: "optisync.hero.ctaWhatsapp",
            key: "heroCtaWhatsapp",
            label: "Texto do Botão WhatsApp",
            type: "text",
            default: "Consultar Óptico no WhatsApp",
            maxLength: 40,
            location: "Botão principal amarelo",
          },
          {
            id: "optisync.hero.ctaColors",
            key: "heroCtaColors",
            label: "Texto do Botão de Cores",
            type: "text",
            default: "Ver Lentes Coloridas & Solares",
            maxLength: 40,
            location: "Botão secundário translúcido",
          },
          {
            id: "optisync.hero.portraitUrl",
            key: "heroPortraitUrl",
            label: "Imagem de Destaque do Hero",
            type: "image",
            default: "/images/lenses/optisync/arte-09-hd-hero-retrato.jpg",
            location: "Foto oficial no card de destaque do topo",
          },
          {
            id: "optisync.hero.productAltText",
            key: "productAltText",
            label: "Texto Alternativo da Imagem (Acessibilidade)",
            type: "text",
            default: "Lentes Digitais OPTiSYNC HD",
            maxLength: 100,
            location: "Atributo alt da imagem de destaque",
          },
        ],
      },
      {
        id: "hdLine",
        label: "2. Linha OPTiSYNC HD (Adulto & Telas)",
        description: "Apresentação da linha adulta com 4 artes laboratoriais (caixa, gamer, escritório, braço robótico).",
        fields: [
          {
            id: "optisync.hd.badge",
            key: "hdBadge",
            label: "Etiqueta da Linha HD",
            type: "text",
            default: "LINHA ADULTO & USO DIGITAL",
            maxLength: 50,
            location: "Rótulo superior da seção HD",
          },
          {
            id: "optisync.hd.title",
            key: "hdTitle",
            label: "Título da Linha HD",
            type: "text",
            default: "Lentes Digitais",
            maxLength: 50,
            location: "Título da seção HD",
          },
          {
            id: "optisync.hd.titleHighlight",
            key: "hdTitleHighlight",
            label: "Destaque Amarelo da Linha HD",
            type: "text",
            default: "OPTiSYNC HD",
            maxLength: 40,
            location: "Texto destacado do título HD",
          },
          {
            id: "optisync.hd.description",
            key: "hdDescription",
            label: "Descrição da Linha HD",
            type: "textarea",
            default:
              "Desenvolvidas com cálculo de surfaçagem ponto a ponto e tratamento Blue Shield, eliminando aberrações ópticas e cansaço visual digital prolongado.",
            maxLength: 300,
            location: "Texto explicativo da linha HD",
          },
          {
            id: "optisync.hd.ctaText",
            key: "hdCtaText",
            label: "Texto do Botão Catálogo HD",
            type: "text",
            default: "Ver Catálogo HD",
            maxLength: 40,
            location: "Botão azul da linha HD",
          },
          {
            id: "optisync.hd.ctaLink",
            key: "hdCtaLink",
            label: "Link do Botão Catálogo HD",
            type: "link",
            default: "/lentes?linha=hd",
            location: "Destino do clique do botão HD",
          },
          {
            id: "optisync.hd.card1Tag",
            key: "hdCard1Tag",
            label: "Card 1: Etiqueta (Produto)",
            type: "text",
            default: "Produto Oficial",
            maxLength: 30,
            location: "Etiqueta amarela do Card 1",
          },
          {
            id: "optisync.hd.card1Title",
            key: "hdCard1Title",
            label: "Card 1: Título",
            type: "text",
            default: "Precisão Ponto a Ponto",
            maxLength: 40,
            location: "Título do Card 1",
          },
          {
            id: "optisync.hd.card1Desc",
            key: "hdCard1Desc",
            label: "Card 1: Descrição",
            type: "text",
            default: "Lapidação com corte tridimensional sob medida.",
            maxLength: 120,
            location: "Subtítulo do Card 1",
          },
          {
            id: "optisync.hd.card2Tag",
            key: "hdCard2Tag",
            label: "Card 2: Etiqueta (Gamer)",
            type: "text",
            default: "Gamer & Telas",
            maxLength: 30,
            location: "Etiqueta azul do Card 2",
          },
          {
            id: "optisync.hd.card2Title",
            key: "hdCard2Title",
            label: "Card 2: Título",
            type: "text",
            default: "Blue Shield Integrado",
            maxLength: 40,
            location: "Título do Card 2",
          },
          {
            id: "optisync.hd.card2Desc",
            key: "hdCard2Desc",
            label: "Card 2: Descrição",
            type: "text",
            default: "Proteção ativa contra emissão de luz azul nociva.",
            maxLength: 120,
            location: "Subtítulo do Card 2",
          },
          {
            id: "optisync.hd.card3Tag",
            key: "hdCard3Tag",
            label: "Card 3: Etiqueta (Home Office)",
            type: "text",
            default: "Trabalho & Home Office",
            maxLength: 30,
            location: "Etiqueta cinza do Card 3",
          },
          {
            id: "optisync.hd.card3Title",
            key: "hdCard3Title",
            label: "Card 3: Título",
            type: "text",
            default: "Conforto Contínuo",
            maxLength: 40,
            location: "Título do Card 3",
          },
          {
            id: "optisync.hd.card3Desc",
            key: "hdCard3Desc",
            label: "Card 3: Descrição",
            type: "text",
            default: "Alívio do estresse visual para longas jornadas.",
            maxLength: 120,
            location: "Subtítulo do Card 3",
          },
          {
            id: "optisync.hd.card4Tag",
            key: "hdCard4Tag",
            label: "Card 4: Etiqueta (Robótica)",
            type: "text",
            default: "Engenharia Óptica",
            maxLength: 30,
            location: "Etiqueta roxa do Card 4",
          },
          {
            id: "optisync.hd.card4Title",
            key: "hdCard4Title",
            label: "Card 4: Título",
            type: "text",
            default: "Corte Milimétrico",
            maxLength: 40,
            location: "Título do Card 4",
          },
          {
            id: "optisync.hd.card4Desc",
            key: "hdCard4Desc",
            label: "Card 4: Descrição",
            type: "text",
            default: "Usinagem digital de altíssima fidelidade.",
            maxLength: 120,
            location: "Subtítulo do Card 4",
          },
        ],
      },
      {
        id: "photochromicLine",
        label: "3. Linha Fotossensível & Simulador",
        description: "Controle dos textos da linha fotossensível, slider interativo e exibição das 3 fases de luminosidade.",
        fields: [
          {
            id: "optisync.photochromic.badge",
            key: "photochromicBadge",
            label: "Etiqueta da Linha Fotossensível",
            type: "text",
            default: "TECNOLOGIA FOTOSSENSÍVEL ADULTO",
            maxLength: 50,
            location: "Rótulo superior da seção fotossensível",
          },
          {
            id: "optisync.photochromic.title",
            key: "photochromicTitle",
            label: "Título Fotossensível",
            type: "text",
            default: "OPTiSYNC HD",
            maxLength: 50,
            location: "Título da seção fotossensível",
          },
          {
            id: "optisync.photochromic.titleHighlight",
            key: "photochromicTitleHighlight",
            label: "Destaque Amarelo Fotossensível",
            type: "text",
            default: "Fotossensível",
            maxLength: 40,
            location: "Texto destacado do título fotossensível",
          },
          {
            id: "optisync.photochromic.description",
            key: "photochromicDescription",
            label: "Descrição Fotossensível",
            type: "textarea",
            default:
              "Lentes inteligentes que clareiam com rapidez em ambientes internos e escurecem sob o sol, bloqueando 100% dos raios UVA/UVB com conforto total.",
            maxLength: 300,
            location: "Texto explicativo da linha fotossensível",
          },
          {
            id: "optisync.photochromic.ctaText",
            key: "photochromicCtaText",
            label: "Texto do Botão Modelos Fotossensíveis",
            type: "text",
            default: "Ver Modelos Fotossensíveis",
            maxLength: 40,
            location: "Botão gradiente roxo/azul",
          },
          {
            id: "optisync.photochromic.ctaLink",
            key: "photochromicCtaLink",
            label: "Link do Botão Fotossensível",
            type: "link",
            default: "/lentes?linha=fotossensivel",
            location: "Destino do botão fotossensível",
          },
          {
            id: "optisync.simulator.eyebrow",
            key: "simulatorEyebrow",
            label: "Etiqueta do Simulador",
            type: "text",
            default: "Simulador Dinâmico",
            maxLength: 40,
            location: "Eyebrow acima do slider interativo",
          },
          {
            id: "optisync.simulator.title",
            key: "simulatorTitle",
            label: "Título do Simulador",
            type: "text",
            default: "Transição Óptica Inteligente",
            maxLength: 60,
            location: "Título acima do slider interativo",
          },
          {
            id: "optisync.simulator.indoorLabel",
            key: "indoorLabel",
            label: "Rótulo Ambiente Interno",
            type: "text",
            default: "Ambiente Interno",
            maxLength: 30,
            location: "Pílula superior esquerda do slider",
          },
          {
            id: "optisync.simulator.outdoorLabel",
            key: "outdoorLabel",
            label: "Rótulo Sol Pleno",
            type: "text",
            default: "Sol Pleno",
            maxLength: 30,
            location: "Pílula superior direita do slider",
          },
          {
            id: "optisync.simulator.transitionSpeedText",
            key: "transitionSpeedText",
            label: "Velocidade de Transição",
            type: "text",
            default: "Ativação em até 30 segundos sob radiação UV",
            maxLength: 80,
            location: "Texto explicativo logo abaixo do slider",
          },
          {
            id: "optisync.simulator.instructions",
            key: "simulatorInstructions",
            label: "Instrução de Interação",
            type: "text",
            default: "Arraste ou use as setas do teclado (← / →) para simular o escurecimento",
            maxLength: 100,
            location: "Legenda de acessibilidade do teclado",
          },
          {
            id: "optisync.phases.eyebrow",
            key: "phasesEyebrow",
            label: "Etiqueta dos 3 Estados",
            type: "text",
            default: "Ambientes de Uso",
            maxLength: 40,
            location: "Eyebrow do card de 3 fases",
          },
          {
            id: "optisync.phases.title",
            key: "phasesTitle",
            label: "Título dos 3 Estados",
            type: "text",
            default: "3 Fases de Luminosidade",
            maxLength: 60,
            location: "Título do card de 3 fases",
          },
          {
            id: "optisync.phases.subtitle",
            key: "phasesSubtitle",
            label: "Subtítulo dos 3 Estados",
            type: "text",
            default: "Ambiente Interno · Meia Luz · Sol Pleno",
            maxLength: 80,
            location: "Subtítulo do card de 3 fases",
          },
          {
            id: "optisync.phases.note",
            key: "phasesNote",
            label: "Nota Molecular dos Fótons UV",
            type: "textarea",
            default: "A molécula fotossensível reage aos fótons UV sem distorcer as cores reais.",
            maxLength: 150,
            location: "Texto de rodapé do card de 3 fases",
          },
        ],
      },
      {
        id: "kidsLine",
        label: "4. Linha OPTiSYNC Kids Adventure (Infantil)",
        description: "Apresentação da linha infantil, pôster institucional, logo 3D e botões de contato.",
        fields: [
          {
            id: "optisync.kids.badge",
            key: "kidsBadge",
            label: "Etiqueta da Linha Infantil",
            type: "text",
            default: "LINHA INFANTIL & JUVENIL",
            maxLength: 50,
            location: "Rótulo superior da seção Kids",
          },
          {
            id: "optisync.kids.title",
            key: "kidsTitle",
            label: "Título Kids",
            type: "text",
            default: "OPTiSYNC",
            maxLength: 40,
            location: "Primeira linha do título Kids",
          },
          {
            id: "optisync.kids.titleHighlight",
            key: "kidsTitleHighlight",
            label: "Destaque Amarelo Kids",
            type: "text",
            default: "Kids Adventure",
            maxLength: 40,
            location: "Texto destacado do título Kids",
          },
          {
            id: "optisync.kids.description",
            key: "kidsDescription",
            label: "Descrição Kids",
            type: "textarea",
            default:
              "Produzidas em materiais de alta tenacidade contra impactos acidentais na escola e brincadeiras, com leveza extrema e proteção contra luz azul e radiação solar.",
            maxLength: 300,
            location: "Texto explicativo da linha Kids",
          },
          {
            id: "optisync.kids.logoTag",
            key: "kidsLogoTag",
            label: "Etiqueta do Logo 3D",
            type: "text",
            default: "Linha Oficial",
            maxLength: 30,
            location: "Selo do logo 3D Kids",
          },
          {
            id: "optisync.kids.logoTitle",
            key: "kidsLogoTitle",
            label: "Título do Logo 3D",
            type: "text",
            default: "Kids Adventure 3D",
            maxLength: 40,
            location: "Nome do selo do logo 3D",
          },
          {
            id: "optisync.kids.ctaText",
            key: "kidsCtaText",
            label: "Texto do Botão Armações Infantis",
            type: "text",
            default: "Ver Armações Infantis",
            maxLength: 40,
            location: "Botão amarelo da linha Kids",
          },
          {
            id: "optisync.kids.ctaLink",
            key: "kidsCtaLink",
            label: "Link do Botão Kids",
            type: "link",
            default: "/armacoes?categoria=infantil",
            location: "Destino do botão da linha Kids",
          },
          {
            id: "optisync.kids.whatsappCtaText",
            key: "kidsWhatsappCtaText",
            label: "Texto do Botão WhatsApp Kids",
            type: "text",
            default: "Falar com Especialista Infantil",
            maxLength: 40,
            location: "Botão secundário de WhatsApp na linha Kids",
          },
          {
            id: "optisync.kids.posterUrl",
            key: "kidsPosterUrl",
            label: "Pôster Institucional Kids",
            type: "image",
            default: "/images/lenses/optisync/arte-01-kids-poster.jpg",
            location: "Pôster do menino no card da linha Kids",
          },
        ],
      },
      {
        id: "benefits",
        label: "5. Benefícios & Diferenciais Construtivos",
        description: "Pilares de engenharia óptica e tecnologia das lentes.",
        fields: [
          {
            id: "optisync.benefits.eyebrow",
            key: "benefitsEyebrow",
            label: "Etiqueta da Seção",
            type: "text",
            default: "DIFERENCIAIS CONSTRUTIVOS",
            maxLength: 40,
            location: "Eyebrow acima do título de benefícios",
          },
          {
            id: "optisync.benefits.title",
            key: "benefitsTitle",
            label: "Título dos Benefícios",
            type: "text",
            default: "Por que a OPTiSYNC HD transforma a sua visão?",
            maxLength: 80,
            location: "Título da grade de benefícios",
          },
          {
            id: "optisync.benefits.subtitle",
            key: "benefitsSubtitle",
            label: "Subtítulo dos Benefícios",
            type: "textarea",
            default:
              "Projetada para proporcionar nitidez contínua e conforto óptico com tratamentos certificados.",
            maxLength: 200,
            location: "Subtítulo abaixo do título de benefícios",
          },
        ],
      },
      {
        id: "comparison",
        label: "6. Tabela Comparativa de Tecnologia",
        description: "Cabeçalhos, etiquetas e dicas de navegação da tabela Lentes Convencionais vs OPTiSYNC HD.",
        fields: [
          {
            id: "optisync.comparison.eyebrow",
            key: "comparisonEyebrow",
            label: "Etiqueta da Comparação",
            type: "text",
            default: "COMPARAÇÃO TÉCNICA",
            maxLength: 40,
            location: "Eyebrow da tabela comparativa",
          },
          {
            id: "optisync.comparison.title",
            key: "comparisonTitle",
            label: "Título da Comparação",
            type: "text",
            default: "Comparação Direta de Tecnologia",
            maxLength: 80,
            location: "Título da tabela comparativa",
          },
          {
            id: "optisync.comparison.subtitle",
            key: "comparisonSubtitle",
            label: "Subtítulo da Comparação",
            type: "textarea",
            default: "Entenda as diferenças entre processos convencionais e o padrão digital OPTiSYNC.",
            maxLength: 200,
            location: "Subtítulo abaixo do título comparativo",
          },
          {
            id: "optisync.comparison.mobileSwipe",
            key: "comparisonMobileSwipe",
            label: "Dica de Deslize no Mobile",
            type: "text",
            default: "← Deslize para comparar →",
            maxLength: 40,
            location: "Barra informativa no mobile",
          },
          {
            id: "optisync.comparison.col1Header",
            key: "comparisonCol1Header",
            label: "Coluna 1: Característica",
            type: "text",
            default: "Característica",
            maxLength: 30,
            location: "Cabeçalho da coluna 1",
          },
          {
            id: "optisync.comparison.col2Header",
            key: "comparisonCol2Header",
            label: "Coluna 2: Convencionais",
            type: "text",
            default: "Lentes Convencionais",
            maxLength: 30,
            location: "Cabeçalho da coluna 2",
          },
          {
            id: "optisync.comparison.col3Header",
            key: "comparisonCol3Header",
            label: "Coluna 3: OPTiSYNC HD",
            type: "text",
            default: "OPTiSYNC HD",
            maxLength: 30,
            location: "Cabeçalho da coluna 3",
          },
        ],
      },
      {
        id: "labHighlight",
        label: "7. Laboratório Próprio em Araçatuba",
        description: "Destaque da confecção local na Rua Princesa Isabel, 221 e indicadores de facetamento e inspeção.",
        fields: [
          {
            id: "optisync.lab.badge",
            key: "labBadge",
            label: "Selo de Laboratório Próprio",
            type: "text",
            default: "LABORATÓRIO ÓPTICO PRÓPRIO EM ARAÇATUBA",
            maxLength: 60,
            location: "Pílula dourada do laboratório",
          },
          {
            id: "optisync.lab.title",
            key: "labTitle",
            label: "Título Principal do Laboratório",
            type: "text",
            default: "Do cálculo computadorizado à montagem milimétrica",
            maxLength: 80,
            location: "Primeira linha do título do laboratório",
          },
          {
            id: "optisync.lab.titleHighlight",
            key: "labTitleHighlight",
            label: "Destaque Amarelo do Laboratório",
            type: "text",
            default: "em nossa sede",
            maxLength: 40,
            location: "Texto destacado do laboratório",
          },
          {
            id: "optisync.lab.description",
            key: "labDescription",
            label: "Descrição do Laboratório",
            type: "textarea",
            default:
              "Com usinagem e lensometria computadorizada na Rua Princesa Isabel, 221 em Araçatuba/SP, suas lentes OPTiSYNC HD são confeccionadas e inspecionadas por profissionais técnicos em óptica, com montagem expressa e rastreabilidade total.",
            maxLength: 350,
            location: "Texto explicativo do laboratório",
          },
          {
            id: "optisync.lab.facetadorasLabel",
            key: "labFacetadorasLabel",
            label: "Indicador 1: Rótulo",
            type: "text",
            default: "Facetadoras",
            maxLength: 30,
            location: "Rótulo do indicador 1",
          },
          {
            id: "optisync.lab.facetadorasValue",
            key: "labFacetadorasValue",
            label: "Indicador 1: Valor",
            type: "text",
            default: "Corte Computadorizado",
            maxLength: 40,
            location: "Valor do indicador 1",
          },
          {
            id: "optisync.lab.inspecaoLabel",
            key: "labInspecaoLabel",
            label: "Indicador 2: Rótulo",
            type: "text",
            default: "Inspeção",
            maxLength: 30,
            location: "Rótulo do indicador 2",
          },
          {
            id: "optisync.lab.inspecaoValue",
            key: "labInspecaoValue",
            label: "Indicador 2: Valor",
            type: "text",
            default: "100% dos Pares Aferidos",
            maxLength: 40,
            location: "Valor do indicador 2",
          },
          {
            id: "optisync.lab.origemLabel",
            key: "labOrigemLabel",
            label: "Indicador 3: Rótulo",
            type: "text",
            default: "Origem",
            maxLength: 30,
            location: "Rótulo do indicador 3",
          },
          {
            id: "optisync.lab.origemValue",
            key: "labOrigemValue",
            label: "Indicador 3: Valor (Cidade)",
            type: "text",
            default: "Araçatuba · SP",
            maxLength: 40,
            location: "Valor do indicador 3",
          },
        ],
      },
      {
        id: "colors",
        label: "8. Mostruário de Cores & Tonalidades Solares",
        description: "Banner Arte 2 e chamada para personalização de armações com lentes coloridas.",
        fields: [
          {
            id: "optisync.colors.eyebrow",
            key: "colorsEyebrow",
            label: "Etiqueta da Seção de Cores",
            type: "text",
            default: "MOSTRUÁRIO EXCLUSIVO",
            maxLength: 40,
            location: "Eyebrow acima do título de cores",
          },
          {
            id: "optisync.colors.title",
            key: "colorsTitle",
            label: "Título da Seção de Cores",
            type: "text",
            default: "Lentes Coloridas & Tonalidades Solares",
            maxLength: 80,
            location: "Título da seção de cores",
          },
          {
            id: "optisync.colors.subtitle",
            key: "colorsSubtitle",
            label: "Subtítulo da Seção de Cores",
            type: "textarea",
            default:
              "Personalize sua armação com lentes graduadas em tonalidades solares exclusivas, com proteção UV400 total e antirreflexo interno.",
            maxLength: 250,
            location: "Subtítulo da seção de cores",
          },
          {
            id: "optisync.colors.bannerBadge",
            key: "colorsBannerBadge",
            label: "Etiqueta no Banner",
            type: "text",
            default: "Paleta de Tonalidades Solares",
            maxLength: 40,
            location: "Texto em destaque no rodapé do banner",
          },
          {
            id: "optisync.colors.bannerText",
            key: "colorsBannerText",
            label: "Texto Explicativo no Banner",
            type: "text",
            default: "Disponíveis com a sua graduação exata prescrita pelo oftalmologista.",
            maxLength: 120,
            location: "Texto abaixo da etiqueta no rodapé do banner",
          },
          {
            id: "optisync.colors.ctaButtonText",
            key: "colorsCtaButtonText",
            label: "Texto do Botão de Catálogo de Cores",
            type: "text",
            default: "Acessar Seção de Cores no Catálogo",
            maxLength: 50,
            location: "Botão amarelo no banner de cores",
          },
        ],
      },
      {
        id: "faq",
        label: "9. Perguntas Frequentes (FAQ)",
        description: "Título e subtítulo da seção de perguntas frequentes sobre a tecnologia OPTiSYNC HD.",
        fields: [
          {
            id: "optisync.faq.eyebrow",
            key: "faqEyebrow",
            label: "Etiqueta do FAQ",
            type: "text",
            default: "TIRA-DÚVIDAS",
            maxLength: 30,
            location: "Eyebrow do FAQ",
          },
          {
            id: "optisync.faq.title",
            key: "faqTitle",
            label: "Título do FAQ",
            type: "text",
            default: "Perguntas Frequentes sobre a OPTiSYNC HD",
            maxLength: 80,
            location: "Título da seção de perguntas",
          },
        ],
      },
      {
        id: "cta",
        label: "10. Chamada Final & Atendimento WhatsApp",
        description: "Fechamento inferior com canal direto para envio de receita oftálmica e conferência técnica.",
        fields: [
          {
            id: "optisync.cta.badge",
            key: "ctaBadge",
            label: "Etiqueta do CTA Final",
            type: "text",
            default: "SUPORTE ESPECIALIZADO",
            maxLength: 40,
            location: "Eyebrow do bloco final",
          },
          {
            id: "optisync.cta.title",
            key: "ctaTitle",
            label: "Título do Fechamento",
            type: "text",
            default: "Pronto para enxergar com definição",
            maxLength: 70,
            location: "Primeira linha do título final",
          },
          {
            id: "optisync.cta.titleHighlight",
            key: "ctaTitleHighlight",
            label: "Destaque Amarelo do Fechamento",
            type: "text",
            default: "OPTiSYNC HD?",
            maxLength: 30,
            location: "Texto destacado do título final",
          },
          {
            id: "optisync.cta.subtitle",
            key: "ctaSubtitle",
            label: "Descrição do Fechamento",
            type: "textarea",
            default:
              "Envie sua receita oftálmica diretamente aos nossos ópticos em Araçatuba para uma conferência técnica completa e orçamento sob medida.",
            maxLength: 250,
            location: "Texto explicativo do bloco final",
          },
          {
            id: "optisync.cta.buttonText",
            key: "ctaButtonText",
            label: "Texto do Botão WhatsApp",
            type: "text",
            default: "Consultar Óptico no WhatsApp",
            maxLength: 40,
            location: "Botão principal amarelo de WhatsApp",
          },
          {
            id: "optisync.cta.colorsButtonText",
            key: "ctaColorsButtonText",
            label: "Texto do Botão de Cores",
            type: "text",
            default: "Ver Seção de Cores & Solares",
            maxLength: 40,
            location: "Botão secundário de cores",
          },
          {
            id: "optisync.cta.businessHours",
            key: "ctaBusinessHours",
            label: "Horário de Atendimento",
            type: "text",
            default: "Atendimento de segunda a sexta das 09h às 18h e aos sábados das 09h às 13h.",
            maxLength: 120,
            location: "Horário de atendimento no rodapé do CTA",
          },
          {
            id: "optisync.cta.whatsappMessage",
            key: "ctaWhatsappMessage",
            label: "Mensagem Pré-configurada do WhatsApp",
            type: "textarea",
            default:
              "Olá! Gostaria de consultar um técnico óptico sobre as lentes digitais OPTiSYNC HD da Ventara e enviar minha receita médica.",
            maxLength: 250,
            location: "Mensagem enviada automaticamente no WhatsApp",
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
        id: "hero",
        label: "1. Hero Principal Cinematográfico",
        description: "Dobra superior de impacto com título, subtítulo e chamada principal.",
        fields: [
          {
            id: "home.hero.badge",
            key: "heroBadge",
            label: "Badge / Eyebrow",
            type: "text",
            default: "CURADORIA EXCLUSIVA · ÓTICAS VENTARA",
            maxLength: 50,
            location: "Pílula de introdução no topo do Hero",
          },
          {
            id: "home.hero.title",
            key: "heroTitle",
            label: "Título Principal do Hero",
            type: "text",
            default: "Mais que óculos, é sobre você.",
            maxLength: 70,
            location: "Título de impacto do Hero",
          },
          {
            id: "home.hero.description",
            key: "heroDescription",
            label: "Descrição do Hero",
            type: "textarea",
            default: "Armações em acetato premium e lentes digitais de alta precisão montadas em laboratório próprio computadorizado.",
            maxLength: 250,
            location: "Parágrafo descritivo abaixo do título",
          },
          {
            id: "home.hero.ctaText",
            key: "heroCtaText",
            label: "Texto do Botão Principal",
            type: "text",
            default: "Explorar Armações",
            maxLength: 30,
            location: "Botão principal de ação no Hero",
          },
          {
            id: "home.hero.ctaLink",
            key: "heroCtaLink",
            label: "Link do Botão Principal",
            type: "text",
            default: "/armacoes",
            maxLength: 100,
            location: "Destino do botão principal",
          },
        ],
      },
      {
        id: "warranty",
        label: "2. Banner Oficial 12 Meses de Garantia",
        description: "Faixa de destaque com 12 meses de garantia nas Lentes OPTiSYNC HD.",
        fields: [
          {
            id: "home.warranty.desktop",
            key: "warrantyBannerDesktop",
            label: "Imagem do Banner (Desktop)",
            type: "image",
            default: "/images/banners/optisync-12-meses-garantia-desktop.jpg",
            location: "Banner de garantia em telas desktop e tablets",
          },
          {
            id: "home.warranty.mobile",
            key: "warrantyBannerMobile",
            label: "Imagem do Banner (Mobile)",
            type: "image",
            default: "/images/banners/optisync-12-meses-garantia-desktop.jpg",
            location: "Banner de garantia em celulares",
          },
          {
            id: "home.warranty.msg",
            key: "warrantyWhatsappMessage",
            label: "Mensagem do WhatsApp",
            type: "textarea",
            default: "Olá! Vi o banner de 12 meses de garantia nas Lentes OPTiSYNC HD e gostaria de consultar valores para o meu grau.",
            maxLength: 200,
            location: "Mensagem pré-preenchida ao clicar no banner",
          },
        ],
      },
      {
        id: "showcase",
        label: "3. Vitrine Editorial Interativa",
        description: "Seletor interativo de estilos (solar, grau, masculino, feminino).",
        fields: [
          {
            id: "home.showcase.eyebrow",
            key: "showcaseEyebrow",
            label: "Eyebrow / Etiqueta",
            type: "text",
            default: "VITRINE EDITORIAL INTERATIVA",
            maxLength: 50,
            location: "Etiqueta superior do bloco interativo",
          },
          {
            id: "home.showcase.title",
            key: "showcaseTitle",
            label: "Título da Vitrine",
            type: "text",
            default: "Mais que óculos, é sobre você.",
            maxLength: 60,
            location: "Título da vitrine interativa",
          },
          {
            id: "home.showcase.subtitle",
            key: "showcaseSubtitle",
            label: "Subtítulo / Descrição",
            type: "textarea",
            default: "Design autoral, materiais nobres e ajuste ergonômico para o seu estilo de vida.",
            maxLength: 200,
            location: "Subtítulo descritivo da vitrine interativa",
          },
        ],
      },
      {
        id: "catalog",
        label: "4. Catálogo Editorial de Armações",
        description: "Seção 'Escolhas que combinam com você' com filtros e grade de produtos.",
        fields: [
          {
            id: "home.catalog.eyebrow",
            key: "catalogEyebrow",
            label: "Eyebrow / Etiqueta",
            type: "text",
            default: "SELEÇÃO EDITORIAL VENTARA",
            maxLength: 40,
            location: "Pílula acima do título do catálogo",
          },
          {
            id: "home.catalog.title",
            key: "catalogTitle",
            label: "Título (Primeira Parte)",
            type: "text",
            default: "Escolhas que",
            maxLength: 40,
            location: "Parte inicial do título",
          },
          {
            id: "home.catalog.titleHighlight",
            key: "catalogTitleHighlight",
            label: "Título em Destaque Âmbar",
            type: "text",
            default: "combinam com você.",
            maxLength: 40,
            location: "Parte destacada do título",
          },
          {
            id: "home.catalog.description",
            key: "catalogDescription",
            label: "Descrição do Catálogo",
            type: "textarea",
            default: "Explore nossa curadoria com modelos selecionados da loja física e catálogo digital. Experimente o equilíbrio ideal entre leveza, precisão e design atemporal.",
            maxLength: 250,
            location: "Parágrafo descritivo abaixo do título",
          },
        ],
      },
      {
        id: "offers",
        label: "5. Vitrine de Ofertas ('Até X% OFF')",
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
        id: "whyVentara",
        label: "6. Por que escolher a Ventara",
        description: "Bloco institucional com os pilares fundamentais da marca.",
        fields: [
          {
            id: "home.why.eyebrow",
            key: "whyEyebrow",
            label: "Eyebrow / Etiqueta",
            type: "text",
            default: "POR QUE ESCOLHER",
            maxLength: 40,
            location: "Etiqueta superior do bloco",
          },
          {
            id: "home.why.title",
            key: "whyTitle",
            label: "Título Principal",
            type: "text",
            default: "Óticas Ventara?",
            maxLength: 60,
            location: "Título da seção institucional",
          },
          {
            id: "home.why.subtitle",
            key: "whySubtitle",
            label: "Subtítulo / Descrição",
            type: "textarea",
            default: "Aqui você encontra armações exclusivas, lentes das melhores marcas e um laboratório próprio, com toda a tecnologia e precisão para garantir o melhor para a sua visão.",
            maxLength: 250,
            location: "Subtítulo descritivo",
          },
          {
            id: "home.why.lensesCtaText",
            key: "whyLensesCtaText",
            label: "Texto do Botão de Lentes",
            type: "text",
            default: "Ver Nossas Lentes",
            maxLength: 30,
            location: "Botão principal do bloco",
          },
          {
            id: "home.why.medicaoCtaText",
            key: "whyMedicaoCtaText",
            label: "Texto do Botão de Medição",
            type: "text",
            default: "Medição por Foto (DNP)",
            maxLength: 30,
            location: "Botão secundário do bloco",
          },
        ],
      },
      {
        id: "store",
        label: "7. Nosso Espaço Físico em Araçatuba",
        description: "Informações da loja física, fachada real, endereço e atendimento.",
        fields: [
          {
            id: "home.store.eyebrow",
            key: "storeEyebrow",
            label: "Eyebrow / Etiqueta",
            type: "text",
            default: "NOSSO ESPAÇO FÍSICO EM ARAÇATUBA-SP",
            maxLength: 50,
            location: "Etiqueta superior do bloco",
          },
          {
            id: "home.store.title",
            key: "storeTitle",
            label: "Título da Seção",
            type: "text",
            default: "Venha conhecer a Óticas Ventara Eyewear.",
            maxLength: 70,
            location: "Título principal da loja física",
          },
          {
            id: "home.store.desc",
            key: "storeDescription",
            label: "Descrição da Loja",
            type: "textarea",
            default: "Um ambiente acolhedor, sofisticado e moderno no Centro de Araçatuba. Prove armações exclusivas, faça ajustes anatômicos precisos e confira nosso laboratório próprio computadorizado.",
            maxLength: 300,
            location: "Texto descritivo do espaço",
          },
          {
            id: "home.store.address",
            key: "storeAddress",
            label: "Endereço Completo",
            type: "text",
            default: "Rua Princesa Isabel, 221 - Centro, Araçatuba - SP, 16010-310",
            maxLength: 120,
            location: "Endereço no card de localização",
          },
          {
            id: "home.store.phone",
            key: "storePhone",
            label: "Telefone Fixo / Contato",
            type: "text",
            default: "(18) 3304-2808",
            maxLength: 30,
            location: "Telefone de contato",
          },
          {
            id: "home.store.hours",
            key: "storeHours",
            label: "Horário de Funcionamento",
            type: "text",
            default: "Segunda a Sexta: 08h30 às 18h00 | Sábado: 09h00 às 13h00",
            maxLength: 80,
            location: "Horários de atendimento",
          },
        ],
      },
      {
        id: "lenses",
        label: "8. Catálogo de Lentes de Grau",
        description: "Apresentação do portfólio de lentes de visão simples, multifocais e marcas.",
        fields: [
          {
            id: "home.lenses.eyebrow",
            key: "lensesEyebrow",
            label: "Eyebrow / Etiqueta",
            type: "text",
            default: "LABORATÓRIO PRÓPRIO & CERTIFICADO",
            maxLength: 50,
            location: "Badge no topo da seção de lentes",
          },
          {
            id: "home.lenses.title",
            key: "lensesTitle",
            label: "Título da Seção",
            type: "text",
            default: "CATÁLOGO DE LENTES DE GRAU",
            maxLength: 60,
            location: "Título da vitrine de lentes",
          },
          {
            id: "home.lenses.subtitle",
            key: "lensesSubtitle",
            label: "Subtítulo / Descrição",
            type: "textarea",
            default: "Explore marcas, tecnologias e tratamentos de alta precisão para encontrar a lente ideal para sua visão. Montagem expressa em até 1 hora no laboratório próprio de Araçatuba.",
            maxLength: 250,
            location: "Texto de apoio de lentes",
          },
          {
            id: "home.lenses.prescriptionBtn",
            key: "lensesPrescriptionWhatsapp",
            label: "Texto do Botão Receita",
            type: "text",
            default: "Enviar Receita no WhatsApp",
            maxLength: 40,
            location: "Botão amarelo de envio de receita",
          },
          {
            id: "home.lenses.medicaoBtn",
            key: "lensesMedicaoBtnText",
            label: "Texto do Botão Medição",
            type: "text",
            default: "Medição por Foto (DNP)",
            maxLength: 40,
            location: "Botão secundário de medição",
          },
        ],
      },
      {
        id: "coloredLenses",
        label: "9. Lentes Solares & Performance",
        description: "Coleção de lentes coloridas, solares e tratamentos estéticos.",
        fields: [
          {
            id: "home.colored.eyebrow",
            key: "coloredEyebrow",
            label: "Eyebrow / Etiqueta",
            type: "text",
            default: "ENCONTRE SUA COR • PERSONALIZAÇÃO SOLAR",
            maxLength: 50,
            location: "Etiqueta superior do mostruário",
          },
          {
            id: "home.colored.title",
            key: "coloredTitle",
            label: "Título Principal",
            type: "text",
            default: "SUA COR",
            maxLength: 40,
            location: "Título de impacto do mostruário",
          },
          {
            id: "home.colored.subtitle",
            key: "coloredSubtitle",
            label: "Subtítulo / Descrição",
            type: "textarea",
            default: "Lentes solares para uma nova forma de ver. Tonalidades de alta fidelidade visual com proteção UV400 total.",
            maxLength: 200,
            location: "Texto descritivo das lentes solares",
          },
        ],
      },
      {
        id: "whatsapp",
        label: "10. Atendimento Personalizado no WhatsApp",
        description: "Chamada final com suporte humanizado de técnicos ópticos.",
        fields: [
          {
            id: "home.whatsapp.eyebrow",
            key: "whatsappEyebrow",
            label: "Eyebrow / Etiqueta",
            type: "text",
            default: "ATENDIMENTO PERSONALIZADO",
            maxLength: 40,
            location: "Etiqueta da caixa de contato",
          },
          {
            id: "home.whatsapp.title",
            key: "whatsappTitle",
            label: "Título Principal",
            type: "text",
            default: "Seu próximo olhar começa aqui.",
            maxLength: 60,
            location: "Título de encerramento da Home",
          },
          {
            id: "home.whatsapp.subtitle",
            key: "whatsappSubtitle",
            label: "Subtítulo / Descrição",
            type: "textarea",
            default: "Explore nossas opções ou fale com a equipe da Ótica Ventara para encontrar o modelo ideal para você.",
            maxLength: 200,
            location: "Texto de apoio de contato",
          },
          {
            id: "home.whatsapp.btnText",
            key: "whatsappButtonText",
            label: "Texto do Botão",
            type: "text",
            default: "Conversar com Consultor",
            maxLength: 40,
            location: "Botão principal de atendimento",
          },
          {
            id: "home.whatsapp.message",
            key: "whatsappMessage",
            label: "Mensagem Pré-configurada",
            type: "textarea",
            default: "Olá! Gostaria de consultoria sobre armações e lentes da Óticas Ventara.",
            maxLength: 200,
            location: "Mensagem enviada no WhatsApp",
          },
        ],
      },
      {
        id: "faq",
        label: "11. Dúvidas Frequentes (FAQ)",
        description: "Perguntas mais comuns sobre compra, montagem e garantia.",
        fields: [
          {
            id: "home.faq.eyebrow",
            key: "faqEyebrow",
            label: "Eyebrow / Etiqueta",
            type: "text",
            default: "DÚVIDAS FREQUENTES",
            maxLength: 40,
            location: "Etiqueta no topo do FAQ",
          },
          {
            id: "home.faq.title",
            key: "faqTitle",
            label: "Título Principal",
            type: "text",
            default: "Vamos olhar mais de perto?",
            maxLength: 60,
            location: "Título da seção de FAQ",
          },
          {
            id: "home.faq.subtitle",
            key: "faqSubtitle",
            label: "Subtítulo / Descrição",
            type: "textarea",
            default: "Transparência em cada etapa. Se restar qualquer dúvida, nossa equipe está pronta para conversar.",
            maxLength: 200,
            location: "Texto de apoio do FAQ",
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
    path: "/rastreio",
    title: "Rastreamento de Pedido (/rastreio)",
    category: "page",
    description: "Instruções de busca por código, prazos de postagem e canais de atendimento.",
    previewPath: "/rastreio?preview=draft",
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
    path: "/termos-de-uso",
    title: "Políticas, Termos e Privacidade",
    category: "page",
    description: "Textos institucionais longos de termos de serviço, política de privacidade (LGPD) e trocas.",
    previewPath: "/termos-de-uso?preview=draft",
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
