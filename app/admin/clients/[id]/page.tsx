'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAdminAuth } from '../../../../lib/useAdminAuth';
import AdminSidebarShell from '../../../../components/admin/AdminSidebarShell';

type Application = {
  id: string;
  status: string;
  service_tier: string;
  exception_type: string | null;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
};

type Document = {
  id: string;
  doc_type: string;
  document_number: string | null;
  issuing_country: string | null;
  expiration_date: string | null;
  ocr_confidence: number | null;
  storage_path: string | null;
  verification_status: string;
  is_scrubbed: boolean;
  created_at: string;
};

type TimelineEvent = {
  id: string;
  event_type: string;
  actor: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

type Invoice = {
  id: string;
  square_order_id: string | null;
  square_payment_link: string | null;
  amount_cents: number;
  currency: string;
  payment_status: string;
  created_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  INTAKE_STARTED: 'Intake started',
  DOCUMENTS_RECEIVED: 'Documents received',
  PAYMENT_PENDING: 'Payment pending',
  CAA_REVIEW: 'CAA review',
  SUBMITTED_IRS: 'Submitted to IRS',
  ARCHIVED_PII_SCRUBBED: 'Archived',
};

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

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const { token, ready } = useAdminAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);

  async function load() {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/applications/${params.id}`, { headers: { 'x-admin-token': token } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load client.');
      setApplication(data.application);
      setDocuments(data.documents || []);
      setTimeline(data.timeline || []);
      setInvoices(data.invoices || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load client.');
    }
  }

  useEffect(() => {
    if (!ready || !token) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token, params.id]);

  async function changeStatus(status: string) {
    if (!token) return;
    setStatusSaving(true);
    try {
      const res = await fetch(`/api/admin/applications/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status.');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setStatusSaving(false);
    }
  }

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-slate-400">Checking staff session...</div>;

  return (
    <AdminSidebarShell
      title={application ? `${application.first_name} ${application.last_name}` : 'Client'}
      subtitle={application ? `Reference ${application.id}` : undefined}
    >
      <Link href="/admin/clients" className="mb-4 inline-block text-xs font-semibold text-slate-500 hover:text-teal-700">&larr; All clients</Link>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {!application ? (
        <p className="text-xs text-slate-500">Loading client file...</p>
      ) : (
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">Case overview</h3>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div><dt className="text-slate-500">Email</dt><dd className="font-semibold text-ink-900">{application.email}</dd></div>
                <div><dt className="text-slate-500">Phone</dt><dd className="font-semibold text-ink-900">{application.phone || '—'}</dd></div>
                <div><dt className="text-slate-500">Service tier</dt><dd className="font-semibold capitalize text-ink-900">{application.service_tier?.toLowerCase().replace(/_/g, ' ')}</dd></div>
                <div><dt className="text-slate-500">Reason / exception</dt><dd className="font-semibold capitalize text-ink-900">{application.exception_type?.toLowerCase().replace(/_/g, ' ') || '—'}</dd></div>
                <div><dt className="text-slate-500">Received</dt><dd className="font-semibold text-ink-900">{new Date(application.created_at).toLocaleString()}</dd></div>
                <div><dt className="text-slate-500">Last updated</dt><dd className="font-semibold text-ink-900">{new Date(application.updated_at).toLocaleString()}</dd></div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">Identity documents ({documents.length})</h3>
              {documents.length === 0 && <p className="text-xs text-slate-500">No identity documents uploaded yet.</p>}
              <div className="space-y-2">
                {documents.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs">
                    <div>
                      <p className="font-semibold text-ink-900">{d.doc_type.replace(/_/g, ' ')} {d.document_number ? `#${d.document_number}` : ''}</p>
                      <p className="text-[10.5px] text-slate-500">
                        {d.issuing_country || 'Unknown issuer'} · uploaded {new Date(d.created_at).toLocaleDateString()}
                        {d.is_scrubbed && ' · scrubbed (retention policy)'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold capitalize text-slate-600">{d.verification_status.toLowerCase().replace(/_/g, ' ')}</span>
                      {d.storage_path && !d.is_scrubbed && (
                        <a href={d.storage_path} target="_blank" rel="noreferrer" className="font-semibold text-teal-700 hover:underline">View</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">Case timeline</h3>
              {timeline.length === 0 && <p className="text-xs text-slate-500">No activity recorded yet.</p>}
              <div className="space-y-0">
                {timeline.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 border-t border-slate-100 py-2.5 text-xs first:border-t-0">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                      {EVENT_LABELS[t.event_type] || t.event_type}
                      <span className="text-slate-400">({t.actor})</span>
                    </span>
                    <span className="whitespace-nowrap text-[10px] text-slate-400">{new Date(t.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">Status</h3>
              <select
                value={application.status}
                disabled={statusSaving}
                onChange={(e) => changeStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-semibold"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">Quick actions</h3>
              <div className="space-y-1">
                <Link href={`/admin/applications/${application.id}`} className="block rounded-lg bg-teal-600 px-3 py-2.5 text-center text-xs font-semibold text-white hover:bg-teal-500">
                  Prepare application &amp; generate documents
                </Link>
                <p className="px-1 pt-1 text-[10.5px] text-slate-500">
                  One case file fills the W-7, Certificate of Accuracy, and Form 1040 together — review and generate the client, IRS-mail, and CAA-record packages from there.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-ink-900">Payments</h3>
              {invoices.length === 0 && <p className="text-xs text-slate-500">No payment link created yet.</p>}
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <div key={inv.id} className="rounded-lg border border-slate-100 px-3 py-2 text-xs">
                    <p className="font-semibold text-ink-900">${(inv.amount_cents / 100).toFixed(2)} {inv.currency}</p>
                    <p className="text-[10.5px] capitalize text-slate-500">{inv.payment_status.toLowerCase()} · {new Date(inv.created_at).toLocaleDateString()}</p>
                    {inv.square_payment_link && (
                      <a href={inv.square_payment_link} target="_blank" rel="noreferrer" className="text-[10.5px] font-semibold text-teal-700 hover:underline">View payment link</a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminSidebarShell>
  );
}
