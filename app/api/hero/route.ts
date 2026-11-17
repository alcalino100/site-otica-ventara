import { NextResponse } from "next/server";
import { getHeroData } from "@/lib/hero-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(await getHeroData());
}
