'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminAuth } from '../../../lib/useAdminAuth';
import AdminSidebarShell from '../../../components/admin/AdminSidebarShell';
import StartApplicationButton from '../../../components/admin/StartApplicationButton';

type Row = {
  id: string;
  status: string;
  service_tier: string;
  exception_type: string | null;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  doc_type: string | null;
  verification_status: string | null;
  payment_status: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  INTAKE_STARTED: 'Intake started',
  DOCUMENTS_RECEIVED: 'Documents received',
  PAYMENT_PENDING: 'Payment pending',
  CAA_REVIEW: 'CAA review',
  SUBMITTED_IRS: 'Submitted to IRS',
  ARCHIVED_PII_SCRUBBED: 'Archived',
};

const STATUS_STYLES: Record<string, string> = {
  INTAKE_STARTED: 'bg-slate-100 text-slate-700',
  DOCUMENTS_RECEIVED: 'bg-blue-50 text-blue-700',
  PAYMENT_PENDING: 'bg-amber-50 text-amber-700',
  CAA_REVIEW: 'bg-teal-50 text-teal-700',
  SUBMITTED_IRS: 'bg-emerald-50 text-emerald-700',
  ARCHIVED_PII_SCRUBBED: 'bg-slate-100 text-slate-500',
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-bold ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
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
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [view, setView] = useState<'TABLE' | 'KANBAN'>('TABLE');

  useEffect(() => {
    if (!ready || !token) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/applications', { headers: { 'x-admin-token': token } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load clients.');
        setRows(data.applications || []);
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
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      const haystack = `${r.first_name} ${r.last_name} ${r.email} ${r.id} ${r.phone || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query, statusFilter]);

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-slate-400">Checking staff session...</div>;

  return (
    <AdminSidebarShell title="Clients" subtitle={`${filtered.length} of ${rows.length} client cases`}>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, email, phone, or reference ID..."
            className="w-80 rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-semibold"
          >
            <option value="ALL">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold">
            <button type="button" onClick={() => setView('TABLE')} className={`rounded-md px-3 py-1.5 ${view === 'TABLE' ? 'bg-ink-900 text-white' : 'text-slate-500'}`}>Table</button>
            <button type="button" onClick={() => setView('KANBAN')} className={`rounded-md px-3 py-1.5 ${view === 'KANBAN' ? 'bg-ink-900 text-white' : 'text-slate-500'}`}>Kanban</button>
          </div>
          <StartApplicationButton token={token as string} />
        </div>
      </div>

      {view === 'KANBAN' ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Object.entries(STATUS_LABELS).map(([status, label]) => {
            const cards = filtered.filter((r) => r.status === status);
            return (
              <div key={status} className="w-64 flex-none rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">{label}</p>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.length === 0 && <p className="text-[11px] text-slate-400">No cases</p>}
                  {cards.map((r) => (
                    <Link key={r.id} href={`/admin/clients/${r.id}`} className="block rounded-xl border border-slate-200 bg-white p-3 shadow-card hover:border-teal-300">
                      <p className="text-xs font-bold text-ink-900">{r.first_name} {r.last_name}</p>
                      <p className="mt-0.5 text-[10.5px] capitalize text-slate-500">{r.service_tier?.toLowerCase().replace(/_/g, ' ')}</p>
                      <p className="mt-1.5 font-mono text-[9.5px] text-slate-400">{r.id.slice(0, 8)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Service tier</th>
              <th className="px-4 py-3">Identity doc</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Received</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Loading clients...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">No clients match this search.</td></tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/clients/${r.id}`} className="font-semibold text-ink-900 hover:text-teal-700">
                    {r.first_name} {r.last_name}
                  </Link>
                  <div className="text-[10.5px] text-slate-500">{r.email}</div>
                </td>
                <td className="px-4 py-3 font-mono text-[10.5px] text-slate-500">{r.id.slice(0, 8)}</td>
                <td className="px-4 py-3 capitalize">{r.service_tier?.toLowerCase().replace(/_/g, ' ') || '—'}</td>
                <td className="px-4 py-3">{r.doc_type ? r.doc_type.replace(/_/g, ' ') : <span className="text-slate-400">Not uploaded</span>}</td>
                <td className="px-4 py-3 capitalize">{r.payment_status ? r.payment_status.toLowerCase() : <span className="text-slate-400">—</span>}</td>
                <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </AdminSidebarShell>
  );
}
