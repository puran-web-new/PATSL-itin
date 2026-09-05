'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAdminAuth } from '../../../lib/useAdminAuth';
import AdminSidebarShell from '../../../components/admin/AdminSidebarShell';
import { viewDocument } from '../../../lib/viewDocument';

type DocRow = {
  id: string;
  application_id: string;
  doc_type: string;
  document_number: string | null;
  issuing_country: string | null;
  expiration_date: string | null;
  ocr_confidence: number | null;
  storage_path: string | null;
  verification_status: string;
  is_scrubbed: boolean;
  created_at: string;
  application_status: string;
  client_id: string;
  first_name: string;
  last_name: string;
  email: string;
};

const VERIFICATION_STYLES: Record<string, string> = {
  PENDING_REVIEW: 'bg-amber-50 text-amber-700',
  VERIFIED: 'bg-mint-500/10 text-mint-300',
  REJECTED: 'bg-red-50 text-red-700',
};

export default function DocumentsPage() {
  const { token, ready } = useAdminAuth();
  const [rows, setRows] = useState<DocRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('ALL');
  const [applications, setApplications] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!ready || !token) return;
    (async () => {
      setLoading(true);
      try {
        const [docsRes, appsRes] = await Promise.all([
          fetch('/api/admin/documents', { headers: { 'x-admin-token': token } }),
          fetch('/api/admin/applications', { headers: { 'x-admin-token': token } }),
        ]);
        const data = await docsRes.json(); const appsData = await appsRes.json();
        if (!docsRes.ok || !appsRes.ok) throw new Error(data.error || appsData.error || 'Failed to load the operations queue.');
        setRows(data.documents || []); setApplications(appsData.applications || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load documents.');
      } finally {
        setLoading(false);
      }
    })();
  }, [ready, token]);

  const docTypes = useMemo(() => Array.from(new Set(rows.map((r) => r.doc_type))), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (docTypeFilter !== 'ALL' && r.doc_type !== docTypeFilter) return false;
      if (!q) return true;
      const haystack = `${r.first_name} ${r.last_name} ${r.email} ${r.document_number || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query, docTypeFilter]);

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-slate-400">Checking staff session...</div>;

  return (
    <AdminSidebarShell title="Applications & documents" subtitle={`${applications.length} applications and ${rows.length} identity documents — open any record to continue work.`}>
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mb-5 glass-card p-4">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold text-white">Application queue</h2><span className="text-xs text-slate-500">Every pending and completed case</span></div>
        <div className="mb-3 flex flex-wrap gap-2"><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg bg-abyss-panel p-2 text-xs"><option value="ALL">All statuses</option>{Array.from(new Set(applications.map((a) => a.status))).map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}</select></div>
        <div className="max-h-72 overflow-auto"><table className="w-full text-left text-xs"><thead className="text-slate-500"><tr><th className="p-2">Client</th><th>Application</th><th>Status</th><th>Document</th><th>Payment</th><th/></tr></thead><tbody>{applications.filter((a) => statusFilter === 'ALL' || a.status === statusFilter).map((a) => <tr key={a.id} className="border-t border-white/10"><td className="p-2"><Link href={`/admin/clients/${a.client_id || ''}`} className="font-semibold text-white hover:text-mint-300">{a.first_name} {a.last_name}</Link><div className="text-slate-500">{a.email}</div></td><td>{a.service_tier?.replace(/_/g, ' ')}</td><td>{a.status.replace(/_/g, ' ')}</td><td>{a.doc_type ? a.doc_type.replace(/_/g, ' ') : 'Not uploaded'}</td><td>{a.payment_status || 'No invoice'}</td><td><Link href={`/admin/applications/${a.id}`} className="font-semibold text-mint-300 hover:underline">Open</Link></td></tr>)}</tbody></table></div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by client name, email, or document number..."
          className="w-80 rounded-lg glass-card p-2.5 text-xs"
        />
        <select
          value={docTypeFilter}
          onChange={(e) => setDocTypeFilter(e.target.value)}
          className="rounded-lg glass-card p-2.5 text-xs font-semibold"
        >
          <option value="ALL">All document types</option>
          {docTypes.map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden glass-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Issuer</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Verification</th>
              <th className="px-4 py-3">Uploaded</th>
              <th className="px-4 py-3">File</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Loading documents...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">No documents match this search.</td></tr>}
            {filtered.map((d) => (
              <tr key={d.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-4 py-3">
                  <Link href={`/admin/clients/${d.client_id}`} className="font-semibold text-white hover:text-mint-300">
                    {d.first_name} {d.last_name}
                  </Link>
                  <div className="text-[10.5px] text-slate-500">{d.email}</div>
                </td>
                <td className="px-4 py-3">
                  {d.doc_type.replace(/_/g, ' ')}
                  {d.document_number && <div className="text-[10.5px] text-slate-500">#{d.document_number}</div>}
                </td>
                <td className="px-4 py-3">{d.issuing_country || '—'}</td>
                <td className="px-4 py-3">{d.expiration_date ? new Date(d.expiration_date).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold ${VERIFICATION_STYLES[d.verification_status] || 'bg-white/5 text-slate-400'}`}>
                    {d.verification_status.toLowerCase().replace(/_/g, ' ')}
                  </span>
                  {d.is_scrubbed && <div className="mt-1 text-[10px] text-slate-400">Scrubbed (retention policy)</div>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">{new Date(d.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {d.storage_path && !d.is_scrubbed && token ? (
                    <button type="button" onClick={() => viewDocument(d.id, token)} className="font-semibold text-mint-300 hover:underline">View</button>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminSidebarShell>
  );
}
