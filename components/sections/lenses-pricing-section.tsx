"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface LensTier {
  id: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tag: string;
  startingPrice: string;
  installment: string;
  leadTime: string;
  description: string;
  benefits: string[];
  recommendedFor: string;
}

export function LensesPricingSection() {
  const [activeTab, setActiveTab] = useState("monofocal");

  const lensTiers: LensTier[] = [
    {
      id: "monofocal",
      name: "Visão Simples / Monofocal",
      shortName: "Visão Simples",
      icon: Eye,
      tag: "MIOPIA · HIPERMETROPIA · ASTIGMATISMO",
      startingPrice: "R$ 99,90",
      installment: "10x de R$ 9,99 sem juros",
      leadTime: "Pronto em até 1 hora",
      description:
        "Foco nítido e preciso para correção de grau de longe ou perto, com resina orgânica leve e tratamentos de alta claridade.",
      benefits: [
        "Antirreflexo digital multicamadas",
        "Proteção 100% contra raios UVA/UVB",
        "Resina ultraleve e resistente a riscos",
        "Calibração precisa da DNP em laboratório",
      ],
      recommendedFor: "Uso diário, leitura, direção e correção clássica de grau.",
    },
    {
      id: "multifocal",
      name: "Multifocais / Progressivas Digitais",
      shortName: "Multifocais",
      icon: Layers,
      tag: "PERTO · INTERMEDIÁRIO · LONGE",
      startingPrice: "R$ 289,00",
      installment: "10x de R$ 28,90 sem juros",
      leadTime: "Calibração e montagem personalizada",
      description:
        "Tecnologia com corredor óptico suave que integra perto, tela de computador e longe sem saltos de imagem nem linhas visíveis.",
      benefits: [
        "Transição contínua sem esforço ocular",
        "Campo de visão panorâmico e adaptável",
        "Garantia de adaptação de 90 dias",
        "Tratamento antirreflexo de alta durabilidade",
      ],
      recommendedFor: "Quem tem vista cansada (presbiopia) e busca conforto total.",
    },
    {
      id: "blue",
      name: "Filtro Luz Azul (BlueProtect)",
      shortName: "Filtro Luz Azul",
      icon: ShieldCheck,
      tag: "CONFORTO DIGITAL EM TELAS",
      startingPrice: "R$ 149,90",
      installment: "10x de R$ 14,99 sem juros",
      leadTime: "Pronto em até 1 hora",
      description:
        "Bloqueio da radiação azul nociva emitida por celulares, monitores e iluminação LED, prevenindo fadiga, olhos secos e dores de cabeça.",
      benefits: [
        "Redução imediata do cansaço visual",
        "Melhoria na qualidade do sono noturno",
        "Antirreflexo especial sem distorção de cores",
        "Disponível com ou sem grau",
      ],
      recommendedFor: "Profissionais de computador, estudantes e uso constante de telas.",
    },
    {
      id: "photo",
      name: "Fotossensíveis (Escurece no Sol)",
      shortName: "Fotossensíveis",
      icon: SunMedium,
      tag: "PRATICIDADE 2 EM 1 (GRAU + SOLAR)",
      startingPrice: "R$ 249,00",
      installment: "10x de R$ 24,90 sem juros",
      leadTime: "Montagem ágil em laboratório",
      description:
        "Lentes inteligentes que clareiam totalmente em ambientes fechados e escurecem na medida exata sob o sol, oferecendo óculos de grau e solar juntos.",
      benefits: [
        "Adaptação rápida à luz ambiente",
        "Proteção solar UV400 automática ao ar livre",
        "Economia de ter 2 óculos em 1 só",
        "Conforto para dirigir e praticar esportes",
      ],
      recommendedFor: "Quem busca praticidade ao ar livre e sensibilidade à claridade.",
    },
  ];

  const currentLens = lensTiers.find((t) => t.id === activeTab) || lensTiers[0];

  const partnerBrands = [
    { name: "OPTiSYNC HD", type: "Marca Própria Exclusiva Ventara", isExclusive: true },
    { name: "Essilor / Crizal", type: "Multinacional Francesa", isExclusive: false },
    { name: "Carl Zeiss", type: "Tecnologia Alemã", isExclusive: false },
    { name: "Hoya Vision", type: "Precisão Japonesa", isExclusive: false },
    { name: "Kodak Lens", type: "Tradição e Nitidez", isExclusive: false },
  ];

  const whatsappMessage = encodeURIComponent(
    `Olá! Vi a tabela de lentes no site da Ótica Ventara e gostaria de um orçamento para "${currentLens.name}" (faixa a partir de ${currentLens.startingPrice}) para a minha receita médica.`
  );
  const whatsappUrl = `https://wa.me/5518996155748?text=${whatsappMessage}`;

  return (
    <section className="py-12 sm:py-20 bg-slate-50/70 border-b border-slate-200/80" id="lentes">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        {/* Cabeçalho da Seção Compacta */}
        <div className="max-w-2xl mb-8 sm:mb-12">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <Sparkles size={14} />
            <span className="text-[11px] font-bold tracking-widest uppercase">
              TABELA & TECNOLOGIA DE LENTES
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-light text-slate-950 tracking-tight leading-tight">
            Valores transparentes e as <strong className="font-semibold text-slate-950">melhores marcas</strong>.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Trabalhamos com os maiores laboratórios do mercado e montagem em até 1 hora no nosso laboratório próprio. Escolha o tipo de lente abaixo para ver valores de referência:
          </p>
        </div>

        {/* Abas Segmentadas Interativas (Horizontal no Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 sm:mb-8 no-scrollbar">
          {lensTiers.map((tier) => {
            const isActive = tier.id === activeTab;
            const Icon = tier.icon;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setActiveTab(tier.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                  isActive
                    ? "bg-[#06111f] text-white border-[#06111f] shadow-md"
                    : "bg-white text-slate-700 border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <Icon
                  size={15}
                  className={isActive ? "text-[#ffd62e]" : "text-amber-600"}
                />
                <span>{tier.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Card de Preço & Benefícios da Lente Ativa (Super Enxuto) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Lado Esquerdo: Nome, Descrição e Benefícios (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                  {currentLens.tag}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Clock size={13} /> {currentLens.leadTime}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {currentLens.name}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {currentLens.description}
              </p>

              {/* Lista de Benefícios em 2 Colunas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {currentLens.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <strong className="text-slate-700">Indicação recomendada:</strong> {currentLens.recommendedFor}
              </p>
            </div>

            {/* Lado Direito: Bloco de Preço & CTA WhatsApp (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-slate-100/70 rounded-2xl p-6 sm:p-8 border border-slate-200/80 flex flex-col justify-between text-center sm:text-left">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Valor de Referência
                </span>
                <div className="flex items-baseline justify-center sm:justify-start gap-2 mt-1">
                  <span className="text-xs text-slate-500 font-medium">A partir de</span>
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-mono tracking-tight">
                    {currentLens.startingPrice}
                  </span>
                </div>
                <span className="text-xs text-slate-600 block mt-1">
                  ou em até <strong className="text-slate-900 font-semibold">{currentLens.installment}</strong> no cartão
                </span>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/70 space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all duration-150 shadow-md hover:shadow-lg cursor-pointer"
                >
                  <MessageSquare size={16} />
                  <span>Pedir Orçamento da Lente</span>
                  <ArrowRight size={14} />
                </a>

                <span className="text-[10px] text-slate-500 block leading-tight text-center">
                  Envie sua receita pelo WhatsApp para cálculo exato da espessura e dioptria.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Destaque Exclusivo: Marca Própria OPTiSYNC HD */}
        <div className="mt-8 bg-gradient-to-r from-[#06111f] via-[#091b30] to-[#0d2238] rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Foto Oficial / Logo OPTISYNC HD */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="relative rounded-2xl overflow-hidden border border-amber-400/40 bg-white/5 p-2 shadow-inner max-w-[280px] w-full">
                <img
                  src="/images/lenses/optisync-hd.jpg"
                  alt="OPTiSYNC HD - Lente Exclusiva Ótica Ventara Filtro Azul e Antirreflexo"
                  className="w-full h-auto rounded-xl object-contain bg-white"
                />
              </div>
            </div>

            {/* Informações de Tecnologia & Vantagens */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                    MARCA PRÓPRIA EXCLUSIVA
                  </span>
                  <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                    <Sparkles size={13} /> Alta Resolução & Menor Custo
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  OPTiSYNC HD · Filtro Azul & Antirreflexo
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
                  Desenvolvida com padrão óptico internacional e cortada diretamente em nossa faceta computadorizada no laboratório próprio de Araçatuba. Lentes com proteção contra luz azul nociva de monitores e celulares, antirreflexo de alta durabilidade e economia direta de fábrica — sem margens de terceiros.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-slate-700/60">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10">
                    Filtro Azul Integrado
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10">
                    Antirreflexo Multicamadas
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10">
                    Montagem em até 1 Hora
                  </span>
                </div>

                <a
                  href="https://wa.me/5518996155748?text=Ol%C3%A1!%20Vi%20as%20lentes%20exclusivas%20OPTiSYNC%20HD%20no%20site%20da%20%C3%93tica%20Ventara%20e%20gostaria%20de%20um%20or%C3%A7amento%20para%20a%20minha%20receita."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 shrink-0"
                >
                  <MessageSquare size={15} />
                  <span>Pedir Orçamento OPTiSYNC</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Marcas Parceiras de Lentes (Badges Nobres) */}
        <div className="mt-8 pt-6 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Award size={16} className="text-amber-600" />
            <span>Marcas homologadas com garantia oficial de laboratório:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {partnerBrands.map((b, idx) => (
              <span
                key={idx}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border shadow-2xs ${
                  b.isExclusive
                    ? "bg-[#06111f] text-amber-400 border-[#06111f]"
                    : "bg-white text-slate-800 border-slate-200/80"
                }`}
                title={b.type}
              >
                {b.isExclusive ? `★ ${b.name} (Exclusiva)` : b.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
