"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
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
  Phone,
  Glasses,
} from "lucide-react";
import { AdminLensItem, DEFAULT_LENSES } from "@/lib/lenses-data";
import { DEFAULT_HOMOLOGATED_BRANDS, DEFAULT_PARTNER_LOGOS } from "@/lib/site-settings-constants";
import { HomologatedBrand, PartnerLogoItem, LensesSectionSettings } from "@/types/ecommerce";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { PartnerLogosRibbon } from "@/components/sections/partner-logos-ribbon";

type LensCategory = "all" | "visao-simples" | "multifocal" | "tratamentos" | "coloridas" | "marcas";

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
      `Olá! Tenho interesse na lente "${lens.name}" (${lens.brandName}) com ${lens.treatment} que vi no Catálogo de Lentes da Óticas Ventara. Gostaria de enviar minha receita para conferência técnica!`
    );
    return `https://wa.me/${cleanWhatsAppNumber || "5518996155748"}?text=${text}`;
  };

  const getWhatsAppPrescriptionUrl = () => {
    const text = encodeURIComponent(
      "Olá! Gostaria de uma consultoria técnica gratuita com o técnico óptico da Ventara para escolher a melhor lente para a minha receita."
    );
    return `https://wa.me/${cleanWhatsAppNumber || "5518996155748"}?text=${text}`;
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* 1. HERO BANNER DAS LENTES (ESTILO 1.JPEG DE ALTA DEFINIÇÃO) */}
      <section className="relative overflow-hidden bg-[#030914] border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 py-10 sm:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Lado Esquerdo: Textos do Banner Conforme Imagem de Referência */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                <Sparkles size={12} className="text-amber-400" />
                <span>LABORATÓRIO PRÓPRIO &amp; CERTIFICADO</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-[1.1]">
                CATÁLOGO DE <br />
                <strong className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                  LENTES OFTÁLMICAS
                </strong>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Explore marcas, tecnologias e tratamentos de alta precisão para encontrar a lente ideal para sua visão. Montagem expressa em até 1 hora no laboratório próprio de Araçatuba.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={getWhatsAppPrescriptionUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
                >
                  <MessageCircle size={15} />
                  <span>Enviar Receita no WhatsApp</span>
                </a>

                <Link
                  href="/medicao-por-foto"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm border border-slate-700 hover:border-amber-400/50 transition-all"
                >
                  <Eye size={15} className="text-amber-400" />
                  <span>Medição DNP por Foto</span>
                </Link>
              </div>
            </div>

            {/* Lado Direito: Imagem com Efeito de Lentes Brilhantes e Logos */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900 to-[#02070D] group">
                <img
                  src="/images/banners/catalogo-lentes-oftalmicas.jpg"
                  alt="Catálogo de Lentes Oftálmicas Ventara"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02070D]/80 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Fita de Logos Homologadas no Rodapé do Banner */}
        <PartnerLogosRibbon
          logos={lensesSection?.partnerLogos || DEFAULT_PARTNER_LOGOS}
          tag={lensesSection?.ribbonTag || "PARCEIROS TECNOLÓGICOS & LENTES HOMOLOGADAS"}
          subtitle={lensesSection?.ribbonSubtitle || "Garantia de procedência direta com laboratórios certificados e montagem expressa"}
        />
      </section>

      {/* 2. CATÁLOGO COM GRADE 2 COLUNAS NO MOBILE E 4 NO DESKTOP */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 space-y-8">
        {/* Filtros em Abas de Pílulas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === "all"
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-400/20"
                : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white"
            }`}
          >
            <span>Todas as Lentes ({lenses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("visao-simples")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === "visao-simples"
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-400/20"
                : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white"
            }`}
          >
            <Eye size={14} className={activeCategory === "visao-simples" ? "text-slate-950" : "text-amber-400"} />
            <span>Visão Simples (Monofocais)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("multifocal")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === "multifocal"
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-400/20"
                : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white"
            }`}
          >
            <Layers size={14} className={activeCategory === "multifocal" ? "text-slate-950" : "text-amber-400"} />
            <span>Multifocais (Progressivas)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("tratamentos")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === "tratamentos"
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-400/20"
                : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white"
            }`}
          >
            <ShieldCheck size={14} className={activeCategory === "tratamentos" ? "text-slate-950" : "text-amber-400"} />
            <span>Filtro Azul &amp; Fotossensíveis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("coloridas")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === "coloridas"
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-400/20"
                : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white"
            }`}
          >
            <Palette size={14} className={activeCategory === "coloridas" ? "text-slate-950" : "text-amber-400"} />
            <span>Lentes Coloridas (8 Cores)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("marcas")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === "marcas"
                ? "bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-400/20"
                : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white"
            }`}
          >
            <Award size={14} className={activeCategory === "marcas" ? "text-slate-950" : "text-amber-400"} />
            <span>Marcas Homologadas ({homologatedBrands.length})</span>
          </button>
        </div>

        {/* GRADE DE CARDS: RIGOROSAMENTE 2 COLUNAS NO MOBILE E 4 NO DESKTOP CONFORME ÁUDIO 6 */}
        {activeCategory !== "marcas" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredLenses.map((lens) => (
              <article
                key={lens.id}
                className="group bg-[#091526] hover:bg-[#0c1c33] rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-800 hover:border-amber-400/50 shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Cápsula Branca com a Caixa da Lente */}
                  <div className="relative w-full aspect-[4/3] rounded-xl sm:rounded-2xl bg-white p-2 sm:p-3.5 flex items-center justify-center overflow-hidden shadow-md mb-3 group-hover:scale-[1.02] transition-transform">
                    {/* Logo do Fabricante */}
                    <div className="absolute top-2 left-2 max-h-5 sm:max-h-6 max-w-[80px] sm:max-w-[110px] flex items-center bg-white/95 px-1.5 py-0.5 rounded-md shadow-2xs z-10">
                      <img
                        src={lens.brandLogo || "/logos/optisync.svg"}
                        alt={lens.brandName}
                        className="max-h-4 sm:max-h-5 max-w-full object-contain"
                      />
                    </div>

                    {/* Badge */}
                    {lens.badge && (
                      <span className="absolute top-2 right-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950/90 text-amber-300 border border-amber-400/40 z-10 truncate max-w-[100px]">
                        {lens.badge}
                      </span>
                    )}

                    {/* Imagem da Caixa da Lente */}
                    <img
                      src={lens.boxImage || "/images/lenses/optisync-box.jpg"}
                      alt={`Caixa ${lens.name}`}
                      className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Informações da Lente */}
                  <div className="space-y-1 mb-2">
                    <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-wider block truncate">
                      {lens.brandName}
                    </span>
                    <h3 className="text-xs sm:text-base font-bold text-white tracking-tight leading-snug line-clamp-2">
                      {lens.name}
                    </h3>
                  </div>

                  {/* Tratamento em Destaque */}
                  <div className="p-2 sm:p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[10px] sm:text-xs text-slate-200 font-medium mb-3 flex items-start gap-1.5">
                    <Zap size={12} className="text-amber-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{lens.treatment}</span>
                  </div>

                  {/* Preço "A partir de" */}
                  <div className="pt-2 border-t border-slate-800/80 mb-3">
                    <span className="text-[10px] text-slate-400 block">A partir de</span>
                    <div className="text-sm sm:text-xl font-extrabold text-amber-400 font-mono leading-tight">
                      {lens.startingPrice}
                    </div>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 block mt-0.5">
                      {lens.installment}
                    </span>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="space-y-1.5 pt-1">
                  <a
                    href={getWhatsAppLensUrl(lens)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-[10px] sm:text-xs tracking-wide shadow-xs transition-all cursor-pointer"
                  >
                    <MessageCircle size={13} className="shrink-0" />
                    <span>Garantir no WhatsApp</span>
                  </a>

                  <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400">
                    <Clock size={10} className="text-amber-400/80" />
                    <span>{lens.leadTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* ABA DE TODAS AS MARCAS HOMOLOGADAS (CONFORME ÁUDIO 11) */
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {homologatedBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="bg-[#091526] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-800 hover:border-amber-400/50 shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Foto da Embalagem Homologada */}
                    <div className="relative w-full aspect-[4/3] rounded-xl bg-white p-3 flex items-center justify-center overflow-hidden mb-3">
                      <img
                        src={brand.boxImage || "/images/lenses/optisync-box.jpg"}
                        alt={`Caixa ${brand.name}`}
                        className="max-h-full max-w-full object-contain drop-shadow-md hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {brand.badge || "Laboratório Certificado"}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {brand.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-3 mt-1">
                        {brand.desc}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${cleanWhatsAppNumber || "5518996155748"}?text=${encodeURIComponent(
                      `Olá! Gostaria de saber mais sobre as lentes e tratamentos da marca homologada "${brand.name}".`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                  >
                    <MessageCircle size={12} className="text-amber-400" />
                    <span>Consultar Valores</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. CARD DE CONSULTORIA TÉCNICA E ENVIO DE RECEITA */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="relative rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#0b1728] to-sky-500/10 border border-amber-400/30 p-6 sm:p-12 overflow-hidden shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              SUPORTE ESPECIALIZADO EM ÓPTICA
            </span>
            <h3 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
              Tem sua receita em mãos? Deixe a parte técnica conosco.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Fotografe sua prescrição oftálmica e envie diretamente para o nosso técnico óptico no WhatsApp. Analisamos eixo, cilindro, dioptrias e indicamos o melhor índice de refração e tratamento para a sua armação.
            </p>
          </div>

          <a
            href={getWhatsAppPrescriptionUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-amber-400/20 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <MessageCircle size={18} />
            <span>Enviar Foto da Receita</span>
          </a>
        </div>
      </section>
    </div>
  );
}
