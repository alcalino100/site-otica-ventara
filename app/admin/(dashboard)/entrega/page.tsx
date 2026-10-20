"use client";

import React, { useState, useEffect } from "react";
import { Truck, MapPin, CheckCircle2, Save, Store, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SiteShippingSettings } from "@/types/ecommerce";

export default function AdminShippingPage() {
  const supabase = createClient();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const defaultShipping: SiteShippingSettings = {
    store_pickup_enabled: true,
    free_shipping_threshold_cents: 35000,
    default_shipping_fee_cents: 2500,
    pickup_address: "Rua Princesa Isabel, 221, Centro, Araçatuba-SP, CEP 16010-250",
  };

  const [settings, setSettings] = useState<SiteShippingSettings>(defaultShipping);

  useEffect(() => {
    async function loadShipping() {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "shipping")
          .maybeSingle();

        if (!error && data && data.value) {
          setSettings((prev) => ({ ...prev, ...(data.value as SiteShippingSettings) }));
        }
      } catch (err) {
        console.warn("Usando configurações locais de entrega:", err);
      }
    }

    loadShipping();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await supabase.from("site_settings").upsert({
        key: "shipping",
        description: "Regras de Frete e Retirada Presencial",
        value: settings,
        updated_at: new Date().toISOString(),
      });

      setFeedback("Configurações de entrega e retirada salvas com sucesso!");
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error(err);
      setFeedback("Erro ao gravar dados no Supabase.");
      setTimeout(() => setFeedback(null), 3000);
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
            LOGÍSTICA & FULFILLMENT
          </span>
          <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
            Entrega e <span className="font-normal text-amber-400">Retirada no Espaço Físico</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure o ponto de retirada presencial em Araçatuba e regras de frete para compras online.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Bloco 1: Retirada no Balcão */}
        <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Store size={16} className="text-amber-400" />
              1. Retirada Presencial na Loja
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-slate-400">Habilitar no Checkout</span>
              <input
                type="checkbox"
                checked={settings.store_pickup_enabled}
                onChange={(e) => setSettings({ ...settings, store_pickup_enabled: e.target.checked })}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Endereço Oficial de Retirada</label>
              <input
                type="text"
                value={settings.pickup_address}
                onChange={(e) => setSettings({ ...settings, pickup_address: e.target.value })}
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                O cliente não paga frete ao selecionar retirada presencial.
              </span>
            </div>
          </div>
        </div>

        {/* Bloco 2: Regras de Frete */}
        <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-white/5 pb-3">
            <Truck size={16} className="text-amber-400" />
            2. Regras de Frete em Domicílio
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Valor para Frete Grátis (R$)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={(settings.free_shipping_threshold_cents / 100).toFixed(2)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    free_shipping_threshold_cents: Math.round(parseFloat(e.target.value || "0") * 100),
                  })
                }
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Pedidos com subtotal igual ou superior a este valor recebem frete gratuito.
              </span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Taxa Padrão de Frete (R$)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={(settings.default_shipping_fee_cents / 100).toFixed(2)}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    default_shipping_fee_cents: Math.round(parseFloat(e.target.value || "0") * 100),
                  })
                }
                className="w-full bg-[#0a1b2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Cobrado para pedidos abaixo da faixa de frete grátis.
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#06111f] text-xs font-bold uppercase tracking-wider transition-all"
        >
          <Save size={16} />
          <span>{isSaving ? "Gravando no Banco..." : "Salvar Configurações de Frete"}</span>
        </button>
      </form>
    </div>
  );
}
