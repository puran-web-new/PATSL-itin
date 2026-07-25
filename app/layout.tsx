import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'PATSL ITIN Platform',
  description: 'Where Accuracy Meets Integrity',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
