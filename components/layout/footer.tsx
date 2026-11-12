"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, Instagram, Facebook, ShieldCheck, Truck } from "lucide-react";
import { BrandLogo } from "../ui/brand-logo";
import { useSiteSettings } from "../providers/site-settings-provider";

interface FooterProps {
  onOpenLegal?: (tab: "terms" | "privacy") => void;
  cnpj?: string;
  address?: string;
  hours?: string;
  copyright?: string;
}

export function Footer({ onOpenLegal, cnpj, address, hours, copyright }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const { identity, cleanWhatsAppNumber, paymentMethods } = useSiteSettings();
  const instaUrl = `https://instagram.com/${identity.instagram_handle.replace("@", "")}`;

  return (
    <footer className="site-footer relative z-10 isolate bg-[#030810] text-slate-300 border-t border-white/10 pt-12 sm:pt-16 pb-28 sm:pb-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Coluna 1: Marca & Assinatura */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-block" aria-label="Ótica Ventara Home">
              <BrandLogo variant="header" />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              {identity.tagline || "Mais que óculos. Seu jeito de ver o mundo."} Curadoria autoral de armações, proteção solar e consultoria técnica em lentes em Araçatuba-SP.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={instaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors"
                aria-label={`Instagram da ${identity.store_name}`}
              >
                <Instagram size={16} />
              </a>
              <a
                href={identity.facebook_url || "https://www.facebook.com/share/19mUxSqUnf/?mibextid=wwXIfr"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors"
                aria-label={`Facebook da ${identity.store_name}`}
              >
                <Facebook size={16} />
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
                <a href="/armacoes" className="hover:text-amber-300 transition-colors">
                  Armações
                </a>
              </li>
              <li>
                <a href="/armacoes?categoria=solar" className="hover:text-amber-300 transition-colors">
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
                <a href="/rastreio" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                  <span>Rastrear Pedido</span>
                </a>
              </li>
              <li>
                <Link href="/entregas" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                  <span>Rede de Entregas</span>
                </Link>
              </li>
              <li>
                <a href="/responsavel-tecnico" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                  <span>Responsável Técnico (Gustavo Cordeiro)</span>
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
                  {identity.address_street}, {identity.address_neighborhood}<br />
                  {identity.address_city} - {identity.address_state} · CEP {identity.address_postal_code}
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
                    href={`https://wa.me/${cleanWhatsAppNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 transition-colors font-medium text-emerald-400"
                  >
                    {identity.phone_whatsapp}
                  </a>
                </p>
              </div>
              <p className="flex items-start gap-2">
                <Clock size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <span>
                  {hours || identity.business_hours}
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
              <p className="text-[11px] text-slate-400 font-mono">
                CNPJ: {cnpj || identity.cnpj || "54.892.147/0001-30"}
              </p>
              <p className="text-[10px] text-slate-500">
                {address || "Araçatuba-SP · Laboratório Óptico & Técnico Responsável"}
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/politica-de-privacidade"
                  className="text-left hover:text-amber-300 transition-colors underline-offset-4 hover:underline text-xs"
                >
                  Política de Privacidade (LGPD)
                </Link>
                <Link
                  href="/termos-de-uso"
                  className="text-left hover:text-amber-300 transition-colors underline-offset-4 hover:underline text-xs"
                >
                  Termos de Uso &amp; Garantia (CDC)
                </Link>
                <Link
                  href="/politica-de-reembolso"
                  className="text-left hover:text-amber-300 transition-colors underline-offset-4 hover:underline text-xs"
                >
                  Política de Trocas &amp; Reembolso
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco: Formas de Pagamento Aceitas & Selo Mercado Pago */}
        {paymentMethods?.show_footer_block && (
          <div
            data-testid="footer-payment-methods"
            className="py-6 sm:py-8 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-5"
          >
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {paymentMethods.block_title || "Formas de Pagamento"}
              </span>
              <div
                className="flex flex-wrap items-center justify-center gap-2"
                aria-label="Bandeiras e métodos de pagamento aceitos"
              >
                {paymentMethods.methods
                  ?.filter((m) => m.is_active)
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((method) => (
                    <div
                      key={method.id}
                      data-testid={`payment-badge-${method.id}`}
                      className="inline-flex items-center justify-center p-1 rounded-lg bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors shadow-sm"
                      title={method.name}
                    >
                      <Image
                        src={method.icon_path}
                        alt={method.alt_text || method.name}
                        width={38}
                        height={24}
                        className="h-6 w-auto object-contain brightness-95 opacity-80 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ))}
              </div>
            </div>

            {/* Selo Pagamento Seguro com Mercado Pago */}
            {paymentMethods.show_secure_badge && (
              <div
                data-testid="footer-secure-badge"
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/10 hover:border-amber-400/30 transition-all text-slate-300"
              >
                <Image
                  src="/logos/mercadopago.svg"
                  alt="Mercado Pago"
                  width={20}
                  height={14}
                  className="h-3.5 w-auto object-contain"
                />
                <span className="text-xs font-medium text-slate-300">
                  {paymentMethods.secure_badge_text || "Pagamento seguro com Mercado Pago"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Rodapé inferior com Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4 text-center sm:text-left pr-14 sm:pr-0">
          <p>{copyright || `© ${currentYear} Ótica Ventara. Todos os direitos reservados.`}</p>
          <p className="text-[11px] text-slate-500">
            Rua Princesa Isabel, 221, Centro, Araçatuba-SP · Presença Digital &amp; Loja Física
          </p>
        </div>
      </div>
    </footer>
  );
}
