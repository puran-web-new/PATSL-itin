'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import RimRing from './RimRing';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/marketing', label: 'Pricing' },
  { href: '/appointment', label: 'Appointment' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
];

const RING_TIMING: { duration: string; reverse?: boolean }[] = [
  { duration: '5s' },
  { duration: '5.6s', reverse: true },
  { duration: '5.1s' },
  { duration: '4.9s' },
  { duration: '4.4s' },
];

export default function MeridianNav({ large = false, cta }: { large?: boolean; cta: { label: string; href: string } }) {
  const pathname = usePathname();

  return (
    <nav className="mrd-nav" style={{ padding: large ? '1.4rem 2.5rem' : '1.1rem 2.5rem' }}>
      <Link href="/" className="flex flex-shrink-0 items-center gap-2">
        <Image
          src="/meridian/patsl-wordmark.png"
          alt="PATSL — ITIN Nexus Suite"
          width={220}
          height={105}
          priority={large}
          className="mrd-gold-filter w-auto object-contain"
          style={{ height: large ? 88 : 46 }}
        />
      </Link>

      <ul className="order-3 flex w-full flex-wrap items-center justify-center gap-2.5 md:order-none md:w-auto md:flex-nowrap">
        {LINKS.map((link, i) => {
          const active = link.href === '/' ? pathname === '/' : pathname === link.href;
          return (
            <li key={link.href} className="relative">
              <Link href={link.href} className={`mrd-nav-pill ${active ? 'mrd-active' : ''}`}>
                {!active && <RimRing gradient="conic-gradient(from 0deg, transparent 0deg, transparent 250deg, #1de9c2 290deg, #39e08a 315deg, #1de9c2 340deg, transparent 360deg)" duration={RING_TIMING[i].duration} reverse={RING_TIMING[i].reverse} />}
                <span className="relative z-[1]">{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link href={cta.href} className="mrd-btn-primary flex-shrink-0">
        {cta.label}
      </Link>
    </nav>
  );
}
