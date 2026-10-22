"use client";

import React from "react";
import {
  MapPin,
  Clock,
  Phone,
  Navigation,
  Sparkles,
  CheckCircle2,
  Building2,
  ShieldCheck,
  Coffee,
} from "lucide-react";

export function StoreSection() {
  const googleMapsUrl = "https://maps.app.goo.gl/sXFBJrNTxQcBhwTh9?g_st=iw";

  return (
    <section
      className="py-16 sm:py-24 bg-[#06111f] border-t border-b border-white/5 relative overflow-hidden"
      id="loja-fisica"
    >
      {/* Luz ambiente suave */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#0756b8]/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 relative z-10">
        {/* Cabeçalho Unificado da Seção */}
        <div className="max-w-3xl mb-10 sm:mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3 inline-flex items-center gap-1.5">
            <Sparkles size={14} /> NOSSO ESPAÇO FÍSICO EM ARAÇATUBA-SP
          </span>
          <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight mb-4 leading-tight">
            Venha conhecer a <br className="hidden sm:inline" />
            <span className="font-semibold text-amber-400">Óticas Ventara Eyewear.</span>
          </h2>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            Um ambiente acolhedor, sofisticado e moderno no Centro de Araçatuba. Prove armações exclusivas, faça ajustes anatômicos precisos e confira nosso laboratório próprio computadorizado.
          </p>
        </div>

        {/* GRADE PRINCIPAL: FOTO REAL DA FACHADA + DADOS OFICIAIS DA LOJA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          {/* FOTO REAL DA FACHADA DA LOJA (5 COLS NO DESKTOP, TOTALMENTE RESPONSIVA NO MOBILE) */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-amber-400/30 bg-[#091a2e] shadow-2xl min-h-[340px] sm:min-h-[460px] flex flex-col group">
            <div className="relative w-full h-full flex-1 overflow-hidden">
              <img
                src="/images/store/fachada-otica-ventara.jpg"
                alt="Fachada Oficial da Loja Óticas Ventara Eyewear na Rua Princesa Isabel 221 em Araçatuba"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              {/* Overlay suave inferior para legibilidade */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06111f] via-transparent to-transparent opacity-80" />

              {/* Selo Autêntico com Destaque Dourado */}
              <div className="absolute top-4 left-4 bg-[#06111f]/90 backdrop-blur-md text-amber-400 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-amber-400/40 shadow-lg flex items-center gap-1.5">
                <Building2 size={13} />
                <span>Fachada Real · Araçatuba-SP</span>
              </div>

              {/* Informação na Base da Foto */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-300 block">
                  Rua Princesa Isabel, 221
                </span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">
                  Atendimento de segunda a sábado no coração da cidade.
                </p>
              </div>
            </div>
          </div>

          {/* DADOS DE CONTATO & HORÁRIOS (7 COLS NO DESKTOP) */}
          <div className="lg:col-span-7 bg-[#091a2e]/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col justify-between backdrop-blur-sm">
            <div>
              <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b border-white/10 gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                    Loja &amp; Laboratório
                  </span>
                  <h3 className="text-xl sm:text-2xl font-medium text-white mt-0.5">
                    Informações de Atendimento
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Loja Aberta &amp; Pronta para Receber Você</span>
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
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      Rua Princesa Isabel, 221, Centro, Araçatuba - SP, CEP 16010-250
                    </p>
                    <span className="text-xs text-slate-400 mt-0.5 block">
                      Localização central privilegiada, fácil de estacionar.
                    </span>
                  </div>
                </div>

                {/* Telefones: Fixo e WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Telefones de Contato
                    </h4>
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Telefone Fixo:</span>
                        <a
                          href="tel:+551833042808"
                          className="text-base font-bold text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          (18) 3304-2808
                        </a>
                      </div>
                      <div className="border-l border-white/10 pl-4">
                        <span className="text-[11px] text-slate-400 block">WhatsApp:</span>
                        <a
                          href="https://wa.me/5518996155748"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          (18) 99615-5748
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Horário de Atendimento */}
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Horário de Funcionamento
                    </h4>
                    <p className="text-sm font-medium text-white">
                      Segunda a Sexta: 09h às 18h
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Sábados: 09h às 13h · Domingos e Feriados: Fechado
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão Como Chegar com Link Oficial do Google Maps */}
            <div className="pt-6 mt-8 border-t border-white/10">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-98 !text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-400/10 cursor-pointer"
                style={{ color: "#06111f" }}
              >
                <Navigation size={16} />
                <span className="font-bold">Abrir no Google Maps (Google Meu Negócio)</span>
              </a>
            </div>
          </div>
        </div>

        {/* CARDS DE CORTESIAS & DIFERENCIAIS PRESENCIAIS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">
                Consultoria Visagista
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-relaxed">
                Armações recomendadas para o seu formato de rosto e tom de pele.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">
                Ajuste Anatômico Grátis
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-relaxed">
                Regulagem perfeita de hastes, curvas e plaquetas para seu conforto.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">
                Higienização Ultrassônica
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-relaxed">
                Limpeza profunda gratuita com ultrassom para renovar suas lentes.
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Coffee size={18} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">
                Conforto Presencial
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-relaxed">
                Ambiente 100% climatizado com café espresso cortesia para você.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
