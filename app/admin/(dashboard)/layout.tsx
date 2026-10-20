import React from "react";
import { AdminHeader } from "@/components/admin/admin-header";

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
    <div className="min-h-screen bg-[#030c13] text-slate-100 flex flex-col font-sans">
      <AdminHeader />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
        Ótica Ventara · Gestão de Catálogo e E-commerce
      </footer>
    </div>
  );
}
