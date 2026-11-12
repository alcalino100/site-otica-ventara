import { requireAdmin } from "@/lib/auth/require-admin";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.authorized) {
    return auth.response;
  }
  try {
    const csvPath = path.join(process.cwd(), "auditoria-produtos-ventara.csv");
    if (!fs.existsSync(csvPath)) {
      return NextResponse.json(
        { error: "Relatório de auditoria ainda não gerado." },
        { status: 404 }
      );
    }

    const csvContent = fs.readFileSync(csvPath, "utf-8");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="auditoria-produtos-ventara.csv"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro ao ler relatório de auditoria." },
      { status: 500 }
    );
  }
}
