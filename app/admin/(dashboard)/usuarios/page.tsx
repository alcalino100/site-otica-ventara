"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Shield,
  UserPlus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Trash2,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Search,
  AlertCircle,
  RefreshCw,
  X,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { AdminProfile } from "@/types/ecommerce";

function generateSecurePassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Ventara@${random}`;
}

const ROLE_CONFIG: Record<
  AdminProfile["role"],
  {
    label: string;
    icon: any;
    badgeClass: string;
    description: string;
  }
> = {
  super_admin: {
    label: "Super Admin",
    icon: Shield,
    badgeClass:
      "bg-amber-400/15 text-amber-300 border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.15)]",
    description: "Acesso total: finanças, catálogo, equipe e configurações",
  },
  admin: {
    label: "Admin / Gerente",
    icon: ShieldCheck,
    badgeClass:
      "bg-blue-400/15 text-blue-300 border-blue-400/30 shadow-[0_0_12px_rgba(96,165,250,0.15)]",
    description: "Gestão de armações, pedidos, estoque e vitrines",
  },
  editor: {
    label: "Editor / Operador",
    icon: Users,
    badgeClass: "bg-slate-400/15 text-slate-300 border-slate-400/30",
    description: "Cadastro de armações, fotos e descrições técnicas",
  },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] =
    useState<AdminProfile | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    full_name: string;
    email: string;
    role: AdminProfile["role"];
    password: string;
  }>({
    full_name: "",
    email: "",
    role: "admin",
    password: generateSecurePassword(),
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Feedback banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (err) {
      console.warn("Aviso ao carregar operadores:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      full_name: "",
      email: "",
      role: "admin",
      password: generateSecurePassword(),
    });
    setFormError(null);
    setCopiedPassword(false);
    setIsAddModalOpen(true);
  };

  const handleCopyPassword = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(formData.password);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao cadastrar operador.");
      }

      setUsers((prev) => [
        data.user,
        ...prev.filter((u) => u.id !== data.user.id),
      ]);
      setIsAddModalOpen(false);
      setFeedback({
        type: "success",
        text: `Operador ${data.user.full_name || data.user.email} adicionado com sucesso!`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: AdminProfile) => {
    setIsDeletingId(user.id);
    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao excluir usuário.");
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setDeleteConfirmUser(null);
      setFeedback({
        type: "success",
        text: `Usuário ${user.full_name || user.email} removido permanentemente.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Não foi possível excluir o usuário.",
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleUpdateRole = async (
    userId: string,
    newRole: AdminProfile["role"]
  ) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar permissão.");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setFeedback({
        type: "success",
        text: "Nível de permissão atualizado com sucesso!",
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Erro ao alterar nível de acesso.",
      });
    }
  };

  // Filtragem dos usuários
  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.full_name &&
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesQuery && matchesRole;
  });

  const superAdminsCount = users.filter((u) => u.role === "super_admin").length;
  const adminsCount = users.filter((u) => u.role === "admin").length;
  const editorsCount = users.filter((u) => u.role === "editor").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Toast Feedback */}
      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/80 border-red-500/30 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-white/60 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header com Ação Rápida */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
            EQUIPE & SEGURANÇA
          </span>
          <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
            Usuários e{" "}
            <span className="font-normal text-amber-400">
              Permissões de Acesso (RBAC)
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Adicione e remova operadores, atribua cargos e controle quem gerencia a
            Óticas Ventara.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            title="Recarregar lista"
            className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-semibold text-xs tracking-wide shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all transform active:scale-95"
          >
            <UserPlus size={16} />
            <span>Adicionar Novo Usuário</span>
          </button>
        </div>
      </div>

      {/* Estatísticas Rápidas de Operadores */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#06111f] border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total de Usuários
            </p>
            <p className="text-xl font-bold text-white mt-0.5">
              {users.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300 border border-white/10">
            <Users size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#06111f] border border-amber-400/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              Super Admins
            </p>
            <p className="text-xl font-bold text-amber-300 mt-0.5">
              {superAdminsCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 border border-amber-400/20">
            <Shield size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#06111f] border border-blue-400/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
              Admins / Gerentes
            </p>
            <p className="text-xl font-bold text-blue-300 mt-0.5">
              {adminsCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400 border border-blue-400/20">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#06111f] border border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Editores
            </p>
            <p className="text-xl font-bold text-slate-200 mt-0.5">
              {editorsCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/10">
            <UserCheck size={18} />
          </div>
        </div>
      </div>

      {/* Regras e Níveis de Acesso */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#06111f] border border-white/10 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <Shield size={15} /> Super Admin
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Acesso total ao sistema: criação de produtos, aprovação de pedidos,
            configurações financeiras e gestão de usuários.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#06111f] border border-white/10 space-y-1.5">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
            <ShieldCheck size={15} /> Admin
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Gerenciamento de catálogo, atualização de status de pedidos,
            controle de estoque e edição de banners.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#06111f] border border-white/10 space-y-1.5">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs uppercase tracking-wider">
            <Users size={15} /> Editor
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Criação de novos modelos, atualização de fotos de armações e
            preenchimento de descrições técnicas.
          </p>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="Buscar operador por nome ou e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#06111f] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#06111f] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-amber-400/50 cursor-pointer"
          >
            <option value="all">Todos os Níveis</option>
            <option value="super_admin">Super Admins</option>
            <option value="admin">Admins</option>
            <option value="editor">Editores</option>
          </select>
        </div>
      </div>

      {/* Lista de Operadores Cadastrados */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Operadores Autorizados</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
              {filteredUsers.length}
            </span>
          </h3>
        </div>

        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw
              size={24}
              className="animate-spin text-amber-400 mx-auto"
            />
            <p className="text-xs text-slate-400">
              Sincronizando usuários com o banco de dados...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <Users size={32} className="mx-auto text-slate-500" />
            <p className="text-xs font-medium text-white">
              {searchQuery || roleFilter !== "all"
                ? "Nenhum operador corresponde aos filtros aplicados."
                : "Nenhum usuário cadastrado no momento."}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold hover:bg-amber-400/30 transition-colors"
            >
              <UserPlus size={14} /> Cadastrar primeiro operador
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-white/10 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#040c16] text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Operador</th>
                  <th className="py-3 px-4">E-mail de Acesso</th>
                  <th className="py-3 px-4">Nível de Permissão</th>
                  <th className="py-3 px-4">Cadastro</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => {
                  const roleMeta = ROLE_CONFIG[u.role] || ROLE_CONFIG.editor;
                  const initials = (u.full_name || u.email)
                    .split(" ")
                    .slice(0, 2)
                    .map((s) => s[0]?.toUpperCase())
                    .join("");

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400/20 to-blue-400/20 border border-white/10 flex items-center justify-center font-bold text-white text-[11px]">
                            {initials || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {u.full_name || "Operador"}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              ID: {u.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 font-mono">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleUpdateRole(
                                u.id,
                                e.target.value as AdminProfile["role"]
                              )
                            }
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer bg-[#06111f] focus:outline-none focus:ring-1 focus:ring-amber-400/50 ${roleMeta.badgeClass}`}
                          >
                            <option value="super_admin">👑 Super Admin</option>
                            <option value="admin">🛡️ Admin</option>
                            <option value="editor">✏️ Editor</option>
                          </select>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {new Date(u.created_at).toLocaleDateString("pt-BR")}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setDeleteConfirmUser(u)}
                          disabled={isDeletingId === u.id}
                          title="Remover usuário permanentemente"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          <span className="text-[11px] font-medium">
                            {isDeletingId === u.id ? "Removendo..." : "Remover"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Adicionar Novo Usuário */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#06111f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#040c16]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  <UserPlus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Adicionar Novo Operador
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Crie credenciais e defina o nível de acesso à administração.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-red-400" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nome */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Mendes"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full bg-[#02070d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50"
                />
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  E-mail Corporativo / Login
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: carlos@oticasventara.com.br"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-[#02070d] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50"
                />
              </div>

              {/* Nível de Acesso (RBAC) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nível de Permissão
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      {
                        id: "super_admin",
                        name: "Super Admin",
                        icon: Shield,
                        desc: "Acesso total",
                      },
                      {
                        id: "admin",
                        name: "Admin",
                        icon: ShieldCheck,
                        desc: "Gerente",
                      },
                      {
                        id: "editor",
                        name: "Editor",
                        icon: Users,
                        desc: "Catálogo",
                      },
                    ] as const
                  ).map((lvl) => {
                    const isSelected = formData.role === lvl.id;
                    const Icon = lvl.icon;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, role: lvl.id })
                        }
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-amber-400/10 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                            : "bg-[#02070d] border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-xs">
                          <Icon size={14} />
                          <span>{lvl.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {lvl.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Senha Inicial */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                    Senha Inicial de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        password: generateSecurePassword(),
                      })
                    }
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                  >
                    <Sparkles size={11} /> Gerar nova senha
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full bg-[#02070d] border border-white/10 rounded-xl pl-3.5 pr-20 py-2.5 text-xs text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 hover:text-white transition-colors"
                      title={showPassword ? "Ocultar" : "Mostrar"}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="p-1 hover:text-white transition-colors"
                      title="Copiar senha"
                    >
                      {copiedPassword ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  O operador poderá alterar esta senha no primeiro login.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-semibold text-xs tracking-wide shadow-[0_0_15px_rgba(251,191,36,0.25)] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Cadastrando...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>Cadastrar Operador</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Exclusão de Usuário */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#06111f] border border-red-500/30 rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <Trash2 size={20} />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">
                Remover Operador do Sistema
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tem certeza que deseja revogar o acesso e excluir permanentemente o
                perfil de{" "}
                <span className="font-semibold text-white">
                  {deleteConfirmUser.full_name || deleteConfirmUser.email}
                </span>{" "}
                (<span className="font-mono text-amber-300">{deleteConfirmUser.email}</span>)?
              </p>
              <p className="text-[11px] text-red-400/80">
                Esta ação cancelará imediatamente qualquer permissão de login no
                painel administrativo.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(deleteConfirmUser)}
                disabled={isDeletingId === deleteConfirmUser.id}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs tracking-wide shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all disabled:opacity-50"
              >
                {isDeletingId === deleteConfirmUser.id ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Confirmar e Excluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
