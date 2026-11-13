"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Ruler,
  Smile,
  FileText,
  ShieldAlert,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Product, ProductFaqItem } from "@/types/ecommerce";
import { FrameMeasurementsDiagram } from "./frame-measurements-diagram";
import { FrameComparator } from "./frame-comparator";
import { SizingHelpGuide } from "./sizing-help-guide";

interface ProductAccordionsProps {
  product: Product;
  /** Conteúdo editável do template de produto (admin > Template de Detalhes do Produto). */
  guideContent?: Record<string, any>;
}

const GUIDE_DEFAULTS = {
  title: "Não sabe como usar? É simples!",
  subtitle: "Siga os 3 passos abaixo. Leva menos de 1 minuto para saber se a armação serve no seu rosto.",
  step1:
    "Pegue um óculos que você já usa e olhe a parte de dentro de uma das hastes. Lá estão gravados 3 números, como 52 · 18 · 145.",
  step2:
    "Digite esses 3 números nos campos de \"Compare com a sua armação atual\", mais abaixo, na mesma ordem em que aparecem.",
  step3: "Pronto! Mostramos em palavras simples se esta armação vai ficar maior, menor ou igual à sua.",
  videoLabel: "Prefere ver em vídeo? Assista em poucos segundos",
};

function textOr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function ProductAccordions({ product, guideContent }: ProductAccordionsProps) {
  // Apenas um acordeão aberto por vez
  const [openSection, setOpenSection] = useState<string | null>("sizing");

  const toggleSection = (sectionId: string) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  };

  const lensWidthMm = product.dimensions_lens_mm ?? null;
  const bridgeMm = product.dimensions_bridge_mm ?? null;
  const templeMm = product.dimensions_temple_mm ?? null;
  const frameWidthMm = product.dimensions_frame_width_mm ?? null;
  const lensHeightMm = product.dimensions_lens_height_mm ?? null;

  const hasDimensions = Boolean(
    lensWidthMm || bridgeMm || templeMm || frameWidthMm || lensHeightMm
  );

  // Lista de medidas estritamente aferidas (sem estimativas nem chutes com '~')
  const measuredRows: { name: string; valueMm: number; usage: string }[] = [];
  if (frameWidthMm) {
    measuredRows.push({
      name: "Largura Frontal Total",
      valueMm: frameWidthMm,
      usage: "Determina o caimento geral da armação nas têmporas do rosto.",
    });
  }
  if (lensWidthMm) {
    measuredRows.push({
      name: "Largura da Lente (Aro)",
      valueMm: lensWidthMm,
      usage: "Campo de visão e proporção do aro frontal.",
    });
  }
  if (lensHeightMm) {
    measuredRows.push({
      name: "Altura da Lente",
      valueMm: lensHeightMm,
      usage: "Cobertura vertical do olhar; excelente para acomodação de multifocais.",
    });
  }
  if (bridgeMm) {
    measuredRows.push({
      name: "Ponte Nasal",
      valueMm: bridgeMm,
      usage: "Espaço de apoio e sustentação sobre o osso nasal sem marcas.",
    });
  }
  if (templeMm) {
    measuredRows.push({
      name: "Comprimento da Haste",
      valueMm: templeMm,
      usage: "Alcance lateral até a curvatura anatômica atrás da orelha.",
    });
  }

  const faceShapes = product.face_shape_recommendations || [];

  const defaultFaqs: ProductFaqItem[] = [
    {
      question: "Como sei se esta armação vai ficar boa no meu rosto?",
      answer:
        "Você pode conferir as medidas reais aferidas em milímetros na tabela abaixo e comparar diretamente com a armação que você já usa no nosso comparador interativo. Também oferecemos consultoria presencial na loja no Centro de Araçatuba e atendimento pelo WhatsApp.",
    },
    {
      question: "Vocês colocam as lentes de grau nesta armação?",
      answer:
        "Sim! Possuímos laboratório digital próprio em Araçatuba com corte computadorizado em até 1 hora para monofocais e ampla linha de multifocais e lentes OPTiSYNC HD.",
    },
    {
      question: "Qual o prazo de troca e garantia?",
      answer:
        "Oferecemos 30 dias para troca caso você não se adapte e garantia de 1 ano contra defeitos de fabricação em todas as armações originais Ventara.",
    },
  ];

  const faqs =
    product.faq_items && product.faq_items.length > 0
      ? product.faq_items
      : defaultFaqs;

  return (
    <div className="w-full space-y-3 pt-6 border-t border-slate-200">
      {/* 1. Medidas Reais Aferidas (Some se não houver medidas cadastradas) */}
      {hasDimensions && (
        <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("sizing")}
            aria-expanded={openSection === "sizing"}
            className="w-full flex items-center justify-between p-4 sm:p-6 text-left font-bold text-xs uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <Ruler size={17} className="text-amber-600" />
              Medidas Reais Aferidas (em milímetros)
            </span>
            <ChevronDown
              size={18}
              className={`text-slate-500 transition-transform duration-200 ${
                openSection === "sizing" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSection === "sizing" && (
            <div className="p-4 sm:p-6 pt-4 space-y-5 sm:space-y-6 text-[13px] sm:text-sm text-slate-600 border-t border-slate-100">
              <p className="leading-relaxed text-slate-700 text-[13px] sm:text-base">
                Todas as dimensões abaixo representam medições exatas aferidas na armação física em milímetros:
              </p>

              {/* Aviso Condicional de Gravação na Haste (Apenas se verificado no modelo) */}
              {product.has_temple_engraving && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-amber-900 text-xs flex items-center gap-2.5">
                  <Sparkles size={16} className="text-amber-600 shrink-0" />
                  <span>
                    As medidas clássicas deste modelo vêm gravadas na parte interna de uma das hastes para fácil identificação.
                  </span>
                </div>
              )}

              {/* Guia "como usar" em 3 passos + vídeo opcional (editável no admin) */}
              <SizingHelpGuide
                title={textOr(guideContent?.sizingHelpTitle, GUIDE_DEFAULTS.title)}
                subtitle={textOr(guideContent?.sizingHelpSubtitle, GUIDE_DEFAULTS.subtitle)}
                steps={[
                  textOr(guideContent?.sizingStep1, GUIDE_DEFAULTS.step1),
                  textOr(guideContent?.sizingStep2, GUIDE_DEFAULTS.step2),
                  textOr(guideContent?.sizingStep3, GUIDE_DEFAULTS.step3),
                ]}
                videoUrl={typeof guideContent?.sizingVideoUrl === "string" ? guideContent.sizingVideoUrl : ""}
                videoLabel={textOr(guideContent?.sizingVideoLabel, GUIDE_DEFAULTS.videoLabel)}
              />

              {/* Diagrama Autoral SVG Ventara */}
              <FrameMeasurementsDiagram
                frameWidthMm={frameWidthMm}
                lensWidthMm={lensWidthMm}
                lensHeightMm={lensHeightMm}
                bridgeMm={bridgeMm}
                templeMm={templeMm}
              />

              {/* Tabela de Medidas Técnicas (Nome, Milímetros, Para quem serve) */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                <table className="w-full text-left border-collapse text-[13px] sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Medida</th>
                      <th className="py-3 px-4 text-center font-mono">Milímetros</th>
                      <th className="py-3 px-4">Referência de Caimento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {measuredRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{row.name}</td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-amber-700 whitespace-nowrap">
                          {row.valueMm} mm
                        </td>
                        <td className="py-3 px-4 text-slate-600">{row.usage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Comparador Interativo "Compare com a sua armação" */}
              <FrameComparator
                currentModelName={product.name}
                targetLensMm={lensWidthMm}
                targetBridgeMm={bridgeMm}
                targetTempleMm={templeMm}
                targetHeightMm={lensHeightMm}
              />
            </div>
          )}
        </div>
      )}

      {/* 2. Indicação de Geometria Facial */}
      <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("face_shape")}
          aria-expanded={openSection === "face_shape"}
          className="w-full flex items-center justify-between p-4 sm:p-6 text-left font-bold text-xs uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <Smile size={17} className="text-amber-600" />
            Indicação de Geometria Facial
          </span>
          <ChevronDown
            size={18}
            className={`text-slate-500 transition-transform duration-200 ${
              openSection === "face_shape" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSection === "face_shape" && (
          <div className="p-4 sm:p-6 pt-0 space-y-3 text-xs text-slate-600 border-t border-slate-100">
            <p className="leading-relaxed">
              O visagismo óptico analisa a harmonia das linhas do aro com o traçado geométrico dos traços faciais:
            </p>

            <div className="flex flex-wrap gap-2">
              {faceShapes.length > 0 ? (
                faceShapes.map((shape, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-medium"
                  >
                    ✓ {shape}
                  </span>
                ))
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                    Formato Oval
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                    Formato Redondo
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                    Formato Quadrado
                  </span>
                </>
              )}
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Dica: armações contrastantes com o traçado facial costumam proporcionar excelente equilíbrio visual.
            </p>
          </div>
        )}
      </div>

      {/* 3. Descrição Completa e Ficha Técnica */}
      <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("description")}
          aria-expanded={openSection === "description"}
          className="w-full flex items-center justify-between p-4 sm:p-6 text-left font-bold text-xs uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <FileText size={17} className="text-amber-600" />
            Descrição e Detalhes da Armação
          </span>
          <ChevronDown
            size={18}
            className={`text-slate-500 transition-transform duration-200 ${
              openSection === "description" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSection === "description" && (
          <div className="p-4 sm:p-6 pt-0 space-y-3 text-xs text-slate-600 border-t border-slate-100 leading-relaxed">
            <p>
              {product.description ||
                "Armação autoral Ótica Ventara com acabamento minucioso, peso balanceado e encaixe ergonômico. Fabricada com materiais nobres para durabilidade prolongada e máxima nitidez visual."}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Material
                </span>
                <span className="font-semibold text-slate-800">
                  {product.material_origin
                    ? `${product.frame_material || "Acetato"} (${product.material_origin})`
                    : product.frame_material || "Acetato"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Tipo de Aro
                </span>
                <span className="font-semibold text-slate-800">
                  {product.frame_shape || "Aro Fechado"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Garantia e Política de Troca */}
      <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("warranty")}
          aria-expanded={openSection === "warranty"}
          className="w-full flex items-center justify-between p-4 sm:p-6 text-left font-bold text-xs uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <ShieldAlert size={17} className="text-amber-600" />
            Garantia e Troca Sem Burocracia
          </span>
          <ChevronDown
            size={18}
            className={`text-slate-500 transition-transform duration-200 ${
              openSection === "warranty" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSection === "warranty" && (
          <div className="p-4 sm:p-6 pt-0 space-y-3 text-xs text-slate-600 border-t border-slate-100 leading-relaxed">
            <p>
              {product.warranty_text ||
                "Todas as armações Ventara possuem 1 ano de garantia legal e contratual contra qualquer defeito de fabricação na estrutura, soldas e molas de articulação."}
            </p>
            <p>
              {product.exchange_text ||
                "Você tem até 30 dias corridos após o recebimento para solicitar troca de modelo ou cor, garantindo que você use uma armação que realmente ame."}
            </p>
          </div>
        )}
      </div>

      {/* 5. Perguntas Frequentes (FAQ Editável) */}
      <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("faq")}
          aria-expanded={openSection === "faq"}
          className="w-full flex items-center justify-between p-4 sm:p-6 text-left font-bold text-xs uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <HelpCircle size={17} className="text-amber-600" />
            Dúvidas Frequentes sobre Este Modelo
          </span>
          <ChevronDown
            size={18}
            className={`text-slate-500 transition-transform duration-200 ${
              openSection === "faq" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSection === "faq" && (
          <div className="p-4 sm:p-6 pt-0 space-y-3 text-xs text-slate-600 border-t border-slate-100 divide-y divide-slate-100">
            {faqs.map((faq, index) => (
              <div key={index} className="pt-3 first:pt-0">
                <h5 className="font-bold text-slate-900 mb-1">
                  {faq.question}
                </h5>
                <p className="leading-relaxed text-slate-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
