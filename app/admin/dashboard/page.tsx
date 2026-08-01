'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../../lib/useAdminAuth';
import AdminSidebarShell from '../../../components/admin/AdminSidebarShell';

type Stats = { totalClients: number; activeCases: number; paymentPending: number; packagesThisMonth: number };
type ActivityRow = { id: string; event_type: string; actor: string; created_at: string; application_id: string | null; first_name: string | null; last_name: string | null };

const EVENT_LABELS: Record<string, string> = {
  INTAKE_CREATED: 'Application created',
  DOCUMENT_REGISTERED: 'Identity document uploaded',
  PAYMENT_LINK_CREATED: 'Payment link created',
  PAYMENT_PAID: 'Payment received',
  STATUS_UPDATED: 'Status updated',
  CASE_DATA_UPDATED: 'Case data updated',
  PACKAGE_GENERATED: 'Document package generated',
  PII_SCRUBBED: 'Identity data scrubbed (retention policy)',
};

export default function DashboardPage() {
  const { token, ready } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready || !token) return;
    (async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch('/api/admin/stats', { headers: { 'x-admin-token': token } }),
          fetch('/api/admin/activity', { headers: { 'x-admin-token': token } }),
        ]);
        const statsData = await statsRes.json();
        const activityData = await activityRes.json();
        if (!statsRes.ok) throw new Error(statsData.error || 'Failed to load stats.');
        setStats(statsData);
        setActivity(activityData.activity || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard.');
      }
    })();
  }, [ready, token]);

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-slate-400">Checking staff session...</div>;

  return (
    <AdminSidebarShell title="Dashboard" subtitle="Overview of every active case, payment, and document in the pipeline.">
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mb-6 grid grid-cols-4 gap-3">
        <StatCard label="Total clients" value={stats?.totalClients} />
        <StatCard label="Active cases" value={stats?.activeCases} note="In review or pending" />
        <StatCard label="Payment pending" value={stats?.paymentPending} note="Needs follow-up" warn />
        <StatCard label="Packages this month" value={stats?.packagesThisMonth} />
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-ink-900">Recent activity</h3>
          {activity.length === 0 && <p className="text-xs text-slate-500">No activity yet.</p>}
          <div className="space-y-0">
            {activity.map((a) => (
              <Link
                key={a.id}
                href={a.application_id ? `/admin/clients/${a.application_id}` : '#'}
                className="flex items-center justify-between gap-3 border-t border-slate-100 py-2.5 text-xs first:border-t-0 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  {EVENT_LABELS[a.event_type] || a.event_type}
                  {a.first_name && <span className="text-slate-400">— {a.first_name} {a.last_name}</span>}
                </span>
                <span className="whitespace-nowrap text-[10px] text-slate-400">{new Date(a.created_at).toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-sm font-bold text-ink-900">Quick tools</h3>
          <div className="space-y-1">
            <Link href="/admin/clients" className="block rounded-lg px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">👤 View all clients</Link>
            <Link href="/admin/documents" className="block rounded-lg px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">📄 Review documents</Link>
            <Link href="/admin/settings" className="block rounded-lg px-2 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">⚙ Check integration status</Link>
          </div>
        </div>
      </div>
    </AdminSidebarShell>
  );
}

function StatCard({ label, value, note, warn }: { label: string; value: number | undefined; note?: string; warn?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-ink-900">{value === undefined ? '—' : value}</p>
      {note && <p className={`mt-1 text-[11px] font-semibold ${warn ? 'text-amber-700' : 'text-teal-700'}`}>{note}</p>}
    </div>
  );
}
