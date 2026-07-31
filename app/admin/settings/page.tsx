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
  documentStorage: { label: 'Identity document storage', note: 'Vercel Blob — BLOB_READ_WRITE_TOKEN' },
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

  if (!ready) return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-slate-400">Checking staff session...</div>;

  return (
    <AdminSidebarShell title="Settings & tools" subtitle="Integration health and the firm credentials auto-filled onto every generated document.">
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-1 text-sm font-bold text-ink-900">Integration status</h3>
          <p className="mb-3 text-[11px] text-slate-500">Live checks — no secret values are ever shown, only whether each is configured.</p>
          {!integrations ? (
            <p className="text-xs text-slate-500">Checking integrations...</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {(Object.keys(INTEGRATION_LABELS) as (keyof Integrations)[]).map((key) => (
                <div key={key} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <StatusDot on={integrations[key]} />
                    <div>
                      <p className="text-xs font-semibold text-ink-900">{INTEGRATION_LABELS[key].label}</p>
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

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-1 text-sm font-bold text-ink-900">Firm profile</h3>
          <p className="mb-3 text-[11px] text-slate-500">Auto-filled onto the Acceptance Agent section of every W-7 and Certificate of Accuracy.</p>
          {!firmProfile ? (
            <p className="text-xs text-slate-500">Loading firm profile...</p>
          ) : (
            <dl className="space-y-2.5 text-xs">
              <div><dt className="text-slate-500">Business name</dt><dd className="font-semibold text-ink-900">{firmProfile.businessName}</dd></div>
              <div><dt className="text-slate-500">Reviewer</dt><dd className="font-semibold text-ink-900">{firmProfile.reviewerName} — {firmProfile.reviewerTitle}</dd></div>
              <div><dt className="text-slate-500">EIN</dt><dd className="font-semibold text-ink-900">{firmProfile.ein || '— set CAA_EIN'}</dd></div>
              <div><dt className="text-slate-500">PTIN</dt><dd className="font-semibold text-ink-900">{firmProfile.ptin || '— set CAA_PTIN'}</dd></div>
              <div><dt className="text-slate-500">Office code</dt><dd className="font-semibold text-ink-900">{firmProfile.officeCode || '— set CAA_OFFICE_CODE'}</dd></div>
              <div><dt className="text-slate-500">Phone</dt><dd className="font-semibold text-ink-900">{firmProfile.phone || '— set CAA_PHONE'}</dd></div>
              <div><dt className="text-slate-500">Email</dt><dd className="font-semibold text-ink-900">{firmProfile.email || '— set CAA_EMAIL'}</dd></div>
              <div><dt className="text-slate-500">Address</dt><dd className="font-semibold text-ink-900">{firmProfile.address || '— set CAA_ADDRESS'}</dd></div>
            </dl>
          )}
          <p className="mt-4 text-[10.5px] text-slate-400">
            Change these in Vercel → Project → Settings → Environment Variables (CAA_BUSINESS_NAME, CAA_EIN, CAA_PTIN, CAA_OFFICE_CODE,
            CAA_REVIEWER_NAME, CAA_REVIEWER_TITLE, CAA_PHONE, CAA_EMAIL, CAA_ADDRESS) — no code changes needed.
          </p>
        </div>
      </div>
    </AdminSidebarShell>
  );
}
