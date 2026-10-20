"use client";

import React, { useState } from "react";
import { MapPin, Phone, Clock, MessageSquare, ArrowUpRight } from "lucide-react";
import { Button } from "../ui/button";

interface ContactSectionProps {
  onNotify: (msg: string) => void;
}

export function ContactSection({ onNotify }: ContactSectionProps) {
  const [isOpeningWhatsApp, setIsOpeningWhatsApp] = useState(false);

  const handleWhatsApp = () => {
    setIsOpeningWhatsApp(true);
    setTimeout(() => {
      setIsOpeningWhatsApp(false);
      onNotify("Redirecionando para o WhatsApp oficial da Ótica Ventara...");
      window.open(
        "https://wa.me/5518996155748?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20as%20armações%20e%20lentes%20da%20Ótica%20Ventara.",
        "_blank",
        "noopener,noreferrer"
      );
    }, 450);
  };

  return (
    <section className="contact" id="contato">
      <div className="contact-heading">
        <p className="eyebrow">ÓTICA VENTARA</p>
        <h2>
          Seu próximo olhar<br />
          começa <span>aqui.</span>
        </h2>
        <p className="contact-intro text-slate-300 text-sm mt-4 max-w-sm">
          Venha tomar um café conosco no coração de Araçatuba ou inicie seu atendimento online com nossos especialistas.
        </p>
      </div>

      <div className="contact-details">
        <div className="contact-card">
          <div className="contact-card-header flex items-center gap-3 mb-4">
            <div className="contact-icon bg-amber-500/10 text-amber-400 p-2.5 rounded-full">
              <MapPin size={22} />
            </div>
            <div>
              <h3 className="text-white text-lg font-medium">Espaço Araçatuba</h3>
              <p className="text-xs text-slate-400">Atendimento personalizado com hora marcada</p>
            </div>
          </div>

          <div className="contact-info-list space-y-3 text-slate-300 text-sm">
            <p className="flex items-start gap-2.5">
              <MapPin size={16} className="text-amber-400/80 mt-1 flex-shrink-0" />
              <span>R. Princesa Isabel, 221 - Centro, Araçatuba - SP, 16010-250</span>
            </p>
            <p className="flex items-center gap-2.5">
              <Phone size={16} className="text-amber-400/80 flex-shrink-0" />
              <a href="tel:+5518996155748" className="hover:text-amber-300 transition-colors">
                (18) 99615-5748
              </a>
            </p>
            <p className="flex items-center gap-2.5">
              <Clock size={16} className="text-amber-400/80 flex-shrink-0" />
              <span>Terça a Sexta: 09h às 18h · Sábado: 09h às 13h</span>
            </p>
          </div>

          <div className="contact-cta-box pt-6">
            <Button
              variant="outline"
              isLoading={isOpeningWhatsApp}
              onClick={handleWhatsApp}
              className="w-full justify-center text-xs tracking-wider font-semibold"
            >
              <MessageSquare size={16} /> FALE COM A VENTARA NO WHATSAPP <ArrowUpRight size={16} />
            </Button>
          </div>

          <div className="contact-rating flex items-center gap-2 mt-4 text-xs text-slate-400 justify-center">
            <span>Ótica Ventara · Atendimento Oficial em Araçatuba · @oticaventara no Instagram</span>
          </div>
        </div>
      </div>
    </section>
  );
}
