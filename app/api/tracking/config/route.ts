import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadTrackingConfig } from "@/lib/tracking/server";
import { toPublicConfig } from "@/lib/tracking/config";

export const dynamic = "force-dynamic";

/** Configuração pública do rastreamento (IDs e matriz de eventos). Nunca devolve o token. */
export async function GET() {
  const db = createAdminClient();
  const config = await loadTrackingConfig(db);
  return NextResponse.json(toPublicConfig(config), {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60" },
  });
}
