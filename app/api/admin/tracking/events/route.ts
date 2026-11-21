import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { AUDIT_PERIODS } from "@/lib/tracking/events";

export const dynamic = "force-dynamic";

/** Auditoria: lista + resumo por evento/destino no período (1h, 2h, 24h, 7d). */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const sp = req.nextUrl.searchParams;
  const period = AUDIT_PERIODS[sp.get("period") || "24h"] ? (sp.get("period") as string) : "24h";
  const since = new Date(Date.now() - AUDIT_PERIODS[period].minutes * 60000).toISOString();
  const event = sp.get("event") || "";
  const destination = sp.get("destination") || "";
  const status = sp.get("status") || "";

  const db = createAdminClient();
  let q = db
    .from("tracking_events")
    .select("id, created_at, event_key, destination, source, status, event_id, order_id, value_in_cents, path, http_status, error")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (event) q = q.eq("event_key", event);
  if (["meta", "google"].includes(destination)) q = q.eq("destination", destination);
  if (["sent", "failed", "skipped"].includes(status)) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ rows: [], summary: {}, totals: { sent: 0, failed: 0, skipped: 0 }, error: error.message }, { status: 200 });
  }
  const rows = data || [];

  const summary: Record<string, { meta: { sent: number; failed: number }; google: { sent: number; failed: number }; last_at: string | null }> = {};
  const totals = { sent: 0, failed: 0, skipped: 0 };
  for (const r of rows) {
    const s = (summary[r.event_key] ||= { meta: { sent: 0, failed: 0 }, google: { sent: 0, failed: 0 }, last_at: null });
    const dest = r.destination as "meta" | "google";
    if (r.status === "sent") s[dest].sent++;
    if (r.status === "failed") s[dest].failed++;
    if (!s.last_at || r.created_at > s.last_at) s.last_at = r.created_at;
    totals[r.status as keyof typeof totals]++;
  }
  return NextResponse.json({ period, since, summary, totals, rows: rows.slice(0, 200), total_rows: rows.length });
}
