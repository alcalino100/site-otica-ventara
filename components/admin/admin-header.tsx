"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Glasses,
  LayoutDashboard,
  Palette,
  Image as ImageIcon,
  Package,
  FolderTree,
  Boxes,
  ShoppingCart,
  CreditCard,
  Truck,
  Settings,
  Users,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Upload,
} from "lucide-react";
import { createClient } from "../../lib/supabase/client";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignora erro se não conectado
    }
    router.push("/admin/login");
  };

  const navModules = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/identidade", label: "Identidade", icon: Palette },
    { href: "/admin/banners", label: "Banners", icon: ImageIcon },
    { href: "/admin/produtos", label: "Produtos", icon: Package },
    { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
    { href: "/admin/estoque", label: "Estoque", icon: Boxes },
    { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
    { href: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard },
    { href: "/admin/entrega", label: "Entrega", icon: Truck },
    { href: "/admin/configuracoes", label: "Geral", icon: Settings },
    { href: "/admin/usuarios", label: "Usuários", icon: Users },
  ];

  return (
    <header className="border-b border-white/10 bg-[#06111f] text-white sticky top-0 z-50">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/admin" className="flex items-center gap-2 text-amber-400 font-bold tracking-wider">
            <Glasses size={22} />
            <span className="text-white text-sm sm:text-base">
              VENTARA <span className="text-[11px] text-amber-400 font-semibold ml-1 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">ADMIN</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/produtos/novo"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#06111f] text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <span>+ Novo Produto</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-300 transition-colors px-2.5 py-1.5 rounded-md hover:bg-white/5 border border-white/10"
            title="Abrir a loja em nova aba"
          >
            <span>Ver Loja</span>
            <ExternalLink size={13} />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors px-2.5 py-1.5 rounded-md hover:bg-red-500/10"
            title="Encerrar sessão administrativa"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sair</span>
          </button>

          {/* Botão de Menu Mobile */}
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
            aria-label="Abrir menu de navegação"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Barra de Módulos (Desktop) */}
      <div className="hidden lg:block border-t border-white/5 bg-[#040c16] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {navModules.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={14} className={isActive ? "text-amber-400" : "text-slate-400"} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Drawer Mobile */}
      {isMobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#040c16] px-4 py-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 py-1">
            Módulos da Central Administrativa
          </p>
          <div className="grid grid-cols-2 gap-1">
            {navModules.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/admin" && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-amber-400/15 text-amber-300 font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
