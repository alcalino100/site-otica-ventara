"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
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
  Plus,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
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
    { href: "/admin/metricas", label: "Métricas & UTMs", icon: BarChart3 },
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
    <header className="border-b border-white/10 bg-[#06111f] text-white sticky top-0 z-50 backdrop-blur-md">
      {/* Top Header Bar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 flex items-center justify-between h-16">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/admin" className="flex items-center gap-3 group">
            <BrandLogo size="sm" />
            <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25">
              ADMIN
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/produtos/novo"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm"
            style={{ color: "#06111f" }}
          >
            <Plus size={14} />
            <span>Novo Produto</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-xl hover:bg-white/5 border border-white/10 active:scale-95"
            title="Abrir a loja pública em nova aba"
          >
            <span>Ver Loja</span>
            <ExternalLink size={13} className="text-amber-400" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors px-3 py-2 rounded-xl hover:bg-rose-500/10 border border-rose-500/20 active:scale-95"
            title="Encerrar sessão administrativa"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline font-medium">Sair</span>
          </button>

          {/* Botão de Menu Mobile */}
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 active:scale-95"
            aria-label="Abrir menu de navegação"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Barra de Módulos (Desktop) */}
      <div className="hidden lg:block border-t border-white/5 bg-[#040c16]/90 px-4 sm:px-8 lg:px-10">
        <div className="max-w-[1400px] mx-auto flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
          {navModules.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== "/admin" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "bg-amber-400/15 text-amber-300 border border-amber-400/30 font-semibold"
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
          <div className="grid grid-cols-2 gap-1.5">
            {navModules.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || (href !== "/admin" && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-amber-400/15 text-amber-300 font-semibold border border-amber-400/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={15} className={isActive ? "text-amber-400" : "text-slate-400"} />
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
