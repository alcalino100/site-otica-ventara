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
  boxImage?: string;
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
        // Fallback para lista estática
      }
    }
    loadDynamicLenses();
  }, []);

  // Catálogo completo de lentes com fotos reais das caixas (estilo Panda Elite)
  const lensOptions: LensOption[] = [
    // ---------------- VISÃO SIMPLES (MONOFOCAIS) ----------------
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
    },

    // ---------------- MULTIFOCAIS (PROGRESSIVAS DIGITAIS) ----------------
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
    },

    // ---------------- TRATAMENTOS ESPECIAIS ----------------
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
    },
  ];

  // Marcas oficiais parceiras com caixas e logos correspondentes (estilo Panda Elite)
  const brandLogos = [
    {
      name: "OPTiSYNC HD",
      logo: "/logos/optisync.svg",
      boxImage: "/images/lenses/optisync-box.jpg",
      badge: "Ventara Exclusivo",
      desc: "Lentes cortadas e facetadas no laboratório próprio de Araçatuba em até 1 hora, sem margem de terceiros.",
    },
    {
      name: "Perego Laboratório",
      logo: "/logos/perego.svg",
      boxImage: "/images/lenses/newflash-box.jpg",
      badge: "Laboratório Homologado",
      desc: "Laboratório óptico parceiro com usinagem digital de alta precisão e controle de qualidade rigoroso.",
    },
    {
      name: "Lentes Correct",
      logo: "/logos/correct.svg",
      boxImage: "/images/lenses/correct-box.jpg",
      badge: "Visão Simples Nacional",
      desc: "Excelente custo-benefício e montagem ágil para visão simples com antirreflexo essencial.",
    },
    {
      name: "Orgalens Mais",
      logo: "/logos/orgaline.svg",
      boxImage: "/images/lenses/orgaline-box.jpg",
      badge: "Alta Nitidez",
      desc: "Matéria-prima de alta pureza com tratamento hidrorrepelente que facilita a limpeza diária.",
    },
    {
      name: "HOYA / Maxxee",
      logo: "/logos/hoya.svg",
      boxImage: "/images/lenses/hoya-box.jpg",
      badge: "Precisão Global",
      desc: "Referência japonesa mundial em óptica de alta fidelidade e durabilidade contra riscos.",
    },
    {
      name: "Kodak Lens",
      logo: "/logos/kodak.svg",
      boxImage: "/images/lenses/kodak-box.jpg",
      badge: "Visão Simples Acessível",
      desc: "Mais de um século de tradição óptica, cores vivas e amplo campo visual com excelente preço.",
    },
    {
      name: "Varilux (Essilor)",
      logo: "/logos/varilux.svg",
      boxImage: "/images/lenses/optisync-box.jpg",
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

  const getBrandQuoteUrl = (brandName: string) => {
    const text = encodeURIComponent(
      `Olá! Gostaria de consultar as opções e valores das lentes da marca ${brandName} na Óticas Ventara.`
    );
    return `https://wa.me/5518996155748?text=${text}`;
  };

  return (
    <section
      className="py-16 sm:py-24 bg-[#0a121e] text-white border-y border-slate-800 relative overflow-hidden"
      id="lentes"
    >
      {/* Luz ambiente de fundo */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 relative z-10">
        {/* Cabeçalho da Seção com Símbolo de Lentes Ópticas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10 sm:mb-14">
          <div className="lg:col-span-8 max-w-3xl">
            <div className="flex items-center gap-2 text-amber-400 mb-2.5">
              <Sparkles size={16} />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase">
                TECNOLOGIA ÓPTICA &amp; MARCAS HOMOLOGADAS
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight leading-tight">
              Lentes de Alta Precisão <br className="hidden sm:inline" />
              <strong className="font-semibold text-white">para cada necessidade da sua visão.</strong>
            </h2>
            <p className="text-xs sm:text-base text-slate-300 mt-3 leading-relaxed max-w-2xl">
              Organizamos as melhores marcas do mercado óptico internacional e nossa marca própria com valores de referência transparentes, tratamentos de alta performance e montagem no laboratório próprio de Araçatuba.
            </p>
          </div>

          {/* Símbolo Exclusivo de Lentes Ópticas */}
          <div className="lg:col-span-4 flex items-center justify-center lg:justify-end">
            <div className="relative p-5 rounded-3xl bg-[#0f1d30] border border-slate-700/80 shadow-2xl flex flex-col items-center text-center">
              <LensOpticalGraphic size={190} glow={true} />
              <div className="mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 block">
                  Padrão Óptico Ventara
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  Antirreflexo Multicamadas &amp; Alinhamento Dióptrico
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARROSSEL ANIMADO DE LOGOS DE PARCEIROS HOMOLOGADOS */}
        <div className="mb-10 sm:mb-12 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <PartnerLogosRibbon />
        </div>

        {/* ABAS DE CATEGORIAS (Pill Switches) */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-3 mb-8 sm:mb-10 no-scrollbar">
          <button
            type="button"
            onClick={() => handleCategoryChange("visao-simples")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
              activeCategory === "visao-simples"
                ? "bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-400/20 font-bold"
                : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:border-slate-500 hover:text-white"
            }`}
          >
            <Eye size={16} className={activeCategory === "visao-simples" ? "text-slate-950" : "text-amber-400"} />
            <span>Visão Simples (Monofocais)</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("multifocal")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
              activeCategory === "multifocal"
                ? "bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-400/20 font-bold"
                : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:border-slate-500 hover:text-white"
            }`}
          >
            <Layers size={16} className={activeCategory === "multifocal" ? "text-slate-950" : "text-amber-400"} />
            <span>Multifocais (Progressivas)</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("tratamentos")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
              activeCategory === "tratamentos"
                ? "bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-400/20 font-bold"
                : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:border-slate-500 hover:text-white"
            }`}
          >
            <ShieldCheck size={16} className={activeCategory === "tratamentos" ? "text-slate-950" : "text-amber-400"} />
            <span>Filtro Luz Azul &amp; Especiais</span>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange("marcas")}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
              activeCategory === "marcas"
                ? "bg-amber-400 text-slate-950 border-amber-400 shadow-lg shadow-amber-400/20 font-bold"
                : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:border-slate-500 hover:text-white"
            }`}
          >
            <Award size={16} className={activeCategory === "marcas" ? "text-slate-950" : "text-amber-400"} />
            <span>Todas as Marcas Homologadas</span>
          </button>

          <a
            href="#lentes-coloridas"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-400 shadow-lg shadow-amber-400/25 transition-all duration-200 cursor-pointer shrink-0"
          >
            <SunMedium size={16} />
            <span>Lentes Coloridas (8 Cores)</span>
          </a>
        </div>

        {/* CONTEÚDO DOS CARDS ESTILO PANDA ELITE (DESKTOP GRID / MOBILE CAROUSEL 1 NÍVEL) */}
        <div className="relative">
          {/* Barra de Navegação do Carrossel Mobile */}
          <div className="flex md:hidden items-center justify-between pb-3 px-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Deslize para ver os modelos</span>
              <span className="font-mono text-amber-400/80 font-bold text-[11px]">
                ({activeCardIndex + 1}/
                {activeCategory === "marcas" ? brandLogos.length : filteredOptions.length})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Modelo anterior"
                className="w-8 h-8 rounded-full border border-slate-700 bg-slate-900/90 shadow-md flex items-center justify-center text-slate-200 active:scale-90 transition-transform"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Próximo modelo"
                className="w-8 h-8 rounded-full border border-slate-700 bg-slate-900/90 shadow-md flex items-center justify-center text-slate-200 active:scale-90 transition-transform"
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
              className="flex md:grid flex-row flex-nowrap md:flex-none overflow-x-auto md:overflow-visible overflow-y-hidden snap-x snap-mandatory md:snap-none gap-6 md:gap-8 py-2 pb-5 md:pb-0 md:grid-cols-2 lg:grid-cols-3 no-scrollbar -mx-4 px-6 md:mx-0 md:px-0 scroll-px-6 items-stretch"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  className="snap-center shrink-0 w-[78vw] max-w-[305px] md:w-auto md:max-w-none bg-[#0e192a] rounded-3xl border border-slate-800 hover:border-amber-400/50 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between shadow-xl group"
                >
                  <div>
                    {/* CAPSULE ORGÂNICA BRANCA ESTILO PANDA ELITE COM A FOTO REAL DA CAIXA */}
                    <div className="relative w-full aspect-[4/3] rounded-2xl bg-white p-3.5 flex items-center justify-center overflow-hidden shadow-md mb-4 group-hover:scale-[1.01] transition-transform">
                      {/* Logo da Marca no Canto Superior Esquerdo */}
                      <div className="absolute top-2.5 left-2.5 max-h-7 max-w-[110px] flex items-center bg-white/95 px-2 py-0.5 rounded-md shadow-xs z-10">
                        <img
                          src={opt.brandLogo}
                          alt={opt.brandName}
                          className="max-h-5 max-w-full object-contain"
                        />
                      </div>

                      {/* Badge no Canto Superior Direito */}
                      {opt.badge && (
                        <span className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-950/90 text-amber-300 border border-amber-400/40 backdrop-blur-xs z-10">
                          {opt.badge}
                        </span>
                      )}

                      {/* Foto Real da Caixa da Lente */}
                      <img
                        src={opt.boxImage || "/images/lenses/optisync-box.jpg"}
                        alt={`Caixa ${opt.name}`}
                        className="max-h-full max-w-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Informações da Lente */}
                    <div className="mb-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                        {opt.brandName}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                        {opt.name}
                      </h3>
                    </div>

                    {/* Tratamento em Destaque */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 font-medium mb-3 flex items-start gap-2">
                      <Zap size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      <span>{opt.treatment}</span>
                    </div>

                    {/* Descrição */}
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {opt.description}
                    </p>

                    {/* Lista de Recursos / Benefícios */}
                    <ul className="space-y-1.5 mb-6">
                      {opt.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rodapé do Card: Preço & Botão de Orçamento no WhatsApp */}
                  <div className="pt-4 border-t border-slate-800 mt-auto">
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                          Valor de Referência
                        </span>
                        <span className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
                          {opt.startingPrice}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Clock size={12} /> {opt.leadTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mb-4">
                      {opt.installment}
                    </p>

                    <a
                      href={getWhatsAppQuoteUrl(opt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                    >
                      <MessageSquare size={14} className="text-slate-950" />
                      <span>Pedir Orçamento</span>
                      <ArrowRight size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ABA "TODAS AS MARCAS HOMOLOGADAS" COM ESTILO PANDA ELITE */
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              role="region"
              aria-label="Carrossel de marcas homologadas"
              tabIndex={0}
              className="flex md:grid flex-row flex-nowrap md:flex-none overflow-x-auto md:overflow-visible overflow-y-hidden snap-x snap-mandatory md:snap-none gap-6 md:gap-8 py-2 pb-5 md:pb-0 md:grid-cols-2 lg:grid-cols-3 no-scrollbar -mx-4 px-6 md:mx-0 md:px-0 scroll-px-6 items-stretch"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {brandLogos.map((brand, idx) => (
                <div
                  key={idx}
                  className="snap-center shrink-0 w-[78vw] max-w-[305px] md:w-auto md:max-w-none bg-[#0e192a] rounded-3xl border border-slate-800 hover:border-amber-400/50 p-5 sm:p-6 shadow-xl flex flex-col justify-between group transition-all duration-300"
                >
                  <div>
                    {/* CAPSULE ORGÂNICA BRANCA ESTILO PANDA ELITE COM A CAIXA DA MARCA */}
                    <div className="relative w-full aspect-[4/3] rounded-2xl bg-white p-3.5 flex items-center justify-center overflow-hidden shadow-md mb-4 group-hover:scale-[1.01] transition-transform">
                      {/* Logo no Canto Superior Esquerdo */}
                      <div className="absolute top-2.5 left-2.5 max-h-7 max-w-[110px] flex items-center bg-white/95 px-2 py-0.5 rounded-md shadow-xs z-10">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="max-h-5 max-w-full object-contain"
                        />
                      </div>

                      {/* Badge no Canto Superior Direito */}
                      <span className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-950/90 text-amber-300 border border-amber-400/40 backdrop-blur-xs z-10">
                        {brand.badge}
                      </span>

                      {/* Foto Real da Caixa */}
                      <img
                        src={brand.boxImage}
                        alt={`Lentes ${brand.name}`}
                        className="max-h-full max-w-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2">
                      {brand.name}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-6">
                      {brand.desc}
                    </p>
                  </div>

                  <a
                    href={getBrandQuoteUrl(brand.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer mt-auto"
                  >
                    <MessageSquare size={13} className="text-slate-950" />
                    <span>Consultar Opções da {brand.name}</span>
                    <ArrowRight size={13} />
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
                      ? "w-6 bg-amber-400"
                      : "w-1.5 bg-slate-700 hover:bg-slate-500"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* DESTAQUE ESPECIAL DA MARCA PRÓPRIA: OPTISYNC HD COM MONTAGEM EXPRESSA */}
        <div className="mt-12 bg-gradient-to-br from-[#0c182b] via-[#091526] to-[#060e1a] rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-amber-400/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-400/15 blur-3xl rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-4 flex justify-center">
              <div className="p-4 bg-white rounded-2xl border border-amber-400/30 max-w-[280px] w-full shadow-xl flex items-center justify-center">
                <img
                  src="/images/lenses/optisync-box.jpg"
                  alt="Lente Exclusiva OPTiSYNC HD - Óticas Ventara"
                  className="w-full h-auto rounded-lg object-contain"
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
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">✓ Filtro Azul Incluso</span>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">✓ Antirreflexo Multicamadas</span>
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">✓ Garantia de Fábrica</span>
                </div>

                <a
                  href="https://wa.me/5518996155748?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20para%20as%20lentes%20exclusivas%20OPTiSYNC%20HD%20da%20%C3%93ticas%20Ventara."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 shrink-0 cursor-pointer"
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
        <div className="mt-8 text-center bg-[#0d1726] border border-slate-800 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto">
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Já tem a sua receita médica em mãos? Envie uma foto clara pelo WhatsApp e nossa equipe calcula a espessura ideal (índice 1.56, 1.67 ou 1.74) para o seu grau.
          </p>
          <a
            href="https://wa.me/5518996155748?text=Ol%C3%A1!%20Estou%20com%20minha%20receita%20m%C3%A9dica%20aqui%20e%20gostaria%20que%20voc%C3%AAs%20calculassem%20a%20melhor%20lente%20para%20o%20meu%20grau."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-xs font-bold uppercase tracking-wider mt-3"
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