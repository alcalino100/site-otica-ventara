import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getShippingData,
  saveShippingPageSettings,
  saveShippingCarriers,
  saveShippingFaqs,
} from "@/lib/shipping-repository";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const data = await getShippingData();
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Erro ao consultar dados de envio" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const body = await req.json();

    if (body.pageSettings) {
      await saveShippingPageSettings(body.pageSettings);
    }
    if (body.carriers && Array.isArray(body.carriers)) {
      await saveShippingCarriers(body.carriers);
    }
    if (body.faqs && Array.isArray(body.faqs)) {
      await saveShippingFaqs(body.faqs);
    }

    try {
      revalidatePath("/entregas");
      revalidatePath("/");
      revalidatePath("/rastreio");
    } catch (e) {
      console.warn("Revalidação ignorada em runtime:", e);
    }

    const updatedData = await getShippingData();
    return NextResponse.json({
      success: true,
      message: "Dados de logística e página de entregas salvos com sucesso!",
      ...updatedData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Erro ao atualizar dados de envio" },
      { status: 500 }
    );
  }
}
