import { NextResponse } from "next/server";
import { getShippingData } from "@/lib/shipping-repository";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getShippingData();
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Erro ao carregar dados de envio" },
      { status: 500 }
    );
  }
}
