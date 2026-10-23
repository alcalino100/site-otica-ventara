"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { createClient } from "@/lib/supabase/client";

interface AccessPreset {
  label: string;
  roleBadge: string;
  badgeClass: string;
  email: string;
  pass: string;
  desc: string;
}

const ACCESS_PRESETS: AccessPreset[] = [
  {
    label: "Guilherme Garcia (Dev)",
    roleBadge: "Acesso Total Dev",
    badgeClass: "bg-amber-400/20 text-amber-300 border-amber-400/40",
    email: "garciaguilherme27@gmail.com",
    pass: "Guilherme1412@",
    desc: "Acesso irrestrito a todos os módulos, banco de dados e configurações",
  },
  {
    label: "Diretoria Ventara",
    roleBadge: "Super Admin",
    badgeClass: "bg-purple-400/20 text-purple-300 border-purple-400/40",
    email: "admin@oticasventara.com.br",
    pass: "Ventara@Master2026!",
    desc: "Gestão executiva, identidade visual, métricas financeiras e equipe",
  },
  {
    label: "Carlos Eduardo (Gerente)",
    roleBadge: "Admin / Gerência",
    badgeClass: "bg-blue-400/20 text-blue-300 border-blue-400/40",
    email: "gerencia@oticasventara.com.br",
    pass: "GerenciaVentara2026!",
    desc: "Gestão de armações, pedidos, controle de estoque e reposição",
  },
  {
    label: "Juliana Silva (Atendimento)",
    roleBadge: "Operador / Loja",
    badgeClass: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40",
    email: "atendimento@oticasventara.com.br",
    pass: "AtendimentoVentara2026!",
    desc: "Consulta de pedidos, expedição e conferência de receitas",
  },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("garciaguilherme27@gmail.com");
  const [password, setPassword] = useState("Guilherme1412@");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("invalid")
        ) {
          setErrorMessage(
            "E-mail ou senha incorretos. Por favor, verifique as credenciais digitadas."
          );
        } else if (error.message.includes("Email not confirmed")) {
          setErrorMessage("Este e-mail ainda não foi confirmado no sistema.");
        } else {
          setErrorMessage(`Falha na autenticação: ${error.message}`);
        }
        setIsLoading(false);
        return;
      }

      if (data.session) {
        setSuccessMessage("Acesso autorizado com sucesso! Redirecionando...");
        // Define cookie indicativo para sessões rápidas
        document.cookie = `ventara_admin_user=${encodeURIComponent(cleanEmail)}; path=/; max-age=86400; SameSite=Lax`;
        
        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 600);
      } else {
        router.push("/admin");
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("Erro de conexão com o servidor. Tente novamente em instantes.");
      setIsLoading(false);
    }
  };

  const applyPreset = (preset: AccessPreset) => {
    setEmail(preset.email);
    setPassword(preset.pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#02070D] text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-amber-400 selection:text-slate-950">
      {/* Luzes ambiente de fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#0756b8]/15 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#FFD62E]/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="w-full max-w-lg bg-[#05111d]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10">
        {/* Cabeçalho com a Logo Oficial da Ótica Ventara */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <BrandLogo size="md" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold tracking-widest uppercase mb-2">
            <ShieldCheck size={13} className="text-[#FFD62E]" />
            <span>PAINEL ADMINISTRATIVO & E-COMMERCE</span>
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-sm mx-auto">
            Acesso restrito para equipe técnica, gestão e desenvolvimento da Óticas Ventara Eyewear.
          </p>
        </div>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mensagem de Sucesso */}
        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              E-mail Autorizado
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@oticaventara.com.br"
                className="w-full bg-[#030911] border border-white/15 focus:border-[#FFD62E] focus:ring-1 focus:ring-[#FFD62E] rounded-xl px-4 py-3.5 pl-11 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
              />
              <Mail size={16} className="absolute left-3.5 top-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Senha de Acesso
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#030911] border border-white/15 focus:border-[#FFD62E] focus:ring-1 focus:ring-[#FFD62E] rounded-xl px-4 py-3.5 pl-11 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
              />
              <Lock size={16} className="absolute left-3.5 top-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#FFD62E] hover:bg-[#ffe052] active:scale-98 text-[#02070D] font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-amber-400/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            style={{ color: "#02070D" }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Validando Credenciais no Servidor...</span>
              </span>
            ) : (
              <>
                <span>Entrar no Painel</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {/* Níveis de Acesso Reais e Atalhos de Teste */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound size={13} className="text-amber-400" />
              Níveis de Acesso Cadastrados:
            </span>
            <span className="text-[10px] text-slate-500">Clique para alternar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ACCESS_PRESETS.map((preset) => {
              const isCurrent = email.toLowerCase() === preset.email.toLowerCase();
              return (
                <button
                  key={preset.email}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`text-left p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                    isCurrent
                      ? "bg-amber-400/10 border-amber-400/50 shadow-sm"
                      : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-semibold text-white truncate text-[11px]">
                      {preset.label}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${preset.badgeClass}`}
                    >
                      {preset.roleBadge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{preset.email}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rodapé da tela de login */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Voltar para a vitrine pública</span>
          </a>
        </div>
      </div>
    </div>
  );
}
