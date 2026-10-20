"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Glasses, Package, FolderTree, ShoppingCart, ExternalLink, LogOut } from "lucide-react";
import { createClient } from "../../lib/supabase/client";

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignora erro se não conectado
    }
    router.push("/admin/login");
  };

  const navLinks = [
    { href: "/admin", label: "Produtos", icon: Package },
    { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
    { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  ];

  return (
    <header className="border-b border-white/10 bg-[#06121c] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 text-amber-400 font-bold tracking-wider">
            <Glasses size={24} />
            <span className="text-white text-sm sm:text-base">VENTARA <span className="text-xs text-amber-400/90 font-normal ml-1">ADMIN</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-amber-400/15 text-amber-300"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors px-2.5 py-1.5 rounded-md hover:bg-white/5"
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
        </div>
      </div>
    </header>
  );
}
