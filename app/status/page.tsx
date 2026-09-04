'use client';

import { FormEvent, useState } from 'react';
import { applicationReference } from '../../lib/applicationReference';

type StatusResult = {
  id: string;
  status: string;
  service_tier: string;
  created_at: string;
  updated_at: string;
  payment_status: string | null;
  has_documents: boolean;
};

const STEP_ORDER = ['INTAKE_STARTED', 'DOCUMENTS_RECEIVED', 'PAYMENT_PENDING', 'CAA_REVIEW', 'PACKAGE_READY', 'SUBMITTED_IRS'];

const STEP_LABELS: Record<string, string> = {
  INTAKE_STARTED: 'Application received',
  DOCUMENTS_RECEIVED: 'Identity documents received',
  PAYMENT_PENDING: 'Payment processing',
  CAA_REVIEW: 'CAA review in progress',
  PACKAGE_READY: 'Package ready for download',
  SUBMITTED_IRS: 'IRS package ready / mailed',
  ARCHIVED_PII_SCRUBBED: 'Case closed & archived',
};

function friendlyStatus(status: string) {
  return STEP_LABELS[status] || status.replace(/_/g, ' ').toLowerCase();
}

export default function StatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [lastName, setLastName] = useState('');
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function lookup(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const params = new URLSearchParams({ applicationId: applicationId.trim(), lastName: lastName.trim() });
      const res = await fetch(`/api/applications/status?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lookup failed.');
      setResult(data.application);
    } catch (err: any) {
      setError(err.message || 'Unable to find that application.');
    } finally {
      setLoading(false);
    }
  }

  const activeIndex = result ? STEP_ORDER.indexOf(result.status) : -1;
  const archived = result?.status === 'ARCHIVED_PII_SCRUBBED';
  const progressPct = archived ? 100 : activeIndex >= 0 ? Math.round(((activeIndex + 1) / STEP_ORDER.length) * 100) : 0;

  return (
    <section className="relative overflow-hidden bg-abyss py-14 md:py-20">
      <div className="bg-dot-grid absolute inset-0 opacity-40" />
      <div className="container-page relative mx-auto max-w-2xl">
        <p className="label-mono text-[12px] font-semibold uppercase text-mint-400">Track My Case</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Check your application status</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Enter the application reference you received at intake along with your last name.
        </p>

        <form onSubmit={lookup} className="glass-card mt-8 grid gap-4 p-6 sm:grid-cols-2">
          <input
            required
            className="rounded-lg border border-white/10 bg-abyss-panel p-3 text-white placeholder:text-slate-500 sm:col-span-2"
            placeholder="PATSL-1234ABCDE0"
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value)}
          />
          <input
            required
            className="rounded-lg border border-white/10 bg-abyss-panel p-3 text-white placeholder:text-slate-500 sm:col-span-2"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <button disabled={loading} className="btn-pill-primary disabled:opacity-50 sm:col-span-2">
            {loading ? 'Checking...' : 'Check status'}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-sm font-medium text-red-300">{error}</div>
        )}

        {result && (
          <div className="glass-card mt-8 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="label-mono text-[10.5px] font-semibold uppercase text-slate-500">Reference</p>
                <p className="font-mono text-sm text-white">{applicationReference(result.id)}</p>
              </div>
              <span className="rounded-full border border-mint-500/30 bg-mint-500/10 px-3 py-1 text-xs font-bold text-mint-300">
                {friendlyStatus(result.status)}
              </span>
            </div>

            <div className="mt-5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-mint-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${progressPct}%`, boxShadow: '0 0 12px 1px rgba(16,185,129,0.6)' }}
                />
              </div>
              <p className="label-mono mt-1.5 text-[10px] uppercase text-slate-500">{progressPct}% complete</p>
            </div>

            {!archived ? (
              <ol className="mt-6 space-y-4">
                {STEP_ORDER.map((step, index) => {
                  const done = activeIndex >= 0 && index <= activeIndex;
                  return (
                    <li key={step} className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-bold ${
                          done ? 'bg-mint-500 text-ink-950' : 'bg-white/5 text-slate-500'
                        }`}
                      >
                        {done ? '✓' : index + 1}
                      </span>
                      <span className={`text-sm ${done ? 'font-semibold text-white' : 'text-slate-500'}`}>
                        {STEP_LABELS[step]}
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-6 text-sm text-slate-400">
                This case has been archived and identity documents have been scrubbed per our 90-day retention policy.
              </p>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-4 text-sm">
              <div>
                <dt className="label-mono text-[10px] uppercase text-slate-500">Payment</dt>
                <dd className="mt-1 font-medium text-white">{result.payment_status || 'Pending'}</dd>
              </div>
              <div>
                <dt className="label-mono text-[10px] uppercase text-slate-500">Documents</dt>
                <dd className="mt-1 font-medium text-white">{result.has_documents ? 'Received' : 'Not yet uploaded'}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
