"use client";

import React from "react";
import { MapPin, Clock, Phone, Navigation, Sparkles } from "lucide-react";

export function StoreSection() {
  const googleMapsUrl =
    "https://www.google.com/maps/search/?api=1&query=Rua+Princesa+Isabel,+221,+Centro,+Araçatuba+-+SP,+16010-250";

  return (
    <section className="py-24 bg-[#06111f] border-t border-b border-white/5 relative overflow-hidden" id="loja-fisica">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-400 mb-2 flex items-center gap-1.5">
              <Sparkles size={14} /> NOSSA LOJA FÍSICA
            </span>
            <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight mb-6">
              Vamos encontrar seus <span className="font-normal text-amber-400">próximos óculos?</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-xl">
              Visite a Ótica Ventara em Araçatuba e conheça nossas opções de armações e lentes pessoalmente.
            </p>

            <div className="bg-[#091a2e] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Endereço Oficial</h4>
                  <p className="text-sm font-medium text-white">
                    Rua Princesa Isabel, 221, Centro, Araçatuba-SP, CEP 16010-250
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Horário de Funcionamento</h4>
                  <p className="text-sm text-slate-200">
                    Segunda a Sexta: 09h às 18h · Sábados: 09h às 13h
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Telefone & WhatsApp</h4>
                  <a
                    href="tel:+5518996155748"
                    className="text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium"
                  >
                    (18) 99615-5748
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-200 hover:border-amber-400/50"
                >
                  <Navigation size={15} className="text-amber-400" />
                  Abrir no Google Maps
                </a>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative h-96 sm:h-[460px] rounded-3xl overflow-hidden border border-white/10 bg-[#0a1c30] shadow-2xl flex flex-col justify-end p-8">
              <div className="absolute inset-0 bg-gradient-to-t from-[#06111f] via-[#06111f]/60 to-transparent z-10" />
              
              {/* Moldura Arquitetônica Abstrata Sofisticada */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <div className="w-72 h-72 border border-amber-400/40 rounded-full animate-pulse" />
                <div className="w-96 h-96 border border-white/20 rounded-full absolute" />
              </div>

              <div className="relative z-20 space-y-3">
                <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
                  ESPAÇO FÍSICO VENTARA
                </span>
                <h3 className="text-xl sm:text-2xl font-medium text-white">
                  Ambiente acolhedor para você experimentar cada detalhe.
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Traga sua receita oftalmológica para uma consultoria técnica de lentes ou faça um ajuste de armação sem custo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
