import React from "react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <a href="#inicio" className="footer-logo">
          VENTARA<span>EYEWEAR</span>
        </a>
        <p className="footer-tagline">Um novo olhar para você. Ótica autoral em Araçatuba - SP.</p>
        <div className="footer-meta">
          <span>© {currentYear} Ótica Ventara · Todos os direitos reservados</span>
          <span className="footer-notice">PROTÓTIPO INSTITUCIONAL E CATÁLOGO INTERATIVO</span>
        </div>
      </div>
    </footer>
  );
}
