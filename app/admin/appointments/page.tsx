'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../../lib/useAdminAuth';
import AdminSidebarShell from '../../../components/admin/AdminSidebarShell';

type Appointment = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  service_tier: string | null;
  status: string;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  REQUESTED: 'bg-gold-500/10 text-gold-300',
  CONFIRMED: 'bg-mint-500/10 text-mint-300',
  COMPLETED: 'bg-white/5 text-slate-400',
  CANCELLED: 'bg-red-500/10 text-red-300',
};

export default function AdminAppointmentsPage() {
  const { token, ready } = useAdminAuth();
  const [rows, setRows] = useState<Appointment[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/appointments', { headers: { 'x-admin-token': token } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load appointments.');
      setRows(data.appointments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments.');
    }
  }

  useEffect(() => {
    if (!ready || !token) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token]);

  async function updateStatus(id: string, status: string) {
    if (!token) return;
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update appointment.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to update appointment.');
    } finally {
      setSaving(null);
    }
  }

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-slate-400">Checking staff session...</div>;

  return (
    <AdminSidebarShell title="Appointments" subtitle="In-person CAA verification requests from the public Appointment page.">
      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-300">{error}</div>}

      <div className="overflow-hidden glass-card">
        <table className="w-full text-left text-xs">
          <thead className="bg-abyss-panel text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Requested by</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Preferred time</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Requested</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">No appointment requests yet.</td></tr>
            )}
            {rows.map((a) => (
              <tr key={a.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-4 py-3 font-semibold text-white">{a.full_name}</td>
                <td className="px-4 py-3 text-slate-400">
                  <div>{a.email}</div>
                  {a.phone && <div className="text-[10.5px] text-slate-500">{a.phone}</div>}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {a.preferred_date ? new Date(a.preferred_date).toLocaleDateString() : '—'} {a.preferred_time || ''}
                </td>
                <td className="px-4 py-3 text-slate-400">{a.service_tier?.replace(/_/g, ' ') || '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">{new Date(a.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <select
                    value={a.status}
                    disabled={saving === a.id}
                    onChange={(e) => updateStatus(a.id, e.target.value)}
                    className={`rounded-full border border-white/10 bg-abyss-panel px-2.5 py-1.5 text-[10.5px] font-bold ${STATUS_STYLES[a.status] || 'text-slate-300'}`}
                  >
                    <option value="REQUESTED">Requested</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminSidebarShell>
  );
}
