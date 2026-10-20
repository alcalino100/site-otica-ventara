"use client";

import React from "react";
import { MapPin, Clock, Phone, Navigation, Sparkles, CheckCircle2 } from "lucide-react";

export function StoreSection() {
  const googleMapsUrl =
    "https://www.google.com/maps/search/?api=1&query=Rua+Princesa+Isabel,+221,+Centro,+Araçatuba+-+SP,+16010-250";

  return (
    <section className="py-24 bg-[#06111f] border-t border-b border-white/5 relative overflow-hidden" id="loja-fisica">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-3 flex items-center gap-1.5">
              <Sparkles size={14} /> NOSSA LOJA FÍSICA
            </span>
            <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight mb-5 leading-tight">
              Vamos encontrar seus <br className="hidden sm:inline" />
              <span className="font-normal text-amber-400">próximos óculos?</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-xl">
              Visite a Ótica Ventara em Araçatuba e conheça nossas opções de armações e lentes pessoalmente.
            </p>

            <div className="bg-[#091a2e] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
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
                  <p className="text-sm text-slate-200">
                    Segunda a Sexta: 09h às 18h · Sábados: 09h às 13h
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
                    Telefone & WhatsApp
                  </h4>
                  <a
                    href="tel:+5518996155748"
                    className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium inline-block"
                  >
                    (18) 99615-5748
                  </a>
                </div>
              </div>

              {/* Botão Como chegar */}
              <div className="pt-4 border-t border-white/10">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 w-full py-4 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-amber-400/10"
                >
                  <Navigation size={16} />
                  <span>Como chegar</span>
                </a>
              </div>
            </div>
          </div>

          {/* Atmosfera da Loja Física */}
          <div className="relative">
            <div className="relative h-96 sm:h-[480px] rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0a1c30] to-[#040e18] shadow-2xl flex flex-col justify-end p-8 sm:p-10">
              <div className="absolute inset-0 bg-radial from-amber-400/10 via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* Grid arquitetônico de ótica de luxo */}
              <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
                <div className="w-80 h-80 border border-amber-400 rounded-full" />
                <div className="w-[450px] h-[450px] border border-white/20 rounded-full absolute" />
              </div>

              <div className="relative z-20 space-y-3">
                <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400 inline-block px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20">
                  ESPAÇO FÍSICO VENTARA
                </span>
                <h3 className="text-xl sm:text-2xl font-light text-white leading-snug">
                  Ambiente acolhedor e consultoria atenta no coração de Araçatuba.
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Venha provar diferentes armações, receber orientação sobre lentes e desfrutar de um atendimento focado na sua saúde visual.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs text-amber-300/90 font-medium">
                  <CheckCircle2 size={15} className="text-amber-400" />
                  <span>Ajustes ergonômicos e limpeza ultrassônica sem custo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
