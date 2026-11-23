// Envio de e-mail via Resend (API REST, sem dependência extra).
// Variáveis na Vercel: RESEND_API_KEY (obrigatória) e NOTIFY_FROM_EMAIL (ex.: "Ótica Ventara <avisos@oticasventara.com.br>").

export const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const oneLine = (v: string) => v.replace(/[\r\n]+/g, " ").trim().slice(0, 200);

export const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function parseEmails(raw: string | null | undefined): string[] {
  return Array.from(
    new Set(
      (raw || "")
        .split(/[,;\s]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e))
    )
  ).slice(0, 5);
}

export interface SendResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

export async function sendEmail(
  msg: { to: string; subject: string; html: string; text?: string; replyTo?: string },
  opts: { fetchImpl?: typeof fetch } = {}
): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, skipped: true, error: "RESEND_API_KEY não configurada" };
  const from = process.env.NOTIFY_FROM_EMAIL || "Ótica Ventara <onboarding@resend.dev>";
  const f = opts.fetchImpl || fetch;
  try {
    const res = await f("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [msg.to],
        subject: oneLine(msg.subject),
        html: msg.html,
        text: msg.text,
        reply_to: msg.replyTo,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) return { ok: true };
    let detail = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j?.message) detail = String(j.message);
    } catch {
      /* corpo inválido */
    }
    return { ok: false, error: detail.split(key).join("***").slice(0, 300) };
  } catch (e) {
    return { ok: false, error: (e instanceof Error ? e.message : "Falha de rede").split(key).join("***").slice(0, 300) };
  }
}

/** Moldura simples e legível para todos os e-mails. */
export function layout(title: string, bodyHtml: string, footerHtml = ""): string {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#111827">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#061423;padding:18px 24px;color:#fbbf24;font-size:18px;font-weight:bold">Óticas Ventara</td></tr>
<tr><td style="padding:24px"><h1 style="margin:0 0 16px;font-size:20px">${esc(title)}</h1>${bodyHtml}</td></tr>
${footerHtml ? `<tr><td style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:12px">${footerHtml}</td></tr>` : ""}
</table></td></tr></table></body></html>`;
}
