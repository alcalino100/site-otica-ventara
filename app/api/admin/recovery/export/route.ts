import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { cartState, csvCell } from "@/lib/abandoned-carts";

export const dynamic = "force-dynamic";

/** Exporta os carrinhos abandonados (CSV) para campanhas de remarketing. Só quem consentiu e não pediu para sair. */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;
  const days = Math.min(90, Math.max(1, Number(req.nextUrl.searchParams.get("days")) || 30));
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await createAdminClient()
    .from("abandoned_carts")
    .select("name, email, phone, items, subtotal_cents, status, recovered_at, last_activity_at, consent_marketing")
    .gte("last_activity_at", since)
    .eq("consent_marketing", true)
    .order("last_activity_at", { ascending: false })
    .limit(5000);
  const rows = (data || []).filter((c: any) => cartState(c) === "abandoned" || cartState(c) === "recovered");
  const head = ["nome", "email", "telefone", "itens", "valor_reais", "situacao", "ultima_atividade"];
  const lines = rows.map((c: any) =>
    [
      c.name,
      c.email,
      c.phone,
      (c.items || []).map((i: any) => `${i.name} x${i.quantity}`).join(" | "),
      ((c.subtotal_cents || 0) / 100).toFixed(2).replace(".", ","),
      cartState(c) === "recovered" ? "recuperado" : "abandonado",
      c.last_activity_at,
    ].map(csvCell).join(",")
  );
  const csv = "﻿" + [head.join(","), ...lines].join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="carrinhos-abandonados-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
