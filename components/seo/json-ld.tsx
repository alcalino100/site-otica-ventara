import React from "react";
import { jsonLdString } from "@/lib/seo";

/** Injeta um ou mais blocos de dados estruturados (schema.org) na página. */
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const list = Array.isArray(data) ? data : [data];
  return (
    <>
      {list.map((item, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(item) }} />
      ))}
    </>
  );
}
