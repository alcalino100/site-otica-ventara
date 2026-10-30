import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = (body.code || "").trim().toUpperCase();

    if (!code || code.length < 3) {
      return NextResponse.json(
        { valid: false, message: "Informe um código de cupom válido." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const hasLiveDb = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Tenta validar no banco promotion_coupons se disponível
    if (hasLiveDb) {
      try {
        const { data: coupon, error } = await adminSupabase
          .from("promotion_coupons")
          .select("*")
          .eq("code", code)
          .maybeSingle();

        if (!error && coupon) {
          if (coupon.status === "used") {
            return NextResponse.json({
              valid: false,
              message: "Este cupom já foi utilizado.",
            });
          }

          if (coupon.status === "cancelled") {
            return NextResponse.json({
              valid: false,
              message: "Este cupom foi cancelado.",
            });
          }

          if (new Date(coupon.expires_at) < new Date()) {
            return NextResponse.json({
              valid: false,
              message: "Este cupom já expirou.",
            });
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
                : `Cupom ${coupon.code} aplicado com sucesso! (R$ ${discountValue.toFixed(2)} OFF)`,
          });
        }
      } catch (err) {
        console.warn("Erro ao consultar tabela de cupons:", err);
      }
    }

    // 2. Cupons promocionais oficiais de fallback
    if (code === "VENTARA10" || code === "BEMVINDO10" || code.startsWith("VEN-10")) {
      return NextResponse.json({
        valid: true,
        code,
        discountType: "percentage",
        discountValue: 10,
        message: `Cupom ${code} aplicado: 10% de desconto garantido!`,
      });
    }

    if (code === "VENTARA15" || code === "BEMVINDO15" || code.startsWith("VEN-15")) {
      return NextResponse.json({
        valid: true,
        code,
        discountType: "percentage",
        discountValue: 15,
        message: `Cupom ${code} aplicado: 15% de desconto garantido!`,
      });
    }

    if (code === "VENTARA20" || code.startsWith("VEN-20")) {
      return NextResponse.json({
        valid: true,
        code,
        discountType: "percentage",
        discountValue: 20,
        message: `Cupom ${code} aplicado: 20% de desconto garantido!`,
      });
    }

    return NextResponse.json({
      valid: false,
      message: "Cupom inválido ou expirado.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, message: "Erro ao validar cupom. Tente novamente." },
      { status: 500 }
    );
  }
}
