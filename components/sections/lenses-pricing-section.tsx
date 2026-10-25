"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Eye,
  Layers,
  ShieldCheck,
  SunMedium,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Award,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LensOpticalGraphic } from "../ui/lens-optical-graphic";
import { PartnerLogosRibbon } from "./partner-logos-ribbon";

type LensCategory = "visao-simples" | "multifocal" | "tratamentos" | "marcas";

interface LensOption {
  id: string;
  name: string;
  category: "visao-simples" | "multifocal" | "tratamentos";
  brandName: string;
  brandLogo: string;
  logoBgLight?: boolean;
  treatment: string;
  badge?: string;
  startingPrice: string;
  installment: string;
  leadTime: string;
  description: string;
  features: string[];
}

export function LensesPricingSection() {
  const [activeCategory, setActiveCategory] = useState<LensCategory>("visao-simples");
  const [activeLenses, setActiveLenses] = useState<LensOption[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const el = carouselRef.current;
    const total = activeCategory === "marcas" ? brandLogos.length : filteredOptions.length;
    const itemWidth = el.scrollWidth / (total || 1);
    const index = Math.round(el.scrollLeft / itemWidth);
    setActiveCardIndex(Math.min(Math.max(0, index), total - 1));
  };

  const handleCategoryChange = (cat: LensCategory) => {
    setActiveCategory(cat);
    setActiveCardIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    async function loadDynamicLenses() {
      try {
        const res = await fetch("/api/admin/lenses");
        if (res.ok) {
          const data = await res.json();
          if (data.lenses && Array.isArray(data.lenses) && data.lenses.length > 0) {
            setActiveLenses(data.lenses);
          }
        }
      } catch (err) {
        // Usa lista local estática padrão
      }
    }
    loadDynamicLenses();
  }, []);

  // Catálogo completo de lentes estruturado por tipo e marca homologada
  const lensOptions: LensOption[] = [
    // ---------------- VISÃO SIMPLES (MONOFOCAIS) ----------------
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
    },

    // ---------------- MULTIFOCAIS (PROGRESSIVAS DIGITAIS) ----------------
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
    },

    // ---------------- TRATAMENTOS ESPECIAIS ----------------
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
    },
  ];

  // Marcas oficiais parceiras com logos correspondentes
  const brandLogos = [
    {
      name: "OPTiSYNC HD",
      logo: "/logos/optisync.svg",
      badge: "Ventara Exclusivo",
      desc: "Lentes cortadas e facetadas no laboratório próprio de Araçatuba em até 1 hora, sem margem de terceiros.",
    },
    {
      name: "Perego Laboratório",
      logo: "/logos/perego.svg",
      badge: "Laboratório Homologado",
      desc: "Laboratório óptico parceiro com usinagem digital de alta precisão e controle de qualidade rigoroso.",
    },
    {
      name: "Lentes Correct",
      logo: "/logos/correct.svg",
      badge: "Visão Simples Nacional",
      desc: "Excelente custo-benefício e montagem ágil para visão simples com antirreflexo essencial.",
    },
    {
      name: "Orgalens Mais",
      logo: "/logos/orgaline.svg",
      badge: "Alta Nitidez",
      desc: "Matéria-prima de alta pureza com tratamento hidrorrepelente que facilita a limpeza diária.",
    },
    {
      name: "HOYA / Maxxee",
      logo: "/logos/hoya.svg",
      badge: "Precisão Global",
      desc: "Referência japonesa mundial em óptica de alta fidelidade e durabilidade contra riscos.",
    },
    {
      name: "Kodak Lens",
      logo: "/logos/kodak.svg",
      badge: "Visão Simples Acessível",
      desc: "Mais de um século de tradição óptica, cores vivas e amplo campo visual com excelente preço.",
    },
    {
      name: "Varilux (Essilor)",
      logo: "/logos/varilux.svg",
      badge: "Líder Mundial",
      desc: "A lente multifocal progressiva mais recomendada do planeta com garantia total de adaptação.",
    },
  ];

  const currentList = activeLenses.length > 0 ? activeLenses : lensOptions;
  const filteredOptions =
    activeCategory === "marcas"
      ? []
      : currentList.filter((opt) => opt.category === activeCategory);

  const getWhatsAppQuoteUrl = (opt: LensOption) => {
    const text = encodeURIComponent(
      `Olá! Estive no site da Óticas Ventara e gostaria de um orçamento para a lente "${opt.name}" (${opt.brandName}) com ${opt.treatment} (faixa ${opt.startingPrice}) para a minha receita médica.`
    );
    return `https://wa.me/5518996155748?text=${text}`;
  };

  return (
    <section className="py-16 sm:py-24 bg-[#f8fafc] border-b border-slate-200/90 relative overflow-hidden" id="lentes">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        {/* Cabeçalho da Seção com Símbolo de Lentes Ópticas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12 sm:mb-16">
          <div className="lg:col-span-8 max-w-3xl">
            <div className="flex items-center gap-2 text-amber-600 mb-2.5">
              <Sparkles size={16} />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase">
                TECNOLOGIA ÓPTICA &amp; MARCAS HOMOLOGADAS
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-light text-slate-950 tracking-tight leading-tight">
              Lentes de Alta Precisão <br className="hidden sm:inline" />
              <strong className="font-semibold text-slate-950">para cada necessidade da sua visão.</strong>
            </h2>
            <p className="text-xs sm:text-base text-slate-600 mt-3 leading-relaxed max-w-2xl">
              Organizamos as melhores marcas do mercado óptico internacional e nossa marca própria com valores de referência transparentes, tratamentos de alta performance e montagem no laboratório próprio de Araçatuba.
            </p>
          </div>

          {/* Símbolo Exclusivo de Lentes Ópticas (Discos Cristalinos Bevelados com Reflexo AR) */}
          <div className="lg:col-span-4 flex items-center justify-center lg:justify-end">
            <div className="relative p-5 rounded-3xl bg-white border border-slate-200/90 shadow-lg flex flex-col items-center text-center">
              <LensOpticalGraphic size={200} glow={true} />
              <div className="mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Padrão Óptico Ventara
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  Antirreflexo Multicamadas &amp; Alinhamento Dióptrico
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARROSSEL ANIMADO DE LOGOS DE PARCEIROS HOMOLOGADOS (SPELL-UI LOGOS CAROUSEL) */}
        <div className="mb-10 sm:mb-12 rounded-3xl overflow-hidden shadow-lg border border-slate-200/80">
          <PartnerLogosRibbon />
        </div>

        {/* ABAS DE CATEGORIAS: VISÃO SIMPLES, MULTIFOCAL, TRATAMENTOS, TODAS AS MARCAS */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 mb-8 sm:mb-12 no-scrollbar">
          <button
            type="button"
            onClick={() => handleCategoryChange("visao-simples")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
              activeCategory === "visao-simples"
                ? "bg-[#06111f] text-white border-[#06111f] shadow-md"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs"
            }`}
          >
            <Eye size={16} className={activeCategory === "visao-simples" ? "text-amber-400" : "text-amber-600"} />
            <span>Visão Simples (Monofocais)</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("multifocal")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
              activeCategory === "multifocal"
                ? "bg-[#06111f] text-white border-[#06111f] shadow-md"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs"
            }`}
          >
            <Layers size={16} className={activeCategory === "multifocal" ? "text-amber-400" : "text-amber-600"} />
            <span>Multifocais (Progressivas)</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("tratamentos")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
              activeCategory === "tratamentos"
                ? "bg-[#06111f] text-white border-[#06111f] shadow-md"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs"
            }`}
          >
            <ShieldCheck size={16} className={activeCategory === "tratamentos" ? "text-amber-400" : "text-amber-600"} />
            <span>Filtro Luz Azul &amp; Especiais</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("marcas")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
              activeCategory === "marcas"
                ? "bg-[#06111f] text-white border-[#06111f] shadow-md"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs"
            }`}
          >
            <Award size={16} className={activeCategory === "marcas" ? "text-amber-400" : "text-amber-600"} />
            <span>Todas as Marcas Homologadas</span>
          </button>

          <a
            href="#lentes-coloridas"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-400 shadow-md shadow-amber-400/20 transition-all duration-200 cursor-pointer shrink-0"
          >
            <SunMedium size={16} />
            <span>Lentes Coloridas (8 Cores)</span>
          </a>
        </div>

        {/* CONTEÚDO DAS CATEGORIAS (GRADE DE CARDS NO DESKTOP / CARROSSEL HORIZONTAL DE 1 NÍVEL NO MOBILE) */}
        <div className="relative">
          {/* Barra de Navegação do Carrossel Mobile - ACIMA dos Cards */}
          <div className="flex md:hidden items-center justify-between pb-3 px-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Deslize para ver os modelos</span>
              <span className="font-mono text-slate-400 font-semibold text-[11px]">
                ({activeCategory === "marcas" ? brandLogos.length : filteredOptions.length})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Modelo anterior"
                className="w-8 h-8 rounded-full border border-slate-300 bg-white shadow-xs flex items-center justify-center text-slate-700 active:scale-90 transition-transform"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Próximo modelo"
                className="w-8 h-8 rounded-full border border-slate-300 bg-white shadow-xs flex items-center justify-center text-slate-700 active:scale-90 transition-transform"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {activeCategory !== "marcas" ? (
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              role="region"
              aria-label="Carrossel de lentes de alta precisão"
              tabIndex={0}
              className="flex md:grid flex-row flex-nowrap md:flex-none overflow-x-auto md:overflow-visible overflow-y-hidden snap-x snap-mandatory md:snap-none gap-5 sm:gap-6 md:gap-8 py-2 pb-4 md:pb-0 md:grid-cols-2 lg:grid-cols-3 no-scrollbar -mx-4 px-6 md:mx-0 md:px-0 scroll-px-6 items-stretch"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="snap-center shrink-0 w-[82vw] max-w-[310px] md:w-auto md:max-w-none bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-400/50 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between"
                >
                  <div>
                    {/* Cabeçalho do Card: Logo da Marca + Badge */}
                    <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
                      <div className="h-10 max-w-[130px] flex items-center">
                        <img
                          src={opt.brandLogo}
                          alt={`Logo ${opt.brandName}`}
                          className={`max-h-9 max-w-full object-contain rounded-md ${
                            opt.logoBgLight ? "bg-white p-1" : ""
                          }`}
                        />
                      </div>
                      {opt.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/70 shrink-0">
                          {opt.badge}
                        </span>
                      )}
                    </div>

                    {/* Nome da Lente & Marca */}
                    <div className="mb-2">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                        {opt.brandName}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                        {opt.name}
                      </h3>
                    </div>

                    {/* Tratamento em Destaque */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 font-medium mb-4 flex items-start gap-2">
                      <Zap size={15} className="text-amber-500 shrink-0 mt-0.5" />
                      <span>{opt.treatment}</span>
                    </div>

                    {/* Descrição */}
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {opt.description}
                    </p>

                    {/* Lista de Recursos / Benefícios */}
                    <ul className="space-y-2 mb-6">
                      {opt.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rodapé do Card: Preço & Botão de Orçamento no WhatsApp */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                          Valor de Referência
                        </span>
                        <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                          {opt.startingPrice}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Clock size={12} /> {opt.leadTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mb-4">
                      {opt.installment}
                    </p>

                    <a
                      href={getWhatsAppQuoteUrl(opt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#06111f] hover:bg-[#0756b8] active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                    >
                      <MessageSquare size={14} className="text-amber-400" />
                      <span>Pedir Orçamento</span>
                      <ArrowRight size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ABA "TODAS AS MARCAS HOMOLOGADAS" */
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              role="region"
              aria-label="Carrossel de marcas homologadas"
              tabIndex={0}
              className="flex md:grid flex-row flex-nowrap md:flex-none overflow-x-auto md:overflow-visible overflow-y-hidden snap-x snap-mandatory md:snap-none gap-5 sm:gap-6 md:gap-8 py-2 pb-4 md:pb-0 md:grid-cols-2 lg:grid-cols-3 no-scrollbar -mx-4 px-6 md:mx-0 md:px-0 scroll-px-6 items-stretch"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {brandLogos.map((brand, idx) => (
                <div
                  key={idx}
                  className="snap-center shrink-0 w-[82vw] max-w-[310px] md:w-auto md:max-w-none bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="h-14 flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-h-12 max-w-[150px] object-contain rounded-md"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {brand.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {brand.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6">
                      {brand.desc}
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/5518996155748?text=Ol%C3%A1!%20Gostaria%20de%20consultar%20as%20op%C3%A7%C3%B5es%20de%20lentes%20da%20marca%20${encodeURIComponent(brand.name)}%20na%20%C3%93tica%20Ventara.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold tracking-wide transition-colors"
                  >
                    <MessageSquare size={13} className="text-amber-600" />
                    <span>Consultar Opções da {brand.name}</span>
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Indicadores de Paginação do Carrossel de Lentes no Mobile */}
          {(activeCategory === "marcas" ? brandLogos.length : filteredOptions.length) > 1 && (
            <div className="flex md:hidden items-center justify-center gap-1.5 pt-4">
              {(activeCategory === "marcas" ? brandLogos : filteredOptions).map((item, idx) => (
                <button
                  key={'id' in item ? item.id : idx}
                  type="button"
                  onClick={() => {
                    if (carouselRef.current) {
                      const targetCard = carouselRef.current.children[idx] as HTMLElement;
                      if (targetCard) {
                        targetCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                      }
                    }
                  }}
                  aria-label={`Ver modelo ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeCardIndex === idx
                      ? "w-6 bg-amber-500"
                      : "w-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* DESTAQUE ESPECIAL DA MARCA PRÓPRIA: OPTISYNC HD COM MONTAGEM EXPRESSA */}
        <div className="mt-12 bg-gradient-to-br from-[#06111f] via-[#091e36] to-[#040e1a] rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-4 flex justify-center">
              <div className="p-3 bg-white/5 rounded-2xl border border-amber-400/30 max-w-[260px] w-full shadow-inner">
                <img
                  src="/images/lenses/optisync-hd.jpg"
                  alt="Lente Exclusiva OPTiSYNC HD - Óticas Ventara"
                  className="w-full h-auto rounded-xl bg-white object-contain"
                />
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400 text-slate-950">
                  VENTARA EXCLUSIVO
                </span>
                <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                  <Clock size={13} /> Montagem Expressa em até 1 Hora
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                OPTiSYNC HD · Filtro Azul &amp; Antirreflexo
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Cortadas e facetadas com precisão nanométrica em nossa biseladora computadorizada na Rua Princesa Isabel, 221. Proteção contra luz azul, antirreflexo de altíssima claridade e o melhor custo de fábrica, sem comissões ou repasses a intermediários.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-white/10">
                <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">✓ Filtro Azul Incluso</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">✓ Antirreflexo Multicamadas</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">✓ Garantia de Fábrica</span>
                </div>

                <a
                  href="https://wa.me/5518996155748?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20para%20as%20lentes%20exclusivas%20OPTiSYNC%20HD%20da%20%C3%93ticas%20Ventara."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 shrink-0"
                >
                  <MessageSquare size={15} />
                  <span>Pedir Orçamento OPTiSYNC</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CALL TO ACTION PARA ENVIO DE RECEITA MÉDICA */}
        <div className="mt-8 text-center bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            Já tem a sua receita médica em mãos? Envie uma foto clara pelo WhatsApp e nossa equipe calcula a espessura ideal (índice 1.56, 1.67 ou 1.74) para o seu grau.
          </p>
          <a
            href="https://wa.me/5518996155748?text=Ol%C3%A1!%20Estou%20com%20minha%20receita%20m%C3%A9dica%20aqui%20e%20gostaria%20que%20voc%C3%AAs%20calculassem%20a%20melhor%20lente%20para%20o%20meu%20grau."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 text-xs font-bold uppercase tracking-wider mt-3"
          >
            <MessageSquare size={14} />
            <span>Enviar Foto da Receita Agora</span>
            <ArrowRight size={13} />
          </a>
        </div>
      </div>
    </section>
  );
}
