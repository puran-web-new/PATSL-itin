import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import SiteHeader from '../components/layout/SiteHeader';
import SiteFooter from '../components/layout/SiteFooter';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'PATSL ITIN Platform | Where Accuracy Meets Integrity',
    template: '%s | PATSL ITIN Platform',
  },
  description:
    'A secure ITIN intake, payment, identity review, and IRS package automation platform for professional document preparation workflows.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-ink-900">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
