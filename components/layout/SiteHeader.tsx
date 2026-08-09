'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import GoldCrest from './GoldCrest';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/marketing', label: 'Services & Pricing' },
  { href: '/status', label: 'Track My Case' },
];

const NETWORK_LINKS = [
  { href: '/patsl-org', label: 'PATSL Network', description: 'Overview of the PATSL family of sites', external: false },
  { href: 'https://www.patsl.org', label: 'Nexus CAA Training', description: 'CAA forensic training academy', external: true },
  { href: 'https://www.puranaccounting.com', label: 'Puran Accounting Profile', description: "Puran Ramratan's accounting practice", external: true },
];

const MERIDIAN_ROUTES = new Set(['/', '/marketing', '/appointment', '/about', '/faq']);

export default function SiteHeader() {
  const pathname = usePathname();

  // The public marketing pages (Home, Pricing, Appointment, About, FAQ) render their
  // own Meridian-themed nav — skip the dark cyber-forensic header there so they don't stack.
  if (pathname && MERIDIAN_ROUTES.has(pathname)) return null;
  const [open, setOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const networkRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));
  const networkActive = pathname?.startsWith('/patsl-org');

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (networkRef.current && !networkRef.current.contains(e.target as Node)) setNetworkOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-teal-500/10 bg-abyss/95 backdrop-blur supports-[backdrop-filter]:bg-abyss/90">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <GoldCrest className="h-9 w-9" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-wide text-white">PATSL</span>
            <span className="label-mono text-[9px] font-medium uppercase text-mint-400">Accuracy Meets Integrity</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                isActive(link.href) ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div ref={networkRef} className="relative">
            <button
              type="button"
              onClick={() => setNetworkOpen((v) => !v)}
              aria-expanded={networkOpen}
              className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                networkOpen || networkActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              Our Network
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-3.5 w-3.5 transition-transform ${networkOpen ? 'rotate-180' : ''}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {networkOpen && (
              <div className="glass-card absolute right-0 top-full mt-2 w-72 overflow-hidden p-2 shadow-glow-cyan">
                {NETWORK_LINKS.map((link) =>
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setNetworkOpen(false)}
                      className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
                    >
                      <span className="flex items-center justify-between text-sm font-semibold text-white">
                        {link.label} <span aria-hidden className="text-[10px] text-mint-400">&#8599;</span>
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">{link.description}</span>
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setNetworkOpen(false)}
                      className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
                    >
                      <span className="text-sm font-semibold text-white">{link.label}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{link.description}</span>
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/portal/sign-in" className="text-sm font-medium text-slate-500 hover:text-white">
            Client Sign-In
          </Link>
          <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-white">
            Staff Sign-In
          </Link>
          <Link href="/itin-intake" className="btn-pill-primary">
            Start Application
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-slate-200 md:hidden"
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
        <div className="border-t border-teal-500/10 bg-abyss px-6 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-full px-3 py-2.5 text-sm font-medium ${
                  isActive(link.href) ? 'bg-white/10 text-white' : 'text-slate-400'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <p className="label-mono mt-3 px-3 text-[9.5px] uppercase text-slate-600">Our Network</p>
            {NETWORK_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="rounded-full px-3 py-2.5 text-sm font-medium text-slate-400"
                >
                  {link.label} &#8599;
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-full px-3 py-2.5 text-sm font-medium ${
                    isActive(link.href) ? 'bg-white/10 text-white' : 'text-slate-400'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}

            <div className="mt-3 border-t border-white/10 pt-3">
              <Link href="/portal/sign-in" onClick={() => setOpen(false)} className="block rounded-full px-3 py-2.5 text-sm font-medium text-slate-500">
                Client Sign-In
              </Link>
              <Link href="/admin" onClick={() => setOpen(false)} className="block rounded-full px-3 py-2.5 text-sm font-medium text-slate-500">
                Staff Sign-In
              </Link>
            </div>
            <Link href="/itin-intake" onClick={() => setOpen(false)} className="btn-pill-primary mt-2 w-full">
              Start Application
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
