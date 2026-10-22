"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Clock, Instagram, ShieldCheck } from "lucide-react";
import { BrandLogo } from "../ui/brand-logo";

interface FooterProps {
  onOpenLegal?: (tab: "terms" | "privacy") => void;
}

export function Footer({ onOpenLegal }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer bg-[#030810] text-slate-300 border-t border-white/10 pt-16 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Coluna 1: Marca & Assinatura */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-block" aria-label="Ótica Ventara Home">
              <BrandLogo variant="header" />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Mais que óculos. Seu jeito de ver o mundo. Curadoria autoral de armações, proteção solar e consultoria técnica em lentes em Araçatuba-SP.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com/oticaventara"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors"
                aria-label="Instagram da Ótica Ventara"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Coluna 2: Navegação Rápida Oficial */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Navegação</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="#inicio" className="hover:text-amber-300 transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="#armacoes" className="hover:text-amber-300 transition-colors">
                  Armações
                </a>
              </li>
              <li>
                <a href="#solar" className="hover:text-amber-300 transition-colors">
                  Óculos de sol
                </a>
              </li>
              <li>
                <a href="#lentes" className="hover:text-amber-300 transition-colors">
                  Lentes
                </a>
              </li>
              <li>
                <a href="/medicao-por-foto" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-medium">
                  <span>Medição por Foto (DNP)</span>
                  <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-400/30">Novo</span>
                </a>
              </li>
              <li>
                <a href="#sobre-nos" className="hover:text-amber-300 transition-colors">
                  Sobre a Ventara
                </a>
              </li>
              <li>
                <a href="#contato" className="hover:text-amber-300 transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Dados da Loja Física */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Espaço Físico</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <a
                  href="https://maps.app.goo.gl/sXFBJrNTxQcBhwTh9?g_st=iw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-300 transition-colors underline-offset-2 hover:underline"
                >
                  Rua Princesa Isabel, 221, Centro<br />
                  Araçatuba - SP · CEP 16010-250
                </a>
              </p>
              <div className="space-y-1">
                <p className="flex items-center gap-2">
                  <Phone size={15} className="text-amber-400 flex-shrink-0" />
                  <span className="text-slate-300">Fixo:</span>
                  <a href="tel:+551833042808" className="hover:text-amber-300 transition-colors font-medium text-white">
                    (18) 3304-2808
                  </a>
                </p>
                <p className="flex items-center gap-2 pl-[23px]">
                  <span className="text-slate-300">WhatsApp:</span>
                  <a
                    href="https://wa.me/5518996155748"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors font-medium text-emerald-400"
                  >
                    (18) 99615-5748
                  </a>
                </p>
              </div>
              <p className="flex items-start gap-2">
                <Clock size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <span>
                  Seg a Sex: 09h às 18h<br />
                  Sábados: 09h às 13h
                </span>
              </p>
            </div>
          </div>

          {/* Coluna 4: Conformidade & Informações Legais */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Segurança & Legal</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck size={15} className="text-amber-400" />
                <span>Atendimento Óptico Certificado</span>
              </p>
              <p className="text-[11px] text-slate-500">
                CNPJ: 00.000.000/0001-00 · Araçatuba-SP
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => onOpenLegal?.("privacy")}
                  className="text-left hover:text-amber-300 transition-colors underline-offset-4 hover:underline text-xs"
                >
                  Política de Privacidade (LGPD)
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLegal?.("terms")}
                  className="text-left hover:text-amber-300 transition-colors underline-offset-4 hover:underline text-xs"
                >
                  Termos de Uso & Ajustes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé inferior com Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} Ótica Ventara. Todos os direitos reservados.</p>
          <p className="text-[11px] text-slate-500">
            Rua Princesa Isabel, 221, Centro, Araçatuba-SP · Presença Digital & Loja Física
          </p>
        </div>
      </div>
    </footer>
  );
}
