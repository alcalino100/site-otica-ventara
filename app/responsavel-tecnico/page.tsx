import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  ShieldCheck,
  Award,
  Cpu,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Eye,
  Microscope,
  Sparkles,
  MapPin,
  Phone,
  FileText,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";

export const metadata: Metadata = {
  title: "Responsável Técnico | Gustavo Guimarães Cordeiro | Óticas Ventara",
  description:
    "Conheça Gustavo Guimarães Cordeiro, Técnico Óptico formado e responsável técnico da Óticas Ventara Eyewear em Araçatuba-SP. Precisão dioptrica, tecnologia digital e laboratório próprio.",
  openGraph: {
    title: "Responsável Técnico | Gustavo Guimarães Cordeiro | Óticas Ventara",
    description:
      "A segurança de comprar seus óculos com supervisão de um Técnico Óptico formado e laboratório próprio com facetadora digital.",
    images: ["/images/team/gustavo-tecnico-optico.jpg"],
  },
};

export default function ResponsavelTecnicoPage() {
  const whatsappUrl =
    "https://wa.me/5518996155748?text=Ol%C3%A1%2C%20Gustavo!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida%20t%C3%A9cnica%20sobre%20minha%20receita%20de%20%C3%B3culos.";

  return (
    <div className="min-h-screen bg-[#02070d] text-slate-100 selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Top Bar / Header Compacto */}
      <header className="sticky top-0 z-50 bg-[#040d1a]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1300px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Voltar para a página inicial">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/"
              className="text-slate-300 hover:text-white transition-colors hidden sm:inline-block"
            >
              ← Voltar para a Loja
            </Link>
            <Link
              href="/rastreio"
              className="text-slate-300 hover:text-amber-300 transition-colors hidden sm:inline-block"
            >
              Rastrear Pedido
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-all"
            >
              <MessageCircle size={14} className="text-emerald-400" />
              <span>Falar com o Técnico</span>
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION: FOTO REAL & IDENTIDADE DO TÉCNICO */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-white/10">
          {/* Luz de fundo ambiental */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-[1300px] mx-auto px-4 sm:px-8 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono uppercase tracking-wider mb-8">
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Início
              </Link>
              <span>/</span>
              <span className="text-amber-400">Responsável Técnico</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Foto do Técnico Óptico */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-b from-[#091b30] to-[#040d1a] shadow-2xl group">
                  <div className="aspect-[3/4] sm:aspect-[4/5] relative overflow-hidden">
                    <img
                      src="/images/team/gustavo-tecnico-optico.jpg"
                      alt="Gustavo Guimarães Cordeiro - Técnico Óptico Formado e Responsável Técnico da Óticas Ventara"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  {/* Selos flutuantes na foto */}
                  <div className="absolute top-4 left-4 bg-[#06111f]/90 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                    <Award size={14} className="text-amber-400" />
                    <span>Técnico Óptico Formado</span>
                  </div>

                  <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-[#040d1a]/95 backdrop-blur-md border border-white/10 text-xs">
                    <p className="font-semibold text-white">Óticas Ventara Eyewear</p>
                    <p className="text-[11px] text-slate-400">Araçatuba-SP · Laboratório Próprio com Facetadora</p>
                  </div>
                </div>
              </div>

              {/* Informações & Credenciais */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
                    <ShieldCheck size={14} className="text-amber-400" />
                    <span>Responsabilidade Técnica &amp; Saúde Visual</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-light text-white tracking-tight leading-tight">
                    Gustavo Guimarães <span className="font-normal text-amber-400">Cordeiro</span>
                  </h1>
                  <p className="text-base sm:text-lg text-slate-300 font-medium mt-2">
                    Técnico Óptico Formado e Responsável Técnico da Óticas Ventara
                  </p>
                </div>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Diferente de marketplaces genéricos e óticas que terceirizam a produção, a Óticas Ventara opera sob rigorosa supervisão técnica. Cada grau prescrito pelo seu médico oftalmologista é avaliado, conferido e montado com tecnologia digital e precisão milimétrica.
                </p>

                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  "Na óptica, um milímetro de desvio na altura ou no eixo do astigmatismo é a diferença entre um conforto visual perfeito e uma lente que causa dores de cabeça. Minha missão é garantir que você enxergue o mundo com nitidez absoluta."
                </p>

                {/* Métricas e Pilares */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-2">
                      <Award size={18} />
                    </div>
                    <p className="text-xs font-bold text-white">Formação Especializada</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Técnico Óptico capacitado</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="w-8 h-8 rounded-xl bg-blue-400/10 text-blue-400 flex items-center justify-center mb-2">
                      <Cpu size={18} />
                    </div>
                    <p className="text-xs font-bold text-white">Facetadora Digital</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Corte computadorizado</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 col-span-2 sm:col-span-1">
                    <div className="w-8 h-8 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center mb-2">
                      <CheckCircle2 size={18} />
                    </div>
                    <p className="text-xs font-bold text-white">Garantia de Adaptação</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Conferência com lensômetro</p>
                  </div>
                </div>

                {/* CTA de Contato */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                  >
                    <MessageCircle size={16} />
                    <span>Falar com o Gustavo no WhatsApp</span>
                  </a>

                  <Link
                    href="/medicao-por-foto"
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all"
                  >
                    <span>Como Medimos sua DNP</span>
                    <ArrowRight size={13} className="text-amber-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PILARES DA RESPONSABILIDADE TÉCNICA */}
        <section className="py-16 sm:py-20 bg-[#040d1a] border-b border-white/10">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                RIGOR &amp; CIÊNCIA
              </span>
              <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight mt-1">
                Por que a supervisão de um Técnico Óptico protege sua visão?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mb-4">
                    <FileText size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    Leitura Fiel da Receita Oftalmológica
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A interpretação correta de graus cilíndricos, eixos, adições para perto e dioptrias esféricas. O técnico óptico confere cada parâmetro antes de solicitar o bloco da lente.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-white/5 text-[11px] text-amber-300 font-medium">
                  ✓ Sem erros de conversão ou digitação
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-cyan-400/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center mb-4">
                    <Eye size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    Centralização Óptica &amp; DNP Milimétrica
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    O centro óptico da lente precisa ficar exatamente em frente ao centro da sua pupila. Essa precisão evita o efeito de prisma indesejado, tontura e desconforto visual.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-white/5 text-[11px] text-cyan-300 font-medium">
                  ✓ Medição digital com calibração assistida
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-emerald-400/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center mb-4">
                    <Microscope size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    Montagem na Facetadora &amp; Lensometria
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    O corte milimétrico do bisel da lente é feito em maquinário próprio. Antes de entregar os óculos, fazemos a leitura completa no lensômetro digital para emissão do certificado.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-white/5 text-[11px] text-emerald-300 font-medium">
                  ✓ Conferência 100% rigorosa antes da entrega
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TECNOLOGIA QUE USAMOS NO LABORATÓRIO */}
        <section className="py-16 sm:py-20 bg-[#02070d] border-b border-white/10">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                  ESTRUTURA FÍSICA PRÓPRIA
                </span>
                <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight mt-1 mb-4">
                  Tecnologia digital aplicada à sua visão diária
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  Em nosso laboratório localizado na Rua Princesa Isabel, 221 em Araçatuba-SP, combinamos o conhecimento técnico artesanal com as ferramentas mais avançadas da óptica moderna:
                </p>

                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-amber-400/15 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 border border-amber-400/30">
                      ✓
                    </div>
                    <span>
                      <strong className="text-white">Facetadora Automática Computadorizada:</strong> corte de alta precisão com bisel personalizado para armações em acetato, metal e parafusadas (três peças).
                    </span>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-400/15 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5 border border-cyan-400/30">
                      ✓
                    </div>
                    <span>
                      <strong className="text-white">Lensômetro Digital de Alta Resolução:</strong> aferição instantânea do poder esférico, cilíndrico, eixo e proteção UV antes de qualquer envio.
                    </span>
                  </li>

                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-400/15 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-400/30">
                      ✓
                    </div>
                    <span>
                      <strong className="text-white">Consultoria de Índice de Refração:</strong> orientação técnica transparente se você realmente precisa de uma lente 1.67 ou se uma 1.56 já proporciona estética perfeita sem custos extras desnecessários.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Card Visual do Laboratório */}
              <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                <img
                  src="/images/laboratory/laboratorio-ventara.jpg"
                  alt="Laboratório Próprio da Óticas Ventara em Araçatuba"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02070d] via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#040d1a]/90 backdrop-blur-md border border-white/10">
                  <p className="text-xs font-bold text-white">Laboratório Óticas Ventara</p>
                  <p className="text-[11px] text-slate-400">Montagem expressa para visão simples e calibração de multifocais</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA FINAL: DÚVIDAS SOBRE RECEITA */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-[#06111f] to-[#02070d] text-center">
          <div className="max-w-[700px] mx-auto px-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-5">
              <Sparkles size={24} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-3">
              Tem alguma dúvida sobre sua receita de óculos?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              Envie uma foto da sua receita no WhatsApp. O técnico Gustavo Guimarães Cordeiro e nossa equipe técnica farão a leitura, explicarão as opções ideais de lentes e passarão um orçamento transparente sem compromisso.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all active:scale-95"
            >
              <MessageCircle size={16} />
              <span>Enviar Minha Receita no WhatsApp</span>
            </a>
          </div>
        </section>
      </main>

      {/* Footer Simples */}
      <footer className="py-8 bg-[#010408] border-t border-white/10 text-center text-xs text-slate-500">
        <p>Óticas Ventara Eyewear · Responsável Técnico: Gustavo Guimarães Cordeiro · Araçatuba-SP</p>
      </footer>
    </div>
  );
}
