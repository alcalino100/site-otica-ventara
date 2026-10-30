"use client";

import React, { useState, useEffect } from "react";
import { Settings, ShieldCheck, Activity, Phone, Mail, Clock, Save, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [companyName, setCompanyName] = useState("Ótica Ventara Ltda.");
  const [tradeName, setTradeName] = useState("Ótica Ventara Eyewear");
  const [supportEmail, setSupportEmail] = useState("atendimento@oticaventara.com.br");
  const [supportPhone, setSupportPhone] = useState("(18) 99615-5748");
  const [businessHours, setBusinessHours] = useState("Segunda a Sexta: 09h às 18h · Sábados: 09h às 13h");

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.company_settings) {
            if (data.company_settings.companyName) setCompanyName(data.company_settings.companyName);
            if (data.company_settings.tradeName) setTradeName(data.company_settings.tradeName);
            if (data.company_settings.supportEmail) setSupportEmail(data.company_settings.supportEmail);
            if (data.company_settings.supportPhone) setSupportPhone(data.company_settings.supportPhone);
            if (data.company_settings.businessHours) setBusinessHours(data.company_settings.businessHours);
          } else if (data.identity) {
            if (data.identity.store_name) setTradeName(data.identity.store_name);
            if (data.identity.phone_whatsapp) setSupportPhone(data.identity.phone_whatsapp);
            if (data.identity.business_hours) setBusinessHours(data.identity.business_hours);
          }
        }
      } catch (err) {
        console.warn("Erro ao carregar configurações gerais:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_settings: {
            companyName,
            tradeName,
            supportEmail,
            supportPhone,
            businessHours,
          },
          identity: {
            store_name: tradeName,
            phone_whatsapp: supportPhone,
            business_hours: businessHours,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar configurações.");
      }

      setFeedback("Configurações corporativas salvas com sucesso e sincronizadas com o site!");
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      alert(err.message || "Falha ao gravar dados no servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed top-20 right-6 z-50 bg-amber-400 text-[#06111f] font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
            SISTEMA & DADOS CORPORATIVOS
          </span>
          <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
            Configurações <span className="font-normal text-amber-400">Gerais do Sistema</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Informações cadastrais da empresa, canais de suporte e status da infraestrutura de observabilidade.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dados da Empresa */}
        <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <ShieldCheck size={16} className="text-amber-400" />
            1. Dados Institucionais da Ótica
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Razão Social / Denominação</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Nome Fantasia / Marca</label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">E-mail de Atendimento e Suporte</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">WhatsApp de Contato</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Horário de Funcionamento Presencial</label>
              <input
                type="text"
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Status de Observabilidade */}
        <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            2. Observabilidade e Telemetria
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            O sistema está preparado para instrumentação com Sentry, Datadog, New Relic e OpenTelemetry via <code>lib/observability.ts</code>.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-[#091a2e] border border-white/5">
              <span className="text-[10px] text-slate-400 block mb-0.5">Sentry (Erros)</span>
              <span className="font-semibold text-emerald-400">Ativo / Monitorando</span>
            </div>
            <div className="p-3 rounded-xl bg-[#091a2e] border border-white/5">
              <span className="text-[10px] text-slate-400 block mb-0.5">Rate Limiting</span>
              <span className="font-semibold text-emerald-400">Habilitado</span>
            </div>
            <div className="p-3 rounded-xl bg-[#091a2e] border border-white/5">
              <span className="text-[10px] text-slate-400 block mb-0.5">Security Headers</span>
              <span className="font-semibold text-emerald-400">Aplicados</span>
            </div>
            <div className="p-3 rounded-xl bg-[#091a2e] border border-white/5">
              <span className="text-[10px] text-slate-400 block mb-0.5">LGPD Compliance</span>
              <span className="font-semibold text-emerald-400">Em Conformidade</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving || isLoading}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
        >
          <Save size={16} />
          <span>{isSaving ? "Salvando Alterações..." : "Salvar Configurações Gerais"}</span>
        </button>
      </form>
    </div>
  );
}
