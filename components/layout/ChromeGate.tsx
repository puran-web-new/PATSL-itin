'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

// The public marketing pages (Home, Pricing, Appointment, About, FAQ) render
// their own Meridian-themed nav/footer — this hides the shared dark
// cyber-forensic chrome (footer, floating assistant) on those routes so the
// two themes never stack. Server Components can still be passed in as
// `children` here even though this wrapper itself is a Client Component.
const MERIDIAN_ROUTES = new Set(['/', '/marketing', '/appointment', '/about', '/faq']);

export default function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname && MERIDIAN_ROUTES.has(pathname)) return null;
  return <>{children}</>;
}
