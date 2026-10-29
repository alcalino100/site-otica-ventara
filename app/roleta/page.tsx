import type { Metadata } from "next";
import { RoletaClient } from "./roleta-client";

export const metadata: Metadata = {
  title: "Roleta de Benefícios Exclusivos | Óticas Ventara",
  description:
    "Gire a roleta oficial da Óticas Ventara, garanta seu código de desconto em armações e lentes de alta precisão e ative em nossa loja física de Araçatuba ou no site.",
  openGraph: {
    title: "Roleta de Benefícios Exclusivos | Óticas Ventara",
    description: "Gire a roleta oficial e ganhe seu desconto exclusivo na Óticas Ventara.",
    images: ["/images/brand/logo-ventara.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RoletaPage() {
  return <RoletaClient />;
}
