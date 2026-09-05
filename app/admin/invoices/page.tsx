'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminSidebarShell from '../../../components/admin/AdminSidebarShell';
import { useAdminAuth } from '../../../lib/useAdminAuth';

type Invoice = { id: string; application_id: string; amount_cents: number; currency: string; payment_status: string; paid_at: string | null; created_at: string; first_name: string; last_name: string; email: string };

export default function InvoicesPage() {
  const { token, ready } = useAdminAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready || !token) return;
    fetch('/api/admin/invoices', { headers: { 'x-admin-token': token } })
      .then(async (res) => { const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Failed to load invoices.'); return data; })
      .then((data) => setInvoices(data.invoices || []))
      .catch((err) => setError(err.message));
  }, [ready, token]);

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-slate-400">Checking staff session...</div>;
  const collected = invoices.filter((i) => i.payment_status === 'PAID').reduce((sum, i) => sum + i.amount_cents, 0);
  const outstanding = invoices.filter((i) => i.payment_status === 'PENDING').reduce((sum, i) => sum + i.amount_cents, 0);

  return <AdminSidebarShell title="Invoices & payments" subtitle="Payment records and outstanding balances.">
    {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
    <div className="mb-5 grid grid-cols-2 gap-4">
      <div className="glass-card p-4"><p className="text-xs text-slate-500">Collected</p><p className="mt-1 text-2xl font-bold text-white">${(collected / 100).toFixed(2)}</p></div>
      <div className="glass-card p-4"><p className="text-xs text-slate-500">Outstanding</p><p className="mt-1 text-2xl font-bold text-white">${(outstanding / 100).toFixed(2)}</p></div>
    </div>
    <div className="overflow-hidden glass-card"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="px-4 py-3">Client</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th></tr></thead><tbody>
      {invoices.map((invoice) => <tr key={invoice.id} className="border-t border-white/10"><td className="px-4 py-3"><Link className="font-semibold text-white hover:text-mint-300" href={`/admin/applications/${invoice.application_id}`}>{invoice.first_name} {invoice.last_name}</Link><div className="text-slate-500">{invoice.email}</div></td><td className="px-4 py-3 text-white">${(invoice.amount_cents / 100).toFixed(2)} {invoice.currency}</td><td className="px-4 py-3">{invoice.payment_status}</td><td className="px-4 py-3 text-slate-500">{new Date(invoice.created_at).toLocaleDateString()}</td></tr>)}
      {!error && invoices.length === 0 && <tr><td className="px-4 py-6 text-slate-500" colSpan={4}>No invoices found.</td></tr>}
    </tbody></table></div>
  </AdminSidebarShell>;
}
