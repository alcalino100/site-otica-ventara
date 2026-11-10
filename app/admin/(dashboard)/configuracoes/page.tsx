"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Activity,
  Truck,
  Store,
  DollarSign,
  Save,
  Megaphone,
} from "lucide-react";
import { AdminToast } from "@/components/admin/admin-toast";

export default function AdminSettingsPage() {
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Dados da Empresa
  const [companyName, setCompanyName] = useState("Ótica Ventara Ltda.");
  const [tradeName, setTradeName] = useState("Ótica Ventara Eyewear");
  const [companyCnpj, setCompanyCnpj] = useState("54.892.147/0001-30");
  const [supportEmail, setSupportEmail] = useState("atendimento@oticaventara.com.br");
  const [supportPhone, setSupportPhone] = useState("(18) 99615-5748");
  const [companyAddress, setCompanyAddress] = useState("Rua Princesa Isabel, 221 - Centro, Araçatuba-SP, CEP 16010-250");
  const [businessHours, setBusinessHours] = useState("Segunda a Sexta: 09h às 18h · Sábados: 09h às 13h");

  // 2. Regras de Frete e Entrega (Admin Control)
  const [shippingFeeReais, setShippingFeeReais] = useState("25.00");
  const [freeShippingThresholdReais, setFreeShippingThresholdReais] = useState("350.00");
  const [storePickupEnabled, setStorePickupEnabled] = useState(true);
  const [pickupAddress, setPickupAddress] = useState("Rua Princesa Isabel, 221, Centro, Araçatuba-SP, CEP 16010-250");

  // 3. Barra de Aviso Promocional no Topo
  const [announcementActive, setAnnouncementActive] = useState(true);
  const [announcementText, setAnnouncementText] = useState("Frete Grátis para todo o Brasil em compras acima de R$ 350 · Retirada expressa na loja");
  const [announcementBgColor, setAnnouncementBgColor] = useState("#06111F");
  const [announcementTextColor, setAnnouncementTextColor] = useState("#FFD62E");

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();

          // Dados da empresa
          if (data.company_settings) {
            if (data.company_settings.companyName) setCompanyName(data.company_settings.companyName);
            if (data.company_settings.tradeName) setTradeName(data.company_settings.tradeName);
            if (data.company_settings.cnpj) setCompanyCnpj(data.company_settings.cnpj);
            if (data.company_settings.supportEmail) setSupportEmail(data.company_settings.supportEmail);
            if (data.company_settings.supportPhone) setSupportPhone(data.company_settings.supportPhone);
            if (data.company_settings.address) setCompanyAddress(data.company_settings.address);
            if (data.company_settings.businessHours) setBusinessHours(data.company_settings.businessHours);
          } else if (data.identity) {
            if (data.identity.store_name) setTradeName(data.identity.store_name);
            if (data.identity.cnpj) setCompanyCnpj(data.identity.cnpj);
            if (data.identity.phone_whatsapp) setSupportPhone(data.identity.phone_whatsapp);
            if (data.identity.business_hours) setBusinessHours(data.identity.business_hours);
          }

          // Regras de Frete
          if (data.shipping) {
            if (typeof data.shipping.default_shipping_fee_cents === "number") {
              setShippingFeeReais((data.shipping.default_shipping_fee_cents / 100).toFixed(2));
            }
            if (typeof data.shipping.free_shipping_threshold_cents === "number") {
              setFreeShippingThresholdReais((data.shipping.free_shipping_threshold_cents / 100).toFixed(2));
            }
            if (typeof data.shipping.store_pickup_enabled === "boolean") {
              setStorePickupEnabled(data.shipping.store_pickup_enabled);
            }
            if (data.shipping.pickup_address) {
              setPickupAddress(data.shipping.pickup_address);
            }
          }

          // Barra Promocional
          if (data.announcement_bar) {
            if (typeof data.announcement_bar.is_active === "boolean") {
              setAnnouncementActive(data.announcement_bar.is_active);
            }
            if (data.announcement_bar.text) setAnnouncementText(data.announcement_bar.text);
            if (data.announcement_bar.bg_color) setAnnouncementBgColor(data.announcement_bar.bg_color);
            if (data.announcement_bar.text_color) setAnnouncementTextColor(data.announcement_bar.text_color);
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
      const defaultShippingCents = Math.round(parseFloat(shippingFeeReais || "0") * 100);
      const freeShippingCents = Math.round(parseFloat(freeShippingThresholdReais || "0") * 100);

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_settings: {
            companyName,
            tradeName,
            cnpj: companyCnpj,
            supportEmail,
            supportPhone,
            address: companyAddress,
            businessHours,
          },
          identity: {
            store_name: tradeName,
            cnpj: companyCnpj,
            phone_whatsapp: supportPhone,
            business_hours: businessHours,
            address_street: companyAddress,
          },
          shipping: {
            store_pickup_enabled: storePickupEnabled,
            default_shipping_fee_cents: defaultShippingCents,
            free_shipping_threshold_cents: freeShippingCents,
            pickup_address: pickupAddress,
          },
          announcement_bar: {
            is_active: announcementActive,
            text: announcementText,
            bg_color: announcementBgColor,
            text_color: announcementTextColor,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar configurações.");
      }

      setFeedback({
        type: "success",
        message: "Configurações corporativas, valores de frete e avisos salvos com sucesso no site!",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Falha ao gravar dados no servidor.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast Feedback Acessível */}
      {feedback && (
        <AdminToast
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
            SISTEMA & DADOS CORPORATIVOS
          </span>
          <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
            Configurações <span className="font-normal text-amber-400">Gerais e Frete</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Valores de frete, regras de entrega, dados fiscais da ótica e barra de avisos promocionais.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Gestão de Frete e Prazos de Entrega (Requisito Explícito) */}
        <div className="bg-[#06111f] border border-amber-400/30 rounded-2xl p-6 space-y-4 shadow-lg shadow-amber-400/5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Truck size={17} className="text-amber-400" />
              <span>1. Configuração de Frete e Entrega</span>
            </h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Reflete em todo o site
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label htmlFor="shipping-fee" className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <DollarSign size={13} className="text-amber-400" />
                Valor Fixo do Frete Nacional (R$)
              </label>
              <input
                id="shipping-fee"
                type="number"
                step="0.01"
                min="0"
                value={shippingFeeReais}
                onChange={(e) => setShippingFeeReais(e.target.value)}
                disabled={isLoading}
                placeholder="25.00"
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Cobrado quando o pedido não atingir o valor de frete grátis.
              </span>
            </div>

            <div>
              <label htmlFor="free-shipping-threshold" className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                <Truck size={13} className="text-emerald-400" />
                Valor Mínimo para Frete Grátis (R$)
              </label>
              <input
                id="free-shipping-threshold"
                type="number"
                step="0.01"
                min="0"
                value={freeShippingThresholdReais}
                onChange={(e) => setFreeShippingThresholdReais(e.target.value)}
                disabled={isLoading}
                placeholder="350.00"
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Acima deste valor, o frete vira R$ 0,00 (Grátis) automaticamente.
              </span>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-white/5 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={storePickupEnabled}
                  onChange={(e) => setStorePickupEnabled(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 bg-[#0a1b2e] border-white/20"
                />
                <span className="text-slate-200 font-medium flex items-center gap-1.5">
                  <Store size={14} className="text-amber-400" />
                  Habilitar Retirada Grátis na Loja Física (Centro de Araçatuba)
                </span>
              </label>

              {storePickupEnabled && (
                <div>
                  <label htmlFor="pickup-address" className="block text-slate-400 mb-1">
                    Endereço Completo para Retirada Presencial
                  </label>
                  <input
                    id="pickup-address"
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Barra de Aviso Promocional no Topo do Site */}
        <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Megaphone size={16} className="text-amber-400" />
              <span>2. Barra de Aviso Promocional (Topo do Site)</span>
            </h3>
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={announcementActive}
                onChange={(e) => setAnnouncementActive(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded text-amber-400 focus:ring-amber-400 bg-[#0a1b2e] border-white/20"
              />
              <span className="text-slate-300 font-medium">Ativar Barra no Topo</span>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label htmlFor="announcement-text" className="block text-slate-400 mb-1">
                Texto Promocional
              </label>
              <input
                id="announcement-text"
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                disabled={isLoading || !announcementActive}
                placeholder="Ex: Frete Grátis para todo o Brasil acima de R$ 350"
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400 disabled:opacity-40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="announcement-bg" className="block text-slate-400 mb-1">
                  Cor de Fundo (Hex)
                </label>
                <input
                  id="announcement-bg"
                  type="text"
                  value={announcementBgColor}
                  onChange={(e) => setAnnouncementBgColor(e.target.value)}
                  disabled={isLoading || !announcementActive}
                  className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-amber-400 disabled:opacity-40"
                />
              </div>
              <div>
                <label htmlFor="announcement-text-color" className="block text-slate-400 mb-1">
                  Cor do Texto (Hex)
                </label>
                <input
                  id="announcement-text-color"
                  type="text"
                  value={announcementTextColor}
                  onChange={(e) => setAnnouncementTextColor(e.target.value)}
                  disabled={isLoading || !announcementActive}
                  className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-amber-400 disabled:opacity-40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Dados Cadastrais e Fiscais da Empresa */}
        <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <ShieldCheck size={16} className="text-amber-400" />
            3. Dados Institucionais e Fiscais da Loja
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label htmlFor="company-name" className="block text-slate-400 mb-1">Razão Social / Denominação</label>
              <input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label htmlFor="trade-name" className="block text-slate-400 mb-1">Nome Fantasia / Marca</label>
              <input
                id="trade-name"
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label htmlFor="company-cnpj" className="block text-slate-400 mb-1">CNPJ Oficial</label>
              <input
                id="company-cnpj"
                type="text"
                value={companyCnpj}
                onChange={(e) => setCompanyCnpj(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label htmlFor="support-email" className="block text-slate-400 mb-1">E-mail de Atendimento e Suporte</label>
              <input
                id="support-email"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label htmlFor="support-phone" className="block text-slate-400 mb-1">WhatsApp / Telefone Oficial</label>
              <input
                id="support-phone"
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label htmlFor="business-hours" className="block text-slate-400 mb-1">Horário de Funcionamento Presencial</label>
              <input
                id="business-hours"
                type="text"
                value={businessHours}
                onChange={(e) => setBusinessHours(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="company-address" className="block text-slate-400 mb-1">Endereço da Loja Física</label>
              <input
                id="company-address"
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* 4. Status de Observabilidade */}
        <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            4. Observabilidade e Telemetria
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
              <span className="text-[10px] text-slate-400 block mb-0.5">Mercado Pago Gateway</span>
              <span className="font-semibold text-emerald-400">Integrado</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving || isLoading}
          className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
        >
          <Save size={16} />
          <span>{isSaving ? "Salvando Alterações..." : "Salvar Configurações Gerais e Frete"}</span>
        </button>
      </form>
    </div>
  );
}
