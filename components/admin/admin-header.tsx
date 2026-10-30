"use client";

import React, { useState, useEffect } from "react";
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
  Shield,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Eye,
  Radio,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { createClient } from "../../lib/supabase/client";

interface AdminUserSession {
  email: string;
  name: string;
  role: "super_admin" | "admin" | "editor";
}

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUserSession | null>(null);

  useEffect(() => {
    async function loadCurrentAdmin() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && user.email) {
          const { data: profile } = await supabase
            .from("admin_profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          const isDev = user.email === "garciaguilherme27@gmail.com";
          const role = isDev ? "super_admin" : (profile?.role || "super_admin");
          const name =
            profile?.full_name ||
            (isDev ? "Guilherme Garcia (Dev)" : user.user_metadata?.full_name || user.email.split("@")[0]);

          setCurrentUser({
            email: user.email,
            name,
            role,
          });
        } else {
          // Fallback para sessão local ou Dev por padrão
          setCurrentUser({
            email: "garciaguilherme27@gmail.com",
            name: "Guilherme Garcia (Dev)",
            role: "super_admin",
          });
        }
      } catch (err) {
        console.error("Erro ao identificar operador admin:", err);
      }
    }

    loadCurrentAdmin();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      document.cookie = "ventara_admin_user=; path=/; max-age=0";
    } catch {
      // Ignora erro
    }
    router.push("/admin/login");
    router.refresh();
  };

  const allNavModules = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, minRole: "editor" },
    { href: "/admin/metricas", label: "Métricas & UTMs", icon: BarChart3, minRole: "admin" },
    { href: "/admin/identidade", label: "Identidade", icon: Palette, minRole: "super_admin" },
    { href: "/admin/banners", label: "Banners", icon: ImageIcon, minRole: "admin" },
    { href: "/admin/live", label: "Ao Vivo (Live)", icon: Radio, minRole: "editor" },
    { href: "/admin/promocoes/roleta", label: "Roleta Promocional", icon: Sparkles, minRole: "admin" },
    { href: "/admin/produtos", label: "Produtos", icon: Package, minRole: "editor" },
    { href: "/admin/lentes", label: "Lentes & Preços", icon: Eye, minRole: "editor" },
    { href: "/admin/categorias", label: "Categorias", icon: FolderTree, minRole: "admin" },
    { href: "/admin/estoque", label: "Estoque", icon: Boxes, minRole: "editor" },
    { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart, minRole: "editor" },
    { href: "/admin/pagamentos", label: "Pagamentos", icon: CreditCard, minRole: "admin" },
    { href: "/admin/entrega", label: "Entrega", icon: Truck, minRole: "admin" },
    { href: "/admin/configuracoes", label: "Geral", icon: Settings, minRole: "super_admin" },
    { href: "/admin/usuarios", label: "Usuários", icon: Users, minRole: "super_admin" },
  ];

  const visibleModules = allNavModules.filter((mod) => {
    if (!currentUser) return true;
    if (currentUser.role === "super_admin") return true;
    if (currentUser.role === "admin") return mod.minRole !== "super_admin";
    if (currentUser.role === "editor") return mod.minRole === "editor";
    return true;
  });

  const getRoleBadge = (role?: string) => {
    if (role === "super_admin") {
      return {
        label: "DEV • ACESSO TOTAL",
        classes: "bg-amber-400/20 text-amber-300 border-amber-400/40",
      };
    }
    if (role === "admin") {
      return {
        label: "GERÊNCIA • ADMIN",
        classes: "bg-blue-400/20 text-blue-300 border-blue-400/40",
      };
    }
    return {
      label: "OPERADOR • ATENDIMENTO",
      classes: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40",
    };
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <header className="border-b border-white/10 bg-[#040e17] text-white sticky top-0 z-50 backdrop-blur-md">
      {/* Top Header Bar */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 flex items-center justify-between h-16 sm:h-18">
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/admin" className="flex items-center gap-2.5 sm:gap-3 group">
            <BrandLogo size="sm" />
            <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/25">
              ADMIN
            </span>
          </Link>
        </div>

        {/* Informações do Usuário Autenticado & Ações */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser && (
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
              <div className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 text-xs font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                  {roleInfo.label}
                </span>
              </div>
            </div>
          )}

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
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors px-3 py-2 rounded-xl hover:bg-rose-500/10 border border-rose-500/20 active:scale-95 cursor-pointer"
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
      <div className="hidden lg:block border-t border-white/5 bg-[#02070d]/90 px-4 sm:px-8 lg:px-10">
        <div className="max-w-[1400px] mx-auto flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
          {visibleModules.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== "/admin" && pathname?.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex-shrink-0 ${
                  isActive
                    ? "bg-amber-400 text-[#02070d] font-bold shadow-xs"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                style={isActive ? { color: "#02070d" } : undefined}
              >
                <Icon size={14} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Gaveta de Navegação Mobile */}
      {isMobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#030912] p-4 space-y-2">
          {currentUser && (
            <div className="p-3 mb-2 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400">{currentUser.email}</p>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${roleInfo.classes}`}>
                {roleInfo.label}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {visibleModules.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href || (href !== "/admin" && pathname?.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-amber-400 text-[#02070d] font-bold"
                      : "text-slate-300 hover:text-white hover:bg-white/5 bg-white/[0.02]"
                  }`}
                  style={isActive ? { color: "#02070d" } : undefined}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10 flex gap-2">
            <Link
              href="/admin/produtos/novo"
              onClick={() => setIsMobileOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-amber-400 text-[#06111f] text-xs font-bold uppercase tracking-wider"
              style={{ color: "#06111f" }}
            >
              <Plus size={14} />
              <span>Novo Produto</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium"
            >
              <LogOut size={14} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default AdminHeader;
