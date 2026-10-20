"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Glasses, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-[#030c13] text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#081724] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-400 mb-4 border border-amber-400/20">
            <Glasses size={32} />
          </div>
          <h1 className="text-xl font-bold tracking-wide">Ótica Ventara</h1>
          <p className="text-xs text-amber-400/90 tracking-widest uppercase mt-1">Acesso Administrativo</p>
          <p className="text-xs text-slate-400 mt-2">
            Insira suas credenciais autorizadas para gerenciar o catálogo e pedidos.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              E-mail Administrativo
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@oticaventara.com.br"
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3.5 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <Mail size={16} className="absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#040e17] border border-slate-700 rounded-lg px-3.5 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-[#030c13] font-semibold text-xs tracking-wider uppercase py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? "Validando Acesso..." : "Entrar no Painel"}
            {!isLoading && <ArrowRight size={15} />}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <a href="/" className="text-xs text-slate-400 hover:text-amber-300 transition-colors">
            ← Voltar para a loja pública
          </a>
        </div>
      </div>
    </div>
  );
}
