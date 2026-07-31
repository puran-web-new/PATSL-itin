'use client';

import { useEffect, useMemo, useState } from 'react';

type Application = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  service_tier: string;
  exception_type: string;
  payment_status: string | null;
  ocr_confidence: number | null;
  verification_status: string | null;
  storage_path: string | null;
  created_at: string;
};

const STATUS_OPTIONS = [
  'INTAKE_STARTED',
  'DOCUMENTS_RECEIVED',
  'PAYMENT_PENDING',
  'CAA_REVIEW',
  'SUBMITTED_IRS',
  'ARCHIVED_PII_SCRUBBED',
];

const STATUS_STYLES: Record<string, string> = {
  INTAKE_STARTED: 'bg-slate-800 text-slate-300',
  DOCUMENTS_RECEIVED: 'bg-sky-900 text-sky-300',
  PAYMENT_PENDING: 'bg-amber-900 text-amber-300',
  CAA_REVIEW: 'bg-indigo-900 text-indigo-300',
  SUBMITTED_IRS: 'bg-emerald-900 text-emerald-300',
  ARCHIVED_PII_SCRUBBED: 'bg-slate-800 text-slate-500',
};

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [authed, setAuthed] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.sessionStorage.getItem('patsl-admin-token') || '';
    if (saved) {
      setToken(saved);
      loadApplications(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadApplications(value = token) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/applications', { headers: { 'x-admin-token': value } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load applications.');
      window.sessionStorage.setItem('patsl-admin-token', value);
      setApplications(data.applications || []);
      setAuthed(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications.');
      setAuthed(false);
      window.sessionStorage.removeItem('patsl-admin-token');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(applicationId: string, status: string) {
    setUpdatingId(applicationId);
    setError('');
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status update failed.');
      setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status } : app)));
    } catch (err: any) {
      setError(err.message || 'Status update failed.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function generatePackage(applicationId: string, lastName: string) {
    setError('');
    const res = await fetch('/api/generate-packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ applicationId, packageType: 'IRS_MAIL' }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Package generation failed.');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PATSL_ITIN_${lastName}_${applicationId.slice(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  function signOut() {
    window.sessionStorage.removeItem('patsl-admin-token');
    setToken('');
    setAuthed(false);
    setApplications([]);
  }

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
      const haystack = `${app.first_name} ${app.last_name} ${app.email}`.toLowerCase();
      const matchesSearch = !search.trim() || haystack.includes(search.trim().toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, search]);

  if (!authed) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-ink-950 px-6 py-16">
        <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">Staff access</p>
          <h1 className="mt-2 text-2xl font-bold text-white">PATSL Admin Console</h1>
          <p className="mt-2 text-sm text-slate-400">Enter your admin access token to open the review queue.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadApplications();
            }}
            className="mt-6 space-y-3"
          >
            <input
              autoFocus
              type="password"
              placeholder="Admin access token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white"
            />
            {error && <p className="text-left text-xs text-red-400">{error}</p>}
            <button disabled={loading || !token} className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-500 disabled:bg-slate-700">
              {loading ? 'Verifying...' : 'Sign in'}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-ink-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">Admin Console</p>
            <h1 className="mt-2 text-3xl font-bold text-white">PATSL Control Center</h1>
            <p className="mt-2 text-sm text-slate-400">Review applications, payment state, document verification, and generate IRS packages.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => loadApplications()} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500">
              Refresh queue
            </button>
            <button onClick={signOut} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-900">
              Sign out
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-white"
          >
            <option value="ALL">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <span className="text-xs text-slate-500">{filtered.length} of {applications.length} applications</span>
        </div>

        {error && <div className="mb-6 rounded-lg border border-red-900 bg-red-950 p-4 text-sm text-red-200">{error}</div>}
        {loading ? <p className="text-slate-400">Loading applications...</p> : null}

        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-4">Client</th>
                <th className="p-4">Tier</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Identity doc</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-slate-900">
                  <td className="p-4">
                    <div className="font-semibold text-white">{app.first_name} {app.last_name}</div>
                    <div className="text-xs text-slate-500">{app.email}</div>
                    <div className="mt-1 font-mono text-[10px] text-slate-600">{app.id}</div>
                  </td>
                  <td className="p-4 text-slate-300">{app.service_tier}</td>
                  <td className="p-4">
                    <select
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className={`rounded-full border-0 px-3 py-1 text-xs font-semibold ${STATUS_STYLES[app.status] || 'bg-slate-800 text-slate-300'}`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status} className="bg-slate-900 text-slate-100">
                          {status.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-slate-300">{app.payment_status || 'PENDING'}</td>
                  <td className="p-4 text-slate-300">
                    {app.storage_path ? (
                      <a href={app.storage_path} target="_blank" rel="noreferrer" className="text-brand-400 underline hover:text-brand-300">
                        View document
                      </a>
                    ) : app.ocr_confidence ? (
                      `${(Number(app.ocr_confidence) * 100).toFixed(0)}% match`
                    ) : (
                      app.verification_status || 'Not uploaded'
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => generatePackage(app.id, app.last_name)} className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-500">
                      Generate IRS Package
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading ? (
                <tr><td className="p-8 text-center text-slate-500" colSpan={6}>No applications match the current filters.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
