import { NextRequest, NextResponse } from "next/server";
import { suppressContact } from "@/lib/abandoned-carts";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const page = (msg: string) =>
  new NextResponse(
    `<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:Arial,sans-serif;background:#f4f4f5;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0"><div style="background:#fff;padding:32px;border-radius:12px;max-width:420px;text-align:center"><h1 style="font-size:20px;margin:0 0 12px">${msg}</h1><a href="/" style="color:#b45309">Voltar para a loja</a></div></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );

/** Descadastro pelo link do e-mail: apaga os dados pessoais e bloqueia novos lembretes. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  if (!/^[a-f0-9]{64}$/.test(token)) return page("Link inválido.");
  const db = createAdminClient();
  const { data: cart } = await db.from("abandoned_carts").select("email, phone").eq("token", token).maybeSingle();
  if (cart) await suppressContact(db, { email: cart.email, phone: cart.phone });
  await db.from("abandoned_carts").update({ status: "unsubscribed", name: null, email: null, phone: null, items: [], item_count: 0, subtotal_cents: 0 }).eq("token", token);
  return page("Pronto! Você não receberá mais lembretes.");
}
