"use client";

import React, { useState } from "react";
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Copy,
  Check,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const [selectedGateway, setSelectedGateway] = useState<"asaas" | "mercadopago" | "stripe">("asaas");
  const [environment, setEnvironment] = useState<"sandbox" | "production">("sandbox");
  const [copied, setCopied] = useState(false);

  const webhookUrl = "https://otica-ventara-murex.vercel.app/api/webhooks/payment";

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gateways = [
    {
      id: "asaas",
      name: "Asaas Pagamentos",
      badge: "Recomendado para Ótica",
      description:
        "Especialista brasileiro com conciliação instantânea de Pix via Webhook, emissão de boletos registrados e parcelamento no cartão sem complexidade.",
      status: "Pronto para Ativação",
      features: ["Pix com QR Code Dinâmico", "Notificação < 2 segundos", "Checkout Transparente", "Suporte a Split"],
    },
    {
      id: "mercadopago",
      name: "Mercado Pago",
      badge: "Alta Penetração",
      description:
        "Rede de pagamentos consolidada no Brasil com sistema antifraude avançado com base de dados nacional.",
      status: "Homologado",
      features: ["Pix e Cartões", "Antifraude Nativo", "Conta Digital Lojista", "Checkout Pro / API"],
    },
    {
      id: "stripe",
      name: "Stripe Brasil",
      badge: "Padrão Global",
      description:
        "Infraestrutura global de ponta com suporte a Pix e cartões nacionais e internacionais com machine learning Radar.",
      status: "Homologado",
      features: ["Melhor DX e APIs", "Stripe Radar Antifraude", "Pix com Expiração", "Relatórios Financeiros"],
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
            FINANCEIRO & TRANSAÇÕES
          </span>
          <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
            Configuração de <span className="font-normal text-amber-400">Gateways e Pagamentos</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Planejamento de integração, status dos ambientes de teste e recebimento de webhooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Ambiente Atual:</span>
          <span className="px-2.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-semibold uppercase">
            {environment === "sandbox" ? "Modo Sandbox (Testes)" : "Produção"}
          </span>
        </div>
      </div>

      {/* Aviso de Segurança PCI-DSS */}
      <div className="p-4 rounded-2xl bg-[#071626] border border-white/10 flex items-start gap-3">
        <Lock size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed space-y-1">
          <p className="font-semibold text-white">Política de Proteção de Credenciais e Segredos</p>
          <p>
            Chaves de API privadas (<code>PAYMENT_GATEWAY_API_KEY</code>) e segredos de assinatura (<code>PAYMENT_WEBHOOK_SECRET</code>) 
            são mantidos exclusivamente no servidor e variáveis de ambiente seguras da Vercel. 
            Em conformidade com as boas práticas, chaves secretas nunca são exibidas ou armazenadas no navegador.
          </p>
        </div>
      </div>

      {/* Webhook Endpoint */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" />
          Endpoint do Webhook de Pagamentos (Idempotente)
        </h3>
        <p className="text-xs text-slate-400">
          Cadastre esta URL no painel do seu gateway para confirmações instantâneas de Pix e cartão com assinatura HMAC-SHA256:
        </p>

        <div className="flex items-center gap-2 bg-[#040c16] border border-white/10 rounded-xl p-3">
          <code className="text-xs text-amber-300 font-mono flex-1 truncate">
            {webhookUrl}
          </code>
          <button
            type="button"
            onClick={handleCopyWebhook}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copiar URL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comparativo de Provedores Homologados */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">
          Provedores de Pagamento Compatíveis com o E-commerce
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gateways.map((gw) => {
            const isSelected = selectedGateway === gw.id;
            return (
              <div
                key={gw.id}
                onClick={() => setSelectedGateway(gw.id as any)}
                className={`p-6 rounded-2xl bg-[#06111f] border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-amber-400 shadow-xl shadow-amber-400/5 bg-[#091a2e]"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/15 text-amber-300">
                      {gw.badge}
                    </span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 size={13} /> {gw.status}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-white mb-2">{gw.name}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {gw.description}
                  </p>

                  <ul className="space-y-1.5 text-xs text-slate-400 border-t border-white/5 pt-3">
                    {gw.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check size={13} className="text-amber-400 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 mt-5 border-t border-white/5 text-center">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wider block py-2 rounded-xl transition-colors ${
                      isSelected
                        ? "bg-amber-400 text-[#06111f]"
                        : "bg-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    {isSelected ? "Provedor Selecionado" : "Selecionar"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
