import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seo';
import './globals.css';
import { UTMTracker } from '@/components/analytics/utm-tracker';
import { WhatsAppFloatingButton } from '@/components/ui/whatsapp-floating-button';
import { LiveFloatingButton } from '@/components/ui/live-floating-button';
import { SiteSettingsProvider } from '@/components/providers/site-settings-provider';
import { CookieConsentBanner } from '@/components/legal/cookie-consent-banner';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: './' },
  title: 'Ótica Ventara | Eyewear Boutique & Laboratório Próprio em Araçatuba',
  description:
    'Ótica boutique em Araçatuba-SP. Armações em acetato nobre e titânio, lentes OPTiSYNC HD e montagem expressa em até 1 hora no laboratório próprio computadorizado.',
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
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_OG_IMAGE, alt: 'Fachada da Óticas Ventara em Araçatuba-SP' }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', images: [DEFAULT_OG_IMAGE] },
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
          <LiveFloatingButton />
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
