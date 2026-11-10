"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Ruler,
  Smile,
  FileText,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import { Product, ProductFaqItem } from "@/types/ecommerce";

interface ProductAccordionsProps {
  product: Product;
}

export function ProductAccordions({ product }: ProductAccordionsProps) {
  // Apenas um acordeão aberto por vez
  const [openSection, setOpenSection] = useState<string | null>("sizing");

  const toggleSection = (sectionId: string) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  };

  const hasDimensions = Boolean(
    product.dimensions_lens_mm ||
      product.dimensions_bridge_mm ||
      product.dimensions_temple_mm
  );

  const lensMm = product.dimensions_lens_mm || 53;
  const bridgeMm = product.dimensions_bridge_mm || 18;
  const templeMm = product.dimensions_temple_mm || 145;
  const totalWidthMm = lensMm * 2 + bridgeMm;

  const faceShapes = product.face_shape_recommendations || [];

  const defaultFaqs: ProductFaqItem[] = [
    {
      question: "Como sei se esta armação vai ficar boa no meu rosto?",
      answer:
        "Você pode conferir as dimensões anatômicas em milímetros e comparar com seus óculos atuais. Também oferecemos atendimento personalizado no WhatsApp e consultoria presencial na loja no Centro de Araçatuba.",
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
      {/* 1. Medidas Anatômicas (Some se não houver medidas) */}
      {hasDimensions && (
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => toggleSection("sizing")}
            aria-expanded={openSection === "sizing"}
            className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-xs uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <Ruler size={16} className="text-amber-600" />
              Tamanho e Medidas Anatômicas (ABNT)
            </span>
            <ChevronDown
              size={18}
              className={`text-slate-500 transition-transform duration-200 ${
                openSection === "sizing" ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSection === "sizing" && (
            <div className="p-4 sm:p-5 pt-0 space-y-4 text-xs text-slate-600 border-t border-slate-100">
              <p className="leading-relaxed">
                As medidas dos óculos são gravadas na parte interna das hastes no padrão
                internacional de milímetros:
              </p>

              {/* Diagrama Simples da Armação SVG */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col items-center justify-center">
                <svg
                  viewBox="0 0 320 80"
                  className="w-full max-w-[280px] h-auto text-slate-800"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Aro Esquerdo */}
                  <rect x="25" y="15" width="100" height="50" rx="12" />
                  {/* Aro Direito */}
                  <rect x="195" y="15" width="100" height="50" rx="12" />
                  {/* Ponte */}
                  <path d="M125 35 Q160 25 195 35" />
                  {/* Hastes */}
                  <line x1="25" y1="25" x2="5" y2="20" />
                  <line x1="295" y1="25" x2="315" y2="20" />
                </svg>

                <div className="flex items-center justify-between w-full max-w-[280px] text-[10px] font-mono text-slate-500 mt-2">
                  <span className="text-center">Lente: {lensMm}mm</span>
                  <span className="text-center">Ponte: {bridgeMm}mm</span>
                  <span className="text-center">Haste: {templeMm}mm</span>
                </div>
              </div>

              {/* Tabela de Medidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Largura da Lente
                  </span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {lensMm} mm
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Ponte Nasal
                  </span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {bridgeMm} mm
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Comprimento Haste
                  </span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {templeMm} mm
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Largura Total
                  </span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    ~{totalWidthMm} mm
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Indicação de Formato de Rosto (Termos estritamente neutros) */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection("face_shape")}
          aria-expanded={openSection === "face_shape"}
          className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-xs uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <Smile size={16} className="text-amber-600" />
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
          <div className="p-4 sm:p-5 pt-0 space-y-3 text-xs text-slate-600 border-t border-slate-100">
            <p className="leading-relaxed">
              O visagismo óptico analisa a harmonia das linhas do aro com o traçado
              geométrico dos traços faciais:
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
              Dica: armações contrastantes com o traçado facial costumam proporcionar
              excelente equilíbrio visual.
            </p>
          </div>
        )}
      </div>

      {/* 3. Descrição Completa e Ficha Técnica */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection("description")}
          aria-expanded={openSection === "description"}
          className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-xs uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <FileText size={16} className="text-amber-600" />
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
          <div className="p-4 sm:p-5 pt-0 space-y-3 text-xs text-slate-600 border-t border-slate-100 leading-relaxed">
            <p>
              {product.description ||
                "Armação autoral Ótica Ventara com acabamento minucioso, peso balanceado e encaixe ergonômico. Fabricada com materiais nobres para durabilidade prolongada e máxima nitidez visual."}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Material
                </span>
                <span className="font-semibold text-slate-800">
                  {product.frame_material || "Acetato de Alta Densidade"}
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
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection("warranty")}
          aria-expanded={openSection === "warranty"}
          className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-xs uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <ShieldAlert size={16} className="text-amber-600" />
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
          <div className="p-4 sm:p-5 pt-0 space-y-3 text-xs text-slate-600 border-t border-slate-100 leading-relaxed">
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
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => toggleSection("faq")}
          aria-expanded={openSection === "faq"}
          className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-xs uppercase tracking-wider text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2.5">
            <HelpCircle size={16} className="text-amber-600" />
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
          <div className="p-4 sm:p-5 pt-0 space-y-3 text-xs text-slate-600 border-t border-slate-100 divide-y divide-slate-100">
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
