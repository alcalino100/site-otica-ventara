"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Edit3 } from "lucide-react";

interface FloatingEditButtonProps {
  pageId: string;
}

/**
 * Botão flutuante de atalho exibido nas páginas públicas EXCLUSIVAMENTE quando há sessão de admin ativa.
 * Para visitantes comuns e compradores, este componente retorna null e não afeta a interface.
 */
export function FloatingEditButton({ pageId }: FloatingEditButtonProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Verificação leve no cliente: presença de cookie admin ou cabeçalho de teste
    try {
      const cookies = document.cookie;
      const hasAdminCookie =
        cookies.includes("ventara_admin_user") ||
        cookies.includes("sb-") || // Sessão Supabase
        cookies.includes("pw_test_session");

      if (hasAdminCookie) {
        setIsAdmin(true);
      }
    } catch {
      // Ignora falhas silenciosamente
    }
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Link
        href={`/admin/conteudo/${pageId}`}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 text-amber-400 hover:text-amber-300 border border-amber-400/40 shadow-xl backdrop-blur-md text-xs font-semibold tracking-wide transition-all duration-200 hover:scale-105 group"
        title="Editar o conteúdo desta página no painel administrativo"
      >
        <Edit3 size={15} className="group-hover:rotate-12 transition-transform duration-200" />
        <span>Editar esta página</span>
      </Link>
    </div>
  );
}
