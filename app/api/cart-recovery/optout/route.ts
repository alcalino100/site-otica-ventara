import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SESSION_RE, suppressContact } from "@/lib/abandoned-carts";

export const dynamic = "force-dynamic";

/** "Não quero lembretes" dentro do carrinho: apaga os dados guardados desta sessão e bloqueia novos. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const sid = typeof body.session_id === "string" ? body.session_id : "";
  if (!SESSION_RE.test(sid)) return NextResponse.json({ ok: false }, { status: 400 });
  const db = createAdminClient();
  const { data: cart } = await db.from("abandoned_carts").select("email, phone").eq("session_id", sid).maybeSingle();
  if (cart) await suppressContact(db, { email: cart.email, phone: cart.phone });
  await db
    .from("abandoned_carts")
    .upsert({ session_id: sid, status: "unsubscribed", name: null, email: null, phone: null, items: [], item_count: 0, subtotal_cents: 0, last_activity_at: new Date().toISOString() }, { onConflict: "session_id" });
  return NextResponse.json({ ok: true });
}
