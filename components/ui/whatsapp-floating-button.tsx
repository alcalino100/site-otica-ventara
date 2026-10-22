"use client";

import React, { useState } from "react";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloatingButton() {
  const [isHovered, setIsHovered] = useState(false);

  const whatsappNumber = "5518996155748";
  const defaultMessage = encodeURIComponent(
    "Olá! Estou no site da Óticas Ventara e gostaria de atendimento especializado sobre armações e lentes."
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <aside
      aria-label="Atendimento pelo WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-[80] flex items-center gap-2.5 pointer-events-auto select-none"
    >
      {/* Tooltip elegante em Desktop com transição fluida */}
      <div
        className={`hidden md:flex items-center px-3.5 py-2 rounded-full bg-[#06111f]/95 text-white text-xs font-semibold tracking-wide border border-amber-400/30 shadow-xl backdrop-blur-md transition-all duration-300 pointer-events-none ${
          isHovered
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-3 pointer-events-none"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
        <span>Fale no WhatsApp</span>
      </div>

      {/* Botão Flutuante Circular com Efeito de Pulso */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Iniciar conversa com a Ótica Ventara pelo WhatsApp"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.6)] active:scale-95 transition-all duration-300 cursor-pointer focus:outline-hidden focus:ring-4 focus:ring-[#25D366]/40"
      >
        {/* Anel de Pulso Animado (Ping Glow) */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />

        {/* Ícone Oficial WhatsApp em SVG de Alta Resolução */}
        <svg
          viewBox="0 0 32 32"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current relative z-10 transition-transform duration-300 group-hover:scale-110"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 2C8.28 2 2 8.28 2 16c0 2.68.74 5.2 2.05 7.37L2.09 30l6.83-1.92A13.91 13.91 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.64a11.59 11.59 0 01-5.92-1.62l-.42-.25-4.4 1.24 1.2-4.27-.27-.45A11.64 11.64 0 1116 27.64zm6.4-8.73c-.35-.18-2.07-1.02-2.39-1.14-.32-.12-.55-.18-.79.18-.23.35-.91 1.14-1.11 1.38-.2.23-.41.26-.76.09a9.58 9.58 0 01-2.82-1.74 10.6 10.6 0 01-1.95-2.43c-.2-.35-.02-.54.15-.72.16-.16.35-.41.53-.61.18-.2.23-.35.35-.59.12-.23.06-.44-.03-.61-.09-.18-.79-1.9-1.08-2.6-.29-.7-.58-.6-.79-.61h-.68c-.23 0-.61.09-.93.44-.32.35-1.23 1.2-1.23 2.93s1.26 3.4 1.44 3.63c.18.23 2.47 3.77 5.99 5.29.84.36 1.49.58 2 .74.84.27 1.61.23 2.22.14.68-.1 2.07-.85 2.36-1.66.29-.82.29-1.52.2-1.66-.08-.15-.31-.24-.66-.42z" />
        </svg>

        {/* Badge de "Online agora" */}
        <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-xs" />
      </a>
    </aside>
  );
}
