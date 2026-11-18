"use client";

import React, { useEffect, useState } from "react";
import type { Product } from "@/types/ecommerce";
import { adminRequest } from "@/lib/admin-fetch";
import { PicksManager } from "./picks-manager";

interface Props {
  products: Product[];
  onFeedback: (msg: string) => void;
}

/** Escolhe quais óculos aparecem primeiro (e em que ordem) na vitrine "Escolhas que combinam com você" da Home. */
export function HomePicksManager({ products, onFeedback }: Props) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const r = await adminRequest("/api/admin/settings");
      setIds(r.ok && Array.isArray(r.data?.home_catalog_picks) ? (r.data.home_catalog_picks as string[]) : []);
    })();
  }, []);

  return (
    <PicksManager
      testId="home-picks-manager"
      title='Vitrine da Home: "Escolhas que combinam com você"'
      description="Escolha os óculos que aparecem primeiro na página inicial, na ordem que quiser. Sem nenhum escolhido, o site mostra os destaques de sempre."
      items={products
        .filter((p) => p.is_published)
        .map((p) => ({ id: p.id, name: p.name, image: p.images?.find((i) => i.is_primary)?.url || p.images?.[0]?.url }))}
      initialIds={ids}
      onFeedback={onFeedback}
      onSave={async (next) => {
        const r = await adminRequest("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ home_catalog_picks: next }),
        });
        if (r.ok) setIds(next);
        return r.ok ? null : r.error || "Não foi possível salvar a vitrine da Home.";
      }}
    />
  );
}
