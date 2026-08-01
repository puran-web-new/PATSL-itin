'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/marketing', label: 'Services & Pricing' },
  { href: '/status', label: 'Track My Case' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/95 backdrop-blur supports-[backdrop-filter]:bg-ink-950/90">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-brand-500 text-sm font-extrabold text-white shadow-[0_4px_14px_rgba(20,184,166,0.35)]">
            P
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-wide text-white">PATSL</span>
            <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-teal-200">Accuracy Meets Integrity</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href) ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/admin" className="text-sm font-medium text-slate-400 hover:text-white">
            Staff Sign-In
          </Link>
          <Link
            href="/itin-intake"
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2.5 text-sm font-bold text-ink-950 shadow-[0_6px_16px_rgba(20,184,166,0.3)] transition-colors hover:from-teal-400 hover:to-teal-500"
          >
            Start Application
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-slate-200 md:hidden"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-ink-950 px-6 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2.5 text-sm font-medium ${
                  isActive(link.href) ? 'bg-white/10 text-white' : 'text-slate-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-400">
              Staff Sign-In
            </Link>
            <Link
              href="/itin-intake"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3 text-center text-sm font-bold text-ink-950"
            >
              Start Application
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
