import { normalizeBrazilianPhone, type PromotionParticipation, type CouponStatus } from "@/types/promotion-wheel";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;

export type WheelRecord = PromotionParticipation & {
  marketing_opt_in?: boolean;
  contacted_at?: string | null;
  purchased?: boolean;
};

const LEAD_COLS = "id, name, phone_normalized, phone_masked, marketing_opt_in, contacted_at";
const BOUGHT = ["paid", "preparing", "shipped", "ready_for_pickup", "delivered"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRecord(c: any): WheelRecord {
  const lead = Array.isArray(c.lead) ? c.lead[0] : c.lead;
  const snap = c.rules_snapshot || {};
  let status = c.status as CouponStatus;
  if (status === "issued" && c.expires_at && new Date(c.expires_at) < new Date()) status = "expired";
  return {
    id: c.id,
    campaign_id: c.campaign_id,
    campaign_version: Number(snap.campaign_version) || 1,
    lead_id: c.lead_id || "",
    lead_name: lead?.name || "",
    lead_phone_normalized: lead?.phone_normalized || "",
    lead_phone_masked: lead?.phone_masked || "",
    benefit_label: snap.benefit_label || `${Number(c.benefit_value)}% OFF`,
    winning_segment_id: snap.winning_segment_id || "",
    coupon_code: c.code,
    coupon_status: status,
    coupon_expires_at: c.expires_at,
    created_at: c.created_at,
    used_at: c.used_at,
    used_by_operator: c.used_by_operator,
    marketing_opt_in: lead?.marketing_opt_in === true,
    contacted_at: lead?.contacted_at || null,
  };
}

export async function loadAllRecords(db: Db): Promise<WheelRecord[]> {
  const { data, error } = await db
    .from("promotion_coupons")
    .select(`*, lead:promotion_leads(${LEAD_COLS})`)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) throw new Error(error.message);
  const list: WheelRecord[] = (data || []).map(toRecord);

  // "Já comprou?": existe pedido pago/em andamento com o mesmo telefone (melhor esforço)
  try {
    const { data: orders } = await db.from("orders").select("customer_phone").in("status", BOUGHT).limit(5000);
    const phones = new Set<string>((orders || []).map((o: { customer_phone?: string }) => normalizeBrazilianPhone(String(o.customer_phone || ""))));
    for (const r of list) r.purchased = r.coupon_status === "used" || (!!r.lead_phone_normalized && phones.has(r.lead_phone_normalized));
  } catch {
    for (const r of list) r.purchased = r.coupon_status === "used";
  }
  return list;
}

export async function findExisting(db: Db, campaignId: string, phone: string): Promise<WheelRecord | null> {
  const { data: lead } = await db.from("promotion_leads").select("id").eq("phone_normalized", phone).limit(1).maybeSingle();
  if (!lead) return null;
  const { data } = await db
    .from("promotion_coupons")
    .select(`*, lead:promotion_leads(${LEAD_COLS})`)
    .eq("lead_id", lead.id)
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? toRecord(data) : null;
}

export async function saveParticipation(db: Db, rec: PromotionParticipation, optIn: boolean, consentText = "roleta-v1"): Promise<void> {
  const phone = rec.lead_phone_normalized || "";
  const { data: existingLead } = await db.from("promotion_leads").select("id, marketing_opt_in").eq("phone_normalized", phone).limit(1).maybeSingle();
  let leadId = existingLead?.id as string | undefined;
  if (!leadId) {
    const { data, error } = await db
      .from("promotion_leads")
      .insert({ name: rec.lead_name, phone_normalized: phone, phone_masked: rec.lead_phone_masked, marketing_opt_in: optIn })
      .select("id")
      .single();
    if (error || !data) throw new Error(error?.message || "lead não gravado");
    leadId = data.id;
  } else if (optIn && !existingLead.marketing_opt_in) {
    await db.from("promotion_leads").update({ marketing_opt_in: true }).eq("id", leadId);
  }
  const pct = parseFloat(String(rec.benefit_label).replace(",", ".").match(/\d+(\.\d+)?/)?.[0] || "10");
  const { error: cErr } = await db.from("promotion_coupons").insert({
    code: rec.coupon_code,
    campaign_id: rec.campaign_id,
    lead_id: leadId,
    benefit_type: "percentage",
    benefit_value: pct,
    rules_snapshot: { benefit_label: rec.benefit_label, winning_segment_id: rec.winning_segment_id, campaign_version: rec.campaign_version },
    status: "issued",
    expires_at: rec.coupon_expires_at,
  });
  if (cErr) throw new Error(cErr.message);
  try {
    await db.from("promotion_consent_records").insert({ lead_id: leadId, purpose: "marketing", decision: optIn ? "granted" : "declined", text_version: consentText });
  } catch {
    /* registro de consentimento é melhor esforço */
  }
}

export async function redeemByCode(db: Db, code: string, operator: string): Promise<WheelRecord> {
  const { data: c } = await db.from("promotion_coupons").select(`*, lead:promotion_leads(${LEAD_COLS})`).eq("code", code.trim().toUpperCase()).maybeSingle();
  if (!c) throw new Error("Cupom não localizado.");
  if (c.status === "used") throw new Error(`Este cupom já foi utilizado em ${new Date(c.used_at || "").toLocaleDateString("pt-BR")}.`);
  if (c.status === "cancelled") throw new Error("Este cupom foi cancelado.");
  if (new Date(c.expires_at) < new Date()) throw new Error("Este cupom expirou a validade.");
  const { data: done } = await db.from("promotion_coupons").update({ status: "used", used_at: new Date().toISOString(), used_by_operator: operator }).eq("id", c.id).eq("status", "issued").select("id");
  if (!done || done.length === 0) throw new Error("Este cupom já foi utilizado.");
  return toRecord({ ...c, status: "used", used_at: new Date().toISOString(), used_by_operator: operator });
}

export async function markContacted(db: Db, leadId: string, contacted: boolean): Promise<void> {
  const { error } = await db.from("promotion_leads").update({ contacted_at: contacted ? new Date().toISOString() : null }).eq("id", leadId);
  if (error) throw new Error(error.message);
}
