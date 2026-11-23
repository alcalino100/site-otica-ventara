import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Devolve os itens do carrinho para o link "Voltar para o meu carrinho" do e-mail. Nunca devolve dados pessoais. */
export async function GET(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  if (!rateLimit(`cart-restore:${ip}`, { maxTokens: 20, intervalMs: 60000 }).success) {
    return NextResponse.json({ items: [] }, { status: 429 });
  }
  const token = req.nextUrl.searchParams.get("token") || "";
  if (!/^[a-f0-9]{64}$/.test(token)) return NextResponse.json({ items: [] }, { status: 400 });
  const { data } = await createAdminClient().from("abandoned_carts").select("items, status, recovered_at").eq("token", token).maybeSingle();
  if (!data || data.status === "unsubscribed" || data.recovered_at) return NextResponse.json({ items: [] });
  return NextResponse.json({ items: Array.isArray(data.items) ? data.items : [] });
}
