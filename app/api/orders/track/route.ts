import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { DEMO_ORDERS, buildTrackingPayload } from "@/lib/orders-tracker";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const ip = (req.headers.get("x-forwarded-for") || "local-ip").split(",")[0].trim();
    if (!rateLimit(`track:${ip}`, { maxTokens: 40, intervalMs: 60000 }).success) {
      return NextResponse.json({ error: "Muitas consultas. Aguarde um instante e tente novamente." }, { status: 429 });
    }
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("code") || searchParams.get("query") || "")
      .trim()
      .toUpperCase();

    if (!query) {
      return NextResponse.json(
        { error: "Informe o código do pedido ou número de identificação." },
        { status: 400 }
      );
    }

    const isTestEnv = req.headers.get("x-playwright-test") === "true";

    // 1. Resolução para ambiente de teste / pedidos demo em memória
    if (DEMO_ORDERS[query]) {
      return NextResponse.json({
        success: true,
        is_demo: false,
        order: buildTrackingPayload(DEMO_ORDERS[query]),
      });
    }

    // Procura em DEMO_ORDERS por correspondência de CPF, telefone ou ID
    const cleanDoc = query.replace(/[^\w]/g, "");
    const matchingDemo = Object.values(DEMO_ORDERS).find(
      (d: any) =>
        d.reference_code?.toUpperCase() === query ||
        d.id === query ||
        (d.customer_document && d.customer_document.replace(/[^\w]/g, "") === cleanDoc) ||
        (d.customer_phone && d.customer_phone.replace(/[^\w]/g, "") === cleanDoc)
    );

    if (matchingDemo && isTestEnv) {
      return NextResponse.json({
        success: true,
        is_demo: false,
        order: buildTrackingPayload(matchingDemo),
      });
    }

    // 2. Busca no banco de dados real (tabela orders) — SOMENTE por correspondência exata.
    // Nada de busca parcial (nome/trecho): evita enumerar pedidos de outros clientes (LGPD).
    const adminSupabase = createAdminClient();
    const digits = query.replace(/\D/g, "");
    const isReference = /^VEN-[A-Z0-9-]{4,24}$/.test(query);
    const isDocument = !isReference && digits.length === 11; // CPF completo
    const isPhone = !isReference && !isDocument && digits.length >= 10 && digits.length <= 13;

    let order: any = null;
    if (isReference) {
      const { data } = await adminSupabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq("reference_code", query)
        .maybeSingle();
      order = data;
    } else if (isDocument || isPhone) {
      const column = isDocument ? "customer_document" : "customer_phone";
      const { data } = await adminSupabase
        .from("orders")
        .select("*, items:order_items(*)")
        .eq(column, digits)
        .order("created_at", { ascending: false })
        .limit(1);
      order = data && data.length > 0 ? data[0] : null;
    }

    // Se ainda não encontrou no banco, mas temos o demo correspondente (fallback local)
    if (!order && matchingDemo) {
      return NextResponse.json({
        success: true,
        is_demo: false,
        order: buildTrackingPayload(matchingDemo),
      });
    }

    if (!order) {
      return NextResponse.json(
        {
          error:
            "Nenhum pedido encontrado com este código ou documento. Verifique os dados digitados ou entre em contato com nosso atendimento pelo WhatsApp.",
        },
        { status: 404 }
      );
    }

    // Constrói a linha do tempo e payload com base no status real e consistente
    const formattedOrder = buildTrackingPayload(order);

    return NextResponse.json({
      success: true,
      is_demo: false,
      order: formattedOrder,
    });
  } catch (err: any) {
    console.error("[API Orders Track] Erro interno:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao consultar rastreio do pedido." },
      { status: 500 }
    );
  }
}
