import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadNotificationSettings, sendRecoveryEmail, type CartRow } from "@/lib/notifications";
import { isEmailConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_PER_RUN = 40;

/**
 * Cron (Vercel): envia 1 e-mail de recuperação por carrinho parado.
 * Autenticado por CRON_SECRET (a Vercel envia "Authorization: Bearer <CRON_SECRET>").
 * Sem CRON_SECRET configurado, recusa tudo.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = createAdminClient();
  const settings = await loadNotificationSettings(db);
  const result = { sent: 0, failed: 0, skipped: 0, purged: 0, enabled: settings.recovery_enabled };

  if (settings.recovery_enabled && isEmailConfigured()) {
    const now = Date.now();
    const readyBefore = new Date(now - settings.recovery_delay_hours * 3600000).toISOString();
    const tooOld = new Date(now - 7 * 86400000).toISOString(); // não manda lembrete de carrinho com mais de 7 dias
    const { data: carts } = await db
      .from("abandoned_carts")
      .select("id, token, name, email, items, subtotal_cents, recovery_email_count")
      .eq("status", "open")
      .eq("consent_marketing", true)
      .is("recovered_at", null)
      .is("recovery_email_sent_at", null)
      .not("email", "is", null)
      .lte("last_activity_at", readyBefore)
      .gte("last_activity_at", tooOld)
      .limit(MAX_PER_RUN);

    for (const c of (carts || []) as Array<CartRow & { recovery_email_count: number }>) {
      const r = await sendRecoveryEmail(db, c, settings.recovery_coupon_code || undefined);
      result[r]++;
      if (r === "sent") {
        await db.from("abandoned_carts").update({ recovery_email_sent_at: new Date().toISOString(), recovery_email_count: (c.recovery_email_count || 0) + 1 }).eq("id", c.id);
      }
    }
  }

  // Privacidade: apaga carrinhos e logs antigos (90 dias)
  const cutoff = new Date(Date.now() - 90 * 86400000).toISOString();
  const { data: gone } = await db.from("abandoned_carts").delete().lt("last_activity_at", cutoff).select("id");
  result.purged = gone?.length || 0;
  await db.from("email_log").delete().lt("created_at", cutoff);

  return NextResponse.json(result);
}
