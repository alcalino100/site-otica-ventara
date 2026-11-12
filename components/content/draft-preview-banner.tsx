"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldAlert } from "lucide-react";

interface DraftPreviewBannerProps {
  pageId: string;
  isDraft?: boolean;
}

function DraftPreviewBannerInner({ pageId }: { pageId: string }) {
  const searchParams = useSearchParams();
  const [clientDraft, setClientDraft] = useState(false);

  useEffect(() => {
    if (searchParams.get("preview") === "draft") {
      setClientDraft(true);
    }
  }, [searchParams]);

  if (!clientDraft) return null;

  return (
    <div
      data-testid="draft-preview-banner"
      className="fixed top-0 inset-x-0 z-[100] bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold shadow-md flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} className="text-slate-950 animate-bounce" />
        <span>MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO (DRAFT) — Este conteúdo NÃO está visível para clientes.</span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/conteudo/${pageId}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 text-white hover:bg-slate-900 transition-colors text-[11px] font-semibold"
        >
          <ArrowLeft size={13} />
          <span>Voltar ao Editor</span>
        </Link>
      </div>
    </div>
  );
}

/**
 * Banner fixo exibido quando a página pública é acessada com o parâmetro ?preview=draft.
 * Avisa claramente que o conteúdo visualizado é um rascunho de trabalho ainda não publicado no ar.
 */
export function DraftPreviewBanner({ pageId, isDraft }: DraftPreviewBannerProps) {
  if (isDraft === true) {
    return (
      <div
        data-testid="draft-preview-banner"
        className="fixed top-0 inset-x-0 z-[100] bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold shadow-md flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-slate-950 animate-bounce" />
          <span>MODO PRÉ-VISUALIZAÇÃO DE RASCUNHO (DRAFT) — Este conteúdo NÃO está visível para clientes.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/conteudo/${pageId}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 text-white hover:bg-slate-900 transition-colors text-[11px] font-semibold"
          >
            <ArrowLeft size={13} />
            <span>Voltar ao Editor</span>
          </Link>
        </div>
      </div>
    );
  }

  if (isDraft === false) return null;

  return (
    <Suspense fallback={null}>
      <DraftPreviewBannerInner pageId={pageId} />
    </Suspense>
  );
}
