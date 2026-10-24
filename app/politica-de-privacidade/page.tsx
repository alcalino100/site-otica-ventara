"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ShieldCheck, ArrowLeft, Mail, MessageSquare, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";
import { useSiteSettings } from "@/components/providers/site-settings-provider";

export default function PrivacyPolicyPage() {
  const { identity } = useSiteSettings();

  const handleDataDeletionWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Gostaria de exercer meus direitos de titular de dados (LGPD Art. 18) e solicitar a consulta/exclusão dos meus dados cadastrais na ${identity.store_name}.`
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
            <ShieldCheck size={18} />
            <span>SEGURANÇA JURÍDICA &amp; PRIVACIDADE DE DADOS</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Política de Privacidade e Proteção de Dados (LGPD)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Última atualização: Outubro de 2026 · Em conformidade com a Lei Geral de Proteção de Dados (Lei Federal nº 13.709/2018)
          </p>
        </div>

        <div className="bg-[#0b1c2e] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8 text-sm text-slate-300 leading-relaxed shadow-xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <Lock size={18} className="text-amber-400" />
              1. Controlador dos Dados Pessoais
            </h2>
            <p>
              A <strong>{identity.store_name}</strong>, pessoa jurídica estabelecida na {identity.address_street}, {identity.address_neighborhood}, {identity.address_city} - {identity.address_state}, CEP {identity.address_postal_code}, inscrita no CNPJ sob o nº <strong>{identity.cnpj || "54.892.147/0001-30"}</strong>, atua como Controladora de Dados Pessoais em conformidade com a Lei Federal nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <Eye size={18} className="text-amber-400" />
              2. Princípio da Coleta Mínima (Art. 6º, III da LGPD)
            </h2>
            <p>
              Coletamos exclusivamente os dados estritamente necessários para a prestação do serviço óptico contratado e para o atendimento ao cliente:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li><strong>Dados Cadastrais de Contato:</strong> Nome completo e telefone/WhatsApp, para identificação do titular, envio de orçamentos e comunicações de entrega ou retirada.</li>
              <li><strong>Endereço de Entrega:</strong> Coletado somente quando o cliente opta por entrega a domicílio em Araçatuba e região ou envio postal.</li>
              <li><strong>Dados de Navegação Anônimos:</strong> Endereço IP anonimizado, dispositivo e páginas visitadas para fins de segurança, prevenção a fraudes e melhoria técnica da experiência do site.</li>
            </ul>
            <p className="text-xs text-amber-300/90 font-medium bg-amber-400/10 p-3 rounded-xl border border-amber-400/20">
              <strong>Importante:</strong> Não realizamos coleta de dados biométricos desnecessários, não solicitamos CPF ou dados bancários para simples navegação e não condicionamos o acesso ao site a consentimentos abusivos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <FileText size={18} className="text-amber-400" />
              3. Tratamento de Dados Sensíveis de Saúde (Receitas Oftalmológicas)
            </h2>
            <p>
              Em conformidade com os <strong>Artigos 5º, II e 11 da LGPD</strong>, os parâmetros ópticos constantes em prescrições médicas (grau esférico, cilíndrico, eixo, adição e medições de Distância Nasopupilar - DNP) constituem <strong>dados sensíveis relativos à saúde</strong>.
            </p>
            <p>
              Tais informações são tratadas sob estrito <strong>sigilo profissional óptico</strong>, exclusivamente para a calibração, confecção, surfaçagem e montagem precisa de suas lentes em nosso laboratório próprio computadorizado, sob supervisão técnica habilitada. Jamais são compartilhadas com terceiros para fins publicitários.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <CheckCircle2 size={18} className="text-amber-400" />
              4. Seus Direitos como Titular de Dados (Art. 18 da LGPD)
            </h2>
            <p>
              Você tem o direito de, a qualquer momento e de forma gratuita, requerer perante a Ótica Ventara:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
              <li>Confirmação da existência de tratamento de dados;</li>
              <li>Acesso aos dados pessoais mantidos pela empresa;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a lei;</li>
              <li>Revogação do consentimento para envio de futuras promoções;</li>
              <li><strong>Exclusão definitiva de seus dados</strong> de nossos registros ativos.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-[#06111f] p-6 rounded-2xl border border-white/10">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-400" />
              Canal Oficial para Solicitação de Exclusão de Dados
            </h3>
            <p className="text-xs text-slate-400">
              Para exercer qualquer direito previsto na LGPD, incluindo a solicitação formal de exclusão de dados ou revogação de contato, acione diretamente nosso Encarregado pelo Tratamento de Dados (DPO):
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleDataDeletionWhatsApp}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <MessageSquare size={16} />
                <span>Solicitar Exclusão via WhatsApp Oficial</span>
              </button>
              <a
                href="mailto:contato@oticasventara.com.br?subject=Solicitacao%20de%20Exclusao%20de%20Dados%20LGPD"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <Mail size={16} />
                <span>Solicitar por E-mail</span>
              </a>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <Lock size={18} className="text-amber-400" />
              5. Segurança, Criptografia e Armazenamento
            </h2>
            <p>
              Todas as comunicações neste ambiente digital utilizam criptografia de ponta a ponta mediante protocolo seguro HTTPS/TLS. Os registros de consentimento e cupons emitidos possuem trilha de auditoria técnica para integridade jurídica.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
              <FileText size={18} className="text-amber-400" />
              6. Foro de Eleição
            </h2>
            <p>
              Para a resolução de quaisquer controvérsias decorrentes da aplicação desta Política de Privacidade, fica eleito o Foro da Comarca de Araçatuba, Estado de São Paulo, renunciando expressamente a qualquer outro por mais privilegiado que seja.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
