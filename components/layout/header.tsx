"use client";

import React, { useState } from "react";
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

  const navItems = [
    { title: "Início", id: "inicio", isActive: true },
    { title: "Sobre nós", id: "sobre-nos", isActive: false },
    { title: "Armações", id: "armacoes", isActive: false },
    { title: "Lentes", id: "lentes", isActive: false },
    { title: "Laboratório", id: "laboratorio", isActive: false },
    { title: "Contato", id: "contato", isActive: false },
  ];

  return (
    <header className="site-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
        <a href="#inicio" className="brand" aria-label="Ótica Ventara, ir para o início">
          <BrandLogo size="sm" />
        </a>

        {/* Desktop Navigation conforme Referência do Mockup */}
        <nav className="nav hidden md:flex items-center gap-7" aria-label="Navegação principal">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link text-xs font-semibold tracking-wider transition-colors relative py-1 ${
                item.isActive ? "text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              {item.title}
              {item.isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FFD62E] rounded-full" />
              )}
            </a>
          ))}
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            aria-label="Menu móvel"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="mobile-nav-link"
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
