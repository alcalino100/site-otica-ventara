import type { Metadata } from 'next';
import './globals.css';
import { UTMTracker } from '@/components/analytics/utm-tracker';

export const metadata: Metadata = {
  title: 'Ótica Ventara | Um novo olhar para você',
  description: 'Conheça a proposta da Ótica Ventara. Armações, lentes e cuidado para o seu olhar. Site demonstrativo.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <UTMTracker />
        {children}
      </body>
    </html>
  );
}
