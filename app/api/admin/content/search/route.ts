import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { searchContentInSite } from "@/lib/content/repository";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  const results = await searchContentInSite(query);

  return NextResponse.json({
    query,
    count: results.length,
    results,
  });
}
