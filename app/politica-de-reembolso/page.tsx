"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RotateCcw, ArrowLeft, CheckCircle2, AlertCircle, Clock, ShieldCheck, MessageSquare } from "lucide-react";
import { useSiteSettings } from "@/components/providers/site-settings-provider";

export default function RefundPolicyPage() {
  const { identity } = useSiteSettings();

  const handleSupportWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Gostaria de orientações sobre troca, devolução ou reembolso de um pedido realizado na ${identity.store_name}.`
    );
    window.open(`https://wa.me/5518996155748?text=${text}`, "_blank");
  };

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
            <RotateCcw size={18} />
            <span>DIRETRIZES DE PÓS-VENDA &amp; CDC</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Política de Trocas, Devoluções e Reembolso
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Última atualização: Outubro de 2026 · Em estrita conformidade com a Lei nº 8.078/1990 (Código de Defesa do Consumidor - Art. 49)
          </p>
        </div>

        <div className="bg-[#0b1c2e] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8 text-sm text-slate-300 leading-relaxed shadow-xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <Clock size={18} className="text-amber-400" />
              1. Direito de Arrependimento e Devolução (7 Dias)
            </h2>
            <p>
              Nas compras efetuadas fora do estabelecimento físico da <strong>{identity.store_name}</strong> (catálogo online, telefone ou WhatsApp com envio para entrega a domicílio), o consumidor dispõe do prazo improrrogável de <strong>7 (sete) dias corridos</strong>, contados a partir da data de recebimento do pedido, para manifestar a desistência da compra e requerer o reembolso integral, conforme estabelece o Artigo 49 do Código de Defesa do Consumidor.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <CheckCircle2 size={18} className="text-amber-400" />
              2. Condições do Produto para Devolução ou Troca
            </h2>
            <p>Para que a devolução ou troca seja acolhida, o produto deverá:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>Estar em perfeito estado de conservação, sem qualquer sinal de uso, queda, atrito ou ajuste térmico nas hastes;</li>
              <li>Estar acompanhado do estojo rígido original, flanela de microfibra, certificados e manuais de garantia;</li>
              <li>Estar acompanhado da respectiva nota fiscal (DANFE) ou comprovante emitido pela ótica.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <AlertCircle size={18} className="text-amber-400" />
              3. Regras para Lentes Oftálmicas Personalizadas com Grau
            </h2>
            <p>
              As lentes oftálmicas com grau constituem <strong>produtos customizados de natureza estritamente individual</strong>, fabricadas, surfaçadas e facetadas exclusivamente sob medida para a graduação óptica, distância nasopupilar (DNP) e curvatura do rosto do cliente especificados em receita médica.
            </p>
            <p>
              Em caso de desistência antes do corte ou confecção das lentes no laboratório, o reembolso é concedido integralmente. Se o bloco já houver sido usinado e lapidado, a devolução contemplará o valor da armação, aplicando-se para as lentes a <strong>Garantia de Adaptação Clínica (até 90 dias)</strong> com reavaliação ou substituição necessária para perfeito conforto do olhar.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <ShieldCheck size={18} className="text-amber-400" />
              4. Prazos e Meios de Restituição do Valor
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>
                <strong>Pagamento via PIX:</strong> O reembolso é creditado na mesma conta bancária do titular em até <strong>2 (dois) dias úteis</strong> após a conferência técnica da armação recebida na loja.
              </li>
              <li>
                <strong>Cartão de Crédito:</strong> O estorno formal é solicitado de imediato à operadora de cartão de crédito. O crédito efetivo na fatura depende dos prazos e ciclos de faturamento de cada administradora bancária (geralmente entre 1 e 2 faturas subsequentes).
              </li>
              <li>
                <strong>Vale-Crédito na Loja:</strong> Caso o cliente prefira, o valor integral pode ser disponibilizado de forma imediata como crédito sem prazo de validade para escolha de outro modelo em nosso catálogo.
              </li>
            </ul>
          </section>

          <section className="space-y-3 bg-[#06111f] p-6 rounded-2xl border border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-400" />
              Como Solicitar sua Troca ou Devolução
            </h3>
            <p className="text-xs text-slate-400">
              Basta enviar o número do pedido ou foto do comprovante para o nosso WhatsApp oficial ou comparecer à nossa loja física em Araçatuba:
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleSupportWhatsApp}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <MessageSquare size={16} />
                <span>Solicitar Troca via WhatsApp Oficial</span>
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <span>Voltar ao Catálogo</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
