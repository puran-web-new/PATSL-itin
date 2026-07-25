'use client';

import { useEffect, useState } from 'react';

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
};

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = window.sessionStorage.getItem('patsl-admin-token') || '';
    if (saved) {
      setToken(saved);
      loadApplications(saved);
    }
  }, []);

  async function loadApplications(value = token) {
    setLoading(true);
    setError('');
    try {
      window.sessionStorage.setItem('patsl-admin-token', value);
      const res = await fetch('/api/admin/applications', { headers: { 'x-admin-token': value } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load applications.');
      setApplications(data.applications || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Admin Console</p>
            <h1 className="mt-2 text-3xl font-bold text-white">PATSL Control Center</h1>
            <p className="mt-2 text-sm text-slate-400">Review applications, payment state, document verification, and generate IRS packages.</p>
          </div>
          <div className="flex gap-2">
            <input className="w-80 rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-white" type="password" placeholder="Admin access token" value={token} onChange={(e) => setToken(e.target.value)} />
            <button onClick={() => loadApplications()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">Load Queue</button>
          </div>
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
                <th className="p-4">Verification</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-900">
                  <td className="p-4"><div className="font-semibold text-white">{app.first_name} {app.last_name}</div><div className="text-xs text-slate-500">{app.email}</div></td>
                  <td className="p-4 text-slate-300">{app.service_tier}</td>
                  <td className="p-4"><span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{app.status}</span></td>
                  <td className="p-4 text-slate-300">{app.payment_status || 'PENDING'}</td>
                  <td className="p-4 text-slate-300">{app.ocr_confidence ? `${(Number(app.ocr_confidence) * 100).toFixed(0)}%` : app.verification_status || 'Not uploaded'}</td>
                  <td className="p-4 text-right"><button onClick={() => generatePackage(app.id, app.last_name)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500">Generate IRS Package</button></td>
                </tr>
              ))}
              {applications.length === 0 && !loading ? <tr><td className="p-8 text-center text-slate-500" colSpan={6}>No applications loaded.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
