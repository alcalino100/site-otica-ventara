import type { Metadata } from "next";
import Link from "next/link";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  Ruler,
  Clock,
  ArrowLeft,
  Building2,
  Phone,
  HelpCircle,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Medição de DNP por Foto | Ótica Ventara Araçatuba",
  description:
    "Entenda como funciona o serviço em estruturação de medição digital de DNP (Distância Nasopupilar) por foto da Ótica Ventara. Alinhamento óptico milimétrico com tecnologia internacional.",
};

export default function MedicaoPorFotoPage() {
  const whatsappUrl =
    "https://wa.me/5518996155748?text=Ol%C3%A1!%20Li%20sobre%20o%20servi%C3%A7o%20de%20medi%C3%A7%C3%A3o%20de%20DNP%20por%20foto%20e%20gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20minha%20receita.";

  return (
    <div className="min-h-screen bg-[#06111f] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Header Fixo Simplificado */}
      <header className="sticky top-0 z-50 bg-[#06111f]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-[1300px] mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
            aria-label="Voltar para a página inicial da Óticas Ventara"
          >
            <BrandLogo size="sm" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={14} />
              <span>Voltar ao Início</span>
            </Link>

            <a
              href="/#armacoes"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              <span>Ver Catálogo</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative py-16 sm:py-24 overflow-hidden border-b border-white/10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0756b8]/20 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-[1100px] mx-auto px-4 sm:px-8 relative z-10 text-center">
            {/* Badge de Status do Serviço */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-6">
              <Sparkles size={14} className="text-amber-400" />
              <span>Em Estruturação com Parceiro Internacional</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-tight max-w-4xl mx-auto">
              Medição Digital de <br className="hidden sm:inline" />
              <strong className="font-bold text-amber-400">DNP por Foto</strong>
            </h1>

            <p className="text-sm sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mt-4 font-normal">
              Entenda como a tecnologia de visão computacional da Óticas Ventara
              irá calcular a centralização milimétrica das suas lentes a partir de
              uma foto padrão.
            </p>

            {/* Aviso de Transparência Importante */}
            <div className="mt-8 max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs sm:text-sm text-left flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Informação Essencial de Saúde Visual:
                </p>
                <p className="text-amber-100/90 leading-relaxed text-xs">
                  A medição por foto calcula <strong>exclusivamente a Distância Nasopupilar (DNP)</strong> e altura do centro óptico. <strong>Não mede e não prescreve grau</strong> (dioptria). A prescrição médica de grau é privativa do médico oftalmologista.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARAÇÃO CLARA: O QUE É MEDIDO VS O QUE NÃO É MEDIDO */}
        <section className="py-16 sm:py-20 bg-slate-950/60 border-b border-white/10">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                TRANSPARÊNCIA TOTAL
              </span>
              <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight mt-1">
                O que você precisa saber antes de tudo
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* O QUE É MEDIDO */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#091b30] border border-emerald-500/30 flex flex-col justify-between relative overflow-hidden shadow-xl">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Ruler size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Permitido e Seguro
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        O que é medido: DNP e Altura
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                    A <strong>Distância Nasopupilar (DNP)</strong> é a medida em milímetros entre o centro do seu nariz e a sua pupila. Essa medida garante que:
                  </p>

                  <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>O centro de foco da lente fique exatamente alinhado ao seu eixo visual.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>Evita fadiga ocular, dor de cabeça e distorções causadas por lentes descentralizadas.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>Permite corte exato na nossa facetadora computadorizada.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 text-xs text-emerald-300/80 font-medium">
                  ✓ Medição puramente geométrica do posicionamento dos olhos na armação.
                </div>
              </div>

              {/* O QUE NÃO É MEDIDO */}
              <div className="p-6 sm:p-8 rounded-3xl bg-[#140e1b] border border-amber-500/30 flex flex-col justify-between relative overflow-hidden shadow-xl">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Eye size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Exclusivo de Médico
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        O que NÃO é medido: Grau (Dioptria)
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                    Nenhum software ou foto pode diagnosticar ou determinar o grau de óculos. Isso exige exame clínico oftalmológico presencial:
                  </p>

                  <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">✕</span>
                      <span>Não medimos miopia, astigmatismo, hipermetropia ou presbiopia por foto.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">✕</span>
                      <span>Não substituímos nem realizamos consultas com médico oftalmologista.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">✕</span>
                      <span>Não confeccionamos lentes sem a apresentação da receita válida emitida por profissional habilitado.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 text-xs text-amber-300/80 font-medium">
                  ⚠️ Sempre consulte seu médico oftalmologista anualmente.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONARÁ O PROCESSO (3 PASSOS) */}
        <section className="py-16 sm:py-24 border-b border-white/10">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                PASSO A PASSO
              </span>
              <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight mt-1">
                Como o serviço irá funcionar
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Processo simples, rápido e transparente realizado pelo seu próprio celular.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Passo 1 */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold text-lg mb-5 border border-amber-400/20">
                  1
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                  Foto Frontal com Referencial
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Você posiciona o rosto em linha reta com boa iluminação natural, segurando um cartão magnético padrão na testa como escala de referência métrica universal.
                </p>
              </div>

              {/* Passo 2 */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold text-lg mb-5 border border-amber-400/20">
                  2
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                  Calibração Submilimétrica
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  O algoritmo de inteligência óptica mapeia a distância interpupilar, calcula a DNP do olho direito e esquerdo e verifica a altura de montagem exata na armação.
                </p>
              </div>

              {/* Passo 3 */}
              <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-bold text-lg mb-5 border border-amber-400/20">
                  3
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                  Montagem na Facetadora
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Os dados milimétricos são enviados ao nosso laboratório próprio em Araçatuba. A lente é biselada no centro óptico correto para seu máximo conforto.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ATENDIMENTO HOJE: PRESENCIAL OU WHATSAPP */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-[#091a2e] to-[#06111f] border-b border-white/10">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-8 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-6">
              <Building2 size={28} />
            </div>

            <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight">
              Precisa fazer seus óculos agora?
            </h2>

            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto mt-3">
              Enquanto o serviço de foto passa pelos testes finais de validação, você pode medir sua DNP presencialmente em nossa loja ou enviar sua receita médica pelo WhatsApp.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
              >
                <span>Enviar Receita no WhatsApp</span>
                <ArrowRight size={15} />
              </a>

              <Link
                href="/#armacoes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs tracking-wider transition-all border border-white/15"
              >
                <span>Explorar Catálogo de Armações</span>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-6">
              <span className="flex items-center gap-1.5">
                <Building2 size={14} className="text-amber-400" /> Rua Princesa Isabel, 221 - Centro, Araçatuba-SP
              </span>
              <span className="flex items-center gap-1.5">
                <Phone size={14} className="text-amber-400" /> Fixo: (18) 3304-2808 · WhatsApp: (18) 99615-5748
              </span>
            </div>
          </div>
        </section>

        {/* FAQ RÁPIDO */}
        <section className="py-16 sm:py-20">
          <div className="max-w-[900px] mx-auto px-4 sm:px-8">
            <div className="flex items-center gap-2 text-amber-400 mb-2 justify-center">
              <HelpCircle size={16} />
              <span className="text-[11px] font-bold tracking-widest uppercase">
                DÚVIDAS FREQUENTES
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-light text-white text-center tracking-tight mb-10">
              Perguntas sobre a medição de DNP
            </h2>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  Por que a DNP não vem escrita na maioria das receitas médicas?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  O médico oftalmologista diagnostica a refração (o grau dos seus olhos). A DNP e a altura dependem diretamente do modelo e formato da armação que você escolher na ótica. Por isso, a tomada dessas medidas cabe ao laboratório ou ao óptico no momento da escolha dos óculos.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  O que acontece se a lente for montada com a DNP errada?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Se o centro da lente não coincidir com a sua pupila, surge o chamado "efeito prismático indesejado", provocando desconforto, sensação de tontura, olhos cansados e dificuldade de adaptação, especialmente em graus mais altos e multifocais. Na Ventara, nossa facetadora digital garante tolerância milimétrica.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  Vocês entregam para outras cidades?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sim! Atendemos clientes em todo o Brasil. Você escolhe a armação no catálogo, envia sua receita oftalmológica e nossos consultores prestam todo o auxílio de conferência para confecção e envio seguro.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Oficial */}
      <Footer />
    </div>
  );
}
