"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FileText, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useSiteSettings } from "@/components/providers/site-settings-provider";

export default function TermsOfUsePage() {
  const { identity } = useSiteSettings();

  return (
    <div className="min-h-screen bg-[#06111f] text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider mb-6"
          >
            <ArrowLeft size={14} /> Voltar para o Início
          </Link>

          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-widest uppercase mb-2">
            <FileText size={18} />
            <span>TRANSPARÊNCIA CONTRATUAL &amp; DIREITOS DO CONSUMIDOR</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Termos de Uso, Garantia e Diretrizes Comerciais
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Última atualização: Outubro de 2026 · Em estrita conformidade com a Lei nº 8.078/1990 (Código de Defesa do Consumidor - CDC) e Decreto nº 7.962/2013 (E-commerce)
          </p>
        </div>

        <div className="bg-[#0b1c2e] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8 text-sm text-slate-300 leading-relaxed shadow-xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <Sparkles size={18} className="text-amber-400" />
              1. Identificação da Empresa e Natureza do Site
            </h2>
            <p>
              O presente ambiente digital é mantido e operado pela <strong>{identity.store_name}</strong> (CNPJ <strong>{identity.cnpj || "54.892.147/0001-30"}</strong>), sediada na {identity.address_street}, {identity.address_neighborhood}, {identity.address_city} - {identity.address_state}, CEP {identity.address_postal_code}, com atendimento sob responsabilidade técnica do profissional óptico habilitado Gustavo Cordeiro.
            </p>
            <p>
              Este site atua como vitrine de curadoria autoral, catálogo de especificações técnicas de armações (medidas de lentes, pontes e hastes em milímetros) e canal direto de consultoria e orçamentos via WhatsApp.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <CheckCircle2 size={18} className="text-amber-400" />
              2. Direito de Arrependimento nas Compras à Distância (Art. 49 do CDC)
            </h2>
            <p>
              Nas contratações e compras de armações e óculos solares realizadas fora do estabelecimento comercial físico (pela internet, telefone ou WhatsApp com envio para entrega a domicílio), o consumidor tem o prazo legal de <strong>7 (sete) dias corridos</strong>, a contar do recebimento do produto, para exercer seu direito de arrependimento e solicitar a devolução com restituição integral dos valores pagos.
            </p>
            <p className="text-xs text-amber-300/90 font-medium bg-amber-400/10 p-3 rounded-xl border border-amber-400/20">
              <strong>Condição para devolução de armações:</strong> O produto deve ser devolvido sem indícios de uso, avarias, riscos ou quedas, acompanhado de sua embalagem original, estojo, flanela e nota fiscal de compra.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <ShieldCheck size={18} className="text-amber-400" />
              3. Prazos de Garantia Legal e Contratual
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong>Garantia Legal de 90 dias (Art. 26, II do CDC):</strong> Cobertura contra quaisquer vícios ou defeitos aparentes ou ocultos de fabricação de armações, charneiras, hastes e tratamentos antirreflexo.
              </li>
              <li>
                <strong>Garantia de Adaptação de Lentes Multifocais (Até 90 dias):</strong> Para lentes oftálmicas multifocais digitais OPTiSYNC HD, Varilux e Hoya, oferecemos garantia assistida de adaptação visual com reavaliação de alinhamento e calibração pelo nosso laboratório próprio.
              </li>
              <li>
                <strong>Limitações da Garantia:</strong> A garantia não cobre quebras por impacto, amassamentos provocados por peso acidental, riscos mecânicos resultantes de limpeza com materiais inadequados (roupas, papel) ou exposição a calor extremo.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <Sparkles size={18} className="text-amber-400" />
              4. Benefício Exclusivo: Ajuste e Higienização Ultrassônica Vitalícia
            </h2>
            <p>
              Todos os clientes que adquirem armações ou lentes na Ótica Ventara têm direito a serviços de pós-venda gratuitos por tempo indeterminado em nossa loja física em Araçatuba-SP:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>Ajuste ergonômico de curvatura das hastes e apoio nasal;</li>
              <li>Substituição preventiva de plaquetas de silicone e parafusos de sustentação;</li>
              <li>Higienização profunda em cuba de ultrassom óptico para remoção de resíduos e suor.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <AlertCircle size={18} className="text-amber-400" />
              5. Prescrições Médicas e Responsabilidade Técnica
            </h2>
            <p>
              A Ótica Ventara não realiza consultas médicas ou refrações prescritivas, em estrito cumprimento à legislação sanitária brasileira (Decreto Federal nº 20.931/1932 e Decreto nº 24.492/1934). O cliente deve sempre apresentar receita válida expedida por médico oftalmologista ou profissional prescritor legalmente habilitado.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <FileText size={18} className="text-amber-400" />
              6. Foro de Eleição
            </h2>
            <p>
              As relações de consumo decorrentes da utilização deste site são regidas pelas leis da República Federativa do Brasil, elegendo-se o Foro da Comarca de Araçatuba-SP para dirimir eventuais controvérsias.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
