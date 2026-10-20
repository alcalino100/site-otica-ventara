"use client";

import React, { useState, useEffect } from "react";
import { Users, Shield, UserPlus, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminProfile } from "@/types/ecommerce";

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("admin_profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setUsers(data as AdminProfile[]);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.warn("Aviso ao carregar usuários administrativos:", err);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
            EQUIPE & SEGURANÇA
          </span>
          <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
            Usuários e <span className="font-normal text-amber-400">Permissões de Acesso (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle quem pode gerenciar o catálogo, estoque, pedidos e configurações da loja.
          </p>
        </div>
      </div>

      {/* Regras e Níveis de Acesso */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#06111f] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <Shield size={16} /> Super Admin
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Acesso total ao sistema: criação de produtos, aprovação de pedidos, configurações financeiras e gestão de usuários.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#06111f] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
            <ShieldCheck size={16} /> Admin
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Gerenciamento de catálogo, atualização de status de pedidos, controle de estoque e edição de banners.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#06111f] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs uppercase tracking-wider">
            <Users size={16} /> Editor
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Criação de novos modelos, atualização de fotos de armações e preenchimento de descrições técnicas.
          </p>
        </div>
      </div>

      {/* Lista de Operadores Cadastrados */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white">Operadores Autorizados</h3>

        {isLoading ? (
          <p className="text-xs text-slate-400 text-center py-6">Carregando usuários...</p>
        ) : users.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Users size={28} className="mx-auto text-slate-500" />
            <p className="text-xs font-medium text-white">
              Nenhum perfil listado no banco ou aguardando primeiro login administrativo via Supabase Auth.
            </p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Ao criar um usuário no Supabase Authentication, associe o ID na tabela <code>admin_profiles</code> com o papel correspondente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-white/10 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#040c16] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Nome / Operador</th>
                  <th className="py-2.5 px-3">E-mail</th>
                  <th className="py-2.5 px-3">Nível de Permissão</th>
                  <th className="py-2.5 px-3">Data de Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3 font-medium text-white">{u.full_name || "Operador"}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/20 text-[10px] font-semibold uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {new Date(u.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
