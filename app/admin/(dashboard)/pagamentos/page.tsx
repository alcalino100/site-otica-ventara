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
} from "lucide-react";

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

  // Feedback states
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    user?: any;
  } | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payments");
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
      const res = await fetch("/api/admin/payments", {
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

      const res = await fetch("/api/admin/payments", {
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
          <span
            className={`px-3 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider ${
              environment === "production"
                ? "bg-emerald-400/15 border-emerald-400/30 text-emerald-300"
                : "bg-amber-400/15 border-amber-400/30 text-amber-300"
            }`}
          >
            {environment === "production" ? "Produção (Oficial)" : "Sandbox (Testes)"}
          </span>
        </div>
      </div>

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
    </div>
  );
}
