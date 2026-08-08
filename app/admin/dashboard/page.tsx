'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../../lib/useAdminAuth';
import AdminSidebarShell from '../../../components/admin/AdminSidebarShell';
import StartApplicationButton from '../../../components/admin/StartApplicationButton';

type Stats = {
  totalClients: number;
  activeCases: number;
  paymentPending: number;
  packagesThisMonth: number;
  applicationsByStatus: { status: string; count: number }[];
  applicationsBySource: { online: number; inHouse: number };
  documentsByVerification: { verification_status: string; count: number }[];
  paymentsSummary: { payment_status: string; count: number; total_cents: number }[];
};
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

const STATUS_ORDER = ['INTAKE_STARTED', 'DOCUMENTS_RECEIVED', 'PAYMENT_PENDING', 'CAA_REVIEW', 'SUBMITTED_IRS', 'ARCHIVED_PII_SCRUBBED'];
const STATUS_LABELS: Record<string, string> = {
  INTAKE_STARTED: 'Intake started',
  DOCUMENTS_RECEIVED: 'Documents received',
  PAYMENT_PENDING: 'Payment pending',
  CAA_REVIEW: 'CAA review',
  SUBMITTED_IRS: 'Submitted to IRS',
  ARCHIVED_PII_SCRUBBED: 'Archived',
};
// Applications in any of these statuses count as "in progress" for the pipeline summary.
const PENDING_STATUSES = new Set(['INTAKE_STARTED', 'DOCUMENTS_RECEIVED', 'PAYMENT_PENDING']);
const IN_PROGRESS_STATUSES = new Set(['CAA_REVIEW']);
const COMPLETED_STATUSES = new Set(['SUBMITTED_IRS', 'ARCHIVED_PII_SCRUBBED']);

const VERIFICATION_LABELS: Record<string, string> = {
  PENDING_REVIEW: 'Pending review',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
};

const PAYMENT_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
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

  const statusCounts: Record<string, number> = {};
  for (const row of stats?.applicationsByStatus || []) statusCounts[row.status] = row.count;
  const totalApplications = Object.values(statusCounts).reduce((sum, n) => sum + n, 0);

  let pendingCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;
  for (const [status, count] of Object.entries(statusCounts)) {
    if (PENDING_STATUSES.has(status)) pendingCount += count;
    else if (IN_PROGRESS_STATUSES.has(status)) inProgressCount += count;
    else if (COMPLETED_STATUSES.has(status)) completedCount += count;
  }

  const docCounts: Record<string, number> = {};
  for (const row of stats?.documentsByVerification || []) docCounts[row.verification_status] = row.count;
  const totalDocs = Object.values(docCounts).reduce((sum, n) => sum + n, 0);

  const paymentCounts: Record<string, { count: number; totalCents: number }> = {};
  for (const row of stats?.paymentsSummary || []) paymentCounts[row.payment_status] = { count: row.count, totalCents: row.total_cents };
  const totalCollectedCents = paymentCounts.PAID?.totalCents || 0;
  const totalPendingCents = paymentCounts.PENDING?.totalCents || 0;

  const onlineCount = stats?.applicationsBySource.online || 0;
  const inHouseCount = stats?.applicationsBySource.inHouse || 0;
  const sourceTotal = onlineCount + inHouseCount || 1;

  return (
    <AdminSidebarShell title="Dashboard" subtitle="Overview of every active case, payment, and document in the pipeline.">
      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-300">{error}</div>}

      <div className="mb-6 grid grid-cols-4 gap-3">
        <StatCard label="Total clients" value={stats?.totalClients} />
        <StatCard label="Pending" value={pendingCount} note="Intake / docs / payment" />
        <StatCard label="In progress" value={inProgressCount} note="CAA review" warn />
        <StatCard label="Completed" value={completedCount} note="Submitted or archived" good />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <h3 className="mb-3 text-sm font-bold text-white">Applications by status ({totalApplications})</h3>
          <div className="space-y-2">
            {STATUS_ORDER.map((status) => {
              const count = statusCounts[status] || 0;
              const pct = totalApplications ? Math.round((count / totalApplications) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">{STATUS_LABELS[status]}</span>
                    <span className="font-bold text-white">{count}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-mint-500 to-teal-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t border-white/10 pt-3 text-[10.5px] text-slate-500">
            <span className="font-semibold text-mint-300">{onlineCount}</span> online self-submitted &middot;{' '}
            <span className="font-semibold text-mint-300">{inHouseCount}</span> entered in-house by staff
            {sourceTotal > 1 && (
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full bg-teal-400" style={{ width: `${(onlineCount / sourceTotal) * 100}%` }} />
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="mb-3 text-sm font-bold text-white">Documents ({totalDocs})</h3>
          <div className="space-y-2.5">
            {Object.entries(VERIFICATION_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs">
                <span className="text-slate-300">{label}</span>
                <span className="font-bold text-white">{docCounts[key] || 0}</span>
              </div>
            ))}
          </div>
          <Link href="/admin/documents" className="mt-4 block text-center text-[10.5px] font-semibold text-mint-300 hover:underline">
            Review all documents &rarr;
          </Link>
        </div>

        <div className="glass-card p-5">
          <h3 className="mb-3 text-sm font-bold text-white">Payments</h3>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-mint-500/20 bg-mint-500/5 px-3 py-2">
              <p className="text-[10px] uppercase text-slate-500">Collected</p>
              <p className="text-sm font-bold text-white">${(totalCollectedCents / 100).toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-gold-500/20 bg-gold-500/5 px-3 py-2">
              <p className="text-[10px] uppercase text-slate-500">Outstanding</p>
              <p className="text-sm font-bold text-white">${(totalPendingCents / 100).toFixed(2)}</p>
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(PAYMENT_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs">
                <span className="text-slate-300">{label}</span>
                <span className="font-bold text-white">{paymentCounts[key]?.count || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <div className="glass-card p-5">
          <h3 className="mb-3 text-sm font-bold text-white">Recent activity</h3>
          {activity.length === 0 && <p className="text-xs text-slate-500">No activity yet.</p>}
          <div className="space-y-0">
            {activity.map((a) => (
              <Link
                key={a.id}
                href={a.application_id ? `/admin/applications/${a.application_id}` : '#'}
                className="flex items-center justify-between gap-3 border-t border-white/10 py-2.5 text-xs first:border-t-0 hover:bg-white/5"
              >
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint-500" />
                  {EVENT_LABELS[a.event_type] || a.event_type}
                  {a.first_name && <span className="text-slate-400">— {a.first_name} {a.last_name}</span>}
                </span>
                <span className="whitespace-nowrap text-[10px] text-slate-400">{new Date(a.created_at).toLocaleString()}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="mb-3 text-sm font-bold text-white">Quick tools</h3>
          <div className="mb-3">{token && <StartApplicationButton token={token} />}</div>
          <div className="space-y-1">
            <Link href="/admin/clients" className="block rounded-lg px-2 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5">👤 View all clients</Link>
            <Link href="/admin/documents" className="block rounded-lg px-2 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5">📄 Review documents</Link>
            <Link href="/admin/settings" className="block rounded-lg px-2 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5">⚙ Check integration status</Link>
          </div>
        </div>
      </div>
    </AdminSidebarShell>
  );
}

function StatCard({ label, value, note, warn, good }: { label: string; value: number | undefined; note?: string; warn?: boolean; good?: boolean }) {
  return (
    <div className="glass-card p-4">
      <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-white">{value === undefined ? '—' : value}</p>
      {note && <p className={`mt-1 text-[11px] font-semibold ${warn ? 'text-gold-400' : good ? 'text-mint-300' : 'text-slate-400'}`}>{note}</p>}
    </div>
  );
}
