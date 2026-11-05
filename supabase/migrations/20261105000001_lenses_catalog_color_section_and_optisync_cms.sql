-- ============================================================================
-- MIGRATION: 20261105000001_lenses_catalog_color_section_and_optisync_cms.sql
-- PROJETO: Ótica Ventara — Lentes Coloridas Exclusivas na Seção de Cores,
--          Página Tecnológica OPTiSYNC HD e CMS Visual sem Deploy
-- ============================================================================

-- 1. SEED: Configurações Visuais e de Conteúdo da Página OPTiSYNC HD
INSERT INTO public.site_settings (key, description, value)
VALUES (
  'optisync_page_settings',
  'Configurações visuais, efeitos de luz em código/arte própria e blocos de conteúdo da página /optisync',
  '{
    "bgMode": "code",
    "customBgDesktopUrl": "",
    "customBgMobileUrl": "",
    "bgOverlayOpacity": 50,
    "bgFocalPoint": "center",
    "gradientBaseFrom": "#040B2B",
    "gradientBaseTo": "#0A1A6B",
    "beamColorBlue": "#1E4BFF",
    "beamColorPurple": "#7A2CFF",
    "beamsIntensity": 70,
    "glowIntensity": 60,
    "enableAnimation": true,
    "enableFloorReflection": true,
    "heroBadge": "LABORATÓRIO PRÓPRIO VENTARA",
    "heroTitle": "OPTiSYNC HD",
    "heroTitleHighlight": "Precisão Dióptrica Digital",
    "heroDescription": "Lentes digitais de alta fidelidade óptica com antirreflexo multicamadas hidrorrepelente e bloqueio seletivo de radiação UV400. Produzidas sob medida e montadas em facetadora digital no nosso laboratório próprio.",
    "productBoxImage": "/images/lenses/optisync-box.jpg",
    "productAltText": "Caixa e Bloco da Lente Digital OPTiSYNC HD",
    "heroFeatures": [
      "Antirreflexo multicamadas antirrisco",
      "Filtro de luz azul e proteção UV400",
      "Montagem expressa no laboratório próprio"
    ],
    "showHero": true,
    "showBenefits": true,
    "showComparison": true,
    "showLabHighlight": true,
    "showModels": true,
    "showSpecs": true,
    "showFaq": true,
    "showColorsCta": true,
    "showWhatsappCta": true,
    "benefitsTitle": "Engenharia Óptica Avançada",
    "benefitsSubtitle": "Entenda por que as lentes OPTiSYNC HD oferecem nitidez superior, proteção contínua e conforto visual absoluto.",
    "benefitsList": [
      {
        "id": "ben-1",
        "title": "Alinhamento Dióptrico Digital",
        "description": "Cálculo ponto a ponto por software de traçado de raios que reduz aberrações periféricas e distorções laterais."
      },
      {
        "id": "ben-2",
        "title": "Tratamento Antirreflexo Multicamadas",
        "description": "Camadas nanométricas antirrisco, antiestática e hidrorrepelente que mantêm a superfície limpa por muito mais tempo."
      },
      {
        "id": "ben-3",
        "title": "Proteção Integral UV400 & Filtro Azul",
        "description": "Bloqueio de 100% dos raios UVA/UVB e atenuação do espectro de luz azul-violeta nociva de telas digitais."
      },
      {
        "id": "ben-4",
        "title": "Montagem no Laboratório Próprio",
        "description": "Facetagem e montagem realizadas em até 1 hora em laboratório próprio em Araçatuba com tolerância zero de erro."
      }
    ],
    "modelsTitle": "Família de Lentes OPTiSYNC HD",
    "modelsSubtitle": "Soluções ópticas desenvolvidas para cada estilo de vida e graduação visual.",
    "modelsList": [
      {
        "id": "model-1",
        "name": "OPTiSYNC HD Monofocal",
        "category": "Visão Simples",
        "description": "Ideal para miopia, hipermetropia e astigmatismo. Campo de visão nítido de ponta a ponta.",
        "badge": "Mais Escolhida"
      },
      {
        "id": "model-2",
        "name": "OPTiSYNC BlueProtect HD",
        "category": "Proteção Digital",
        "description": "Com filtro seletivo de luz azul para quem trabalha horas em computadores, tablets e celulares.",
        "badge": "Conforto Digital"
      },
      {
        "id": "model-3",
        "name": "OPTiSYNC Progressive Pro",
        "category": "Multifocal Avançada",
        "description": "Corredor progressivo suave para transição imperceptível entre perto, intermediário e longe.",
        "badge": "Visão Natural"
      },
      {
        "id": "model-4",
        "name": "OPTiSYNC Solar Polarized HD",
        "category": "Solar & Colorida",
        "description": "Lentes escuras polarizadas com contraste aprimorado para dias ensolarados e condução segura.",
        "badge": "Solar Premium"
      }
    ],
    "comparisonTitle": "Comparativo Tecnológico",
    "comparisonSubtitle": "Compare as tecnologias OPTiSYNC HD com lentes convencionais do mercado.",
    "comparisonRows": [
      {
        "feature": "Cálculo dióptrico digital ponto a ponto",
        "optisync": "Sim, com compensação dióptrica 3D",
        "standard": "Curva padrão sem compensação"
      },
      {
        "feature": "Tratamento Antirreflexo Multicamadas",
        "optisync": "Incluso em todas as versões",
        "standard": "Opcional ou ausente"
      },
      {
        "feature": "Camada Hidrorrepelente e Oleofóbica",
        "optisync": "Inclusa (fácil limpeza)",
        "standard": "Apenas em lentes de topo de linha"
      },
      {
        "feature": "Prazo de Montagem e Entrega",
        "optisync": "Em até 1 hora no lab próprio",
        "standard": "3 a 7 dias úteis com terceiros"
      },
      {
        "feature": "Garantia de Adaptação e Dioptria",
        "optisync": "Garantia total com suporte em Araçatuba",
        "standard": "Processo burocrático de troca"
      }
    ],
    "labBadge": "ESTRUTURA FÍSICA EM ARAÇATUBA",
    "labTitle": "Montagem de Alta Precisão",
    "labTitleHighlight": "Laboratório Próprio",
    "labDescription": "Diferente de óticas tradicionais que terceirizam a produção, a Ventara possui laboratório próprio com facetadora digital de última geração no centro de Araçatuba/SP.",
    "labOrigin": "Araçatuba · SP",
    "faqsList": [
      {
        "id": "faq-1",
        "question": "Como sei qual versão das lentes OPTiSYNC HD é ideal para a minha receita?",
        "answer": "Nossa equipe óptica analisa os eixos, cilindros e dioptrias da sua receita médica e sugere o índice de refração e o tratamento perfeito para o seu grau e armação escolhida."
      },
      {
        "id": "faq-2",
        "question": "As lentes coloridas da Ventara são feitas com a tecnologia OPTiSYNC?",
        "answer": "Sim! Todas as tonalidades solares do nosso mostruário de cores contam com tecnologia polarizada OPTiSYNC Solar HD e proteção 100% UV400."
      },
      {
        "id": "faq-3",
        "question": "É possível colocar lentes OPTiSYNC em uma armação que eu já possuo?",
        "answer": "Sim, fazemos a facetagem digital para armações trazidas pelo cliente ou adquiridas em nossa ótica física e online."
      }
    ],
    "ctaBadge": "ATENDIMENTO PERSONALIZADO",
    "ctaTitle": "Fale com um Especialista",
    "ctaTitleHighlight": "em Lentes Digitais",
    "ctaSubtitle": "Envie sua receita pelo WhatsApp para orçamento instantâneo e recomendação personalizada.",
    "ctaButtonText": "Conversar com Especialista no WhatsApp",
    "ctaWhatsappMessage": "Olá! Gostaria de consultar um especialista sobre as lentes digitais OPTiSYNC HD e tirar dúvidas sobre minha receita.",
    "ctaBusinessHours": "Segunda a Sexta das 09h às 18h · Sábados das 09h às 14h"
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE
SET description = EXCLUDED.description,
    value = COALESCE(public.site_settings.value, EXCLUDED.value);

-- 2. MIGRAÇÃO DE DADOS: Atualiza registros de lentes em site_settings.lenses_catalog
-- Garante que lentes com category = 'coloridas' tenham showInGeneralCatalog = false
-- e showInColorSection = true sem perder preços, imagens ou IDs existentes.
DO $$
DECLARE
  current_catalog JSONB;
  updated_catalog JSONB;
BEGIN
  SELECT value INTO current_catalog
  FROM public.site_settings
  WHERE key = 'lenses_catalog';

  IF current_catalog IS NOT NULL AND jsonb_typeof(current_catalog) = 'array' THEN
    SELECT jsonb_agg(
      CASE
        WHEN (item->>'category') = 'coloridas' THEN
          item || jsonb_build_object(
            'showInGeneralCatalog', COALESCE((item->>'showInGeneralCatalog')::boolean, false),
            'showInColorSection', COALESCE((item->>'showInColorSection')::boolean, true)
          )
        ELSE
          item || jsonb_build_object(
            'showInGeneralCatalog', COALESCE((item->>'showInGeneralCatalog')::boolean, true),
            'showInColorSection', COALESCE((item->>'showInColorSection')::boolean, false)
          )
      END
    )
    INTO updated_catalog
    FROM jsonb_array_elements(current_catalog) AS item;

    UPDATE public.site_settings
    SET value = updated_catalog,
        updated_at = now()
    WHERE key = 'lenses_catalog';
  END IF;
END $$;
