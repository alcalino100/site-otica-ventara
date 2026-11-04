import React from "react";
import { Metadata } from "next";
import Image from "next/image";
import {
  Sparkles,
  ShieldCheck,
  Eye,
  Sun,
  Layers,
  Cpu,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  MessageCircle,
  Clock,
  Award,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Lentes Digitais OPTiSYNC HD | Tecnologia Exclusiva Óticas Ventara",
  description:
    "Conheça as lentes digitais OPTiSYNC HD: surfaçagem ponto a ponto com até 40% mais campo visual, antirreflexo hidrorrepelente e 12 meses de garantia total de adaptação.",
  openGraph: {
    title: "Lentes Digitais OPTiSYNC HD | Tecnologia Exclusiva Ventara",
    description:
      "Nitidez de borda a borda, proteção contra luz azul e antirreflexo premium com montagem em laboratório próprio em Araçatuba.",
    images: [
      {
        url: "/images/lenses/optisync-box.jpg",
        width: 1200,
        height: 630,
        alt: "Lentes Digitais OPTiSYNC HD Óticas Ventara",
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: "/optisync",
  },
};

const COMPARISON_ROWS = [
  {
    feature: "Tecnologia de Gravação",
    traditional: "Moldagem padrão por matriz física pré-fabricada",
    optisync: "Surfaçagem digital 3D ponto a ponto computadorizada",
  },
  {
    feature: "Campo de Visão Nítido",
    traditional: "Restrito ao centro (aberrações e borrões periféricos)",
    optisync: "Até 40% mais amplitude visual sem distorções laterais",
  },
  {
    feature: "Tratamento Antirreflexo",
    traditional: "1 a 2 camadas simples que descascam e engorduram",
    optisync: "8 camadas nanotecnológicas com selamento térmico e hidrorrepelência",
  },
  {
    feature: "Proteção contra Luz Azul",
    traditional: "Opcional com residual amarelado intenso",
    optisync: "Blue Shield com bloqueio UV400 e transparência natural",
  },
  {
    feature: "Garantia de Adaptação",
    traditional: "30 a 90 dias com restrições",
    optisync: "12 meses de garantia oficial com troca garantida",
  },
];

const OPTISYNC_MODELS = [
  {
    id: "visao-simples",
    name: "OPTiSYNC HD Monofocal",
    subtitle: "Miopia, Hipermetropia e Astigmatismo",
    description:
      "Otimizada para distância única. Elimina a sensação de 'aquário' nas bordas das armações e garante foco imediato para leitura ou direção.",
    features: ["Surfaçagem ponto a ponto", "Antirreflexo Premium", "Proteção UV400"],
    image: "/images/lenses/optisync-box.jpg",
  },
  {
    id: "blue-shield",
    name: "OPTiSYNC HD Blue Shield",
    subtitle: "Proteção Digital para Computador e Telas",
    description:
      "Filtra a luz azul nociva emitida por computadores e smartphones. Previne dores de cabeça, queimação nos olhos e melhora a qualidade do sono.",
    features: ["Filtro de Luz Azul sem amarelo excessivo", "Menos fadiga ocular", "Camada oleofóbica anti-marcas"],
    image: "/images/lenses/optisync-hd.jpg",
  },
  {
    id: "fotossensivel",
    name: "OPTiSYNC Fotossensível",
    subtitle: "Escurecimento Rápido com Ativação Solar",
    description:
      "Adapta-se à luminosidade do ambiente em segundos: totalmente transparente em ambientes internos e escura sob o sol com 100% proteção UV.",
    features: ["Ativação por raios UV", "Transição rápida e suave", "Conforto em qualquer luminosidade"],
    image: "/images/lenses/optisync-fotossensivel-box.jpg",
  },
  {
    id: "colorida",
    name: "OPTiSYNC Solar com Grau",
    subtitle: "Grau Personalizado em Lentes de Sol",
    description:
      "Tonalidades solares sofisticadas (Cinza G15, Marrom Amber e Verde Clássico) montadas na sua armação de sol favorita com a sua graduação exata.",
    features: ["Cores sólidas ou degradê", "Proteção UVA/UVB total", "Tratamento antirreflexo na face interna"],
    image: "/images/lenses/optisync-colorida-box.jpg",
  },
];

const FAQS = [
  {
    q: "O que diferencia a lente digital OPTiSYNC HD de uma lente comum?",
    a: "Lentes convencionais utilizam moldes pré-fabricados de curva fixa, o que causa distorções ópticas nas bordas dos óculos. A tecnologia OPTiSYNC HD esculpe a lente ponto a ponto através de laser e software óptico de alta precisão, gerando uma superfície personalizada para o seu grau e para o formato da armação escolhida.",
  },
  {
    q: "Como funciona a garantia de 12 meses da OPTiSYNC?",
    a: "Todas as lentes OPTiSYNC contam com 12 meses de garantia integral de fábrica contra qualquer defeito de fabricação, estrias ou descascamento do antirreflexo, além de garantia de adaptação clínica. Se você não se adaptar ao seu novo grau com a orientação do seu oftalmologista, faremos o ajuste da graduação sem custos.",
  },
  {
    q: "Posso colocar as lentes OPTiSYNC na minha armação atual?",
    a: "Sim! Se você já possui uma armação que adora e deseja apenas trocar o grau ou renovar as lentes para uma tecnologia mais nítida, nosso laboratório em Araçatuba recebe a sua armação e realiza a montagem com precisão computadorizada.",
  },
  {
    q: "Como é feita a medição da DNP (distância pupilar) pela internet?",
    a: "Utilizamos nosso sistema exclusivo de Medição Facial por Foto calibrado por cartão magnético. Você tira uma foto simples com o celular segurando um cartão no peito, e nossos algoritmos medem a distância exata em milímetros entre a sua pupila e o centro geométrico da armação.",
  },
];

export default function OptiSyncPage() {
  const dynamicThemeStyles: React.CSSProperties = {
    ["--ow-bg-page" as any]: "#FAF8F4",
    ["--ow-bg-section-alt" as any]: "#F3F0E9",
    ["--ow-bg-surface" as any]: "#FFFFFF",
    ["--ow-border-sand" as any]: "#E8E3D8",
    ["--ow-text-primary" as any]: "#06111F",
    ["--ow-text-secondary" as any]: "#4A5875",
    ["--ow-yellow" as any]: "#FFD62E",
    ["--ow-amber-text" as any]: "#9A6700",
    ["--ow-yellow-soft" as any]: "#FFF4C7",
    ["--ow-navy-brand" as any]: "#06111F",
    colorScheme: "light",
    backgroundColor: "#FAF8F4",
    color: "#06111F",
  };

  return (
    <div
      data-theme="light"
      style={dynamicThemeStyles}
      className="min-h-screen flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 transition-colors"
    >
      {/* Header Oficial Ventara Preto com Alto Contraste */}
      <Header theme="dark" />

      <main className="flex-1 pt-24">
        {/* HERO SECTION */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden border-b border-[#E8E3D8]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Coluna Texto */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF4C7] border border-[#FFEBA0] text-[#9A6700] text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} className="text-[#9A6700]" />
                  <span>Tecnologia Exclusiva Óticas Ventara</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-[#06111F] tracking-tight leading-[1.15]">
                  Lentes Digitais <br className="hidden sm:inline" />
                  <span className="font-semibold text-[#06111F]">OPTiSYNC HD</span>
                </h1>

                <p className="text-base sm:text-lg text-[#4A5875] leading-relaxed max-w-xl font-normal">
                  Surfaçagem ponto a ponto calculada por computador com <strong>até 40% mais campo visual útil</strong>, 
                  antirreflexo de 8 camadas hidrorrepelente e <strong>12 meses de garantia total</strong> de adaptação.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-[#06111F]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#9A6700]" />
                    <span className="font-semibold">Sem distorção periférica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#9A6700]" />
                    <span className="font-semibold">Filtro UV400 Integrado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#9A6700]" />
                    <span className="font-semibold">12 Meses de Garantia</span>
                  </div>
                </div>
              </div>

              {/* Coluna Imagem */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md bg-white p-6 rounded-3xl border border-[#E8E3D8] shadow-[0_12px_36px_-6px_rgba(6,17,31,0.08)]">
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#FAF8F4] flex items-center justify-center">
                    <Image
                      src="/images/lenses/optisync-box.jpg"
                      alt="Caixa Oficial Lentes Digitais OPTiSYNC HD"
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      priority
                      className="object-contain p-4"
                    />
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#E8E3D8] flex items-center justify-between text-xs">
                    <span className="text-[#4A5875]">Certificado com Autenticidade</span>
                    <span className="font-bold text-[#06111F] flex items-center gap-1">
                      <Award size={14} className="text-[#9A6700]" />
                      Garantia 12 Meses
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 PILARES DA TECNOLOGIA OPTISYNC */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 lg:py-20 bg-[#F3F0E9]/60">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold text-[#9A6700] uppercase tracking-widest">
                ENGENHARIA ÓPTICA AVANÇADA
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[#06111F]">
                Por que a <span className="font-semibold">OPTiSYNC HD</span> transforma a sua visão?
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5875] leading-relaxed">
                Desenvolvida para proporcionar nitidez fotográfica mesmo em graus elevados e armações modernas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8E3D8] shadow-[0_4px_20px_-2px_rgba(6,17,31,0.04)] space-y-3 hover:translate-y-[-2px] transition-transform">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4C7] text-[#9A6700] flex items-center justify-center">
                  <Cpu size={20} />
                </div>
                <h3 className="text-sm font-bold text-[#06111F]">Surfaçagem Ponto a Ponto</h3>
                <p className="text-xs text-[#4A5875] leading-relaxed">
                  Lentes talhadas com precisão micrométrica, eliminando aberrações ópticas e alargando o corredor de foco.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8E3D8] shadow-[0_4px_20px_-2px_rgba(6,17,31,0.04)] space-y-3 hover:translate-y-[-2px] transition-transform">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4C7] text-[#9A6700] flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <h3 className="text-sm font-bold text-[#06111F]">8 Camadas Antirreflexo</h3>
                <p className="text-xs text-[#4A5875] leading-relaxed">
                  Tratamento nanotecnológico com repelência a água, óleo e poeira. A lente fica mais limpa por muito mais tempo.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8E3D8] shadow-[0_4px_20px_-2px_rgba(6,17,31,0.04)] space-y-3 hover:translate-y-[-2px] transition-transform">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4C7] text-[#9A6700] flex items-center justify-center">
                  <Sun size={20} />
                </div>
                <h3 className="text-sm font-bold text-[#06111F]">Proteção UV400 & Luz Azul</h3>
                <p className="text-xs text-[#4A5875] leading-relaxed">
                  Bloqueio eficaz contra os raios ultravioleta nocivos e o cansaço ocular causado por computadores e smartphones.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-6 rounded-2xl border border-[#E8E3D8] shadow-[0_4px_20px_-2px_rgba(6,17,31,0.04)] space-y-3 hover:translate-y-[-2px] transition-transform">
                <div className="w-10 h-10 rounded-xl bg-[#FFF4C7] text-[#9A6700] flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-sm font-bold text-[#06111F]">Garantia Total 12 Meses</h3>
                <p className="text-xs text-[#4A5875] leading-relaxed">
                  Segurança clínica de adaptação e cobertura completa contra defeitos de fábrica ou descascamento do tratamento.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TABELA COMPARATIVA: COMUM VS OPTISYNC HD */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-y border-[#E8E3D8]">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-[#9A6700] uppercase tracking-widest">
                COMPARAÇÃO DIRETA
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[#06111F]">
                Lente Convencional <span className="font-semibold">vs OPTiSYNC HD</span>
              </h2>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[#E8E3D8] bg-white shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#E8E3D8] bg-[#FAF8F4]">
                    <th className="py-4 px-4 sm:px-6 font-semibold text-[#06111F] w-1/3">
                      Característica
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-medium text-slate-500 w-1/3">
                      Lentes Convencionais
                    </th>
                    <th className="py-4 px-4 sm:px-6 font-bold text-[#06111F] bg-[#FFF4C7]/50 w-1/3 border-l border-[#FFEBA0]">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#9A6700]" />
                        <span>OPTiSYNC HD</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E3D8]">
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF8F4]/50 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-semibold text-[#06111F]">
                        {row.feature}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-[#4A5875] leading-relaxed">
                        <div className="flex items-start gap-2">
                          <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                          <span>{row.traditional}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-[#06111F] font-medium bg-[#FFF4C7]/20 border-l border-[#FFEBA0] leading-relaxed">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-[#9A6700] shrink-0 mt-0.5" />
                          <span>{row.optisync}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* BLOCO ESCURO DE DESTAQUE: LABORATÓRIO PRÓPRIO EM ARAÇATUBA */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-[#06111F] text-white p-8 sm:p-12 lg:p-16 border border-white/10 shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Award size={14} />
                  <span>Laboratório Óptico Próprio em Araçatuba</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight leading-snug">
                  Do cálculo digital à montagem milimétrica{" "}
                  <span className="font-semibold text-amber-400">em nossa sede</span>
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Diferente de óticas convencionais que terceirizam a confecção das lentes para terceiros, 
                  as lentes <strong>OPTiSYNC HD</strong> são fabricadas e montadas no laboratório interno 
                  da Óticas Ventara em Araçatuba. Isso garante inspeção rigorosa em lensômetro digital, 
                  prazos expressos e controle absoluto de qualidade.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Facetadoras</span>
                    <span className="text-white font-semibold">Corte Computadorizado</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Inspeção</span>
                    <span className="text-white font-semibold">100% dos Pares Aferidos</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Origem</span>
                    <span className="text-amber-400 font-semibold">Araçatuba &bull; SP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAMÍLIA DE LENTES OPTISYNC */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 lg:py-20 bg-[#F3F0E9]/60 border-t border-[#E8E3D8]">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-[#9A6700] uppercase tracking-widest">
                LINHA COMPLETA
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[#06111F]">
                Modelos <span className="font-semibold">OPTiSYNC</span> para a sua rotina
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {OPTISYNC_MODELS.map((model) => (
                <div
                  key={model.id}
                  className="bg-white rounded-3xl border border-[#E8E3D8] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-[#FAF8F4] shrink-0 overflow-hidden flex items-center justify-center p-2">
                    <Image
                      src={model.image}
                      alt={model.name}
                      fill
                      sizes="160px"
                      className="object-contain p-2"
                    />
                  </div>

                  <div className="space-y-3 flex-1 text-center sm:text-left">
                    <div>
                      <span className="text-[11px] font-semibold text-[#9A6700] uppercase tracking-wide block">
                        {model.subtitle}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-[#06111F]">{model.name}</h3>
                    </div>
                    <p className="text-xs text-[#4A5875] leading-relaxed">{model.description}</p>
                    <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start pt-1">
                      {model.features.map((f, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-[#FAF8F4] border border-[#E8E3D8] text-[11px] text-[#06111F] font-medium"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PERGUNTAS FREQUENTES (FAQ) */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-t border-[#E8E3D8]">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-bold text-[#9A6700] uppercase tracking-widest">
                TIRA-DÚVIDAS
              </span>
              <h2 className="text-2xl sm:text-3xl font-light text-[#06111F]">
                Perguntas Frequentes sobre a <span className="font-semibold">OPTiSYNC</span>
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl border border-[#E8E3D8] shadow-sm space-y-2"
                >
                  <h3 className="text-sm sm:text-base font-bold text-[#06111F] flex items-start gap-2.5">
                    <HelpCircle size={18} className="text-[#9A6700] shrink-0 mt-0.5" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A5875] leading-relaxed pl-7">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA STRICTLY IN FOOTER ONLY */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[#FFFDF9] border-t border-[#E8E3D8]">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="text-xs font-bold text-[#9A6700] uppercase tracking-widest">
              ATENDIMENTO ESPECIALIZADO
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-[#06111F]">
              Pronto para enxergar com a definição <span className="font-semibold">OPTiSYNC HD</span>?
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5875] max-w-xl mx-auto leading-relaxed">
              Envie sua receita oftálmica diretamente aos nossos ópticos em Araçatuba. Nós indicaremos 
              a espessura ideal, tratamentos e faremos seu orçamento sob medida sem compromisso.
            </p>

            <div className="pt-2 flex justify-center">
              <a
                href="https://wa.me/5518997970808?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20as%20lentes%20digitais%20OPTiSYNC%20HD%20da%20Ventara."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#FFD62E] hover:bg-[#ffe05c] text-[#06111F] font-bold text-sm tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <MessageCircle size={18} className="text-[#06111F]" />
                <span>Consultar Óptico no WhatsApp</span>
                <ArrowRight size={16} />
              </a>
            </div>
            <p className="text-[11px] text-[#4A5875]">
              Atendimento de segunda a sexta das 09h às 18h e sábados das 09h às 13h
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
