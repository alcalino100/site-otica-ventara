"use client";

import React, { useState, useEffect } from "react";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BrandLogo } from "../ui/brand-logo";

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onToggleSearch: () => void;
  isSearchOpen: boolean;
}

export function Header({
  cartCount,
  onOpenCart,
  onToggleSearch,
  isSearchOpen,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Detecção dinâmica da seção visível para highlight elegante
      const sections = ["contato", "laboratorio", "lentes", "armacoes", "sobre-nos", "inicio"];
      const scrollPosition = window.scrollY + 140;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionId);
          break;
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { title: "Início", id: "inicio" },
    { title: "Sobre nós", id: "sobre-nos" },
    { title: "Armações", id: "armacoes" },
    { title: "Lentes", id: "lentes" },
    { title: "Laboratório", id: "laboratorio" },
    { title: "Contato", id: "contato" },
  ];

  return (
    <header className={`site-header ${isScrolled ? "scrolled" : ""}`}>
      {/* Top Announcement Bar com transição fluida */}
      <div
        className={`preview transition-all duration-300 overflow-hidden ${
          isScrolled
            ? "max-h-0 py-0 opacity-0 pointer-events-none border-transparent -mt-3 mb-0"
            : "max-h-8 py-1.5 opacity-100 -mt-3 mb-2.5"
        }`}
      >
        ÓTICAS VENTARA · ARAÇATUBA-SP · CATÁLOGO ONLINE &amp; ATENDIMENTO PERSONALIZADO
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 w-full flex items-center justify-between">
        <a href="#inicio" className="brand" aria-label="Ótica Ventara, ir para o início">
          <BrandLogo size="sm" />
        </a>

        {/* Desktop Navigation com Highlight Dinâmico e Glassmorphism */}
        <nav className="nav hidden md:flex items-center gap-7" aria-label="Navegação principal">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-link text-xs font-semibold tracking-wider transition-colors relative py-1 ${
                  isActive ? "text-white" : "text-slate-300 hover:text-white"
                }`}
              >
                {item.title}
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFD62E] rounded-full shadow-[0_0_8px_rgba(255,214,46,0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Header Actions: Busca, Carrinho e Mobile Menu */}
        <div className="header-actions flex items-center gap-2">
          <button
            type="button"
            aria-label="Buscar armações"
            className={`action-btn ${isSearchOpen ? "active" : ""}`}
            onClick={() => {
              onToggleSearch();
              document.getElementById("armacoes")?.scrollIntoView({ behavior: "smooth" });
            }}
            title="Buscar no catálogo"
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            aria-label={`Abrir seleção, ${cartCount} itens`}
            className="action-btn relative"
            onClick={onOpenCart}
            title="Ver seleção de armações"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <motion.b
                key={cartCount}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="count"
              >
                {cartCount}
              </motion.b>
            )}
          </button>

          <button
            type="button"
            className="menu-toggle md:hidden action-btn"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            className="mobile-nav-panel md:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            aria-label="Menu móvel"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`mobile-nav-link text-sm font-semibold tracking-wider transition-colors py-1 ${
                  activeSection === item.id ? "text-[#FFD62E]" : "text-slate-200"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.title}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
