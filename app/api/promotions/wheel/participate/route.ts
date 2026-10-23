import { NextRequest, NextResponse } from "next/server";
import { wheelLeadFormSchema } from "@/types/promotion-wheel";
import { PromotionService } from "@/lib/promotions/promotion-service";

export const dynamic = "force-dynamic";

// Rate limiting compartilhado em memória
const ipRateLimits = new Map<string, { count: number; expiresAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateLimits.get(ip);
  if (!entry || entry.expiresAt < now) {
    ipRateLimits.set(ip, { count: 1, expiresAt: now + 60000 }); // 1 minuto
    return true;
  }
  if (entry.count >= 5) {
    return false; // Máximo de 5 envios por minuto por IP
  }
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Muitas tentativas em pouco tempo. Por favor, aguarde um minuto." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 1. Validação estrita dos dados via Zod
    const validationResult = wheelLeadFormSchema.safeParse({
      name: body.name,
      phone: body.phone,
      marketingOptIn: body.marketingOptIn ?? false,
      hp_field: body.hp_field ?? "",
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || "Dados inválidos.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, phone, marketingOptIn, hp_field } = validationResult.data;

    // 2. Processamento seguro pelo serviço
    const result = await PromotionService.processParticipation(
      {
        name,
        phone,
        marketingOptIn,
        campaignId: body.campaignId || "camp-ventara-revelacao-v1",
        campaignVersion: body.campaignVersion || 1,
        idempotencyKey: body.idempotencyKey || `idem-${Date.now()}`,
        clientElapsedMs: body.clientElapsedMs || 2500,
        hp_field,
      },
      ip,
      req.headers.get("user-agent") || "Unknown"
    );

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error("[API Promotion Participate] Erro:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao processar sua participação na promoção." },
      { status: 400 }
    );
  }
}
