"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle, ArrowLeft, Shield } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(
          error.message === "Invalid login credentials"
            ? "E-mail ou senha inválidos. Por favor, verifique seus dados."
            : error.message
        );
        setIsLoading(false);
        return;
      }

      if (data.session) {
        router.push("/admin");
      }
    } catch (err: unknown) {
      setErrorMessage("Erro ao conectar ao servidor. Tente novamente em instantes.");
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030810] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-amber-400 selection:text-slate-950">
      {/* Luz ambiente editorial de fundo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#0756b8]/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-400/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md bg-[#081724]/90 backdrop-blur-md border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <BrandLogo size="md" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400 text-[10px] font-bold tracking-widest uppercase mb-2">
            <Shield size={12} />
            <span>ACESSO ADMINISTRATIVO</span>
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Insira suas credenciais autorizadas para gerenciar o catálogo, estoque e pedidos.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              E-mail Administrativo
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@oticaventara.com.br"
                className="w-full bg-[#040e17] border border-white/15 focus:border-amber-400 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#040e17] border border-white/15 focus:border-amber-400 rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-amber-400 hover:bg-amber-300 active:scale-95 text-[#030c13] font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-amber-400/10 disabled:opacity-50 disabled:pointer-events-none"
            style={{ color: "#030c13" }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Validando Acesso...</span>
              </span>
            ) : (
              <>
                <span>Entrar no Painel</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Voltar para a loja pública</span>
          </a>
        </div>
      </div>
    </div>
  );
}
