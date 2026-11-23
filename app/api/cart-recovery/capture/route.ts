import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { parseCapture, upsertCart } from "@/lib/abandoned-carts";

export const dynamic = "force-dynamic";

/** Guarda o carrinho de quem informou contato (o navegador só chama com consentimento de marketing). */
export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
    if (!rateLimit(`cart-capture:${ip}`, { maxTokens: 30, intervalMs: 60000 }).success) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }
    const body = await req.json().catch(() => ({}));
    const input = parseCapture(body);
    if (!input) return NextResponse.json({ ok: false }, { status: 400 });
    const r = await upsertCart(createAdminClient(), input);
    return NextResponse.json({ ok: r.ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
