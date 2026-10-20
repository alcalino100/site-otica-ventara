"use client";

import React from "react";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export function StoreSection() {
  const googleMapsUrl =
    "https://www.google.com/maps/search/?api=1&query=Rua+Princesa+Isabel,+221,+Centro,+Araçatuba+-+SP,+16010-250";

  return (
    <section
      className="py-24 bg-[#06111f] border-t border-b border-white/5 relative overflow-hidden"
      id="loja-fisica"
    >
      {/* Luz ambiente suave */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#0756b8]/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 relative z-10">
        {/* Cabeçalho Unificado da Seção */}
        <div className="max-w-3xl mb-12 lg:mb-16">
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3 inline-flex items-center gap-1.5">
            <Sparkles size={14} /> NOSSA LOJA FÍSICA EM ARAÇATUBA
          </span>
          <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight mb-4 leading-tight">
            Atendimento atencioso e <br className="hidden sm:inline" />
            <span className="font-normal text-amber-400">experiência presencial.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
            Visite nosso espaço no Centro de Araçatuba para provar armações exclusivas, receber consultoria especializada e garantir lentes com montagem de alta precisão.
          </p>
        </div>

        {/* Grade 2-Colunas Perfeitamente Alinhadas e Balanceadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Localização, Horários & Contato */}
          <div className="bg-[#091a2e]/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col justify-between backdrop-blur-sm">
            <div>
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                    Unidade Araçatuba
                  </span>
                  <h3 className="text-xl sm:text-2xl font-medium text-white mt-0.5">
                    Informações de Visita
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Atendimento Ativo</span>
                </div>
              </div>

              <div className="space-y-6">
                {/* Endereço */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Endereço Completo
                    </h4>
                    <p className="text-sm font-medium text-white leading-relaxed">
                      Rua Princesa Isabel, 221, Centro, Araçatuba - SP, CEP 16010-250
                    </p>
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      Localização central e de fácil estacionamento.
                    </span>
                  </div>
                </div>

                {/* Horário */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Horário de Atendimento
                    </h4>
                    <p className="text-sm font-medium text-white">
                      Segunda a Sexta: 09h às 18h
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sábados: 09h às 13h · Domingos e Feriados: Fechado
                    </p>
                  </div>
                </div>

                {/* Telefone & WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Telefone & WhatsApp Direto
                    </h4>
                    <a
                      href="tel:+5518996155748"
                      className="text-base text-amber-400 hover:text-amber-300 font-semibold inline-block transition-colors"
                      style={{ color: "#ffd62e" }}
                    >
                      (18) 99615-5748
                    </a>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Tire dúvidas com nossos consultores antes da sua visita.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão Como Chegar */}
            <div className="pt-8 mt-8 border-t border-white/10">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-98 !text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-400/10"
                style={{ color: "#06111f" }}
              >
                <Navigation size={16} />
                <span className="font-bold">Abrir no Google Maps</span>
              </a>
            </div>
          </div>

          {/* Card 2: Diferenciais & Cortesia Presencial */}
          <div className="rounded-3xl bg-gradient-to-b from-[#0a1c30] to-[#040e18] border border-amber-400/25 p-6 sm:p-10 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                    Espaço Físico Ventara
                  </span>
                  <h3 className="text-xl sm:text-2xl font-medium text-white mt-0.5">
                    Diferenciais na Loja
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-semibold">
                  Serviços Gratuitos
                </span>
              </div>

              <div className="space-y-4">
                {/* Item 1 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-400/30 transition-all flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Consultoria Visagista de Armações
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed mt-0.5">
                      Prove armações guiadas pelo formato do seu rosto, proporções e tom de pele para valorizar seu estilo pessoal.
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-400/30 transition-all flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Ajuste Anatômico Presencial
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed mt-0.5">
                      Regulagem de hastes, curvas e plaquetas para que seus óculos fiquem perfeitamente alinhados e sem pressão.
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-400/30 transition-all flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Higienização Ultrassônica Cortesia
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed mt-0.5">
                      Limpeza profunda por vibração ultrassônica gratuita para renovar a transparência e brilho das suas lentes.
                    </p>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-400/30 transition-all flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      Laboratório Próprio com Montagem Ágil
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed mt-0.5">
                      Equipamentos computadorizados para entrega ágil com conferência rigorosa de centro óptico.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé com comodidades */}
            <div className="pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-200 relative z-10">
              <span className="flex items-center gap-1.5">
                <span className="text-amber-400">☕</span> Café espresso para clientes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-amber-400">🚗</span> Estacionamento fácil no Centro
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-amber-400">❄️</span> Ambiente 100% climatizado
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
