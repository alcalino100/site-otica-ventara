"use client";

import React from "react";
import Image from "next/image";
import { MapPin, Clock, CheckCircle2, ShieldCheck, Sparkles, Navigation } from "lucide-react";

interface ShippingLocalDeliveryProps {
  title?: string;
  description?: string;
  cities?: string;
  timeframe?: string;
  conditions?: string;
  imageUrl?: string;
}

export function ShippingLocalDelivery({
  title = "Entrega Expressa em Araçatuba e Região",
  description = "Com frota própria e equipe dedicada, garantimos transporte rápido e seguro diretamente do nosso laboratório até o seu endereço em Araçatuba e municípios vizinhos.",
  cities = "Araçatuba, Birigui, Bilac, Gabriel Monteiro, Coroados e Guararapes",
  timeframe = "Consulte o prazo no checkout (média de 24h a 48h úteis após montagem técnica)",
  conditions = "Opção de retirada gratuita no balcão da loja física ou entrega direta",
  imageUrl = "/images/shipping/van-ventara-aracatuba.jpg",
}: ShippingLocalDeliveryProps) {
  const cityList = cities
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  return (
    <section id="aracatuba-regiao" className="py-20 sm:py-28 bg-[#030913] relative overflow-hidden border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Coluna da Esquerda: Textos & Dados Técnicos */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold tracking-wider uppercase">
              <Navigation size={13} className="text-blue-400" />
              <span>Logística Própria Regional</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-light text-white tracking-tight leading-tight">
              {title}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              {description}
            </p>

            {/* Cidades Atendidas com Tags Elegantes */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin size={14} />
                <span>Cidades Atendidas com Rota Local</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {cityList.map((city, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-slate-200 font-medium hover:border-amber-400/40 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {city}
                  </span>
                ))}
              </div>
            </div>

            {/* Cartões Informativos: Prazos e Condições */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Clock size={15} className="text-amber-400" />
                  <span>Prazo Estimado</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {timeframe}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <ShieldCheck size={15} className="text-blue-400" />
                  <span>Condições Especiais</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {conditions}
                </p>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Imagem da Van Azul Ventara */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-[#061424] shadow-2xl group">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={imageUrl}
                  alt="Van azul de entregas personalizadas da Ótica Ventara Eyewear em Araçatuba e região"
                  fill
                  sizes="(max-width: 768px) 100vw, 550px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  quality={90}
                />
              </div>

              {/* Overlay inferior com legenda da frota */}
              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 bg-gradient-to-t from-[#02070e] via-[#02070e]/80 to-transparent">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    Frota Exclusiva Ventara
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">Araçatuba-SP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
