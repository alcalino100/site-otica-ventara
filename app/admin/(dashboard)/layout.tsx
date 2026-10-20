import React from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Painel Administrativo | Ótica Ventara",
  robots: { index: false, follow: false },
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030c13] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      <AdminHeader />
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-8 lg:px-10 py-8 sm:py-10">
        {children}
      </main>
      <footer className="border-t border-white/5 py-6 bg-[#02070c] text-xs text-slate-400">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">Ótica Ventara</span>
            <span className="text-slate-600">·</span>
            <span>Central Administrativa & E-commerce</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck size={14} className="text-amber-400" />
            <span>Ambiente Operacional Seguro · Araçatuba-SP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
