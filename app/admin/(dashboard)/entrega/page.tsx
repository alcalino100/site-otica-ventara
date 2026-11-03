import { Metadata } from "next";
import { getShippingCmsDocument, getShippingCmsHistory } from "@/lib/shipping-cms-repository";
import { ShippingCmsAdmin } from "@/components/admin/shipping-cms/shipping-cms-admin";

export const metadata: Metadata = {
  title: "Gerenciador CMS /entregas | Admin Ótica Ventara",
  description:
    "Painel modular completo para gestão de conteúdo, imagens, seções e design tokens da página de entregas.",
};

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const initialDoc = await getShippingCmsDocument("draft");
  const initialHistory = await getShippingCmsHistory(10);

  return (
    <ShippingCmsAdmin
      initialDocument={initialDoc}
      initialHistory={initialHistory}
    />
  );
}
