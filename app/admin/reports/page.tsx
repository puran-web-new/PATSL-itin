'use client';

import { useEffect, useState } from 'react';
import AdminSidebarShell from '../../../components/admin/AdminSidebarShell';
import { useAdminAuth } from '../../../lib/useAdminAuth';

type Stats = { totalClients: number; activeCases: number; paymentPending: number; packagesThisMonth: number; paymentsSummary: { payment_status: string; count: number; total_cents: number }[] };

export default function ReportsPage() {
  const { token, ready } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!ready || !token) return;
    fetch('/api/admin/stats', { headers: { 'x-admin-token': token } })
      .then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Failed to load reports.'); return data; })
      .then(setStats).catch((err) => setError(err.message));
  }, [ready, token]);
  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-slate-400">Checking staff session...</div>;
  return <AdminSidebarShell title="Accounting reports" subtitle="Live case, payment, and package summaries.">
    {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
    <div className="grid grid-cols-4 gap-4">{[
      ['Total clients', stats?.totalClients], ['Active cases', stats?.activeCases], ['Payment pending', stats?.paymentPending], ['Packages this month', stats?.packagesThisMonth],
    ].map(([label, value]) => <div key={String(label)} className="glass-card p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-white">{value ?? '—'}</p></div>)}</div>
    <div className="mt-5 glass-card p-5"><h2 className="text-sm font-bold text-white">Payment summary</h2><div className="mt-3 space-y-2">{(stats?.paymentsSummary || []).map((row) => <div key={row.payment_status} className="flex justify-between border-t border-white/10 pt-2 text-xs"><span className="text-slate-300">{row.payment_status}</span><span className="font-semibold text-white">{row.count} invoices · ${(row.total_cents / 100).toFixed(2)}</span></div>)}</div></div>
  </AdminSidebarShell>;
}
