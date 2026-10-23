"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/admin";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          setErrorMessage("E-mail ou senha incorretos. Acesso restrito a usuários autorizados.");
        } else if (error.message.includes("Email not confirmed")) {
          setErrorMessage("Este e-mail ainda não foi confirmado no sistema.");
        } else {
          setErrorMessage(`Falha na autenticação: ${error.message}`);
        }
        setIsLoading(false);
        return;
      }

      if (data.session) {
        setSuccessMessage("Acesso autorizado. Redirecionando para a central administrativa...");
        
        // Garante sincronização de sessão e cookies
        setTimeout(() => {
          router.push(redirectTarget);
          router.refresh();
        }, 500);
      } else {
        router.push(redirectTarget);
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage("Erro de conexão com o servidor de autenticação. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#05111d]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative z-10">
      {/* Cabeçalho com a Logo Oficial da Ótica Ventara */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-5">
          <BrandLogo size="md" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold tracking-widest uppercase mb-2">
          <ShieldCheck size={13} className="text-[#FFD62E]" />
          <span>PAINEL ADMINISTRATIVO</span>
        </div>

        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
          Área restrita. Informe suas credenciais corporativas autorizadas para acessar.
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

      {/* Formulário de Login Seguro */}
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
              autoComplete="email"
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
              className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
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
              autoComplete="current-password"
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
              <span>Validando Acesso Seguro...</span>
            </span>
          ) : (
            <>
              <span>Entrar no Painel</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      {/* Rodapé da tela de login */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Voltar para a vitrine pública</span>
        </a>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#02070D] text-white flex flex-col justify-start sm:justify-center items-center p-4 sm:p-6 py-10 sm:py-14 relative overflow-y-auto selection:bg-amber-400 selection:text-slate-950">
      {/* Luzes ambiente de fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#0756b8]/15 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#FFD62E]/10 blur-[140px] pointer-events-none rounded-full" />

      <Suspense fallback={<div className="text-xs text-slate-400">Carregando painel de segurança...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
