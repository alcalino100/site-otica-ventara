-- ============================================================================
-- MIGRATION: 20261106000001_optisync_three_lines_and_arts.sql
-- PROJETO: Ótica Ventara — Três Linhas OPTiSYNC (HD, Fotossensível, Kids),
--          Distribuição das 10 Artes Oficiais e CMS Total de Cores e Imagens
-- ============================================================================

INSERT INTO public.site_settings (key, description, value)
VALUES (
  'optisync_page_settings',
  'Configurações visuais das 3 linhas OPTiSYNC (HD, Fotossensível e Kids Adventure), galeria e cores medidas das artes',
  '{
    "bgMode": "code",
    "customBgDesktopUrl": "",
    "customBgMobileUrl": "",
    "bgOverlayOpacity": 70,
    "bgFocalPoint": "center",
    "gradientBaseFrom": "#000933",
    "gradientBaseTo": "#020716",
    "colorVioletLeft": "#4C01AE",
    "colorVioletGlow": "#7A2CFF",
    "colorBlueRight": "#0044C9",
    "colorBlueHighlight": "#1E5BFF",
    "colorMagentaSpot": "#B93DAA",
    "colorYellowAccent": "#FFC21A",
    "beamColorBlue": "#0044C9",
    "beamColorPurple": "#7A2CFF",
    "beamsIntensity": 85,
    "glowIntensity": 80,
    "enableAnimation": true,
    "enableFloorReflection": true,
    "heroBadge": "ENGENHARIA ÓPTICA DIGITAL",
    "heroTitle": "Lentes Digitais",
    "heroTitleHighlight": "OPTiSYNC HD",
    "heroDescription": "Surfaçagem digital computadorizada ponto a ponto com ampliação de campo visual útil, tratamento antirreflexo multicamadas hidrorrepelente e montagem computadorizada em laboratório próprio.",
    "heroLogoUrl": "/images/lenses/optisync/arte-03-kids-logo3d.jpg",
    "heroPortraitUrl": "/images/lenses/optisync/arte-09-hd-hero-retrato.jpg",
    "heroLandscapeUrl": "",
    "productBoxImage": "/images/lenses/optisync/arte-08-hd-caixa-lente.jpg",
    "productAltText": "Caixa das Lentes Digitais OPTiSYNC HD",
    "heroFeatures": [
      "Filtro de Luz Azul",
      "Antirreflexo Multicamadas",
      "Garantia de 12 Meses",
      "Montagem no Laboratório Ventara"
    ],
    "showLineSelector": true,
    "hdLine": {
      "enabled": true,
      "badge": "LINHA ADULTO & USO DIGITAL",
      "title": "Lentes Digitais",
      "titleHighlight": "OPTiSYNC HD",
      "subtitle": "Engenharia de precisão para foco nítido e ergonomia visual no trabalho e telas",
      "description": "Desenvolvidas com cálculo de surfaçagem ponto a ponto e tratamento Blue Shield, eliminando aberrações ópticas e cansaço visual digital prolongado.",
      "logoUrl": "",
      "productImageUrl": "/images/lenses/optisync/arte-08-hd-caixa-lente.jpg",
      "gamerImageUrl": "/images/lenses/optisync/arte-05-hd-gamer.jpg",
      "robotImageUrl": "/images/lenses/optisync/arte-06-hd-robo.jpg",
      "officeImageUrl": "/images/lenses/optisync/arte-10-hd-computador.jpg",
      "features": [
        "Surfaçagem Ponto a Ponto",
        "Antirreflexo Multicamadas Hidrorrepelente",
        "Filtro de Luz Azul & UV400",
        "Garantia Técnica 12 Meses"
      ],
      "ctaText": "Ver Catálogo de Lentes HD",
      "ctaLink": "/lentes?linha=hd"
    },
    "photochromicLine": {
      "enabled": true,
      "badge": "TECNOLOGIA FOTOSSENSÍVEL ADULTO",
      "title": "OPTiSYNC HD",
      "titleHighlight": "Fotossensível",
      "subtitle": "Adaptação luminosa ultrarrápida entre ambientes fechados e ar livre",
      "description": "Lentes inteligentes que clareiam com rapidez em ambientes internos e escurecem sob o sol, bloqueando 100% dos raios UVA/UVB com conforto total.",
      "logoUrl": "",
      "halfDarkBannerUrl": "/images/lenses/optisync/arte-07-fotossensivel-banner.jpg",
      "threeStatesGridUrl": "/images/lenses/optisync/arte-04-fotossensivel-estados.jpg",
      "clearStateImageUrl": "/images/lenses/optisync-hd.jpg",
      "darkStateImageUrl": "/images/lenses/optisync-fotossensivel-box.jpg",
      "transitionSpeedText": "Ativação em até 30 segundos sob radiação UV",
      "features": [
        "Transição Fluida Dia & Noite",
        "Proteção UV400 Integral",
        "Conforto para Dirigir e Caminhar",
        "Montagem de Alta Precisão"
      ],
      "ctaText": "Conhecer Linha Fotossensível",
      "ctaLink": "/lentes?linha=fotossensivel"
    },
    "kidsLine": {
      "enabled": true,
      "badge": "LINHA INFANTIL & JUVENIL",
      "title": "OPTiSYNC",
      "titleHighlight": "Kids Adventure",
      "subtitle": "Resistência máxima, conforto anatômico e proteção total para o dia a dia infantil",
      "description": "Produzidas em materiais de alta tenacidade contra impactos acidentais na escola e brincadeiras, com leveza extrema e proteção contra luz azul e radiação solar.",
      "posterBoyUrl": "/images/lenses/optisync/arte-01-kids-poster.jpg",
      "logo3dUrl": "/images/lenses/optisync/arte-03-kids-logo3d.jpg",
      "features": [
        "Material Ultrarresistente a Quedas e Impactos",
        "Leveza e Conforto para Nariz Pequeno",
        "Proteção UV400 e Antirreflexo",
        "Garantia Ventara em Laboratório Próprio"
      ],
      "ctaText": "Ver Armações Infantis",
      "ctaLink": "/armacoes?categoria=infantil"
    },
    "showGallery": true,
    "galleryTitle": "Galeria Tecnológica OPTiSYNC",
    "gallerySubtitle": "Explore cada detalhe e aplicação visual das três linhas de lentes digitais.",
    "galleryItems": [
      {
        "id": "gal-1",
        "title": "Linha Kids Adventure",
        "line": "kids",
        "imageUrl": "/images/lenses/optisync/arte-01-kids-poster.jpg",
        "altText": "Menino sorridente usando óculos da linha OptiSYNC Kids Adventure",
        "aspectRatio": "4:5",
        "caption": "Pôster oficial da linha infantil OptiSYNC Kids Adventure."
      },
      {
        "id": "gal-2",
        "title": "Banner Seis Cores Solares",
        "line": "geral",
        "imageUrl": "/images/lenses/optisync/arte-02-cores-banner.jpg",
        "altText": "Seis lentes coloridas em tons de azul, verde, âmbar e cinza",
        "aspectRatio": "3:2",
        "caption": "Tonalidades solares exclusivas da seção de cores."
      },
      {
        "id": "gal-3",
        "title": "Logo 3D Kids Adventure",
        "line": "kids",
        "imageUrl": "/images/lenses/optisync/arte-03-kids-logo3d.jpg",
        "altText": "Logo tridimensional da linha Kids Adventure com estética aventureira",
        "aspectRatio": "1:1",
        "caption": "Identidade visual 3D Kids Adventure."
      },
      {
        "id": "gal-4",
        "title": "Fotossensível: 3 Estados",
        "line": "photochromic",
        "imageUrl": "/images/lenses/optisync/arte-04-fotossensivel-estados.jpg",
        "altText": "Homem e mulher em três estados de luminosidade: ambiente interno, meia luz e sol pleno",
        "aspectRatio": "3:2",
        "caption": "Comportamento da lente fotossensível em ambientes fechados e abertos."
      },
      {
        "id": "gal-5",
        "title": "Uso Digital Gamer",
        "line": "hd",
        "imageUrl": "/images/lenses/optisync/arte-05-hd-gamer.jpg",
        "altText": "Jovem com fone de ouvido focado em tela com iluminação azul",
        "aspectRatio": "4:5",
        "caption": "Filtro Blue Shield para sessões intensas de games e telas."
      },
      {
        "id": "gal-6",
        "title": "Precisão Robótica de Laboratório",
        "line": "hd",
        "imageUrl": "/images/lenses/optisync/arte-06-hd-robo.jpg",
        "altText": "Braço robótico futurista ao lado da caixa OPTiSYNC HD",
        "aspectRatio": "4:5",
        "caption": "Simbolismo de precisão e cálculo computadorizado milimétrico."
      },
      {
        "id": "gal-7",
        "title": "Fotossensível Meio a Meio",
        "line": "photochromic",
        "imageUrl": "/images/lenses/optisync/arte-07-fotossensivel-banner.jpg",
        "altText": "Óculos com metade da lente límpida e metade escura",
        "aspectRatio": "3:2",
        "caption": "Demonstração visual do poder de escurecimento fotossensível."
      },
      {
        "id": "gal-8",
        "title": "Caixa e Lente OPTiSYNC HD",
        "line": "hd",
        "imageUrl": "/images/lenses/optisync/arte-08-hd-caixa-lente.jpg",
        "altText": "Embalagem oficial azul e lente talhada em destaque",
        "aspectRatio": "4:5",
        "caption": "Apresentação oficial do produto e certificação de origem."
      },
      {
        "id": "gal-9",
        "title": "Retrato Hero HD",
        "line": "hd",
        "imageUrl": "/images/lenses/optisync/arte-09-hd-hero-retrato.jpg",
        "altText": "Homem de perfil usando óculos de alta precisão com iluminação azul",
        "aspectRatio": "4:5",
        "caption": "Conforto estético e elegância em qualquer ângulo."
      },
      {
        "id": "gal-10",
        "title": "Ergonomia Visual no Escritório",
        "line": "hd",
        "imageUrl": "/images/lenses/optisync/arte-10-hd-computador.jpg",
        "altText": "Profissional trabalhando concentrado no computador com óculos OPTiSYNC",
        "aspectRatio": "4:5",
        "caption": "Nitidez contínua para longas jornadas de trabalho no computador."
      }
    ],
    "colorsBannerUrl": "/images/lenses/optisync/arte-02-cores-banner.jpg",
    "colorsBannerAlt": "Seis tonalidades exclusivas de lentes solares e coloridas OPTiSYNC",
    "colorsBannerTitle": "Mostruário Exclusivo de Cores & Tonalidades Solares",
    "colorsBannerSubtitle": "Personalize sua armação com lentes graduadas em tonalidades solares exclusivas, com corte UV400 e antirreflexo interno.",
    "showHero": true,
    "showBenefits": true,
    "showComparison": true,
    "showLabHighlight": true,
    "showModels": true,
    "showSpecs": true,
    "showFaq": true,
    "showColorsCta": true,
    "showWhatsappCta": true,
    "benefitsTitle": "Por que escolher a tecnologia OPTiSYNC HD?",
    "benefitsSubtitle": "Projetada para proporcionar nitidez contínua e conforto óptico com tratamentos certificados.",
    "benefitsList": [
      {
        "id": "benefit-surf",
        "icon": "Cpu",
        "title": "Surfaçagem Ponto a Ponto",
        "description": "Lentes talhadas com precisão micrométrica, reduzindo aberrações ópticas e alargando o corredor de foco."
      },
      {
        "id": "benefit-ar",
        "icon": "Layers",
        "title": "Antirreflexo Multicamadas",
        "description": "Tratamento nanotecnológico com propriedades hidrorrepelentes e oleofóbicas que facilitam a limpeza diária."
      },
      {
        "id": "benefit-blue",
        "icon": "ShieldCheck",
        "title": "Filtro de Luz Azul & UV400",
        "description": "Atenuação equilibrada da luz azul de telas digitais e proteção solar UV integrada na massa da lente."
      },
      {
        "id": "benefit-warranty",
        "icon": "Award",
        "title": "Garantia Técnica 12 Meses",
        "description": "Cobertura total contra defeitos de tratamento ou estrias, com garantia de suporte óptico presencial e online."
      }
    ],
    "comparisonTitle": "Comparação Direta de Tecnologia",
    "comparisonSubtitle": "Entenda os diferenciais construtivos entre processos convencionais e o padrão digital OPTiSYNC.",
    "comparisonRows": [
      {
        "feature": "Processo de Gravação",
        "traditional": "Moldagem padrão por matriz física pré-fabricada",
        "optisync": "Surfaçagem digital 3D ponto a ponto computadorizada"
      },
      {
        "feature": "Campo de Visão Útil",
        "traditional": "Restrito ao centro da lente com dispersões periféricas",
        "optisync": "Amplitude visual estendida de borda a borda"
      },
      {
        "feature": "Tratamento Antirreflexo",
        "traditional": "Camada básica suscetível a marcas e atrito",
        "optisync": "Multicamadas nanotecnológicas com selamento hidrorrepelente"
      },
      {
        "feature": "Filtro de Luz Azul",
        "traditional": "Opcional com reflexo amarelado pronunciado",
        "optisync": "Filtro integrado na massa com transparência equilibrada"
      },
      {
        "feature": "Garantia Técnica",
        "traditional": "30 a 90 dias com restrições operacionais",
        "optisync": "12 meses de garantia de adaptação e suporte direto"
      }
    ],
    "labBadge": "LABORATÓRIO ÓPTICO PRÓPRIO EM ARAÇATUBA",
    "labTitle": "Do cálculo computadorizado à montagem milimétrica",
    "labTitleHighlight": "em nossa sede própria",
    "labDescription": "Com usinagem e lensometria computadorizada na Rua Princesa Isabel, 221 em Araçatuba/SP, suas lentes OPTiSYNC HD são confeccionadas e inspecionadas por profissionais técnicos em óptica, com montagem expressa e rastreabilidade total.",
    "labOrigin": "Araçatuba · SP",
    "techSpecs": [
      {
        "label": "Índice de Refração",
        "value": "1.56 / 1.60 / 1.67 / 1.74",
        "detail": "Opções para graus leves, médios e altos"
      },
      {
        "label": "Tratamento Antirreflexo",
        "value": "Multicamadas Nanotecnológico",
        "detail": "Resistência a riscos e repelência a água e óleo"
      },
      {
        "label": "Proteção Ultravioleta",
        "value": "UV400 Integral",
        "detail": "Bloqueio de raios UVA e UVB"
      },
      {
        "label": "Montagem em Laboratório",
        "value": "Até 1 Hora Útil",
        "detail": "Biseladora computadorizada de alta precisão"
      }
    ],
    "faqsList": [
      {
        "q": "O que é a surfaçagem digital ponto a ponto da OPTiSYNC HD?",
        "a": "É um método computadorizado de lapidação em que a curva óptica é talhada milímetro a milímetro diretamente no bloco da lente, eliminando distorções de borda e garantindo nitidez proporcional ao formato da armação."
      },
      {
        "q": "Como funciona a garantia de 12 meses?",
        "a": "Todas as lentes OPTiSYNC contam com 12 meses de garantia integral de fábrica cobrindo o tratamento antirreflexo e defeitos técnicos de fabricação, além do suporte para adaptação da graduação médica."
      },
      {
        "q": "Posso instalar lentes OPTiSYNC na minha própria armação?",
        "a": "Sim. Nosso laboratório em Araçatuba recebe a sua armação e realiza a medição de centros ópticos e corte computadorizado com ajuste perfeito."
      },
      {
        "q": "Como enviar a receita médica pelo site?",
        "a": "Basta fotografar a prescrição emitida pelo seu oftalmologista e clicar em Enviar Receita no WhatsApp. Nosso técnico óptico analisa os eixos, cilindros e dioptrias para indicar o modelo ideal."
      }
    ],
    "ctaBadge": "SUPORTE ESPECIALIZADO",
    "ctaTitle": "Pronto para enxergar com definição",
    "ctaTitleHighlight": "OPTiSYNC HD?",
    "ctaSubtitle": "Envie sua receita oftálmica diretamente aos nossos ópticos em Araçatuba para uma conferência técnica completa e orçamento sob medida.",
    "ctaButtonText": "Consultar Óptico no WhatsApp",
    "ctaWhatsappMessage": "Olá! Gostaria de consultar um técnico óptico sobre as lentes digitais OPTiSYNC HD da Ventara e enviar minha receita médica.",
    "ctaBusinessHours": "Atendimento de segunda a sexta das 09h às 18h e aos sábados das 09h às 13h."
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE
SET
  description = EXCLUDED.description,
  value = EXCLUDED.value,
  updated_at = NOW();
