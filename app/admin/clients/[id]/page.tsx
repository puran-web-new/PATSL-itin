'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAdminAuth } from '../../../../lib/useAdminAuth';
import AdminSidebarShell from '../../../../components/admin/AdminSidebarShell';
import { viewDocument } from '../../../../lib/viewDocument';
import { applicationReference } from '../../../../lib/applicationReference';
import CreatePaymentLinkForm from '../../../../components/admin/CreatePaymentLinkForm';

type Client = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  created_at: string;
};

type Application = {
  id: string;
  status: string;
  service_tier: string;
  exception_type: string | null;
  created_at: string;
  updated_at: string;
};

type Document = {
  id: string;
  application_id: string;
  doc_type: string;
  document_number: string | null;
  issuing_country: string | null;
  verification_status: string;
  storage_path: string | null;
  is_scrubbed: boolean;
  created_at: string;
};

type Invoice = {
  id: string;
  application_id: string;
  amount_cents: number;
  currency: string;
  payment_status: string;
  square_payment_link: string | null;
  created_at: string;
};

type TimelineEvent = {
  id: string;
  application_id: string;
  event_type: string;
  actor: string;
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

const STATUS_STYLES: Record<string, string> = {
  INTAKE_STARTED: 'border-white/10 text-slate-300',
  DOCUMENTS_RECEIVED: 'border-blue-500/30 text-blue-300',
  PAYMENT_PENDING: 'border-gold-500/30 text-gold-300',
  CAA_REVIEW: 'border-mint-500/30 text-mint-300',
  SUBMITTED_IRS: 'border-mint-500/30 text-mint-300',
  ARCHIVED_PII_SCRUBBED: 'border-white/10 text-slate-500',
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
  const [client, setClient] = useState<Client | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [error, setError] = useState('');
  const [statusSaving, setStatusSaving] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/clients/${params.id}`, { headers: { 'x-admin-token': token } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load client.');
      setClient(data.client);
      setApplications(data.applications || []);
      setDocuments(data.documents || []);
      setInvoices(data.invoices || []);
      setTimeline(data.timeline || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load client.');
    }
  }

  useEffect(() => {
    if (!ready || !token) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, token, params.id]);

  async function changeStatus(applicationId: string, status: string) {
    if (!token) return;
    setStatusSaving(applicationId);
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
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
      setStatusSaving(null);
    }
  }

  function refLabel(applicationId: string) {
    return applicationReference(applicationId);
  }

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-slate-400">Checking staff session...</div>;

  const totalPaidCents = invoices.filter((i) => i.payment_status === 'PAID').reduce((sum, i) => sum + i.amount_cents, 0);

  return (
    <AdminSidebarShell
      title={client ? `${client.first_name} ${client.last_name}` : 'Client'}
      subtitle={client ? `${applications.length} application${applications.length === 1 ? '' : 's'} · client since ${new Date(client.created_at).toLocaleDateString()}` : undefined}
    >
      <Link href="/admin/clients" className="mb-4 inline-block text-xs font-semibold text-slate-500 hover:text-mint-300">&larr; All clients</Link>

      {error && <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-300">{error}</div>}

      {!client ? (
        <p className="text-xs text-slate-500">Loading client file...</p>
      ) : (
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <div className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="mb-3 text-sm font-bold text-white">General information</h3>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div><dt className="text-slate-500">Email</dt><dd className="font-semibold text-white">{client.email}</dd></div>
                <div><dt className="text-slate-500">Phone</dt><dd className="font-semibold text-white">{client.phone || '—'}</dd></div>
                <div><dt className="text-slate-500">Client since</dt><dd className="font-semibold text-white">{new Date(client.created_at).toLocaleDateString()}</dd></div>
                <div><dt className="text-slate-500">Total paid</dt><dd className="font-semibold text-white">${(totalPaidCents / 100).toFixed(2)}</dd></div>
              </dl>
            </div>

            <div className="glass-card p-5">
              <h3 className="mb-3 text-sm font-bold text-white">Applications ({applications.length})</h3>
              {applications.length === 0 && <p className="text-xs text-slate-500">No applications on file for this client yet.</p>}
              <div className="space-y-3">
                {applications.map((app) => (
                  <div key={app.id} className="rounded-xl border border-white/10 p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-mono text-[10.5px] text-slate-500">Reference {refLabel(app.id)}</p>
                        <p className="text-xs font-bold capitalize text-white">{app.service_tier?.toLowerCase().replace(/_/g, ' ')}</p>
                      </div>
                      <select
                        value={app.status}
                        disabled={statusSaving === app.id}
                        onChange={(e) => changeStatus(app.id, e.target.value)}
                        className={`rounded-full border bg-abyss-panel px-2.5 py-1.5 text-[10.5px] font-bold ${STATUS_STYLES[app.status] || 'border-white/10 text-slate-300'}`}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-slate-500">
                      <span>
                        Opened {new Date(app.created_at).toLocaleDateString()} · updated {new Date(app.updated_at).toLocaleDateString()}
                        {app.exception_type && ` · ${app.exception_type.toLowerCase().replace(/_/g, ' ')}`}
                      </span>
                      <Link href={`/admin/applications/${app.id}`} className="font-semibold text-mint-300 hover:underline">
                        Prepare application &amp; generate documents &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="mb-3 text-sm font-bold text-white">Identity documents ({documents.length})</h3>
              {documents.length === 0 && <p className="text-xs text-slate-500">No identity documents uploaded yet.</p>}
              <div className="space-y-2">
                {documents.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs">
                    <div>
                      <p className="font-semibold text-white">{d.doc_type.replace(/_/g, ' ')} {d.document_number ? `#${d.document_number}` : ''}</p>
                      <p className="text-[10.5px] text-slate-500">
                        Case {refLabel(d.application_id)} · {d.issuing_country || 'Unknown issuer'} · uploaded {new Date(d.created_at).toLocaleDateString()}
                        {d.is_scrubbed && ' · scrubbed (retention policy)'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold capitalize text-slate-400">{d.verification_status.toLowerCase().replace(/_/g, ' ')}</span>
                      {d.storage_path && !d.is_scrubbed && token && (
                        <button type="button" onClick={() => viewDocument(d.id, token)} className="font-semibold text-mint-300 hover:underline">View</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="mb-3 text-sm font-bold text-white">Payments ({invoices.length})</h3>
              {token && applications.map((app) => (
                <CreatePaymentLinkForm key={app.id} applicationId={app.id} reference={refLabel(app.id)} token={token} onCreated={load} />
              ))}
              {invoices.length === 0 && <p className="mt-3 text-xs text-slate-500">No payment link created yet.</p>}
              <div className="mt-3 space-y-2">
                {invoices.map((inv) => (
                  <div key={inv.id} className="rounded-lg border border-white/10 px-3 py-2 text-xs">
                    <p className="font-semibold text-white">${(inv.amount_cents / 100).toFixed(2)} {inv.currency}</p>
                    <p className="text-[10.5px] capitalize text-slate-500">
                      Case {refLabel(inv.application_id)} · {inv.payment_status.toLowerCase()} · {new Date(inv.created_at).toLocaleDateString()}
                    </p>
                    {inv.square_payment_link && (
                      <a href={inv.square_payment_link} target="_blank" rel="noreferrer" className="text-[10.5px] font-semibold text-mint-300 hover:underline">View payment link</a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="mb-3 text-sm font-bold text-white">Combined timeline</h3>
              {timeline.length === 0 && <p className="text-xs text-slate-500">No activity recorded yet.</p>}
              <div className="space-y-0">
                {timeline.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 border-t border-white/10 py-2.5 text-xs first:border-t-0">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 flex-none rounded-full bg-mint-500" />
                      <span>
                        {EVENT_LABELS[t.event_type] || t.event_type}
                        <span className="text-slate-400"> · case {refLabel(t.application_id)}</span>
                      </span>
                    </span>
                    <span className="whitespace-nowrap text-[10px] text-slate-400">{new Date(t.created_at).toLocaleDateString()}</span>
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
