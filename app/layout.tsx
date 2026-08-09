import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import SiteHeader from '../components/layout/SiteHeader';
import SiteFooter from '../components/layout/SiteFooter';
import FloatingAssistant from '../components/layout/FloatingAssistant';
import ChromeGate from '../components/layout/ChromeGate';
import { getFirmProfile } from '../lib/firmProfile';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'PATSL ITIN Platform | Where Accuracy Meets Integrity',
    template: '%s | PATSL ITIN Platform',
  },
  description:
    'A secure ITIN intake, payment, identity review, and IRS package automation platform for professional document preparation workflows.',
};

export const viewport: Viewport = {
  themeColor: '#080e14',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const firm = getFirmProfile();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-abyss text-slate-300">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <ChromeGate>
          <SiteFooter />
        </ChromeGate>
        <ChromeGate>
          <FloatingAssistant phone={firm.phone} email={firm.email} />
        </ChromeGate>
      </body>
    </html>
  );
}
