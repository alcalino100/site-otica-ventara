import type { Metadata } from 'next';
import './globals.css';
import { UTMTracker } from '@/components/analytics/utm-tracker';
import { WhatsAppFloatingButton } from '@/components/ui/whatsapp-floating-button';
import { SiteSettingsProvider } from '@/components/providers/site-settings-provider';
import { CookieConsentBanner } from '@/components/legal/cookie-consent-banner';

export const metadata: Metadata = {
  title: 'Ótica Ventara | Eyewear Boutique & Laboratório Próprio em Araçatuba',
  description:
    'Ótica boutique em Araçatuba-SP. Armações em acetato italiano e titânio, lentes OPTiSYNC HD e montagem expressa em até 1 hora no laboratório próprio computadorizado.',
  keywords: [
    'ótica em araçatuba',
    'armações de óculos',
    'óculos de grau',
    'óculos de sol',
    'lentes multifocais',
    'ótica ventara',
    'laboratório próprio ótica',
  ],
  openGraph: {
    title: 'Ótica Ventara | Eyewear Boutique em Araçatuba',
    description:
      'Armações exclusivas, lentes OPTiSYNC HD de alta precisão e montagem expressa em até 1 hora no laboratório próprio.',
    url: 'https://www.oticasventara.com.br',
    siteName: 'Ótica Ventara',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <SiteSettingsProvider>
          <UTMTracker />
          {children}
          <CookieConsentBanner />
          <WhatsAppFloatingButton />
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
