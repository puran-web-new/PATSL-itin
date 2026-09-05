'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminAuth } from '../../../lib/useAdminAuth';
import AdminSidebarShell from '../../../components/admin/AdminSidebarShell';
import StartApplicationButton from '../../../components/admin/StartApplicationButton';

type ClientRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  application_count: number;
  total_paid_cents: number;
  latest_status: string | null;
  latest_service_tier: string | null;
  latest_application_at: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  INTAKE_STARTED: 'Intake started',
  DOCUMENTS_RECEIVED: 'Documents received',
  PAYMENT_PENDING: 'Payment pending',
  CAA_REVIEW: 'CAA review',
  PACKAGE_READY: 'Package ready for client',
  SUBMITTED_IRS: 'Submitted to IRS',
  ARCHIVED_PII_SCRUBBED: 'Archived',
};

const STATUS_STYLES: Record<string, string> = {
  INTAKE_STARTED: 'bg-white/5 text-slate-300',
  DOCUMENTS_RECEIVED: 'bg-blue-500/10 text-blue-300',
  PAYMENT_PENDING: 'bg-gold-500/10 text-gold-300',
  CAA_REVIEW: 'bg-mint-500/10 text-mint-300',
  PACKAGE_READY: 'bg-teal-500/10 text-teal-200',
  SUBMITTED_IRS: 'bg-mint-500/10 text-mint-300',
  ARCHIVED_PII_SCRUBBED: 'bg-white/5 text-slate-500',
};

function StatusPill({ status }: { status: string | null }) {
  if (!status) return <span className="text-slate-500">No applications yet</span>;
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-bold ${STATUS_STYLES[status] || 'bg-white/5 text-slate-400'}`}>
      {STATUS_LABELS[status] || status.replace(/_/g, ' ')}
    </span>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-slate-400">Loading clients...</div>}>
      <ClientsPageInner />
    </Suspense>
  );
}

function ClientsPageInner() {
  const { token, ready } = useAdminAuth();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    if (!ready || !token) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/clients', { headers: { 'x-admin-token': token } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load clients.');
        setRows(data.clients || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load clients.');
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, token]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesStatus = statusFilter === 'ALL' || r.latest_status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      const haystack = `${r.first_name} ${r.last_name} ${r.email} ${r.id} ${r.phone || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query, statusFilter]);

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-slate-400">Checking staff session...</div>;

  return (
    <AdminSidebarShell title="Clients" subtitle={`${filtered.length} of ${rows.length} clients — one row per person, every application rolled up`}>
      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-300">{error}</div>}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, email, phone, or client ID..."
            className="w-80 rounded-lg glass-card p-2.5 text-xs text-white placeholder:text-slate-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg glass-card p-2.5 text-xs font-semibold text-white"
          >
            <option value="ALL">All latest statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-white/10 p-1 text-[10.5px] font-semibold">
            <button type="button" onClick={() => setViewMode('table')} className={`rounded px-2 py-1 ${viewMode === 'table' ? 'bg-teal-500/20 text-teal-200' : 'text-slate-400'}`}>Table</button>
            <button type="button" onClick={() => setViewMode('grid')} className={`rounded px-2 py-1 ${viewMode === 'grid' ? 'bg-teal-500/20 text-teal-200' : 'text-slate-400'}`}>Grid</button>
          </div>
          <StartApplicationButton token={token as string} />
        </div>
      </div>

      <div className={viewMode === 'table' ? 'overflow-hidden glass-card' : 'hidden'}>
        <table className="w-full text-left text-xs">
          <thead className="bg-abyss-panel text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Applications</th>
              <th className="px-4 py-3">Total paid</th>
              <th className="px-4 py-3">Latest status</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Loading clients...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No clients match this search.</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-4 py-3">
                  <Link href={`/admin/clients/${r.id}`} className="font-semibold text-white hover:text-mint-300">
                    {r.first_name} {r.last_name}
                  </Link>
                  <div className="text-[10.5px] text-slate-500">{r.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-400">{r.phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-white/5 px-2 py-1 text-[10.5px] font-bold text-slate-300">
                    {r.application_count} {r.application_count === 1 ? 'case' : 'cases'}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-white">${(r.total_paid_cents / 100).toFixed(2)}</td>
                <td className="px-4 py-3"><StatusPill status={r.latest_status} /></td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewMode === 'grid' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading && <p className="col-span-full py-6 text-center text-sm text-slate-400">Loading clients...</p>}
          {!loading && filtered.length === 0 && <p className="col-span-full py-6 text-center text-sm text-slate-400">No clients match this search.</p>}
          {filtered.map((r) => (
            <Link key={r.id} href={`/admin/clients/${r.id}`} className="glass-card p-4 transition hover:border-teal-500/40 hover:bg-teal-500/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{r.first_name} {r.last_name}</p>
                  <p className="mt-1 break-all text-xs text-slate-400">{r.email}</p>
                </div>
                <StatusPill status={r.latest_status} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div><dt className="text-slate-500">Phone</dt><dd className="mt-1 text-slate-300">{r.phone || '—'}</dd></div>
                <div><dt className="text-slate-500">Cases</dt><dd className="mt-1 font-semibold text-white">{r.application_count}</dd></div>
                <div><dt className="text-slate-500">Total paid</dt><dd className="mt-1 font-semibold text-white">${(r.total_paid_cents / 100).toFixed(2)}</dd></div>
                <div><dt className="text-slate-500">Client since</dt><dd className="mt-1 text-slate-300">{new Date(r.created_at).toLocaleDateString()}</dd></div>
              </dl>
            </Link>
          ))}
        </div>
      )}
    </AdminSidebarShell>
  );
}
