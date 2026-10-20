import React from "react";

interface FooterProps {
  onOpenLegal?: (tab: "terms" | "privacy") => void;
}

export function Footer({ onOpenLegal }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <a href="#inicio" className="footer-logo">
          VENTARA<span>EYEWEAR</span>
        </a>
        <p className="footer-tagline">Um novo olhar para você. Ótica autoral em Araçatuba - SP.</p>
        <div className="footer-meta">
          <div className="flex gap-4 text-xs text-slate-400 justify-end flex-wrap">
            <button
              type="button"
              onClick={() => onOpenLegal?.("privacy")}
              className="hover:text-amber-300 transition-colors underline-offset-4 hover:underline"
            >
              Política de Privacidade (LGPD)
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => onOpenLegal?.("terms")}
              className="hover:text-amber-300 transition-colors underline-offset-4 hover:underline"
            >
              Termos de Uso
            </button>
          </div>
          <span>© {currentYear} Ótica Ventara · Todos os direitos reservados</span>
          <span className="footer-notice">PROTÓTIPO INSTITUCIONAL E CATÁLOGO INTERATIVO</span>
        </div>
      </div>
    </footer>
  );
}
