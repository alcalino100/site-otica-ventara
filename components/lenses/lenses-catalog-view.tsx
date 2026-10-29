"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FlaskConical,
  Eye,
  Layers,
  ShieldCheck,
  Palette,
  Award,
  Zap,
  Clock,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { AdminLensItem, DEFAULT_LENSES } from "@/lib/lenses-data";
import { DEFAULT_HOMOLOGATED_BRANDS, DEFAULT_PARTNER_LOGOS } from "@/lib/site-settings-constants";
import { HomologatedBrand, PartnerLogoItem, LensesSectionSettings } from "@/types/ecommerce";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { PartnerLogosRibbon } from "@/components/sections/partner-logos-ribbon";

type LensCategory = "all" | "visao-simples" | "multifocal" | "tratamentos" | "coloridas" | "marcas";

const BANNER_STRIP_PARTNERS = [
  { name: "ORGALENS LENS", logo: "/logos/orgaline.svg" },
  { name: "OPTISYNC HD", logo: "/logos/optisync-dark.svg" },
  { name: "HOYA", logo: "/logos/hoya.svg" },
  { name: "CORRECT VISÃO PRECISA", logo: "/logos/correct-dark.svg" },
  { name: "Kodak", logo: "/logos/kodak.svg" },
  { name: "ANY FLASH", text: "NEW FLASH" },
  { name: "Transitions", logo: "/logos/transitions.svg" },
  { name: "Varilux.", logo: "/logos/varilux.svg" },
];

export function LensesCatalogView() {
  const { cleanWhatsAppNumber } = useSiteSettings();
  const [activeCategory, setActiveCategory] = useState<LensCategory>("all");
  const [lenses, setLenses] = useState<AdminLensItem[]>(DEFAULT_LENSES);
  const [homologatedBrands, setHomologatedBrands] = useState<HomologatedBrand[]>(DEFAULT_HOMOLOGATED_BRANDS);
  const [lensesSection, setLensesSection] = useState<LensesSectionSettings | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [lensesRes, settingsRes] = await Promise.all([
          fetch("/api/admin/lenses"),
          fetch("/api/settings"),
        ]);

        if (lensesRes.ok) {
          const lensesData = await lensesRes.json();
          if (lensesData.lenses && Array.isArray(lensesData.lenses) && lensesData.lenses.length > 0) {
            setLenses(lensesData.lenses.filter((l: AdminLensItem) => l.isActive));
          }
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.homologated_brands && Array.isArray(settingsData.homologated_brands)) {
            setHomologatedBrands(settingsData.homologated_brands);
          }
          if (settingsData.lenses_section) {
            setLensesSection(settingsData.lenses_section);
          }
        }
      } catch (err) {
        console.warn("Utilizando catálogo padrão de lentes:", err);
      }
    }
    loadData();
  }, []);

  const filteredLenses = lenses.filter((l) => {
    if (activeCategory === "all") return true;
    return l.category === activeCategory;
  });

  const getWhatsAppLensUrl = (lens: AdminLensItem) => {
    const text = encodeURIComponent(
      `Olá! Tenho interesse na lente "${lens.name}" (${lens.brandName}) com ${lens.treatment} que vi no Catálogo de Lentes de Grau da Óticas Ventara. Gostaria de enviar minha receita para conferência técnica!`
    );
    return `https://wa.me/${cleanWhatsAppNumber || "5518996155748"}?text=${text}`;
  };

  const getWhatsAppPrescriptionUrl = () => {
    const text = encodeURIComponent(
      "Olá! Gostaria de uma consultoria técnica gratuita com o técnico óptico da Ventara para escolher a melhor lente de grau para a minha receita."
    );
    return `https://wa.me/${cleanWhatsAppNumber || "5518996155748"}?text=${text}`;
  };

  return (
    <div className="space-y-10 sm:space-y-14 pb-20">
      {/* 1. HERO HEADER (ESTILO CLÍNICO-ÓPTICO LIMPO E BRILHANTE CONFORME MOCKUP DO CLIENTE) */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 pt-4 sm:pt-8">
        <div className="space-y-4 max-w-3xl">
          {/* Badge: Laboratório Próprio & Certificado */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <FlaskConical size={14} className="text-slate-700" />
            <span>LABORATÓRIO PRÓPRIO &amp; CERTIFICADO</span>
          </div>

          {/* Título Principal: "CATÁLOGO DE LENTES DE GRAU" (Com destaque âmbar vibrante) */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
            CATÁLOGO DE <br />
            <span className="text-[#f59e0b]">LENTES DE GRAU</span>
          </h1>

          {/* Subtítulo Descritivo */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Explore marcas, tecnologias e tratamentos de alta precisão para encontrar a lente ideal para sua visão. Montagem expressa em até 1 hora no laboratório próprio de Araçatuba.
          </p>

          {/* Botões de Ação Duplos Conforme Mockup */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={getWhatsAppPrescriptionUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle size={16} />
              <span>Enviar Receita no WhatsApp</span>
            </a>

            <Link
              href="/medicao-por-foto"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-semibold text-xs sm:text-sm border border-slate-800 hover:border-slate-950 transition-all active:scale-95 cursor-pointer shadow-2xs"
            >
              <Eye size={16} className="text-slate-900" />
              <span>Medição DNP por Foto</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CARD DO BANNER DESTACADO COM LENTES 3D E FITA DE LOGOS */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="relative rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/60 to-blue-50/20 shadow-xs overflow-hidden p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10 items-center">
            {/* Lado Esquerdo do Banner: Textos */}
            <div className="md:col-span-7 space-y-2 sm:space-y-3">
              <div className="w-10 sm:w-12 h-1 bg-amber-400 rounded-full" />
              <div className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-500 uppercase">
                CATÁLOGO DE
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                LENTES DE GRAU
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
                Explore marcas, tecnologias e tratamentos para encontrar a lente ideal para você.
              </p>
            </div>

            {/* Lado Direito do Banner: Lentes 3D com Reflexo Antirreflexo Azul */}
            <div className="md:col-span-5 flex items-center justify-center md:justify-end">
              <div className="relative">
                <img
                  src="/images/banners/lentes-3d-reflexo.png"
                  alt="Lentes de Grau Óticas Ventara com Antirreflexo"
                  className="max-h-28 sm:max-h-36 w-auto object-contain drop-shadow-md select-none pointer-events-none"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Fita de Parceiros no Rodapé do Banner Card com Linhas Verticais Divisórias */}
          <div className="mt-6 pt-5 border-t border-slate-200/70">
            <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-1">
              {BANNER_STRIP_PARTNERS.map((partner, index) => (
                <React.Fragment key={partner.name}>
                  {index > 0 && <div className="h-5 w-px bg-slate-200 shrink-0" />}
                  <div className="shrink-0 flex items-center justify-center px-1">
                    {partner.logo ? (
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="h-5 sm:h-6 max-w-[100px] object-contain opacity-85 hover:opacity-100 transition-opacity"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-[11px] sm:text-xs font-black tracking-wider text-slate-700 uppercase whitespace-nowrap">
                        {partner.text || partner.name}
                      </span>
                    )}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. FITA DE PARCEIROS TECNOLÓGICOS & LENTES HOMOLOGADAS */}
      <section>
        <PartnerLogosRibbon
          variant="light"
          logos={lensesSection?.partnerLogos || DEFAULT_PARTNER_LOGOS}
          tag={lensesSection?.ribbonTag || "PARCEIROS TECNOLÓGICOS & LENTES HOMOLOGADAS"}
          subtitle={lensesSection?.ribbonSubtitle || "Garantia de procedência direta com laboratórios certificados e montagem expressa"}
        />
      </section>

      {/* 4. CATÁLOGO COM FILTROS DE ABAS EM PÍLULA E GRADE 2 COLUNAS NO MOBILE */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 space-y-8">
        {/* Filtros em Abas de Pílulas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === "all"
                ? "bg-amber-400 text-slate-950 border-amber-400 shadow-sm"
                : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/80"
            }`}
          >
            <span>Todas as Lentes ({lenses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("visao-simples")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === "visao-simples"
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-sm"
                : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/80"
            }`}
          >
            <Eye size={14} className={activeCategory === "visao-simples" ? "text-slate-950" : "text-slate-600"} />
            <span>Visão Simples (Monofocais)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("multifocal")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === "multifocal"
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-sm"
                : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/80"
            }`}
          >
            <Layers size={14} className={activeCategory === "multifocal" ? "text-slate-950" : "text-slate-600"} />
            <span>Multifocais (Progressivas)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("tratamentos")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === "tratamentos"
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-sm"
                : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/80"
            }`}
          >
            <ShieldCheck size={14} className={activeCategory === "tratamentos" ? "text-slate-950" : "text-slate-600"} />
            <span>Filtro Azul &amp; Fotossensíveis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("coloridas")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === "coloridas"
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-sm"
                : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/80"
            }`}
          >
            <Palette size={14} className={activeCategory === "coloridas" ? "text-slate-950" : "text-slate-600"} />
            <span>Lentes Coloridas (8 Cores)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("marcas")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === "marcas"
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-sm"
                : "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/80"
            }`}
          >
            <Award size={14} className={activeCategory === "marcas" ? "text-slate-950" : "text-slate-600"} />
            <span>Marcas Homologadas ({homologatedBrands.length})</span>
          </button>
        </div>

        {/* GRADE DE CARDS: RIGOROSAMENTE 2 COLUNAS NO MOBILE E 4 NO DESKTOP CONFORME MOCKUP */}
        {activeCategory !== "marcas" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredLenses.map((lens) => (
              <article
                key={lens.id}
                className="group bg-white rounded-3xl p-3 sm:p-5 border border-slate-200/90 hover:border-amber-400 hover:shadow-xl shadow-xs transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Cápsula com a Imagem do Produto + Selo Preto Superior */}
                  <div className="relative w-full aspect-[4/3] rounded-2xl bg-[#fafafa] p-2 sm:p-3.5 flex items-center justify-center overflow-hidden mb-3 border border-slate-100 group-hover:scale-[1.01] transition-transform">
                    {/* Badge Preto Superior Direito (AUDAX, TRANSITIONS, etc.) */}
                    {lens.badge && (
                      <span className="absolute top-2 right-2 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-black text-white z-10 truncate max-w-[105px]">
                        {lens.badge}
                      </span>
                    )}

                    {/* Logo do Fabricante Superior Esquerdo */}
                    {lens.brandLogo && (
                      <div className="absolute top-2 left-2 max-h-5 sm:max-h-6 max-w-[70px] sm:max-w-[90px] flex items-center bg-white/95 px-1.5 py-0.5 rounded-md shadow-2xs z-10 border border-slate-100">
                        <img
                          src={lens.brandLogo}
                          alt={lens.brandName}
                          className="max-h-3.5 sm:max-h-4 max-w-full object-contain"
                        />
                      </div>
                    )}

                    {/* Imagem do Produto (Caixa + Lente) */}
                    <img
                      src={lens.boxImage || "/images/lenses/optisync-box.jpg"}
                      alt={`Lente ${lens.name}`}
                      className="max-h-full max-w-full object-contain drop-shadow-xs group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Informações da Lente */}
                  <div className="space-y-1 mb-2">
                    <span className="text-[10px] sm:text-[11px] font-black text-amber-500 uppercase tracking-wider block">
                      LENTE
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-snug line-clamp-2">
                      {lens.name}
                    </h3>
                  </div>

                  {/* Tratamento em Cápsula Cinza Clara com Raio */}
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-100 border border-slate-200/60 text-[10px] sm:text-xs text-slate-700 font-medium mb-3 flex items-start gap-1.5">
                    <Zap size={13} className="text-amber-500 shrink-0 mt-0.5 fill-amber-500" />
                    <span className="line-clamp-2">{lens.treatment}</span>
                  </div>

                  {/* Preço com Destaque Âmbar */}
                  <div className="pt-2.5 border-t border-slate-100 mb-3">
                    <span className="text-[10px] text-slate-400 block font-medium">À partir de</span>
                    <div className="text-base sm:text-2xl font-black text-amber-500 font-mono leading-tight">
                      {lens.startingPrice}
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500 block mt-0.5">
                      {lens.installment}
                    </span>
                  </div>
                </div>

                {/* Botão de Ação Redondo Amarelo e Prazo */}
                <div className="space-y-2 pt-1">
                  <a
                    href={getWhatsAppLensUrl(lens)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-amber-400/20 transition-all cursor-pointer"
                  >
                    <MessageCircle size={15} className="shrink-0" />
                    <span>Garantir no WhatsApp</span>
                  </a>

                  <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-slate-500">
                    <Clock size={12} className="text-amber-500 shrink-0" />
                    <span>{lens.leadTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* ABA DE TODAS AS MARCAS HOMOLOGADAS */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {homologatedBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 hover:border-amber-400 hover:shadow-xl shadow-xs transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full aspect-[4/3] rounded-2xl bg-[#fafafa] p-3 flex items-center justify-center overflow-hidden mb-3 border border-slate-100">
                    <img
                      src={brand.boxImage || "/images/lenses/optisync-box.jpg"}
                      alt={`Marca ${brand.name}`}
                      className="max-h-full max-w-full object-contain drop-shadow-xs hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                      {brand.badge || "Laboratório Certificado"}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                      {brand.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-3 mt-1">
                      {brand.desc}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${cleanWhatsAppNumber || "5518996155748"}?text=${encodeURIComponent(
                    `Olá! Gostaria de consultar valores das lentes de grau da marca homologada "${brand.name}".`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-colors"
                >
                  <MessageCircle size={14} className="text-amber-500" />
                  <span>Consultar Valores</span>
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. CARD DE CONSULTORIA TÉCNICA E ENVIO DE RECEITA */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="relative rounded-3xl bg-gradient-to-r from-amber-50/80 via-white to-sky-50/60 border border-amber-300/80 p-6 sm:p-12 overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-100/70 px-3 py-1 rounded-full border border-amber-200">
              SUPORTE ESPECIALIZADO EM ÓPTICA
            </span>
            <h3 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tem sua receita em mãos? Deixe a parte técnica conosco.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Fotografe sua prescrição oftálmica e envie diretamente para o nosso técnico óptico no WhatsApp. Analisamos eixo, cilindro, dioptrias e indicamos a melhor lente de grau e tratamento para a sua armação.
            </p>
          </div>

          <a
            href={getWhatsAppPrescriptionUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-amber-400/25 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <MessageCircle size={18} />
            <span>Enviar Foto da Receita</span>
          </a>
        </div>
      </section>
    </div>
  );
}
