import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { isPaymentMockAllowed } from "@/lib/mercadopago";
import { applyAdminCoupon } from "@/lib/coupons";

export const dynamic = "force-dynamic";

const money = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

export async function POST(req: NextRequest) {
  try {
    // Limite por IP: impede "chutar" códigos em sequência
    const ip = (req.headers.get("x-forwarded-for") || "local-ip").split(",")[0].trim();
    if (!rateLimit(`coupon:${ip}`, { maxTokens: 12, intervalMs: 60000 }).success) {
      return NextResponse.json(
        { valid: false, message: "Muitas tentativas. Aguarde um minuto e tente de novo." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    if (!code || code.length < 3) {
      return NextResponse.json({ valid: false, message: "Informe um código de cupom válido." }, { status: 400 });
    }
    const subtotalCents = Number.isFinite(body.subtotal_cents) ? Math.max(0, Number(body.subtotal_cents)) : 0;

    const adminSupabase = createAdminClient();
    const hasLiveDb = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (hasLiveDb) {
      // 1) Cupom criado no admin (simulação: não consome nada)
      const res = await applyAdminCoupon(adminSupabase, {
        code,
        subtotalCents: subtotalCents || 1_000_000, // sem carrinho informado: só valida o cupom em si
        email: body.email,
        phone: body.phone,
        document: body.document,
        dryRun: true,
      });
      if (res.found) {
        if (!res.ok) return NextResponse.json({ valid: false, message: res.message });
        return NextResponse.json({
          valid: true,
          code: res.code,
          discountType: res.discountType,
          discountValue: res.discountValue,
          maxDiscountCents: res.maxDiscountCents,
          minOrderCents: res.minOrderCents,
          message:
            res.discountType === "percentage"
              ? `Cupom ${res.code} aplicado! (${res.discountValue}% OFF)`
              : `Cupom ${res.code} aplicado! (${money(res.discountValue)} OFF)`,
        });
      }

      // 2) Cupom único da roleta
      try {
        const { data: coupon, error } = await adminSupabase.from("promotion_coupons").select("*").eq("code", code).maybeSingle();
        if (!error && coupon) {
          if (coupon.status === "used") return NextResponse.json({ valid: false, message: "Este cupom já foi utilizado." });
          if (coupon.status === "cancelled") return NextResponse.json({ valid: false, message: "Este cupom foi cancelado." });
          if (coupon.status !== "issued" || new Date(coupon.expires_at) < new Date()) {
            return NextResponse.json({ valid: false, message: "Este cupom já expirou." });
          }
          const discountValue = Number(coupon.benefit_value) || 10;
          const discountType = coupon.benefit_type || "percentage";
          return NextResponse.json({
            valid: true,
            code: coupon.code,
            discountType,
            discountValue,
            message:
              discountType === "percentage"
                ? `Cupom ${coupon.code} aplicado com sucesso! (${discountValue}% OFF)`
                : `Cupom ${coupon.code} aplicado com sucesso! (${money(discountValue)} OFF)`,
          });
        }
      } catch (err) {
        console.warn("Erro ao consultar tabela de cupons:", err);
      }
    }

    // Códigos de teste: só em ambiente de teste/desenvolvimento
    if (isPaymentMockAllowed()) {
      const pct = /^(VENTARA|BEMVINDO)10$|^VEN-10/.test(code) ? 10 : /^(VENTARA|BEMVINDO)15$|^VEN-15/.test(code) ? 15 : /^VENTARA20$|^VEN-20/.test(code) ? 20 : 0;
      if (pct) {
        return NextResponse.json({
          valid: true,
          code,
          discountType: "percentage",
          discountValue: pct,
          message: `Cupom ${code} aplicado: ${pct}% de desconto garantido!`,
        });
      }
    }

    return NextResponse.json({ valid: false, message: "Cupom inválido ou expirado." });
  } catch {
    return NextResponse.json({ valid: false, message: "Erro ao validar cupom. Tente novamente." }, { status: 500 });
  }
}
