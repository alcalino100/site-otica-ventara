"use client";

import React, { useState } from "react";
import { Glasses, Search, ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
    ["Início", "inicio"],
    ["Sobre nós", "sobre"],
    ["Armações", "armacoes"],
    ["Lentes", "lentes"],
    ["FAQ", "duvidas"],
    ["Contato", "contato"],
  ];

  return (
    <header className="site-header">
      <a href="#inicio" className="brand" aria-label="Ótica Ventara, ir para o início">
        <Glasses className="text-amber-300" />
        <span>
          <small>ÓTICA</small>VENTARA<em>EYEWEAR</em>
        </span>
      </a>

      {/* Desktop Navigation */}
      <nav className="nav hidden md:flex" aria-label="Navegação principal">
        {navItems.map(([title, id]) => (
          <a key={id} href={`#${id}`} className="nav-link">
            {title}
          </a>
        ))}
      </nav>

      {/* Header Actions */}
      <div className="header-actions">
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
          <Search size={19} />
        </button>

        <button
          type="button"
          aria-label={`Abrir seleção, ${cartCount} itens`}
          className="action-btn relative"
          onClick={onOpenCart}
          title="Ver seleção de armações"
        >
          <ShoppingBag size={19} />
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
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            className="mobile-nav-panel md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            {navItems.map(([title, id]) => (
              <a
                key={id}
                href={`#${id}`}
                className="mobile-nav-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                {title}
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
