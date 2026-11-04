"use client";

import React, { useState, useEffect } from "react";
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
  Eye,
  EyeOff,
  RefreshCw,
  Zap,
  Server,
  Sparkles,
  Layers,
  Save,
  Activity,
} from "lucide-react";
import Image from "next/image";
import { FooterPaymentSettings } from "@/types/shipping";
import { DEFAULT_FOOTER_PAYMENT_SETTINGS } from "@/lib/shipping-constants";
import { PaymentAuditPanel } from "@/components/admin/payment-audit-panel";

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Form State
  const [environment, setEnvironment] = useState<"sandbox" | "production">("production");
  const [accessToken, setAccessToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [hasExistingToken, setHasExistingToken] = useState(false);
  const [maskedToken, setMaskedToken] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("https://www.oticasventara.com.br/api/webhooks/payment");

  // Tab de Navegação Ativa
  const [activeTab, setActiveTab] = useState<"config" | "audit">("config");

  // Feedback states
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    user?: any;
  } | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Test PIX State
  const [generatingPix, setGeneratingPix] = useState(false);
  const [testPixResult, setTestPixResult] = useState<{
    success: boolean;
    pix: any;
    environment: string;
    isSandbox: boolean;
    warning: string | null;
  } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  const handleGenerateTestPix = async () => {
    // 1. Validação preventiva de credencial
    const tokenToUse = accessToken.trim() || (hasExistingToken ? "saved" : "");
    if (!tokenToUse) {
      setTestPixResult({
        success: false,
        pix: {
          errorMessage:
            "Nenhum Access Token configurado. Preencha o seu Access Token (iniciado por APP_USR-... ou TEST-...) no campo de credenciais acima e salve antes de gerar o Pix de teste.",
        },
        environment,
        isSandbox: environment === "sandbox",
        warning: null,
      });
      return;
    }

    // 2. Alerta preventivo se o usuário colar chave pública no campo de chave privada
    if (accessToken && accessToken.length < 30) {
      setTestPixResult({
        success: false,
        pix: {
          errorMessage:
            "A chave digitada parece ser uma Chave Pública ou está incompleta. O Access Token é uma chave privada longa obtida no Painel de Desenvolvedores do Mercado Pago (aba Credenciais de Produção ou Teste).",
        },
        environment,
        isSandbox: environment === "sandbox",
        warning: null,
      });
      return;
    }

    setGeneratingPix(true);
    setTestPixResult(null);
    try {
      const res = await fetch("/api/admin/payments/test-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_test_pix",
          access_token: accessToken.trim() || undefined,
        }),
      });
      const data = await res.json();
      setTestPixResult(data);
    } catch (err: any) {
      setTestPixResult({
        success: false,
        pix: {
          errorMessage: err.message || "Erro de rede ao conectar com o servidor.",
        },
        environment,
        isSandbox: environment === "sandbox",
        warning: null,
      });
    } finally {
      setGeneratingPix(false);
    }
  };

  const handleCopyPix = () => {
    if (testPixResult?.pix?.qrCode) {
      navigator.clipboard.writeText(testPixResult.pix.qrCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  // Footer Payment Methods State
  const [footerPayments, setFooterPayments] = useState<FooterPaymentSettings>(DEFAULT_FOOTER_PAYMENT_SETTINGS);
  const [savingFooter, setSavingFooter] = useState(false);
  const [footerSaveFeedback, setFooterSaveFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentSettings();
    fetchFooterPayments();
  }, []);

  const fetchFooterPayments = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.payment_methods) {
          setFooterPayments(data.payment_methods);
        }
      }
    } catch (err) {
      console.warn("Erro ao carregar formas de pagamento no rodapé:", err);
    }
  };

  const handleSaveFooterPayments = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFooter(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_methods: footerPayments }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao salvar formas de pagamento.");
      }
      setFooterSaveFeedback("Formas de pagamento e selos do rodapé atualizados com sucesso!");
      setTimeout(() => setFooterSaveFeedback(null), 3000);
    } catch (err: any) {
      setFooterSaveFeedback(err.message || "Erro ao salvar dados no servidor.");
      setTimeout(() => setFooterSaveFeedback(null), 3000);
    } finally {
      setSavingFooter(false);
    }
  };

  const toggleMethodActive = (methodId: string, isActive: boolean) => {
    setFooterPayments((prev) => ({
      ...prev,
      methods: prev.methods.map((m) =>
        m.id === methodId ? { ...m, is_active: isActive } : m
      ),
    }));
  };

  const fetchPaymentSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payments/config");
      if (res.ok) {
        const data = await res.json();
        setEnvironment(data.environment || "production");
        setPublicKey(data.mercadopago_public_key || "");
        setHasExistingToken(Boolean(data.has_access_token));
        setMaskedToken(data.masked_access_token || null);
        if (data.webhook_url) {
          setWebhookUrl(data.webhook_url);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar configurações de pagamento:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/payments/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_connection",
          access_token: accessToken || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setTestResult({
          success: true,
          message: `Conexão bem-sucedida! Conta conectada: ${data.user.nickname || data.user.email} (País: ${data.user.country_id || "BR"})`,
          user: data.user,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Falha ao validar credencial do Mercado Pago.",
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Erro de rede ao conectar com a API do Mercado Pago.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      const payload: any = {
        gateway: "mercadopago",
        environment,
        mercadopago_public_key: publicKey,
      };

      if (accessToken.trim()) {
        payload.mercadopago_access_token = accessToken.trim();
      }

      if (webhookSecret.trim()) {
        payload.mercadopago_webhook_secret = webhookSecret.trim();
      }

      const res = await fetch("/api/admin/payments/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveMessage({
          type: "success",
          text: "Configurações do Mercado Pago salvas e ativas com sucesso!",
        });
        setAccessToken("");
        await fetchPaymentSettings();
      } else {
        setSaveMessage({
          type: "error",
          text: data.error || "Erro ao salvar configurações.",
        });
      }
    } catch (err: any) {
      setSaveMessage({
        type: "error",
        text: err.message || "Erro de rede ao salvar configurações.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Editorial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400">
            FINANCEIRO & TRANSAÇÕES
          </span>
          <h1 className="text-xl sm:text-2xl font-light text-white tracking-tight mt-0.5">
            Integração <span className="font-normal text-amber-400">Mercado Pago</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cobrança em tempo real via Pix instantâneo e Cartão de Crédito em até 10x sem juros.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Ambiente Ativo:</span>
          {!hasExistingToken && !accessToken ? (
            <span className="px-3 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider bg-red-400/15 border-red-400/30 text-red-300 flex items-center gap-1.5">
              <AlertCircle size={13} />
              Não Configurado
            </span>
          ) : environment === "production" ? (
            <span className="px-3 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider bg-emerald-400/15 border-emerald-400/30 text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              Produção (Oficial)
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider bg-amber-400/15 border-amber-400/30 text-amber-300 flex items-center gap-1.5">
              <AlertCircle size={13} />
              Sandbox (Testes)
            </span>
          )}
        </div>
      </div>

      {/* Abas de Navegação Superiores */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("config")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "config"
              ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <CreditCard size={15} />
          <span>Configuração & Chaves da API</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "audit"
              ? "bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/10"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Activity size={15} />
          <span>Auditoria & Histórico de Transações</span>
        </button>
      </div>

      {activeTab === "audit" ? (
        <PaymentAuditPanel />
      ) : (
        <>

      {/* Alerta de Sandbox ou Credencial Ausente */}
      {environment === "sandbox" && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-amber-200 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300 text-sm">Atenção: Modo Sandbox (Testes) Ativo</p>
            <p className="text-amber-200/90 leading-relaxed">
              QR Codes Pix gerados em <strong>Sandbox não são reconhecidos por aplicativos de bancos reais</strong> (Nubank, Itaú, Bradesco, Banco do Brasil, etc.) — o banco informará erro de código inválido. Para testar em Sandbox, utilize o app de testes do Mercado Pago. Para receber pagamentos reais de clientes, alterne para <strong>Produção</strong> com credenciais <code>APP_USR-...</code>.
            </p>
          </div>
        </div>
      )}

      {/* Banner de Status Ativo do Mercado Pago */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#009ee3]/20 via-[#071626] to-[#0a2540] border border-[#009ee3]/30 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#009ee3] text-white text-[11px] font-bold tracking-wider uppercase">
                MERCADO PAGO
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={14} /> Gateway Ativo no E-commerce
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white">
              Vendas Pix e Cartão com Conciliação Automática
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              O cliente finaliza a compra no site com QR Code Pix dinâmico ou Cartão de Crédito. 
              Ao confirmar o pagamento, o webhook do Mercado Pago atualiza o status do pedido para &quot;pago&quot; instantaneamente.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.mercadopago.com.br/developers/panel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/10 transition-colors"
            >
              <span>Painel de Desenvolvedores</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Formulário de Configuração das Chaves de API */}
      <form onSubmit={handleSave} className="bg-[#06111f] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Lock size={18} className="text-amber-400" />
              Credenciais da API do Mercado Pago
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Obtenha suas chaves em <strong>Mercado Pago &gt; Suas Aplicações &gt; Credenciais de Produção</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || (!accessToken && !hasExistingToken)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw size={14} className={testing ? "animate-spin" : ""} />
            <span>{testing ? "Testando Conexão..." : "Testar Conexão"}</span>
          </button>
        </div>

        {/* Feedback do Teste de Conexão */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              testResult.success
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                : "bg-red-950/40 border-red-500/30 text-red-200"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              <p className="font-semibold">{testResult.success ? "Conexão Aprovada!" : "Falha na Conexão"}</p>
              <p className="mt-0.5">{testResult.message}</p>
            </div>
          </div>
        )}

        {/* Feedback de Salvamento */}
        {saveMessage && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              saveMessage.type === "success"
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                : "bg-red-950/40 border-red-500/30 text-red-200"
            }`}
          >
            {saveMessage.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-xs">{saveMessage.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Seletor de Ambiente */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Ambiente de Processamento
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEnvironment("production")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  environment === "production"
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                Produção (Vendas Reais)
              </button>
              <button
                type="button"
                onClick={() => setEnvironment("sandbox")}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  environment === "sandbox"
                    ? "bg-amber-400/20 border-amber-400 text-amber-300"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                Sandbox (Testes)
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              {environment === "production"
                ? "Utilize credenciais iniciadas por APP_USR-..."
                : "Utilize credenciais de teste iniciadas por TEST-..."}
            </p>
          </div>

          {/* Public Key */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Chave Pública (Public Key)
            </label>
            <input
              type="text"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full bg-[#040c16] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Chave pública visível no navegador para tokenização de cartões.
            </p>
          </div>
        </div>

        {/* Access Token Privado */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Access Token (Chave Privada do Servidor)
            </label>
            {hasExistingToken && (
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <Check size={12} /> Chave ativa salva ({maskedToken || "APP_USR-****"})
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder={
                hasExistingToken
                  ? "Deixe em branco para manter a chave atual ou digite nova chave"
                  : "APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              }
              className="w-full bg-[#040c16] border border-white/10 rounded-xl pl-4 pr-11 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors font-mono"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Utilizada exclusivamente nas chamadas do servidor para criar o Pix e aprovar cobranças.
          </p>
        </div>

        {/* Webhook Secret Opcional */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Webhook Secret (Segredo de Assinatura HMAC — Opcional)
          </label>
          <input
            type="password"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder="Segredo de validação de assinatura configurado no Mercado Pago"
            className="w-full bg-[#040c16] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-colors font-mono"
          />
          <p className="text-[11px] text-slate-500">
            Garante validação criptográfica (HMAC-SHA256) contra requisições não autorizadas.
          </p>
        </div>

        {/* Botão Salvar */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Salvando Configurações..." : "Salvar Configurações Mercado Pago"}
          </button>
        </div>
      </form>

      {/* Seção de Diagnóstico e Teste de Pagamento Pix */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <QrCode size={18} className="text-amber-400" />
              Diagnóstico de Pix em Tempo Real
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Gere um Pix de teste de R$ 1,00 para validar se o QR Code e o código Copia e Cola são aceitos pelos bancos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateTestPix}
            disabled={generatingPix}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={generatingPix ? "animate-spin" : ""} />
            <span>{generatingPix ? "Gerando Pix de Teste..." : "Gerar Pix de Teste (R$ 1,00)"}</span>
          </button>
        </div>

        {testPixResult && (
          <div className="space-y-4">
            {testPixResult.success && testPixResult.warning && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-xs">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{testPixResult.warning}</p>
              </div>
            )}

            {testPixResult.success && testPixResult.pix ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#040c16] border border-white/10 rounded-xl p-5">
                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner">
                  {testPixResult.pix.qrCodeBase64 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`data:image/png;base64,${testPixResult.pix.qrCodeBase64}`}
                      alt="QR Code Pix"
                      className="w-48 h-48 object-contain"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        testPixResult.pix.qrCode || ""
                      )}`}
                      alt="QR Code Pix"
                      className="w-48 h-48 object-contain"
                    />
                  )}
                  <span className="text-[10px] font-semibold text-slate-600 mt-2 uppercase tracking-wider text-center">
                    Escaneie com o app do banco
                  </span>
                </div>

                {/* Copia e Cola & Detalhes */}
                <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Código Pix Copia e Cola (EMVCo)</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          testPixResult.isSandbox
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            : "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                        }`}
                      >
                        {testPixResult.isSandbox ? "Ambiente Sandbox" : "Ambiente Produção"}
                      </span>
                    </div>

                    <div className="relative">
                      <textarea
                        readOnly
                        value={testPixResult.pix.qrCode || ""}
                        rows={3}
                        className="w-full bg-[#06111f] border border-white/10 rounded-xl p-3 text-[11px] text-amber-300 font-mono resize-none focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                    >
                      {copiedPix ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span>Código Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copiar Código Copia e Cola</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">ID Transação</span>
                      <span className="text-slate-300 font-mono text-[11px] truncate block">
                        {testPixResult.pix.paymentId || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Valor</span>
                      <span className="text-emerald-400 font-semibold">R$ 1,00</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Origem</span>
                      <span className="text-slate-300">{testPixResult.pix.isMock ? "Mock local" : "API Mercado Pago"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-start gap-3">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Erro ao gerar Pix de teste</p>
                  <p className="mt-0.5 text-red-200/90">{testPixResult.pix?.errorMessage || "Verifique se as credenciais cadastradas estão válidas e ativas no Mercado Pago."}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guia Passo a Passo para o Lojista */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles size={18} className="text-amber-400" />
          Guia Passo a Passo: Configuração Oficial Mercado Pago
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center text-xs">
              1
            </div>
            <div className="font-semibold text-white">Chaves de Produção</div>
            <p className="text-slate-400">
              Acesse o <strong>Painel de Desenvolvedores</strong> no Mercado Pago, selecione sua aplicação e copie as credenciais da aba <strong>Credenciais de Produção</strong>. As chaves devem começar com <code>APP_USR-</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center text-xs">
              2
            </div>
            <div className="font-semibold text-white">Configurar Webhook</div>
            <p className="text-slate-400">
              Copie a URL de webhook abaixo e cadastre na aba <strong>Notificações Webhook</strong> do Mercado Pago. Selecione o evento <code>Pagamentos (payment)</code> para confirmação automática dos pedidos.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center text-xs">
              3
            </div>
            <div className="font-semibold text-white">Validação de CPF</div>
            <p className="text-slate-400">
              O Banco Central e o Mercado Pago exigem CPF de 11 dígitos válido no Pix. CPFs com zeros (<code>00000000000</code>) são rejeitados pelo gateway. A loja agora valida isso preventivamente.
            </p>
          </div>
        </div>
      </div>

      {/* Webhook Endpoint Box */}
      <div className="bg-[#06111f] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          URL do Webhook para Confirmação Automática (Idempotente)
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Cadastre esta URL no portal do Mercado Pago para que os pagamentos Pix e cartão sejam confirmados 
          automaticamente no painel de pedidos assim que o banco liquidar a transação:
        </p>

        <div className="flex items-center gap-2 bg-[#040c16] border border-white/10 rounded-xl p-3">
          <code className="text-xs text-amber-300 font-mono flex-1 truncate">
            {webhookUrl}
          </code>
          <button
            type="button"
            onClick={handleCopyWebhook}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
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

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-slate-400 leading-relaxed">
          <div className="font-semibold text-white">Instruções de Configuração no Mercado Pago:</div>
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>Acesse o <strong>Painel de Desenvolvedores Mercado Pago</strong> &gt; <strong>Suas Aplicações</strong>.</li>
            <li>Selecione sua aplicação e clique na aba <strong>Notificações Webhook</strong>.</li>
            <li>Cole a URL acima no campo de Notificação em Modo Produção.</li>
            <li>Marque o evento <strong>Pagamentos (payment)</strong> e salve.</li>
          </ol>
        </div>
      </div>

      {/* Seção: Formas de Pagamento e Selos no Rodapé */}
      <form onSubmit={handleSaveFooterPayments} className="bg-[#06111f] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CreditCard size={18} className="text-amber-400" />
              Formas de Pagamento e Selos no Rodapé
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Controle quais bandeiras são exibidas no rodapé da loja e personalize o selo de segurança do Mercado Pago.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
            <span className="text-xs text-slate-300 font-medium">Exibir Bloco no Rodapé</span>
            <input
              type="checkbox"
              checked={footerPayments.show_footer_block}
              onChange={(e) =>
                setFooterPayments({ ...footerPayments, show_footer_block: e.target.checked })
              }
              className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
            />
          </label>
        </div>

        {footerSaveFeedback && (
          <div className="p-3 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{footerSaveFeedback}</span>
          </div>
        )}

        {/* Título do Bloco */}
        <div className="text-xs max-w-sm">
          <label className="block text-slate-400 mb-1">Título do Bloco</label>
          <input
            type="text"
            value={footerPayments.block_title}
            onChange={(e) =>
              setFooterPayments({ ...footerPayments, block_title: e.target.value })
            }
            className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white"
            placeholder="Formas de Pagamento"
          />
        </div>

        {/* Bandeiras de Pagamento */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Bandeiras e Métodos Aceitos
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {footerPayments.methods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  method.is_active
                    ? "bg-[#040c16] border-amber-400/30 text-white"
                    : "bg-[#040c16]/50 border-white/5 text-slate-500 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    <Image
                      src={method.icon_path}
                      alt={method.name}
                      width={36}
                      height={20}
                      className="h-5 w-auto object-contain"
                    />
                  </div>
                  <span className="text-xs font-medium">{method.name}</span>
                </div>
                <input
                  type="checkbox"
                  checked={method.is_active}
                  onChange={(e) => toggleMethodActive(method.id, e.target.checked)}
                  className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Selo Mercado Pago no Rodapé */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-medium">
              <ShieldCheck size={16} className="text-amber-400" />
              <span>Selo de Compra Segura no Rodapé</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-slate-400">Ativo</span>
              <input
                type="checkbox"
                checked={footerPayments.show_secure_badge}
                onChange={(e) =>
                  setFooterPayments({ ...footerPayments, show_secure_badge: e.target.checked })
                }
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </label>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Texto do Selo</label>
            <input
              type="text"
              value={footerPayments.secure_badge_text}
              onChange={(e) =>
                setFooterPayments({ ...footerPayments, secure_badge_text: e.target.value })
              }
              className="w-full bg-[#040c16] border border-white/10 rounded-xl px-3.5 py-2 text-white"
              placeholder="Pagamento seguro com Mercado Pago"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={savingFooter}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-400/10"
          >
            <Save size={15} />
            <span>{savingFooter ? "Salvando Rodapé..." : "Salvar Formas de Pagamento no Rodapé"}</span>
          </button>
        </div>
      </form>
      </>
      )}
    </div>
  );
}
