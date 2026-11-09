"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

/** Mapa de segmentos de URL para rótulos em PT-BR */
const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  produtos: "Produtos",
  novo: "Novo Produto",
  importar: "Importar CSV",
  lentes: "Lentes & Preços",
  categorias: "Categorias",
  estoque: "Estoque",
  pedidos: "Pedidos",
  pagamentos: "Pagamentos",
  entrega: "Entrega",
  banners: "Banners",
  live: "Ao Vivo",
  promocoes: "Promoções",
  roleta: "Roleta Promocional",
  identidade: "Identidade Visual",
  configuracoes: "Configurações Gerais",
  usuarios: "Usuários",
  metricas: "Métricas & UTMs",
};

/**
 * Breadcrumb acessível para o painel admin.
 * - nav aria-label="Localização atual"
 * - aria-current="page" no último item
 * - IDs dinâmicos (UUID no path) são exibidos como "Editar"
 */
export function AdminBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();

  if (!pathname) return null;

  const segments = pathname.split("/").filter(Boolean);

  // Monta os crumbs: [ { label, href } ]
  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    // UUIDs e IDs numéricos viram "Editar"
    const isId = /^[0-9a-f-]{8,}$/i.test(seg) || /^\d+$/.test(seg);
    const label = isId ? "Editar" : (SEGMENT_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1));
    return { label, href };
  });

  // Não exibe breadcrumb na raiz do admin
  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Localização atual" className={`flex items-center gap-1 text-xs text-slate-400 ${className ?? ""}`}>
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <React.Fragment key={crumb.href}>
            {idx > 0 && (
              <ChevronRight size={12} className="text-slate-600 shrink-0" aria-hidden="true" />
            )}
            {isLast ? (
              <span
                aria-current="page"
                className="text-slate-200 font-medium truncate max-w-[180px]"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-amber-400 transition-colors truncate max-w-[180px]"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
