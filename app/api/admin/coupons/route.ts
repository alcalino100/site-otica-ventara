import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { couponStatus, validateCouponInput, type CouponInput } from "@/lib/coupons";

export const dynamic = "force-dynamic";

const maskEmail = (e: string | null) => {
  if (!e) return "";
  const [u, d] = e.split("@");
  return d ? `${u.slice(0, 1)}***@${d}` : "***";
};
const maskPhone = (p: string | null) => (p && p.length >= 4 ? `***${p.slice(-4)}` : "");

const MISSING_MSG = "Tabelas de cupons ainda não criadas. Rode o SQL da migração no Supabase.";
const isMissing = (e: { code?: string; message?: string } | null) => !!e && (e.code === "PGRST205" || e.code === "42P01" || /coupons/.test(e.message || ""));

function toInput(b: Record<string, unknown>): CouponInput {
  const num = (v: unknown) => (v === null || v === undefined || v === "" ? null : Number(v));
  return {
    code: String(b.code || "").trim().toUpperCase(),
    description: typeof b.description === "string" ? b.description.trim().slice(0, 200) : undefined,
    discount_type: b.discount_type as "percentage" | "fixed",
    discount_value: Number(b.discount_value),
    max_discount_cents: num(b.max_discount_cents),
    min_order_cents: num(b.min_order_cents) ?? 0,
    starts_at: b.starts_at ? String(b.starts_at) : null,
    expires_at: b.expires_at ? String(b.expires_at) : null,
    max_uses_total: num(b.max_uses_total),
    max_uses_per_customer: num(b.max_uses_per_customer) ?? 1,
    active: b.active !== false,
  };
}

/** Lista cupons com estatísticas; com ?id=...&history=1 devolve o histórico de usos de um cupom. */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const db = createAdminClient();
  const sp = req.nextUrl.searchParams;

  if (sp.get("history") && sp.get("id")) {
    const { data, error } = await db
      .from("coupon_redemptions")
      .select("id, created_at, reference_code, customer_email, customer_phone, discount_in_cents, status")
      .eq("coupon_id", sp.get("id"))
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return NextResponse.json({ error: isMissing(error) ? MISSING_MSG : "Não foi possível carregar o histórico." }, { status: 500 });
    return NextResponse.json({
      rows: (data || []).map((r: any) => ({ ...r, customer_email: maskEmail(r.customer_email), customer_phone: maskPhone(r.customer_phone) })),
    });
  }

  const { data: coupons, error } = await db.from("coupons").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ coupons: [], error: isMissing(error) ? MISSING_MSG : "Não foi possível carregar os cupons." }, { status: 200 });
  const { data: reds } = await db.from("coupon_redemptions").select("coupon_id, status, discount_in_cents").in("status", ["reserved", "confirmed"]);

  const stats: Record<string, { used: number; confirmed: number; discount: number }> = {};
  for (const r of reds || []) {
    const s = (stats[r.coupon_id] ||= { used: 0, confirmed: 0, discount: 0 });
    s.used++;
    if (r.status === "confirmed") {
      s.confirmed++;
      s.discount += r.discount_in_cents || 0;
    }
  }
  return NextResponse.json({
    coupons: (coupons || []).map((c: any) => {
      const s = stats[c.id] || { used: 0, confirmed: 0, discount: 0 };
      return { ...c, used: s.used, confirmed: s.confirmed, discount_total_cents: s.discount, status: couponStatus(c, s.used) };
    }),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const input = toInput(await req.json().catch(() => ({})));
  const err = validateCouponInput(input, { requireLimit: true });
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const db = createAdminClient();
  const { error } = await db.from("coupons").insert({ ...input, created_by: auth.profile.email });
  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Já existe um cupom com esse código." }, { status: 409 });
    return NextResponse.json({ error: isMissing(error) ? MISSING_MSG : "Não foi possível criar o cupom." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/** Edita um cupom (o código não muda). Só `active` = pausar/reativar. */
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const b = await req.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ error: "Cupom não informado." }, { status: 400 });
  const db = createAdminClient();

  if (Object.keys(b).every((k) => k === "id" || k === "active") && typeof b.active === "boolean" && b.active === false) {
    const { error } = await db.from("coupons").update({ active: false, updated_at: new Date().toISOString() }).eq("id", b.id);
    if (error) return NextResponse.json({ error: "Não foi possível pausar." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { data: current } = await db.from("coupons").select("code").eq("id", b.id).maybeSingle();
  if (!current) return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
  // Reativar sem mandar os demais campos: carrega o cupom atual e valida como está
  let merged = b;
  if (Object.keys(b).every((k) => k === "id" || k === "active")) {
    const { data: full } = await db.from("coupons").select("*").eq("id", b.id).maybeSingle();
    merged = { ...full, active: true };
  }
  const input = toInput({ ...merged, code: current.code });
  const err = validateCouponInput(input, { requireLimit: input.active !== false });
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const { code: _ignore, ...fields } = input;
  void _ignore;
  const { error } = await db.from("coupons").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", b.id);
  if (error) return NextResponse.json({ error: "Não foi possível salvar." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Exclui só cupom que nunca foi usado; os demais devem ser pausados (o histórico é mantido). */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Cupom não informado." }, { status: 400 });
  const db = createAdminClient();
  const { count } = await db.from("coupon_redemptions").select("id", { count: "exact", head: true }).eq("coupon_id", id);
  if ((count || 0) > 0) {
    return NextResponse.json({ error: "Este cupom já foi usado e tem histórico. Pause-o em vez de excluir." }, { status: 409 });
  }
  const { error } = await db.from("coupons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Não foi possível excluir." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
