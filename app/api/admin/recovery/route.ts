import { CUSTOMER_KINDS, buildCustomerEmail, sampleCustomerOrder, sendCustomerTest } from "@/lib/customer-emails";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { cartState } from "@/lib/abandoned-carts";
import { isEmailConfigured, parseEmails } from "@/lib/email";
import { loadNotificationSettings, sendRecoveryEmail, sendTestEmail, normalizeSettings, type CartRow } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const MISSING = "Tabelas ainda não criadas. Rode o SQL da migração no Supabase.";
const isMissing = (e: { code?: string; message?: string } | null) => !!e && (e.code === "PGRST205" || e.code === "42P01" || /abandoned_carts|notification_settings/.test(e.message || ""));
const PERIODS: Record<string, number> = { "1": 1, "7": 7, "30": 30, "90": 90 };

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const sp = req.nextUrl.searchParams;
  const preview = CUSTOMER_KINDS.find((k) => k === sp.get("preview"));
  if (preview) {
    const m = buildCustomerEmail(preview, sampleCustomerOrder({ delivery_type: sp.get("pickup") === "1" ? "store_pickup" : "delivery" }));
    return NextResponse.json({ subject: m.subject, html: m.html });
  }
  const db = createAdminClient();
  const days = PERIODS[sp.get("days") || "7"] || 7;
  const filter = sp.get("state") || "abandoned";
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const { data, error } = await db
    .from("abandoned_carts")
    .select("id, token, name, email, phone, items, item_count, subtotal_cents, status, contacted_at, recovery_email_sent_at, recovery_email_count, recovered_at, recovered_value_cents, last_activity_at, created_at, order_id")
    .gte("last_activity_at", since)
    .order("last_activity_at", { ascending: false })
    .limit(1000);
  if (error) return NextResponse.json({ error: isMissing(error) ? MISSING : "Não foi possível carregar." }, { status: 200 });

  const all = (data || []).map((c: any) => ({ ...c, state: cartState(c) }));
  const abandoned = all.filter((c: any) => c.state === "abandoned");
  const recovered = all.filter((c: any) => c.state === "recovered");
  const stats = {
    abandoned: abandoned.length,
    abandoned_value_cents: abandoned.reduce((n: number, c: any) => n + (c.subtotal_cents || 0), 0),
    recovered: recovered.length,
    recovered_value_cents: recovered.reduce((n: number, c: any) => n + (c.recovered_value_cents || 0), 0),
    reachable: abandoned.filter((c: any) => c.phone || c.email).length,
  };
  const carts = filter === "all" ? all : all.filter((c: any) => c.state === filter);

  const { data: log } = await db.from("email_log").select("id, created_at, kind, to_email, status, error").order("created_at", { ascending: false }).limit(15);
  const settings = await loadNotificationSettings(db);
  return NextResponse.json({
    stats,
    carts: carts.slice(0, 300),
    settings,
    email_configured: isEmailConfigured(),
    cron_configured: Boolean(process.env.CRON_SECRET),
    email_log: log || [],
  });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const b = await req.json().catch(() => ({}));
  const s = normalizeSettings(b);
  const emails = parseEmails(String(b.owner_emails || ""));
  if (String(b.owner_emails || "").trim() && !emails.length) return NextResponse.json({ error: "Nenhum e-mail válido informado." }, { status: 400 });
  if ((s.notify_paid || s.notify_new_order) && !emails.length) return NextResponse.json({ error: "Informe ao menos um e-mail para receber os avisos." }, { status: 400 });
  const { error } = await createAdminClient().from("notification_settings").upsert(
    { id: "main", owner_emails: emails.join(", "), notify_paid: s.notify_paid, notify_new_order: s.notify_new_order, recovery_enabled: s.recovery_enabled, recovery_delay_hours: s.recovery_delay_hours, recovery_coupon_code: s.recovery_coupon_code || null, customer_paid: s.customer_paid, customer_unpaid: s.customer_unpaid, customer_shipped: s.customer_shipped, updated_at: new Date().toISOString() },
    { onConflict: "id" }
  );
  if (error) return NextResponse.json({ error: isMissing(error) ? MISSING : "Não foi possível salvar." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const b = await req.json().catch(() => ({}));
  const db = createAdminClient();

  if (b.action === "test_customer") {
    const to = parseEmails(String(b.to || ""))[0];
    const kind = CUSTOMER_KINDS.find((k) => k === b.kind);
    if (!to || !kind) return NextResponse.json({ error: "Informe um e-mail válido e o tipo de aviso." }, { status: 400 });
    const r = await sendCustomerTest(to, kind);
    return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error || "Falha ao enviar." }, { status: 502 });
  }

  if (b.action === "test_email") {
    const to = parseEmails(String(b.to || ""))[0];
    if (!to) return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    const r = await sendTestEmail(db, to);
    return r.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: r.error || "Falha ao enviar." }, { status: 502 });
  }

  if (!b.id) return NextResponse.json({ error: "Carrinho não informado." }, { status: 400 });

  if (b.action === "contacted") {
    await db.from("abandoned_carts").update({ status: "contacted", contacted_at: new Date().toISOString() }).eq("id", b.id).neq("status", "unsubscribed");
    return NextResponse.json({ ok: true });
  }

  if (b.action === "send_recovery") {
    const { data: c } = await db.from("abandoned_carts").select("id, token, name, email, items, subtotal_cents, status, recovered_at, recovery_email_count").eq("id", b.id).maybeSingle();
    if (!c || !c.email) return NextResponse.json({ error: "Este carrinho não tem e-mail." }, { status: 400 });
    if (c.status === "unsubscribed" || c.recovered_at) return NextResponse.json({ error: "Este cliente não deve receber lembrete (já comprou ou pediu para sair)." }, { status: 409 });
    if (!isEmailConfigured()) return NextResponse.json({ error: "E-mail ainda não conectado (falta RESEND_API_KEY na Vercel)." }, { status: 503 });
    const settings = await loadNotificationSettings(db);
    const r = await sendRecoveryEmail(db, c as CartRow, settings.recovery_coupon_code || undefined);
    if (r !== "sent") return NextResponse.json({ error: r === "skipped" ? "Este e-mail já foi enviado." : "Falha ao enviar o e-mail." }, { status: 502 });
    await db.from("abandoned_carts").update({ recovery_email_sent_at: new Date().toISOString(), recovery_email_count: (c.recovery_email_count || 0) + 1, status: "contacted", contacted_at: new Date().toISOString() }).eq("id", c.id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Carrinho não informado." }, { status: 400 });
  await createAdminClient().from("abandoned_carts").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
