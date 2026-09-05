'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '../../../lib/useAdminAuth';
import AdminSidebarShell from '../../../components/admin/AdminSidebarShell';

type Integrations = {
  database: boolean;
  squarePayments: boolean;
  documentStorage: boolean;
  adminAuth: boolean;
  cronScrub: boolean;
  w7Template: boolean;
  coaTemplate: boolean;
  f1040Template: boolean;
};

type FirmProfile = {
  businessName: string;
  ein: string;
  ptin: string;
  officeCode: string;
  reviewerName: string;
  reviewerTitle: string;
  phone: string;
  email: string;
  address: string;
};

const INTEGRATION_LABELS: Record<keyof Integrations, { label: string; note: string }> = {
  database: { label: 'Neon Postgres database', note: 'Client, application, document, and audit records' },
  squarePayments: { label: 'Square payments', note: 'SQUARE_ACCESS_TOKEN + SQUARE_LOCATION_ID' },
  documentStorage: { label: 'Identity document storage', note: 'Vercel Blob — BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID (OIDC)' },
  adminAuth: { label: 'Admin access token', note: 'ADMIN_ACCESS_TOKEN' },
  cronScrub: { label: 'Scheduled PII scrub', note: 'CRON_SECRET for the 90-day retention job' },
  w7Template: { label: 'Form W-7 template', note: 'public/templates/fW7.pdf (official IRS form)' },
  coaTemplate: { label: 'Certificate of Accuracy template', note: 'public/templates/fw7coa.pdf (official IRS form)' },
  f1040Template: { label: 'Form 1040 template', note: 'public/templates/f1040.pdf (official IRS form)' },
};

function StatusDot({ on }: { on: boolean }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${on ? 'bg-emerald-500' : 'bg-red-400'}`} />;
}

export default function SettingsPage() {
  const { token, ready } = useAdminAuth();
  const [integrations, setIntegrations] = useState<Integrations | null>(null);
  const [firmProfile, setFirmProfile] = useState<FirmProfile | null>(null);
  const [editingFirm, setEditingFirm] = useState(false);
  const [savingFirm, setSavingFirm] = useState(false);
  const [firmMessage, setFirmMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready || !token) return;
    (async () => {
      try {
        const res = await fetch('/api/admin/settings', { headers: { 'x-admin-token': token } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load settings.');
        setIntegrations(data.integrations);
        setFirmProfile(data.firmProfile);
      } catch (err: any) {
        setError(err.message || 'Failed to load settings.');
      }
    })();
  }, [ready, token]);

  async function saveFirmProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !firmProfile) return;
    setSavingFirm(true); setFirmMessage('');
    try {
      const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': token }, body: JSON.stringify(firmProfile) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save firm profile.');
      setFirmProfile(data.firmProfile); setEditingFirm(false); setFirmMessage('Firm profile saved. New document packages will use these details.');
    } catch (err: any) { setFirmMessage(err.message || 'Failed to save firm profile.'); } finally { setSavingFirm(false); }
  }

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-slate-400">Checking staff session...</div>;

  return (
    <AdminSidebarShell title="Settings & tools" subtitle="Integration health and the firm credentials auto-filled onto every generated document.">
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <div className="glass-card p-5">
          <h3 className="mb-1 text-sm font-bold text-white">Integration status</h3>
          <p className="mb-3 text-[11px] text-slate-500">Live checks — no secret values are ever shown, only whether each is configured.</p>
          {!integrations ? (
            <p className="text-xs text-slate-500">Checking integrations...</p>
          ) : (
            <div className="divide-y divide-white/10">
              {(Object.keys(INTEGRATION_LABELS) as (keyof Integrations)[]).map((key) => (
                <div key={key} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <StatusDot on={integrations[key]} />
                    <div>
                      <p className="text-xs font-semibold text-white">{INTEGRATION_LABELS[key].label}</p>
                      <p className="text-[10.5px] text-slate-500">{INTEGRATION_LABELS[key].note}</p>
                    </div>
                  </div>
                  <span className={`text-[10.5px] font-bold ${integrations[key] ? 'text-emerald-700' : 'text-red-600'}`}>
                    {integrations[key] ? 'Connected' : 'Not configured'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <div className="mb-1 flex items-center justify-between"><h3 className="text-sm font-bold text-white">Firm profile</h3>{firmProfile && <button type="button" onClick={() => setEditingFirm((v) => !v)} className="text-xs font-semibold text-mint-300 hover:underline">{editingFirm ? 'Cancel' : 'Edit'}</button>}</div>
          <p className="mb-3 text-[11px] text-slate-500">Used on Form 1040, Form W-7, Certificate of Accuracy, receipts, and client packages.</p>
          {!firmProfile ? <p className="text-xs text-slate-500">Loading firm profile...</p> : editingFirm ? <form onSubmit={saveFirmProfile} className="space-y-2 text-xs">
            <Field label="Business name" value={firmProfile.businessName} onChange={(value) => setFirmProfile({ ...firmProfile, businessName: value })} />
            <Field label="Reviewer / preparer name" value={firmProfile.reviewerName} onChange={(value) => setFirmProfile({ ...firmProfile, reviewerName: value })} />
            <Field label="Reviewer title" value={firmProfile.reviewerTitle} onChange={(value) => setFirmProfile({ ...firmProfile, reviewerTitle: value })} />
            <div className="grid grid-cols-2 gap-2"><Field label="EIN" value={firmProfile.ein} onChange={(value) => setFirmProfile({ ...firmProfile, ein: value })} /><Field label="PTIN" value={firmProfile.ptin} onChange={(value) => setFirmProfile({ ...firmProfile, ptin: value })} /></div>
            <Field label="Office code" value={firmProfile.officeCode} onChange={(value) => setFirmProfile({ ...firmProfile, officeCode: value })} />
            <div className="grid grid-cols-2 gap-2"><Field label="Phone" value={firmProfile.phone} onChange={(value) => setFirmProfile({ ...firmProfile, phone: value })} /><Field label="Email" value={firmProfile.email} onChange={(value) => setFirmProfile({ ...firmProfile, email: value })} /></div>
            <Field label="Business address" value={firmProfile.address} onChange={(value) => setFirmProfile({ ...firmProfile, address: value })} />
            <button disabled={savingFirm} className="btn-pill-primary w-full disabled:opacity-40">{savingFirm ? 'Saving...' : 'Save firm profile'}</button>
          </form> : <dl className="space-y-2.5 text-xs"><div><dt className="text-slate-500">Business name</dt><dd className="font-semibold text-white">{firmProfile.businessName}</dd></div><div><dt className="text-slate-500">Reviewer</dt><dd className="font-semibold text-white">{firmProfile.reviewerName} — {firmProfile.reviewerTitle}</dd></div><div><dt className="text-slate-500">EIN / PTIN</dt><dd className="font-semibold text-white">{firmProfile.ein || '—'} / {firmProfile.ptin || '—'}</dd></div><div><dt className="text-slate-500">Office code</dt><dd className="font-semibold text-white">{firmProfile.officeCode || '—'}</dd></div><div><dt className="text-slate-500">Phone / email</dt><dd className="font-semibold text-white">{firmProfile.phone} / {firmProfile.email}</dd></div><div><dt className="text-slate-500">Address</dt><dd className="font-semibold text-white">{firmProfile.address || '—'}</dd></div></dl>}
          {firmMessage && <p className="mt-3 text-xs text-mint-300">{firmMessage}</p>}
        </div>
      </div>
    </AdminSidebarShell>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block"><span className="mb-1 block text-[10px] font-semibold uppercase text-slate-500">{label}</span><input required={label === 'Business name' || label === 'Reviewer / preparer name' || label === 'Email'} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg bg-abyss-panel p-2 text-xs text-white" /></label>; }
