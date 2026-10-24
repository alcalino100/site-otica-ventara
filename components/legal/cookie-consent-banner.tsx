"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, Check, X, Settings2 } from "lucide-react";

interface CookiePreferences {
  essential: boolean; // Sempre true
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ventara_cookie_consent");
      if (!saved) {
        // Exibe de forma suave após a renderização inicial
        const timer = setTimeout(() => setIsVisible(true), 300);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage bloqueado ou indisponível
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem("ventara_cookie_consent", JSON.stringify(prefs));
      window.dispatchEvent(
        new CustomEvent("ventara_cookie_consent_updated", { detail: prefs })
      );
    } catch {
      // Ignora erro de storage
    }
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent({ essential: true, analytics: true, marketing: true });
  };

  const handleAcceptEssentialOnly = () => {
    saveConsent({ essential: true, analytics: false, marketing: false });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Consentimento de Cookies e Privacidade"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-[#0b1c2e]/95 backdrop-blur-md border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-200">
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Cookie size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Privacidade e Cookies</span>
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                LGPD
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Utilizamos cookies essenciais para garantir o funcionamento seguro do catálogo e cookies opcionais para medir o desempenho de forma anônima.
            </p>
          </div>
        </div>

        {/* Painel de Preferências Detalhadas (Toggle) */}
        {showDetails && (
          <div className="my-3 pt-3 border-t border-white/10 space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <div>
                <p className="font-semibold text-white">Cookies Essenciais</p>
                <p className="text-[11px] text-slate-400">Navegação segura e carrinho.</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                Sempre Ativo
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <div>
                <p className="font-semibold text-white">Cookies de Estatísticas (Google Analytics)</p>
                <p className="text-[11px] text-slate-400">Métricas anônimas sem identificar o usuário.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) =>
                  setPreferences({ ...preferences, analytics: e.target.checked })
                }
                className="w-4 h-4 rounded accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1 text-slate-300 hover:text-white underline underline-offset-2 cursor-pointer"
          >
            <Settings2 size={12} />
            <span>{showDetails ? "Ocultar preferências" : "Gerenciar cookies"}</span>
          </button>

          <Link
            href="/politica-de-privacidade"
            className="hover:text-amber-300 transition-colors"
          >
            Política de Privacidade
          </Link>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {showDetails ? (
            <button
              type="button"
              onClick={handleSaveCustom}
              className="col-span-2 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Salvar Minhas Preferências
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAcceptEssentialOnly}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs tracking-wide transition-all"
              >
                Apenas Essenciais
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md"
              >
                Aceitar Todos
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CookieConsentBanner;
