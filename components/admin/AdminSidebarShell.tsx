'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, ReactNode, useEffect, useState } from 'react';
import GoldCrest from '../layout/GoldCrest';
import { useAdminAuth } from '../../lib/useAdminAuth';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '▣' },
  { href: '/admin/clients', label: 'Clients', icon: '👤' },
  { href: '/admin/documents', label: 'Applications & documents', icon: '📄' },
  { href: '/admin/appointments', label: 'Appointments', icon: '📅' },
  { href: '/admin/payments', label: 'Accounting & billing', icon: '$' },
];

const NAV_SYSTEM = [{ href: '/admin/settings', label: 'Settings & tools', icon: '⚙' }];

const POLL_INTERVAL_MS = 30000;

export default function AdminSidebarShell({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { token } = useAdminAuth();
  const [pendingAppointments, setPendingAppointments] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch('/api/admin/appointments', { headers: { 'x-admin-token': token as string } });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const pending = (data.appointments || []).filter((a: { status: string }) => a.status === 'REQUESTED').length;
        setPendingAppointments(pending);
      } catch {
        // silent — the notification bell is a convenience, not a critical path
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token]);

  function signOut() {
    window.sessionStorage.removeItem('patsl-admin-token');
    router.replace('/admin');
  }

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/admin/clients?q=${encodeURIComponent(search.trim())}`);
  }

  return (
    <div className="grid min-h-screen grid-cols-[220px_1fr] bg-abyss text-white">
      <aside className="flex flex-col border-r border-teal-500/10 bg-abyss-raised p-3 text-slate-300">
        <Link href="/admin/dashboard" className="mb-3 flex items-center gap-2 border-b border-white/10 px-2 pb-4">
          <GoldCrest className="h-8 w-8" />
          <span>
            <span className="block text-xs font-bold text-white">PATSL Control Center</span>
            <span className="label-mono block text-[9px] uppercase text-mint-400">Staff portal</span>
          </span>
        </Link>

        <nav className="space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2.5 text-xs font-semibold ${
                pathname?.startsWith(item.href) ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="w-4 text-center text-[11px]">{item.icon}</span>
                {item.label}
              </span>
              {item.href === '/admin/appointments' && pendingAppointments > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-extrabold text-ink-950">
                  {pendingAppointments}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <p className="mb-1 mt-4 px-2.5 text-[9px] font-semibold uppercase tracking-widest text-slate-600">System</p>
        <nav className="space-y-0.5">
          {NAV_SYSTEM.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-xs font-semibold ${
                pathname?.startsWith(item.href) ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="w-4 text-center text-[11px]">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-0.5 border-t border-slate-800 pt-3">
          <Link href="/" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white">
            <span className="w-4 text-center text-[11px]">&larr;</span>Back to public site
          </Link>
          <button onClick={signOut} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white">
            <span className="w-4 text-center text-[11px]">&#9211;</span>Sign out
          </button>
        </div>
      </aside>

      <main className="overflow-auto p-6">
        <div className="mb-5 flex items-center justify-between">
          <form onSubmit={submitSearch}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients, references, documents..."
              className="w-80 rounded-full border border-white/10 bg-abyss-panel p-2.5 text-xs text-white placeholder:text-slate-500"
            />
          </form>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setBellOpen((v) => !v)}
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-abyss-panel text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <span aria-hidden className="text-sm">&#128276;</span>
                {pendingAppointments > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-extrabold text-ink-950">
                    {pendingAppointments}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div className="glass-card absolute right-0 top-full z-10 mt-2 w-72 overflow-hidden p-2 shadow-glow-cyan">
                  {pendingAppointments > 0 ? (
                    <Link
                      href="/admin/appointments"
                      onClick={() => setBellOpen(false)}
                      className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
                    >
                      <span className="text-sm font-semibold text-white">
                        {pendingAppointments} appointment{pendingAppointments === 1 ? '' : 's'} awaiting confirmation
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">Requested via the public Appointment page &rarr;</span>
                    </Link>
                  ) : (
                    <p className="px-3 py-2.5 text-xs text-slate-500">No new appointment requests.</p>
                  )}
                </div>
              )}
            </div>
            <span className="text-xs text-slate-500">Staff session</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-mint-500 to-teal-400 text-[10px] font-bold text-ink-950">PR</span>
          </div>
        </div>
        {title && (
          <div className="mb-5">
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
